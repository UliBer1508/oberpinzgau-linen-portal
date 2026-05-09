import { ReactNode } from 'react';
import { AppSidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-soft">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        <SidebarInset className="bg-transparent">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-4 md:px-8">
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2 md:gap-3">{actions}</div>}
            </div>
          </header>

          <div className="p-4 md:p-8 pb-24 md:pb-8 animate-fade-in">
            {children}
          </div>
        </SidebarInset>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
