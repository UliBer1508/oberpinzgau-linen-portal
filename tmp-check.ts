import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://pkpnowevagxmhyqlawng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY'
);

// list buckets
const { data: buckets, error: bErr } = await sb.storage.listBuckets();
console.log('buckets:', buckets, bErr);

// try upload tiny file
const blob = new Blob(['x'], { type: 'image/jpeg' });
const path = `test-${Date.now()}.jpg`;
const { data, error } = await sb.storage.from('objekt-bilder').upload(path, blob, { contentType: 'image/jpeg' });
console.log('upload:', data, error);

// check if column bild_url exists on objekte
const { data: o, error: oe } = await sb.from('objekte').select('id,bild_url').limit(1);
console.log('objekte bild_url:', o, oe?.message);
