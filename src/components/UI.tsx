import React from 'react';
import { motion } from 'motion/react';

export const Button = ({
  children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; className?: string; icon?: any; disabled?: boolean;
}) => {
  const base = `flex items-center justify-center gap-2 font-bold tracking-wide transition-all rounded-full px-6 py-4 text-sm select-none active:scale-[0.97]`;
  const variants = {
    primary: `bg-[#E8580A] text-white hover:bg-[#d44f08] shadow-[0_4px_20px_rgba(232,88,10,0.4)]`,
    secondary: `bg-[#111] text-white border border-white/8 hover:bg-[#181818]`,
    outline: `border border-[#E8580A]/40 text-[#E8580A] hover:bg-[#E8580A]/8`,
    ghost: `text-white/50 hover:text-white hover:bg-white/5`,
  };
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {Icon && <Icon size={18} />}{children}
    </motion.button>
  );
};

export const Card = ({ children, className = '', onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-[#111] border border-white/8 rounded-2xl relative overflow-hidden ${className}`} onClick={onClick} {...props}>{children}</div>
);

// Badge updated to MOVO pill style — rounded-full, solid color, no border
export const Badge = ({ children, color = 'brand', className = '' }: { children: React.ReactNode; color?: string; className?: string }) => {
  const colorMap: Record<string, string> = {
    brand: 'bg-[#E8580A] text-white',
    'brand-primary': 'bg-[#E8580A] text-white',
    green: 'bg-emerald-500/15 text-emerald-400',
    'emerald-500': 'bg-emerald-500/15 text-emerald-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    red: 'bg-red-500/15 text-red-400',
    'red-500': 'bg-red-500/15 text-red-400',
    yellow: 'bg-amber-500/15 text-amber-400',
    'yellow-500': 'bg-amber-500/15 text-amber-400',
    white: 'bg-white/10 text-white/60',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${colorMap[color] ?? colorMap.brand} ${className}`}>
      {children}
    </span>
  );
};