import { registerSW } from 'virtual:pwa-register';

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes('id-preview--') ||
  window.location.hostname.includes('lovableproject.com') ||
  window.location.hostname.includes('lovable.dev');

export function setupPWA() {
  // Im Lovable-Editor / iframe: Service Worker konsequent abmelden
  if (isPreviewHost || isInIframe) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    return;
  }

  if (!('serviceWorker' in navigator)) return;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Sofortiges automatisches Update
      updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // Periodischer Update-Check (alle 60s)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60_000);

      // Update-Check, sobald Tab wieder aktiv wird
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    },
  });
}
