import { ShoppingCart, Package, Building2, Clock, Loader2, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useKunde, useObjekte, useWaescheSets, useBestellungen, useRechnungen, RechnungMitBestellung } from '@/hooks/useSupabaseData';
import { RechnungStatus, BestellungStatus } from '@/integrations/supabase/client';
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aktive Bestellungen"
          value={activeOrders}
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="Objekte"
          value={objekte.length}
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          title="Wäschesets"
          value={waescheSets.length}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Offene Rechnungen"
          value={offeneRechnungen.length}
          subtitle={`€${offenerBetrag.toFixed(2)} offen`}
          icon={<FileText className="h-6 w-6" />}
          onClick={() => navigate('/rechnungen')}
        />
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Aktuelle Bestellungen
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/bestellungen')}>
              Alle anzeigen
            </Button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Noch keine Bestellungen</p>
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
                      {bestellung.objekt?.name || 'Objekt'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={bestellung.status} />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {bestellung.rechnung?.rechnungsnummer || '—'}
                    </TableCell>
                    <TableCell>
                      {bestellung.rechnung ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          bestellung.rechnung.status === 'bezahlt' 
                            ? 'bg-status-delivered/20 text-status-delivered' 
                            : 'bg-status-pending/20 text-status-pending'
                        }`}>
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

        {/* Recent Invoices */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Aktuelle Rechnungen
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/rechnungen')}>
              Alle anzeigen
            </Button>
          </div>
          {recentRechnungen.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
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
                      {format(new Date(rechnung.rechnungsdatum), 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
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

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Schnellaktionen
          </h2>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/bestellungen/neu')}
            >
              <ShoppingCart className="h-4 w-4" />
              Neue Bestellung erstellen
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/waeschesets')}
            >
              <Package className="h-4 w-4" />
              Wäscheset verwalten
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/objekte')}
            >
              <Building2 className="h-4 w-4" />
              Objekte anzeigen
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
