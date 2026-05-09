import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Zap, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickOrderDialog } from './QuickOrderDialog';
import type { Objekt, WaescheSetMitArtikel } from '@/types/database';

interface QuickOrderTilesProps {
  objekte: Objekt[];
  waescheSets: WaescheSetMitArtikel[];
}

export function QuickOrderTiles({ objekte, waescheSets }: QuickOrderTilesProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedObjekt, setSelectedObjekt] = useState<Objekt | null>(null);

  const setsById = useMemo(() => new Map(waescheSets.map(s => [s.id, s])), [waescheSets]);

  const handleClick = (objekt: Objekt) => {
    if (!objekt.schnellbestellung_set_id || !setsById.get(objekt.schnellbestellung_set_id)) {
      navigate('/waeschesets');
      return;
    }
    setSelectedObjekt(objekt);
    setOpen(true);
  };

  const selectedSet = selectedObjekt?.schnellbestellung_set_id
    ? setsById.get(selectedObjekt.schnellbestellung_set_id) ?? null
    : null;

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-4 md:p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          <h2 className="font-display text-lg font-bold text-card-foreground">Schnellbestellung</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/bestellungen/neu')}>
          <Plus className="h-4 w-4" /> Andere
        </Button>
      </div>

      {objekte.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Noch keine Objekte vorhanden.
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={() => navigate('/objekte/neu')}>
              <Plus className="h-4 w-4" /> Objekt anlegen
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {objekte.map((objekt) => {
            const set = objekt.schnellbestellung_set_id ? setsById.get(objekt.schnellbestellung_set_id) : null;
            const hasSet = !!set;
            return (
              <button
                key={objekt.id}
                onClick={() => handleClick(objekt)}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card text-left shadow-card transition-all active:scale-[0.98] hover:shadow-elevated min-h-[160px] md:min-h-[200px]"
              >
                {objekt.bild_url ? (
                  <img
                    src={objekt.bild_url}
                    alt={objekt.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-accent/30 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-primary/60" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Quick badge */}
                {hasSet && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-accent-foreground shadow">
                    <Zap className="h-3 w-3" /> Schnell
                  </span>
                )}

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white">
                  <div className="font-display text-base md:text-lg font-bold leading-tight drop-shadow">
                    {objekt.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs md:text-sm opacity-90">
                    <Package className="h-3.5 w-3.5" />
                    {hasSet ? set!.name : <span className="italic">Set festlegen</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <QuickOrderDialog
        open={open}
        onOpenChange={setOpen}
        objekt={selectedObjekt}
        set={selectedSet}
      />
    </div>
  );
}
