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
        'group rounded-2xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-soft hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground leading-tight">
            {title}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-card-foreground leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-[11px] text-muted-foreground truncate">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
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
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
            variantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
