import { Kunde, Objekt, WaescheArtikel, WaescheSet, Bestellung, User } from '@/types/database';

// Mock user for development
export const mockUser: User = {
  id: 'user-1',
  kunde_id: 'kunde-1',
  name: 'Hotel Alpenblick',
  email: 'info@hotel-alpenblick.at',
};

export const mockKunde: Kunde = {
  id: 'kunde-1',
  name: 'Hotel Alpenblick',
  email: 'info@hotel-alpenblick.at',
  telefon: '+43 6562 12345',
  adresse: 'Hauptstraße 15, 5730 Mittersill',
  created_at: '2024-01-15T10:00:00Z',
};

export const mockObjekte: Objekt[] = [
  {
    id: 'objekt-1',
    kunde_id: 'kunde-1',
    name: 'Hauptgebäude',
    adresse: 'Hauptstraße 15, 5730 Mittersill',
    anzahl_zimmer: 45,
    notizen: 'Haupteingang bei Rezeption',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'objekt-2',
    kunde_id: 'kunde-1',
    name: 'Nebengebäude Ost',
    adresse: 'Hauptstraße 17, 5730 Mittersill',
    anzahl_zimmer: 20,
    notizen: 'Zugang über Seiteneingang',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'objekt-3',
    kunde_id: 'kunde-1',
    name: 'Wellness-Bereich',
    adresse: 'Hauptstraße 15a, 5730 Mittersill',
    anzahl_zimmer: 8,
    notizen: 'Spezielle Handtücher für Spa',
    created_at: '2024-02-01T10:00:00Z',
  },
];

export const mockArtikel: WaescheArtikel[] = [
  { id: 'art-1', name: 'Bettlaken 140x200', kategorie: 'Bettwäsche', preis_pro_stueck: 2.50 },
  { id: 'art-2', name: 'Bettlaken 180x200', kategorie: 'Bettwäsche', preis_pro_stueck: 3.00 },
  { id: 'art-3', name: 'Bettbezug 140x200', kategorie: 'Bettwäsche', preis_pro_stueck: 3.50 },
  { id: 'art-4', name: 'Bettbezug 180x200', kategorie: 'Bettwäsche', preis_pro_stueck: 4.00 },
  { id: 'art-5', name: 'Kissenbezug 80x80', kategorie: 'Bettwäsche', preis_pro_stueck: 1.50 },
  { id: 'art-6', name: 'Handtuch 50x100', kategorie: 'Handtücher', preis_pro_stueck: 1.00 },
  { id: 'art-7', name: 'Duschtuch 70x140', kategorie: 'Handtücher', preis_pro_stueck: 1.50 },
  { id: 'art-8', name: 'Bademantel', kategorie: 'Bademäntel', preis_pro_stueck: 5.00 },
  { id: 'art-9', name: 'Tischdecke rund', kategorie: 'Tischwäsche', preis_pro_stueck: 4.00 },
  { id: 'art-10', name: 'Serviette', kategorie: 'Tischwäsche', preis_pro_stueck: 0.50 },
];

export const mockWaescheSets: WaescheSet[] = [
  {
    id: 'set-1',
    kunde_id: 'kunde-1',
    name: 'Standard Einzelzimmer',
    beschreibung: 'Komplettes Set für Einzelzimmer',
    artikel: [
      { artikel_id: 'art-1', artikel_name: 'Bettlaken 140x200', menge: 1 },
      { artikel_id: 'art-3', artikel_name: 'Bettbezug 140x200', menge: 1 },
      { artikel_id: 'art-5', artikel_name: 'Kissenbezug 80x80', menge: 1 },
      { artikel_id: 'art-6', artikel_name: 'Handtuch 50x100', menge: 2 },
      { artikel_id: 'art-7', artikel_name: 'Duschtuch 70x140', menge: 1 },
    ],
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'set-2',
    kunde_id: 'kunde-1',
    name: 'Standard Doppelzimmer',
    beschreibung: 'Komplettes Set für Doppelzimmer',
    artikel: [
      { artikel_id: 'art-2', artikel_name: 'Bettlaken 180x200', menge: 1 },
      { artikel_id: 'art-4', artikel_name: 'Bettbezug 180x200', menge: 1 },
      { artikel_id: 'art-5', artikel_name: 'Kissenbezug 80x80', menge: 2 },
      { artikel_id: 'art-6', artikel_name: 'Handtuch 50x100', menge: 4 },
      { artikel_id: 'art-7', artikel_name: 'Duschtuch 70x140', menge: 2 },
    ],
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'set-3',
    kunde_id: 'kunde-1',
    name: 'Wellness Suite',
    beschreibung: 'Premium Set mit Bademantel',
    artikel: [
      { artikel_id: 'art-2', artikel_name: 'Bettlaken 180x200', menge: 1 },
      { artikel_id: 'art-4', artikel_name: 'Bettbezug 180x200', menge: 1 },
      { artikel_id: 'art-5', artikel_name: 'Kissenbezug 80x80', menge: 4 },
      { artikel_id: 'art-6', artikel_name: 'Handtuch 50x100', menge: 6 },
      { artikel_id: 'art-7', artikel_name: 'Duschtuch 70x140', menge: 4 },
      { artikel_id: 'art-8', artikel_name: 'Bademantel', menge: 2 },
    ],
    created_at: '2024-02-01T10:00:00Z',
  },
];

