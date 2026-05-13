## Ziel
Auf allen Detail- und Formular-Seiten einen konsistenten Zurück-Button bereitstellen, damit mobile Nutzer nicht immer über die Bottom-Navigation zurück zum Start müssen.

## Analyse
Aktuell haben einige Seiten (z.B. ObjektDetail, BestellungDetail) bereits einen Zurück-Button in `MainLayout` actions, dieser ist aber auf Mobile (390px) klein und rechts im überladenen Header platziert. Seiten wie `NeuesWaescheSet` haben gar keinen Zurück-Button im Header.

## Umsetzung

### 1. MainLayout erweitern (`src/components/layout/MainLayout.tsx`)
- Neuer optionaler Prop: `backTo?: string` (Ziel-Route für Zurück)
- Wenn `backTo` gesetzt, wird links vom Titel im Header ein `ArrowLeft`-Icon-Button gerendert
- Sichtbar nur auf Mobile (`md:hidden`), da Desktop die Sidebar-Navigation hat
- Der Button navigiert mit `navigate(backTo)`

### 2. Bestehende Actions bereinigen
- Auf den Seiten, die `backTo` erhalten, werden die redundanten Zurück-Buttons aus den `actions` entfernt (damit der Header auf Mobile nicht überladen bleibt)

### 3. Alle betroffenen Seiten anpassen
Jede der folgenden Seiten bekommt den `backTo`-Prop an `MainLayout` übergeben:

| Seite | Zurück zu |
|---|---|
| `ObjektDetail` | `/objekte` |
| `BestellungDetail` | `/bestellungen` |
| `RechnungDetail` | `/rechnungen` |
| `NeuesObjekt` | `/objekte` |
| `NeueBestellung` | `/bestellungen` |
| `NeuesWaescheSet` | `/waeschesets` |

## Nicht Teil dieses Plans
- Keine Änderung an der Desktop-Sidebar (die hat genug Navigation)
- Keine Änderung an der BottomNav
- Keine Änderung an der Auth- oder Datenlogik