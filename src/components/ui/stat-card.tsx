import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  progress?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
};

const progressVariants = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
};

export const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  progress,
  variant = 'default',
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:glow-primary',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <Icon className={cn('h-5 w-5', variantStyles[variant])} />
      </div>
      
      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn('text-3xl font-mono font-bold', variantStyles[variant])}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground font-mono">{unit}</span>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progressVariants[variant]
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
