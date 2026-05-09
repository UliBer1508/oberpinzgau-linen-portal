import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatCardVariant = 'primary' | 'accent' | 'success' | 'warning' | 'info';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: StatCardVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<StatCardVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'primary',
  trend,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-all hover:shadow-soft hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-card-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% zum Vormonat
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110',
            variantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
