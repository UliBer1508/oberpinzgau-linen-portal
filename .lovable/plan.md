## Ziel
Bild-Upload für Objekte aktivieren, ohne dass du selbst ins Supabase-Dashboard musst.

## Hintergrund
- Diese App greift korrekt auf `pkpnowevagxmhyqlawng` zu.
- Diese DB ist die Lovable-Cloud-DB des Schwesterprojekts **[Wäscheportal Oberpinzgau](/projects/086b820c-9429-4988-a934-6dd2f552a811)**.
- Migrationen auf dieser DB müssen über das Schwesterprojekt laufen — dort führt Lovable das SQL automatisch aus.

## Schritt 1 — Im Schwesterprojekt anstoßen (du)
Öffne **[Wäscheportal Oberpinzgau](/projects/086b820c-9429-4988-a934-6dd2f552a811)** und sende dort diese Nachricht:

> Bitte folgende Migration ausführen, damit Objekt-Bilder hochgeladen werden können:
>
> ```sql
> ALTER TABLE public.objekte ADD COLUMN IF NOT EXISTS bild_url text;
>
> INSERT INTO storage.buckets (id, name, public)
> VALUES ('objekt-bilder', 'objekt-bilder', true)
> ON CONFLICT (id) DO NOTHING;
>
> CREATE POLICY "Objekt-Bilder oeffentlich lesen"
> ON storage.objects FOR SELECT
> USING (bucket_id = 'objekt-bilder');
>
> CREATE POLICY "Objekt-Bilder hochladen"
> ON storage.objects FOR INSERT
> WITH CHECK (bucket_id = 'objekt-bilder' AND auth.uid() IS NOT NULL);
>
> CREATE POLICY "Objekt-Bilder aktualisieren"
> ON storage.objects FOR UPDATE
> USING (bucket_id = 'objekt-bilder' AND auth.uid() IS NOT NULL);
>
> CREATE POLICY "Objekt-Bilder loeschen"
> ON storage.objects FOR DELETE
> USING (bucket_id = 'objekt-bilder' AND auth.uid() IS NOT NULL);
> ```

Lovable dort wird die Migration vorschlagen — du musst nur „Approve" klicken.

## Schritt 2 — Verifikation hier (ich)
Sobald die Migration durch ist, prüfe ich von hier per Test-Upload:
- Bucket `objekt-bilder` vorhanden ✓
- Test-Bild lässt sich hochladen ✓
- `bild_url` in `objekte` schreibbar ✓

## Schritt 3 — Code anpassen
- `src/integrations/external/types.ts` um `bild_url: string | null` auf `objekte` ergänzen, damit TypeScript zufrieden ist.
- `tmp-check.ts` löschen.

## Alternative falls du das nicht willst
Bild-Upload in dieser App vorerst ausblenden (Kamera-Icon weg, Platzhalter), bis die Migration läuft.