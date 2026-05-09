# Wäschesets in Mobile Bottom-Nav zurückholen

## Hintergrund
Beim letzten Update wurde "Sets" in der mobilen Bottom-Nav durch "Profil" ersetzt, weil Profil auf dem Handy ohne Sidebar sonst nicht erreichbar ist. Die Wäschesets sollen aber wieder direkt von unten zugänglich sein.

## Lösung

In `src/components/layout/BottomNav.tsx`:
- "Profil" entfernen, "Sets" (mit `Package`-Icon, Pfad `/waeschesets`) wieder einsetzen.

In `src/components/layout/MainLayout.tsx`:
- Im Header rechts (neben den `actions`) auf mobil einen kleinen runden Profil-Button einblenden (`md:hidden`), der zu `/profil` navigiert. Icon `UserCog`, Größe ~36 px, daumenfreundlich. Auf Desktop bleibt er ausgeblendet, da dort die Sidebar bereits einen Profil-Eintrag hat.

So bleiben sowohl Wäschesets in der Bottom-Nav als auch Profil auf dem Handy erreichbar.

## Außerhalb des Scope
- Keine Änderungen an Sidebar oder Profil-Seite.
