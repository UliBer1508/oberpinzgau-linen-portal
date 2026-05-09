import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isIos = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  // iPad on iOS 13+ reports as Mac with touch
  const iPadOS = navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1;
  return /iphone|ipad|ipod/.test(ua) || iPadOS;
};

const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari
  (window.navigator as any).standalone === true;

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // iOS: kein beforeinstallprompt → eigener Hinweis
    if (isIos()) {
      const t = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIos()) {
      setShowIosHint(true);
      return;
    }
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
    setShowIosHint(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground">App installieren</h3>

            {showIosHint ? (
              <div className="mt-2 text-sm text-muted-foreground space-y-2">
                <p>So installierst du die App auf deinem iPhone/iPad:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Tippe unten auf das Teilen-Symbol{' '}
                    <Share className="inline h-4 w-4 align-text-bottom" />
                  </li>
                  <li>Wähle „Zum Home-Bildschirm"</li>
                  <li>Bestätige mit „Hinzufügen"</li>
                </ol>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="mt-2">
                  Verstanden
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  Installiere das Kundenportal für schnelleren Zugriff – wie eine native App.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall}>
                    {isIos() ? 'Anleitung anzeigen' : 'Installieren'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    Später
                  </Button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
