// Externer Supabase-Client für die gemeinsam genutzte Datenbank
// (Wäscheportal Oberpinzgau / Teuni-Management-App).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://pkpnowevagxmhyqlawng.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'sb-pkpnowev-auth',
  },
});
