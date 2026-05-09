import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://pkpnowevagxmhyqlawng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY'
);

for (const t of ['kunden','objekte','waescheartikel','waeschesets','waescheset_artikel','waeschebestellungen','bestellpositionen','rechnungen','rechnungspositionen','rechnungseinstellungen','zahlungen','user_roles','profiles']) {
  const { data, error, count } = await sb.from(t).select('*', { count: 'exact' }).limit(1);
  if (error) { console.log(`❌ ${t}: ${error.message}`); continue; }
  console.log(`✓ ${t} (${count} Zeilen) cols:`, data?.[0] ? Object.keys(data[0]).join(',') : '(leer)');
}
