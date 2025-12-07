import { BestellungStatus, RechnungStatus } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type AllStatus = BestellungStatus | RechnungStatus;

const statusConfig: Record<AllStatus, { label: string; className: string }> = {
  // Bestellung statuses
  neu: {
    label: 'Neu',
    className: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  },
  in_bearbeitung: {
    label: 'In Bearbeitung',
    className: 'bg-status-processing/15 text-status-processing border-status-processing/30',
  },
  ausgeliefert: {
    label: 'Ausgeliefert',
    className: 'bg-status-ready/15 text-status-ready border-status-ready/30',
  },
  abgeholt: {
    label: 'Abgeholt',
    className: 'bg-status-delivered/15 text-status-delivered border-status-delivered/30',
  },
  abgeschlossen: {
    label: 'Abgeschlossen',
    className: 'bg-status-delivered/15 text-status-delivered border-status-delivered/30',
  },
  storniert: {
    label: 'Storniert',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  // Rechnung statuses
  offen: {
    label: 'Offen',
    className: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  },
  bezahlt: {
    label: 'Bezahlt',
    className: 'bg-status-delivered/15 text-status-delivered border-status-delivered/30',
  },
};

interface StatusBadgeProps {
  status: AllStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || 'Unbekannt',
    className: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
