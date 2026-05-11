# Footer mit Copyright und Versionsnummer

## Ziel
Auf allen Seiten ein dezenter Footer:
`© 2026 Steinbock Chalets · v2.0.0 · Build 11.05.2026 (a1b2c3d)`

## Was geändert wird

### 1. `vite.config.ts` – Build-Infos als globale Konstanten
- `define` ergänzen mit:
  - `__APP_VERSION__` = `"2.0.0"` (aus package.json oder hartcodiert)
  - `__BUILD_DATE__` = aktuelles ISO-Datum zur Build-Zeit
  - `__BUILD_COMMIT__` = `process.env.LOVABLE_COMMIT_SHA` oder via `git rev-parse --short HEAD` (Fallback `'dev'`)

### 2. `src/vite-env.d.ts` – Typdeklarationen
- Globale Konstanten `__APP_VERSION__`, `__BUILD_DATE__`, `__BUILD_COMMIT__` als `string` deklarieren.

### 3. `src/components/layout/Footer.tsx` – neue Komponente
- Eine Zeile, zentriert, `text-xs text-muted-foreground`, dezent
- Inhalt: `© 2026 Steinbock Chalets · v{__APP_VERSION__} · {Build-Datum DE-Format} · {Commit}`
- Padding `py-3`, oberer Border `border-t border-sidebar-border/50`

### 4. `src/components/layout/MainLayout.tsx` – Footer einbinden
- Footer **innerhalb** von `SidebarInset`, nach dem Content-`<div>`
- Auf Mobile mit `mb-16` damit er nicht hinter der `BottomNav` (h-16) verschwindet
- Bestehendes `pb-24 md:pb-8` am Content-Container bleibt, damit Inhalt + Footer Platz über BottomNav haben

## Technische Details
- Jahr im Copyright wird hartkodiert auf `2026` gesetzt (kein dynamisches `new Date().getFullYear()`, da Steinbock Chalets es so wünscht).
- Commit-Hash wird zur Build-Zeit via `child_process.execSync('git rev-parse --short HEAD')` ermittelt; falls nicht verfügbar, Fallback `'dev'`.
- Build-Datum als deutsches Format `dd.MM.yyyy`.

## Was NICHT geändert wird
- Keine Änderungen an Routing, BottomNav-Höhe oder Sidebar.
- Keine neue Route oder Seite.
