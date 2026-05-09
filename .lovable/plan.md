## Ziel
Unter Punkt 3 „Schnellauswahl: Wäscheset" auf der Seite „Neue Bestellung" soll der Kunde Wäschesets direkt **erstellen, ändern und löschen** können – ohne die Seite verlassen zu müssen.

## Aktueller Stand
- Es gibt bereits eine eigene Seite `NeuesWaescheSet` (Erstellen) und eine Übersicht `WaescheSets`.
- Es existiert **kein** Bearbeiten und **kein** Löschen.
- Auf `/bestellungen/neu` werden Sets als Karten angezeigt, aber nur lesend.

## Plan

### 1. Datenbank-Hooks erweitern (`src/hooks/useSupabaseData.ts`)
- `useUpdateWaescheSet` – aktualisiert Name/Beschreibung und ersetzt die Artikelpositionen.
- `useDeleteWaescheSet` – löscht Set inkl. zugehöriger `waescheset_artikel`.
- Beide invalidieren den Query `['waesche_sets', kundeId]`.

### 2. Wiederverwendbares Formular auslagern
- Logik aus `NeuesWaescheSet.tsx` in eine neue Komponente `src/components/waescheset/WaescheSetFormDialog.tsx` extrahieren (Modal mit shadcn `Dialog`).
- Props: `open`, `onClose`, `objektId` (vorbelegt), `setToEdit?` (optional → Bearbeiten-Modus).
- Verhalten:
  - Ohne `setToEdit` → Neu anlegen via `useCreateWaescheSet`.
  - Mit `setToEdit` → Felder vorbefüllen, Speichern via `useUpdateWaescheSet`.
- Bestehende Seite `NeuesWaescheSet` nutzt denselben Dialog/Komponenteninhalt weiter (kein Duplikat).

### 3. Punkt 3 in `NeueBestellung.tsx` umbauen
Innerhalb der Karte „3. Schnellauswahl: Wäscheset":
- **Header-Aktion** rechts: Button „+ Neues Set" – öffnet Dialog im Erstellen-Modus mit dem aktuell gewählten Objekt vorbelegt.
- **Pro Set-Karte** zwei kleine Icon-Buttons oben rechts:
  - ✏️ Bearbeiten → öffnet Dialog im Bearbeiten-Modus.
  - 🗑 Löschen → AlertDialog zur Bestätigung, danach `useDeleteWaescheSet`.
  - Klicks auf die Icons stoppen die Selektion (`stopPropagation`).
- Wenn noch kein Objekt gewählt ist, ist „+ Neues Set" deaktiviert mit Hinweis „Bitte zuerst Objekt wählen".
- Wenn nach Auswahl eines Objekts keine Sets existieren, wird ein freundlicher Empty-State mit „+ Erstes Set anlegen"-Button angezeigt (statt die Karte ganz auszublenden).

### 4. Konsistenz
- Toaster-Meldungen: „Set erstellt", „Set aktualisiert", „Set gelöscht".
- Bei Löschung eines Sets, das gerade im Warenkorb ausgewählt ist (`selectedSetId`), Auswahl zurücksetzen.

## Technische Notizen
- Nur Frontend + 2 neue Hooks – keine Datenbank-Migrationen nötig (Tabelle `waeschesets` und RLS bereits vorhanden, Policies erlauben CRUD für Eigentümer).
- Wiederverwendung des Formulars erfüllt die Memory-Regel „Reuse form logic across portals".
