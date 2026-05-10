import { useState } from 'react';
import {
  ShoppingCart,
  Package,
  Building2,
  Clock,
  Loader2,
  FileText,
  Plus,
  ArrowRight,
  Wallet,
  Inbox,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useKunde, useObjekte, useWaescheSets, useBestellungen, useRechnungen, RechnungMitBestellung } from '@/hooks/useSupabaseData';
import { QuickOrderTiles } from '@/components/QuickOrderTiles';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import type { RechnungStatus, BestellungStatus } from '@/types/database';
export default function Dashboard() {
  const navigate = useNavigate();
  const [statsOpen, setStatsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem('dashboard_stats_open');
    return v === null ? true : v === 'true';
  });
  const handleStatsOpenChange = (open: boolean) => {
    setStatsOpen(open);
    try { localStorage.setItem('dashboard_stats_open', String(open)); } catch {}
  };
  const [ordersOpen, setOrdersOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem('dashboard.ordersOpen');
    return v === null ? true : v === 'true';
  });
  const handleOrdersOpenChange = (open: boolean) => {
    setOrdersOpen(open);
    try { localStorage.setItem('dashboard.ordersOpen', String(open)); } catch {}
  };
  const [invoicesOpen, setInvoicesOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem('dashboard.invoicesOpen');
    return v === null ? true : v === 'true';
  });
  const handleInvoicesOpenChange = (open: boolean) => {
    setInvoicesOpen(open);
    try { localStorage.setItem('dashboard.invoicesOpen', String(open)); } catch {}
  };
  
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte = [], isLoading: objekteLoading } = useObjekte(kunde?.id);
  const { data: waescheSets = [], isLoading: setsLoading } = useWaescheSets(kunde?.id);
  const { data: bestellungen = [], isLoading: bestellungenLoading } = useBestellungen(kunde?.id);
  const { data: rechnungen = [], isLoading: rechnungenLoading } = useRechnungen(kunde?.id);
  
  const isLoading = kundeLoading || objekteLoading || setsLoading || bestellungenLoading || rechnungenLoading;
  
  // Use correct status values from database
  const activeOrders = bestellungen.filter(b => b.status !== 'abgeschlossen' && b.status !== 'storniert').length;
  const offeneRechnungen = rechnungen.filter(r => r.status === 'offen');
  const offenerBetrag = offeneRechnungen.reduce((sum, r) => sum + (r.bruttobetrag || 0), 0);
  const recentOrders = bestellungen.slice(0, 5);
  const recentRechnungen = rechnungen.slice(0, 5) as RechnungMitBestellung[];

  const getRechnungRowClassName = (status: RechnungStatus) => {
    switch (status) {
      case 'offen':
        return 'bg-status-pending/10 hover:bg-status-pending/15';
      case 'bezahlt':
        return 'bg-status-delivered/10 hover:bg-status-delivered/15';
      case 'storniert':
        return 'bg-destructive/10 hover:bg-destructive/15';
      default:
        return 'hover:bg-muted/50';
    }
  };

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

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Übersicht über Ihre Bestellungen und Objekte">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Übersicht über Ihre Bestellungen und Objekte"
      actions={
        <Button variant="hero" size="sm" onClick={() => navigate('/bestellungen/neu')} className="rounded-2xl">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neue Bestellung</span>
        </Button>
      }
    >
      {/* Stats Section (collapsible) */}
      <Collapsible open={statsOpen} onOpenChange={handleStatsOpenChange}>
        <SectionHeader
          icon={Sparkles}
          iconVariant="accent"
          title="Übersicht"
          subtitle="4 Kennzahlen"
          open={statsOpen}
          chips={[
            { label: 'Best.', count: activeOrders, variant: 'info' },
            { label: 'Obj.', count: objekte.length, variant: 'primary' },
            { label: 'Sets', count: waescheSets.length, variant: 'accent' },
            { label: 'Rg.', count: offeneRechnungen.length, variant: offeneRechnungen.length > 0 ? 'warning' : 'success' },
          ]}
        />
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-3 grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Aktive Bestellungen"
              value={activeOrders}
              variant="info"
              icon={<Clock className="h-6 w-6" />}
              onClick={() => navigate('/bestellungen')}
            />
            <StatCard
              title="Objekte"
              value={objekte.length}
              variant="primary"
              icon={<Building2 className="h-6 w-6" />}
              onClick={() => navigate('/objekte')}
            />
            <StatCard
              title="Wäschesets"
              value={waescheSets.length}
              variant="accent"
              icon={<Package className="h-6 w-6" />}
              onClick={() => navigate('/waeschesets')}
            />
            <StatCard
              title="Offene Rechnungen"
              value={offeneRechnungen.length}
              subtitle={`€${offenerBetrag.toFixed(2)} offen`}
              variant={offeneRechnungen.length > 0 ? 'warning' : 'success'}
              icon={<Wallet className="h-6 w-6" />}
              onClick={() => navigate('/rechnungen')}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Recent Orders & Quick Actions */}
      <div className="mt-4 md:mt-8 grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Collapsible open={ordersOpen} onOpenChange={handleOrdersOpenChange}>
            <SectionHeader
              icon={ShoppingCart}
              iconVariant="info"
              title="Bestellungen"
              subtitle={`${activeOrders} aktiv`}
              open={ordersOpen}
              chips={[
                { label: 'Neu', count: bestellungen.filter(b => b.status === 'neu').length, variant: 'pending' },
                { label: 'Bearb.', count: bestellungen.filter(b => b.status === 'in_bearbeitung').length, variant: 'processing' },
                { label: 'Ausgel.', count: bestellungen.filter(b => b.status === 'ausgeliefert').length, variant: 'ready' },
              ]}
              onAllClick={() => navigate('/bestellungen')}
            />
            <CollapsibleContent className="mt-3 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-muted-foreground">Noch keine Bestellungen</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/bestellungen/neu')}>
                    <Plus className="h-4 w-4" /> Erste Bestellung
                  </Button>
                </div>
              ) : (
                <>
                  {/* Karten-Grid: 2 pro Zeile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentOrders.map((bestellung) => (
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
                            <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              bestellung.rechnung.status === 'bezahlt'
                                ? 'bg-status-delivered/20 text-status-delivered'
                                : 'bg-status-pending/20 text-status-pending'
                            }`}>
                              {bestellung.rechnung.rechnungsnummer}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground shrink-0">Keine Rg.</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                </>
              )}

            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Quick Order Tiles per Objekt */}
        <QuickOrderTiles objekte={objekte} waescheSets={waescheSets} />

        {/* Recent Invoices */}
        <div className="lg:col-span-3">
          <Collapsible open={invoicesOpen} onOpenChange={handleInvoicesOpenChange}>
            <SectionHeader
              icon={FileText}
              iconVariant="warning"
              title="Rechnungen"
              subtitle={
                offeneRechnungen.length > 0
                  ? `${offeneRechnungen.length} offen · €${offenerBetrag.toFixed(2)}`
                  : 'Alle bezahlt'
              }
              open={invoicesOpen}
              chips={[
                { label: 'Offen', count: rechnungen.filter(r => r.status === 'offen').length, variant: 'pending' },
                { label: 'Bezahlt', count: rechnungen.filter(r => r.status === 'bezahlt').length, variant: 'delivered' },
              ]}
              onAllClick={() => navigate('/rechnungen')}
            />
            <CollapsibleContent className="mt-3 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {recentRechnungen.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-muted-foreground">Noch keine Rechnungen</p>
                </div>
              ) : (
                <>
                  {/* Karten-Grid: 2 pro Zeile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentRechnungen.map((rechnung) => (
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
                            €{(rechnung.bruttobetrag || 0).toFixed(2)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </MainLayout>
  );
}
