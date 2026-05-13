## Ziel
Auf den Hauptlisten-Seiten (erreichbar via BottomNav) zusätzlich einen Pfeil-Zurück-Button im mobilen Header anzeigen, der zum Dashboard zurückführt — wie im Screenshot bei "Bestellungen" gezeigt.

## Umsetzung
`backTo="/dashboard"` an `MainLayout` ergänzen auf:
- `Bestellungen.tsx`
- `Objekte.tsx`
- `Rechnungen.tsx`
- `WaescheSets.tsx`
- `Artikel.tsx`
- `Profil.tsx`

Auf dem Dashboard selbst kein Zurück-Button (Startseite).

Der Button ist nur auf Mobile sichtbar (`md:hidden` ist bereits im MainLayout implementiert).

## Nicht Teil dieses Plans
- Keine Änderung an Desktop-Layout
- Kein Anfassen der Detail-/Formular-Seiten (haben bereits backTo)