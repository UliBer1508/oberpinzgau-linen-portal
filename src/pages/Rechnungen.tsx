import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { FileText, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { OverdueBadge } from '@/components/OverdueBadge';
import { useRechnungen } from '@/hooks/useSupabaseData';
import { useKundeContext } from '@/contexts/KundeContext';
import type { RechnungStatus } from '@/types/database';
import { cn } from '@/lib/utils';


const getRechnungRowClassName = (status: RechnungStatus): string => {
  switch (status) {
    case 'offen':
      return 'bg-status-pending/10 hover:bg-status-pending/15';
    case 'mahnung':
      return 'bg-destructive/10 hover:bg-destructive/15';
    case 'bezahlt':
      return 'bg-status-delivered/10 hover:bg-status-delivered/15';
    case 'storniert':
      return 'bg-muted/50 hover:bg-muted/70';
    default:
      return 'hover:bg-muted/50';
  }
};

export default function Rechnungen() {
  const navigate = useNavigate();
  const { selectedKundeId } = useKundeContext();
  const { data: rechnungen = [], isLoading } = useRechnungen(selectedKundeId);
  const [search, setSearch] = useState('');

  const filteredRechnungen = rechnungen.filter((rechnung) => {
    const q = search.toLowerCase();
    return (
      rechnung.rechnungsnummer.toLowerCase().includes(q) ||
      rechnung.kunde_name.toLowerCase().includes(q)
    );
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <MainLayout title="Rechnungen" subtitle="Übersicht aller Rechnungen">
      {/* Filters */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredRechnungen.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-base font-medium text-foreground">Keine Rechnungen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? 'Keine Rechnungen für die aktuelle Suche gefunden.'
              : 'Es wurden noch keine Rechnungen erstellt.'}
          </p>
        </div>
      ) : (
        <>
          {/* Karten-Grid: 2 pro Zeile */}
          <div className="grid grid-cols-2 gap-3">
            {filteredRechnungen.map((rechnung) => (
              <button
                key={rechnung.id}
                onClick={() => navigate(`/rechnungen/${rechnung.id}`)}
                className={cn(
                  'w-full text-left rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-soft active:scale-[0.99]',
                  getRechnungRowClassName(rechnung.status)
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {format(new Date(rechnung.rechnungsdatum), 'dd.MM.yyyy', { locale: de })}
                  </span>
                  <StatusBadge status={rechnung.status} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground truncate min-w-0">
                    {rechnung.rechnungsnummer}
                  </span>
                  <span className="font-semibold text-sm shrink-0 text-foreground">
                    {formatCurrency(rechnung.bruttobetrag)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground truncate min-w-0">
                    {rechnung.kunde_firma || rechnung.kunde_name}
                  </span>
                  <OverdueBadge
                    faelligkeitsdatum={rechnung.faelligkeitsdatum}
                    status={rechnung.status}
                  />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </MainLayout>
  );
}
