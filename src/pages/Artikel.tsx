import { ClipboardList, Tag } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockArtikel } from '@/data/mockData';

export default function Artikel() {
  const kategorien = [...new Set(mockArtikel.map(a => a.kategorie))];

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
              {mockArtikel.filter(a => a.kategorie === kategorie).map((artikel) => (
                <div
                  key={artikel.id}
                  className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    {artikel.preis_pro_stueck && (
                      <span className="text-sm font-semibold text-primary">
                        €{artikel.preis_pro_stueck.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="mt-3 font-medium text-card-foreground">
                    {artikel.name}
                  </h3>
                  {artikel.beschreibung && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {artikel.beschreibung}
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
