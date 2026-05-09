## Bestellungen-Header im Übersicht-Stil

Aktuell hat die Bestellungen-Sektion noch einen großen Card-Header mit Icon-Kachel, dickem Rahmen und Border-Bottom. Sie soll – wie „Übersicht" – als schlanke Trigger-Zeile erscheinen.

### Änderungen in `src/pages/Dashboard.tsx`
- Den umschließenden Card-Container (`rounded-2xl border ... bg-card shadow-card`) der Bestellungen-Sektion entfernen
- Header neu aufbauen analog zu Übersicht:
  - `Sparkles`-Icon-Stil → `ShoppingCart`-Icon klein (`h-4 w-4`) in Akzentfarbe
  - Text „Aktuelle Bestellungen" als `text-sm font-medium text-muted-foreground`
  - Chevron rechts neben Titel (rotiert beim Öffnen)
  - Im eingeklappten Zustand rechts: Chip „X Best." (info-Farbe) + kleiner „Alle →"-Link
  - Im ausgeklappten Zustand: nur „Alle →"-Link rechts
- `CollapsibleContent` bekommt eigene Card-Optik (Rahmen + `rounded-2xl` + `bg-card`), damit die Liste/Tabelle weiterhin als Karte wirkt – nur der Header ist nun frei
- Bestehende Mobile-Liste und Desktop-Tabelle bleiben inhaltlich unverändert
- Persistenz (`localStorage` `dashboard.ordersOpen`) bleibt

### Nicht betroffen
- Rechnungen-Sektion bleibt unverändert (kein Auftrag dazu)
- Keine Backend-/Datenänderungen