## Befund

In der **Schnellbestellung** (`QuickOrderDialog.tsx`) ist die Berechnung bereits korrekt — der Screenshot zeigt das gewünschte Verhalten:
- `pro_gast` × Personen → `1 × 6 = 6` ✅
- `pro_buchung` → bleibt `3` (nicht × 6) ✅

Der Fehler liegt in **„Neue Bestellung"** (`src/pages/NeueBestellung.tsx`, `handleSetSelect`, Zeile 127–133). Beim Übernehmen eines Wäschesets wird stumpf `a.menge` gesetzt — die `berechnungsart` und `anzahlPersonen` werden ignoriert. Dadurch:
- `pro_gast`-Artikel werden **nicht** mit Gästen multipliziert (zu wenig).
- Wenn der Benutzer später `anzahlPersonen` ändert, passiert mit den Set-Mengen nichts.
- `handleAddArtikel` (Zeile 148) setzt für **alle** manuell hinzugefügten Artikel die Menge = `anzahlPersonen` — auch für eigentlich „pro Buchung"-Artikel wie Badvorleger.

## Lösung

### 1. `handleSetSelect` (NeueBestellung.tsx, Z. 122–135)
Berechnungsart beim Übernehmen berücksichtigen:

```ts
const newItems: OrderItem[] = selectedSet.artikel.map(a => ({
  artikel_id: a.artikel_id,
  artikel_name: a.waescheartikel?.name || 'Unbekannt',
  menge: a.berechnungsart === 'pro_gast'
    ? a.menge * Math.max(1, anzahlPersonen)
    : a.menge,                              // pro_buchung → nie × Gäste
  preis: a.waescheartikel?.preis || 0,
}));
```

### 2. `handleAddArtikel` (Z. 138–150)
Default-Menge nicht mehr automatisch = `anzahlPersonen`, sondern `1`. Begründung: Beim manuellen Hinzufügen ist die Berechnungsart pro Artikel nicht bekannt — die Annahme „immer pro Gast" produziert falsche Mengen für Buchungs-Artikel. Der Benutzer kann die Menge direkt über den Stepper anpassen.

```ts
return [...prev, { ..., menge: 1, ... }];
```

### 3. Reaktion auf Änderung von `anzahlPersonen`
Wenn ein Set gewählt ist und der Benutzer `anzahlPersonen` nachträglich ändert, sollen die `pro_gast`-Mengen aktualisiert werden. Umsetzung: `useEffect`, der bei Änderung von `anzahlPersonen` die Mengen für Set-Artikel mit `pro_gast` neu berechnet (manuelle Overrides des Benutzers werden dabei überschrieben — das ist akzeptabel, weil das Set die Quelle der Wahrheit ist).

Alternative (einfacher, weniger invasiv): `handleSetSelect` erneut aufrufen, wenn `anzahlPersonen` sich ändert UND ein Set ausgewählt ist.

### 4. QuickOrderDialog
Keine Änderung nötig — Logik ist korrekt. Optional: Anzeige `3× pro Buchung = 3` zu `3 pro Buchung` vereinfachen, da das `× 1` impliziert wird. Sage Bescheid wenn gewünscht.

## Nicht betroffen
- DB-Schema, RLS, Typen.
- `QuickOrderDialog` Submit-Logik.
- Bestehende Bestellungen.
