import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Minus, X, Calendar, Users, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  useWaescheArtikel,
  useCreateWaescheSet,
  useUpdateWaescheSet,
} from '@/hooks/useSupabaseData';
import type { WaescheArtikel, BerechnungsArt } from '@/types/database';

const FARB_STYLES: Record<string, string> = {
  'Weiß': 'bg-white border border-gray-300 text-gray-800',
  'Weiß gestreift': 'bg-white border border-gray-300 text-gray-800',
  'Grau': 'bg-gray-400 text-white',
  'Grau gestreift': 'bg-gray-400 text-white',
  'Braun': 'bg-amber-700 text-white',
  'Bunt': 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-white',
};

const getFarbStyle = (farbe: string | null) =>
  !farbe ? 'bg-muted text-muted-foreground' : FARB_STYLES[farbe] || 'bg-muted text-muted-foreground';

const formatPreis = (p: number | null) =>
  p == null ? '-' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p);

interface PendingArt {
  artikel_id: string;
  artikelName: string;
  artikelNummer: string;
  farbe: string | null;
  preis: number | null;
  menge: number;
  berechnungsart: BerechnungsArt;
}

export interface WaescheSetFormDialogProps {
  open: boolean;
  onClose: () => void;
  objektId: string;
  defaultName?: string;
  setToEdit?: {
    id: string;
    name: string;
    beschreibung: string | null;
    artikel: Array<{
      artikel_id: string;
      menge: number;
      berechnungsart: BerechnungsArt;
      waescheartikel?: { name: string; artikelnummer: string; farbe: string | null; preis: number | null } | null;
    }>;
  } | null;
}

