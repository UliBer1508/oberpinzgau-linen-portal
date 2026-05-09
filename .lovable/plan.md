## Bestellungen-Karte ein-/ausklappbar machen

Die Karte „Aktuelle Bestellungen" auf dem Dashboard soll – analog zur „Übersicht"-Sektion – ein- und ausklappbar werden. Status der Sektion bleibt (wie bei Übersicht) in `localStorage` erhalten.

### Verhalten
- Standard: ausgeklappt
- Klick auf Header (Icon + Titel + Chevron) klappt die Liste auf/zu
- Im eingeklappten Zustand bleibt der Header sichtbar mit kleinem Zähler-Chip (z. B. „3 Best.") rechts neben dem „Alle →"-Button
- Chevron rotiert beim Öffnen (gleicher Stil wie bei Übersicht)
- Sanfte Accordion-Animation (`animate-accordion-up/down`)

### Technische Umsetzung (`src/pages/Dashboard.tsx`)
- Neuer State `ordersOpen` + Persistierung in `localStorage` (Key: `dashboard.ordersOpen`), gleiches Muster wie `statsOpen`
- Bestellungen-Block (Zeilen ~163–... bis schließendes `</div>` der Card) in `<Collapsible>` umbauen:
  - Header-Bereich → `<CollapsibleTrigger>` (Icon, Titel, Chevron). „Alle →"-Button bleibt daneben, aber außerhalb des Triggers (kein verschachtelter Button), damit Navigation nicht das Aufklappen triggert
  - Inhalt (Mobile-Liste + Desktop-Tabelle bzw. Empty-State) in `<CollapsibleContent>`
- Beim eingeklappten Zustand: kleinen Chip mit `recentOrders.length` anzeigen

### Nicht betroffen
- Keine Änderungen an Datenladelogik, Routing oder anderen Karten
- Keine Änderungen an Backend/DB