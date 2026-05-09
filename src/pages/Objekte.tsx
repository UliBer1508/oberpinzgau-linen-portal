import { Building2, MapPin, User, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useKunde, useObjekte } from '@/hooks/useSupabaseData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/external/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Objekte() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte = [], isLoading: objekteLoading } = useObjekte(kunde?.id);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('objekte').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      const msg = error.message ?? '';
      if (msg.toLowerCase().includes('foreign key') || msg.includes('violates')) {
        toast.error(`„${name}" hat noch verknüpfte Bestellungen oder Sets.`);
      } else {
        toast.error('Löschen fehlgeschlagen: ' + msg);
      }
      return;
    }
    toast.success(`„${name}" gelöscht`);
    queryClient.invalidateQueries({ queryKey: ['objekte'] });
  };
  
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
      actions={
        <Button variant="hero" size="sm" className="rounded-2xl" onClick={() => navigate('/objekte/neu')}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neues Objekt</span>
        </Button>
      }
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {objekte.map((objekt, index) => (
            <div
              key={objekt.id}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:border-primary/30 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/objekte/${objekt.id}`)}
            >
              <div className="flex items-start justify-between">
                {objekt.bild_url ? (
                  <div className="h-12 w-12 overflow-hidden rounded-lg border border-border/60">
                    <img
                      src={objekt.bild_url}
                      alt={objekt.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                {objekt.name}
              </h3>

              <div className="mt-3 space-y-2">
                {formatAdresse(objekt) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{formatAdresse(objekt)}</span>
                  </div>
                )}
                {objekt.ansprechpartner && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{objekt.ansprechpartner}</span>
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
