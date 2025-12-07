import { useState } from 'react';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { mockWaescheSets } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function WaescheSets() {
  const { toast } = useToast();
  const [sets] = useState(mockWaescheSets);

  const handleEdit = (setId: string) => {
    toast({
      title: 'Bearbeitung',
      description: 'Die Bearbeitungsfunktion wird nach Datenbankanbindung aktiviert.',
    });
  };

  const handleDelete = (setId: string) => {
    toast({
      title: 'Löschen',
      description: 'Die Löschfunktion wird nach Datenbankanbindung aktiviert.',
    });
  };

  const calculateSetPrice = (artikel: typeof mockWaescheSets[0]['artikel']) => {
    // This would calculate based on actual prices in production
    return artikel.reduce((sum, a) => sum + (a.menge * 2), 0);
  };

  return (
    <MainLayout 
      title="Wäschesets" 
      subtitle="Verwalten Sie Ihre vordefinierten Wäschesets"
      actions={
        <Button variant="hero" disabled>
          <Plus className="h-4 w-4" />
          Neues Set erstellen
        </Button>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set, index) => (
          <div
            key={set.id}
            className="group rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-elevated animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(set.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(set.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                {set.name}
              </h3>
              {set.beschreibung && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {set.beschreibung}
                </p>
              )}

              <div className="mt-4 space-y-2">
                {set.artikel.slice(0, 4).map((artikel) => (
                  <div 
                    key={artikel.artikel_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{artikel.artikel_name}</span>
                    <span className="font-medium text-card-foreground">×{artikel.menge}</span>
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
        ))}

        {/* Add New Set Card */}
        <button
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 min-h-[280px]"
          onClick={() => toast({
            title: 'Neues Set',
            description: 'Diese Funktion wird nach Datenbankanbindung aktiviert.',
          })}
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
