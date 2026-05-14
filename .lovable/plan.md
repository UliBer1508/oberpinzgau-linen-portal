## Änderung
`src/components/ui/close-button.tsx`: Größe von 32×32 px (h-8/w-8) auf **44×44 px** (h-11/w-11) anheben — identisch zum Zurück-Button im Header. Icon bleibt 16 px (`h-4 w-4`), `active:scale-95` für haptisches Feedback.

```tsx
"inline-flex h-11 w-11 items-center justify-center rounded-full
 bg-primary text-primary-foreground shadow-sm
 hover:bg-primary/90 active:scale-95 transition
 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

Wirkt automatisch in allen Dialogen und Sheets, da `CloseButton` zentral verwendet wird.
