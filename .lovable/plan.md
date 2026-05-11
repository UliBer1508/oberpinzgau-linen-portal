## Ziel
Die Wäschesets-Übersicht (`/waeschesets`) soll kompakte Kacheln im Stil der Dashboard-StatCards zeigen (siehe Bild: kleine Karte mit Titel, großer Zahl, Subtitle, Icon-Kachel, farbiger Hintergrund). Klick auf eine Kachel öffnet die Detail-/Bearbeiten-Ansicht.

## Aktueller Stand
- `src/pages/WaescheSets.tsx` rendert große Karten mit Artikel-Liste, Schnellbestellungs-Toggle, Bearbeiten/Löschen-Buttons und Preis-Footer.
- Routen: `/waeschesets`, `/waeschesets/neu`, `/waeschesets/:id/bearbeiten`. **Es gibt keine reine Detail-Route** — Klick führt sinnvollerweise zur Bearbeiten-Seite, die alle Details zeigt.
- Im Dashboard wird `StatCard` (`src/components/cards/StatCard.tsx`) als Vorlage verwendet — kompakt, farbig, klickbar.

## Lösung

**Datei: `src/pages/WaescheSets.tsx`** komplett neu strukturieren (Listenseite):

1. Grid auf `grid-cols-2 gap-3` ändern (wie Dashboard, mobil-first 2-spaltig).
2. Pro Set eine kompakte Kachel rendern, die optisch `StatCard` entspricht:
   - Hintergrund: `accent`-Tint (`bg-accent/10 border-accent/30`) wie die Wäschesets-Karte im Dashboard. Wenn das Set die Schnellbestellung des Objekts ist → zusätzlich `ring-2 ring-accent` und kleines `Zap`-Badge oben.
   - Layout: oben Titel (Set-Name, klein/uppercase) + Icon-Kachel rechts (`Package`, `bg-accent/20 text-accent`)
   - Mitte: große Zahl = Anzahl Artikel im Set
   - Subtitle: z. B. „X Stück · €Y" oder Objekt-Name (`set.objekt?.name`)
3. Komplette Karte ist `<button>` und navigiert per `onClick` zu `/waeschesets/:id/bearbeiten` (Detail/Bearbeiten).
4. Schnellbestellung-Toggle, Bearbeiten- und Löschen-Buttons werden aus der Kachel entfernt — sie gehören in die Detail-/Bearbeitungsansicht (`NeuesWaescheSet.tsx` im Edit-Modus, wo Löschen/Toggle bereits existieren oder ergänzt werden können). Diese Logik bleibt im Code aber ungenutzt → entfernen (Hooks `useSetSchnellbestellungSet`, `useDeleteWaescheSet`, `handleEdit`, `handleDelete`, `handleToggleSchnell`, `calculateSetPrice` falls nicht mehr gebraucht — Preis kann inline berechnet werden).
5. „Neues Set erstellen"-Kachel als gestrichelte Plus-Kachel im selben kompakten Format am Ende des Grids belassen.
6. Header-Action „Neues Set erstellen" bleibt.

## Hinweis zur Detail-Ansicht
Klick führt aktuell zur Bearbeiten-Seite (`/waeschesets/:id/bearbeiten`) — dort sind alle Details sichtbar (Name, Beschreibung, Artikel mit Mengen/Berechnungsart). Schnellbestellung-Toggle und Löschen sollten dort verfügbar sein. **Das wird in dieser Plan-Iteration nicht angepasst** — falls die Edit-Seite die Aktionen noch nicht hat, in einem Folge-Schritt ergänzen.

## Nicht angefasst
- `StatCard.tsx` bleibt unverändert (Wäschesets-Kachel wird inline gebaut, da sie eine eigene Klick-Logik + ggf. Schnellbestellung-Indikator hat).
- Routen, Hooks-Definitionen, andere Seiten.
