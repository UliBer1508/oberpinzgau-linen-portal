Header in den gleichen Mintton wie die Sidebar bringen.

**Änderung in `src/components/layout/MainLayout.tsx` (Zeile 23):**

Aktuell: `bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60`

Neu: `bg-sidebar/85 backdrop-blur supports-[backdrop-filter]:bg-sidebar/70 border-sidebar-border`

So nutzt der Header die `--sidebar-background`-Token (heller Mintton) und passt visuell zur Sidebar. Der Border wird ebenfalls auf `border-sidebar-border` umgestellt für einen sauberen Übergang.

Textfarben (`text-foreground`, `text-muted-foreground`) bleiben unverändert, da sie auf dem hellen Mintton ausreichend Kontrast haben (gleicher Hintergrund wie Sidebar, wo sie bereits funktionieren).