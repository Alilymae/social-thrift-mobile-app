import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-cream flex items-center justify-center p-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative max-w-xs w-full"
          >
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="Social Thrift" 
              className="w-full h-auto drop-shadow-xl"
              onError={(e) => {
                // Fallback if image isn't uploaded yet
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'font-display text-4xl font-black text-dark-green text-center leading-[0.8] tracking-tighter';
                  fallback.innerHTML = 'SOCIAL<br/>THRIFT';
                  parent.appendChild(fallback);
                }
              }}
            />
            
            {/* Animated Stars/Sparkles (mimicking logo style) */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -right-4 text-gold text-2xl"
            >
              ✦
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
              className="absolute -bottom-2 -left-6 text-yellow text-xl"
            >
              ✦
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
