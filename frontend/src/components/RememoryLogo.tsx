import React from 'react';
import { useApp } from '../contexts/AppContext';
import { AppRoute } from '../types';

interface RememoryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RememoryLogo = ({ className = '', size = 'md' }: RememoryLogoProps) => {
  const { navigate } = useApp();

  const sizeClasses = {
    sm: 'w-6 h-6 text-base',
    md: 'w-8 h-8 text-xl',
    lg: 'w-10 h-10 text-2xl',
  };

  return (
    <button
      onClick={() => navigate(AppRoute.LANDING)}
      className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      aria-label="Go to Rememory home"
    >
      <div className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} rounded-full bg-stone-900 flex items-center justify-center text-white font-serif font-bold italic`}>
        R
      </div>
      <span className={`font-serif font-bold tracking-tight text-stone-800 ${sizeClasses[size].split(' ')[2]}`}>
        Rememory
      </span>
    </button>
  );
};

