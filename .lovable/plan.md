## Ziel

Die Section-Header von **Übersicht**, **Bestellungen** und **Rechnungen** auf dem Dashboard sollen prominenter, klar abgegrenzt und vor allem touchfreundlicher werden. Aktuell sind sie schlanke Text-Trigger (h-10) mit kleinen Chips daneben – auf Mobile schwer zu treffen und visuell unauffällig.

## Konzept

### 1. Header als eigene „Section-Karte"
Jeder Section-Header wird selbst zu einer abgesetzten Karte mit Rand und Schatten – kein nackter Textlink mehr.

```text
┌─────────────────────────────────────────────┐
│ [Icon]  Bestellungen        ⌄               │  ← großer Touch-Bereich
│         3 aktiv                             │
│                                             │
│  [2 Neu] [0 Bearb.] [1 Ausgel.]    Alle →   │  ← Chips + CTA
└─────────────────────────────────────────────┘
```

### 2. Trigger-Größe & Touch
- **Höhe**: `min-h-14` (56 px) statt `h-10` – Apple HIG / Material empfehlen mind. 44–48 px Touch-Targets.
- **Trigger umfasst die ganze Karte** (Icon + Titel + Subtitle + Chevron) – chips/„Alle →" bleiben außerhalb des Triggers, damit sie eigene Aktionen auslösen.
- **Größeres Icon**: `h-10 w-10` Icon-Tile mit farbigem Hintergrund (analog StatCard-Icon) – klare visuelle Verankerung pro Bereich.
- **Größerer Titel**: `text-base font-semibold` (vorher `text-sm font-medium text-muted-foreground`) – als echter Section-Header lesbar.

### 3. Farbige Akzente pro Bereich
- **Übersicht**: Accent (Sparkles)
- **Bestellungen**: Info (ShoppingCart)
- **Rechnungen**: Warning (FileText)

Icon-Tile mit `bg-{color}/15 text-{color} rounded-2xl` – wie die StatCard-Icons.

### 4. Subtitle / Live-Statistik
Direkt unter dem Titel eine kompakte Zusammenfassung, immer sichtbar – auch wenn ausgeklappt. Beispiele:
- Übersicht: „4 Kennzahlen"
- Bestellungen: „3 aktiv"
- Rechnungen: „1 offen · €101,30"

### 5. Chip-Zeile + „Alle →"
- Bei eingeklapptem Zustand erscheinen die Status-Chips eine Zeile **unter** dem Titel (statt rechts daneben). Mehr Platz, größer (`px-3 py-1 text-sm`), keine Wettrennen mit dem Trigger.
- „Alle →" rechtsbündig, als sekundärer Button (`variant="outline" size="sm"`), ebenfalls mit ausreichender Touchfläche (`h-9`).
- Bei ausgeklapptem Zustand: Chips verschwinden (Inhalt sagt schon alles), „Alle →" bleibt.

### 6. Visuelles Layout (Mobile, eingeklappt)

```text
╔═══════════════════════════════════════╗
║ ┌───┐                              ⌄ ║
║ │📊 │  Übersicht                    ║
║ └───┘  4 Kennzahlen                  ║
║                                      ║
║ [3 Best.] [2 Obj.] [3 Sets] [1 Rg.] ║
╚═══════════════════════════════════════╝

╔═══════════════════════════════════════╗
║ ┌───┐                              ⌄ ║
║ │🛒 │  Bestellungen                 ║
║ └───┘  3 aktiv                       ║
║                                      ║
║ [2 Neu] [0 Bearb.] [1 Ausgel.]      ║
║                          [ Alle → ]  ║
╚═══════════════════════════════════════╝
```

### 7. Ausgeklappter Zustand
- Header-Karte bleibt sichtbar.
- Chevron rotiert.
- Chip-Zeile blendet aus (Inhalt darunter zeigt die Details).
- Direkt darunter folgt der bisherige Inhalt (StatCards / Bestell-Karten / Rechnungs-Karten) mit etwas Abstand (`mt-3`).

### 8. Aktive/Hover-States
- `hover:bg-muted/40 active:bg-muted/60 transition-colors` auf dem Trigger-Bereich.
- Schwacher Border-Highlight (`hover:border-primary/30`) für Affordance.
- `shadow-card hover:shadow-soft`.

## Umsetzung

### Neue Komponente: `src/components/dashboard/SectionHeader.tsx`
Wiederverwendbare Header-Karte für alle drei Bereiche:

Props:
```ts
{
  icon: LucideIcon;
  iconVariant: 'accent' | 'info' | 'warning' | 'primary';
  title: string;
  subtitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chips?: Array<{ label: string; count: number; variant: 'pending' | 'processing' | 'ready' | 'delivered' | 'info' | 'primary' | 'accent' | 'warning' | 'success' }>;
  onAllClick?: () => void;
  allLabel?: string; // default "Alle"
}
```

Rendert die komplette Header-Karte inkl. CollapsibleTrigger; der Aufrufer wickelt seine `<CollapsibleContent>` außenrum.

### Anpassung in `src/pages/Dashboard.tsx`
- Drei `<Collapsible>`-Blöcke verwenden den neuen `<SectionHeader />`.
- Bestehender Inhalt (Stat-Grid, Bestell-Karten-Grid, Rechnungs-Karten-Grid) wandert in `<CollapsibleContent>` mit `mt-3`.
- `bestellungen.filter(...)`-Zähler werden als Chip-Daten an den Header übergeben.

### Tokens / Styling
- Icon-Tile-Varianten greifen auf bestehende Semantik-Token zurück (`bg-info/15 text-info` etc.).
- Chip-Varianten ebenfalls aus dem bestehenden Status-Token-System (`bg-status-pending/15 text-status-pending`, …) – kein neues Farb-Token nötig.

## Nicht im Scope
- Inhalts-Karten (StatCards, Bestell-Karten, Rechnungs-Karten) bleiben unverändert.
- Quick-Order-Tiles bleiben unverändert.
- Keine neuen Datenquellen oder Backend-Änderungen.