export const mockBestellungen: Bestellung[] = [
  {
    id: 'best-1',
    kunde_id: 'kunde-1',
    objekt_id: 'objekt-1',
    objekt_name: 'Hauptgebäude',
    status: 'geliefert',
    positionen: [
      { artikel_id: 'art-1', artikel_name: 'Bettlaken 140x200', menge: 20, preis: 50.00 },
      { artikel_id: 'art-3', artikel_name: 'Bettbezug 140x200', menge: 20, preis: 70.00 },
      { artikel_id: 'art-5', artikel_name: 'Kissenbezug 80x80', menge: 40, preis: 60.00 },
    ],
    lieferdatum: '2024-11-28',
    abholdatum: '2024-11-25',
    created_at: '2024-11-24T08:00:00Z',
    updated_at: '2024-11-28T14:00:00Z',
  },
  {
    id: 'best-2',
    kunde_id: 'kunde-1',
    objekt_id: 'objekt-2',
    objekt_name: 'Nebengebäude Ost',
    status: 'bereit',
    positionen: [
      { artikel_id: 'art-6', artikel_name: 'Handtuch 50x100', menge: 50, preis: 50.00 },
      { artikel_id: 'art-7', artikel_name: 'Duschtuch 70x140', menge: 30, preis: 45.00 },
    ],
    lieferdatum: '2024-12-08',
    abholdatum: '2024-12-05',
    created_at: '2024-12-04T09:00:00Z',
    updated_at: '2024-12-07T11:00:00Z',
  },
  {
    id: 'best-3',
    kunde_id: 'kunde-1',
    objekt_id: 'objekt-1',
    objekt_name: 'Hauptgebäude',
    status: 'in_waescherei',
    positionen: [
      { artikel_id: 'art-2', artikel_name: 'Bettlaken 180x200', menge: 15, preis: 45.00 },
      { artikel_id: 'art-4', artikel_name: 'Bettbezug 180x200', menge: 15, preis: 60.00 },
      { artikel_id: 'art-8', artikel_name: 'Bademantel', menge: 10, preis: 50.00 },
    ],
    lieferdatum: '2024-12-10',
    abholdatum: '2024-12-06',
    notizen: 'Dringend für Wochenende',
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-06T16:00:00Z',
  },
  {
    id: 'best-4',
    kunde_id: 'kunde-1',
    objekt_id: 'objekt-3',
    objekt_name: 'Wellness-Bereich',
    status: 'in_bearbeitung',
    positionen: [
      { artikel_id: 'art-6', artikel_name: 'Handtuch 50x100', menge: 30, preis: 30.00 },
      { artikel_id: 'art-8', artikel_name: 'Bademantel', menge: 8, preis: 40.00 },
    ],
    abholdatum: '2024-12-07',
    created_at: '2024-12-06T14:00:00Z',
    updated_at: '2024-12-06T14:00:00Z',
  },
  {
    id: 'best-5',
    kunde_id: 'kunde-1',
    objekt_id: 'objekt-1',
    objekt_name: 'Hauptgebäude',
    status: 'ausstehend',
    positionen: [
      { artikel_id: 'art-9', artikel_name: 'Tischdecke rund', menge: 20, preis: 80.00 },
      { artikel_id: 'art-10', artikel_name: 'Serviette', menge: 100, preis: 50.00 },
    ],
    notizen: 'Für Weihnachtsfeier am 24.12.',
    created_at: '2024-12-07T08:00:00Z',
    updated_at: '2024-12-07T08:00:00Z',
  },
];
