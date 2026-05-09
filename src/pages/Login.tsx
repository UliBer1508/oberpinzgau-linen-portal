import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Ungültige E-Mail'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
});

const registerSchema = z.object({
  email: z.string().trim().email('Ungültige E-Mail'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
  vorname: z.string().trim().min(1, 'Pflichtfeld').max(100),
  nachname: z.string().trim().min(1, 'Pflichtfeld').max(100),
});

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: 'Fehler', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await login(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (error) {
      toast({ title: 'Anmeldung fehlgeschlagen', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Willkommen zurück!' });
    navigate('/dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ email, password, vorname, nachname });
    if (!parsed.success) {
      toast({ title: 'Fehler', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name: `${parsed.data.vorname} ${parsed.data.nachname}` },
      },
    });
    if (error) {
      setLoading(false);
      toast({ title: 'Registrierung fehlgeschlagen', description: error.message, variant: 'destructive' });
      return;
    }
    // Update kunde with vorname/nachname after signup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('kunden').update({
        vorname: parsed.data.vorname,
        nachname: parsed.data.nachname,
        name: `${parsed.data.vorname} ${parsed.data.nachname}`,
      }).eq('auth_user_id', user.id);
    }
    setLoading(false);
    toast({ title: 'Konto erstellt!', description: 'Sie sind jetzt angemeldet.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6 animate-slide-up">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-floating">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-center">Wäsche Oberpinzgau</h1>
          <p className="text-sm text-muted-foreground text-center">Ihr Kundenportal für professionelle Wäscheservices</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-12">
            <TabsTrigger value="login" className="text-base">Anmelden</TabsTrigger>
            <TabsTrigger value="register" className="text-base">Registrieren</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="login-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" placeholder="ihre@email.at" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" placeholder="••••••••" />
                </div>
              </div>
              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Anmelden'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <form onSubmit={handleRegister} className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-vorname">Vorname</Label>
                  <Input id="reg-vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} className="h-12" placeholder="Max" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-nachname">Nachname</Label>
                  <Input id="reg-nachname" value={nachname} onChange={(e) => setNachname(e.target.value)} className="h-12" placeholder="Muster" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="reg-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" placeholder="ihre@email.at" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Passwort (min. 8 Zeichen)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" placeholder="••••••••" />
                </div>
              </div>
              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Konto erstellen'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Adresse, Bankdaten und weitere Profildaten ergänzen Sie nach der Anmeldung.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
