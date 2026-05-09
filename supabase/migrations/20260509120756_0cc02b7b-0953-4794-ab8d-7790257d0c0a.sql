
ALTER TABLE public.objekte ADD COLUMN IF NOT EXISTS bild_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('objekt-bilder', 'objekt-bilder', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Objekt-Bilder oeffentlich lesen"
ON storage.objects FOR SELECT
USING (bucket_id = 'objekt-bilder');

CREATE POLICY "Objekt-Bilder hochladen"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'objekt-bilder');

CREATE POLICY "Objekt-Bilder aktualisieren"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'objekt-bilder');

CREATE POLICY "Objekt-Bilder loeschen"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'objekt-bilder');
