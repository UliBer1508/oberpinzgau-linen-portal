// Minimale Database-Typen für den externen Supabase-Client.
// Alle Tabellen werden absichtlich als `any` typisiert, damit
// `supabase.from(...)` ohne TypeScript-Fehler kompiliert.
type AnyTable = { Row: any; Insert: any; Update: any; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      kunden: AnyTable;
      objekte: AnyTable;
      waeschebestellungen: AnyTable;
      bestellpositionen: AnyTable;
      waeschesets: AnyTable;
      waescheset_artikel: AnyTable;
      waescheartikel: AnyTable;
      rechnungen: AnyTable;
      rechnungspositionen: AnyTable;
      rechnungseinstellungen: AnyTable;
      zahlungen: AnyTable;
      user_roles: AnyTable;
      profiles: AnyTable;
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: string };
        Returns: boolean;
      };
      current_kunde_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
