import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Award, Leaf, Shirt, Settings, ChevronRight, LogOut, LogIn, Save, X, Edit2, Tag, Camera, Package, BrainCircuit } from 'lucide-react';
import { Logo } from '../common/Logo';
import { View } from '../../types';
import { productService } from '../../services/productService';
import { wardrobeService } from '../../services/wardrobeService';
import { outfitService } from '../../services/outfitService';

interface ProfileViewProps {
  onViewChange: (view: View) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onViewChange }) => {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [counts, setCounts] = useState({ products: 0, wardrobe: 0, posts: 0 });

  React.useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditImage(profile.image);
    }
  }, [profile]);

  React.useEffect(() => {
    if (!user) return;

    const unsubProducts = productService.subscribeToUserProducts(user.uid, (data) => {
      setCounts(prev => ({ ...prev, products: data.length }));
    });

    const unsubWardrobe = wardrobeService.subscribeToWardrobe(user.uid, (data) => {
      setCounts(prev => ({ ...prev, wardrobe: data.length }));
    });

    const unsubOutfits = outfitService.subscribeToUserOutfits(user.uid, (data) => {
      setCounts(prev => ({ ...prev, posts: data.length }));
    });

    return () => {
      unsubProducts();
      unsubWardrobe();
      unsubOutfits();
    };
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: editName,
        image: editImage || profile.image
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!user || !profile) return;
    const newPrivacyStatus = !profile.isPrivate;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isPrivate: newPrivacyStatus
      });
      
      // Update all existing products and outfits
      await Promise.all([
        productService.updatePrivacyForUser(user.uid, newPrivacyStatus),
        outfitService.updatePrivacyForUser(user.uid, newPrivacyStatus)
      ]);
    } catch (error) {
      console.error('Error updating privacy:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-dark-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-full space-y-6 text-center">
        <div className="w-24 h-24 bg-paper border-2 border-ink rounded-full flex items-center justify-center text-4xl hard-shadow cursor-pointer" onClick={() => onViewChange('home')}>
          ♻️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-black text-dark-green uppercase">Join the Cycle</h1>
          <p className="font-serif text-sm opacity-60">Log in to track your impact and manage your wardrobe.</p>
        </div>
        <button 
          onClick={signIn}
          className="flex items-center gap-3 bg-dark-green text-paper px-8 py-4 rounded-xl font-display font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 flex flex-col relative min-h-full">
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute inset-0 bg-paper z-50 p-5 space-y-6"
          >
            <header className="flex items-center gap-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 bg-yellow border-1.5 border-ink rounded-lg flex items-center justify-center shadow-sm active:scale-95"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-display font-black uppercase text-dark-green">Privacy Settings</h2>
            </header>

            <section className="bg-white rounded-[20px] p-6 border-1.5 border-ink hard-shadow space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-ink">Account Privacy</h3>
                  <p className="text-xs font-serif text-ink/60">
                    {profile.isPrivate 
                      ? "Only your followers can see your profile and fit checks." 
                      : "Anyone can see your profile and fit checks."}
                  </p>
                </div>
                <button
                  onClick={handleTogglePrivacy}
                  className={`w-14 h-8 rounded-full border-2 border-ink transition-colors relative flex items-center ${
                    profile.isPrivate ? 'bg-pink' : 'bg-paper'
                  }`}
                >
                  <motion.div
                    animate={{ x: profile.isPrivate ? 24 : 4 }}
                    className="w-6 h-6 bg-white border border-ink rounded-full"
                  />
                </button>
              </div>
              
              <div className="pt-4 border-t border-ink/5">
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink/40">
                  Current Status: <span className={profile.isPrivate ? "text-pink" : "text-medium-green"}>
                    {profile.isPrivate ? "Private" : "Public"}
                  </span>
                </p>
              </div>
            </section>
            
            <p className="text-sm font-serif italic text-ink/40 text-center px-4 pt-10">
              "Sustainability is about community. But we respect your personal space."
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-10 h-10 bg-medium-green text-paper border-1.5 border-ink rounded-lg flex items-center justify-center shadow-sm disabled:opacity-50 active:scale-90"
              >
                <Save size={18} />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 bg-pink text-ink border-1.5 border-ink rounded-lg flex items-center justify-center shadow-sm active:scale-90"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 bg-yellow border-1.5 border-ink rounded-lg flex items-center justify-center shadow-sm active:scale-90"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={signOut}
                className="w-10 h-10 bg-paper border-1.5 border-ink rounded-lg flex items-center justify-center shadow-sm text-ink/40 hover:text-ink transition-colors active:scale-90"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Profile Info */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={isEditing ? (editImage || profile.image) : profile.image}
            alt={profile.name}
            className={`w-20 h-20 rounded-full object-cover border-2 border-ink hard-shadow ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
            referrerPolicy="no-referrer"
            onClick={() => isEditing && document.getElementById('profile-upload')?.click()}
          />
          {isEditing && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              onClick={() => document.getElementById('profile-upload')?.click()}
            >
              <Camera size={24} className="text-white drop-shadow-md" />
            </div>
          )}
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <div className="flex-1 space-y-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-white border-1.5 border-ink rounded-lg px-3 py-2 font-display text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple/20"
              placeholder="Your name"
            />
          ) : (
            <h1 className="text-2xl font-display font-bold text-dark-green leading-none">{profile.name}</h1>
          )}
        </div>
      </div>

      {/* Sustainability Passport */}
      <section className="bg-white rounded-[20px] p-5 border-1.5 border-ink hard-shadow space-y-4">
        <h2 className="text-lg font-display font-black uppercase text-dark-green">My Journey</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-paper/50 p-3 rounded-xl border border-ink/5">
            <p className="text-[8px] font-sans font-bold uppercase tracking-wider text-purple mb-1">Product Listings</p>
            <p className="font-display text-lg font-bold">{counts.products}</p>
          </div>
          <div className="bg-paper/50 p-3 rounded-xl border border-ink/5">
            <p className="text-[8px] font-sans font-bold uppercase tracking-wider text-orange mb-1">Digital Clothes</p>
            <p className="font-display text-lg font-bold">{counts.wardrobe}</p>
          </div>
          <div className="bg-paper/50 p-3 rounded-xl border border-ink/5">
            <p className="text-[8px] font-sans font-bold uppercase tracking-wider text-purple mb-1">Upcycle Points</p>
            <p className="font-display text-lg font-bold">{(profile.upcyclePoints || 0)}</p>
          </div>
          <div className="bg-paper/50 p-3 rounded-xl border border-ink/5">
            <p className="text-[8px] font-sans font-bold uppercase tracking-wider text-pink mb-1">Total Posts</p>
            <p className="font-display text-lg font-bold">{counts.posts}</p>
          </div>
        </div>
      </section>

      {/* Shop Management */}
      <section className="space-y-3">
        <h2 className="text-lg font-display font-black uppercase text-dark-green">My Management</h2>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onViewChange('user-posts')}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border-1.5 border-ink hard-shadow group active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-purple opacity-80 group-hover:scale-110 transition-transform">
                <Camera size={20} />
              </div>
              <span className="font-display font-bold text-ink group-hover:text-dark-green transition-colors">
                My Fit Checks
              </span>
            </div>
            <ChevronRight size={18} className="text-ink/20" />
          </button>
          
          <button
            onClick={() => onViewChange('user-products')}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border-1.5 border-ink hard-shadow group active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-medium-green opacity-80 group-hover:scale-110 transition-transform">
                <Tag size={20} />
              </div>
              <span className="font-display font-bold text-ink group-hover:text-dark-green transition-colors">
                My Active Listings
              </span>
            </div>
            <ChevronRight size={18} className="text-ink/20" />
          </button>

          <button
            onClick={() => onViewChange('user-wardrobe')}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border-1.5 border-ink hard-shadow group active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-orange opacity-80 group-hover:scale-110 transition-transform">
                <Shirt size={20} />
              </div>
              <span className="font-display font-bold text-ink group-hover:text-dark-green transition-colors">
                My Digital Clothes
              </span>
            </div>
            <ChevronRight size={18} className="text-ink/20" />
          </button>

          <button
            onClick={() => onViewChange('ai-consults')}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border-1.5 border-ink hard-shadow group active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-yellow opacity-80 group-hover:scale-110 transition-transform">
                <BrainCircuit size={20} />
              </div>
              <span className="font-display font-bold text-ink group-hover:text-dark-green transition-colors">
                My Saved Consults
              </span>
            </div>
            <ChevronRight size={18} className="text-ink/20" />
          </button>
        </div>
      </section>

      {/* Menu Options */}
      <div className="space-y-3 flex-1 pb-6">
        {[
          { icon: Shirt, label: 'My Wardrobe', color: 'text-orange', action: () => onViewChange('styler') },
          { icon: Settings, label: 'Account Settings', color: 'text-ink', action: () => setShowSettings(true) },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border-1.5 border-ink hard-shadow group active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.color} opacity-80 group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <span className="font-display font-bold text-ink group-hover:text-dark-green transition-colors">
                {item.label}
              </span>
            </div>
            <ChevronRight size={18} className="text-ink/20" />
          </button>
        ))}
      </div>
    </div>
  );
};
