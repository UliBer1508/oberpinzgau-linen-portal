import { Building2, MapPin, Home, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockObjekte } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export default function Objekte() {
  const navigate = useNavigate();

  return (
    <MainLayout 
      title="Objekte" 
      subtitle="Übersicht Ihrer Standorte und Objekte"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockObjekte.map((objekt, index) => (
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
    </MainLayout>
  );
}
