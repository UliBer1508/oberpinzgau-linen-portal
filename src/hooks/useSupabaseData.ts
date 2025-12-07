import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  supabase, 
  Kunde, 
  Objekt, 
  WaescheArtikel, 
  WaescheSetMitArtikel, 
  BestellungMitDetails,
  BestellungStatus,
  Rechnung,
  RechnungMitPositionen
} from '@/integrations/supabase/client';
import { useKundeContext } from '@/contexts/KundeContext';

// Alle Kunden für die Auswahl (Entwicklung)
export function useAlleKunden() {
  return useQuery({
    queryKey: ['alle_kunden'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kunden')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Kunde[];
    },
  });
}

// Ausgewählter Kunde
export function useKunde() {
  const { selectedKundeId } = useKundeContext();
  
  return useQuery({
    queryKey: ['kunde', selectedKundeId],
    queryFn: async () => {
      if (!selectedKundeId) return null;
      
      const { data, error } = await supabase
        .from('kunden')
        .select('*')
        .eq('id', selectedKundeId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Kunde | null;
    },
    enabled: !!selectedKundeId,
  });
}

// Fetch objects for customer
export function useObjekte(kundeId: string | undefined) {
  return useQuery({
    queryKey: ['objekte', kundeId],
    queryFn: async () => {
      if (!kundeId) return [];
      
      const { data, error } = await supabase
        .from('objekte')
        .select('*')
        .eq('kunde_id', kundeId)
        .order('name');
      
      if (error) throw error;
      return data as Objekt[];
    },
    enabled: !!kundeId,
  });
}

// Fetch all laundry articles
export function useWaescheArtikel() {
  return useQuery({
    queryKey: ['waesche_artikel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waescheartikel')
        .select('*')
        .eq('aktiv', true)
        .order('kategorie, name');
      
      if (error) throw error;
      return data as WaescheArtikel[];
    },
  });
}

// Fetch laundry sets with articles for customer (via objekte)
export function useWaescheSets(kundeId: string | undefined) {
  return useQuery({
    queryKey: ['waesche_sets', kundeId],
    queryFn: async () => {
      if (!kundeId) return [];
      
      // First get objekt IDs for this customer
      const { data: objekte, error: objekteError } = await supabase
        .from('objekte')
        .select('id')
        .eq('kunde_id', kundeId);
      
      if (objekteError) throw objekteError;
      if (!objekte || objekte.length === 0) return [];
      
      const objektIds = objekte.map(o => o.id);
      
      // Then get sets for these objects
      const { data, error } = await supabase
        .from('waeschesets')
        .select(`
          *,
          objekt:objekte(*),
          artikel:waescheset_artikel(
            *,
            waescheartikel(*)
          )
        `)
        .in('objekt_id', objektIds)
        .eq('aktiv', true)
        .order('name');
      
      if (error) throw error;
      return data as WaescheSetMitArtikel[];
    },
    enabled: !!kundeId,
  });
}

// Fetch orders with details for customer
export function useBestellungen(kundeId: string | undefined) {
  return useQuery({
    queryKey: ['bestellungen', kundeId],
    queryFn: async () => {
      if (!kundeId) return [];
      
      const { data, error } = await supabase
        .from('waeschebestellungen')
        .select(`
          *,
          objekt:objekte(*),
          positionen:bestellpositionen(
            *,
            waescheartikel(*)
          )
        `)
        .eq('kunde_id', kundeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BestellungMitDetails[];
    },
    enabled: !!kundeId,
  });
}

// Fetch single order with details
export function useBestellung(bestellungId: string | undefined) {
  return useQuery({
    queryKey: ['bestellung', bestellungId],
    queryFn: async () => {
      if (!bestellungId) return null;
      
      const { data, error } = await supabase
        .from('waeschebestellungen')
        .select(`
          *,
          objekt:objekte(*),
          positionen:bestellpositionen(
            *,
            waescheartikel(*)
          )
        `)
        .eq('id', bestellungId)
        .maybeSingle();
      
      if (error) throw error;
      return data as BestellungMitDetails | null;
    },
    enabled: !!bestellungId,
  });
}

// Create new order
export function useCreateBestellung() {
  const queryClient = useQueryClient();
  const { selectedKundeId } = useKundeContext();
  
  return useMutation({
    mutationFn: async (params: {
      objekt_id: string;
      lieferdatum?: string | null;
      notizen?: string | null;
      positionen: { artikel_id: string; menge: number }[];
    }) => {
      if (!selectedKundeId) throw new Error('Kein Kunde ausgewählt');
      
      // Generate bestellnummer
      const bestellnummer = `B${Date.now()}`;
      
      // Create order
      const { data: bestellung, error: bestellungError } = await supabase
        .from('waeschebestellungen')
        .insert({
          bestellnummer,
          kunde_id: selectedKundeId,
          objekt_id: params.objekt_id,
          lieferdatum: params.lieferdatum,
          notizen: params.notizen,
          status: 'neu' as BestellungStatus,
        })
        .select()
        .single();
      
      if (bestellungError) throw bestellungError;
      
      // Create order positions (no einzelpreis in database)
      const positionen = params.positionen.map(p => ({
        bestellung_id: bestellung.id,
        artikel_id: p.artikel_id,
        menge: p.menge,
      }));
      
      const { error: positionenError } = await supabase
        .from('bestellpositionen')
        .insert(positionen);
      
      if (positionenError) throw positionenError;
      
      return bestellung;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestellungen'] });
    },
  });
}

// Create new laundry set
export function useCreateWaescheSet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      objektId: string;
      name: string;
      beschreibung?: string;
      artikel: { artikelId: string; menge: number; berechnungsart?: 'pro_buchung' | 'pro_gast' }[];
    }) => {
      // Create set with objekt_id (not kunde_id)
      const { data: set, error: setError } = await supabase
        .from('waeschesets')
        .insert({
          objekt_id: params.objektId,
          name: params.name,
          beschreibung: params.beschreibung,
        })
        .select()
        .single();
      
      if (setError) throw setError;
      
      // Create set articles
      const artikel = params.artikel.map(a => ({
        set_id: set.id,
        artikel_id: a.artikelId,
        menge: a.menge,
        berechnungsart: a.berechnungsart || 'pro_buchung',
      }));
      
      const { error: artikelError } = await supabase
        .from('waescheset_artikel')
        .insert(artikel);
      
      if (artikelError) throw artikelError;
      
      return set;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waesche_sets'] });
    },
  });
}

// Fetch all invoices for customer
export function useRechnungen(kundeId: string | undefined) {
  return useQuery({
    queryKey: ['rechnungen', kundeId],
    queryFn: async () => {
      if (!kundeId) return [];
      
      const { data, error } = await supabase
        .from('rechnungen')
        .select('*')
        .eq('kunde_id', kundeId)
        .order('rechnungsdatum', { ascending: false });
      
      if (error) throw error;
      return data as Rechnung[];
    },
    enabled: !!kundeId,
  });
}

// Fetch single invoice with positions
export function useRechnung(rechnungId: string | undefined) {
  return useQuery({
    queryKey: ['rechnung', rechnungId],
    queryFn: async () => {
      if (!rechnungId) return null;
      
      const { data, error } = await supabase
        .from('rechnungen')
        .select(`
          *,
          positionen:rechnungspositionen(*)
        `)
        .eq('id', rechnungId)
        .maybeSingle();
      
      if (error) throw error;
      return data as RechnungMitPositionen | null;
    },
    enabled: !!rechnungId,
  });
}
