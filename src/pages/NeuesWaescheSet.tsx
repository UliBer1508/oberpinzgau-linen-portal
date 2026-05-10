import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useKunde, useObjekte, useWaescheArtikel, useWaescheSets, useCreateWaescheSet, useUpdateWaescheSet } from '@/hooks/useSupabaseData';
import { Loader2, Plus, Minus, X, Package, ArrowLeft, Users, Calendar } from 'lucide-react';
import type { WaescheArtikel, Objekt, BerechnungsArt } from '@/types/database';

interface PendingSetArtikel {
  id: string;
  artikel_id: string;
  artikelName: string;
  artikelNummer: string;
  kategorie: string | null;
  farbe: string | null;
  preis: number | null;
  menge: number;
  berechnungsart: BerechnungsArt;
}

const FARB_STYLES: Record<string, string> = {
  "Weiß": "bg-white border border-gray-300 text-gray-800",
  "Weiß gestreift": "bg-white border border-gray-300 text-gray-800",
  "Grau": "bg-gray-400 text-white",
  "Grau gestreift": "bg-gray-400 text-white",
  "Braun": "bg-amber-700 text-white",
  "Bunt": "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-white"
};

const NeuesWaescheSet = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = !!editId;
  const { toast } = useToast();
  
  const { data: kunde, isLoading: kundeLoading } = useKunde();
  const { data: objekte, isLoading: objekteLoading } = useObjekte(kunde?.id);
  const { data: artikel, isLoading: artikelLoading } = useWaescheArtikel();
  const { data: existingSets } = useWaescheSets(kunde?.id);
  const createWaescheSet = useCreateWaescheSet();
  const updateWaescheSet = useUpdateWaescheSet();

  const [selectedObjektId, setSelectedObjektId] = useState<string>('');
  const [beschreibung, setBeschreibung] = useState('');
  const [pendingArtikel, setPendingArtikel] = useState<PendingSetArtikel[]>([]);
  const [setName, setSetName] = useState('');
  const [setNameTouched, setSetNameTouched] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const editingSet = useMemo(
    () => (isEdit ? existingSets?.find(s => s.id === editId) : undefined),
    [isEdit, existingSets, editId]
  );

  // Prefill state when editing
  useEffect(() => {
    if (!isEdit || prefilled || !editingSet) return;
    setSelectedObjektId(editingSet.objekt_id);
    setSetName(editingSet.name);
    setSetNameTouched(true);
    setBeschreibung(editingSet.beschreibung ?? '');
    setPendingArtikel(
      editingSet.artikel.map(a => ({
        id: a.id,
        artikel_id: a.artikel_id,
        artikelName: a.waescheartikel?.name ?? '',
        artikelNummer: a.waescheartikel?.artikelnummer ?? '',
        kategorie: a.waescheartikel?.kategorie ?? null,
        farbe: a.waescheartikel?.farbe ?? null,
        preis: a.waescheartikel?.preis ?? null,
        menge: a.menge,
        berechnungsart: a.berechnungsart,
      }))
    );
    setPrefilled(true);
  }, [isEdit, editingSet, prefilled]);

  const selectedObjekt = objekte?.find(o => o.id === selectedObjektId);

  // Auto-generierter Set-Name
  const autoSetName = useMemo(() => {
    if (!kunde || !selectedObjekt) return '';
    
    const kundeName = kunde.firma || kunde.name;
    const baseName = `${kundeName} - ${selectedObjekt.name}`;
    
    // Zähle existierende Sets für dieses Objekt
    const existingSetsForObjekt = existingSets?.filter(s => s.objekt_id === selectedObjektId) || [];
    const count = existingSetsForObjekt.length;
    
    if (count <= 0) return baseName;
    return `${baseName} ${count + 1}`;
  }, [kunde, selectedObjekt, existingSets, selectedObjektId]);

  // Vorschlag übernehmen, solange Nutzer das Feld nicht selbst bearbeitet hat
  useEffect(() => {
    if (!setNameTouched) setSetName(autoSetName);
  }, [autoSetName, setNameTouched]);

  // Artikel nach Kategorie gruppieren
  const artikelByKategorie = useMemo(() => {
    if (!artikel) return {};
    
    return artikel.reduce((acc, art) => {
      const kategorie = art.kategorie || 'Sonstige';
      if (!acc[kategorie]) acc[kategorie] = [];
      acc[kategorie].push(art);
      return acc;
    }, {} as Record<string, WaescheArtikel[]>);
  }, [artikel]);

  // Gesamtpreis berechnen
  const gesamtpreis = useMemo(() => {
    return pendingArtikel.reduce((sum, a) => {
      if (a.preis !== null) {
        return sum + (a.menge * a.preis);
      }
      return sum;
    }, 0);
  }, [pendingArtikel]);

  const addArtikel = (art: WaescheArtikel) => {
    const existing = pendingArtikel.find(p => p.artikel_id === art.id);
    if (existing) {
      // Menge erhöhen
      setPendingArtikel(prev => 
        prev.map(p => p.artikel_id === art.id ? { ...p, menge: p.menge + 1 } : p)
      );
    } else {
      // Neuen Artikel hinzufügen
      setPendingArtikel(prev => [...prev, {
        id: `temp-${Date.now()}-${art.id}`,
        artikel_id: art.id,
        artikelName: art.name,
        artikelNummer: art.artikelnummer,
        kategorie: art.kategorie,
        farbe: art.farbe,
        preis: art.preis,
        menge: 1,
        berechnungsart: 'pro_buchung'
      }]);
    }
  };

  const updateMenge = (artikelId: string, delta: number) => {
    setPendingArtikel(prev => 
      prev.map(p => {
        if (p.artikel_id === artikelId) {
          const neueMenge = Math.max(1, p.menge + delta);
          return { ...p, menge: neueMenge };
        }
        return p;
      })
    );
  };

  const toggleBerechnungsart = (artikelId: string) => {
    setPendingArtikel(prev => 
      prev.map(p => {
        if (p.artikel_id === artikelId) {
          return { 
            ...p, 
            berechnungsart: p.berechnungsart === 'pro_buchung' ? 'pro_gast' : 'pro_buchung' 
          };
        }
        return p;
      })
    );
  };

  const removeArtikel = (artikelId: string) => {
    setPendingArtikel(prev => prev.filter(p => p.artikel_id !== artikelId));
  };

  const handleSubmit = async () => {
    if (!selectedObjektId) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie ein Objekt aus.',
        variant: 'destructive'
      });
      return;
    }

    if (pendingArtikel.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte fügen Sie mindestens einen Artikel hinzu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const artikelPayload = pendingArtikel.map(a => ({
        artikelId: a.artikel_id,
        menge: a.menge,
        berechnungsart: a.berechnungsart,
      }));

      if (isEdit && editId) {
        await updateWaescheSet.mutateAsync({
          setId: editId,
          name: setName.trim() || autoSetName,
          beschreibung: beschreibung || undefined,
          artikel: artikelPayload,
        });
        toast({ title: 'Gespeichert', description: 'Wäscheset wurde aktualisiert.' });
      } else {
        await createWaescheSet.mutateAsync({
          objektId: selectedObjektId,
          name: setName.trim() || autoSetName,
          beschreibung: beschreibung || undefined,
          artikel: artikelPayload,
        });
        toast({ title: 'Erfolg', description: 'Wäscheset wurde erfolgreich erstellt.' });
      }

      navigate('/waeschesets');
    } catch (error) {
      toast({
        title: 'Fehler',
        description: isEdit ? 'Set konnte nicht aktualisiert werden.' : 'Set konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    }
  };

  const isLoading = kundeLoading || objekteLoading || artikelLoading;

  if (isLoading) {
    return (
      <MainLayout title="Neues Wäscheset" subtitle="Set erstellen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const formatPreis = (preis: number | null) => {
    if (preis === null || preis === undefined) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(preis);
  };

  const getFarbStyle = (farbe: string | null) => {
    if (!farbe) return 'bg-muted text-muted-foreground';
    return FARB_STYLES[farbe] || 'bg-muted text-muted-foreground';
  };

  return (
    <MainLayout
      title={isEdit ? 'Wäscheset bearbeiten' : 'Neues Wäscheset'}
      subtitle={isEdit ? 'Bestehendes Set anpassen' : 'Erstellen Sie ein neues Wäscheset'}
    >
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/waeschesets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Wäschesets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte: Formular */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schritt 1: Objekt auswählen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Objekt auswählen
              </CardTitle>
              <CardDescription>Für welches Objekt soll das Set erstellt werden?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedObjektId} onValueChange={setSelectedObjektId} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Objekt auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {objekte?.map(obj => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.name} ({obj.objektnummer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit && (
                <p className="text-xs text-muted-foreground mt-2">Das Objekt eines bestehenden Sets kann nicht geändert werden.</p>
              )}
            </CardContent>
          </Card>

          {/* Schritt 2: Set-Informationen */}
          {selectedObjektId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Set-Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Set-Name</Label>
                  <Input
                    value={setName}
                    onChange={e => {
                      setSetName(e.target.value);
                      setSetNameTouched(true);
                    }}
                    placeholder={autoSetName || 'Set-Name eingeben...'}
                  />
                  {setNameTouched && setName !== autoSetName && (
                    <button
                      type="button"
                      onClick={() => {
                        setSetName(autoSetName);
                        setSetNameTouched(false);
                      }}
                      className="text-xs text-muted-foreground hover:text-primary mt-1"
                    >
                      Vorschlag übernehmen
                    </button>
                  )}
                </div>
                <div>
                  <Label>Beschreibung (optional)</Label>
                  <Textarea 
                    value={beschreibung}
                    onChange={e => setBeschreibung(e.target.value)}
                    placeholder="Optionale Beschreibung für dieses Set..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schritt 3: Artikel hinzufügen */}
          {selectedObjektId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Artikel hinzufügen
                </CardTitle>
                <CardDescription>Klicken Sie auf einen Artikel, um ihn zum Set hinzuzufügen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(artikelByKategorie).map(([kategorie, arts]) => (
                    <div key={kategorie}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">{kategorie}</h4>
                      <div className="space-y-2">
                        {arts.map(art => {
                          const inSet = pendingArtikel.find(p => p.artikel_id === art.id);
                          return (
                            <div
                              key={art.id}
                              className={`rounded-md border transition ${
                                inSet ? 'border-primary bg-primary/5' : 'border-border'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => !inSet && addArtikel(art)}
                                className="w-full flex items-center gap-2 p-3 text-left min-h-14"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{art.name}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] text-muted-foreground">{art.artikelnummer}</span>
                                    {art.farbe && (
                                      <Badge variant="outline" className={`text-[10px] px-1 ${getFarbStyle(art.farbe)}`}>
                                        {art.farbe}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs font-medium shrink-0">{formatPreis(art.preis)}</span>
                              </button>

                              {inSet && (
                                <div className="px-3 pb-3 pt-0 space-y-2 border-t border-primary/20">
                                  <div className="flex items-center justify-between gap-2 pt-2">
                                    <div className="flex items-center gap-1">
                                      <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => updateMenge(art.id, -1)}>
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-10 text-center text-base font-semibold">{inSet.menge}</span>
                                      <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => updateMenge(art.id, 1)}>
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive" onClick={() => removeArtikel(art.id)} aria-label="Entfernen">
                                      <X className="h-5 w-5" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
                                    <Button
                                      type="button"
                                      variant={inSet.berechnungsart === 'pro_buchung' ? 'default' : 'ghost'}
                                      size="sm"
                                      className="h-10 text-sm"
                                      onClick={() => inSet.berechnungsart !== 'pro_buchung' && toggleBerechnungsart(art.id)}
                                    >
                                      <Calendar className="h-4 w-4 mr-1.5" /> Pro Buchung
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={inSet.berechnungsart === 'pro_gast' ? 'default' : 'ghost'}
                                      size="sm"
                                      className="h-10 text-sm"
                                      onClick={() => inSet.berechnungsart !== 'pro_gast' && toggleBerechnungsart(art.id)}
                                    >
                                      <Users className="h-4 w-4 mr-1.5" /> Pro Gast
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rechte Spalte: Set-Übersicht */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Set-Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingArtikel.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Noch keine Artikel hinzugefügt
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingArtikel.map(art => (
                    <div key={art.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate flex-1">
                        <span className="font-medium">{art.menge}×</span> {art.artikelName}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {art.berechnungsart === 'pro_gast' ? 'pro Gast' : 'pro Buchung'}
                      </Badge>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between font-medium">
                    <span>Gesamtpreis:</span>
                    <span className="text-lg">{formatPreis(gesamtpreis)}</span>
                  </div>

                  <Button
                    className="w-full mt-4"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={createWaescheSet.isPending || pendingArtikel.length === 0}
                  >
                    {createWaescheSet.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      'Set speichern'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default NeuesWaescheSet;
