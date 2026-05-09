import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, Plus, Minus, Loader2, Package, ShoppingCart, ArrowLeft, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKunde, useObjekte, useWaescheSets, useWaescheArtikel, useCreateBestellung } from '@/hooks/useSupabaseData';

// Farb-Styles für Artikel-Badges
const FARB_STYLES: Record<string, string> = {
  "Weiß": "bg-white border border-gray-300 text-gray-800",
  "Weiß gestreift": "bg-white border border-gray-300 text-gray-800",
  "Grau": "bg-gray-400 text-white",
  "Grau gestreift": "bg-gray-400 text-white",
  "Braun": "bg-amber-700 text-white",
  "Bunt": "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-white"
};

const getFarbStyle = (farbe: string | null) => {
  if (!farbe) return 'bg-muted text-muted-foreground';
  return FARB_STYLES[farbe] || 'bg-muted text-muted-foreground';
};

const formatPreis = (preis: number | null) => {
  if (preis === null || preis === undefined) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(preis);
};

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
  
  // Buchungsdaten
  const [gastname, setGastname] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [anzahlPersonen, setAnzahlPersonen] = useState<number>(1);

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

  // Artikel hinzufügen (Default-Menge = Anzahl Personen)
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
      return [...prev, { artikel_id: art.id, artikel_name: art.name, menge: anzahlPersonen, preis: art.preis || 0 }];
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
        gastname: gastname || null,
        check_in: checkIn ? format(checkIn, 'yyyy-MM-dd') : null,
        check_out: checkOut ? format(checkOut, 'yyyy-MM-dd') : null,
        anzahl_personen: anzahlPersonen || null,
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
                      {objekt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Buchungsdaten (optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Buchungsdaten (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Gastname</label>
                <Input
                  placeholder="Name des Gastes..."
                  value={gastname}
                  onChange={(e) => setGastname(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-In</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkIn && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP', { locale: de }) : 'Datum wählen'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        initialFocus
                        locale={de}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-Out</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkOut && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP', { locale: de }) : 'Datum wählen'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        initialFocus
                        locale={de}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Anzahl Personen</label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setAnzahlPersonen(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 min-w-[80px] justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-medium">{anzahlPersonen}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setAnzahlPersonen(prev => prev + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wäscheset auswählen (optional) */}
          {waescheSets && waescheSets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Schnellauswahl: Wäscheset</CardTitle>
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
              <CardTitle className="text-lg">4. Artikel hinzufügen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(artikelByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((art) => {
                      const inOrder = orderItems.find(item => item.artikel_id === art.id);
                      return (
                        <div
                          key={art.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                            inOrder
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          )}
                        >
                          {/* Artikel-Bild oder Platzhalter */}
                          {art.bild_url ? (
                            <img
                              src={art.bild_url}
                              alt={art.name}
                              className="w-12 h-12 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{art.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{art.artikelnummer}</span>
                              {art.farbe && (
                                <Badge variant="outline" className={cn("text-xs px-1.5 py-0", getFarbStyle(art.farbe))}>
                                  {art.farbe}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{formatPreis(art.preis)}</div>
                          </div>

                          {/* Mengen-Steuerung */}
                          {inOrder ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(art.id, -1)}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <span className="min-w-[2rem] text-center font-medium text-sm">{inOrder.menge}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(art.id, 1)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => handleAddArtikel(art)}
                            >
                              <Plus className="h-4 w-4" />
                              {anzahlPersonen}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Zusätzliche Informationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">5. Zusätzliche Informationen</CardTitle>
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
