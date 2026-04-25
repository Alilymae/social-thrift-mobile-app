import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, Camera, Grid, Heart, ShoppingCart, User, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import { View, Product } from '../../types';
import { productService } from '../../services/productService';
import { MOCK_PRODUCTS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { cartService } from '../../services/cartService';

interface SearchViewProps {
  onViewChange: (view: View) => void;
  onCategorySelect: (category: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onViewChange, onCategorySelect }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((data) => {
      setProducts(data);
    }, user?.uid);
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const allProducts = products.length > 0 ? products : MOCK_PRODUCTS;
    const query = searchQuery.toLowerCase();
    
    const filtered = allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.seller?.toLowerCase().includes(query)
    );
    
    setSearchResults(filtered);
  }, [searchQuery, products]);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onViewChange('profile');
      return;
    }

    setIsAdding(prev => ({ ...prev, [product.id]: true }));
    try {
      await cartService.addToCart(user.uid, product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const getCategoryCount = (categoryName: string) => {
    const allProducts = products.length > 0 ? products : MOCK_PRODUCTS;
    return allProducts.filter(p => p.category === categoryName).length;
  };

  const categories = [
    { name: 'Outerwear', count: getCategoryCount('Outerwear'), color: 'bg-pink' },
    { name: 'Dresses', count: getCategoryCount('Dresses'), color: 'bg-yellow' },
    { name: 'Accessories', count: getCategoryCount('Accessories'), color: 'bg-purple' },
    { name: 'Pants', count: getCategoryCount('Pants'), color: 'bg-orange' },
    { name: 'Tops', count: getCategoryCount('Tops'), color: 'bg-medium-green' },
    { name: 'Shoes', count: getCategoryCount('Shoes'), color: 'bg-lavender' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Search triggered! Filtering results...');
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <button 
          onClick={() => onViewChange('profile')}
          className="w-10 h-10 bg-pink border-1.5 border-ink rounded-lg flex items-center justify-center text-sm shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
        >
          📸
        </button>
      </header>

      {/* Search Bar */}
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink/40">
          <SearchIcon size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vintage treasures..."
          className="w-full bg-white py-3 pl-11 pr-12 rounded-xl border-1.5 border-ink hard-shadow focus:outline-none font-serif text-sm"
        />
        {searchQuery ? (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-2 right-2 w-8 h-8 flex items-center justify-center text-ink/40 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => onViewChange('sell')}
            className="absolute inset-y-2 right-2 px-2 bg-pink border-1.5 border-ink rounded-lg text-ink hover:bg-yellow active:scale-90 transition-colors"
          >
            <Camera size={16} />
          </button>
        )}
      </form>

      <AnimatePresence mode="wait">
        {searchQuery.trim() !== '' ? (
          <motion.section 
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-end">
              <h3 className="font-display text-lg font-bold text-ink uppercase tracking-tighter">
                {searchResults.length} Matches Found
              </h3>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[10px] font-sans font-bold uppercase tracking-widest text-pink"
              >
                Clear
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((product, index) => (
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
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-paper border-2 border-ink border-dashed rounded-full flex items-center justify-center mx-auto text-ink/20">
                  <SearchIcon size={32} />
                </div>
                <p className="font-serif text-sm text-ink/40 italic">We couldn't find any treasures for "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="bg-dark-green text-paper px-6 py-2 rounded-full font-display font-bold uppercase text-xs"
                >
                  Browse Categories
                </button>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Categories */}
            <section className="space-y-3">
              <div className="flex justify-between items-end">
                <h3 className="font-display text-lg font-bold text-ink uppercase tracking-tighter">Categories</h3>
                <button 
                  onClick={() => alert('Opening full category index...')}
                  className="text-[9px] font-sans font-bold uppercase tracking-widest text-dark-green flex items-center gap-1 hover:underline"
                >
                  <Grid size={12} /> View All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCategorySelect(cat.name)}
                    className={`${cat.color} p-4 rounded-xl text-left border-1.5 border-ink hard-shadow relative overflow-hidden group`}
                  >
                    <h4 className="font-display text-lg font-bold text-ink relative z-10 leading-tight">{cat.name}</h4>
                    <p className="text-[9px] font-sans font-bold text-ink/40 uppercase relative z-10">{cat.count} Items</p>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Trending Tags */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-ink uppercase tracking-tighter">Trending Now</h3>
              <div className="flex flex-wrap gap-2">
                {['#90sGrunge', '#CottageCore', '#Y2K', '#Minimalist', '#BohoChic'].map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(tag.replace('#', ''))}
                    className="bg-white px-3 py-1.5 rounded-lg border-1.5 border-ink text-xs font-serif text-ink/60 hover:bg-dark-green hover:text-paper transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
