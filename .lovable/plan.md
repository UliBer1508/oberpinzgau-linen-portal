## Lösung

Im **Schnellbestellung-Dialog** (`QuickOrderDialog.tsx`) ohne Buchungsdetails kommt ein zweiter Stepper **„Personen pro Set"** dazu (Default 2). So lässt sich abbilden:
- Hotel: 5 Sets × 2 Personen
- Ferienhaus: 1 Set × 6 Personen

### UI (nur bei `mitBuchung === false`)

```text
┌──────────────────────────────────────────┐
│ Anzahl Sets          [-]  1  [+]         │
│ Personen pro Set     [-]  2  [+]         │
│ „pro Gast"-Mengen werden je Set × Pers.  │
│ multipliziert.                           │
└──────────────────────────────────────────┘
```

### Berechnung

```ts
const personen = mitBuchung ? anzahlPersonen : personenProSet;

const menge = a.berechnungsart === 'pro_gast'
  ? a.menge * personen * anzahlSets
  : a.menge * anzahlSets;          // pro_buchung skaliert nur mit Sets
```

Bei `mitBuchung === true` bleibt `anzahlSets` implizit 1 (eine Buchung = ein Set), Stepper bleibt versteckt wie bisher.

### Vorschau-Beispiele

| Konfiguration | Bettwäsche (pro Gast, menge 1) | Badvorleger (pro Buchung, menge 3) |
|---|---|---|
| 1 Set, 2 Personen | `1 × 2 = 2` | `3` |
| 1 Set, 6 Personen | `1 × 6 = 6` | `3` |
| 5 Sets, 2 Personen | `1 × 2 × 5 = 10` | `3 × 5 = 15` |
| Buchung, 4 Personen | `1 × 4 = 4` | `3` |

`× 1` wird in der Anzeige weggelassen.

### Änderungen
- `QuickOrderDialog.tsx`: neuer State `personenProSet` (Default 2), zweiter Stepper, neue Berechnung in Submit + Vorschau, Hilfetexte angepasst.

### Nicht betroffen
- Datenbank, Typen, Wäscheset-Definition.
- `NeueBestellung.tsx`.
- Buchungs-Modus-Logik.
