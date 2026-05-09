## Status-Chips für Bestellungen-Header

Im eingeklappten Zustand der Bestellungen-Sektion sollen – analog zur Übersicht – farbige Chips mit Anzahl pro Status angezeigt werden.

### Anzuzeigende Chips
Aus `recentOrders` (bzw. `bestellungen` für Gesamtbild – siehe Frage unten) werden gezählt:
- **Neu** → `status === 'neu'` (Farbe: `bg-status-pending/15 text-status-pending`)
- **In Bearb.** → `status === 'in_bearbeitung'` (Farbe: `bg-status-processing/15 text-status-processing`)
- **Ausgel.** → `status === 'ausgeliefert'` (Farbe: `bg-status-ready/15 text-status-ready`)

Chips mit Anzahl 0 werden ausgeblendet (wie sinnvoll bei leeren Werten).

### Verhalten
- Chips erscheinen nur, wenn `ordersOpen === false` (gleicher Mechanismus wie Übersicht-Chips)
- Der bisherige Gesamt-Chip „X Best." wird durch diese drei spezifischeren Chips ersetzt
- „Alle →"-Button bleibt rechts daneben

### Datenquelle
Für aussagekräftige Zahlen werden alle aktiven `bestellungen` ausgewertet (nicht nur die ersten 5 von `recentOrders`), damit der Header den echten Workload zeigt.

### Umsetzung in `src/pages/Dashboard.tsx`
- Drei `useMemo`-freie Inline-Counts berechnen (`bestellungen.filter(...).length`)
- Chip-Block im Header analog zu Übersicht (`px-2 py-0.5 rounded-full ... text-xs font-medium`)
- Keine weiteren strukturellen Änderungen

### Nicht betroffen
- Listen-/Tabelleninhalte
- Andere Sektionen (Übersicht, Rechnungen)