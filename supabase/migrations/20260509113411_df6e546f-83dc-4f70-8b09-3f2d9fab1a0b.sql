-- ENUMS
CREATE TYPE public.bestellung_status AS ENUM ('neu','in_bearbeitung','ausgeliefert','abgeholt','abgeschlossen','storniert');
CREATE TYPE public.bestellmodus AS ENUM ('mit_buchung','nur_sets');
CREATE TYPE public.bestellart AS ENUM ('lieferung','abholung','beides');
CREATE TYPE public.berechnungsart AS ENUM ('pro_buchung','pro_gast');
CREATE TYPE public.objekt_typ AS ENUM ('ferienwohnung','ferienhaus','hotel','pension','sonstige');
CREATE TYPE public.rechnung_status AS ENUM ('offen','bezahlt','storniert','mahnung');
CREATE TYPE public.bezahl_status AS ENUM ('offen','bezahlt','fehlgeschlagen');
CREATE TYPE public.zahlung_methode AS ENUM ('card','paypal','sepa');
CREATE TYPE public.zahlung_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.app_role AS ENUM ('admin','customer');

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- KUNDEN
CREATE TABLE public.kunden (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  kundennummer text NOT NULL UNIQUE DEFAULT ('K' || to_char(now(),'YYYYMMDDHH24MISSMS')),
  name text NOT NULL DEFAULT '',
  vorname text,
  nachname text,
  firma text,
  strasse text,
  plz text,
  ort text,
  telefon text,
  mobil text,
  email text,
  geburtsdatum date,
  iban text,
  bic text,
  kontoinhaber text,
  stripe_customer_id text,
  agb_akzeptiert_am timestamptz,
  anlieferadresse text,
  bestellmodus public.bestellmodus NOT NULL DEFAULT 'mit_buchung',
  bestellart public.bestellart,
  notizen text,
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_kunden_updated BEFORE UPDATE ON public.kunden FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- USER ROLES (separate table to avoid privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_kunde_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.kunden WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Auto-create kunde + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.kunden (auth_user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- OBJEKTE
CREATE TABLE public.objekte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kunde_id uuid NOT NULL REFERENCES public.kunden(id) ON DELETE CASCADE,
  objektnummer text NOT NULL DEFAULT ('O' || to_char(now(),'YYYYMMDDHH24MISSMS')),
  name text NOT NULL,
  typ public.objekt_typ NOT NULL DEFAULT 'ferienwohnung',
  strasse text, plz text, ort text,
  ansprechpartner text, telefon text, notizen text,
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_objekte_updated BEFORE UPDATE ON public.objekte FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WAESCHEARTIKEL (catalog)
CREATE TABLE public.waescheartikel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artikelnummer text NOT NULL UNIQUE,
  name text NOT NULL,
  bezeichnung text, groesse text, kategorie text, farbe text,
  preis numeric(10,2),
  bild_url text,
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_waescheartikel_updated BEFORE UPDATE ON public.waescheartikel FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WAESCHESETS
CREATE TABLE public.waeschesets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id uuid NOT NULL REFERENCES public.objekte(id) ON DELETE CASCADE,
  name text NOT NULL,
  beschreibung text,
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_waeschesets_updated BEFORE UPDATE ON public.waeschesets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.waescheset_artikel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.waeschesets(id) ON DELETE CASCADE,
  artikel_id uuid NOT NULL REFERENCES public.waescheartikel(id),
  menge integer NOT NULL DEFAULT 1,
  berechnungsart public.berechnungsart NOT NULL DEFAULT 'pro_buchung'
);

-- WAESCHEBESTELLUNGEN
CREATE TABLE public.waeschebestellungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bestellnummer text NOT NULL UNIQUE,
  kunde_id uuid NOT NULL REFERENCES public.kunden(id) ON DELETE CASCADE,
  objekt_id uuid REFERENCES public.objekte(id),
  waeschekraft_id uuid,
  status public.bestellung_status NOT NULL DEFAULT 'neu',
  bezahlstatus public.bezahl_status NOT NULL DEFAULT 'offen',
  zahlung_id uuid,
  gastname text,
  check_in date, check_out date,
  anzahl_personen integer,
  lieferdatum date, lieferzeit time,
  abholdatum date, abholzeit time,
  prioritaet integer DEFAULT 0,
  reihenfolge integer,
  bearbeitung_deadline timestamptz,
  bearbeitung_notizen text,
  notizen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_waeschebestellungen_updated BEFORE UPDATE ON public.waeschebestellungen FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bestellpositionen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bestellung_id uuid NOT NULL REFERENCES public.waeschebestellungen(id) ON DELETE CASCADE,
  artikel_id uuid NOT NULL REFERENCES public.waescheartikel(id),
  menge integer NOT NULL DEFAULT 1,
  notizen text
);

-- RECHNUNGEN
CREATE TABLE public.rechnungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rechnungsnummer text NOT NULL UNIQUE,
  bestellung_id uuid NOT NULL REFERENCES public.waeschebestellungen(id) ON DELETE CASCADE,
  kunde_id uuid NOT NULL REFERENCES public.kunden(id) ON DELETE CASCADE,
  kunde_kundennummer text,
  kunde_name text NOT NULL,
  kunde_firma text, kunde_strasse text, kunde_plz text, kunde_ort text,
  rechnungsdatum date NOT NULL DEFAULT current_date,
  faelligkeitsdatum date,
  nettobetrag numeric(10,2) NOT NULL DEFAULT 0,
  mwst_satz numeric(5,2) NOT NULL DEFAULT 20,
  mwst_betrag numeric(10,2) NOT NULL DEFAULT 0,
  bruttobetrag numeric(10,2) NOT NULL DEFAULT 0,
  bearbeitungsgebuehr numeric(10,2) NOT NULL DEFAULT 0,
  status public.rechnung_status NOT NULL DEFAULT 'offen',
  bezahlt_am timestamptz,
  notizen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_rechnungen_updated BEFORE UPDATE ON public.rechnungen FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.rechnungspositionen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rechnung_id uuid NOT NULL REFERENCES public.rechnungen(id) ON DELETE CASCADE,
  artikelnummer text NOT NULL,
  bezeichnung text NOT NULL,
  menge integer NOT NULL DEFAULT 1,
  einzelpreis numeric(10,2) NOT NULL DEFAULT 0,
  gesamtpreis numeric(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE public.rechnungseinstellungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mwst_satz numeric(5,2) NOT NULL DEFAULT 20,
  bearbeitungsgebuehr numeric(10,2) NOT NULL DEFAULT 0,
  firma_name text, firma_bezeichnung text,
  firma_strasse text, firma_plz text, firma_ort text,
  firma_telefon text, firma_email text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_rechnungseinstellungen_updated BEFORE UPDATE ON public.rechnungseinstellungen FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ZAHLUNGEN
CREATE TABLE public.zahlungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bestellung_id uuid REFERENCES public.waeschebestellungen(id) ON DELETE SET NULL,
  rechnung_id uuid REFERENCES public.rechnungen(id) ON DELETE SET NULL,
  kunde_id uuid NOT NULL REFERENCES public.kunden(id) ON DELETE CASCADE,
  betrag numeric(10,2) NOT NULL,
  waehrung text NOT NULL DEFAULT 'EUR',
  methode public.zahlung_methode,
  stripe_payment_intent_id text,
  stripe_session_id text,
  status public.zahlung_status NOT NULL DEFAULT 'pending',
  bezahlt_am timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE public.kunden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objekte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waescheartikel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waeschesets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waescheset_artikel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waeschebestellungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bestellpositionen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rechnungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rechnungspositionen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rechnungseinstellungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zahlungen ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Kunden sehen eigenen Datensatz" ON public.kunden FOR SELECT USING (auth_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Kunden bearbeiten eigenen Datensatz" ON public.kunden FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "Admins verwalten Kunden" ON public.kunden FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "User sieht eigene Rollen" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins verwalten Rollen" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Eigene Objekte sehen" ON public.objekte FOR SELECT USING (kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Eigene Objekte anlegen" ON public.objekte FOR INSERT WITH CHECK (kunde_id = public.current_kunde_id());
CREATE POLICY "Eigene Objekte bearbeiten" ON public.objekte FOR UPDATE USING (kunde_id = public.current_kunde_id());
CREATE POLICY "Eigene Objekte loeschen" ON public.objekte FOR DELETE USING (kunde_id = public.current_kunde_id());

CREATE POLICY "Katalog lesen" ON public.waescheartikel FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins verwalten Katalog" ON public.waescheartikel FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Eigene Sets sehen" ON public.waeschesets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.objekte o WHERE o.id = objekt_id AND (o.kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "Eigene Sets anlegen" ON public.waeschesets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.objekte o WHERE o.id = objekt_id AND o.kunde_id = public.current_kunde_id())
);
CREATE POLICY "Eigene Sets bearbeiten" ON public.waeschesets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.objekte o WHERE o.id = objekt_id AND o.kunde_id = public.current_kunde_id())
);
CREATE POLICY "Eigene Sets loeschen" ON public.waeschesets FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.objekte o WHERE o.id = objekt_id AND o.kunde_id = public.current_kunde_id())
);

