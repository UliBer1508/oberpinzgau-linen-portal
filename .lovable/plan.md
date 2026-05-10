## Ziel

Die Bestellungen-Liste in der mobilen Ansicht soll wie die StatCards im Bereich „Übersicht" gestaltet werden — als eigenständige, klickbare Karten mit sichtbarem Rand. Zusätzlich erhalten alle Karten (Übersicht + Bestellungen) einen deutlicheren Rand.

## Umsetzung

### 1. Sichtbarer Rand für alle Karten
- In `src/components/cards/StatCard.tsx`: `border-border/60` → `border-border` (volle Deckkraft, klar sichtbar).
- Gleiche Anpassung für die neuen Bestellung-Karten.

### 2. Bestellungen mobile: Karten statt Listen-Zeilen
In `src/pages/Dashboard.tsx`, mobiler Block (`md:hidden`):
- Container nicht mehr als zusammenhängende Liste mit `divide-y` in einem gemeinsamen Rahmen, sondern als **Grid mit einzelnen Karten** (`grid grid-cols-1 gap-3` — eine Karte pro Zeile auf 390px).
- Den umschließenden `rounded-2xl border bg-card`-Wrapper für die Mobile-Variante entfernen, damit jede Karte ihren eigenen Rand bekommt (Desktop-Tabelle behält ihren Wrapper).

Jede Bestell-Karte:
- `<button>` (volle Breite, klickbar) mit:
  - `rounded-2xl border border-border bg-card p-4 shadow-card`
  - `transition-all hover:shadow-soft active:scale-[0.99]`
  - Status-Hintergrundtönung über bestehende `getBestellungRowClassName`-Logik (z. B. `bg-status-pending/10`) — wird zusätzlich zur Border angewendet.
- Inhalt zweizeilig wie bisher:
  - Zeile 1: `#Bestellnummer` (mono, primary) ←→ `StatusBadge`
  - Zeile 2: Objekt-Name mit Building-Icon ←→ Rechnungsnummer-Chip oder „Keine Rg."

### 3. Empty-State (mobil)
- Bleibt als einzelne zentrierte Karte mit gleichem Border-Stil.

### 4. Nicht betroffen
- Desktop-Tabelle (`hidden md:block`) bleibt unverändert.
- Rechnungen-Bereich bleibt unverändert (kann in einem Folgeschritt angeglichen werden, falls gewünscht).
- Keine Änderungen an Datenlogik, Routing oder Backend.

## Visuelles Ergebnis (mobil)

```text
┌─────────────────────────────────┐
│ #B17783...      [Neu]           │
│ 🏢 Exklusives Chalet  Keine Rg. │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ #B0002          [Neu]           │
│ 🏢 Chalet Wald        Keine Rg. │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ #B0001          [Ausgeliefert]  │
│ 🏢 Chalet Wald      R2025-0001  │
└─────────────────────────────────┘
```

Jede Karte: eigener sichtbarer Rand, Status-Tönung, klickbar → `/bestellungen/:id`.
