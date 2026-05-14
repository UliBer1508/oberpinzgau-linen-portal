## Problem

Auf Windows (Edge/Chrome) wird die App nicht installierbar angezeigt, obwohl Manifest, Service Worker und HTTPS vorhanden sind. Ursache liegt in den Icon-Dateien unter `public/`:

| Datei | Manifest sagt | Tatsächlich |
|---|---|---|
| `public/pwa-192x192.png` | PNG, 192×192 | PNG, **1024×1024** |
| `public/pwa-512x512.png` | PNG, 512×512 | **JPEG** (mit .png-Endung), 512×512 |

Chromium prüft auf Windows die Install-Kriterien strenger als auf Android/iOS: Mindestens ein Icon muss exakt 192×192 **und** mindestens eines exakt 512×512 sein, beide echtes PNG, und für `purpose: "any"` (für Installierbarkeit zwingend) verfügbar. Wenn die Maße oder das Bildformat nicht stimmen, fällt das Icon stillschweigend aus den Install-Kriterien — der Install-Button erscheint nicht, ohne sichtbaren Fehler.

Zusätzlich wird `pwa-512x512.png` dreimal im Manifest gelistet (einmal `any`, einmal `maskable`, einmal nochmal `any`) — das ist redundant und das maskable-Icon hat keine Safe-Zone, sieht auf Windows-Kachel beschnitten aus.

## Plan

1. **Icons neu erzeugen** aus dem vorhandenen 1024×1024 Quellbild (`public/pwa-192x192.png`):
   - `public/pwa-192x192.png` → echte PNG, 192×192
   - `public/pwa-512x512.png` → echte PNG, 512×512
   - `public/pwa-512x512-maskable.png` → echte PNG, 512×512, mit ~10 % Padding (Safe-Zone) auf transparentem/farbigem Hintergrund für maskable.

2. **`vite.config.ts` Manifest aufräumen**:
   ```ts
   icons: [
     { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
     { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
     { src: '/pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
   ]
   ```
   Doppelte Einträge entfernen, klare Trennung `any` vs. `maskable`.

3. **`index.html` Apple-Touch-Icon korrigieren**: Verweise auf `pwa-192x192.png` mit Größenangabe `180x180`/`167x167`/`152x152` sind falsch (das Bild ist 192). Ein dediziertes 180×180 PNG wäre sauberer, aber für Windows-Installierbarkeit nicht relevant — kann optional ergänzt werden.

4. **Verifizieren**: Nach Deploy in Edge/Chrome unter Windows → DevTools → Application → Manifest. Dort wird unter „Installability" jeder fehlende Punkt aufgelistet. Erwartung: keine Warnungen mehr, „Install"-Icon erscheint in der Adressleiste.

## Hinweise

- Die Korrektur wirkt erst auf der **veröffentlichten** Version (`oberpinzgau-linen-portal.lovable.app`) — im Lovable-Preview-iframe ist der Service Worker bewusst deaktiviert (siehe `src/pwa.ts`), dort wird PWA-Install nie angeboten.
- Nutzer, die schon einmal versucht haben zu installieren, müssen evtl. einmal Hard-Reload (Ctrl+Shift+R) machen, damit das neue Manifest gezogen wird.
- Der existierende `PWAInstallPrompt` triggert nur, wenn der Browser `beforeinstallprompt` feuert — was er auf Windows erst tut, sobald die Icons stimmen.
