import { ChevronDown, ArrowRight, type LucideIcon } from 'lucide-react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IconVariant = 'accent' | 'info' | 'warning' | 'primary';
export type ChipVariant =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'info'
  | 'primary'
  | 'accent'
  | 'warning'
  | 'success';

const iconVariantStyles: Record<IconVariant, string> = {
  accent: 'bg-accent/15 text-accent',
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-warning',
  primary: 'bg-primary/15 text-primary',
};

const chipVariantStyles: Record<ChipVariant, string> = {
  pending: 'bg-status-pending/15 text-status-pending',
  processing: 'bg-status-processing/15 text-status-processing',
  ready: 'bg-status-ready/15 text-status-ready',
  delivered: 'bg-status-delivered/15 text-status-delivered',
  info: 'bg-info/15 text-info',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/15 text-success',
};

export interface SectionChip {
  label: string;
  count: number | string;
  variant: ChipVariant;
}

interface SectionHeaderProps {
  icon: LucideIcon;
  iconVariant: IconVariant;
  title: string;
  subtitle?: string;
  open: boolean;
  chips?: SectionChip[];
  onAllClick?: () => void;
  allLabel?: string;
}

export function SectionHeader({
  icon: Icon,
  iconVariant,
  title,
  subtitle,
  open,
  chips,
  onAllClick,
  allLabel = 'Alle',
}: SectionHeaderProps) {
  const showChips = !open && chips && chips.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-soft">
      <CollapsibleTrigger className="flex w-full items-center gap-3 min-h-14 px-4 py-3 rounded-2xl hover:bg-muted/40 active:bg-muted/60 transition-colors text-left">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
            iconVariantStyles[iconVariant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-card-foreground leading-tight truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</div>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>

      {(showChips || onAllClick) && (
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-0 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {showChips &&
              chips!.map((chip, i) => (
                <span
                  key={i}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                    chipVariantStyles[chip.variant]
                  )}
                >
                  {chip.count} {chip.label}
                </span>
              ))}
          </div>
          {onAllClick && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onAllClick();
              }}
            >
              {allLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
