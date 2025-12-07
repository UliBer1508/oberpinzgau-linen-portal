// Database types for the customer portal
// Re-export from the supabase client for backwards compatibility

export type {
  Kunde,
  Objekt,
  WaescheArtikel,
  WaescheSet,
  WaescheSetArtikel,
  Bestellung,
  BestellungPosition,
  BestellungStatus,
  BestellModus,
  BestellArt,
  BerechnungsArt,
  ObjektTyp,
  WaescheSetMitArtikel,
  BestellungMitDetails,
} from '@/integrations/supabase/client';
