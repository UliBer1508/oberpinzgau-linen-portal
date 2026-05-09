Mobile-Card-Liste für Rechnungen im Dashboard analog zu den Bestellungen.

**Änderung in `src/pages/Dashboard.tsx` (Zeilen 314–352):**

```tsx
<>
  {/* Mobile */}
  <div className="md:hidden divide-y divide-border/60">
    {recentRechnungen.map((r) => (
      <button
        key={r.id}
        onClick={() => navigate(`/rechnungen/${r.id}`)}
        className={`w-full text-left p-3 ${getRechnungRowClassName(r.status)}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-medium text-primary truncate">
            {r.rechnungsnummer}
          </span>
          <StatusBadge status={r.status} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground truncate min-w-0">
            {r.bestellung?.bestellnummer && (
              <span className="font-mono">#{r.bestellung.bestellnummer}</span>
            )}
            <Clock className="h-3 w-3 shrink-0" />
            {format(new Date(r.rechnungsdatum), 'dd.MM.yyyy', { locale: de })}
          </span>
          <span className="font-semibold text-sm shrink-0">
            €{(r.bruttobetrag || 0).toFixed(2)}
          </span>
        </div>
      </button>
    ))}
  </div>

  {/* Desktop: bestehende Tabelle */}
  <div className="hidden md:block"><Table>…</Table></div>
</>
```