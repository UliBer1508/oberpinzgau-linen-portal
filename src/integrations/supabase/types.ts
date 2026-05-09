export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bestellpositionen: {
        Row: {
          artikel_id: string
          bestellung_id: string
          id: string
          menge: number
          notizen: string | null
        }
        Insert: {
          artikel_id: string
          bestellung_id: string
          id?: string
          menge?: number
          notizen?: string | null
        }
        Update: {
          artikel_id?: string
          bestellung_id?: string
          id?: string
          menge?: number
          notizen?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bestellpositionen_artikel_id_fkey"
            columns: ["artikel_id"]
            isOneToOne: false
            referencedRelation: "waescheartikel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bestellpositionen_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
        ]
      }
      kunden: {
        Row: {
          agb_akzeptiert_am: string | null
          aktiv: boolean
          anlieferadresse: string | null
          auth_user_id: string | null
          bestellart: Database["public"]["Enums"]["bestellart"] | null
          bestellmodus: Database["public"]["Enums"]["bestellmodus"]
          bic: string | null
          created_at: string
          email: string | null
          firma: string | null
          geburtsdatum: string | null
          iban: string | null
          id: string
          kontoinhaber: string | null
          kundennummer: string
          mobil: string | null
          nachname: string | null
          name: string
          notizen: string | null
          ort: string | null
          plz: string | null
          strasse: string | null
          stripe_customer_id: string | null
          telefon: string | null
          updated_at: string
          vorname: string | null
        }
        Insert: {
          agb_akzeptiert_am?: string | null
          aktiv?: boolean
          anlieferadresse?: string | null
          auth_user_id?: string | null
          bestellart?: Database["public"]["Enums"]["bestellart"] | null
          bestellmodus?: Database["public"]["Enums"]["bestellmodus"]
          bic?: string | null
          created_at?: string
          email?: string | null
          firma?: string | null
          geburtsdatum?: string | null
          iban?: string | null
          id?: string
          kontoinhaber?: string | null
          kundennummer?: string
          mobil?: string | null
          nachname?: string | null
          name?: string
          notizen?: string | null
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          stripe_customer_id?: string | null
          telefon?: string | null
          updated_at?: string
          vorname?: string | null
        }
        Update: {
          agb_akzeptiert_am?: string | null
          aktiv?: boolean
          anlieferadresse?: string | null
          auth_user_id?: string | null
          bestellart?: Database["public"]["Enums"]["bestellart"] | null
          bestellmodus?: Database["public"]["Enums"]["bestellmodus"]
          bic?: string | null
          created_at?: string
          email?: string | null
          firma?: string | null
          geburtsdatum?: string | null
          iban?: string | null
          id?: string
          kontoinhaber?: string | null
          kundennummer?: string
          mobil?: string | null
          nachname?: string | null
          name?: string
          notizen?: string | null
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          stripe_customer_id?: string | null
          telefon?: string | null
          updated_at?: string
          vorname?: string | null
        }
        Relationships: []
      }
      objekte: {
        Row: {
          aktiv: boolean
          ansprechpartner: string | null
          created_at: string
          id: string
          kunde_id: string
          name: string
          notizen: string | null
          objektnummer: string
          ort: string | null
          plz: string | null
          strasse: string | null
          telefon: string | null
          typ: Database["public"]["Enums"]["objekt_typ"]
          updated_at: string
        }
        Insert: {
          aktiv?: boolean
          ansprechpartner?: string | null
          created_at?: string
          id?: string
          kunde_id: string
          name: string
          notizen?: string | null
          objektnummer?: string
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          typ?: Database["public"]["Enums"]["objekt_typ"]
          updated_at?: string
        }
        Update: {
          aktiv?: boolean
          ansprechpartner?: string | null
          created_at?: string
          id?: string
          kunde_id?: string
          name?: string
          notizen?: string | null
          objektnummer?: string
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          typ?: Database["public"]["Enums"]["objekt_typ"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objekte_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
        ]
      }
      rechnungen: {
        Row: {
          bearbeitungsgebuehr: number
          bestellung_id: string
          bezahlt_am: string | null
          bruttobetrag: number
          created_at: string
          faelligkeitsdatum: string | null
          id: string
          kunde_firma: string | null
          kunde_id: string
          kunde_kundennummer: string | null
          kunde_name: string
          kunde_ort: string | null
          kunde_plz: string | null
          kunde_strasse: string | null
          mwst_betrag: number
          mwst_satz: number
          nettobetrag: number
          notizen: string | null
          rechnungsdatum: string
          rechnungsnummer: string
          status: Database["public"]["Enums"]["rechnung_status"]
          updated_at: string
        }
        Insert: {
          bearbeitungsgebuehr?: number
          bestellung_id: string
          bezahlt_am?: string | null
          bruttobetrag?: number
          created_at?: string
          faelligkeitsdatum?: string | null
          id?: string
          kunde_firma?: string | null
          kunde_id: string
          kunde_kundennummer?: string | null
          kunde_name: string
          kunde_ort?: string | null
          kunde_plz?: string | null
          kunde_strasse?: string | null
          mwst_betrag?: number
          mwst_satz?: number
          nettobetrag?: number
          notizen?: string | null
          rechnungsdatum?: string
          rechnungsnummer: string
          status?: Database["public"]["Enums"]["rechnung_status"]
          updated_at?: string
        }
        Update: {
          bearbeitungsgebuehr?: number
          bestellung_id?: string
          bezahlt_am?: string | null
          bruttobetrag?: number
          created_at?: string
          faelligkeitsdatum?: string | null
          id?: string
          kunde_firma?: string | null
          kunde_id?: string
          kunde_kundennummer?: string | null
          kunde_name?: string
          kunde_ort?: string | null
          kunde_plz?: string | null
          kunde_strasse?: string | null
          mwst_betrag?: number
          mwst_satz?: number
          nettobetrag?: number
          notizen?: string | null
          rechnungsdatum?: string
          rechnungsnummer?: string
          status?: Database["public"]["Enums"]["rechnung_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rechnungen_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rechnungen_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
        ]
      }
      rechnungseinstellungen: {
        Row: {
          bearbeitungsgebuehr: number
          firma_bezeichnung: string | null
          firma_email: string | null
          firma_name: string | null
          firma_ort: string | null
          firma_plz: string | null
          firma_strasse: string | null
          firma_telefon: string | null
          id: string
          mwst_satz: number
          updated_at: string
        }
        Insert: {
          bearbeitungsgebuehr?: number
          firma_bezeichnung?: string | null
          firma_email?: string | null
          firma_name?: string | null
          firma_ort?: string | null
          firma_plz?: string | null
          firma_strasse?: string | null
          firma_telefon?: string | null
          id?: string
          mwst_satz?: number
          updated_at?: string
        }
        Update: {
          bearbeitungsgebuehr?: number
          firma_bezeichnung?: string | null
          firma_email?: string | null
          firma_name?: string | null
          firma_ort?: string | null
          firma_plz?: string | null
          firma_strasse?: string | null
          firma_telefon?: string | null
          id?: string
          mwst_satz?: number
          updated_at?: string
        }
        Relationships: []
      }
      rechnungspositionen: {
        Row: {
          artikelnummer: string
          bezeichnung: string
          einzelpreis: number
          gesamtpreis: number
          id: string
          menge: number
          rechnung_id: string
        }
        Insert: {
          artikelnummer: string
          bezeichnung: string
          einzelpreis?: number
          gesamtpreis?: number
          id?: string
          menge?: number
          rechnung_id: string
        }
        Update: {
          artikelnummer?: string
          bezeichnung?: string
          einzelpreis?: number
          gesamtpreis?: number
          id?: string
          menge?: number
          rechnung_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rechnungspositionen_rechnung_id_fkey"
            columns: ["rechnung_id"]
            isOneToOne: false
            referencedRelation: "rechnungen"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waescheartikel: {
        Row: {
          aktiv: boolean
          artikelnummer: string
          bezeichnung: string | null
          bild_url: string | null
          created_at: string
          farbe: string | null
          groesse: string | null
          id: string
          kategorie: string | null
          name: string
          preis: number | null
          updated_at: string
        }
        Insert: {
          aktiv?: boolean
          artikelnummer: string
          bezeichnung?: string | null
          bild_url?: string | null
          created_at?: string
          farbe?: string | null
          groesse?: string | null
          id?: string
          kategorie?: string | null
          name: string
          preis?: number | null
          updated_at?: string
        }
        Update: {
          aktiv?: boolean
          artikelnummer?: string
          bezeichnung?: string | null
          bild_url?: string | null
          created_at?: string
          farbe?: string | null
          groesse?: string | null
          id?: string
          kategorie?: string | null
          name?: string
          preis?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      waeschebestellungen: {
        Row: {
          abholdatum: string | null
          abholzeit: string | null
          anzahl_personen: number | null
          bearbeitung_deadline: string | null
          bearbeitung_notizen: string | null
          bestellnummer: string
          bezahlstatus: Database["public"]["Enums"]["bezahl_status"]
          check_in: string | null
          check_out: string | null
          created_at: string
          gastname: string | null
          id: string
          kunde_id: string
          lieferdatum: string | null
          lieferzeit: string | null
          notizen: string | null
          objekt_id: string | null
          prioritaet: number | null
          reihenfolge: number | null
          status: Database["public"]["Enums"]["bestellung_status"]
          updated_at: string
          waeschekraft_id: string | null
          zahlung_id: string | null
        }
        Insert: {
          abholdatum?: string | null
          abholzeit?: string | null
          anzahl_personen?: number | null
          bearbeitung_deadline?: string | null
          bearbeitung_notizen?: string | null
          bestellnummer: string
          bezahlstatus?: Database["public"]["Enums"]["bezahl_status"]
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          gastname?: string | null
          id?: string
          kunde_id: string
          lieferdatum?: string | null
          lieferzeit?: string | null
          notizen?: string | null
          objekt_id?: string | null
          prioritaet?: number | null
          reihenfolge?: number | null
          status?: Database["public"]["Enums"]["bestellung_status"]
          updated_at?: string
          waeschekraft_id?: string | null
          zahlung_id?: string | null
        }
        Update: {
          abholdatum?: string | null
          abholzeit?: string | null
          anzahl_personen?: number | null
          bearbeitung_deadline?: string | null
          bearbeitung_notizen?: string | null
          bestellnummer?: string
          bezahlstatus?: Database["public"]["Enums"]["bezahl_status"]
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          gastname?: string | null
          id?: string
          kunde_id?: string
          lieferdatum?: string | null
          lieferzeit?: string | null
          notizen?: string | null
          objekt_id?: string | null
          prioritaet?: number | null
          reihenfolge?: number | null
          status?: Database["public"]["Enums"]["bestellung_status"]
          updated_at?: string
          waeschekraft_id?: string | null
          zahlung_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waeschebestellungen_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waeschebestellungen_objekt_id_fkey"
            columns: ["objekt_id"]
            isOneToOne: false
            referencedRelation: "objekte"
            referencedColumns: ["id"]
          },
        ]
      }
      waescheset_artikel: {
        Row: {
          artikel_id: string
          berechnungsart: Database["public"]["Enums"]["berechnungsart"]
          id: string
          menge: number
          set_id: string
        }
        Insert: {
          artikel_id: string
          berechnungsart?: Database["public"]["Enums"]["berechnungsart"]
          id?: string
          menge?: number
          set_id: string
        }
        Update: {
          artikel_id?: string
          berechnungsart?: Database["public"]["Enums"]["berechnungsart"]
          id?: string
          menge?: number
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waescheset_artikel_artikel_id_fkey"
            columns: ["artikel_id"]
            isOneToOne: false
            referencedRelation: "waescheartikel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waescheset_artikel_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "waeschesets"
            referencedColumns: ["id"]
          },
        ]
      }
      waeschesets: {
        Row: {
          aktiv: boolean
          beschreibung: string | null
          created_at: string
          id: string
          name: string
          objekt_id: string
          updated_at: string
        }
        Insert: {
          aktiv?: boolean
          beschreibung?: string | null
          created_at?: string
          id?: string
          name: string
          objekt_id: string
          updated_at?: string
        }
        Update: {
          aktiv?: boolean
          beschreibung?: string | null
          created_at?: string
          id?: string
          name?: string
          objekt_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waeschesets_objekt_id_fkey"
            columns: ["objekt_id"]
            isOneToOne: false
            referencedRelation: "objekte"
            referencedColumns: ["id"]
          },
        ]
      }
      zahlungen: {
        Row: {
          bestellung_id: string | null
          betrag: number
          bezahlt_am: string | null
          created_at: string
          id: string
          kunde_id: string
          methode: Database["public"]["Enums"]["zahlung_methode"] | null
          rechnung_id: string | null
          status: Database["public"]["Enums"]["zahlung_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          waehrung: string
        }
        Insert: {
          bestellung_id?: string | null
          betrag: number
          bezahlt_am?: string | null
          created_at?: string
          id?: string
          kunde_id: string
          methode?: Database["public"]["Enums"]["zahlung_methode"] | null
          rechnung_id?: string | null
          status?: Database["public"]["Enums"]["zahlung_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          waehrung?: string
        }
        Update: {
          bestellung_id?: string | null
          betrag?: number
          bezahlt_am?: string | null
          created_at?: string
          id?: string
          kunde_id?: string
          methode?: Database["public"]["Enums"]["zahlung_methode"] | null
          rechnung_id?: string | null
          status?: Database["public"]["Enums"]["zahlung_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          waehrung?: string
        }
        Relationships: [
          {
            foreignKeyName: "zahlungen_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zahlungen_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zahlungen_rechnung_id_fkey"
            columns: ["rechnung_id"]
            isOneToOne: false
            referencedRelation: "rechnungen"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_kunde_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      berechnungsart: "pro_buchung" | "pro_gast"
      bestellart: "lieferung" | "abholung" | "beides"
      bestellmodus: "mit_buchung" | "nur_sets"
      bestellung_status:
        | "neu"
        | "in_bearbeitung"
        | "ausgeliefert"
        | "abgeholt"
        | "abgeschlossen"
        | "storniert"
      bezahl_status: "offen" | "bezahlt" | "fehlgeschlagen"
      objekt_typ:
        | "ferienwohnung"
        | "ferienhaus"
        | "hotel"
        | "pension"
        | "sonstige"
      rechnung_status: "offen" | "bezahlt" | "storniert" | "mahnung"
      zahlung_methode: "card" | "paypal" | "sepa"
      zahlung_status: "pending" | "paid" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      berechnungsart: ["pro_buchung", "pro_gast"],
      bestellart: ["lieferung", "abholung", "beides"],
      bestellmodus: ["mit_buchung", "nur_sets"],
      bestellung_status: [
        "neu",
        "in_bearbeitung",
        "ausgeliefert",
        "abgeholt",
        "abgeschlossen",
        "storniert",
      ],
      bezahl_status: ["offen", "bezahlt", "fehlgeschlagen"],
      objekt_typ: [
        "ferienwohnung",
        "ferienhaus",
        "hotel",
        "pension",
        "sonstige",
      ],
      rechnung_status: ["offen", "bezahlt", "storniert", "mahnung"],
      zahlung_methode: ["card", "paypal", "sepa"],
      zahlung_status: ["pending", "paid", "failed", "refunded"],
    },
  },
} as const
