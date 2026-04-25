import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { outfitService } from '../../services/outfitService';
import { Outfit } from '../../types';
import { Trash2, ArrowLeft, Camera } from 'lucide-react';
import { Logo } from '../common/Logo';
import { View } from '../../types';

interface UserPostsViewProps {
  onViewChange: (view: View) => void;
}

export const UserPostsView: React.FC<UserPostsViewProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Outfit[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = outfitService.subscribeToOutfits((data) => {
      // Filter for current user
      setPosts(data.filter(p => p.userId === user.uid));
    }, user.uid);
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (postId: string) => {
    try {
      await outfitService.deleteFitCheck(postId);
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
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
          <Camera className="text-purple" size={24} />
          <h2 className="font-display text-2xl font-black uppercase tracking-tighter">My Fit Checks</h2>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-ink/40 italic">You haven't posted any fit checks yet.</p>
            <button 
              onClick={() => onViewChange('sell')}
              className="bg-purple text-white px-8 py-3 rounded-full font-display font-bold uppercase text-xs"
            >
              Share Your First Look
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border-1.5 border-ink rounded-2xl overflow-hidden hard-shadow relative"
                >
                  <img src={post.image} alt={post.caption || 'Post'} className="w-full aspect-[4/5] object-cover" />
                  
                  {deletingId === post.id ? (
                    <div className="absolute inset-0 bg-pink/90 flex flex-col items-center justify-center p-2 text-center z-10">
                      <p className="text-white text-[10px] font-display font-bold uppercase leading-tight mb-2">Delete post?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(post.id)}
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
                      onClick={() => setDeletingId(post.id)}
                      className="absolute top-2 right-2 bg-pink text-white w-8 h-8 rounded-full border border-ink flex items-center justify-center shadow-sm hover:scale-110 transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {post.caption && (
                    <div className="p-2">
                      <p className="text-[10px] font-serif line-clamp-2 italic opacity-60">"{post.caption}"</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
