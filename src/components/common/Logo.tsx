import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className={`relative cursor-pointer select-none group ${className}`}
      onClick={onClick}
    >
      {!imageError ? (
        <img 
          src="/logo.png" 
          alt="Social Thrift" 
          className="h-10 sm:h-12 w-auto object-contain"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex flex-col">
          <div className="font-display text-2xl font-black text-dark-green leading-[0.8] tracking-tighter sm:text-3xl">
            SOCIAL<br />THRIFT
          </div>
          <div className="absolute -top-1 -left-1 w-full h-full bg-pink/20 -z-10 rounded-full blur-xl group-hover:bg-pink/30 transition-colors" />
          <span className="absolute -top-2 -right-2 text-gold animate-pulse">✦</span>
          <span className="absolute -bottom-1 -left-3 text-orange animate-bounce delay-75">✨</span>
        </div>
      )}
    </div>
  );
};
