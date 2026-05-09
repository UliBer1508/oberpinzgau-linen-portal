# Stats-Bereich ein-/ausklappbar

## Ziel
Die 4 Statistik-Kacheln oben am Dashboard (Aktive Bestellungen, Objekte, Wäschesets, Offene Rechnungen) sollen ein- und ausklappbar sein, um auf dem Handy mehr Platz für Schnellbestellung und Listen zu haben.

## Umsetzung

In `src/pages/Dashboard.tsx`:

- Neuen State `statsOpen` (boolean), Default-Wert in `localStorage` persistieren (`dashboard_stats_open`), damit die Wahl nach Reload erhalten bleibt.
- Über dem Stats-Grid einen kleinen Header-Button einfügen:
  - Links: Label "Übersicht" mit kleinem Icon.
  - Rechts: Chevron (`ChevronDown` / `ChevronUp` aus lucide-react), das je nach State rotiert.
  - Voll klickbar, `h-10`, daumenfreundlich.
- Stats-Grid in eine `Collapsible` Komponente (shadcn) wickeln, sanft ein-/ausblenden (`animate-accordion-down/up` oder einfache Transition).
- Wenn eingeklappt: kompakte Zeile mit den 4 Werten als kleine Pills (z. B. „2 Bestellungen · 2 Objekte · 3 Sets · 1 offene Rg."), damit die wichtigsten Zahlen sichtbar bleiben.

## Außerhalb des Scope
- Keine Änderung an Schnellbestellung, aktuellen Bestellungen oder Rechnungen-Tabellen.
- Keine Datenbank-Änderungen.
