## Ziel

Schnellbestellung erweitern um:
1. **Anzahl Sets** (Multiplikator) — z. B. 2× Standardset
2. **Optionale Buchungsdetails** — Gastname, Check-In, Check-Out, Personen
3. Klare Auswahl: „Mit Buchung" oder „Ohne Buchung"

So entstehen zwei Wege:
- **Schnell ohne Buchung** → nur Lieferdatum + Anzahl Sets
- **Mit Buchung** → zusätzlich Gastname / Zeitraum / Personen

## UX-Konzept (`QuickOrderDialog.tsx`)

### Schritt-Layout (innerhalb des bestehenden Dialogs)
Ein einziger Dialog, gegliedert in drei Bereiche untereinander — kein Wizard, damit es auf Mobile schnell bleibt:

```text
┌────────────────────────────────┐
│ Objekt-Name                    │
│ Set: Standardset (4 Artikel)   │
├────────────────────────────────┤
│ Anzahl Sets:  [ − ]  2  [ + ]  │
├────────────────────────────────┤
│ Lieferdatum    [Kalender]      │
├────────────────────────────────┤
│ Buchungsdetails       [Toggle] │  ← Switch „Mit Buchung"
│  ▼ (eingeklappt wenn aus)      │
│  Gastname      [______]        │
│  Check-In      [Datum]         │
│  Check-Out     [Datum]         │
│  Personen      [ − ] 2 [ + ]   │
├────────────────────────────────┤
│ [Abbrechen]      [Bestellen]   │
└────────────────────────────────┘
```

### Verhalten
- **Anzahl Sets**: Stepper (Minus/Plus, Min 1, Max 20). Default 1.
- **Buchungsdetails-Switch**: Default = aus. Beim Aktivieren erscheinen die Felder per `Collapsible`.
  - Wenn aus → Gastname/Check-In/Check-Out/Personen werden NICHT gesendet (`null`).
  - Wenn an → Felder sind optional (kein Pflichtfeld), aber wenn `check_in` und `check_out` gesetzt sind, muss `check_out >= check_in` gelten.
- **Lieferdatum** bleibt Pflicht.
- **Vorbelegung**: Wenn Buchung aktiviert und `check_in` gewählt, könnte `lieferdatum = check_in` vorgeschlagen werden (nur wenn noch leer).

### Validierung
- `lieferdatum` Pflicht → wie bisher.
- `anzahl_sets` >= 1.
- Wenn Buchung an + beide Daten gesetzt → `check_out >= check_in`, sonst Toast.
- Zod-Schema im Dialog.

## Datenfluss

### Positionen-Berechnung (Anzahl Sets)
Beim Submit werden die Set-Artikel mit `anzahl_sets` multipliziert:

```ts
positionen: set.artikel.map(a => ({
  artikel_id: a.artikel_id,
  menge: a.menge * anzahlSets,
}))
```

Keine Schema-Änderung nötig — `bestellpositionen.menge` ist bereits `integer`.

### Buchungsfelder
`useCreateBestellung` akzeptiert bereits `gastname`, `check_in`, `check_out`, `anzahl_personen` (siehe `useSupabaseData.ts` Z. 209–212). Die DB-Spalten existieren in `waeschebestellungen`. → **Keine Migration nötig.**

Bei „Buchung aus" werden diese Felder als `null` übergeben.

## Komponenten / Dateien

### Geändert: `src/components/QuickOrderDialog.tsx`
- Neuer State: `anzahlSets` (number, default 1), `mitBuchung` (boolean, default false), `gastname`, `checkIn`, `checkOut`, `anzahlPersonen`.
- Stepper-Komponente inline (Buttons + Anzeige) — kein neues UI-Paket nötig.
- `Switch` aus shadcn (`@/components/ui/switch`) für „Mit Buchung".
- `Collapsible` (`@/components/ui/collapsible`) für die Buchungsfelder.
- Zwei `Calendar`-Popovers (Check-In, Check-Out) — kompakt via `Popover` + `Calendar` (Pattern wie shadcn-Datepicker, mit `pointer-events-auto`).
- Reset aller States beim Schließen.

### Unverändert
- `QuickOrderTiles.tsx` — Aufruf bleibt gleich.
- `useCreateBestellung` — bestehende Parameter abdecken alles.
- DB-Schema — keine Migration.

## Edge Cases
- Leere Sets (set.artikel.length === 0) → Bestell-Button bleibt deaktiviert (bereits im Code via `!set` — zusätzliche Prüfung auf `set.artikel.length > 0`).
- Sehr große `anzahl_sets` × `menge` → Cap bei 20 Sets.
- Kein Set hinterlegt → wie bisher Weiterleitung zu `/waeschesets`.

## Nicht im Scope
- Preis-Vorschau (kein Preis im aktuellen Quick-Flow sichtbar).
- Wiederkehrende Bestellungen.
- Edit nach Erstellung (passiert in `BestellungDetail`).
