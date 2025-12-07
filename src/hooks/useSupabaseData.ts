import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  supabase, 
  Kunde, 
  Objekt, 
  WaescheArtikel, 
  WaescheSetMitArtikel, 
  BestellungMitDetails,
  BestellungStatus 
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
        .from('waesche_artikel')
        .select('*')
        .order('kategorie, name');
      
      if (error) throw error;
      return data as WaescheArtikel[];
    },
  });
}

// Fetch laundry sets with articles for customer
export function useWaescheSets(kundeId: string | undefined) {
  return useQuery({
    queryKey: ['waesche_sets', kundeId],
    queryFn: async () => {
      if (!kundeId) return [];
      
      const { data, error } = await supabase
        .from('waesche_sets')
        .select(`
          *,
          artikel:waesche_set_artikel(
            *,
            waesche_artikel(*)
          )
        `)
        .eq('kunde_id', kundeId)
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
        .from('bestellungen')
        .select(`
          *,
          objekt:objekte(*),
          positionen:bestellung_positionen(
            *,
            waesche_artikel(*)
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
        .from('bestellungen')
        .select(`
          *,
          objekt:objekte(*),
          positionen:bestellung_positionen(
            *,
            waesche_artikel(*)
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
      gewuenschtes_lieferdatum?: string | null;
      bemerkungen?: string | null;
      positionen: { artikel_id: string; menge: number; einzelpreis: number }[];
    }) => {
      if (!selectedKundeId) throw new Error('Kein Kunde ausgewählt');
      
      // Create order
      const { data: bestellung, error: bestellungError } = await supabase
        .from('bestellungen')
        .insert({
          kunde_id: selectedKundeId,
          objekt_id: params.objekt_id,
          gewuenschtes_lieferdatum: params.gewuenschtes_lieferdatum,
          bemerkungen: params.bemerkungen,
          status: 'ausstehend' as BestellungStatus,
        })
        .select()
        .single();
      
      if (bestellungError) throw bestellungError;
      
      // Create order positions
      const positionen = params.positionen.map(p => ({
        bestellung_id: bestellung.id,
        artikel_id: p.artikel_id,
        menge: p.menge,
        einzelpreis: p.einzelpreis,
      }));
      
      const { error: positionenError } = await supabase
        .from('bestellung_positionen')
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
      kundeId: string;
      name: string;
      beschreibung?: string;
      artikel: { artikelId: string; menge: number }[];
    }) => {
      // Create set
      const { data: set, error: setError } = await supabase
        .from('waesche_sets')
        .insert({
          kunde_id: params.kundeId,
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
      }));
      
      const { error: artikelError } = await supabase
        .from('waesche_set_artikel')
        .insert(artikel);
      
      if (artikelError) throw artikelError;
      
      return set;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waesche_sets'] });
    },
  });
}
