import { ClipboardList, Tag, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWaescheArtikel } from '@/hooks/useSupabaseData';

export default function Artikel() {
  const { data: artikel = [], isLoading } = useWaescheArtikel();
  
  const kategorien = [...new Set(artikel.map(a => a.kategorie).filter(Boolean))];

  if (isLoading) {
    return (
      <MainLayout title="Artikelkatalog" subtitle="Übersicht aller verfügbaren Wäscheartikel">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (artikel.length === 0) {
    return (
      <MainLayout title="Artikelkatalog" subtitle="Übersicht aller verfügbaren Wäscheartikel">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Keine Artikel gefunden
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Artikelkatalog" 
      subtitle="Übersicht aller verfügbaren Wäscheartikel"
    >
      <div className="space-y-8">
        {kategorien.map((kategorie, katIndex) => (
          <div key={kategorie} className="animate-slide-up" style={{ animationDelay: `${katIndex * 0.1}s` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{kategorie}</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {artikel.filter(a => a.kategorie === kategorie).map((art) => (
                <div
                  key={art.id}
                  className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    {art.preis != null && (
                      <span className="text-sm font-semibold text-primary">
                        €{art.preis.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="mt-3 font-medium text-card-foreground">
                    {art.name}
                  </h3>
                  {art.bezeichnung && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {art.bezeichnung}
                    </p>
                  )}
                  {art.groesse && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Größe: {art.groesse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
