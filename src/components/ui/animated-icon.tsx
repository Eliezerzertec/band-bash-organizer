import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'pulse' | 'bounce' | 'spin' | 'wiggle' | 'float' | 'glow' | 'none';
type ColorVariant = 'primary' | 'success' | 'warning' | 'accent' | 'info' | 'purple';

interface AnimatedIconProps {
  children: ReactNode;
  animation?: AnimationType;
  color?: ColorVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorStyles: Record<ColorVariant, string> = {
  primary: 'bg-primary/12 text-primary shadow-primary/20',
  success: 'bg-success/12 text-success shadow-success/20',
  warning: 'bg-warning/12 text-warning shadow-warning/20',
  accent: 'bg-accent/12 text-accent shadow-accent/20',
  info: 'bg-info/12 text-info shadow-info/20',
  purple: 'bg-purple-500/12 text-purple-500 shadow-purple-500/20',
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-12 h-12 rounded-2xl',
  lg: 'w-14 h-14 rounded-2xl',
};

const animationStyles: Record<AnimationType, string> = {
  none: '',
  pulse: 'animate-icon-pulse',
  bounce: 'animate-icon-bounce',
  spin: 'animate-icon-spin',
  wiggle: 'animate-icon-wiggle',
  float: 'animate-icon-float',
  glow: 'animate-icon-glow',
};

export function AnimatedIcon({ 
  children, 
  animation = 'pulse',
  color = 'primary',
  size = 'md',
  className
}: AnimatedIconProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        sizeStyles[size],
        colorStyles[color],
        animationStyles[animation],
        className
      )}
    >
      {children}
    </div>
  );
}
