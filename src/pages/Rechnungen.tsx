import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { FileText, Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useRechnungen } from '@/hooks/useSupabaseData';
import { useKundeContext } from '@/contexts/KundeContext';
import { RechnungStatus } from '@/integrations/supabase/client';

export default function Rechnungen() {
  const { selectedKundeId } = useKundeContext();
  const { data: rechnungen = [], isLoading } = useRechnungen(selectedKundeId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RechnungStatus | 'alle'>('alle');

  const filteredRechnungen = rechnungen.filter((rechnung) => {
    const matchesSearch =
      rechnung.rechnungsnummer.toLowerCase().includes(search.toLowerCase()) ||
      rechnung.kunde_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'alle' || rechnung.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <MainLayout title="Rechnungen" subtitle="Übersicht aller Rechnungen">
      <div className="space-y-6">

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-medium">Alle Rechnungen</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Suchen..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as RechnungStatus | 'alle')}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Status</SelectItem>
                    <SelectItem value="offen">Offen</SelectItem>
                    <SelectItem value="bezahlt">Bezahlt</SelectItem>
                    <SelectItem value="storniert">Storniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredRechnungen.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Keine Rechnungen</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || statusFilter !== 'alle'
                    ? 'Keine Rechnungen für die aktuelle Filterung gefunden.'
                    : 'Es wurden noch keine Rechnungen erstellt.'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rechnungsnummer</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Kunde</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRechnungen.map((rechnung) => (
                      <TableRow key={rechnung.id}>
                        <TableCell className="font-medium">
                          {rechnung.rechnungsnummer}
                        </TableCell>
                        <TableCell>
                          {format(new Date(rechnung.rechnungsdatum), 'dd.MM.yyyy', {
                            locale: de,
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rechnung.kunde_name}</p>
                            {rechnung.kunde_firma && (
                              <p className="text-sm text-muted-foreground">
                                {rechnung.kunde_firma}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(rechnung.bruttobetrag)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={rechnung.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/rechnungen/${rechnung.id}`}>
                              Anzeigen
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
