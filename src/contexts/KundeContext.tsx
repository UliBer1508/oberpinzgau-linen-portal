import React, { createContext, useContext, useState, useEffect } from 'react';

interface KundeContextType {
  selectedKundeId: string | null;
  setSelectedKundeId: (id: string | null) => void;
}

const KundeContext = createContext<KundeContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_kunde_id';

export function KundeProvider({ children }: { children: React.ReactNode }) {
  const [selectedKundeId, setSelectedKundeId] = useState<string | null>(() => {
    // Aus localStorage laden
    return localStorage.getItem(STORAGE_KEY);
  });

  // In localStorage speichern wenn sich die Auswahl ändert
  useEffect(() => {
    if (selectedKundeId) {
      localStorage.setItem(STORAGE_KEY, selectedKundeId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedKundeId]);

  return (
    <KundeContext.Provider value={{ selectedKundeId, setSelectedKundeId }}>
      {children}
    </KundeContext.Provider>
  );
}

export function useKundeContext() {
  const context = useContext(KundeContext);
  if (context === undefined) {
    throw new Error('useKundeContext must be used within a KundeProvider');
  }
  return context;
}
