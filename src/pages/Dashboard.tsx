import { ShoppingCart, Package, Building2, Clock, CheckCircle, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockBestellungen, mockObjekte, mockWaescheSets } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const activeOrders = mockBestellungen.filter(b => b.status !== 'geliefert').length;
  const pendingOrders = mockBestellungen.filter(b => b.status === 'ausstehend').length;
  const recentOrders = mockBestellungen.slice(0, 5);

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
          value={mockObjekte.length}
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          title="Wäschesets"
          value={mockWaescheSets.length}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Ausstehend"
          value={pendingOrders}
          icon={<ShoppingCart className="h-6 w-6" />}
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
            {recentOrders.map((bestellung) => (
              <div
                key={bestellung.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/bestellungen/${bestellung.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {bestellung.status === 'geliefert' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : bestellung.status === 'bereit' ? (
                      <Truck className="h-5 w-5 text-accent" />
                    ) : (
                      <Package className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {bestellung.objekt_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bestellung.positionen.length} Artikel · {' '}
                      {format(new Date(bestellung.created_at), 'dd. MMM yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
                <StatusBadge status={bestellung.status} />
              </div>
            ))}
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
                { status: 'ausstehend', count: mockBestellungen.filter(b => b.status === 'ausstehend').length },
                { status: 'in_bearbeitung', count: mockBestellungen.filter(b => b.status === 'in_bearbeitung').length },
                { status: 'in_waescherei', count: mockBestellungen.filter(b => b.status === 'in_waescherei').length },
                { status: 'bereit', count: mockBestellungen.filter(b => b.status === 'bereit').length },
              ].filter(s => s.count > 0).map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status as any} />
                  <span className="text-sm font-medium text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
