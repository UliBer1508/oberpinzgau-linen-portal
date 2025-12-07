import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

// ⚠️ ENTWICKLUNGSMODUS - Auf false setzen um Auth zu aktivieren
const DEV_MODE = true;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock-User für Entwicklung
const mockUser = {
  id: 'dev-user-123',
  email: 'dev@example.com',
  app_metadata: {},
  user_metadata: { name: 'Dev User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const mockSession = {
  access_token: 'dev-token',
  refresh_token: 'dev-refresh',
  user: mockUser,
} as Session;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // DEV_MODE: Authentifizierung umgehen
  if (DEV_MODE) {
    return (
      <AuthContext.Provider
        value={{
          user: mockUser,
          session: mockSession,
          isAuthenticated: true,
          isLoading: false,
          login: async () => ({ error: null }),
          logout: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  // Normaler Auth-Code wird hier nicht erreicht wenn DEV_MODE = true
  return <AuthProviderReal>{children}</AuthProviderReal>;
}

// Originaler Auth Provider für Produktion
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

function AuthProviderReal({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setIsLoading(false);
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
