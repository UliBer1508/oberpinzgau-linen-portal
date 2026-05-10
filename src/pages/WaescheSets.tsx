import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2, Loader2, Building2, Users, Calendar, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useKunde, useWaescheSets, useWaescheArtikel, useObjekte, useSetSchnellbestellungSet, useDeleteWaescheSet } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

export default function WaescheSets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: waescheSets = [], isLoading: setsLoading } = useWaescheSets(kunde?.id);
  const { data: artikel = [] } = useWaescheArtikel();
  const { data: objekte = [] } = useObjekte(kunde?.id);
  const setSchnellbestellung = useSetSchnellbestellungSet();

  const isLoading = kundeLoading || setsLoading;

  const handleToggleSchnell = async (setId: string, objektId: string, isActive: boolean) => {
    try {
      await setSchnellbestellung.mutateAsync({ objektId, setId: isActive ? null : setId });
      toast({
        title: isActive ? 'Schnellbestellung entfernt' : 'Als Schnellbestellung gesetzt',
      });
    } catch (e: any) {
      toast({ title: 'Fehler', description: e?.message ?? 'Konnte nicht gespeichert werden.', variant: 'destructive' });
    }
  };

  const handleEdit = (setId: string) => {
    toast({
      title: 'Bearbeitung',
      description: 'Die Bearbeitungsfunktion wird bald verfügbar sein.',
    });
  };

  const handleDelete = (setId: string) => {
    toast({
      title: 'Löschen',
      description: 'Die Löschfunktion wird bald verfügbar sein.',
    });
  };

  const calculateSetPrice = (setArtikel: typeof waescheSets[0]['artikel']) => {
    return setArtikel.reduce((sum, a) => {
      const preis = a.waescheartikel?.preis || 0;
      return sum + (a.menge * preis);
    }, 0);
  };

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
        <Button variant="hero" onClick={() => navigate('/waeschesets/neu')}>
          <Plus className="h-4 w-4" />
          Neues Set erstellen
        </Button>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {waescheSets.map((set, index) => {
          const objekt = objekte.find(o => o.id === set.objekt_id);
          const isSchnell = objekt?.schnellbestellung_set_id === set.id;
          return (
          <div
            key={set.id}
            className={cn(
              "group rounded-xl border bg-card shadow-card transition-all hover:shadow-elevated animate-slide-up",
              isSchnell ? "border-accent ring-2 ring-accent/30" : "border-border"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => objekt && handleToggleSchnell(set.id, objekt.id, isSchnell)}
                    title={isSchnell ? 'Schnellbestellung entfernen' : 'Als Schnellbestellung setzen'}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                      isSchnell ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(set.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(set.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              {isSchnell && (
                <Badge variant="outline" className="mt-3 border-accent text-accent">
                  <Zap className="h-3 w-3 mr-1" /> Schnellbestellung
                </Badge>
              )}

              <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                {set.name}
              </h3>
              
              {/* Show associated object */}
              {set.objekt && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>{set.objekt.name}</span>
                </div>
              )}
              
              {set.beschreibung && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {set.beschreibung}
                </p>
              )}

              <div className="mt-4 space-y-2">
                {set.artikel.slice(0, 4).map((setArtikel) => (
                  <div 
                    key={setArtikel.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{setArtikel.waescheartikel?.name}</span>
                      {setArtikel.berechnungsart === 'pro_gast' ? (
                        <Badge variant="outline" className="text-xs h-5">
                          <Users className="h-3 w-3 mr-1" />
                          Pro Gast
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs h-5">
                          <Calendar className="h-3 w-3 mr-1" />
                          Pro Buchung
                        </Badge>
                      )}
                    </div>
                    <span className="font-medium text-card-foreground">×{setArtikel.menge}</span>
                  </div>
                ))}
                {set.artikel.length > 4 && (
                  <p className="text-sm text-muted-foreground italic">
                    + {set.artikel.length - 4} weitere Artikel
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {set.artikel.length} Artikel • {set.artikel.reduce((sum, a) => sum + a.menge, 0)} Stück
                </span>
                <span className="text-sm font-medium text-accent">
                  ~€{calculateSetPrice(set.artikel).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          );
        })}

        {/* Add New Set Card */}
        <button
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 min-h-[280px]"
          onClick={() => navigate('/waeschesets/neu')}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium text-muted-foreground">
            Neues Wäscheset erstellen
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Erstellen Sie individuelle Sets für Ihre Objekte
          </p>
        </button>
      </div>
    </MainLayout>
  );
}
