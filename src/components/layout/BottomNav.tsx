import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingCart, Receipt, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Start' },
  { to: '/objekte', icon: Building2, label: 'Objekte' },
  { to: '/bestellungen', icon: ShoppingCart, label: 'Bestellen' },
  { to: '/rechnungen', icon: Receipt, label: 'Rechnungen' },
  { to: '/waeschesets', icon: Package, label: 'Sets' },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-safe"
      aria-label="Hauptnavigation"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded-2xl transition-all',
                      isActive && 'bg-primary/10'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
