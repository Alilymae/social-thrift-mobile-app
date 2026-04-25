import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WardrobeItem } from '../types';

export const wardrobeService = {
  async addToWardrobe(userId: string, item: Omit<WardrobeItem, 'id' | 'userId' | 'addedAt'>) {
    const itemData = {
      ...item,
      userId,
      addedAt: serverTimestamp()
    };
    return await addDoc(collection(db, 'wardrobe'), itemData);
  },

  async removeFromWardrobe(itemId: string) {
    await deleteDoc(doc(db, 'wardrobe', itemId));
  },

  subscribeToWardrobe(userId: string, callback: (items: WardrobeItem[]) => void) {
    const q = query(collection(db, 'wardrobe'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WardrobeItem[];
      callback(items);
    });
  }
};
