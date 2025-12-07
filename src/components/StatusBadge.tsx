import { BestellungStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const statusConfig: Record<BestellungStatus, { label: string; className: string }> = {
  ausstehend: {
    label: 'Ausstehend',
    className: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  },
  in_bearbeitung: {
    label: 'In Bearbeitung',
    className: 'bg-status-processing/15 text-status-processing border-status-processing/30',
  },
  in_waescherei: {
    label: 'In Wäscherei',
    className: 'bg-status-washing/15 text-status-washing border-status-washing/30',
  },
  bereit: {
    label: 'Bereit',
    className: 'bg-status-ready/15 text-status-ready border-status-ready/30',
  },
  geliefert: {
    label: 'Geliefert',
    className: 'bg-status-delivered/15 text-status-delivered border-status-delivered/30',
  },
};

interface StatusBadgeProps {
  status: BestellungStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

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
