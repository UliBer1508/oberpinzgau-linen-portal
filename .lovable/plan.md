## Ziel
Im Dashboard alle drei `SectionHeader`-Karten („Übersicht", „Bestellungen", „Rechnungen") entfernen. Die Inhalte (Kennzahlen-Karten, Bestellungs-Liste, Rechnungs-Liste) bleiben permanent sichtbar — keine Einklapp-Funktion mehr.

## Änderungen

**Nur eine Datei: `src/pages/Dashboard.tsx`**

1. `<SectionHeader>` für „Übersicht", „Bestellungen" und „Rechnungen" entfernen.
2. Die umschließenden `<Collapsible>` / `<CollapsibleContent>` entfernen — die Inhalte werden direkt gerendert.
3. State + LocalStorage für `statsOpen`, `ordersOpen`, `invoicesOpen` (inkl. der `handle*OpenChange`-Funktionen) entfernen.
4. Nicht mehr genutzte Imports aufräumen: `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`, `SectionHeader`, `Sparkles`, `ChevronDown`, ggf. `useState`.
5. „Alle →"-Navigation zu den Listenseiten geht aktuell nur über den Header. Damit der Nutzer von den Listen auf die Vollansicht kommt, jede Sektion mit einer schlichten Kopfzeile versehen:
   - Linksbündige Überschrift (`Bestellungen` / `Rechnungen`) als `h2`, Text-only
   - Rechts ein dezenter Link/Button „Alle anzeigen →" → navigiert zu `/bestellungen` bzw. `/rechnungen`
   - Für „Übersicht" entfällt die Kopfzeile komplett (Karten sprechen für sich).
6. Spacing der Sektionen mit `mt-6`/`mt-8` beibehalten, damit das Layout nicht kollabiert.

## Nicht angefasst
- `StatCard`, `QuickOrderTiles`, Listen-Karten und deren Logik bleiben unverändert.
- `SectionHeader.tsx` selbst wird nicht gelöscht (kann anderswo genutzt werden — kurz mit `rg` prüfen; falls nirgends mehr referenziert, optional löschen).
- Routen, Daten-Hooks, Bottom-Nav unverändert.
