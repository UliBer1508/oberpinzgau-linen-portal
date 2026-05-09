# Plan: Neues Lovable Cloud Backend + Mobile-First Kundenportal

## Schritt 0 — Lovable Cloud aktivieren

- Tool `supabase--enable` aufrufen → frisches Backend wird bereitgestellt
- `src/integrations/supabase/client.ts` zeigt danach automatisch auf das neue Projekt
- Das alte externe Supabase (`pkpnowevagxmhyqlawng`) wird nicht mehr verwendet
- **Wichtig:** Die Daten aus dem alten Projekt werden NICHT übernommen. Falls Stammdaten (Artikelkatalog, Kunden, Objekte) übernommen werden sollen, machen wir das separat als CSV-Export/Import nach dem Schema-Setup. Wir starten mit leeren Tabellen + Test-Seed-Daten für den Artikelkatalog.

## Schritt 1 — Datenbank-Schema (Migration)

Alle 16 Tabellen aus dem alten Schema neu anlegen + Erweiterungen:

**Enums:**
- `bestellung_status`, `rechnung_status`, `bestellmodus`, `bestellart`, `berechnungsart`, `objekt_typ`
- Neu: `zahlung_methode` (`card | paypal | sepa`), `zahlung_status` (`pending | paid | failed | refunded`), `bezahl_status` (`offen | bezahlt | fehlgeschlagen`), `app_role` (`admin | customer`)

**Bestehende Tabellen (neu angelegt):**
- `kunden` — erweitert um: `auth_user_id (uuid, FK auth.users, unique)`, `vorname`, `nachname`, `mobil`, `geburtsdatum`, `iban`, `bic`, `kontoinhaber`, `stripe_customer_id`, `agb_akzeptiert_am`
- `objekte`, `waescheartikel`, `waeschesets`, `waescheset_artikel`, `waeschebestellungen`, `bestellpositionen`, `rechnungen`, `rechnungspositionen`, `rechnungseinstellungen`

**Neue Tabellen:**
- `zahlungen` (id, bestellung_id, rechnung_id?, kunde_id, betrag, waehrung, methode, stripe_payment_intent_id, stripe_session_id, status, bezahlt_am, created_at)
- `user_roles` (id, user_id, role) — getrennt von `kunden` zum Schutz vor Privilege Escalation
- `waeschebestellungen` erweitert um: `bezahlstatus`, `zahlung_id?`

**Funktionen & Trigger:**
- `handle_new_user()` (SECURITY DEFINER) → bei Auth-Signup leeren `kunden`-Datensatz mit `auth_user_id` anlegen + `user_roles` Eintrag mit Rolle `customer`
- `current_kunde_id()` (SECURITY DEFINER) → liefert `kunden.id` zum eingeloggten Nutzer
- `has_role(_user_id, _role)` (SECURITY DEFINER) → für Admin-Checks
- Trigger für `updated_at` auf allen Tabellen

**RLS-Policies (auf allen Tabellen aktiv):**
- `kunden`: SELECT/UPDATE eigenen Datensatz (`auth_user_id = auth.uid()`)
- `objekte`, `waeschesets`, `waeschebestellungen`, `rechnungen`, `zahlungen`: `kunde_id = current_kunde_id()` für SELECT/INSERT/UPDATE/DELETE
- Kindtabellen (`waescheset_artikel`, `bestellpositionen`, `rechnungspositionen`): über Join auf Parent
- `waescheartikel` (Katalog): SELECT für alle authentifizierten Nutzer, INSERT/UPDATE nur Admin
- `rechnungseinstellungen`: SELECT alle authentifizierten, UPDATE nur Admin

## Schritt 2 — Authentifizierung & Registrierung

- `AuthContext`: `DEV_MODE = false`, echter Flow (`onAuthStateChange` zuerst, dann `getSession`)
- `KundeContext` & `KundenAuswahl` entfernen — Mandant kommt aus Auth, nicht aus Dropdown
- `useSupabaseData` umstellen: Hooks holen `kunde_id` aus `auth.uid()` (RLS filtert automatisch)
- `Login.tsx` neu: E-Mail + Passwort, Link „Passwort vergessen", Link zu Registrierung
- Neue `/register` Seite — 3-Schritt Wizard, mobile-first:
  1. **Konto:** E-Mail, Passwort (mit Stärke-Anzeige), Passwort bestätigen
  2. **Stammdaten:** Vorname, Nachname, Firma (optional), Straße, PLZ, Ort, Mobil
  3. **Bankdaten & AGB:** IBAN, BIC, Kontoinhaber, AGB-Checkbox
