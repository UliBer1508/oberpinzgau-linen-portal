import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatCardVariant = 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'neutral';

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

const iconStyles: Record<StatCardVariant, string> = {
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  info: 'bg-info/15 text-info',
  neutral: 'bg-muted text-muted-foreground',
};

const surfaceStyles: Record<StatCardVariant, string> = {
  primary: 'bg-primary/10 border-primary/25',
  accent: 'bg-accent/10 border-accent/30',
  success: 'bg-success/10 border-success/25',
  warning: 'bg-warning/10 border-warning/30',
  info: 'bg-info/10 border-info/25',
  neutral: 'bg-card border-border',
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
        'group rounded-2xl border p-3 min-h-[160px] shadow-card transition-all hover:shadow-soft hover:-translate-y-0.5',
        surfaceStyles[variant],
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
            iconStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
