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

          {/* Artikelauswahl mit Inline-Bearbeitung */}
          <div>
            <Label className="mb-2 block">
              Artikel {artikel ? `(${artikel.length})` : ''}
            </Label>
            {artikelLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-3">
                {Object.entries(artikelByKategorie).map(([kat, arts]) => (
                  <div key={kat}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">{kat}</h4>
                    <div className="space-y-2">
                      {arts.map(a => {
                        const inSet = pending.find(p => p.artikel_id === a.id);
                        return (
                          <div
                            key={a.id}
                            className={`rounded-md border transition ${
                              inSet ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => !inSet && addArt(a)}
                              className="w-full flex items-center gap-2 p-3 text-left min-h-14"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{a.name}</div>
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

                            {inSet && (
                              <div className="px-3 pb-3 pt-0 space-y-2 border-t border-primary/20">
                                <div className="flex items-center justify-between gap-2 pt-2">
                                  <div className="flex items-center gap-1">
                                    <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => updMenge(a.id, -1)}>
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-10 text-center text-base font-semibold">{inSet.menge}</span>
                                    <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => updMenge(a.id, 1)}>
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive" onClick={() => removeArt(a.id)} aria-label="Entfernen">
                                    <X className="h-5 w-5" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
                                  <Button
                                    type="button"
                                    variant={inSet.berechnungsart === 'pro_buchung' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="h-10 text-sm"
                                    onClick={() => inSet.berechnungsart !== 'pro_buchung' && toggleBer(a.id)}
                                  >
                                    <Calendar className="h-4 w-4 mr-1.5" /> Pro Buchung
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={inSet.berechnungsart === 'pro_gast' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="h-10 text-sm"
                                    onClick={() => inSet.berechnungsart !== 'pro_gast' && toggleBer(a.id)}
                                  >
                                    <Users className="h-4 w-4 mr-1.5" /> Pro Gast
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kompakte Übersicht */}
          {pending.length > 0 && (
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" /> Set-Inhalt ({pending.length})
              </Label>
              <div className="space-y-1 rounded-lg border p-3">
                {pending.map(p => (
                  <div key={p.artikel_id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate flex-1">
                      <span className="font-medium">{p.menge}×</span> {p.artikelName}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {p.berechnungsart === 'pro_gast' ? 'pro Gast' : 'pro Buchung'}
                    </Badge>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Gesamtpreis:</span>
                  <span>{formatPreis(gesamt)}</span>
                </div>
              </div>
            </div>
          )}
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
