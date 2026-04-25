import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clear previous subscription
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setUser(user);
      
      if (user) {
        try {
          // Subscribe to profile changes
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Initialize new user profile
            const initialProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || 'Anonymous',
              email: user.email || '',
              image: user.photoURL || 'https://picsum.photos/seed/user/200/200',
              sustainabilityScore: 0,
              upcyclePoints: 0,
              carbonOffset: 0,
              itemsSaved: 0,
              earnings: 0
            };
            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
          } else {
            const data = userDoc.data();
            setProfile({
              ...data,
              sustainabilityScore: data.sustainabilityScore || 0,
              upcyclePoints: data.upcyclePoints || 0,
              carbonOffset: data.carbonOffset || 0,
              itemsSaved: data.itemsSaved || 0,
              earnings: data.earnings || 0,
            } as UserProfile);
          }

          unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setProfile({
                ...data,
                sustainabilityScore: data.sustainabilityScore || 0,
                upcyclePoints: data.upcyclePoints || 0,
                carbonOffset: data.carbonOffset || 0,
                itemsSaved: data.itemsSaved || 0,
                earnings: data.earnings || 0,
              } as UserProfile);
            }
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
