import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Package, Plus, Minus, ShoppingCart } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockObjekte, mockArtikel, mockWaescheSets } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  artikel_id: string;
  artikel_name: string;
  menge: number;
}

export default function NeueBestellung() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedObjekt, setSelectedObjekt] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notizen, setNotizen] = useState('');
  const [lieferdatum, setLieferdatum] = useState('');

  const handleSetSelect = (setId: string) => {
    setSelectedSet(setId);
    const waescheSet = mockWaescheSets.find(s => s.id === setId);
    if (waescheSet) {
      setOrderItems(waescheSet.artikel.map(a => ({
        artikel_id: a.artikel_id,
        artikel_name: a.artikel_name,
        menge: a.menge,
      })));
    }
  };

  const handleAddArtikel = (artikel: typeof mockArtikel[0]) => {
    const existing = orderItems.find(item => item.artikel_id === artikel.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.artikel_id === artikel.id
          ? { ...item, menge: item.menge + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        artikel_id: artikel.id,
        artikel_name: artikel.name,
        menge: 1,
      }]);
    }
  };

  const handleQuantityChange = (artikelId: string, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.artikel_id === artikelId) {
        const newMenge = Math.max(0, item.menge + delta);
        return newMenge === 0 ? null : { ...item, menge: newMenge };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const handleSubmit = () => {
    if (!selectedObjekt) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie ein Objekt aus.',
        variant: 'destructive',
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte fügen Sie mindestens einen Artikel hinzu.',
        variant: 'destructive',
      });
      return;
    }

    // Mock submission
    toast({
      title: 'Bestellung erstellt',
      description: 'Ihre Bestellung wurde erfolgreich aufgegeben. (Demo-Modus)',
    });
    navigate('/bestellungen');
  };

  const kategorien = [...new Set(mockArtikel.map(a => a.kategorie))];

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
        {/* Left: Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Object Selection */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Objekt auswählen
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mockObjekte.map((objekt) => (
                <button
                  key={objekt.id}
                  onClick={() => setSelectedObjekt(objekt.id)}
                  className={`
                    flex items-center gap-3 rounded-lg border p-4 text-left transition-all
                    ${selectedObjekt === objekt.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <Building2 className={`h-5 w-5 ${selectedObjekt === objekt.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-card-foreground">{objekt.name}</p>
                    <p className="text-sm text-muted-foreground">{objekt.anzahl_zimmer} Zimmer</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Set Selection */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Schnellauswahl: Wäscheset
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {mockWaescheSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => handleSetSelect(set.id)}
                  className={`
                    rounded-lg border p-4 text-left transition-all
                    ${selectedSet === set.id 
                      ? 'border-accent bg-accent/5 ring-2 ring-accent/20' 
                      : 'border-border hover:border-accent/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <p className="font-medium text-card-foreground">{set.name}</p>
                  <p className="text-sm text-muted-foreground">{set.artikel.length} Artikel</p>
                </button>
              ))}
            </div>
          </div>

          {/* Article Selection */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Artikel hinzufügen
            </h2>
            {kategorien.map((kategorie) => (
              <div key={kategorie} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{kategorie}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {mockArtikel.filter(a => a.kategorie === kategorie).map((artikel) => {
                    const inOrder = orderItems.find(i => i.artikel_id === artikel.id);
                    return (
                      <button
                        key={artikel.id}
                        onClick={() => handleAddArtikel(artikel)}
                        className={`
                          flex items-center justify-between rounded-lg border p-3 text-left transition-all
                          ${inOrder 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-border hover:border-primary/30 hover:bg-muted/50'
                          }
                        `}
                      >
                        <span className="text-sm font-medium text-card-foreground">{artikel.name}</span>
                        <div className="flex items-center gap-2">
                          {artikel.preis_pro_stueck && (
                            <span className="text-xs text-muted-foreground">
                              €{artikel.preis_pro_stueck.toFixed(2)}
                            </span>
                          )}
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Zusätzliche Informationen
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lieferdatum">Gewünschtes Lieferdatum</Label>
                <Input
                  id="lieferdatum"
                  type="date"
                  value={lieferdatum}
                  onChange={(e) => setLieferdatum(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notizen">Notizen</Label>
                <Textarea
                  id="notizen"
                  placeholder="Besondere Anweisungen oder Hinweise..."
                  value={notizen}
                  onChange={(e) => setNotizen(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Bestellübersicht
            </h2>

            {orderItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Noch keine Artikel ausgewählt
              </p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.artikel_id} className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground flex-1">{item.artikel_name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.artikel_id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.menge}</span>
                      <button
                        onClick={() => handleQuantityChange(item.artikel_id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-card-foreground">Gesamt Artikel</span>
                <span className="font-semibold text-card-foreground">
                  {orderItems.reduce((sum, item) => sum + item.menge, 0)}
                </span>
              </div>
              <Button 
                variant="hero" 
                className="w-full" 
                onClick={handleSubmit}
                disabled={orderItems.length === 0 || !selectedObjekt}
              >
                Bestellung aufgeben
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
