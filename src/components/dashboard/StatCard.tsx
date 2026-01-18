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
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    ring: 'ring-primary/20',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    ring: 'ring-primary/20',
  },
  success: {
    icon: 'bg-success/10 text-success',
    ring: 'ring-success/20',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    ring: 'ring-warning/20',
  },
  accent: {
    icon: 'bg-accent/10 text-accent',
    ring: 'ring-accent/20',
  },
};

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs mês anterior',
  icon, 
  variant = 'default' 
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="card-elevated p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <p className="metric-value mt-2">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-3">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                isPositive && "bg-success-light text-success",
                isNegative && "bg-destructive-light text-destructive",
                !isPositive && !isNegative && "bg-muted text-muted-foreground"
              )}>
                {isPositive && <TrendingUp className="w-3 h-3" />}
                {isNegative && <TrendingDown className="w-3 h-3" />}
                {isPositive && '+'}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          styles.icon
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
