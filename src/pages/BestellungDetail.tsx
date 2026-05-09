import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, FileText, Package, Truck, CheckCircle, Clock, Loader2, Receipt } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
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
          <Button variant="outline" className="mt-4" onClick={() => navigate('/bestellungen')}>
            Zurück zur Übersicht
          </Button>
        </div>
      </MainLayout>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.status === bestellung.status);

  return (
    <MainLayout 
      title={`Bestellung #${bestellung.bestellnummer || bestellung.id.slice(-4).toUpperCase()}`}
      subtitle={`Erstellt am ${format(new Date(bestellung.created_at), 'dd. MMMM yyyy', { locale: de })}`}
      actions={
        <Button variant="outline" onClick={() => navigate('/bestellungen')}>
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-6">
              Bestellstatus
            </h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.status} className="relative flex items-center gap-4">
                      <div className={`
                        relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors
                        ${isCompleted 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border bg-background text-muted-foreground'
                        }
                        ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-primary">Aktueller Status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Bestellpositionen
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Artikel
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">
                    Menge
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                    Preis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bestellung.positionen?.map((position, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 font-medium text-card-foreground">
                      {position.waescheartikel?.name || 'Unbekannter Artikel'}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {position.menge}
                    </td>
                    <td className="px-6 py-4 text-right text-card-foreground">
                      {position.waescheartikel?.preis 
                        ? `€${(position.waescheartikel.preis * position.menge).toFixed(2)}` 
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Bestelldetails
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Objekt
                </dt>
                <dd className="mt-1 font-medium text-card-foreground">
                  {bestellung.objekt?.name || '—'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Status
                </dt>
                <dd className="mt-1">
                  <StatusBadge status={bestellung.status} />
                </dd>
              </div>
              {bestellung.gastname && (
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    Gastname
                  </dt>
                  <dd className="mt-1 font-medium text-card-foreground">
                    {bestellung.gastname}
                  </dd>
                </div>
              )}
              {bestellung.abholdatum && (
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Abholdatum
                  </dt>
                  <dd className="mt-1 font-medium text-card-foreground">
                    {format(new Date(bestellung.abholdatum), 'dd. MMMM yyyy', { locale: de })}
                  </dd>
                </div>
              )}
              {bestellung.lieferdatum && (
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    Lieferdatum
                  </dt>
                  <dd className="mt-1 font-medium text-card-foreground">
                    {format(new Date(bestellung.lieferdatum), 'dd. MMMM yyyy', { locale: de })}
                  </dd>
                </div>
              )}
              {bestellung.notizen && (
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Notizen
                  </dt>
                  <dd className="mt-1 text-card-foreground">
                    {bestellung.notizen}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Linked Invoice */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Zugehörige Rechnung
              </div>
            </h2>
            {bestellung.rechnung ? (
              <Link 
                to={`/rechnungen/${bestellung.rechnung.id}`}
                className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">
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
              <div className="text-center py-4 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Noch keine Rechnung erstellt</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Aktionen
            </h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" disabled>
                Bestellung stornieren
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Bestellung duplizieren
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Aktionen werden bald verfügbar sein
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
