## Ziel

Die Karten auf den Übersichtsseiten und im Dashboard sollen die in der Referenz gezeigte größere Höhe annehmen (etwa wie die aktuelle Objekt-Karte mit 4 Textzeilen + Bild). Aktuell ist `min-h-[112px]` zu klein.

## Änderung

Einheitliche Mindesthöhe **`min-h-[160px]`** für alle Listen-/Stat-Karten und ihre „Neu"-Plus-Tiles. Padding bleibt `p-3`, Rest unverändert.

Betroffene Stellen (`min-h-[112px]` → `min-h-[160px]`):

- `src/pages/Bestellungen.tsx` – Datenkarte und „Neue Bestellung"-Tile
- `src/pages/Rechnungen.tsx` – Datenkarte
- `src/pages/Objekte.tsx` – Datenkarte und „Neues Objekt"-Tile
- `src/pages/WaescheSets.tsx` – Datenkarte und „Neues Set"-Tile
- `src/components/cards/StatCard.tsx` – Wrapper (ergänzt `min-h-[160px]`, aktuell ohne min-h)

## Nicht betroffen

Inhalt, Farben, Icons, Layout-Logik und alle anderen Dateien bleiben unverändert.
