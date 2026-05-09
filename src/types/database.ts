// Domain types for the customer portal

export type BestellungStatus =
  | 'neu'
  | 'in_bearbeitung'
  | 'ausgeliefert'
  | 'abgeholt'
  | 'abgeschlossen'
  | 'storniert';

export type BestellModus = 'mit_buchung' | 'nur_sets';
export type BestellArt = 'lieferung' | 'abholung' | 'beides';
export type BerechnungsArt = 'pro_buchung' | 'pro_gast';
export type ObjektTyp = 'ferienwohnung' | 'ferienhaus' | 'hotel' | 'pension' | 'sonstige';
export type RechnungStatus = 'offen' | 'bezahlt' | 'storniert' | 'mahnung';
export type BezahlStatus = 'offen' | 'bezahlt' | 'fehlgeschlagen';
export type ZahlungMethode = 'card' | 'paypal' | 'sepa';
export type ZahlungStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Kunde {
  id: string;
  auth_user_id: string | null;
  kundennummer: string;
  name: string;
  vorname: string | null;
  nachname: string | null;
  firma: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  telefon: string | null;
  mobil: string | null;
  email: string | null;
  geburtsdatum: string | null;
  iban: string | null;
  bic: string | null;
  kontoinhaber: string | null;
  stripe_customer_id: string | null;
  agb_akzeptiert_am: string | null;
  anlieferadresse: string | null;
  bestellmodus: BestellModus;
  bestellart: BestellArt | null;
  notizen: string | null;
  aktiv: boolean;
  created_at: string;
  updated_at: string;
}

export interface Objekt {
  id: string;
  kunde_id: string;
  objektnummer: string;
  name: string;
  typ: ObjektTyp;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  ansprechpartner: string | null;
  telefon: string | null;
  notizen: string | null;
  aktiv: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaescheArtikel {
  id: string;
  artikelnummer: string;
  name: string;
  bezeichnung: string | null;
  groesse: string | null;
  kategorie: string | null;
  farbe: string | null;
  preis: number | null;
  bild_url: string | null;
  aktiv: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaescheSet {
  id: string;
  objekt_id: string;
  name: string;
  beschreibung: string | null;
  aktiv: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaescheSetArtikel {
  id: string;
  set_id: string;
  artikel_id: string;
  menge: number;
  berechnungsart: BerechnungsArt;
}

export interface Bestellung {
  id: string;
  bestellnummer: string;
  kunde_id: string;
  objekt_id: string | null;
  waeschekraft_id: string | null;
  status: BestellungStatus;
  bezahlstatus: BezahlStatus;
  zahlung_id: string | null;
  gastname: string | null;
  check_in: string | null;
  check_out: string | null;
  anzahl_personen: number | null;
  lieferdatum: string | null;
  lieferzeit: string | null;
  abholdatum: string | null;
  abholzeit: string | null;
  prioritaet: number | null;
  reihenfolge: number | null;
  bearbeitung_deadline: string | null;
  bearbeitung_notizen: string | null;
  notizen: string | null;
  created_at: string;
  updated_at: string;
}

export interface BestellungPosition {
  id: string;
  bestellung_id: string;
  artikel_id: string;
  menge: number;
  notizen: string | null;
}

export interface Rechnung {
  id: string;
  rechnungsnummer: string;
  bestellung_id: string;
  kunde_id: string;
  kunde_kundennummer: string | null;
  kunde_name: string;
  kunde_firma: string | null;
  kunde_strasse: string | null;
  kunde_plz: string | null;
  kunde_ort: string | null;
  rechnungsdatum: string;
  faelligkeitsdatum: string | null;
  nettobetrag: number;
  mwst_satz: number;
  mwst_betrag: number;
  bruttobetrag: number;
  bearbeitungsgebuehr: number;
  status: RechnungStatus;
  bezahlt_am: string | null;
  notizen: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rechnungsposition {
  id: string;
  rechnung_id: string;
  artikelnummer: string;
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number;
}

export interface Rechnungseinstellungen {
  id: string;
  mwst_satz: number;
  bearbeitungsgebuehr: number;
  firma_name: string | null;
  firma_bezeichnung: string | null;
  firma_strasse: string | null;
  firma_plz: string | null;
  firma_ort: string | null;
  firma_telefon: string | null;
  firma_email: string | null;
  updated_at: string;
}

export interface Zahlung {
  id: string;
  bestellung_id: string | null;
  rechnung_id: string | null;
  kunde_id: string;
  betrag: number;
  waehrung: string;
  methode: ZahlungMethode | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  status: ZahlungStatus;
  bezahlt_am: string | null;
  created_at: string;
}

export interface RechnungMitPositionen extends Rechnung {
  positionen: Rechnungsposition[];
}

export interface WaescheSetMitArtikel extends WaescheSet {
  objekt?: Objekt;
  artikel: (WaescheSetArtikel & { waescheartikel: WaescheArtikel })[];
}

export interface BestellungMitDetails extends Bestellung {
  objekt: Objekt | null;
  positionen: (BestellungPosition & { waescheartikel: WaescheArtikel })[];
  rechnung?: Rechnung | null;
}
