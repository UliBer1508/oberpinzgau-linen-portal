**Änderung in `src/pages/Dashboard.tsx` (Zeilen 155–204):**

Die bisherige horizontal scrollbare Tabelle wird ersetzt durch eine responsive Doppel-Ansicht: kompakte Listen-Karten auf Mobile, volle Tabelle ab `md:`.

```tsx
{/* Mobile: kompakte Listen-Ansicht (kein Scrollen) */}
<div className="md:hidden divide-y divide-border/60">
  {recentOrders.map(b => (
    <button
      key={b.id}
      onClick={() => navigate(`/bestellungen/${b.id}`)}
      className={`w-full text-left p-3 ${getBestellungRowClassName(b.status)}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium text-primary">
          #{b.bestellnummer || b.id.slice(-8)}
        </span>
        <StatusBadge status={b.status} />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium truncate min-w-0">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{b.objekt?.name || 'Objekt'}</span>
        </span>
        {b.rechnung ? (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
            b.rechnung.status === 'bezahlt'
              ? 'bg-status-delivered/20 text-status-delivered'
              : 'bg-status-pending/20 text-status-pending'
          }`}>
            {b.rechnung.rechnungsnummer}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">Keine Rg.</span>
        )}
      </div>
    </button>
  ))}
</div>

{/* Desktop: volle Tabelle */}
<div className="hidden md:block">
  <Table>
    {/* bestehender Tabellen-Code */}
  </Table>
</div>
```

**Ergebnis:** Auf Mobile (390 px) zwei kompakte Zeilen pro Bestellung, kein horizontales Scrollen. Ab `md:` bleibt die volle 5-Spalten-Tabelle.