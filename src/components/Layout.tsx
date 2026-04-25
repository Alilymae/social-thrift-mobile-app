import React from 'react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-paper flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[450px] min-h-screen bg-cream relative overflow-hidden flex flex-col shadow-xl">
        {children}
      </div>
    </div>
  );
};
