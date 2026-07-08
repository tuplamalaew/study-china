'use client';

import React from 'react';

export interface WuxiaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'flawless';
  playSoundOnHover?: boolean;
}

/**
 * Example: WuxiaButton
 * Demonstrates:
 * 1. 'use client' for Next.js static export.
 * 2. Strict Types (WuxiaButtonProps exported).
 * 3. Wuxia Theme / Glassmorphism (Slate-900, backdrop-blur).
 * 4. Audio Management (Avoids creating AudioContext, prepares for centralized playSound).
 * 5. Clean, modular structure under 200 lines.
 * 
 * NOTE: This is a reference file for the AI (Few-shot learning)
 * to understand the design system and coding standards of the project.
 */
export function WuxiaButton({ 
  children, 
  variant = 'primary', 
  playSoundOnHover = true,
  className = '',
  ...props 
}: WuxiaButtonProps) {
  
  const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-200 border backdrop-blur-md shadow-lg";
  
  const variants = {
    primary: "bg-slate-900/50 text-white border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-500",
    success: "bg-emerald-900/40 text-emerald-400 border-emerald-700/50 hover:bg-emerald-800/60 shadow-[0_0_15px_rgba(52,211,153,0.2)]",
    danger: "bg-rose-900/40 text-rose-400 border-rose-700/50 hover:bg-rose-800/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
    flawless: "bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 text-yellow-400 border-yellow-500/50 hover:from-yellow-600/40 hover:to-yellow-400/40 drop-shadow-md"
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSoundOnHover) {
      // Call centralized audio system here e.g., playSound('bamboo-hover')
    }
    props.onMouseEnter?.(e);
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </button>
  );
}
