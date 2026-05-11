import {
  ShoppingCart,
  Building2,
  Package,
  Loader2,
  Plus,
  Wallet,
  ClipboardList,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/cards/StatCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useKunde, useObjekte, useWaescheSets, useBestellungen, useRechnungen, useWaescheArtikel } from '@/hooks/useSupabaseData';
import { QuickOrderTiles } from '@/components/QuickOrderTiles';

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

      {/* Schnellbestellung pro Objekt */}
      <div className="mt-6 md:mt-8">
        <QuickOrderTiles objekte={objekte} waescheSets={waescheSets} />
      </div>
    </MainLayout>
  );
}
