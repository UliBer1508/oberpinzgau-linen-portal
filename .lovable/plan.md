## Problem

Du bist eingeloggt, aber beim Speichern kommt **„Kein Kunde ausgewählt"**. Ursache:

- Der `KundeContext` sucht den Kunden über `kunden.auth_user_id == auth.uid()`.
- In der **Ziel-DB existiert die Spalte `auth_user_id` auf `kunden` nicht**. Die Teuni-App verknüpft Auth-User und Kunde stattdessen über die Tabelle **`profiles`** (`profiles.id == auth.uid()`, `profiles.email`).
- Da `auth_user_id` nicht existiert, kommt `kunde = null` zurück → `selectedKundeId = null` → Insert wird mit `kunde_id = null` versucht.

Zusätzlich hat die Ziel-DB jetzt **zwei Kunden mit `uli.berresheim@hotmail.de`**:
- `fe41904f-…` (Teuni-Original mit vollständiger Adresse, Anlieferadresse, Bestellart) — **das ist der richtige**
- `bcdf0e0e-…` (von der Migration angelegt, fast leer) — **Duplikat, sollte weg**

---

## Plan

### 1. Duplikat-Kunde aus der Migration entfernen
- Vorher prüfen: gibt es Referenzen (`objekte.kunde_id`, `waeschebestellungen.kunde_id`, `rechnungen.kunde_id`) auf `bcdf0e0e-…`?
  - Das migrierte Objekt `9f4afb1d-…` zeigt darauf → **vorher umhängen** auf `fe41904f-…`.
- Dann den Duplikat-Kunden `bcdf0e0e-…` löschen.

### 2. `KundeContext` umstellen: Auth-User → Kunde via Profile/Email
Neue Auflösungs-Logik (in dieser Reihenfolge):
1. **Profile laden:** `profiles` per `id = auth.uid()` → liefert `email`, `name`.
2. **Kunde matchen:** `kunden` per `email = profile.email AND aktiv = true` → ersten Treffer nehmen.
3. **Fallback:** wenn kein Profile existiert, direkt `kunden.email = auth.user.email` matchen.
4. **Wenn nichts gefunden:** klare Meldung im UI („Kein Kundendatensatz für diese E-Mail gefunden").

### 3. Optional: Sicherstellen, dass beim Signup ein Profile angelegt wird
- Bei neuem Login/Signup: prüfen ob `profiles` für `auth.uid()` existiert; falls nicht, einen Eintrag mit `email` und `name` (aus `user_metadata`) anlegen (upsert auf `id`).
- So bleibt die Verknüpfung mit der Teuni-App-Logik konsistent.

### 4. Verifikation
- Nach Login: in der Sidebar/im Header wird der korrekte Kundenname `Uli Berresheim` angezeigt.
- Objekt anlegen unter `/objekte/neu` → wird mit `kunde_id = fe41904f-…` gespeichert (nicht mehr „Kein Kunde ausgewählt").
- Bestellungen, Rechnungen etc. zeigen die echten Daten aus der gemeinsamen DB.

---

## Hinweise / offene Punkte

- **`user_roles` ist in der Ziel-DB leer** — Rollen-Checks via `has_role` liefern aktuell überall `false`. Falls du Admin-Rechte brauchst, muss in der Ziel-DB ein Eintrag `(user_id = auth.uid(), role = 'admin')` angelegt werden. (Das mache ich nur, wenn du es willst.)
- Die Ziel-DB hat **keine `auth_user_id`** auf `kunden`. Deshalb ist Email-Matching der pragmatischste Weg, ohne das Ziel-Schema zu ändern. Falls in Zukunft mehrere unterschiedliche Kunden dieselbe Email haben (unüblich, aber möglich), bräuchten wir entweder eine Spalte auf `kunden` oder einen Auswahl-Dropdown.

Soll ich Schritt 3 (automatische Profile-Anlage beim Login) gleich mitmachen, oder weglassen, weil die Teuni-App das ohnehin macht?
