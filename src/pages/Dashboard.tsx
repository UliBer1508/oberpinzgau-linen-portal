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
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useKunde, useObjekte, useWaescheSets, useBestellungen, useRechnungen, RechnungMitBestellung } from '@/hooks/useSupabaseData';
import type { RechnungStatus, BestellungStatus } from '@/types/database';
export default function Dashboard() {
  const navigate = useNavigate();
  
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
        <Button variant="hero" onClick={() => navigate('/bestellungen/neu')}>
          <ShoppingCart className="h-4 w-4" />
          Neue Bestellung
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent Orders & Quick Actions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/15 text-info">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg font-bold text-card-foreground">
                Aktuelle Bestellungen
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/bestellungen')}>
              Alle <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">Noch keine Bestellungen</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/bestellungen/neu')}>
                <Plus className="h-4 w-4" /> Erste Bestellung
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bestellung</TableHead>
                  <TableHead>Objekt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rechnung</TableHead>
                  <TableHead>Rg.-Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((bestellung) => (
                  <TableRow
                    key={bestellung.id}
                    className={`cursor-pointer ${getBestellungRowClassName(bestellung.status)}`}
                    onClick={() => navigate(`/bestellungen/${bestellung.id}`)}
                  >
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      #{bestellung.bestellnummer || bestellung.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {bestellung.objekt?.name || 'Objekt'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={bestellung.status} />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {bestellung.rechnung?.rechnungsnummer || '—'}
                    </TableCell>
                    <TableCell>
                      {bestellung.rechnung ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          bestellung.rechnung.status === 'bezahlt'
                            ? 'bg-status-delivered/20 text-status-delivered'
                            : 'bg-status-pending/20 text-status-pending'
                        }`}>
                          {bestellung.rechnung.status === 'bezahlt' ? <Wallet className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {bestellung.rechnung.status === 'bezahlt' ? 'Bezahlt' : 'Offen'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-card-foreground">
              Schnellaktionen
            </h2>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start rounded-2xl bg-card hover:bg-primary/5 hover:border-primary/40"
              onClick={() => navigate('/bestellungen/neu')}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-info/15 text-info">
                <Plus className="h-4 w-4" />
              </span>
              Neue Bestellung
              <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-2xl bg-card hover:bg-primary/5 hover:border-primary/40"
              onClick={() => navigate('/waeschesets')}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Package className="h-4 w-4" />
              </span>
              Wäschesets verwalten
              <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-2xl bg-card hover:bg-primary/5 hover:border-primary/40"
              onClick={() => navigate('/objekte')}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Building2 className="h-4 w-4" />
              </span>
              Objekte anzeigen
              <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
            </Button>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-3 rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/15 text-warning">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg font-bold text-card-foreground">
                Aktuelle Rechnungen
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/rechnungen')}>
              Alle <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {recentRechnungen.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">Noch keine Rechnungen</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bestellung</TableHead>
                  <TableHead>Rechnung</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRechnungen.map((rechnung) => (
                  <TableRow
                    key={rechnung.id}
                    className={`cursor-pointer ${getRechnungRowClassName(rechnung.status)}`}
                    onClick={() => navigate(`/rechnungen/${rechnung.id}`)}
                  >
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      {rechnung.bestellung?.bestellnummer ? `#${rechnung.bestellung.bestellnummer}` : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rechnung.rechnungsnummer}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(rechnung.rechnungsdatum), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      €{(rechnung.bruttobetrag || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rechnung.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
