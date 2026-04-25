import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AIConsult } from '../types';

export const consultService = {
  async saveConsult(userId: string, consult: Omit<AIConsult, 'id' | 'userId' | 'createdAt'>) {
    const consultData = {
      ...consult,
      userId,
      createdAt: serverTimestamp()
    };
    
    // Save the consult
    await addDoc(collection(db, 'consults'), consultData);
    
    // Award an upcycle point
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      upcyclePoints: increment(1)
    });
  },

  subscribeToUserConsults(userId: string, callback: (consults: AIConsult[]) => void) {
    const q = query(
      collection(db, 'consults'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const consults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIConsult[];

      // Sort manually to avoid index requirement
      consults.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      callback(consults);
    });
  }
};
