import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { wardrobeService } from '../../services/wardrobeService';
import { WardrobeItem } from '../../types';
import { Trash2, ArrowLeft, Shirt } from 'lucide-react';
import { Logo } from '../common/Logo';
import { View } from '../../types';

interface UserWardrobeViewProps {
  onViewChange: (view: View) => void;
}

export const UserWardrobeView: React.FC<UserWardrobeViewProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = wardrobeService.subscribeToWardrobe(user.uid, (data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (itemId: string) => {
    try {
      await wardrobeService.removeFromWardrobe(itemId);
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-6 pb-2 flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <button 
          onClick={() => onViewChange('profile')}
          className="w-10 h-10 bg-white border-1.5 border-ink rounded-lg flex items-center justify-center text-sm shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </header>

      <div className="p-5 flex-1 space-y-6">
        <div className="flex items-center gap-2">
          <Shirt className="text-orange" size={24} />
          <h2 className="font-display text-2xl font-black uppercase tracking-tighter">My Wardrobe</h2>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-ink/40 italic">Your digital closet is empty.</p>
            <button 
              onClick={() => onViewChange('sell')}
              className="bg-pink text-white px-8 py-3 rounded-full font-display font-bold uppercase text-xs"
            >
              Add Your First Piece
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border-1.5 border-ink rounded-2xl overflow-hidden hard-shadow relative flex flex-col"
                >
                  <img src={item.image} alt={item.name} className="w-full aspect-square object-cover border-b border-ink" />
                  
                  {deletingId === item.id ? (
                    <div className="absolute inset-0 bg-pink/90 flex flex-col items-center justify-center p-2 text-center z-10">
                      <p className="text-white text-[10px] font-display font-bold uppercase leading-tight mb-2">Delete this?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="bg-white text-pink px-2 py-1 rounded-md text-[9px] font-bold uppercase shadow-sm"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="bg-ink text-white px-2 py-1 rounded-md text-[9px] font-bold uppercase shadow-sm"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeletingId(item.id)}
                      className="absolute top-2 right-2 bg-pink text-white w-8 h-8 rounded-full border border-ink flex items-center justify-center shadow-sm hover:scale-110 transition-transform active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="p-2 bg-cream/30 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-[10px] font-bold truncate leading-tight uppercase">{item.name}</h4>
                      <p className="text-[8px] font-sans font-bold text-ink/40 uppercase tracking-widest mt-1">{item.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
