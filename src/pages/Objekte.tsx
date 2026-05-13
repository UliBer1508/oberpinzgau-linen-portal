import { Building2, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useKunde, useObjekte } from '@/hooks/useSupabaseData';

export default function Objekte() {
  const navigate = useNavigate();
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte = [], isLoading: objekteLoading } = useObjekte(kunde?.id);

  const isLoading = kundeLoading || objekteLoading;

  // Helper to format address from separate fields
  const formatAdresse = (objekt: typeof objekte[0]) => {
    return [objekt.strasse, objekt.plz, objekt.ort].filter(Boolean).join(', ');
  };

  if (isLoading) {
    return (
      <MainLayout title="Objekte" subtitle="Übersicht Ihrer Standorte und Objekte">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Objekte"
      subtitle="Übersicht Ihrer Standorte und Objekte"
      backTo="/dashboard"
    >
      {objekte.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">
            Noch keine Objekte
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lege dein erstes Objekt (Wohnung, Haus, Hotel …) an.
          </p>
          <Button variant="hero" className="mt-4 rounded-2xl" onClick={() => navigate('/objekte/neu')}>
            <Plus className="h-4 w-4" />
            Neues Objekt anlegen
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {objekte.map((objekt) => (
            <button
              key={objekt.id}
              onClick={() => navigate(`/objekte/${objekt.id}`)}
              className="group text-left rounded-2xl border border-primary/25 bg-primary/10 p-3 min-h-[112px] shadow-card transition-all hover:shadow-soft hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground leading-tight truncate">
                    {objekt.name}
                  </p>
                  <p className="mt-1 font-display text-sm font-bold text-card-foreground leading-tight line-clamp-1">
                    {objekt.typ ? objekt.typ.replace(/_/g, ' ') : 'Objekt'}
                  </p>
                  {formatAdresse(objekt) && (
                    <p className="mt-1 text-[11px] text-muted-foreground truncate">
                      {[objekt.plz, objekt.ort].filter(Boolean).join(' ') || objekt.strasse}
                    </p>
                  )}
                  {objekt.ansprechpartner && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                      {objekt.ansprechpartner}
                    </p>
                  )}
                </div>
                {objekt.bild_url ? (
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-border/60">
                    <img src={objekt.bild_url} alt={objekt.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary transition-transform group-hover:scale-110">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Add new */}
          <button
            onClick={() => navigate('/objekte/neu')}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-3 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 min-h-[112px]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Neues Objekt</p>
          </button>
        </div>
      )}
    </MainLayout>
  );
}
