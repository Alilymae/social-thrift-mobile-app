import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Outfit } from '../types';

export const outfitService = {
  async createFitCheck(outfit: Omit<Outfit, 'id' | 'likes' | 'comments' | 'createdAt'>) {
    const outfitData = {
      ...outfit,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp()
    };
    return await addDoc(collection(db, 'outfits'), outfitData);
  },

  async updatePrivacyForUser(userId: string, isPrivate: boolean) {
    const q = query(
      collection(db, 'outfits'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((outfitDoc) => {
      batch.update(outfitDoc.ref, { isPrivate });
    });
    return await batch.commit();
  },

  subscribeToOutfits(callback: (outfits: Outfit[]) => void, currentUserId?: string) {
    const q = query(collection(db, 'outfits'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const outfits = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            likes: typeof data.likes === 'number' ? data.likes : 0,
            comments: typeof data.comments === 'number' ? data.comments : 0
          } as Outfit;
        })
        .filter(o => !o.isPrivate || o.userId === currentUserId);
      callback(outfits);
    });
  },

  subscribeToUserOutfits(userId: string, callback: (outfits: Outfit[]) => void) {
    const q = query(
      collection(db, 'outfits'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const outfits = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          likes: typeof data.likes === 'number' ? data.likes : 0,
          comments: typeof data.comments === 'number' ? data.comments : 0
        };
      }) as Outfit[];

      // Sort manually to avoid index requirement
      outfits.sort((a, b) => {
        const timeA = (a.createdAt as any)?.toMillis?.() || 0;
        const timeB = (b.createdAt as any)?.toMillis?.() || 0;
        return timeB - timeA;
      });

      callback(outfits);
    });
  },

  async toggleLike(outfitId: string) {
    const outfitRef = doc(db, 'outfits', outfitId);
    return await updateDoc(outfitRef, {
      likes: increment(1) // Simple increment for now, real toggle would need a subcollection
    });
  },

  async deleteFitCheck(id: string) {
    await deleteDoc(doc(db, 'outfits', id));
  }
};
