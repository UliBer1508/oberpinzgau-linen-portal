## Ziel
Das Kunden-Dashboard zeigt eine einfache, klare Übersicht in 5 farbigen Karten — exakt im Stil des Referenzbilds (Wäsche Oberpinzgau Admin). Eine Karte pro Bereich, den der Kunde sehen/nutzen kann:

1. **Bestellungen** (blau) — Anzahl aktiv, z. B. „3 neu"
2. **Objekte** (grün) — Vermietungsobjekte, z. B. „2 aktiv"
3. **Rechnungen** (neutral/weiß bzw. orange wenn offen) — z. B. „1 offen · 4 gesamt"
4. **Wäschesets** (grün-türkis/accent) — Anzahl konfigurierter Sets
5. **Artikel** (orange) — Bestellbarer Artikelkatalog, z. B. „12 verfügbar"

## Aktueller Stand
- `src/pages/Dashboard.tsx` hat bereits eine „Übersicht"-Sektion mit 4 `StatCard`s (Bestellungen, Objekte, Wäschesets, Rechnungen). Es fehlt **Artikel**.
- `src/components/cards/StatCard.tsx` rendert die Karten mit weißem `bg-card`. Im Referenzbild hat **die ganze Karte** einen weichen, farbigen Hintergrund passend zum Bereich — nicht nur das Icon.
- Unter der Übersicht gibt es derzeit zusätzlich „Bestellungen"- und „Rechnungen"-Listen (Karten-Grid). Die bleiben unverändert; nur die obere Übersichts-Sektion wird angepasst.

## Lösung

### 1. `src/components/cards/StatCard.tsx` — farbige Kartenflächen
- Neue Map `cardSurfaceStyles` pro Variante: weicher Tint + passender Border, alles aus bestehenden Semantic Tokens (HSL):
  - `info` → `bg-info/10 border-info/25`
  - `primary` → `bg-primary/10 border-primary/25`
  - `accent` → `bg-accent/15 border-accent/30`
  - `warning` → `bg-warning/10 border-warning/30`
  - `success` → `bg-success/10 border-success/25`
  - `neutral` (neu, für „alles ok / nichts offen") → `bg-card border-border`
- Wurzel-`div` nutzt diese Klassen statt `bg-card border-border`.
- Icon-Kachel bleibt mit etwas stärkerem Tint (`/20`–`/25`), damit es sich abhebt.
- Keine Props-Änderungen außer optional `variant: 'neutral'` ergänzen.

### 2. `src/pages/Dashboard.tsx` — 5 Karten in der Übersicht
- Im Grid `grid-cols-2 lg:grid-cols-5` (oder `lg:grid-cols-3` für ruhigere Optik — siehe Frage unten) **Artikel-Karte** ergänzen:
  - Titel: „Artikel"
  - Wert: Anzahl bestellbarer Artikel (aus Artikelkatalog des Kunden)
  - Subtitle: z. B. „verfügbar"
  - Variante: `warning` (orange wie im Bild)
  - Icon: `ClipboardList`
  - `onClick` → `navigate('/artikel')`
- Datenquelle: prüfen ob ein Hook wie `useArtikel(kunde?.id)` existiert; falls nicht, in `src/hooks/useSupabaseData.ts` einen schlanken Hook ergänzen, der die für den Kunden bestellbaren Artikel zählt (gleicher Stil wie die anderen Hooks dort).
- Subtitle/Zahlen-Format an Bild angleichen:
  - Bestellungen: `"X neu"` statt `"Aktive Bestellungen"`
  - Objekte: `"X aktiv"`
  - Rechnungen: `"X offen · Y gesamt"` (oder „alle bezahlt" → variant `neutral`)
  - Wäschesets: nur Anzahl
  - Artikel: `"X verfügbar"`
- Sektion-Chips/SectionHeader bleibt; Stats-Section ist weiterhin einklappbar.

### 3. Keine Änderungen
- Listen-Sektionen darunter (Bestellungen, Rechnungen) bleiben wie aktuell (2-Spalten-Karten).
- Keine Token-Änderungen in `index.css` / `tailwind.config.ts` nötig.
- Sidebar/Bottom-Nav unverändert.

## Offene Frage
Im Bild sind die Karten in **2 Spalten** angeordnet (auch auf größeren Screens). Aktuell nutzt das Dashboard `lg:grid-cols-4`. Soll die neue Übersicht:
- (A) immer 2-spaltig bleiben (wie im Bild, ruhiger, mobil-first), oder
- (B) responsiv werden (`grid-cols-2 lg:grid-cols-5`, alle 5 nebeneinander auf Desktop)?

Standard-Annahme falls keine Antwort: **(A) 2-spaltig** wie im Referenzbild.
