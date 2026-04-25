import React from 'react';
import { Home, Search, PlusCircle, Shirt, User } from 'lucide-react';
import { motion } from 'motion/react';
import { View } from '../types';

interface NavigationProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'sell', icon: PlusCircle, label: 'Sell', isCenter: true },
    { id: 'styler', icon: Shirt, label: 'Styler' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] h-[75px] bg-dark-green flex justify-around items-center pb-4 px-2 z-[100] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className="w-11 h-11 bg-gold border-2 border-ink rounded-full flex items-center justify-center text-ink -translate-y-1 shadow-lg"
            >
              <PlusCircle size={28} />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className={`w-6 h-6 border-1.5 border-gold rounded-full flex items-center justify-center ${isActive ? 'bg-gold' : ''}`}>
              <Icon size={14} className={isActive ? 'text-dark-green' : 'text-gold'} />
            </div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-gold">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
