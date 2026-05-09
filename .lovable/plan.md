## Konzept: Rechnungszahlung per Kreditkarte (Stripe Built-in)

### Auswahl basierend auf Antworten
- **Methode:** Kreditkarte (Visa / Mastercard / Amex)
- **Ablauf:** Manuell – Kunde drückt aktiv „Jetzt bezahlen"
- **Verwaltung:** Stripe Customer Portal (Stripe-hosted)
- **Provider:** Lovable Built-in **Stripe** (kein BYOK, kein eigenes Stripe-Konto nötig)

### 1. Stripe aktivieren (Voraussetzung)
Vor jeder Code-Änderung muss `enable_stripe_payments` ausgeführt werden. Der User füllt dabei ein Formular (E-Mail, Name, Firmenname). Danach steht eine Test-Umgebung zur Verfügung; Live-Zahlungen erst nach Stripe-Account-Claim.

**Tax-Handling:** Da AT-Wäscherei mit B2B-Kunden, Empfehlung **„No tax automation"** – die MwSt. wird bereits in der App berechnet (`mwst_satz`/`mwst_betrag` in `rechnungen`). Stripe macht nur Zahlungsabwicklung, keine doppelte Steuer.

### 2. Datenbank-Anpassungen (Migration)
Bestehend:
- `kunden.stripe_customer_id` ✅ (vorhanden)
- `zahlungen` Tabelle mit `stripe_payment_intent_id`, `stripe_session_id`, `status`, `betrag` ✅ (vorhanden)
- `rechnungen.status` enum mit `bezahlt` ✅ (vorhanden)

Nichts Neues nötig auf Schema-Ebene. Eventuell:
- Index auf `zahlungen.stripe_payment_intent_id` für Webhook-Lookup
- Spalte `rechnungen.stripe_payment_intent_id` (optional für direkten Bezug, sonst über `zahlungen.rechnung_id`)

### 3. Edge Functions

**a) `create-stripe-customer`** (intern, idempotent)
- Input: `kunde_id`
- Liest Kundendaten aus `kunden`, ruft `stripe.customers.create({ email, name, metadata: { kunde_id } })`
- Speichert `stripe_customer_id` zurück in `kunden`
- Returnt die Customer-ID

**b) `create-billing-portal-session`**
- Aufruf vom Profil aus
- Erzeugt einen Stripe Customer Portal Link (`stripe.billingPortal.sessions.create({ customer, return_url })`)
- Frontend leitet weiter → Kunde verwaltet dort Karten (hinzufügen / löschen / Standard setzen)

**c) `create-invoice-checkout`**
- Input: `rechnung_id`
- Lädt Rechnung, prüft Status = `offen`/`mahnung`
- Erstellt `stripe.checkout.sessions.create({ mode: 'payment', customer, line_items: [{ price_data: { unit_amount: bruttobetrag*100, currency: 'eur', product_data: { name: 'Rechnung ' + rechnungsnummer } }, quantity: 1 }], payment_method_types: ['card'], metadata: { rechnung_id, kunde_id }, success_url, cancel_url })`
- Stripe Checkout zeigt automatisch gespeicherte Karten zur Auswahl + Option neue Karte
- Legt vorab `zahlungen`-Eintrag an mit Status `pending` und `stripe_session_id`
- Returnt Checkout-URL → Frontend leitet weiter

**d) `stripe-webhook`** (`verify_jwt = false` in `config.toml`)
- Verifiziert Signatur via `STRIPE_WEBHOOK_SECRET`
- Events:
  - `checkout.session.completed` → `zahlungen.status = 'paid'`, `bezahlt_am = now()`, `rechnungen.status = 'bezahlt'`, `rechnungen.bezahlt_am = now()`
  - `payment_intent.payment_failed` → `zahlungen.status = 'failed'`
- Verwendet Service-Role-Key (umgeht RLS)

### 4. Frontend

**a) Profilseite – neuer Abschnitt „Zahlungsmethoden"**
- Card mit Beschreibung „Verwalte deine hinterlegten Kreditkarten"
- Button **„Zahlungsmethoden verwalten"** → ruft `create-billing-portal-session` → Redirect zum Stripe Portal
- Beim Rückkehren landet der Kunde wieder im Profil

**b) Rechnungs-Detail – neuer Button „Jetzt bezahlen"**
- Sichtbar wenn `status` ∈ {`offen`, `mahnung`} und Kunde = Eigentümer
- Klick → `create-invoice-checkout` → Redirect zu Stripe Checkout
- Stripe zeigt: gespeicherte Karten (1-Klick) ODER neue Karte eingeben
- Nach Erfolg: Redirect zurück auf Rechnungs-Detail mit `?paid=1` → Toast „Zahlung erhalten", Status zeigt jetzt „Bezahlt"

**c) Rechnungs-Liste**
- Bei offenen Rechnungen kleines „€ Zahlen"-Badge/Button in der Zeile (optional, MVP nicht zwingend)

### 5. Secrets
Werden automatisch durch `enable_stripe_payments` gesetzt:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY` (publishable, kann in Frontend)

### 6. Reihenfolge der Umsetzung
1. **Stripe aktivieren** (`enable_stripe_payments`) – Voraussetzung
2. Edge Function `create-stripe-customer` + Helper im Frontend, der beim ersten Profilaufruf sicherstellt dass Customer existiert
3. Edge Function `create-billing-portal-session` + Profil-UI „Zahlungsmethoden"
4. Edge Function `create-invoice-checkout` + „Jetzt bezahlen"-Button auf Rechnungs-Detail
5. Edge Function `stripe-webhook` + Status-Updates
6. End-to-End-Test mit Stripe-Testkarte `4242 4242 4242 4242`

### 7. Was später möglich ist (nicht im MVP)
- Auto-Abbuchung bei neuer Rechnung (PaymentIntent off-session mit gespeicherter Karte)
- SEPA-Lastschrift zusätzlich
- Apple Pay / Google Pay (in Stripe Checkout schon enthalten, einfach aktivierbar)
- Mahnwesen mit automatischer Wiederholungs-Charge

---

**Nächster Schritt:** Sobald freigegeben → `enable_stripe_payments` aufrufen und Schritt 2–6 umsetzen.