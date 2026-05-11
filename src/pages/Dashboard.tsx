import {
  ShoppingCart,
  Building2,
  Package,
  Loader2,
  FileText,
  Plus,
  ArrowRight,
  Wallet,
  Inbox,
  ClipboardList,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useKunde, useObjekte, useWaescheSets, useBestellungen, useRechnungen, useWaescheArtikel, RechnungMitBestellung } from '@/hooks/useSupabaseData';
import { QuickOrderTiles } from '@/components/QuickOrderTiles';
import type { RechnungStatus, BestellungStatus } from '@/types/database';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte = [], isLoading: objekteLoading } = useObjekte(kunde?.id);
  const { data: waescheSets = [], isLoading: setsLoading } = useWaescheSets(kunde?.id);
  const { data: bestellungen = [], isLoading: bestellungenLoading } = useBestellungen(kunde?.id);
  const { data: rechnungen = [], isLoading: rechnungenLoading } = useRechnungen(kunde?.id);
  const { data: artikel = [] } = useWaescheArtikel();

  const isLoading = kundeLoading || objekteLoading || setsLoading || bestellungenLoading || rechnungenLoading;

  const activeOrders = bestellungen.filter(b => b.status !== 'abgeschlossen' && b.status !== 'storniert').length;
  const neueOrders = bestellungen.filter(b => b.status === 'neu').length;
  const aktiveObjekte = objekte.filter((o: any) => o.aktiv !== false).length;
  const verfuegbareArtikel = artikel.filter((a: any) => a.aktiv !== false).length;
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
      {/* Übersicht – Kennzahlen */}
      <div className="grid gap-3 grid-cols-2">
        <StatCard
          title="Bestellungen"
          value={activeOrders}
          subtitle={neueOrders > 0 ? `${neueOrders} neu` : 'aktiv'}
          variant="info"
          icon={<ShoppingCart className="h-6 w-6" />}
          onClick={() => navigate('/bestellungen')}
        />
        <StatCard
          title="Objekte"
          value={aktiveObjekte}
          subtitle={aktiveObjekte === 1 ? '1 aktiv' : `${aktiveObjekte} aktiv`}
          variant="primary"
          icon={<Building2 className="h-6 w-6" />}
          onClick={() => navigate('/objekte')}
        />
        <StatCard
          title="Wäschesets"
          value={waescheSets.length}
          subtitle={waescheSets.length === 1 ? '1 Set' : `${waescheSets.length} Sets`}
          variant="accent"
          icon={<Package className="h-6 w-6" />}
          onClick={() => navigate('/waeschesets')}
        />
        <StatCard
          title="Artikel"
          value={verfuegbareArtikel}
          subtitle="verfügbar"
          variant="warning"
          icon={<ClipboardList className="h-6 w-6" />}
          onClick={() => navigate('/artikel')}
        />
        <StatCard
          title="Rechnungen"
          value={offeneRechnungen.length}
          subtitle={
            offeneRechnungen.length > 0
              ? `${offeneRechnungen.length} offen · ${rechnungen.length} gesamt`
              : 'alle bezahlt'
          }
          variant={offeneRechnungen.length > 0 ? 'warning' : 'neutral'}
          icon={<Wallet className="h-6 w-6" />}
          onClick={() => navigate('/rechnungen')}
        />
      </div>

      {/* Bestellungen & Schnellbestellung */}
      <div className="mt-6 md:mt-8 grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Bestellungen</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-xs"
              onClick={() => navigate('/bestellungen')}
            >
              Alle anzeigen <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
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
            <div className="grid grid-cols-2 gap-3">
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
          )}
        </div>

        {/* Quick Order Tiles per Objekt */}
        <QuickOrderTiles objekte={objekte} waescheSets={waescheSets} />

        {/* Rechnungen */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Rechnungen</h2>
              {offeneRechnungen.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {offeneRechnungen.length} offen · €{offenerBetrag.toFixed(2)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-xs"
              onClick={() => navigate('/rechnungen')}
            >
              Alle anzeigen <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          {recentRechnungen.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">Noch keine Rechnungen</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
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
          )}
        </div>
      </div>
    </MainLayout>
  );
}