CREATE POLICY "Set-Artikel sehen" ON public.waescheset_artikel FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.waeschesets s JOIN public.objekte o ON o.id = s.objekt_id WHERE s.id = set_id AND (o.kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "Set-Artikel verwalten" ON public.waescheset_artikel FOR ALL USING (
  EXISTS (SELECT 1 FROM public.waeschesets s JOIN public.objekte o ON o.id = s.objekt_id WHERE s.id = set_id AND o.kunde_id = public.current_kunde_id())
);

CREATE POLICY "Eigene Bestellungen sehen" ON public.waeschebestellungen FOR SELECT USING (kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Eigene Bestellungen anlegen" ON public.waeschebestellungen FOR INSERT WITH CHECK (kunde_id = public.current_kunde_id());
CREATE POLICY "Eigene Bestellungen bearbeiten" ON public.waeschebestellungen FOR UPDATE USING (kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Eigene Bestellungen loeschen" ON public.waeschebestellungen FOR DELETE USING (kunde_id = public.current_kunde_id());

CREATE POLICY "Bestellpositionen sehen" ON public.bestellpositionen FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.waeschebestellungen b WHERE b.id = bestellung_id AND (b.kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "Bestellpositionen verwalten" ON public.bestellpositionen FOR ALL USING (
  EXISTS (SELECT 1 FROM public.waeschebestellungen b WHERE b.id = bestellung_id AND b.kunde_id = public.current_kunde_id())
);

CREATE POLICY "Eigene Rechnungen sehen" ON public.rechnungen FOR SELECT USING (kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins verwalten Rechnungen" ON public.rechnungen FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Rechnungspositionen sehen" ON public.rechnungspositionen FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rechnungen r WHERE r.id = rechnung_id AND (r.kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "Admins verwalten Rechnungspositionen" ON public.rechnungspositionen FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Rechnungseinstellungen lesen" ON public.rechnungseinstellungen FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins verwalten Rechnungseinstellungen" ON public.rechnungseinstellungen FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Eigene Zahlungen sehen" ON public.zahlungen FOR SELECT USING (kunde_id = public.current_kunde_id() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Eigene Zahlungen anlegen" ON public.zahlungen FOR INSERT WITH CHECK (kunde_id = public.current_kunde_id());
CREATE POLICY "Admins verwalten Zahlungen" ON public.zahlungen FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- SEED ARTIKEL
INSERT INTO public.waescheartikel (artikelnummer, name, kategorie, farbe, preis) VALUES
  ('A001','Bettlaken 90x200','Bettwäsche','Weiß',3.50),
  ('A002','Bettlaken 180x200','Bettwäsche','Weiß',4.50),
  ('A003','Bettbezug 135x200','Bettwäsche','Weiß',5.00),
  ('A004','Bettbezug 200x200','Bettwäsche','Weiß',6.00),
  ('A005','Kissenbezug 80x80','Bettwäsche','Weiß',1.50),
  ('A101','Handtuch 50x100','Handtücher','Weiß',2.00),
  ('A102','Duschtuch 70x140','Handtücher','Weiß',3.50),
  ('A103','Badetuch 100x150','Handtücher','Weiß',4.50),
  ('A104','Gästetuch 30x50','Handtücher','Weiß',1.00),
  ('A201','Geschirrtuch','Küche','Weiß gestreift',1.20),
  ('A202','Tischdecke 130x180','Küche','Weiß',5.00),
  ('A203','Servietten Set','Küche','Bunt',3.00);

INSERT INTO public.rechnungseinstellungen (mwst_satz, bearbeitungsgebuehr, firma_name) VALUES (20, 0, 'Wäsche Oberpinzgau');