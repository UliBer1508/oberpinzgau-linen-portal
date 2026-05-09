## Befund
Auf `/bestellungen/neu` filtert Schritt 3 die Wäschesets aktuell strikt nach dem **gewählten Objekt**. Im Netzwerk-Log sind aber Sets für ein anderes Objekt vorhanden:
- Set „Uli Berresheim – Chalet Wald" → Objekt `d696036f...` (Chalet Wald)
- Aktuell gewähltes Objekt im UI: `9f4afb1d...` (anderes Objekt) → Filter liefert leer → es wird nichts angezeigt.

## Plan

### `src/pages/NeueBestellung.tsx`, Card „3. Wäschesets"
1. **Filter aufheben** – immer **alle** Wäschesets des Kunden anzeigen, unabhängig vom gewählten Objekt.
2. Sortierung/Gruppierung:
   - Sets des aktuell gewählten Objekts (falls vorhanden) zuerst, danach Sets anderer Objekte.
   - Bei Sets, die **nicht** zum gewählten Objekt gehören, kleine Hinweis-Badge mit dem Objektnamen anzeigen (z. B. „aus: Chalet Wald").
3. Beim Klick auf ein Set, das zu einem **anderen** Objekt gehört, das Objekt automatisch auf das Set-Objekt umstellen (`setSelectedObjektId(set.objekt_id)`) und einen Toast-Hinweis zeigen („Objekt auf ‚Chalet Wald' geändert").
4. Empty-State weiterhin: „Noch keine Wäschesets" + Button „Erstes Set anlegen" (öffnet bestehenden Dialog).
5. Bedingung „Bitte zuerst Objekt wählen" entfernen — Sets können auch ohne vorherige Objektauswahl gewählt werden (Klick → Objekt wird automatisch gesetzt).

### Keine weiteren Änderungen
- Hooks und Dialog bleiben unverändert.
- Keine DB-Änderungen.
