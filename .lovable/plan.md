## Ziel

1. Auf allen vier Übersichtsseiten (Bestellungen, Rechnungen, Objekte, Wäschesets) sollen die Karten – inklusive der „Neu"-Plus-Karte – exakt gleich groß und visuell konsistent sein.
2. Auf der Rechnungen-Seite werden die Status-Filter-Buttons (Alle / Offen / Mahnung / Bezahlt / Storniert) entfernt – analog zur bereits durchgeführten Änderung bei Bestellungen.

## Aktueller Zustand

| Seite | Padding | min-Height | Add-Tile |
|-------|---------|------------|----------|
| Bestellungen | `p-4` | – | `p-4`, kein min-h |
| Rechnungen | `p-4` | – | (keine Add-Tile) |
| Objekte | `p-3` | – | `p-3` `min-h-[112px]` |
| Wäschesets | `p-3` | – | `p-3` `min-h-[112px]` |

Dadurch sind die Karten zwischen den Seiten unterschiedlich hoch, und innerhalb derselben Seite kann die Add-Tile von den Datenkarten abweichen.

## Änderungen

### Einheitlicher Karten-Stil (alle 4 Seiten)

Datenkarten und Add-Tiles erhalten dieselben Basis-Klassen:
- `rounded-2xl`
- `p-3`
- `min-h-[112px]`
- `shadow-card transition-all hover:shadow-soft active:scale-[0.99]`

Da CSS-Grid pro Zeile bereits gleich hohe Items rendert, sorgt zusätzlich `min-h-[112px]` dafür, dass auch eine alleinstehende Add-Tile (letzte Zeile mit nur einem Item) dieselbe Höhe wie die Datenkarten hat.

### `src/pages/Bestellungen.tsx`
- Datenkarte: `p-4` → `p-3`, ergänze `min-h-[112px]`.
- Add-Tile: ergänze `min-h-[112px]` (bereits vorhanden, nur prüfen).

### `src/pages/Rechnungen.tsx`
- **Status-Filter entfernen:** `statusFilters` Konstante, `statusFilter` State, gesamten `<div className="flex flex-wrap gap-1.5">…</div>` Block sowie `matchesStatus` aus dem Filter-Predicate löschen. `filteredRechnungen` filtert nur noch nach Suchtext.
- Hinweistext im Empty-State ohne `statusFilter`-Bezug.
- Datenkarte: `p-4` → `p-3`, ergänze `min-h-[112px]`.
- Keine Add-Tile (Erstellung läuft hier nicht über die Liste).

### `src/pages/Objekte.tsx`
- Datenkarte und Add-Tile: bereits `p-3`, ergänze `min-h-[112px]` an der Datenkarte für Konsistenz.

### `src/pages/WaescheSets.tsx`
- Datenkarte und Add-Tile: bereits `p-3`, ergänze `min-h-[112px]` an der Datenkarte.

## Nicht betroffen

- Inhalt/Layout innerhalb der Karten (Texte, Icons, StatusBadge) bleibt unverändert.
- Suchleiste, Header, Routing, Hooks, Daten-Logik bleiben unverändert.
- Andere Seiten oder Komponenten werden nicht angefasst.
