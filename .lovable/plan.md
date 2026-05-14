## Ziel
Zurück-Button im `MainLayout`-Header bekommt grünen Primary-Hintergrund (wie der neue Schließen-Button) und wird fingerfreundlich (≥ 44 px Tap-Target).

## Änderung
Eine Stelle: `src/components/layout/MainLayout.tsx`, Zeilen 51–59.

```tsx
<button
  type="button"
  onClick={() => navigate(backTo)}
  aria-label="Zurück"
  className="md:hidden inline-flex h-11 w-11 items-center justify-center
    rounded-full shrink-0 bg-primary text-primary-foreground shadow-sm
    hover:bg-primary/90 active:scale-95 transition
    focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
>
  <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
</button>
```

- 44×44 px Touch-Target (Apple/Google Guideline).
- Gleiche visuelle Sprache wie `CloseButton` (Primary-Grün, Pill, Shadow, Focus-Ring).
- Bleibt mobile-only (`md:hidden`) wie bisher.

## Nicht betroffen
- Desktop-Sidebar-Navigation.
- Andere Buttons / Header-Layout / `actions`.
