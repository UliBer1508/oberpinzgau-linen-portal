import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Camera, ImageOff, Loader2, MapPin, Phone, StickyNote, Trash2, User } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const TYP_LABEL: Record<string, string> = {
  ferienwohnung: 'Ferienwohnung',
  ferienhaus: 'Ferienhaus',
  hotel: 'Hotel',
  pension: 'Pension',
  sonstige: 'Sonstige',
};

export default function ObjektDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!objekt) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('objekte').delete().eq('id', objekt.id);
      if (error) throw error;
      toast.success('Objekt gelöscht');
      queryClient.invalidateQueries({ queryKey: ['objekte'] });
      navigate('/objekte');
    } catch (err: any) {
      const msg = err?.message ?? 'Unbekannter Fehler';
      if (msg.toLowerCase().includes('foreign key') || msg.includes('violates')) {
        toast.error('Objekt kann nicht gelöscht werden – es gibt noch verknüpfte Bestellungen oder Sets.');
      } else {
        toast.error('Löschen fehlgeschlagen: ' + msg);
      }
      setDeleting(false);
    }
  };

  const { data: objekt, isLoading } = useQuery({
    queryKey: ['objekt', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objekte')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !objekt) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Bild ist zu groß (max. 8 MB)');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${objekt.kunde_id}/${objekt.id}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('objekt-bilder')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('objekt-bilder').getPublicUrl(path);

      const { error: updErr } = await supabase
        .from('objekte')
        .update({ bild_url: pub.publicUrl })
        .eq('id', objekt.id);
      if (updErr) throw updErr;

      toast.success('Bild aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['objekt', id] });
      queryClient.invalidateQueries({ queryKey: ['objekte'] });
    } catch (err: any) {
      toast.error('Upload fehlgeschlagen: ' + (err.message ?? 'Unbekannter Fehler'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!objekt?.bild_url) return;
    setUploading(true);
    const { error } = await supabase
      .from('objekte')
      .update({ bild_url: null })
      .eq('id', objekt.id);
    setUploading(false);
    if (error) {
      toast.error('Konnte Bild nicht entfernen');
      return;
    }
    toast.success('Bild entfernt');
    queryClient.invalidateQueries({ queryKey: ['objekt', id] });
    queryClient.invalidateQueries({ queryKey: ['objekte'] });
  };

  if (isLoading) {
    return (
      <MainLayout title="Objekt" subtitle="Lädt …">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!objekt) {
    return (
      <MainLayout title="Objekt nicht gefunden">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Dieses Objekt existiert nicht.</p>
          <Button onClick={() => navigate('/objekte')} variant="hero" className="rounded-2xl">
            Zurück zur Übersicht
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Ihre Objekte"
      subtitle="Detailansicht"
      actions={
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={deleting} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Löschen</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Objekt löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  „{objekt.name}" wird endgültig entfernt. Das geht nur, wenn keine Bestellungen oder Wäschesets mehr daran hängen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="sm" onClick={() => navigate('/objekte')}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Stammdaten mit Bild links */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-6 shadow-card">
          <div className="flex gap-4">
            {/* Bild links */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative block h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border border-border/60 bg-muted transition hover:opacity-90"
                aria-label={objekt.bild_url ? 'Bild ändern' : 'Bild hochladen'}
              >
                {objekt.bild_url ? (
                  <img src={objekt.bild_url} alt={objekt.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                    <span className="text-[10px]">Kein Bild</span>
                  </div>
                )}
                {uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
              {objekt.bild_url && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="h-3 w-3" />
                  Entfernen
                </button>
              )}
            </div>

            {/* Stammdaten rechts */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <h2 className="font-display text-base font-bold truncate">{objekt.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{TYP_LABEL[objekt.typ] || objekt.typ}</p>

              <dl className="space-y-3 text-sm">
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Adresse">
                  {[objekt.strasse, [objekt.plz, objekt.ort].filter(Boolean).join(' ')]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </InfoRow>
                <InfoRow icon={<User className="h-4 w-4" />} label="Ansprechpartner">
                  {objekt.ansprechpartner || '—'}
                </InfoRow>
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefon">
                  {objekt.telefon ? (
                    <a href={`tel:${objekt.telefon}`} className="text-primary hover:underline">
                      {objekt.telefon}
                    </a>
                  ) : (
                    '—'
                  )}
                </InfoRow>
                {objekt.notizen && (
                  <InfoRow icon={<StickyNote className="h-4 w-4" />} label="Notizen">
                    <span className="whitespace-pre-wrap">{objekt.notizen}</span>
                  </InfoRow>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-foreground break-words">{children}</dd>
      </div>
    </div>
  );
}
