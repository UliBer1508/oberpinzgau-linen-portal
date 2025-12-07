import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pkpnowevagxmhyqlawng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Type definitions
export type BestellungStatus = 
  | 'ausstehend' 
  | 'in_bearbeitung' 
  | 'in_waescherei' 
  | 'bereit' 
  | 'geliefert';

export interface Kunde {
  id: string;
  name: string;
  email: string;
  telefon: string | null;
  adresse: string | null;
  created_at: string;
}

export interface Objekt {
  id: string;
  kunde_id: string;
  name: string;
  adresse: string;
  anzahl_zimmer: number | null;
  notizen: string | null;
  created_at: string;
}

export interface WaescheArtikel {
  id: string;
  name: string;
  kategorie: string;
  beschreibung: string | null;
  preis_pro_stueck: number | null;
}

export interface WaescheSet {
  id: string;
  kunde_id: string;
  name: string;
  beschreibung: string | null;
  created_at: string;
}

export interface WaescheSetArtikel {
  id: string;
  set_id: string;
  artikel_id: string;
  menge: number;
}

export interface Bestellung {
  id: string;
  kunde_id: string;
  objekt_id: string;
  status: BestellungStatus;
  lieferdatum: string | null;
  abholdatum: string | null;
  notizen: string | null;
  created_at: string;
  updated_at: string;
}

export interface BestellungPosition {
  id: string;
  bestellung_id: string;
  artikel_id: string;
  menge: number;
  preis: number | null;
}

// Extended types with relations
export interface WaescheSetMitArtikel extends WaescheSet {
  artikel: (WaescheSetArtikel & { waescheartikel: WaescheArtikel })[];
}

export interface BestellungMitDetails extends Bestellung {
  objekt: Objekt;
  positionen: (BestellungPosition & { waescheartikel: WaescheArtikel })[];
}
