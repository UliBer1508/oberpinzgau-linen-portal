## Ziel
Auf der Detailseite eines Objekts soll ein Foto hochgeladen, angezeigt und ausgetauscht werden können (z.B. Außenansicht der Ferienwohnung).

## Schritte

### 1. Datenbank
- Neue Spalte `bild_url TEXT` in `public.objekte`.
- Neuer Storage-Bucket `objekt-bilder` (public lesbar).
- RLS-Policies auf `storage.objects`:
  - SELECT: alle (öffentlich), damit Bild im `<img>` ladbar ist.
  - INSERT/UPDATE/DELETE: eingeloggter User, Pfad muss mit der eigenen `kunde_id` beginnen (`{kunde_id}/{objekt_id}.jpg`).

### 2. Neue Seite `src/pages/ObjektDetail.tsx`
Ersetzt die aktuelle Notlösung (Route `/objekte/:id` zeigt heute die Listenseite).
- Lädt Objekt per `id` aus Supabase inkl. `bild_url`.
- Layout: Header mit Name/Typ, großes Hero-Bild (oder Platzhalter mit Kamera-Icon).
- Sektionen: Adresse, Ansprechpartner, Telefon, Notizen.
- Aktionen: „Bild hochladen / ändern", „Bild entfernen", „Bearbeiten" (später), „Zurück".

### 3. Bild-Upload-Komponente
- Datei-Input (akzeptiert `image/*`, max. ~5 MB, Vorschau).
- Beim Auswählen: optional clientseitig auf max. 1600px verkleinern (Canvas), als JPEG hochladen nach `objekt-bilder/{kunde_id}/{objekt_id}.jpg` mit `upsert: true`.
- Public URL holen, in `objekte.bild_url` speichern, Query invalidieren.
- Loading-/Fehlerzustände, Toast-Bestätigung.

### 4. Routing & Navigation
- `src/App.tsx`: Route `/objekte/:id` auf neue `ObjektDetail`-Seite zeigen.
- Listen-Klick führt bereits dorthin – keine Änderung nötig.

### 5. Liste optional ergänzen
Kleines Thumbnail in `Objekte.tsx` neben dem Namen, falls `bild_url` vorhanden (rein optisch, kein Pflichtteil).

## Mobile-Hinweise
- Hero-Bild mit `aspect-video object-cover rounded-2xl`.
- Buttons full-width auf `sm:w-auto`.

## Offene Frage
Soll pro Objekt nur **ein** Bild möglich sein, oder eine **Galerie** (mehrere Fotos)? Der Plan oben geht von einem Bild aus, da das schneller zum Ziel führt; eine Galerie wäre eine separate Erweiterung.