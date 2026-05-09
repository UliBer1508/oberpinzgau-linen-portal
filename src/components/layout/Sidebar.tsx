import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  ShoppingCart, 
  Package, 
  LogOut,
  ClipboardList,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/objekte', icon: Building2, label: 'Objekte' },
  { to: '/bestellungen', icon: ShoppingCart, label: 'Bestellungen' },
  { to: '/rechnungen', icon: Receipt, label: 'Rechnungen' },
  { to: '/waeschesets', icon: Package, label: 'Wäschesets' },
  { to: '/artikel', icon: ClipboardList, label: 'Artikelkatalog' },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold">Wäsche Oberpinzgau</span>
              <span className="truncate text-xs text-sidebar-foreground/60">Kundenportal</span>
            </div>
          )}
          <SidebarTrigger className="ml-auto h-8 w-8 shrink-0" />
        </div>
      </SidebarHeader>


      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
                    tooltip={item.label}
                  >
                    <NavLink to={item.to}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User section */}
      <SidebarFooter className="border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium">{user?.user_metadata?.name || user?.email?.split('@')[0]}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Abmelden">
              <LogOut className="h-5 w-5" />
              <span>Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
