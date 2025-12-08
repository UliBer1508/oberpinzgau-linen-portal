import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverdueBadgeProps {
  faelligkeitsdatum: string | null;
  status: string;
  className?: string;
}

export function OverdueBadge({ faelligkeitsdatum, status, className }: OverdueBadgeProps) {
  if (!faelligkeitsdatum || status !== 'offen') {
    return null;
  }

  const isOverdue = new Date() > new Date(faelligkeitsdatum);
  
  if (!isOverdue) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        'bg-destructive/15 text-destructive border-destructive/30',
        className
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      Überfällig
    </span>
  );
}
