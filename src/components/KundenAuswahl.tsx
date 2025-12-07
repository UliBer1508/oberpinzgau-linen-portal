import { useAlleKunden } from '@/hooks/useSupabaseData';
import { useKundeContext } from '@/contexts/KundeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';

export function KundenAuswahl() {
  const { data: kunden, isLoading } = useAlleKunden();
  const { selectedKundeId, setSelectedKundeId } = useKundeContext();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Lade Kunden...</span>
      </div>
    );
  }

  if (!kunden || kunden.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/60">
        <Users className="h-4 w-4" />
        <span>Keine Kunden gefunden</span>
      </div>
    );
  }

  return (
    <div className="px-3">
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-sidebar-foreground/60">
        <Users className="h-3.5 w-3.5" />
        Kunde auswählen
      </label>
      <Select value={selectedKundeId || ''} onValueChange={setSelectedKundeId}>
        <SelectTrigger className="h-9 w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground">
          <SelectValue placeholder="Kunde wählen..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          {kunden.map((kunde) => (
            <SelectItem key={kunde.id} value={kunde.id}>
              {kunde.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
