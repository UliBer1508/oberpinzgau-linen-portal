
## Ziel

Die Listenseiten **Bestellungen** (`/bestellungen`) und **Rechnungen** (`/rechnungen`) sollen optisch identisch zur Dashboard-Übersicht (siehe Screenshot) dargestellt werden: gerundete Tabellenkarte mit farbigen Statuszeilen, gleichen Spalten und gleicher Mobile-Karten-Variante.

## Referenz: Dashboard-Übersicht

- Spalten Bestellungen: **Bestellung · Objekt · Status · Rechnung · Rg.-Status**
- Spalten Rechnungen: gleiche Karten-Optik (gerundete Card mit Tabelle innen, farbige Zeilen-Hintergründe pro Status)
- Mobile: 2-Spalten-Karten-Grid mit farbigem Hintergrund pro Status
- Container: `rounded-2xl border border-border bg-card shadow-card overflow-hidden`

## Änderungen

### `src/pages/Bestellungen.tsx`
- Bestehende Desktop-Tabelle (Bestellung/Objekt/Status/Artikel/Lieferdatum/Summe/Rechnung) **ersetzen** durch das Dashboard-Schema:
  - Spalten: Bestellung (#nummer in primary mono), Objekt (mit Building2-Icon), Status (StatusBadge), Rechnung (Rechnungsnummer mono oder „—"), Rg.-Status (Pill „Bezahlt"/„Offen" oder „—")
  - Zeilenfarben über `getBestellungRowClassName` (gleiche Logik wie Dashboard)
  - shadcn `<Table>` statt rohem `<table>`
- Mobile: 2-Spalten-Grid mit Karten im Übersicht-Stil (Lieferdatum + StatusBadge oben, Objekt + Rechnungsnummer-Pill unten) — analog Dashboard
- Such-/Filterleiste oberhalb bleibt erhalten
- Summe/Artikelanzahl/Lieferdatum-Spalten entfallen (passt zum Übersichts-Layout); falls relevant bleibt das im Detail sichtbar

### `src/pages/Rechnungen.tsx`
- Card+CardHeader-Wrapper entfernen, durch Übersichts-Container ersetzen (`rounded-2xl border border-border bg-card shadow-card overflow-hidden`)
- Filterleiste (Suche + Status-Select) als eigenständige Leiste oberhalb (analog Bestellungen-Stil mit Pill-Filter-Buttons statt Select, optional)
- Desktop-Tabelle behält Spalten Rechnungsnummer/Datum/Kunde/Betrag/Status, aber im neuen Karten-Container und mit den vorhandenen Statuszeilenfarben
- Mobile: 2-Spalten-Karten-Grid (Datum + StatusBadge oben, Rechnungsnr. + Betrag unten) statt aktueller Listen-Ansicht — passend zum Dashboard-Stil

### Keine Änderungen
- Keine Datenmodell-/Hook-Änderungen
- Keine Änderungen an Dashboard, Detailseiten, Auth, RLS

## Offene Frage (vor Umsetzung)

Sollen die zusätzlichen Felder (**Lieferdatum, Summe, Artikelanzahl** bei Bestellungen) komplett entfallen, oder lieber als zusätzliche Spalten im Dashboard-Schema beibehalten? Empfehlung: weglassen für 1:1-Konsistenz mit der Übersicht; Details stehen in der Detailansicht.
