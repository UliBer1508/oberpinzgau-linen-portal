// Datenmigration: alte DB -> neue Ziel-DB (Wäscheportal Oberpinzgau)
// RLS ist in der Ziel-DB deaktiviert, daher reicht der Anon-Key.
import { createClient } from '@supabase/supabase-js';

const TARGET_URL = 'https://pkpnowevagxmhyqlawng.supabase.co';
const TARGET_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY';

const sb = createClient(TARGET_URL, TARGET_KEY);

const data = {
  kunden: [
    {
      id: 'bcdf0e0e-97fe-42b4-846a-b30ba578104a',
      auth_user_id: null, // wird nach Neuregistrierung manuell verknüpft
      kundennummer: 'K20260509113746124',
      name: 'Uli Berresheim',
      vorname: 'Uli',
      nachname: 'Berresheim',
      email: 'uli.berresheim@hotmail.de',
      bestellmodus: 'mit_buchung',
      aktiv: true,
    },
  ],
  objekte: [
    {
      id: '9f4afb1d-8806-4bf4-9b8c-a57c21c8333c',
      kunde_id: 'bcdf0e0e-97fe-42b4-846a-b30ba578104a',
      objektnummer: 'O20260509115021751',
      name: 'Exklusives Chalet mit Gletcherblick',
      typ: 'ferienhaus',
      strasse: 'Venediegersiedlung 316',
      plz: '5741',
      ort: 'Neukirchen am Großvenediger',
      ansprechpartner: 'Uli',
      telefon: '+491713020406',
      bild_url:
        'https://uzworhojxcxbtsbttstp.supabase.co/storage/v1/object/public/objekt-bilder/bcdf0e0e-97fe-42b4-846a-b30ba578104a/9f4afb1d-8806-4bf4-9b8c-a57c21c8333c-1778328660720.jpeg',
      aktiv: true,
    },
  ],
  waescheartikel: [
    { id: 'dad732b3-8f06-4638-82bb-7d964b1a0813', artikelnummer: 'A001', name: 'Bettlaken 90x200', kategorie: 'Bettwäsche', farbe: 'Weiß', preis: 3.5, aktiv: true },
    { id: 'ef7a5d6b-52af-4597-bdf2-7a115b844952', artikelnummer: 'A002', name: 'Bettlaken 180x200', kategorie: 'Bettwäsche', farbe: 'Weiß', preis: 4.5, aktiv: true },
    { id: '3cf93352-864e-4fdb-b8ce-0556dbafab34', artikelnummer: 'A003', name: 'Bettbezug 135x200', kategorie: 'Bettwäsche', farbe: 'Weiß', preis: 5, aktiv: true },
    { id: 'af98853d-e128-4991-82b5-a0c6ae669832', artikelnummer: 'A004', name: 'Bettbezug 200x200', kategorie: 'Bettwäsche', farbe: 'Weiß', preis: 6, aktiv: true },
    { id: 'dcf3a45a-b764-4908-b539-f6c1944dc13e', artikelnummer: 'A005', name: 'Kissenbezug 80x80', kategorie: 'Bettwäsche', farbe: 'Weiß', preis: 1.5, aktiv: true },
    { id: '884d00c2-c785-41fb-9d64-78fd01ebd188', artikelnummer: 'A101', name: 'Handtuch 50x100', kategorie: 'Handtücher', farbe: 'Weiß', preis: 2, aktiv: true },
    { id: '09245356-887b-47d5-a3ba-3bc7a8bf84dc', artikelnummer: 'A102', name: 'Duschtuch 70x140', kategorie: 'Handtücher', farbe: 'Weiß', preis: 3.5, aktiv: true },
    { id: '71df1932-a9a6-459e-b28c-be3fa178b4ed', artikelnummer: 'A103', name: 'Badetuch 100x150', kategorie: 'Handtücher', farbe: 'Weiß', preis: 4.5, aktiv: true },
    { id: '314e852d-1445-48aa-a059-e4f1f2a81f28', artikelnummer: 'A104', name: 'Gästetuch 30x50', kategorie: 'Handtücher', farbe: 'Weiß', preis: 1, aktiv: true },
    { id: 'fba26fcb-6b85-4573-bc3f-0769f54725c9', artikelnummer: 'A201', name: 'Geschirrtuch', kategorie: 'Küche', farbe: 'Weiß gestreift', preis: 1.2, aktiv: true },
    { id: '81021d23-6034-419a-8631-3b08fa8c0912', artikelnummer: 'A202', name: 'Tischdecke 130x180', kategorie: 'Küche', farbe: 'Weiß', preis: 5, aktiv: true },
    { id: '214ca1e4-e264-4e6d-8a85-c9b40c5db9bb', artikelnummer: 'A203', name: 'Servietten Set', kategorie: 'Küche', farbe: 'Bunt', preis: 3, aktiv: true },
  ],
};

async function upsert(table: string, rows: any[]) {
  if (!rows.length) return;
  const { error, count } = await sb.from(table).upsert(rows, { onConflict: 'id', count: 'exact' });
  if (error) {
    console.error(`❌ ${table}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${table}: ${rows.length} Zeilen upserted (count: ${count ?? '?'})`);
}

async function main() {
  // Vor-Check: existieren Tabellen in Ziel-DB?
  const { error: pingErr } = await sb.from('kunden').select('id').limit(1);
  if (pingErr) {
    console.error('Ziel-DB nicht erreichbar oder Tabelle kunden fehlt:', pingErr.message);
    process.exit(1);
  }

  await upsert('kunden', data.kunden);
  await upsert('objekte', data.objekte);
  await upsert('waescheartikel', data.waescheartikel);

  // Counts in Ziel-DB
  for (const t of ['kunden', 'objekte', 'waescheartikel']) {
    const { count } = await sb.from(t).select('*', { count: 'exact', head: true });
    console.log(`Ziel-DB ${t}: ${count}`);
  }
}

main();
