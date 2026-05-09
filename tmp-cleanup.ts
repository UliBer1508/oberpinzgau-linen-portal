import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://pkpnowevagxmhyqlawng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY'
);

const DUP = 'bcdf0e0e-97fe-42b4-846a-b30ba578104a';
const KEEP = 'fe41904f-430e-4b67-a468-1a9ed2b3e042';

// Re-link objekte
const r1 = await sb.from('objekte').update({ kunde_id: KEEP }).eq('kunde_id', DUP).select('id');
console.log('objekte umgehängt:', r1.data?.length, r1.error?.message);

// Re-link bestellungen / rechnungen falls vorhanden
for (const t of ['waeschebestellungen', 'rechnungen']) {
  const r = await sb.from(t).update({ kunde_id: KEEP }).eq('kunde_id', DUP).select('id');
  console.log(`${t} umgehängt:`, r.data?.length, r.error?.message);
}

// Duplikat löschen
const r2 = await sb.from('kunden').delete().eq('id', DUP);
console.log('Duplikat gelöscht:', r2.error?.message ?? 'ok');

const { data: rest } = await sb.from('kunden').select('id,name,email');
console.log('Verbleibende Kunden:', rest);
