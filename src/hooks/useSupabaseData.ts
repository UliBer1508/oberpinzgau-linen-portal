import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Kunde, Objekt, WaescheArtikel, WaescheSetMitArtikel, BestellungMitDetails, BestellungStatus, Rechnung, RechnungMitPositionen } from '@/types/database';
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

// Fetch orders with details for customer (including invoice status)
export function useBestellungen(kundeId: string | undefined) {
  return useQuery({
    queryKey: ['bestellungen', kundeId],
    queryFn: async () => {
      if (!kundeId) return [];
      
      // Fetch orders
      const { data: bestellungen, error: bestellungenError } = await supabase
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
      
      if (bestellungenError) throw bestellungenError;
      
      // Fetch invoices for this customer
      const { data: rechnungen, error: rechnungenError } = await supabase
        .from('rechnungen')
        .select('*')
        .eq('kunde_id', kundeId);
      
      if (rechnungenError) throw rechnungenError;
      
      // Map invoices to orders
      const rechnungenMap = new Map(rechnungen?.map(r => [r.bestellung_id, r]) || []);
      
      return (bestellungen || []).map(bestellung => ({
        ...bestellung,
        rechnung: rechnungenMap.get(bestellung.id) || null,
      })) as BestellungMitDetails[];
    },
    enabled: !!kundeId,
  });
}

// Fetch single order with details and linked invoice
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
      if (!data) return null;
      
      // Fetch linked invoice
      const { data: rechnung } = await supabase
        .from('rechnungen')
        .select('*')
        .eq('bestellung_id', bestellungId)
        .maybeSingle();
      
      return { ...data, rechnung } as BestellungMitDetails;
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
      gastname?: string | null;
      check_in?: string | null;
      check_out?: string | null;
      anzahl_personen?: number | null;
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
          gastname: params.gastname,
          check_in: params.check_in,
          check_out: params.check_out,
          anzahl_personen: params.anzahl_personen,
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

// Rechnung with linked Bestellung
export interface RechnungMitBestellung extends Rechnung {
  bestellung?: {
    bestellnummer: string;
    lieferdatum: string | null;
    objekt?: { name: string } | null;
  } | null;
}

// Fetch all invoices for customer with linked orders
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
      if (!data) return [];
      
      // Get bestellung_ids
      const bestellungIds = data
        .map(r => r.bestellung_id)
        .filter((id): id is string => !!id);
      
      if (bestellungIds.length === 0) {
        return data.map(r => ({ ...r, bestellung: null })) as RechnungMitBestellung[];
      }
      
      // Fetch linked orders
      const { data: bestellungen } = await supabase
        .from('waeschebestellungen')
        .select('id, bestellnummer, lieferdatum, objekt:objekte(name)')
        .in('id', bestellungIds);
      
      const bestellungenMap = new Map(bestellungen?.map(b => [b.id, b]) || []);
      
      return data.map(r => ({
        ...r,
        bestellung: r.bestellung_id ? bestellungenMap.get(r.bestellung_id) || null : null,
      })) as RechnungMitBestellung[];
    },
    enabled: !!kundeId,
  });
}

// Fetch single invoice with positions and linked order
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
      if (!data) return null;
      
      // Fetch linked order
      let bestellung = null;
      if (data.bestellung_id) {
        const { data: bestellungData } = await supabase
          .from('waeschebestellungen')
          .select('id, bestellnummer, lieferdatum, objekt:objekte(name)')
          .eq('id', data.bestellung_id)
          .maybeSingle();
        bestellung = bestellungData;
      }
      
      return { ...data, bestellung } as RechnungMitPositionen & { 
        bestellung?: { id: string; bestellnummer: string; lieferdatum: string | null; objekt?: { name: string } | null } | null 
      };
    },
    enabled: !!rechnungId,
  });
}
