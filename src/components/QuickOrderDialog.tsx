import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useCreateBestellung } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2, Package, Building2, CalendarIcon } from 'lucide-react';
import type { Objekt, WaescheSetMitArtikel } from '@/types/database';

interface QuickOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objekt: Objekt | null;
  set: WaescheSetMitArtikel | null;
}

export function QuickOrderDialog({ open, onOpenChange, objekt, set }: QuickOrderDialogProps) {
  const [lieferdatum, setLieferdatum] = useState<Date | undefined>();
  const { toast } = useToast();
  const createBestellung = useCreateBestellung();

  const handleSubmit = async () => {
    if (!objekt || !set) return;
    if (!lieferdatum) {
      toast({ title: 'Bitte Lieferdatum wählen', variant: 'destructive' });
      return;
    }
    try {
      await createBestellung.mutateAsync({
        objekt_id: objekt.id,
        lieferdatum: format(lieferdatum, 'yyyy-MM-dd'),
        positionen: set.artikel.map(a => ({ artikel_id: a.artikel_id, menge: a.menge })),
      });
      toast({ title: 'Bestellung gesendet', description: `${objekt.name} – Lieferung am ${format(lieferdatum, 'dd.MM.yyyy', { locale: de })}` });
      setLieferdatum(undefined);
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Fehler', description: e?.message ?? 'Bestellung fehlgeschlagen.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setLieferdatum(undefined); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
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

        <div className="py-2">
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Lieferdatum
          </label>
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

        <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-2">
          <Button variant="outline" className="h-14 text-base" onClick={() => onOpenChange(false)} disabled={createBestellung.isPending}>
            Abbrechen
          </Button>
          <Button variant="hero" className="h-14 text-base" onClick={handleSubmit} disabled={createBestellung.isPending || !lieferdatum || !set}>
            {createBestellung.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Bestellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
