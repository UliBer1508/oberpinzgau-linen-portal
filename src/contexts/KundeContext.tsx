import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/external/client';
import { useAuth } from './AuthContext';
import type { Kunde } from '@/types/database';

interface KundeContextType {
  selectedKundeId: string | null;
  setSelectedKundeId: (id: string | null) => void;
  kunde: Kunde | null;
  isLoading: boolean;
}

const KundeContext = createContext<KundeContextType | undefined>(undefined);

export function KundeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const { data: kunde, isLoading } = useQuery({
    queryKey: ['current_kunde', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('kunden')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Kunde) ?? null;
    },
    enabled: isAuthenticated && !!user,
  });

  // Backwards compatibility: keep selectedKundeId derived from auth
  const [selectedKundeId, setSelectedKundeId] = useState<string | null>(null);
  useEffect(() => {
    setSelectedKundeId(kunde?.id ?? null);
  }, [kunde?.id]);

  return (
    <KundeContext.Provider value={{ selectedKundeId, setSelectedKundeId, kunde: kunde ?? null, isLoading }}>
      {children}
    </KundeContext.Provider>
  );
}

export function useKundeContext() {
  const ctx = useContext(KundeContext);
  if (!ctx) throw new Error('useKundeContext must be used within KundeProvider');
  return ctx;
}
