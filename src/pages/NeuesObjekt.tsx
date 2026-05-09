import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, Save } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKunde } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/external/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ObjektTyp } from '@/types/database';

const TYPEN: { value: ObjektTyp; label: string }[] = [
  { value: 'ferienwohnung', label: 'Ferienwohnung' },
  { value: 'ferienhaus', label: 'Ferienhaus' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'pension', label: 'Pension' },
  { value: 'sonstige', label: 'Sonstige' },
];

export default function NeuesObjekt() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: kunde } = useKunde();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    typ: 'ferienwohnung' as ObjektTyp,
    strasse: '',
    plz: '',
    ort: '',
    ansprechpartner: '',
    telefon: '',
    notizen: '',
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kunde?.id) {
      toast.error('Kein Kunde ausgewählt');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Bitte einen Namen angeben');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('objekte')
      .insert({
        kunde_id: kunde.id,
        name: form.name.trim(),
        typ: form.typ,
        strasse: form.strasse || null,
        plz: form.plz || null,
        ort: form.ort || null,
        ansprechpartner: form.ansprechpartner || null,
        telefon: form.telefon || null,
        notizen: form.notizen || null,
      })
      .select()
      .single();
    setSaving(false);

    if (error) {
      toast.error('Fehler beim Speichern: ' + error.message);
      return;
    }
    toast.success('Objekt angelegt');
    queryClient.invalidateQueries({ queryKey: ['objekte'] });
    navigate(`/objekte/${data.id}`);
  };

  return (
    <MainLayout
      title="Neues Objekt"
      subtitle="Neues Standort/Objekt anlegen"
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate('/objekte')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Zurück</span>
        </Button>
      }
    >
      <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold">Stammdaten</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="z.B. Apartment Bergblick"
                required
                className="rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="typ">Typ</Label>
              <Select value={form.typ} onValueChange={(v) => update('typ', v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPEN.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="strasse">Straße</Label>
              <Input
                id="strasse"
                value={form.strasse}
                onChange={(e) => update('strasse', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="plz">PLZ</Label>
              <Input
                id="plz"
                value={form.plz}
                onChange={(e) => update('plz', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="ort">Ort</Label>
              <Input
                id="ort"
                value={form.ort}
                onChange={(e) => update('ort', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="ansprechpartner">Ansprechpartner</Label>
              <Input
                id="ansprechpartner"
                value={form.ansprechpartner}
                onChange={(e) => update('ansprechpartner', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                value={form.telefon}
                onChange={(e) => update('telefon', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notizen">Notizen</Label>
              <Textarea
                id="notizen"
                value={form.notizen}
                onChange={(e) => update('notizen', e.target.value)}
                rows={3}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 sticky bottom-20 md:bottom-0">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={() => navigate('/objekte')}
          >
            Abbrechen
          </Button>
          <Button type="submit" variant="hero" className="flex-1 rounded-2xl" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Speichern
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}
