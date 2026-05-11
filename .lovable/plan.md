## Ziel
Im Dashboard die Sektionen „Bestellungen"-Liste und „Rechnungen"-Liste entfernen. Diese Inhalte sind bereits über Klick auf die jeweiligen Übersichts-Karten erreichbar.

## Änderungen

**Nur `src/pages/Dashboard.tsx`:**

1. Block „Bestellungen" (inkl. Header „Alle anzeigen" und Karten-Grid mit `recentOrders`) entfernen.
2. Block „Rechnungen" (inkl. Header und Karten-Grid mit `recentRechnungen`) entfernen.
3. `QuickOrderTiles` (Schnellbestellung pro Objekt) **bleibt** — wird unter den Übersichts-Karten direkt gerendert.
4. Nicht mehr benötigte Variablen aufräumen: `recentOrders`, `recentRechnungen`, `getBestellungRowClassName`, `getRechnungRowClassName`, `offenerBetrag`.
5. Nicht mehr benötigte Imports aufräumen: `StatusBadge`, `format`, `de`, `cn`, `Inbox`, `FileText`, `ArrowRight`, `RechnungMitBestellung`, `RechnungStatus`, `BestellungStatus`.

## Layout danach
- Übersichts-Karten (5 farbige StatCards, 2-spaltig)
- Schnellbestellung-Kacheln (`QuickOrderTiles`) darunter

Keine weiteren Dateien betroffen.