export function WaescheSetFormDialog({
  open,
  onClose,
  objektId,
  defaultName,
  setToEdit,
}: WaescheSetFormDialogProps) {
  const isEdit = !!setToEdit;
  const { data: artikel, isLoading: artikelLoading } = useWaescheArtikel();
  const createSet = useCreateWaescheSet();
  const updateSet = useUpdateWaescheSet();

  const [name, setName] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [pending, setPending] = useState<PendingArt[]>([]);

  // (Re)Initialize when dialog opens
  useEffect(() => {
    if (!open) return;
    if (setToEdit) {
      setName(setToEdit.name);
      setBeschreibung(setToEdit.beschreibung ?? '');
      setPending(
        setToEdit.artikel.map(a => ({
          artikel_id: a.artikel_id,
          artikelName: a.waescheartikel?.name ?? 'Unbekannt',
          artikelNummer: a.waescheartikel?.artikelnummer ?? '',
          farbe: a.waescheartikel?.farbe ?? null,
          preis: a.waescheartikel?.preis ?? null,
          menge: a.menge,
          berechnungsart: a.berechnungsart,
        })),
      );
    } else {
      setName(defaultName ?? '');
      setBeschreibung('');
      setPending([]);
    }
  }, [open, setToEdit, defaultName]);

  const artikelByKategorie = useMemo(() => {
    if (!artikel) return {} as Record<string, WaescheArtikel[]>;
    return artikel.reduce((acc, a) => {
      const k = a.kategorie || 'Sonstige';
      (acc[k] ||= []).push(a);
      return acc;
    }, {} as Record<string, WaescheArtikel[]>);
  }, [artikel]);

  const gesamt = pending.reduce((s, a) => s + (a.preis ?? 0) * a.menge, 0);

  const addArt = (a: WaescheArtikel) => {
    setPending(prev => {
      const ex = prev.find(p => p.artikel_id === a.id);
      if (ex) return prev.map(p => (p.artikel_id === a.id ? { ...p, menge: p.menge + 1 } : p));
      return [
        ...prev,
        {
          artikel_id: a.id,
          artikelName: a.name,
          artikelNummer: a.artikelnummer,
          farbe: a.farbe,
          preis: a.preis,
          menge: 1,
          berechnungsart: 'pro_buchung',
        },
      ];
    });
  };

  const updMenge = (id: string, d: number) =>
    setPending(prev =>
      prev.map(p => (p.artikel_id === id ? { ...p, menge: Math.max(1, p.menge + d) } : p)),
    );

  const toggleBer = (id: string) =>
    setPending(prev =>
      prev.map(p =>
        p.artikel_id === id
          ? { ...p, berechnungsart: p.berechnungsart === 'pro_buchung' ? 'pro_gast' : 'pro_buchung' }
          : p,
      ),
    );

  const removeArt = (id: string) =>
    setPending(prev => prev.filter(p => p.artikel_id !== id));

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Bitte Set-Name angeben');
      return;
    }
    if (pending.length === 0) {
      toast.error('Bitte mindestens einen Artikel hinzufügen');
      return;
    }
    try {
      if (isEdit && setToEdit) {
        await updateSet.mutateAsync({
          setId: setToEdit.id,
          name: name.trim(),
          beschreibung: beschreibung.trim() || undefined,
          artikel: pending.map(p => ({
            artikelId: p.artikel_id,
            menge: p.menge,
            berechnungsart: p.berechnungsart,
          })),
        });
        toast.success('Set aktualisiert');
      } else {
        await createSet.mutateAsync({
          objektId,
          name: name.trim(),
          beschreibung: beschreibung.trim() || undefined,
          artikel: pending.map(p => ({
            artikelId: p.artikel_id,
            menge: p.menge,
            berechnungsart: p.berechnungsart,
          })),
        });
        toast.success('Set erstellt');
      }
      onClose();
    } catch (err: any) {
      toast.error('Speichern fehlgeschlagen: ' + (err?.message ?? 'Unbekannter Fehler'));
    }
  };

  const isPending = createSet.isPending || updateSet.isPending;

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Wäscheset bearbeiten' : 'Neues Wäscheset'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3">
            <div>
              <Label>Set-Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="z. B. Standardset" />
            </div>
            <div>
              <Label>Beschreibung (optional)</Label>
              <Textarea
                value={beschreibung}
                onChange={e => setBeschreibung(e.target.value)}
                rows={2}
                placeholder="Optionale Beschreibung..."
              />
            </div>
          </div>

          {/* Artikelauswahl */}
          <div>
            <Label className="mb-2 block">Artikel</Label>
            {artikelLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto rounded-lg border p-3">
                {Object.entries(artikelByKategorie).map(([kat, arts]) => (
                  <div key={kat}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">{kat}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {arts.map(a => {
                        const inSet = pending.find(p => p.artikel_id === a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => addArt(a)}
                            className={`flex items-center gap-2 p-2 rounded-md border text-left transition ${
                              inSet ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{a.name}</span>
                                {inSet && (
                                  <Badge variant="secondary" className="shrink-0 text-xs">
                                    {inSet.menge}×
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-muted-foreground">{a.artikelnummer}</span>
                                {a.farbe && (
                                  <Badge variant="outline" className={`text-[10px] px-1 ${getFarbStyle(a.farbe)}`}>
                                    {a.farbe}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-medium shrink-0">{formatPreis(a.preis)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zusammenfassung */}
          <div>
            <Label className="mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" /> Set-Inhalt
            </Label>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-3">Noch keine Artikel hinzugefügt.</p>
            ) : (
              <div className="space-y-2">
                {pending.map(p => (
                  <div key={p.artikel_id} className="rounded-lg border p-2 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{p.artikelName}</p>
                        <p className="text-[11px] text-muted-foreground">{p.artikelNummer}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeArt(p.artikel_id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updMenge(p.artikel_id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{p.menge}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updMenge(p.artikel_id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant={p.berechnungsart === 'pro_buchung' ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => p.berechnungsart !== 'pro_buchung' && toggleBer(p.artikel_id)}
                        >
                          <Calendar className="h-3 w-3 mr-1" /> Buchung
                        </Button>
                        <Button
                          variant={p.berechnungsart === 'pro_gast' ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => p.berechnungsart !== 'pro_gast' && toggleBer(p.artikel_id)}
                        >
                          <Users className="h-3 w-3 mr-1" /> Gast
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Gesamtpreis:</span>
                  <span>{formatPreis(gesamt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Speichern' : 'Set anlegen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
