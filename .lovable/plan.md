## Ziel
Auf der Bestellungen-Seite (`/bestellungen`):
1. Status-Filter-Buttons entfernen — die Karten zeigen den Status bereits über Farbe und Badge.
2. „Neue Bestellung"-Plus-Kachel im Grid ergänzen (gleicher Stil wie auf Wäschesets/Objekte).

## Änderungen

**Nur `src/pages/Bestellungen.tsx`:**

1. Komplette `<div className="flex flex-wrap gap-1.5">…statusFilters…</div>` entfernen.
2. State `statusFilter` und Konstante `statusFilters` entfernen; in `filteredBestellungen` die `matchesStatus`-Bedingung streichen (nur noch `matchesSearch`).
3. Im Bestellungs-Grid am Ende eine gestrichelte Plus-Kachel ergänzen, die zu `/bestellungen/neu` navigiert — identisch mit der auf Objekte/Wäschesets:
   ```tsx
   <button onClick={() => navigate('/bestellungen/neu')}
     className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-3 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 min-h-[112px]">
     <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
       <Plus className="h-5 w-5 text-muted-foreground" />
     </div>
     <p className="mt-2 text-xs font-medium text-muted-foreground">Neue Bestellung</p>
   </button>
   ```
4. Die Plus-Kachel wird auch im leeren Empty-State sichtbar — daher Empty-State so anpassen, dass das Grid mit der Plus-Kachel gerendert wird, wenn keine Bestellungen existieren (statt der separaten Empty-Box). Optional: Empty-Box ganz entfernen, weil die Plus-Kachel selbsterklärend ist.
5. Imports aufräumen: `BestellungStatus` wird ggf. nicht mehr benötigt — bleibt aber für `getBestellungRowClassName`.

## Nicht angefasst
- Such-Input, Header-Action „Neue Bestellung", Karten-Layout, Status-Farben, Hooks.
