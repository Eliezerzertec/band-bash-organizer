import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedIcon } from '@/components/ui/animated-icon';

type AnimationType = 'pulse' | 'bounce' | 'spin' | 'wiggle' | 'float' | 'glow' | 'none';
type ColorVariant = 'primary' | 'success' | 'warning' | 'accent' | 'info' | 'purple';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  animation?: AnimationType;
  isPrimary?: boolean;
}

const variantToColor: Record<string, ColorVariant> = {
  default: 'primary',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  accent: 'accent',
};

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs mês anterior',
  icon, 
  variant = 'default',
  animation = 'float',
  isPrimary = false
}: StatCardProps) {
  const colorVariant = variantToColor[variant];
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (isPrimary) {
    return (
      <div className="stat-card-primary animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium opacity-80">{title}</p>
        </div>
        
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              isPositive && "text-success-light",
              isNegative && "text-destructive-light"
            )}>
              {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive && '+'}
              {change}%
            </span>
            <span className="text-xs opacity-70">{changeLabel}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-elevated p-5 animate-fade-in group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                isPositive && "text-success",
                isNegative && "text-destructive",
                !isPositive && !isNegative && "text-muted-foreground"
              )}>
                {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
                {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive && '+'}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
        
        <AnimatedIcon 
          color={colorVariant}
          animation={animation}
          size="md"
          className="group-hover:scale-110 transition-transform duration-300"
        >
          {icon}
        </AnimatedIcon>
      </div>
    </div>
  );
}