- `signUp` mit `emailRedirectTo: window.location.origin/dashboard`
- Neue `/reset-password` Seite (öffentlich)
- Bestätigungs-E-Mail vorerst auf „auto-confirm" (Test); später `scaffold_auth_email_templates` für Branding

## Schritt 3 — Mobile-First UI Redesign

**Design-Tokens (`index.css`, `tailwind.config.ts`):**
- Pastell-Mint als Primary `162 60% 48%`, Coral-Akzent `12 85% 65%`
- Sehr helles Background `180 20% 98%`, Cards reines Weiß mit weichem Schatten
- `--gradient-fresh`, `--gradient-mint`, `--shadow-soft`
- Display-Font „Plus Jakarta Sans" + Body „Inter"
- Radius `1rem` (rounded-2xl)

**Layout:**
- `MainLayout` neu: oben Sticky-Header mit Begrüßung & Avatar, mittig Content, unten `BottomNav` (mobil < md)
- `BottomNav.tsx`: 5 Tabs (Start / Bestellen / Sets / Rechnungen / Profil), Safe-Area-Insets
- Sidebar bleibt für Desktop ≥ md
- Touch-Targets min. 44px, Inputs `h-12`, korrekte `inputMode` (tel/email/numeric)
- Sanfte `framer-motion` Transitions auf Karten und Wizard-Schritten

## Schritt 4 — Self-Service Onboarding-Flow

Auf `/dashboard` — wenn noch nicht vollständig: prominente Onboarding-Karten:
1. **Profil vervollständigen** (wenn `vorname` leer)
2. **Erstes Vermietungsobjekt anlegen** (wenn keine `objekte`) → `/objekte/neu`
3. **Wäscheset definieren** (wenn keine `waeschesets`) → `/waeschesets/neu`
4. **Erste Bestellung aufgeben** → `/bestellungen/neu`

Sobald Schritt 1+2 erledigt → normales Dashboard mit Stats & Aktionen.
Neuer Flow `/objekte/neu` (heute fehlt — aktuell wird über Detail-Seite editiert).

## Schritt 5 — Stripe-Bezahlung (Pro Bestellung)

- `enable_stripe_payments` aufrufen → Lovable Payments
- Karte + PayPal in Stripe Dashboard aktivieren
- Edge Functions:
  - `create-checkout` — erstellt Checkout-Session aus Bestellung (Modus `payment`, `line_items` aus Positionen × Artikelpreis), gibt URL zurück
  - `verify-payment` — wird auf Erfolgsseite aufgerufen, prüft Session, schreibt `zahlungen`, setzt `bezahlstatus = 'bezahlt'`
- Bestellabschluss in `NeueBestellung`: nach Speichern → CTA „Jetzt bezahlen" → Stripe Checkout (neuer Tab) → Redirect zurück auf `/bestellungen/:id?payment=success`
- In `BestellungDetail`: bei `bezahlstatus = 'offen'` → erneut „Jetzt bezahlen" Button anzeigen

## Schritt 6 — Bestehende Seiten anpassen

- `Bestellungen`, `Rechnungen`, `Objekte`, `WaescheSets`, deren Detail-Seiten: an neues Design + Mobile angepasst (große Touch-Targets, Sticky-Aktionen unten, Back-Button im Header)
- `KundenAuswahl` Komponente entfernen
- `ProtectedRoute` greift jetzt scharf

## Reihenfolge

1. `supabase--enable` (Cloud aktivieren)
2. Migration mit allen Tabellen, Enums, Funktionen, RLS, Trigger, Seed-Daten für Artikelkatalog
3. AuthContext umstellen, Login/Register/Reset-Password Seiten
4. Design-Tokens + Mobile Layout + BottomNav
5. Onboarding-Karten auf Dashboard + `/objekte/neu`
6. Stripe aktivieren, Edge Functions, Bezahl-Flow integrieren
7. Bestehende Seiten an neues Design anpassen, alten Mock-/KundenAuswahl-Code entfernen

## Hinweise

- Stripe (Lovable Payments) erfordert Pro-Plan
- Bestehende Daten im alten Supabase werden nicht migriert — Stammdaten ggf. später per CSV-Import
- Bankdaten (IBAN) werden gespeichert, RLS schützt; nicht in Logs ausgeben
- Memory-Regel „DEV_MODE / KundenAuswahl Dropdown" wird mit dieser Umstellung obsolet — wird nach Umsetzung aktualisiert
