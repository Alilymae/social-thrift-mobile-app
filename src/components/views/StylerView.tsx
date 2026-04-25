import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { wardrobeService } from '../../services/wardrobeService';
import { useAuth } from '../../contexts/AuthContext';
import { WardrobeItem, View } from '../../types';

interface StylerViewProps {
  onViewChange: (view: View) => void;
}

export const StylerView: React.FC<StylerViewProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [canvasItems, setCanvasItems] = useState<string[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = wardrobeService.subscribeToWardrobe(user.uid, (data) => {
      setWardrobeItems(data);
    });
    return () => unsubscribe();
  }, [user]);

  const addToCanvas = (id: string) => {
    if (!canvasItems.includes(id)) {
      setCanvasItems([...canvasItems, id]);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="p-6 pb-0 flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <button 
          onClick={() => onViewChange('profile')}
          className="w-10 h-10 bg-pink border-1.5 border-ink rounded-lg flex items-center justify-center text-sm shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all active:scale-95"
        >
          📸
        </button>
      </header>

      {/* Canvas Header */}
      <div className="p-5 pb-0">
        <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-dark-green">Pocket Stylist</h2>
        <p className="text-xs font-serif italic text-ink/60 mt-1">Mix and match your sustainable finds</p>
      </div>

      <div className="flex-1 px-5 pb-6 pt-5">
        <div className="space-y-6">
            {/* Canvas */}
            <div className="aspect-square bg-paper rounded-[20px] border-2 border-dashed border-purple relative overflow-hidden p-4">
              <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-purple/60 mb-4">
                <span>Pocket Stylist Canvas</span>
                <button 
                  onClick={() => alert('Outfit view saved to your collection!')}
                  className="hover:text-purple transition-colors"
                >
                  Save View
                </button>
              </div>
              
              {canvasItems.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/20 p-8 text-center">
                  <Sparkles size={40} className="mb-2" />
                  <p className="font-display text-lg">Drag items from your wardrobe to build your look</p>
                </div>
              ) : (
                canvasItems.map((id, index) => {
                  const item = wardrobeItems.find(p => p.id === id);
                  if (!item) return null;
                  const colors = ['bg-lavender', 'bg-pink', 'bg-gold'];
                  return (
                    <motion.div
                      key={id}
                      drag
                      dragConstraints={{ left: 0, right: 250, top: 0, bottom: 250 }}
                      className={`absolute w-24 h-32 p-2 border-1.5 border-ink rounded-xl hard-shadow cursor-grab active:cursor-grabbing flex flex-col items-center justify-center ${colors[index % colors.length]}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ top: 50 + index * 20, left: 20 + index * 40 }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain mix-blend-multiply opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[9px] font-sans font-bold uppercase mt-2 text-center leading-tight">{item.name}</span>
                    </motion.div>
                  );
                })
              )}
              
            </div>

            {/* Wardrobe Drawer */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-dark-green uppercase tracking-tighter">Your Wardrobe</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {wardrobeItems.length === 0 ? (
                  <div className="w-full py-10 text-center bg-white/50 border border-ink/10 rounded-2xl">
                    <p className="text-xs font-serif opacity-40 italic">Add items from the shop to start styling!</p>
                  </div>
                ) : (
                  wardrobeItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCanvas(item.id)}
                      className="flex-shrink-0 w-20 h-24 bg-white rounded-xl overflow-hidden border-1.5 border-ink hard-shadow"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
