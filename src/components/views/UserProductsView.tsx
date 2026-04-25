import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { Trash2, ArrowLeft, Tag } from 'lucide-react';
import { Logo } from '../common/Logo';
import { View } from '../../types';

interface UserProductsViewProps {
  onViewChange: (view: View) => void;
}

export const UserProductsView: React.FC<UserProductsViewProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = productService.subscribeToProducts((data) => {
      setProducts(data.filter(p => p.userId === user.uid));
    }, user.uid);
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
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
          <Tag className="text-medium-green" size={24} />
          <h2 className="font-display text-2xl font-black uppercase tracking-tighter">My Marketplace</h2>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-ink/40 italic">You don't have any items for sale yet.</p>
            <button 
              onClick={() => onViewChange('sell')}
              className="bg-medium-green text-white px-8 py-3 rounded-full font-display font-bold uppercase text-xs"
            >
              Start Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border-1.5 border-ink rounded-2xl overflow-hidden hard-shadow relative flex flex-col"
                >
                  <img src={product.image} alt={product.name} className="w-full aspect-[4/5] object-cover border-b border-ink" />
                  
                  {deletingId === product.id ? (
                    <div className="absolute inset-0 bg-pink/90 flex flex-col items-center justify-center p-2 text-center z-10">
                      <p className="text-white text-[10px] font-display font-bold uppercase leading-tight mb-2">Delete listing?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(product.id)}
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
                      onClick={() => setDeletingId(product.id)}
                      className="absolute top-2 right-2 bg-pink text-white w-8 h-8 rounded-full border border-ink flex items-center justify-center shadow-sm hover:scale-110 transition-transform active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="p-2 bg-cream/30 flex-1 flex flex-col justify-between">
                    <h4 className="font-display text-[10px] font-bold truncate leading-tight">{product.name}</h4>
                    <p className="font-display text-sm text-dark-green font-bold">${product.price}</p>
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
