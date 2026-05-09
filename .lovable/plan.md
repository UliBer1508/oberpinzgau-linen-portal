# Plan: Frisches Mobile-First Kundenportal mit Self-Service & Bezahlung

## 1. Datenbank — Mandantenfähigkeit & Bezahldaten

**Aktuelle Lage:** Tabellen haben `kunde_id`, aber `AuthContext` läuft im `DEV_MODE = true` (alle sehen alles über einen Mock-User). Es fehlen: Verknüpfung `auth.users → kunden`, RLS-Policies, Bankdaten und Bezahldaten.

**Schema-Änderungen (Migration):**
- `kunden` erweitern: `auth_user_id uuid` (FK auf `auth.users`, unique), `vorname`, `nachname`, `mobil`, `geburtsdatum?`, `iban`, `bic`, `kontoinhaber`, `stripe_customer_id`, `agb_akzeptiert_am`
- Neue Tabelle `zahlungen`: `id`, `bestellung_id`, `rechnung_id?`, `kunde_id`, `betrag`, `waehrung`, `methode` (`card` | `paypal` | `sepa`), `stripe_payment_intent_id`, `stripe_session_id`, `status` (`pending` | `paid` | `failed` | `refunded`), `bezahlt_am`, `created_at`
- `bestellungen` erweitern: `bezahlstatus` (`offen` | `bezahlt` | `fehlgeschlagen`), `zahlung_id?`
- Trigger `handle_new_user()`: legt bei Auth-Signup einen leeren `kunden`-Datensatz mit `auth_user_id` an
- Helper-Funktion `current_kunde_id()` (SECURITY DEFINER): liefert `kunden.id` zum eingeloggten Auth-User

**RLS aktivieren** auf allen Tabellen mit Policy-Pattern:
- `kunden`: SELECT/UPDATE nur eigener Datensatz (`auth_user_id = auth.uid()`)
- `objekte`, `waeschesets`, `bestellungen`, `rechnungen`, `zahlungen`: `kunde_id = current_kunde_id()` für SELECT/INSERT/UPDATE
- `waeschesets_artikel`, `bestellpositionen`, `rechnungspositionen`: über Join auf Parent prüfen
- `waescheartikel` (Katalog): SELECT für alle authentifizierten Nutzer, kein Schreiben

## 2. Authentifizierung & Registrierung

- `AuthContext`: `DEV_MODE = false`, echter Supabase-Auth-Flow mit `onAuthStateChange` + `getSession`
- `Login.tsx` neu: nur E-Mail + Passwort, „Passwort vergessen", Link zu Registrierung
- Neue mehrstufige Registrierung `/register` (Mobile-First Wizard, 3 Schritte mit Progress-Bar):
  1. **Konto:** E-Mail, Passwort, Passwort bestätigen
  2. **Stammdaten:** Vorname, Nachname, Firma (optional), Straße, PLZ, Ort, Mobil, Geburtsdatum
  3. **Bankdaten & AGB:** IBAN, BIC, Kontoinhaber, AGB-Checkbox
- Nach `signUp` → Trigger erstellt `kunden`-Datensatz, Schritt 2+3 schreiben per `update` in `kunden`
- `emailRedirectTo: window.location.origin` setzen
- `/reset-password` Seite anlegen

## 3. Self-Service Flow (Mobile-First)

Nach Login geführter Onboarding-Check auf dem Dashboard:
1. **Vermietungsobjekt anlegen** — wenn noch keins existiert, prominente CTA-Card; einfaches Formular (Name, Typ, Adresse)
2. **Wäscheset definieren** — vorhandener Flow `/waeschesets/neu`, mobil optimiert
3. **Bestellen** — `/bestellungen/neu`, Auswahl: ganzes Set ODER Einzelartikel

Dashboard zeigt diese 3 Schritte als „Erste Schritte"-Karten mit Häkchen, sobald erledigt.

## 4. Zahlungsintegration (Stripe via Lovable Payments)

- `enable_stripe_payments` aufrufen (Pro-Plan + Cloud erforderlich)
- Karte + PayPal als Methoden in Stripe Checkout aktivieren
- Edge Function `create-checkout`: erstellt Checkout-Session pro Bestellung (Modus `payment`, `line_items` aus Bestellpositionen)
- Edge Function `stripe-webhook`: schreibt `zahlungen` und setzt `bestellungen.bezahlstatus = 'bezahlt'`
- Edge Function `verify-payment`: prüft Session-Status nach Redirect
- Bestellabschluss-Schritt: „Jetzt bezahlen" → Stripe Checkout → Erfolgsseite `/bestellungen/:id?payment=success`

## 5. UI-Redesign — Frisch & freundlich, Mobile-First

**Design-Token (`index.css` + `tailwind.config.ts`):**
- Hauptfarbe Sky/Mint Pastell, sanfte Gradients, viel Weißraum
- Typo: Display „Plus Jakarta Sans", Body „Inter"
- Großzügige Radien (`rounded-2xl`), weiche Schatten, Pastell-Akzente
- Neue Tokens: `--primary` (Mint), `--accent` (Coral), `--gradient-fresh`, `--shadow-soft`

**Layout-Umbau:**
- Mobile-First: Sidebar wird auf < md zur Bottom-Tab-Bar (Dashboard / Objekte / Bestellungen / Wäschesets / Profil)
- `MainLayout` mit Safe-Area-Insets, sticky Header mit Avatar + Begrüßung
- Dashboard-Cards mit Icons, großen Touch-Targets (min. 44px), Swipeable Listen
- Formulare in vollbreiten Karten, Inputs `h-12`, Tastatur-Typen (`inputMode="tel"`, `email`, `numeric`)
- Skeleton-Loader & sanfte `framer-motion` Übergänge auf Cards & Wizard-Schritten

**Komponenten neu/überarbeitet:**
- `BottomNav.tsx` (mobil) + bestehende `Sidebar.tsx` (desktop)
- `OnboardingCard.tsx` für die 3 Erste-Schritte
- `RegistrierungWizard.tsx` mit 3 Steps + Progress
- `ZahlungButton.tsx` für Stripe-Checkout-Trigger
- `KundenAuswahl` entfernen (war nur Dev-Hilfe, Mandant kommt aus Auth)

## 6. Reihenfolge der Umsetzung

1. Migration: `kunden`-Erweiterung, `zahlungen`, Trigger, RLS-Policies, `current_kunde_id()`
2. Auth scharfstellen, Registrierungs-Wizard, Login/Reset-Password
3. `KundeContext` umstellen auf `current_kunde_id()` aus DB statt Mock
4. Design-System & Mobile-First Layout (BottomNav, Tokens, Cards)
5. Onboarding-Flow auf Dashboard
6. Stripe aktivieren, Edge Functions, Bezahl-Flow in Bestellung
7. Bestehende Seiten (Bestellungen, Wäschesets, Objekte, Rechnungen) ans neue Design + RLS anpassen

## Hinweise
- Lovable Cloud muss aktiv sein (für Stripe-Integration & Edge Functions)
- Stripe-Bezahlung benötigt Pro-Plan
- Bankdaten (IBAN) werden gespeichert — RLS schützt, dass nur der Eigentümer sie liest; in Logs nie ausgeben
