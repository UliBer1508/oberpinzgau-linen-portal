import { ShoppingCart, Package, Building2, Clock, CheckCircle, Truck, Loader2, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useKunde, useObjekte, useWaescheSets, useBestellungen, useRechnungen } from '@/hooks/useSupabaseData';
import { BestellungStatus } from '@/integrations/supabase/client';

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
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Noch keine Bestellungen</p>
              </div>
            ) : (
              recentOrders.map((bestellung) => (
                <div
                  key={bestellung.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/bestellungen/${bestellung.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {bestellung.status === 'abgeschlossen' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : bestellung.status === 'ausgeliefert' || bestellung.status === 'abgeholt' ? (
                        <Truck className="h-5 w-5 text-accent" />
                      ) : (
                        <Package className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {bestellung.objekt?.name || 'Objekt'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bestellung.positionen?.length || 0} Artikel · {' '}
                        {format(new Date(bestellung.created_at), 'dd. MMM yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={bestellung.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
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

          {/* Status Overview */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Bestellstatus
            </h2>
            <div className="space-y-3">
              {[
                { status: 'neu' as BestellungStatus, count: bestellungen.filter(b => b.status === 'neu').length },
                { status: 'in_bearbeitung' as BestellungStatus, count: bestellungen.filter(b => b.status === 'in_bearbeitung').length },
                { status: 'ausgeliefert' as BestellungStatus, count: bestellungen.filter(b => b.status === 'ausgeliefert').length },
                { status: 'abgeholt' as BestellungStatus, count: bestellungen.filter(b => b.status === 'abgeholt').length },
              ].filter(s => s.count > 0).map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-sm font-medium text-muted-foreground">{count}</span>
                </div>
              ))}
              {bestellungen.length === 0 && (
                <p className="text-sm text-muted-foreground">Keine aktiven Bestellungen</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
