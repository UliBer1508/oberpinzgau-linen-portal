# Schnellbestellung pro Objekt

## Ziel
Kunde sieht auf dem Dashboard pro Objekt einen großen, finger-/daumenfreundlichen Button mit dem Objektbild als Hintergrund. Tippen → Lieferdatum wählen → "Bestellen". Fertig.

## UX-Flow

```text
Dashboard "Schnellbestellung"
  ┌──────────────────┐  ┌──────────────────┐
  │ [Bild Objekt A]  │  │ [Bild Objekt B]  │
  │   Objekt A       │  │   Objekt B       │
  │   Standard-Set ✓ │  │   Standard-Set ✓ │
  └──────────────────┘  └──────────────────┘
         │
         ▼ Tap
  ┌─────────────────────────┐
  │  Bestellen für Objekt A │
  │  Set: "Standard"        │
  │                         │
  │  Lieferdatum:           │
  │  [   Kalender   ]       │
  │                         │
  │  [ Abbrechen ][Bestellen]│
  └─────────────────────────┘
         │
         ▼
  Bestellung erstellt → Toast → bleibt auf Dashboard
```

## Änderungen im Detail

### 1. Datenbank
Neues Feld auf `objekte`:
- `schnellbestellung_set_id uuid NULL` — Verweis auf das Wäscheset, das per Schnellaktion verwendet wird.

Kein FK-Constraint (analog bestehendem Stil), nullable.

### 2. Wäschesets-Verwaltung
In `WaescheSets.tsx` (und/oder `WaescheSetFormDialog`):
- Pro Set ein Schalter/Stern "Als Schnellbestellung für dieses Objekt verwenden".
- Aktivieren setzt `objekte.schnellbestellung_set_id = set.id`.
- Anzeige eines Badges "Schnellbestellung" auf dem aktuell gewählten Set.
- Pro Objekt nur ein Schnellbestellungs-Set.

### 3. Dashboard — neue Sektion "Schnellbestellung"
Ersetzt den bisherigen Block "Schnellaktionen" (Neue Bestellung / Wäschesets verwalten / Objekte anzeigen).

- Grid: `grid-cols-2 lg:grid-cols-3 gap-3`.
- Pro Objekt eine große Kachel (min. Höhe ~160 px mobil, 200 px desktop, `rounded-3xl`):
  - Hintergrund: `objekt.bild_url` (cover, mit dunklem Gradient-Overlay für Lesbarkeit).
  - Vordergrund: Objektname groß, darunter Set-Name in kleiner Schrift.
  - Fallback ohne Bild: kräftiger Farbverlauf + `Building2` Icon.
- Falls Objekt **kein** Schnellbestellungs-Set hat: Kachel zeigt "Set festlegen" und navigiert zu Wäschesets.
- Eine zusätzliche kleine Aktion: "Andere Bestellung" → `/bestellungen/neu` (bestehender Flow bleibt erhalten).

### 4. Schnellbestellungs-Dialog
Neue Komponente `QuickOrderDialog`:
- Öffnet beim Tap auf eine Objekt-Kachel.
- Zeigt: Objektname, gewähltes Set (read-only).
- **Pflichtfeld**: Lieferdatum (shadcn `Calendar` inline, große Touch-Targets, `pointer-events-auto`).
- Zwei große Buttons unten: "Abbrechen" (outline) und "Bestellen" (variant `hero`, full width, `h-14`).
- "Bestellen" ruft `useCreateBestellung` mit:
  - `objekt_id`
  - `lieferdatum`
  - `positionen` aus `waescheset.artikel` (artikel_id + menge wie definiert)
  - andere optionale Felder leer.
- Erfolg: Toast + Dialog schließen + Liste der "Aktuellen Bestellungen" aktualisiert sich automatisch (React Query Invalidation ist vorhanden).

### 5. Dashboard-Aufräumen
- Den bisherigen "Schnellaktionen"-Block entfernen.
- Layout der Top-Sektion bleibt (Stats), aber die rechte Spalte "Schnellaktionen" wird zur "Schnellbestellung" und nimmt mobil/Tablet die volle Breite ein.

## Technische Notizen
- Migration: `ALTER TABLE objekte ADD COLUMN schnellbestellung_set_id uuid NULL`.
- `useObjekte` Hook liefert das Feld automatisch (SELECT *), sonst Anpassung.
- Im Dialog Wäscheset-Daten via bereits vorhandenem `useWaescheSets(kunde.id)` laden und nach `id` filtern.
- Touch-Größen: Buttons mindestens `h-12`, Kacheln voll-tappbar (`<button>` als Wrapper).
- Bilder lazy laden (`loading="lazy"`).

## Außerhalb des Scope
- Keine Änderung am bestehenden mehrstufigen `/bestellungen/neu` Flow (bleibt für komplexere Fälle).
- Keine Änderung an Rechnungen/Status.
