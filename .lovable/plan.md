## Ziel
Mengen-Berechnung in der Schnellbestellung an die Set-Definition anpassen:
- `pro_buchung`-Artikel → Menge wie im Set definiert (z.B. 3 Badvorleger pro Buchung)
- `pro_gast`-Artikel → Menge × Gästezahl (z.B. 1 Bettwäsche × 6 Gäste = 6)

## Aktueller Bug
In `src/components/QuickOrderDialog.tsx` (Zeile 66–71) gilt aktuell:

```
mit Buchung + pro_buchung → menge × anzahlSets   ✗ falsch
mit Buchung + pro_gast    → menge × anzahlPersonen ✓
```

`anzahlSets` ist im Buchungs-Modus zwar im UI ausgeblendet, sein State-Default ist aber `1` und kann sich „erinnern", wenn vorher umgeschaltet wurde — d.h. Badvorleger könnten fälschlich vervielfacht werden.

## Korrektur

### 1. `src/components/QuickOrderDialog.tsx` — `handleSubmit`

Berechnung pro Position ersetzen:

```ts
positionen: set.artikel.map(a => {
  const menge = mitBuchung
    ? (a.berechnungsart === 'pro_gast'
        ? a.menge * anzahlPersonen
        : a.menge)                       // pro_buchung: genau wie definiert
    : a.menge * anzahlSets;              // ohne Buchung: manueller Multiplikator
  return { artikel_id: a.artikel_id, menge };
}),
```

### 2. State-Reset beim Umschalten
Wenn `mitBuchung` auf `true` gesetzt wird, `anzahlSets` zurück auf `1` setzen (Sicherheitsnetz, falls Nutzer vorher hochgestellt hat).

### 3. Live-Vorschau „Berechnete Mengen"
Direkt unter der Buchungs- bzw. Sets-Karte eine kompakte Liste einblenden, die für jeden Artikel zeigt:

```
Bettbezug 135x200    pro Gast      1 × 6 = 6
Badvorleger          pro Buchung   3
Handtuch 50x100      pro Gast      1 × 6 = 6
```

Reaktiv auf `mitBuchung`, `anzahlPersonen`, `anzahlSets`. Styling: `rounded-xl border bg-muted/30 p-3 text-sm space-y-1`.

Damit ist die Logik für den Nutzer transparent und Fehler werden sofort sichtbar.

### 4. Toast-Beschreibung
Im Buchungsmodus statt `${anzahlSets}× Set` die Personenzahl anzeigen:
```
${objekt.name} – ${set.name} für ${anzahlPersonen} Pers. – Lieferung am …
```

## Nicht im Scope
- Set-Konfiguration (`NeuesWaescheSet.tsx`, `WaescheSetFormDialog.tsx`) — funktioniert bereits korrekt, Logik wird dort nur eingestellt.
- Backend / `useCreateBestellung` — empfängt fertige Mengen.
- Seed-Daten — laut Aussage existiert das Set bereits.
