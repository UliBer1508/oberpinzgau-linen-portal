import { Building2, MapPin, Home, FileText, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useKunde, useObjekte } from '@/hooks/useSupabaseData';

export default function Objekte() {
  const navigate = useNavigate();
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte = [], isLoading: objekteLoading } = useObjekte(kunde?.id);
  
  const isLoading = kundeLoading || objekteLoading;

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
    >
      {objekte.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Keine Objekte gefunden
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kontaktieren Sie uns, um Objekte hinzuzufügen.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {objekte.map((objekt, index) => (
            <div
              key={objekt.id}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:border-primary/30 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/objekte/${objekt.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                {objekt.name}
              </h3>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{objekt.adresse}</span>
                </div>
                {objekt.anzahl_zimmer && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="h-4 w-4" />
                    <span>{objekt.anzahl_zimmer} Zimmer</span>
                  </div>
                )}
                {objekt.notizen && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mt-0.5" />
                    <span className="line-clamp-2">{objekt.notizen}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Details anzeigen →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
