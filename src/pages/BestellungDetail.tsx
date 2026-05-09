import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
  Receipt,
  Users,
  StickyNote,
  ListOrdered,
  Info,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useBestellung } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { BestellungStatus } from '@/types/database';

const statusSteps: { status: BestellungStatus; label: string; icon: typeof Clock }[] = [
  { status: 'neu', label: 'Neu', icon: Clock },
  { status: 'in_bearbeitung', label: 'In Bearbeitung', icon: Package },
  { status: 'ausgeliefert', label: 'Ausgeliefert', icon: Truck },
  { status: 'abgeholt', label: 'Abgeholt', icon: CheckCircle },
  { status: 'abgeschlossen', label: 'Abgeschlossen', icon: CheckCircle },
];

export default function BestellungDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bestellung, isLoading } = useBestellung(id);

  if (isLoading) {
    return (
      <MainLayout title="Bestellung laden...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!bestellung) {
    return (
      <MainLayout title="Bestellung nicht gefunden">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Diese Bestellung existiert nicht.</p>
          <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => navigate('/bestellungen')}>
            Zurück zur Übersicht
          </Button>
        </div>
      </MainLayout>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === bestellung.status);
  const positionen = bestellung.positionen || [];
  const summe = positionen.reduce(
    (sum, p) => sum + (p.waescheartikel?.preis || 0) * p.menge,
    0
  );

  // ========= Reusable building blocks =========

  const StatusTracker = (
    <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/15 text-info">
          <Truck className="h-4 w-4" />
        </div>
        <h2 className="font-display text-base md:text-lg font-bold">Bestellstatus</h2>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;
            return (
              <div key={step.status} className="relative flex items-center gap-3">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isCurrent && <p className="text-xs text-primary">Aktueller Status</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Positionen = (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 p-3 md:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <ListOrdered className="h-4 w-4" />
          </div>
          <h2 className="font-display text-base md:text-lg font-bold">Positionen</h2>
        </div>
        <span className="text-sm font-semibold">
          €{summe.toFixed(2)}
        </span>
      </div>
      {positionen.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Keine Positionen</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 md:px-6 py-2 text-left font-medium text-muted-foreground">Artikel</th>
                <th className="px-3 md:px-6 py-2 text-center font-medium text-muted-foreground">Menge</th>
                <th className="px-3 md:px-6 py-2 text-right font-medium text-muted-foreground">Preis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {positionen.map((position, index) => (
                <tr key={index}>
                  <td className="px-3 md:px-6 py-3 font-medium text-card-foreground">
                    {position.waescheartikel?.name || 'Unbekannter Artikel'}
                  </td>
                  <td className="px-3 md:px-6 py-3 text-center text-muted-foreground">
                    {position.menge}
                  </td>
                  <td className="px-3 md:px-6 py-3 text-right whitespace-nowrap text-card-foreground">
                    {position.waescheartikel?.preis
                      ? `€${(position.waescheartikel.preis * position.menge).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Details = (
    <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Info className="h-4 w-4" />
        </div>
        <h2 className="font-display text-base md:text-lg font-bold">Bestelldetails</h2>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:block md:space-y-4">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Objekt
          </dt>
          <dd className="mt-0.5 font-medium text-card-foreground truncate">
            {bestellung.objekt?.name || '—'}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" /> Status
          </dt>
          <dd className="mt-0.5">
            <StatusBadge status={bestellung.status} />
          </dd>
        </div>
        {bestellung.gastname && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Gast
            </dt>
            <dd className="mt-0.5 font-medium text-card-foreground truncate">
              {bestellung.gastname}
            </dd>
          </div>
        )}
        {bestellung.lieferdatum && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" /> Lieferung
            </dt>
            <dd className="mt-0.5 font-medium text-card-foreground">
              {format(new Date(bestellung.lieferdatum), 'dd.MM.yyyy', { locale: de })}
            </dd>
          </div>
        )}
        {bestellung.abholdatum && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Abholung
            </dt>
            <dd className="mt-0.5 font-medium text-card-foreground">
              {format(new Date(bestellung.abholdatum), 'dd.MM.yyyy', { locale: de })}
            </dd>
          </div>
        )}
        {bestellung.notizen && (
          <div className="col-span-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" /> Notizen
            </dt>
            <dd className="mt-0.5 text-card-foreground">{bestellung.notizen}</dd>
          </div>
        )}
      </dl>
    </div>
  );

  const Rechnung = (
    <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <Receipt className="h-4 w-4" />
        </div>
        <h2 className="font-display text-base md:text-lg font-bold">Rechnung</h2>
      </div>
      {bestellung.rechnung ? (
        <Link
          to={`/rechnungen/${bestellung.rechnung.id}`}
          className="block p-3 rounded-2xl border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-card-foreground truncate">
                {bestellung.rechnung.rechnungsnummer}
              </p>
              <p className="text-sm text-muted-foreground">
                €{(bestellung.rechnung.bruttobetrag || 0).toFixed(2)}
              </p>
            </div>
            <StatusBadge status={bestellung.rechnung.status} />
          </div>
        </Link>
      ) : (
        <div className="text-center py-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Noch keine Rechnung</p>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout
      title={`#${bestellung.bestellnummer || bestellung.id.slice(-4).toUpperCase()}`}
      subtitle={format(new Date(bestellung.created_at), 'dd. MMMM yyyy', { locale: de })}
      actions={
        <Button variant="ghost" size="sm" className="rounded-2xl" onClick={() => navigate('/bestellungen')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Zurück</span>
        </Button>
      }
    >
      {/* MOBILE: Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-2xl h-auto p-1 bg-muted">
            <TabsTrigger value="status" className="rounded-xl flex flex-col gap-0.5 py-2 text-[11px]">
              <Truck className="h-4 w-4" /> Status
            </TabsTrigger>
            <TabsTrigger value="positionen" className="rounded-xl flex flex-col gap-0.5 py-2 text-[11px]">
              <ListOrdered className="h-4 w-4" /> Pos.
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-xl flex flex-col gap-0.5 py-2 text-[11px]">
              <Info className="h-4 w-4" /> Info
            </TabsTrigger>
            <TabsTrigger value="rechnung" className="rounded-xl flex flex-col gap-0.5 py-2 text-[11px]">
              <Receipt className="h-4 w-4" /> Rg.
            </TabsTrigger>
          </TabsList>
          <TabsContent value="status" className="mt-3">{StatusTracker}</TabsContent>
          <TabsContent value="positionen" className="mt-3">{Positionen}</TabsContent>
          <TabsContent value="details" className="mt-3">{Details}</TabsContent>
          <TabsContent value="rechnung" className="mt-3">{Rechnung}</TabsContent>
        </Tabs>

        {/* Sticky summary bar on mobile */}
        <div className="mt-4 rounded-2xl border border-border/60 bg-card p-3 shadow-card flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Gesamtsumme</span>
          <span className="font-display text-lg font-bold">€{summe.toFixed(2)}</span>
        </div>
      </div>

      {/* DESKTOP: 2-column grid */}
      <div className="hidden md:grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {StatusTracker}
          {Positionen}
        </div>
        <div className="space-y-6">
          {Details}
          {Rechnung}
        </div>
      </div>
    </MainLayout>
  );
}
