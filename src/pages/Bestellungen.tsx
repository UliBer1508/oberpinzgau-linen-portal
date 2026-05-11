import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Building2, ShoppingCart, Wallet, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/external/client';
import type { BestellungStatus } from '@/types/database';
import { useKunde, useBestellungen } from '@/hooks/useSupabaseData';
import { useQueryClient } from '@tanstack/react-query';

const statusFilters: { label: string; value: BestellungStatus | 'alle' }[] = [
  { label: 'Alle', value: 'alle' },
  { label: 'Neu', value: 'neu' },
  { label: 'In Bearbeitung', value: 'in_bearbeitung' },
  { label: 'Ausgeliefert', value: 'ausgeliefert' },
  { label: 'Abgeholt', value: 'abgeholt' },
  { label: 'Abgeschlossen', value: 'abgeschlossen' },
];

const getBestellungRowClassName = (status: BestellungStatus): string => {
  switch (status) {
    case 'neu':
      return 'bg-status-pending/10 hover:bg-status-pending/15';
    case 'in_bearbeitung':
      return 'bg-status-processing/10 hover:bg-status-processing/15';
    case 'ausgeliefert':
    case 'abgeholt':
      return 'bg-status-ready/10 hover:bg-status-ready/15';
    case 'abgeschlossen':
      return 'bg-status-delivered/10 hover:bg-status-delivered/15';
    case 'storniert':
      return 'bg-destructive/10 hover:bg-destructive/15';
    default:
      return 'hover:bg-muted/50';
  }
};

export default function Bestellungen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BestellungStatus | 'alle'>('alle');

  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: bestellungen = [], isLoading: bestellungenLoading } = useBestellungen(kunde?.id);

  const isLoading = kundeLoading || bestellungenLoading;

  useEffect(() => {
    if (!kunde?.id) return;
    const channel = supabase
      .channel('bestellungen-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'waeschebestellungen',
          filter: `kunde_id=eq.${kunde.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bestellungen', kunde.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [kunde?.id, queryClient]);

  const filteredBestellungen = bestellungen.filter((bestellung) => {
    const objektName = bestellung.objekt?.name || '';
    const nr = bestellung.bestellnummer || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      objektName.toLowerCase().includes(q) || nr.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'alle' || bestellung.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <MainLayout title="Bestellungen" subtitle="Verwalten Sie Ihre Wäschebestellungen">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Bestellungen"
      subtitle="Ihre Wäschebestellungen"
      actions={
        <Button variant="hero" size="sm" className="rounded-2xl" onClick={() => navigate('/bestellungen/neu')}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neue Bestellung</span>
        </Button>
      }
    >
      {/* Suche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredBestellungen.map((bestellung) => (
          <button
            key={bestellung.id}
            onClick={() => navigate(`/bestellungen/${bestellung.id}`)}
            className={cn(
              'w-full text-left rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-soft active:scale-[0.99]',
              getBestellungRowClassName(bestellung.status)
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {bestellung.lieferdatum
                  ? format(new Date(bestellung.lieferdatum), 'dd.MM.yyyy', { locale: de })
                  : 'Kein Datum'}
              </span>
              <StatusBadge status={bestellung.status} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium truncate min-w-0">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{bestellung.objekt?.name || 'Objekt'}</span>
              </span>
              {bestellung.rechnung ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full shrink-0',
                    bestellung.rechnung.status === 'bezahlt'
                      ? 'bg-status-delivered/20 text-status-delivered'
                      : 'bg-status-pending/20 text-status-pending'
                  )}
                >
                  {bestellung.rechnung.rechnungsnummer}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground shrink-0">Keine Rg.</span>
              )}
            </div>
          </button>
        ))}

        {/* Neue Bestellung */}
        <button
          onClick={() => navigate('/bestellungen/neu')}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-3 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 min-h-[112px]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs font-medium text-muted-foreground">Neue Bestellung</p>
        </button>
      </div>
    </MainLayout>
  );
}
