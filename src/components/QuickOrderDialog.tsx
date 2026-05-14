import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateBestellung } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2, Package, Building2, CalendarIcon, Minus, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Objekt, WaescheSetMitArtikel } from '@/types/database';

interface QuickOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objekt: Objekt | null;
  set: WaescheSetMitArtikel | null;
}

const MAX_SETS = 20;

export function QuickOrderDialog({ open, onOpenChange, objekt, set }: QuickOrderDialogProps) {
  const [lieferdatum, setLieferdatum] = useState<Date | undefined>();
  const [anzahlSets, setAnzahlSets] = useState(1);
  const [personenProSet, setPersonenProSet] = useState(2);
  const [mitBuchung, setMitBuchung] = useState(false);
  const [gastname, setGastname] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [anzahlPersonen, setAnzahlPersonen] = useState(2);
  const { toast } = useToast();
  const createBestellung = useCreateBestellung();

  const reset = () => {
    setLieferdatum(undefined);
    setAnzahlSets(1);
    setMitBuchung(false);
    setGastname('');
    setCheckIn(undefined);
    setCheckOut(undefined);
    setAnzahlPersonen(2);
  };

  const handleSubmit = async () => {
    if (!objekt || !set) return;
    if (!lieferdatum) {
      toast({ title: 'Bitte Lieferdatum wählen', variant: 'destructive' });
      return;
    }
    if (mitBuchung && checkIn && checkOut && checkOut < checkIn) {
      toast({ title: 'Check-Out muss nach Check-In liegen', variant: 'destructive' });
      return;
    }
    try {
      await createBestellung.mutateAsync({
        objekt_id: objekt.id,
        lieferdatum: format(lieferdatum, 'yyyy-MM-dd'),
        gastname: mitBuchung && gastname.trim() ? gastname.trim() : null,
        check_in: mitBuchung && checkIn ? format(checkIn, 'yyyy-MM-dd') : null,
        check_out: mitBuchung && checkOut ? format(checkOut, 'yyyy-MM-dd') : null,
        anzahl_personen: mitBuchung ? anzahlPersonen : null,
        positionen: set.artikel.map(a => ({
          artikel_id: a.artikel_id,
          menge: mitBuchung
            ? (a.berechnungsart === 'pro_gast' ? a.menge * anzahlPersonen : a.menge)
            : a.menge * anzahlSets,
        })),
      });
      toast({
        title: 'Bestellung gesendet',
        description: `${objekt.name} – ${set.name}${mitBuchung ? ` für ${anzahlPersonen} Pers.` : ` (${anzahlSets}× Set)`} – Lieferung am ${format(lieferdatum, 'dd.MM.yyyy', { locale: de })}`,
      });
      reset();
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: 'Fehler', description: e instanceof Error ? e.message : 'Bestellung fehlgeschlagen.', variant: 'destructive' });
    }
  };

  const Stepper = ({ value, onChange, min = 1, max = MAX_SETS }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) => (
    <div className="inline-flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-semibold tabular-nums">{value}</span>
      <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  const setHasArtikel = !!set && set.artikel.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {objekt?.name ?? 'Schnellbestellung'}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            <Package className="h-4 w-4" />
            {set ? `Set: ${set.name} (${set.artikel.length} Artikel)` : 'Kein Wäscheset'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Buchungsdetails Toggle (first) */}
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mit-buchung" className="text-sm font-medium">Buchungsdetails</Label>
                <p className="text-xs text-muted-foreground mt-0.5">An eine Gast-Buchung knüpfen</p>
              </div>
              <Switch
                id="mit-buchung"
                checked={mitBuchung}
                onCheckedChange={(v) => {
                  setMitBuchung(v);
                  if (v) setAnzahlSets(1);
                }}
              />
            </div>

            <Collapsible open={mitBuchung}>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-3 pt-3 mt-3 border-t border-border">
                  <div>
                    <Label htmlFor="gastname" className="text-xs text-muted-foreground">Gastname</Label>
                    <Input
                      id="gastname"
                      value={gastname}
                      onChange={(e) => setGastname(e.target.value)}
                      placeholder="optional"
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Check-In</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full mt-1 justify-start text-left font-normal', !checkIn && 'text-muted-foreground')}>
                            <CalendarIcon className="h-4 w-4" />
                            {checkIn ? format(checkIn, 'dd.MM.yy', { locale: de }) : 'Datum'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} locale={de} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Check-Out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full mt-1 justify-start text-left font-normal', !checkOut && 'text-muted-foreground')}>
                            <CalendarIcon className="h-4 w-4" />
                            {checkOut ? format(checkOut, 'dd.MM.yy', { locale: de }) : 'Datum'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            locale={de}
                            disabled={(date) => (checkIn ? date < checkIn : false)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Personen
                    </Label>
                    <Stepper value={anzahlPersonen} onChange={setAnzahlPersonen} min={1} max={50} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bestimmt die Menge für Artikel „pro Gast".
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Anzahl Sets */}
          {!mitBuchung && (
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Anzahl Sets</Label>
                <Stepper value={anzahlSets} onChange={setAnzahlSets} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Multipliziert die Menge aller Artikel im Set.
              </p>
            </div>
          )}

          {/* Live-Vorschau berechnete Mengen */}
          {setHasArtikel && (
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-1">Berechnete Mengen</div>
              {set!.artikel.map((a) => {
                const istProGast = a.berechnungsart === 'pro_gast';
                const menge = mitBuchung
                  ? (istProGast ? a.menge * anzahlPersonen : a.menge)
                  : a.menge * anzahlSets;
                const formel = mitBuchung
                  ? (istProGast ? `${a.menge} × ${anzahlPersonen}` : `${a.menge}× pro Buchung`)
                  : `${a.menge} × ${anzahlSets}`;
                return (
                  <div key={a.artikel_id} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {a.waescheartikel?.name ?? 'Artikel'}
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        {istProGast ? 'pro Gast' : 'pro Buchung'}
                      </span>
                    </span>
                    <span className="tabular-nums whitespace-nowrap">
                      <span className="text-muted-foreground">{formel} = </span>
                      <span className="font-semibold">{menge}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lieferdatum */}
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Lieferdatum
            </Label>
            <div className="rounded-xl border border-border bg-card p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={lieferdatum}
                onSelect={setLieferdatum}
                locale={de}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-2">
          <Button variant="outline" className="h-14 text-base" onClick={() => onOpenChange(false)} disabled={createBestellung.isPending}>
            Abbrechen
          </Button>
          <Button variant="hero" className="h-14 text-base" onClick={handleSubmit} disabled={createBestellung.isPending || !setHasArtikel}>
            {createBestellung.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Bestellungen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
