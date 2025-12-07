import { useState } from 'react';
import { ShoppingCart, Filter, Search, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockBestellungen } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { BestellungStatus } from '@/types/database';

const statusFilters: { label: string; value: BestellungStatus | 'alle' }[] = [
  { label: 'Alle', value: 'alle' },
  { label: 'Ausstehend', value: 'ausstehend' },
  { label: 'In Bearbeitung', value: 'in_bearbeitung' },
  { label: 'In Wäscherei', value: 'in_waescherei' },
  { label: 'Bereit', value: 'bereit' },
  { label: 'Geliefert', value: 'geliefert' },
];

export default function Bestellungen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BestellungStatus | 'alle'>('alle');

  const filteredBestellungen = mockBestellungen.filter((bestellung) => {
    const matchesSearch = bestellung.objekt_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'alle' || bestellung.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateTotal = (positionen: typeof mockBestellungen[0]['positionen']) => {
    return positionen.reduce((sum, pos) => sum + (pos.preis || 0), 0);
  };

  return (
    <MainLayout 
      title="Bestellungen" 
      subtitle="Verwalten Sie Ihre Wäschebestellungen"
      actions={
        <Button variant="hero" onClick={() => navigate('/bestellungen/neu')}>
          <Plus className="h-4 w-4" />
          Neue Bestellung
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Bestellungen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Bestellung
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Objekt
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Artikel
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Lieferdatum
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Summe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBestellungen.map((bestellung, index) => (
                <tr 
                  key={bestellung.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/bestellungen/${bestellung.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          #{bestellung.id.slice(-4).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(bestellung.created_at), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-card-foreground">{bestellung.objekt_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={bestellung.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {bestellung.positionen.length} Positionen
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {bestellung.lieferdatum 
                      ? format(new Date(bestellung.lieferdatum), 'dd.MM.yyyy', { locale: de })
                      : '—'
                    }
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-card-foreground">
                    €{calculateTotal(bestellung.positionen).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBestellungen.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Keine Bestellungen gefunden
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Passen Sie Ihre Filter an oder erstellen Sie eine neue Bestellung.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
