# Vollständige PWA mit sofortigen Updates

## Ziel
Die App soll als 100% installierbare PWA laufen (iOS, Android, Desktop) und neue Versionen müssen ohne manuellen Reload sofort beim Nutzer ankommen.

## Was geändert wird

### 1. `vite.config.ts` – PWA Konfiguration härten
- `registerType: 'autoUpdate'` bleibt
- `devOptions: { enabled: false }` ergänzen (kein SW im Lovable Preview)
- `workbox.skipWaiting: true` und `clientsClaim: true` → neuer SW übernimmt sofort
- `workbox.cleanupOutdatedCaches: true` → alte Caches werden entfernt
- `navigateFallbackDenylist` für interne Routen
- HTML-Navigationen auf `NetworkFirst` mit kurzem Timeout (3s) → frischer Inhalt zuerst, Cache nur als Fallback offline
- Supabase-Cache von `NetworkFirst` mit 24h auf kürzere Strategie reduzieren, damit Datenupdates schneller ankommen
- Manifest erweitern: `id`, `scope: '/'`, zusätzliche Icons (Apple Touch in mehreren Größen, maskable)

### 2. `src/main.tsx` – Service Worker Registrierung
- Registrierung nur außerhalb von iframes / Lovable Preview-Hosts (Guard)
- `useRegisterSW` aus `virtual:pwa-register/react` einsetzen
- Bei `onNeedRefresh` automatisch `updateServiceWorker(true)` aufrufen → Auto-Reload, sobald neue Version verfügbar
- Periodischer Update-Check alle 60 Sekunden via `registration.update()`
- Listener auf `visibilitychange` → Update-Check beim Tab-Aktivieren

### 3. `index.html` – Meta-Tags vervollständigen
- `apple-touch-icon` in verschiedenen Größen (152, 167, 180)
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `theme-color` für Light/Dark Mode (zwei Tags mit `media`)
- Splash-Screen-Hinweise für iOS

### 4. PWA-Icons sicherstellen
- Existierende `/pwa-192x192.png` und `/pwa-512x512.png` prüfen
- Falls nötig zusätzliche Apple-Touch-Icon Größen ergänzen
- `favicon.ico` und `apple-touch-icon.png` in `public/`

### 5. Optional: dezenter „Neue Version verfügbar"-Toast
- Statt sofortigem Hard-Reload kurzer Sonner-Toast „App wird aktualisiert…", dann Reload
- Verhindert Datenverlust bei aktiven Formularen (alternativ: nur Reload wenn keine ungespeicherten Eingaben)

## Technische Details

**Update-Mechanik:**
```text
Build veröffentlicht
   ↓
Browser lädt index.html (NetworkFirst, kein Cache)
   ↓
Neue sw.js wird erkannt → installing → waiting
   ↓
skipWaiting + clientsClaim → sofort aktiv
   ↓
useRegisterSW.onNeedRefresh → updateServiceWorker(true)
   ↓
Reload mit neuer Version
```

**Wichtig:** PWA-Funktionen (Install-Prompt, Offline, Auto-Update) sind nur in der **veröffentlichten** Version aktiv, nicht im Lovable-Editor-Preview – das ist Absicht und verhindert, dass der Service Worker im iframe veraltete Inhalte ausliefert.

## Was NICHT geändert wird
- Kein Refactor der bestehenden Seiten/Karten
- Keine Änderungen an Datenmodell, Auth, RLS
- Bestehender `PWAInstallPrompt` bleibt unverändert
