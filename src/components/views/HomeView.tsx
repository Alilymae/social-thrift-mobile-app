import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../../constants';
import { Heart, Share2, User, Plus, ShoppingCart, Info } from 'lucide-react';
import { outfitService } from '../../services/outfitService';
import { wardrobeService } from '../../services/wardrobeService';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { Outfit, Product, View } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

import { Logo } from '../common/Logo';

interface HomeViewProps {
  onViewChange: (view: View) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onViewChange }) => {
  const { user, profile } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [activeFeed, setActiveFeed] = useState<'community' | 'shop'>('community');
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = outfitService.subscribeToOutfits((data) => {
      setOutfits(data);
    }, user?.uid);
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((data) => {
      setProducts(data);
    }, user?.uid);
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = cartService.subscribeToCart(user.uid, (items) => {
      setCartCount(items.length);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleLike = (id: string, e: React.MouseEvent, type: 'product' | 'outfit') => {
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
    if (type === 'outfit') {
      outfitService.toggleLike(id);
    }
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add items to your cart!');
      onViewChange('profile');
      return;
    }

    setIsAdding(prev => ({ ...prev, [product.id]: true }));
    try {
      await cartService.addToCart(user.uid, product);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    } finally {
      setIsAdding(prev => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="p-6 pb-2 flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <div className="flex gap-2">
          <button 
            onClick={() => onViewChange('cart')}
            className="w-10 h-10 bg-yellow border-1.5 border-ink rounded-lg flex items-center justify-center relative shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-ink">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => onViewChange('profile')}
            className="w-10 h-10 bg-pink border-1.5 border-ink rounded-lg flex items-center justify-center text-sm shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
          >
            {profile?.image ? (
              <img src={profile.image} alt="Profile" className="w-full h-full rounded-md object-cover" />
            ) : '📸'}
          </button>
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* Stats Row removed by user request */}

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-ink/10">
          <button 
            onClick={() => setActiveFeed('community')}
            className={`pb-2 text-xs font-display font-bold uppercase tracking-widest transition-all relative ${
              activeFeed === 'community' ? 'text-dark-green' : 'text-ink/40'
            }`}
          >
            Community
            {activeFeed === 'community' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-dark-green" />}
          </button>
          <button 
            onClick={() => setActiveFeed('shop')}
            className={`pb-2 text-xs font-display font-bold uppercase tracking-widest transition-all relative ${
              activeFeed === 'shop' ? 'text-dark-green' : 'text-ink/40'
            }`}
          >
            Shop
            {activeFeed === 'shop' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-dark-green" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeFeed === 'community' ? (
            <motion.section 
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {outfits.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-paper border-2 border-ink border-dashed rounded-full flex items-center justify-center mx-auto text-ink/20">
                    <User size={32} />
                  </div>
                  <p className="font-serif text-sm text-ink/40 italic">No fit checks yet. Be the first!</p>
                  <button 
                    onClick={() => onViewChange('sell')}
                    className="bg-dark-green text-paper px-6 py-2 rounded-full font-display font-bold uppercase text-xs"
                  >
                    Post Fit Check
                  </button>
                </div>
              ) : (
                outfits.map((outfit) => (
                  <motion.div 
                    key={outfit.id}
                    className="bg-white border-2 border-ink rounded-[24px] overflow-hidden hard-shadow"
                  >
                    {/* User Info */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={outfit.userImage} 
                          alt={outfit.userName} 
                          className="w-8 h-8 rounded-full border border-ink object-cover" 
                        />
                        <span className="font-display font-bold text-sm">{outfit.userName}</span>
                      </div>
                      <span className="text-[10px] font-sans font-bold text-ink/20 uppercase tracking-widest">
                        {outfit.createdAt ? new Date((outfit.createdAt as any).seconds * 1000).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/5] relative overflow-hidden bg-cream/10">
                      <img 
                        src={outfit.image} 
                        alt="Fit Check" 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Actions */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => toggleLike(outfit.id, e, 'outfit')}
                            className={`flex items-center gap-1.5 transition-colors ${likedItems[outfit.id] ? 'text-pink' : 'text-ink/60'}`}
                          >
                            <Heart size={20} fill={likedItems[outfit.id] ? "currentColor" : "none"} />
                            <span className="text-xs font-bold">
                              {(outfit.likes || 0) + (likedItems[outfit.id] ? 1 : 0)}
                            </span>
                          </button>
                        </div>
                        <button className="text-ink/60">
                          <Share2 size={20} />
                        </button>
                      </div>
                      {outfit.caption && (
                        <p className="text-sm font-serif leading-snug">
                          <span className="font-bold mr-2">{outfit.userName}</span>
                          {outfit.caption}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.section>
          ) : (
            <motion.section 
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-4"
            >
              {(products.length > 0 ? products : MOCK_PRODUCTS).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border-1.5 border-ink hard-shadow group relative cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="aspect-[4/5] relative overflow-hidden border-b-1.5 border-ink">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={(e) => toggleLike(product.id, e, 'product')}
                        className={`w-8 h-8 rounded-full border-1.5 border-ink flex items-center justify-center transition-colors ${
                          likedItems[product.id] ? 'bg-pink text-white' : 'bg-white/80 text-ink'
                        }`}
                      >
                        <Heart size={14} fill={likedItems[product.id] ? "currentColor" : "none"} />
                      </button>
                    </div>
                    {product.seller && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded-full border border-ink/10">
                         <div className="w-3 h-3 bg-dark-green rounded-full flex items-center justify-center">
                           <User size={8} className="text-white" />
                         </div>
                         <span className="text-[8px] font-bold truncate max-w-[60px]">{product.seller}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-cream/30">
                    <h4 className="font-display text-xs font-bold truncate leading-tight">{product.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <p className="font-display text-base text-dark-green font-bold">${product.price}</p>
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isAdding[product.id]}
                        className="text-[8px] bg-ink text-white px-2 py-1 rounded font-bold uppercase active:scale-95 transition-transform"
                      >
                        {isAdding[product.id] ? '...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {products.length === 0 && (
                <div className="col-span-2 p-4 bg-yellow/20 rounded-xl border border-dashed border-ink/20 flex items-center gap-3">
                  <Info size={16} className="text-dark-green" />
                  <p className="text-[10px] font-serif italic text-ink/60">Showing curated Social Thrift finds. Post your own items to start selling!</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
