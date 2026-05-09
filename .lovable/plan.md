# Zahlungsfunktion – Umsetzungsplan

## Status
Stripe-Aktivierung wird **nicht jetzt** durchgeführt. Teuni muss `enable_stripe_payments` später ausführen und das Formular (E-Mail, Firmenname, Land) ausfüllen. Erst danach können die folgenden Schritte umgesetzt werden.

## Voraussetzungen (durch Teuni)
1. Tool `enable_stripe_payments` in der Wäscheportal Oberpinzgau App ausführen
2. Stripe-Formular mit Firmendaten ausfüllen (E-Mail, Name, Firma, Land Österreich)
3. Test-Modus ist sofort aktiv → Entwicklung kann starten
4. Live-Modus später nach Stripe-Account-Verifizierung

## Was bereits vorhanden ist
- Tabelle `kunden` mit Spalte `stripe_customer_id`
- Tabelle `zahlungen` mit `stripe_payment_intent_id`, `stripe_session_id`, `status`, `betrag`
- Tabelle `rechnungen` mit `status` (`offen`, `bezahlt`, `mahnung`, …)
- Verknüpfung `rechnung_id` ↔ `zahlungen`

## Umsetzungsschritte (nach Aktivierung)

### 1. Datenbank (Migration)
- Optionaler Index auf `zahlungen.stripe_payment_intent_id` und `stripe_session_id`
- Keine weiteren Schema-Änderungen nötig

### 2. Edge Functions
| Function | Zweck |
|---|---|
| `create-stripe-customer` | Idempotent: legt Stripe-Kunde an, speichert `stripe_customer_id` in `kunden` |
| `create-billing-portal-session` | Öffnet Stripe Customer Portal zum Verwalten von Kreditkarten |
| `create-invoice-checkout` | Erstellt Stripe Checkout Session (`mode: 'payment'`, `payment_method_types: ['card']`) für eine Rechnung, legt `zahlungen`-Eintrag mit Status `pending` an |
| `stripe-webhook` | Verifiziert Signatur, verarbeitet `checkout.session.completed` → setzt `zahlungen.status='paid'` und `rechnungen.status='bezahlt'`; bei `payment_intent.payment_failed` → `zahlungen.status='failed'` |

### 3. Frontend
- **Profil-Seite**: Button "Zahlungsmethoden verwalten" → öffnet Stripe Portal
- **Rechnungs-Detail** (`/rechnungen/:id`): Button "Jetzt bezahlen" sichtbar bei Status `offen` oder `mahnung` → öffnet Stripe Checkout → Rückleitung mit `?paid=1`
- **Rechnungsliste**: optionales "€ Zahlen"-Badge bei offenen Rechnungen

### 4. Secrets
Werden durch `enable_stripe_payments` automatisch gesetzt:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`

### 5. Test
- Stripe Testkarte `4242 4242 4242 4242`, beliebiges Datum, beliebiger CVC
- Komplettflow: Kreditkarte hinterlegen → Rechnung bezahlen → Webhook → Status `bezahlt`

## Post-MVP (nicht Teil dieser Umsetzung)
- SEPA-Lastschrift, Apple Pay, Google Pay
- Auto-Abbuchung bei Rechnungserstellung
- Mahnwesen mit automatischem Wiederholungs-Charge

## Nächster Schritt
Sobald Teuni Stripe aktiviert hat, in einer neuen Nachricht "Plan umsetzen" auswählen – ich baue dann Edge Functions + UI.
