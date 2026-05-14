## Ziel
Einheitlicher „Schließen"-Button (X-Icon) mit grünem Hintergrund (Primary) als Standard für alle Dialoge/Sheets/Drawer.

## Umsetzung

### 1. Neue Komponente `src/components/ui/close-button.tsx`
Wiederverwendbarer Button mit Design-Token (`bg-primary text-primary-foreground`), Hover/Focus-Ring, abgerundet:

```tsx
<button className="inline-flex h-8 w-8 items-center justify-center rounded-full
  bg-primary text-primary-foreground shadow-sm
  hover:bg-primary/90 focus:outline-none focus-visible:ring-2
  focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
  <X className="h-4 w-4" />
  <span className="sr-only">Schließen</span>
</button>
```

Forwarded ref + Props-Spread → einsetzbar mit `DialogPrimitive.Close asChild` / `SheetPrimitive.Close asChild`.

### 2. Ersetzen in UI-Primitives
- `src/components/ui/dialog.tsx` (Z. 45–48): aktuellen `DialogPrimitive.Close` mit X-Icon durch die neue Komponente ersetzen.
- `src/components/ui/sheet.tsx` (Z. 60–63): analog.
- `src/components/ui/alert-dialog.tsx`: hat keinen X-Button (nur Action/Cancel) → unverändert.
- `src/components/ui/drawer.tsx`: prüfen, ob X vorhanden; falls ja, ebenfalls ersetzen.

### 3. Position bleibt
Top-right `absolute right-4 top-4`, jetzt aber als grüner Pill-Button statt grauer Outline-X.

## Was NICHT angefasst wird
- „Abbrechen"-Buttons in Dialog-Footern (sind Aktions-Buttons, keine Close-X).
- Buttons mit Text wie „Schließen" in Footern (separate Aktion).
- Falls gewünscht später: Sage Bescheid und ich passe die ebenfalls an.

## Effekt
Alle bestehenden Dialoge (`QuickOrderDialog`, `WaescheSetFormDialog`, alle Sheets etc.) bekommen automatisch den neuen grünen Schließen-Button — keine Änderungen an den Aufrufstellen nötig.
