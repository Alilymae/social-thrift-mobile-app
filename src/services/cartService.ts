import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export interface CartItem extends Product {
  cartItemId: string;
  userId: string;
  addedAt: any;
}

export const cartService = {
  async addToCart(userId: string, product: Product) {
    const itemData = {
      ...product,
      userId,
      addedAt: serverTimestamp()
    };
    return await addDoc(collection(db, 'cart'), itemData);
  },

  async removeFromCart(cartItemId: string) {
    await deleteDoc(doc(db, 'cart', cartItemId));
  },

  async clearCart(userId: string) {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  },

  subscribeToCart(userId: string, callback: (items: CartItem[]) => void) {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        cartItemId: doc.id
      })) as CartItem[];
      callback(items);
    });
  }
};
