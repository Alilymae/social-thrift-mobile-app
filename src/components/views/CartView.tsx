import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { cartService, CartItem } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';
import { View } from '../../types';

interface CartViewProps {
  onViewChange: (view: View) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = cartService.subscribeToCart(user.uid, (data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, [user]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate checkout
    setTimeout(async () => {
      if (user) {
        await cartService.clearCart(user.uid);
        alert('Thank you for your purchase! Your sustainable choices matter. 🌱');
        onViewChange('home');
      }
      setIsCheckingOut(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-6 pb-2 flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <button 
          onClick={() => onViewChange('home')}
          className="w-10 h-10 bg-white border-1.5 border-ink rounded-lg flex items-center justify-center text-sm shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </header>

      <div className="p-5 flex-1">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="text-dark-green" size={24} />
          <h2 className="font-display text-2xl font-black uppercase tracking-tighter">Your Bag</h2>
          <span className="bg-dark-green text-paper px-2 py-0.5 rounded text-[10px] font-bold">
            {items.length} ITEMS
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-cream/30 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={40} className="text-ink/10" />
              </div>
              <p className="font-serif text-ink/40 italic">Your bag is empty. Start curated shopping!</p>
              <button 
                onClick={() => onViewChange('home')}
                className="bg-ink text-white px-8 py-3 rounded-full font-display font-bold uppercase text-xs"
              >
                Go to Shop
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.cartItemId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border-1.5 border-ink rounded-2xl flex p-3 gap-4 hard-shadow relative"
                >
                  <div className="w-20 h-24 bg-cream/10 rounded-xl overflow-hidden border border-ink/10 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                      <h3 className="font-display font-bold text-sm leading-tight truncate">{item.name}</h3>
                      <p className="text-[10px] font-sans font-bold text-ink/40 uppercase tracking-widest mt-1">{item.category}</p>
                    </div>
                    <p className="font-display font-bold text-lg text-dark-green">${item.price}</p>
                  </div>
                  <button 
                    onClick={() => cartService.removeFromCart(item.cartItemId)}
                    className="absolute top-3 right-3 text-ink/20 hover:text-pink transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <div className="bg-white border-2 border-ink p-6 rounded-[24px] hard-shadow space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/40 font-bold uppercase text-[10px]">Subtotal</span>
                  <span className="font-display font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/40 font-bold uppercase text-[10px]">Shipping</span>
                  <span className="font-display font-bold uppercase text-dark-green text-[10px]">Free (Sustainable)</span>
                </div>
                <div className="pt-2 border-t border-ink/10 flex justify-between items-end">
                  <span className="font-display font-black text-lg uppercase">Total</span>
                  <span className="font-display font-black text-2xl text-dark-green">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-cream/20 rounded-xl border border-ink/5">
                <ShieldCheck size={16} className="text-dark-green" />
                <p className="text-[9px] font-sans font-bold text-ink/60 uppercase tracking-widest">
                  Secure checkout powered by Social Thrift
                </p>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-ink text-white py-5 rounded-2xl font-display font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <CreditCard size={24} />
                  </motion.div>
                ) : (
                  <>
                    <span>Checkout Now</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
