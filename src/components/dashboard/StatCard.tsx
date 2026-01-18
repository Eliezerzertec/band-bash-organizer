import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  isPrimary?: boolean;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  primary: {
    iconBg: 'bg-primary/12',
    iconColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-success/12',
    iconColor: 'text-success',
  },
  warning: {
    iconBg: 'bg-warning/12',
    iconColor: 'text-warning',
  },
  accent: {
    iconBg: 'bg-accent/12',
    iconColor: 'text-accent',
  },
};

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'from last weeks',
  icon, 
  variant = 'default',
  isPrimary = false
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (isPrimary) {
    return (
      <div className="stat-card-primary animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">●●●● 5041</span>
          </div>
        </div>
        
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        
        <div className="flex gap-3 mt-6">
          <button className="btn-primary bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            Transfer
          </button>
          <button className="bg-white/20 text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-white/25 transition-colors">
            Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-5 animate-fade-in">
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
        
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          styles.iconBg,
          styles.iconColor
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
