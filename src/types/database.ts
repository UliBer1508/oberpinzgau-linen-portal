// Database types for the customer portal
// These will be replaced with actual Supabase types when connected

export interface Kunde {
  id: string;
  name: string;
  email: string;
  telefon?: string;
  adresse?: string;
  created_at: string;
}

export interface Objekt {
  id: string;
  kunde_id: string;
  name: string;
  adresse: string;
  anzahl_zimmer?: number;
  notizen?: string;
  created_at: string;
}

export interface WaescheArtikel {
  id: string;
  name: string;
  kategorie: string;
  beschreibung?: string;
  preis_pro_stueck?: number;
}

export interface WaescheSet {
  id: string;
  kunde_id: string;
  name: string;
  beschreibung?: string;
  artikel: WaescheSetArtikel[];
  created_at: string;
}

export interface WaescheSetArtikel {
  artikel_id: string;
  artikel_name: string;
  menge: number;
}

export type BestellungStatus = 
  | 'ausstehend' 
  | 'in_bearbeitung' 
  | 'in_waescherei' 
  | 'bereit' 
  | 'geliefert';

export interface Bestellung {
  id: string;
  kunde_id: string;
  objekt_id: string;
  objekt_name: string;
  status: BestellungStatus;
  positionen: BestellungPosition[];
  lieferdatum?: string;
  abholdatum?: string;
  notizen?: string;
  created_at: string;
  updated_at: string;
}

export interface BestellungPosition {
  artikel_id: string;
  artikel_name: string;
  menge: number;
  preis?: number;
}

export interface User {
  id: string;
  kunde_id: string;
  name: string;
  email: string;
}
