import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase parses the recovery hash automatically and emits PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Fehler', description: 'Mindestens 8 Zeichen.', variant: 'destructive' });
      return;
    }
    if (password !== password2) {
      toast({ title: 'Fehler', description: 'Passwörter stimmen nicht überein.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Passwort aktualisiert', description: 'Sie sind jetzt angemeldet.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-floating">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Neues Passwort</h1>
          <p className="text-sm text-muted-foreground text-center">Setzen Sie ein neues Passwort für Ihr Konto.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          {!ready && (
            <p className="text-sm text-muted-foreground text-center">
              Öffnen Sie den Link aus Ihrer E-Mail, um Ihr Passwort zurückzusetzen.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="pw1">Neues Passwort</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input id="pw1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" disabled={!ready} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw2">Passwort wiederholen</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input id="pw2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="pl-10 h-12" disabled={!ready} />
            </div>
          </div>
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading || !ready}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Passwort speichern'}
          </Button>
        </form>
      </div>
    </div>
  );
}
