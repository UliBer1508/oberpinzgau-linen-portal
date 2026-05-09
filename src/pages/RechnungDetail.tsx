import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Printer, Download, Package, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { OverdueBadge } from '@/components/OverdueBadge';
import { useRechnung } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';

export default function RechnungDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: rechnung, isLoading } = useRechnung(id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <MainLayout title="Rechnung" subtitle="Wird geladen...">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!rechnung) {
    return (
      <MainLayout title="Rechnung nicht gefunden">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">Rechnung nicht gefunden</h2>
          <Button asChild className="mt-4">
            <Link to="/rechnungen">Zurück zur Übersicht</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Rechnung ${rechnung.rechnungsnummer}`}
      subtitle={`vom ${format(new Date(rechnung.rechnungsdatum), 'dd. MMMM yyyy', { locale: de })}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/rechnungen">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Zurück</span>
            </Link>
          </Button>
          <StatusBadge status={rechnung.status} />
          <OverdueBadge 
            faelligkeitsdatum={rechnung.faelligkeitsdatum} 
            status={rechnung.status} 
          />
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Drucken</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Rechnungsdetails */}
          <Card className="lg:col-span-2 lg:order-none order-last">
            <CardHeader>
              <CardTitle>Rechnungsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 md:px-6">
              {/* Adressen */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Rechnungsempfänger</h4>
                  <div className="text-sm">
                    <p className="font-medium">{rechnung.kunde_name}</p>
                    {rechnung.kunde_firma && <p>{rechnung.kunde_firma}</p>}
                    {rechnung.kunde_strasse && <p>{rechnung.kunde_strasse}</p>}
                    {(rechnung.kunde_plz || rechnung.kunde_ort) && (
                      <p>
                        {rechnung.kunde_plz} {rechnung.kunde_ort}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Rechnungsdaten</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kundennummer:</span>
                      <span>{rechnung.kunde_kundennummer || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rechnungsdatum:</span>
                      <span>
                        {format(new Date(rechnung.rechnungsdatum), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                    {rechnung.faelligkeitsdatum && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fällig am:</span>
                        <span className={cn(
                          rechnung.status === 'offen' && new Date() > new Date(rechnung.faelligkeitsdatum)
                            ? 'text-destructive font-medium'
                            : ''
                        )}>
                          {format(new Date(rechnung.faelligkeitsdatum), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Positionen */}
              <div>
                <h4 className="mb-4 text-sm font-medium">Rechnungspositionen</h4>

                {/* Mobile: Karten-Liste */}
                <div className="md:hidden space-y-2">
                  {rechnung.positionen?.map((position) => (
                    <div key={position.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{position.bezeichnung}</p>
                          <p className="font-mono text-xs text-muted-foreground">{position.artikelnummer}</p>
                        </div>
                        <p className="font-semibold text-sm shrink-0">
                          {formatCurrency(position.gesamtpreis)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {position.menge} × {formatCurrency(position.einzelpreis)}
                      </p>
                    </div>
                  ))}

                  <div className="mt-3 space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nettobetrag</span>
                      <span>{formatCurrency(rechnung.nettobetrag)}</span>
                    </div>
                    {rechnung.bearbeitungsgebuehr > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bearbeitungsgebühr</span>
                        <span>{formatCurrency(rechnung.bearbeitungsgebuehr)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MwSt. ({rechnung.mwst_satz}%)</span>
                      <span>{formatCurrency(rechnung.mwst_betrag)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold pt-1">
                      <span>Bruttobetrag</span>
                      <span>{formatCurrency(rechnung.bruttobetrag)}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop: Tabelle */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Art.-Nr.</TableHead>
                        <TableHead>Bezeichnung</TableHead>
                        <TableHead className="text-right">Menge</TableHead>
                        <TableHead className="text-right">Einzelpreis</TableHead>
                        <TableHead className="text-right">Gesamt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rechnung.positionen?.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-mono text-sm">
                            {position.artikelnummer}
                          </TableCell>
                          <TableCell>{position.bezeichnung}</TableCell>
                          <TableCell className="text-right">{position.menge}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(position.einzelpreis)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(position.gesamtpreis)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">
                          Nettobetrag
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(rechnung.nettobetrag)}
                        </TableCell>
                      </TableRow>
                      {rechnung.bearbeitungsgebuehr > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-right">
                            Bearbeitungsgebühr
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(rechnung.bearbeitungsgebuehr)}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">
                          MwSt. ({rechnung.mwst_satz}%)
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(rechnung.mwst_betrag)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          Bruttobetrag
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(rechnung.bruttobetrag)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seitenleiste */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={rechnung.status} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Netto</span>
                    <span>{formatCurrency(rechnung.nettobetrag)}</span>
                  </div>
                  {rechnung.bearbeitungsgebuehr > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bearbeitungsgebühr</span>
                      <span>{formatCurrency(rechnung.bearbeitungsgebuehr)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MwSt. ({rechnung.mwst_satz}%)</span>
                    <span>{formatCurrency(rechnung.mwst_betrag)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Gesamt</span>
                    <span>{formatCurrency(rechnung.bruttobetrag)}</span>
                  </div>
                </div>
                {rechnung.bezahlt_am && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bezahlt am</span>
                      <span>
                        {format(new Date(rechnung.bezahlt_am), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
              {(rechnung.status === 'offen' || rechnung.status === 'mahnung') && (
                <div className="px-6 pb-6">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() =>
                      toast.info('Zahlungsfunktion wird in Kürze aktiviert', {
                        description: 'Stripe-Integration ist noch nicht freigeschaltet.',
                      })
                    }
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Jetzt bezahlen
                  </Button>
                </div>
              )}
            </Card>

            {/* Linked Order */}
            {rechnung.bestellung && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Zugehörige Bestellung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link 
                    to={`/bestellungen/${rechnung.bestellung.id}`}
                    className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-mono font-medium text-primary">
                      #{rechnung.bestellung.bestellnummer}
                    </p>
                    {rechnung.bestellung.objekt?.name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {rechnung.bestellung.objekt.name}
                      </p>
                    )}
                    {rechnung.bestellung.lieferdatum && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <ArrowRight className="h-3 w-3" />
                        <span>{format(new Date(rechnung.bestellung.lieferdatum), 'dd.MM.yyyy', { locale: de })}</span>
                      </div>
                    )}
                  </Link>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
