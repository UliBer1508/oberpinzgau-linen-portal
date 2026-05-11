## Ziel
Auf dem Handy soll immer ein Abmelde-Button sichtbar sein. Aktuell existiert Logout nur in der Desktop-Sidebar, daher fehlt auf Mobile (BottomNav-Layout) jede Möglichkeit, sich abzumelden.

## Umsetzung

1. **Mobiler Header (`src/components/layout/MainLayout.tsx` bzw. zugehöriger Mobile-Header)**
   - Oben rechts ein `LogOut`-Icon (lucide-react) als Icon-Button platzieren.
   - Nur auf Mobile sichtbar (`md:hidden`), da Desktop-Sidebar bereits einen Abmelden-Eintrag hat.
   - onClick → `logout()` aus `useAuth()`, danach `navigate('/login')`.
   - Bestätigungs-Dialog (AlertDialog von shadcn) vor dem Abmelden, um versehentliche Klicks zu vermeiden.

2. **Login-Zugang**
   - Nicht nötig: `ProtectedRoute` leitet automatisch nach `/login` um, sobald keine Session mehr besteht.

## Nicht Teil dieses Plans
- Keine Änderungen am Auth-Flow, Backend oder an der Desktop-Sidebar.
- Kein Google-Login (separater Wunsch, falls gewünscht eigener Plan).
