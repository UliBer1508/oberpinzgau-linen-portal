## Ziel

1. App auf externe Supabase-DB (`pkpnowevagxmhyqlawng`, Wäscheportal Oberpinzgau) umstellen
2. **Zusätzlich:** Bestehende Daten aus der aktuellen Lovable-Cloud-DB (`uzworhojxcxbtsbttstp`) in die Ziel-DB übernehmen (Kunden, Objekte, Wäscheartikel, Sets, Bestellungen, Rechnungen, Zahlungen)

---

## Teil A — Code-Umstellung auf externen Client

### A.1 Externer Supabase-Client
- `src/integrations/external/client.ts` mit URL/Anon-Key hardcoded
- Optionen: `persistSession`, `autoRefreshToken`, `storage: localStorage`, `storageKey: 'sb-pkpnowev-auth'`
- Export als benannter `supabase`

### A.2 Minimale Typen
- `src/integrations/external/types.ts` mit `Database`-Interface
- Tabellen: `kunden`, `objekte`, `waeschebestellungen`, `bestellpositionen`, `waeschesets`, `waescheset_artikel`, `waescheartikel`, `rechnungen`, `rechnungspositionen`, `user_roles`, `profiles` jeweils `{ Row: any; Insert: any; Update: any }`

### A.3 Imports umstellen
- `@/integrations/supabase/client` → `@/integrations/external/client` in:
  - `AuthContext.tsx`, `KundeContext.tsx`, `useSupabaseData.ts`
  - alle Pages (`Login`, `ResetPassword`, `NeueBestellung`, `NeuesObjekt`, `NeuesWaescheSet`, `Objekte`, `ObjektDetail`, `Bestellungen`, `BestellungDetail`, `Rechnungen`, `RechnungDetail`, `WaescheSets`, `Artikel`, `Dashboard`, `Index`)
  - `KundenAuswahl.tsx`
- Alter Lovable-Cloud-Client bleibt liegen (nicht referenziert)

### A.4 Auth & Rollen
- `onAuthStateChange` vor `getSession()` registrieren (bestehende Reihenfolge übernehmen)
- Helper `src/lib/roles.ts` mit `hasRole(userId, role)` via `supabase.rpc('has_role', { _user_id, _role })`

### A.5 Verifikation
- Build grün; Network-Tab zeigt Calls an `pkpnowevagxmhyqlawng.supabase.co`
- Test-Query auf `kunden` lädt Daten

---

## Teil B — Datenmigration (alte DB → Ziel-DB)

### B.1 Datenexport aus Quell-DB
Aus `uzworhojxcxbtsbttstp` exportieren (per `supabase--read_query` als JSON):
- `kunden`, `objekte`, `waescheartikel`, `waeschesets`, `waescheset_artikel`
- `waeschebestellungen`, `bestellpositionen`
- `rechnungen`, `rechnungspositionen`, `rechnungseinstellungen`
- `zahlungen`
- `user_roles`

### B.2 Import-Skript in Ziel-DB
- Da die Ziel-DB ein anderes Projekt ist, NICHT über das Lovable-Migrations-Tool (das schreibt nur in `uzworhojxcxbtsbttstp`).
- Stattdessen ein Node-Skript `scripts/migrate-data.ts` ausführen, das mit dem Anon-Key (RLS in Ziel-DB ist deaktiviert) per `supabase-js` direkt in die Ziel-DB schreibt.
- Reihenfolge wegen Referenzen:
  1. `kunden` (mit Original-IDs erhalten)
  2. `objekte`
  3. `waescheartikel`
  4. `waeschesets` → `waescheset_artikel`
  5. `waeschebestellungen` → `bestellpositionen`
  6. `rechnungen` → `rechnungspositionen`
  7. `zahlungen`
  8. `rechnungseinstellungen` (nur falls in Ziel-DB leer)
  9. `user_roles` (sofern auth_user_ids in Ziel-DB existieren — sonst überspringen)
- IDs werden 1:1 übernommen (`upsert` mit `onConflict: 'id'`), damit alle Referenzen erhalten bleiben.

### B.3 auth.users-Behandlung
- `auth.users`-Einträge werden **nicht** automatisch übertragen (verschiedene Auth-Schemas, Passwörter sind Hashes).
- `kunden.auth_user_id` wird beim Import auf `NULL` gesetzt, falls die User-ID in der Ziel-DB nicht existiert.
- Nach der Migration: User in der Ziel-DB neu registrieren und manuell mit dem passenden `kunden`-Datensatz verknüpfen (entweder per UI oder kurzem SQL-Update).

### B.4 Konflikte mit bereits vorhandenen Daten
- Vorab prüfen, ob in der Ziel-DB schon Kunden/Objekte mit gleichen IDs oder Kundennummern existieren.
- Bei Konflikt: `upsert` mit `onConflict: 'id'` überschreibt; alternativ Skript-Flag für Dry-Run.

### B.5 Verifikation der Datenmigration
- Counts pro Tabelle vorher/nachher vergleichen
- In der UI (jetzt gegen Ziel-DB): Kunden, Objekte, Bestellungen sichtbar

---

## Hinweise / offene Punkte

- **Alter Lovable-Cloud-Client und `.env`** bleiben unangetastet (für spätere Edge-Function-Migration)
- **Storage-Dateien** (Bilder in Bucket `objekt-bilder` der alten DB) werden in diesem Schritt **nicht** kopiert — `bild_url`-Felder zeigen weiterhin auf die alte URL. Bei Bedarf separater Schritt: Dateien herunterladen und in Ziel-Bucket hochladen.
- **Edge Functions** dieser App nicht migrieren (separate Folgeaufgabe, wie vom User bestätigt).

Soll ich vor dem Datenexport noch prüfen, ob die Ziel-DB bereits Daten enthält (um Überschreibungen zu vermeiden)?
