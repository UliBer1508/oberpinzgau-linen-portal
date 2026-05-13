import { useState } from 'react';
import { Lock, Loader2, User as UserIcon, Mail } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/external/client';
import { z } from 'zod';

const pwSchema = z.object({
  password: z.string().min(8, 'Mindestens 8 Zeichen').max(72, 'Maximal 72 Zeichen'),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Passwörter stimmen nicht überein',
  path: ['password2'],
});

export default function Profil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = pwSchema.safeParse({ password, password2 });
    if (!parsed.success) {
      toast({ title: 'Fehler', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      return;
    }
    setPassword('');
    setPassword2('');
    toast({ title: 'Passwort aktualisiert', description: 'Ihr neues Passwort wurde gespeichert.' });
  };

  return (
    <MainLayout title="Profil" subtitle="Konto- und Sicherheitseinstellungen" backTo="/dashboard">
      <div className="max-w-2xl space-y-6">
        <section className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Konto</h2>
              <p className="text-sm text-muted-foreground">Ihre Anmeldedaten</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-Mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input value={user?.email ?? ''} readOnly disabled className="pl-10 h-12" />
            </div>
          </div>
        </section>

        <form onSubmit={handleSavePassword} className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Passwort ändern</h2>
              <p className="text-sm text-muted-foreground">Mindestens 8 Zeichen</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pw1">Neues Passwort</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pw1"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw2">Passwort wiederholen</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pw2"
                type="password"
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="pl-10 h-12"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Passwort speichern'}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
