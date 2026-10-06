const offlineNotice = document.querySelector<HTMLElement>('[data-offline-notice]');
const updateNotice = document.querySelector<HTMLElement>('[data-pwa-update]');
const scope = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;
function showConnectivity() {
  if (offlineNotice)
    offlineNotice.hidden =
      navigator.onLine && !document.documentElement.hasAttribute('data-chroma-offline');
}
showConnectivity();
window.addEventListener('online', () => {
  if (document.documentElement.hasAttribute('data-chroma-offline')) {
    // A browser connectivity event is only a hint; confirm cached pages can reconnect.
    void fetch(scope, { method: 'HEAD', cache: 'no-store' })
      .then((response) => {
        if (response.ok) document.documentElement.removeAttribute('data-chroma-offline');
        showConnectivity();
      })
      .catch(() => {});
  } else showConnectivity();
});
window.addEventListener('offline', showConnectivity);

if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  const showUpdate = () => {
    if (updateNotice) updateNotice.hidden = false;
  };
  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${scope}sw.js`, {
        scope,
        updateViaCache: 'none',
      });
      if (registration.waiting) showUpdate();
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
        });
      });
      const checkUpdate = () => {
        if (navigator.onLine) void registration.update().catch(() => {});
      };
      window.addEventListener('online', checkUpdate);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkUpdate();
      });
    } catch {
      // Install support is optional; browsing and local drafts continue normally.
    }
  };
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => void register(), { once: true });
}
