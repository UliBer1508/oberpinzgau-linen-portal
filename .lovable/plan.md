# App installierbar machen

## Gute Nachricht: Ist bereits eingerichtet ✅

Deine App ist **schon eine PWA** (Progressive Web App) und kann auf jedem Smartphone, Tablet oder Desktop installiert werden – komplett ohne App Store. Das ist in `vite.config.ts` mit `vite-plugin-pwa` konfiguriert (Manifest, Icons 192/512px, Service Worker, Offline-Cache für Supabase).

## So installieren Nutzer die App heute schon

**Voraussetzung:** Die App muss **veröffentlicht** sein (Publish-Button oben rechts). Im Editor-Preview funktioniert die Installation nicht.

| Gerät | Anleitung |
|---|---|
| **iPhone / iPad (Safari)** | Teilen-Symbol ⬆️ → "Zum Home-Bildschirm" |
| **Android (Chrome)** | Menü ⋮ → "App installieren" / "Zum Startbildschirm hinzufügen" |
| **Desktop (Chrome/Edge)** | Install-Icon ⊕ in der Adressleiste |

Nach der Installation:
- Eigenes Icon auf dem Home-Screen
- Vollbild ohne Browser-Leiste
- Offline-Fähigkeit für bereits geladene Daten (24h Cache)
- Fühlt sich an wie eine native App

## Was noch verbessert werden könnte (optional)

Aktuell muss der Nutzer selbst wissen, wie man installiert. Wir könnten zusätzlich folgendes einbauen:

### Option A – Install-Banner (empfohlen)
Ein dezentes Banner am unteren Bildschirmrand: *"Installiere Wäsche Portal als App"* mit "Installieren"-Button. Nutzt die native `beforeinstallprompt`-API auf Android/Desktop und zeigt iOS-Nutzern eine Anleitung mit dem Teilen-Symbol.

### Option B – /install-Seite
Eigene Route `/install` mit großem Button + bebilderter Anleitung pro Gerätetyp. Verlinkbar (z.B. per QR-Code oder E-Mail an Kunden).

### Option C – Beides kombiniert
Banner für Erstbesucher + dedizierte Seite für gezielte Verlinkung.

## Wenn du eine "echte" native App im App Store willst

Das ist ein anderer Weg (Capacitor + Apple Developer Account 99 €/Jahr + Google Play 25 € einmalig + Mac mit Xcode für iOS). Sag Bescheid, wenn das später relevant wird – die PWA kann jederzeit parallel weiterlaufen.

## Mein Vorschlag

1. Jetzt: App **publishen** (falls noch nicht geschehen) und auf deinem Handy testen
2. Danach: **Option A (Install-Banner)** umsetzen, damit Kunden nicht raten müssen

Soll ich Option A direkt einbauen?
