import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingCart, Heart, Info, User } from 'lucide-react';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { Product, View } from '../../types';
import { MOCK_PRODUCTS } from '../../constants';
import { Logo } from '../common/Logo';

interface CategoryResultsViewProps {
  category: string;
  onViewChange: (view: View) => void;
}

export const CategoryResultsView: React.FC<CategoryResultsViewProps> = ({ category, onViewChange }) => {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((data) => {
      const filtered = data.filter(p => p.category === category);
      setProducts(filtered);
    }, user?.uid);
    return () => unsubscribe();
  }, [category, user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = cartService.subscribeToCart(user.uid, (items) => {
      setCartCount(items.length);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
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

  // If no DB products, use mock products for this category to ensure something shows up
  const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS.filter(p => p.category === category);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="p-6 pb-2 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onViewChange('search')}
            className="w-10 h-10 bg-white border-1.5 border-ink rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <Logo onClick={() => onViewChange('home')} />
        </div>
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
        </div>
      </header>

      <div className="p-5 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-dark-green leading-none">
            {category}
          </h2>
          <p className="font-serif text-sm italic text-ink/40">Discovering curated vintage {category.toLowerCase()}.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
                    onClick={(e) => toggleLike(product.id, e)}
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
        </div>

        {displayProducts.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-paper border-2 border-ink border-dashed rounded-full flex items-center justify-center mx-auto text-ink/20">
              <Info size={32} />
            </div>
            <p className="font-serif text-sm text-ink/40 italic">No items found in this category yet.</p>
            <button 
              onClick={() => onViewChange('sell')}
              className="bg-dark-green text-paper px-6 py-2 rounded-full font-display font-bold uppercase text-xs"
            >
              List an Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
