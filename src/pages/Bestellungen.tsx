import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Loader2, FileText, FileX } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
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

// Status-basierte Hintergrundfarben
const getStatusRowColor = (status: BestellungStatus): string => {
  switch (status) {
    case 'neu':
      return 'bg-status-pending/10';
    case 'in_bearbeitung':
      return 'bg-status-processing/10';
    case 'ausgeliefert':
    case 'abgeholt':
      return 'bg-status-ready/10';
    case 'abgeschlossen':
      return 'bg-status-delivered/10';
    case 'storniert':
      return 'bg-destructive/10';
    default:
      return '';
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

  // Realtime subscription for status updates
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
    const matchesSearch = objektName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'alle' || bestellung.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateTotal = (positionen: typeof bestellungen[0]['positionen']) => {
    return positionen?.reduce((sum, pos) => {
      const preis = pos.waescheartikel?.preis || 0;
      return sum + (preis * pos.menge);
    }, 0) || 0;
  };

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
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>

        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 md:px-6 py-3 text-left font-medium text-muted-foreground">
                  Bestellung
                </th>
                <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left font-medium text-muted-foreground">
                  Objekt
                </th>
                <th className="px-3 md:px-6 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left font-medium text-muted-foreground">
                  Artikel
                </th>
                <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left font-medium text-muted-foreground">
                  Lieferdatum
                </th>
                <th className="px-3 md:px-6 py-3 text-right font-medium text-muted-foreground">
                  Summe
                </th>
                <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left font-medium text-muted-foreground">
                  Rechnung
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBestellungen.map((bestellung, index) => (
                <tr
                  key={bestellung.id}
                  className={`hover:bg-muted/50 transition-colors cursor-pointer animate-slide-up ${getStatusRowColor(bestellung.status)}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/bestellungen/${bestellung.id}`)}
                >
                  <td className="px-3 md:px-6 py-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground truncate">
                          #{bestellung.bestellnummer || bestellung.id.slice(-4).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(bestellung.created_at), 'dd.MM.yy', { locale: de })}
                          <span className="sm:hidden"> · {bestellung.objekt?.name || '—'}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 md:px-6 py-3">
                    <p className="font-medium text-card-foreground">{bestellung.objekt?.name || '—'}</p>
                  </td>
                  <td className="px-3 md:px-6 py-3">
                    <StatusBadge status={bestellung.status} />
                  </td>
                  <td className="hidden md:table-cell px-3 md:px-6 py-3 text-muted-foreground">
                    {bestellung.positionen?.length || 0} Pos.
                  </td>
                  <td className="hidden lg:table-cell px-3 md:px-6 py-3 text-muted-foreground">
                    {bestellung.lieferdatum
                      ? format(new Date(bestellung.lieferdatum), 'dd.MM.yyyy', { locale: de })
                      : '—'
                    }
                  </td>
                  <td className="px-3 md:px-6 py-3 text-right font-semibold text-card-foreground whitespace-nowrap">
                    €{calculateTotal(bestellung.positionen).toFixed(2)}
                  </td>
                  <td className="hidden md:table-cell px-3 md:px-6 py-3">
                    {bestellung.rechnung ? (
                      <Badge
                        variant="outline"
                        className="bg-status-delivered/10 text-status-delivered border-status-delivered/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/rechnungen/${bestellung.rechnung?.id}`);
                        }}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Erstellt
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                        <FileX className="h-3 w-3 mr-1" />
                        Keine
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBestellungen.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-medium text-foreground">
              Keine Bestellungen gefunden
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter anpassen oder neue Bestellung erstellen.
            </p>
            <Button variant="hero" size="sm" className="mt-4 rounded-2xl" onClick={() => navigate('/bestellungen/neu')}>
              <Plus className="h-4 w-4" />
              Neue Bestellung
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
