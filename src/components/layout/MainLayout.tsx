import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, LogOut } from 'lucide-react';
import { AppSidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  const navigate = useNavigate();
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-soft">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        <SidebarInset className="bg-transparent min-w-0 w-full overflow-x-hidden">
          <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar/85 backdrop-blur supports-[backdrop-filter]:bg-sidebar/70">
            <div className="flex h-14 md:h-16 items-center gap-3 px-3 md:px-8">
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-base md:text-2xl font-bold text-foreground truncate leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[11px] md:text-sm text-muted-foreground truncate leading-tight">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2 md:gap-3 shrink-0">{actions}</div>}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-full shrink-0"
                onClick={() => navigate('/profil')}
                aria-label="Profil"
              >
                <UserCog className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <div className="p-3 md:p-8 pb-24 md:pb-8 animate-fade-in min-w-0">
            {children}
          </div>
          <Footer />
        </SidebarInset>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
