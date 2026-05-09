Mobile-Optimierung der Rechnungs-Detailseite (`src/pages/RechnungDetail.tsx`).

1. **Positionen-Tabelle (Zeilen 142–207)** — Mobile als Karten-Liste, Desktop bleibt Tabelle:
   - `md:hidden`: pro Position eine Karte (Art.-Nr. + Bezeichnung oben, `Menge × Einzelpreis` und `Gesamt` rechts).
   - Summen (Netto / Bearbeitungsgebühr / MwSt / Brutto) als gestackte `flex justify-between`-Zeilen.
   - `hidden md:block`: bestehende Tabelle bleibt.

2. **Header-Actions (Zeilen 61–83)** kompakter auf Mobile:
   - "Zurück", "Drucken", "PDF" Text via `hidden sm:inline`, Icon bleibt.
   - Container `flex-wrap` damit nichts überläuft.

3. **Reihenfolge auf Mobile** — Zusammenfassung zuerst:
   - Sidebar-Spalte erhält `order-first lg:order-none`.

4. **Card-Padding** auf Mobile reduzieren (`px-4 md:px-6` an `CardContent` der Rechnungsdetails).