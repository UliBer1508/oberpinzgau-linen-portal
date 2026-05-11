import { useNavigate } from 'react-router-dom';
import { Package, Plus, Loader2, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useKunde, useWaescheSets, useObjekte } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

export default function WaescheSets() {
  const navigate = useNavigate();
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: waescheSets = [], isLoading: setsLoading } = useWaescheSets(kunde?.id);
  const { data: objekte = [] } = useObjekte(kunde?.id);

  const isLoading = kundeLoading || setsLoading;

  if (isLoading) {
    return (
      <MainLayout title="Wäschesets" subtitle="Verwalten Sie Ihre vordefinierten Wäschesets">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Wäschesets"
      subtitle="Verwalten Sie Ihre vordefinierten Wäschesets"
      actions={
        <Button variant="hero" size="sm" className="rounded-2xl" onClick={() => navigate('/waeschesets/neu')}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neues Set</span>
        </Button>
      }
    >
      <div className="grid gap-3 grid-cols-2">
        {waescheSets.map((set) => {
          const objekt = objekte.find(o => o.id === set.objekt_id);
          const isSchnell = objekt?.schnellbestellung_set_id === set.id;
          const totalStueck = set.artikel.reduce((sum, a) => sum + a.menge, 0);
          const preis = set.artikel.reduce(
            (sum, a) => sum + a.menge * (a.waescheartikel?.preis || 0),
            0
          );
          return (
            <button
              key={set.id}
              onClick={() => navigate(`/waeschesets/${set.id}/bearbeiten`)}
              className={cn(
                'group text-left rounded-2xl border p-3 min-h-[112px] shadow-card transition-all hover:shadow-soft hover:-translate-y-0.5',
                'bg-accent/10 border-accent/30',
                isSchnell && 'ring-2 ring-accent'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground leading-tight truncate">
                    {set.name}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-card-foreground leading-none">
                    {set.artikel.length}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground truncate">
                    {totalStueck} Stück · €{preis.toFixed(2)}
                  </p>
                  {set.objekt && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                      {set.objekt.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 text-accent transition-transform group-hover:scale-110">
                    <Package className="h-5 w-5" />
                  </div>
                  {isSchnell && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent text-accent-foreground" title="Schnellbestellung">
                      <Zap className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Add New Set Card */}
        <button
          onClick={() => navigate('/waeschesets/neu')}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-3 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 min-h-[112px]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Neues Set
          </p>
        </button>
      </div>
    </MainLayout>
  );
}
