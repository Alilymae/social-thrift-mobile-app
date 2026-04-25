import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export const productService = {
  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>) {
    const data = {
      ...productData,
      createdAt: serverTimestamp(),
    };
    return await addDoc(collection(db, 'products'), data);
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, updates);
  },

  async deleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
  },

  async updatePrivacyForUser(userId: string, isPrivate: boolean) {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((productDoc) => {
      batch.update(productDoc.ref, { isPrivate });
    });
    return await batch.commit();
  },

  subscribeToProducts(callback: (products: Product[]) => void, currentUserId?: string) {
    // We fetch products and filter in the client to allow "isPrivate == false OR userId == currentUserId"
    // Since Firestore doesn't support OR across different fields with inequality easily without indices
    const q = query(
      collection(db, 'products'), 
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
        .filter(p => !p.isPrivate || p.userId === currentUserId);
      callback(products);
    });
  },

  subscribeToUserProducts(userId: string, callback: (products: Product[]) => void) {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Sort manually to avoid index requirement
      products.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      callback(products);
    });
  }
};
