import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, Plus, Minus, Loader2, Package, ShoppingCart, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKunde, useObjekte, useWaescheSets, useWaescheArtikel, useCreateBestellung } from '@/hooks/useSupabaseData';

interface OrderItem {
  artikel_id: string;
  artikel_name: string;
  menge: number;
  preis: number;
}

export default function NeueBestellung() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte, isLoading: objekteLoading } = useObjekte(kunde?.id);
  const { data: waescheSets, isLoading: setsLoading } = useWaescheSets(kunde?.id);
  const { data: artikel, isLoading: artikelLoading } = useWaescheArtikel();
  const createBestellung = useCreateBestellung();
  
  const [selectedObjektId, setSelectedObjektId] = useState<string>('');
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [bemerkungen, setBemerkungen] = useState('');
  const [lieferdatum, setLieferdatum] = useState<Date>();

  const isLoading = kundeLoading || objekteLoading || setsLoading || artikelLoading;

  // Helper to format address from separate fields
  const formatAdresse = (objekt: NonNullable<typeof objekte>[0]) => {
    return [objekt.strasse, objekt.plz, objekt.ort].filter(Boolean).join(', ');
  };

  // Artikel nach Kategorie gruppieren
  const artikelByCategory = useMemo(() => {
    if (!artikel) return {};
    return artikel.reduce((acc, art) => {
      const category = art.kategorie || 'Sonstige';
      if (!acc[category]) acc[category] = [];
      acc[category].push(art);
      return acc;
    }, {} as Record<string, typeof artikel>);
  }, [artikel]);

  // Set auswählen und Artikel hinzufügen
  const handleSetSelect = (setId: string) => {
    setSelectedSetId(setId);
    const selectedSet = waescheSets?.find(s => s.id === setId);
    if (selectedSet?.artikel) {
      const newItems: OrderItem[] = selectedSet.artikel.map(a => ({
        artikel_id: a.artikel_id,
        artikel_name: a.waescheartikel?.name || 'Unbekannt',
        menge: a.menge,
        preis: a.waescheartikel?.preis || 0,
      }));
      setOrderItems(newItems);
    }
  };

  // Artikel hinzufügen
  const handleAddArtikel = (art: { id: string; name: string; preis: number | null }) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.artikel_id === art.id);
      if (existing) {
        return prev.map(item =>
          item.artikel_id === art.id
            ? { ...item, menge: item.menge + 1 }
            : item
        );
      }
      return [...prev, { artikel_id: art.id, artikel_name: art.name, menge: 1, preis: art.preis || 0 }];
    });
  };

  // Menge ändern
  const handleQuantityChange = (artikelId: string, delta: number) => {
    setOrderItems(prev =>
      prev
        .map(item =>
          item.artikel_id === artikelId
            ? { ...item, menge: Math.max(0, item.menge + delta) }
            : item
        )
        .filter(item => item.menge > 0)
    );
  };

  // Gesamtpreis berechnen
  const totalPrice = orderItems.reduce((sum, item) => sum + item.preis * item.menge, 0);

  // Bestellung absenden
  const handleSubmit = async () => {
    if (!selectedObjektId) {
      toast({ title: 'Fehler', description: 'Bitte wählen Sie ein Objekt aus.', variant: 'destructive' });
      return;
    }
    if (orderItems.length === 0) {
      toast({ title: 'Fehler', description: 'Bitte fügen Sie mindestens einen Artikel hinzu.', variant: 'destructive' });
      return;
    }

    try {
      await createBestellung.mutateAsync({
        objekt_id: selectedObjektId,
        notizen: bemerkungen || null,
        lieferdatum: lieferdatum ? format(lieferdatum, 'yyyy-MM-dd') : null,
        positionen: orderItems.map(item => ({
          artikel_id: item.artikel_id,
          menge: item.menge,
        })),
      });

      toast({ title: 'Erfolg', description: 'Bestellung wurde erfolgreich erstellt.' });
      navigate('/bestellungen');
    } catch (error) {
      toast({ title: 'Fehler', description: 'Bestellung konnte nicht erstellt werden.', variant: 'destructive' });
    }
  };

  if (!kunde) {
    return (
      <MainLayout title="Neue Bestellung">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Bitte wählen Sie zuerst einen Kunden aus.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout title="Neue Bestellung">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Neue Bestellung" 
      subtitle="Erstellen Sie eine neue Wäschebestellung"
      actions={
        <Button variant="outline" onClick={() => navigate('/bestellungen')}>
          <ArrowLeft className="h-4 w-4" />
          Abbrechen
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Linke Spalte: Formular */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objekt auswählen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Objekt auswählen</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedObjektId} onValueChange={setSelectedObjektId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Objekt wählen..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {objekte?.map((objekt) => (
                    <SelectItem key={objekt.id} value={objekt.id}>
                      {objekt.name} - {formatAdresse(objekt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Wäscheset auswählen (optional) */}
          {waescheSets && waescheSets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Schnellauswahl: Wäscheset</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedSetId} onValueChange={handleSetSelect}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Set auswählen (optional)..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {waescheSets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name} ({set.artikel?.length || 0} Artikel)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Artikel auswählen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Artikel hinzufügen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(artikelByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => handleAddArtikel(art)}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                      >
                        <div>
                          <p className="font-medium text-sm">{art.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(art.preis || 0).toFixed(2)} €
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Zusätzliche Informationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Zusätzliche Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Gewünschtes Lieferdatum</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !lieferdatum && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lieferdatum ? format(lieferdatum, 'PPP', { locale: de }) : 'Datum auswählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={lieferdatum}
                      onSelect={setLieferdatum}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Bemerkungen</label>
                <Textarea
                  placeholder="Besondere Hinweise oder Wünsche..."
                  value={bemerkungen}
                  onChange={(e) => setBemerkungen(e.target.value)}
                  className="bg-background"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte: Bestellübersicht */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Bestellübersicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Noch keine Artikel ausgewählt
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.artikel_id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.artikel_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.preis.toFixed(2)} € × {item.menge}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.artikel_id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.menge}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.artikel_id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-border pt-3 mt-4">
                      <div className="flex justify-between font-medium">
                        <span>Gesamt</span>
                        <span>{totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-6"
                  onClick={handleSubmit}
                  disabled={orderItems.length === 0 || !selectedObjektId || createBestellung.isPending}
                >
                  {createBestellung.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird erstellt...
                    </>
                  ) : (
                    'Bestellung aufgeben'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
