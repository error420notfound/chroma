/* global PWA */
const cachePrefix = `chroma-pwa:${PWA.base}:`;
const cacheName = `${cachePrefix}${PWA.version}`;
const urls = new Map(
  PWA.precache.map(({ url, revision }) => [new URL(url, self.location.origin).href, revision]),
);
const offlineUrl = new URL(`${PWA.base}offline/`, self.location.origin).href;
const homeUrl = new URL(PWA.base, self.location.origin).href;

function safeResponse(response) {
  return (
    response.status === 200 &&
    response.type === 'basic' &&
    !response.redirected &&
    !/(?:no-store|private)/i.test(response.headers.get('cache-control') || '') &&
    response.headers.get('vary') !== '*'
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(cacheName);
        // Installation succeeds only when the complete shell is available.
        for (const [url, revision] of urls) {
          const download = new URL(url);
          download.searchParams.set('__chroma_revision', revision);
          const response = await fetch(
            new Request(download, { cache: 'reload', credentials: 'same-origin' }),
          );
          if (!safeResponse(response)) throw new Error(`Cannot precache ${url}`);
          const digest = await crypto.subtle.digest(
            'SHA-256',
            await response.clone().arrayBuffer(),
          );
          const actual = [...new Uint8Array(digest)]
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
          if (actual !== revision) throw new Error(`Deployment content mismatch for ${url}`);
          await cache.put(url, response);
        }
      } catch (error) {
        await caches.delete(cacheName);
        throw error;
      }
      // Let open tabs finish using the old version; never force a draft-losing reload.
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await Promise.all(
        (await caches.keys())
          .filter((key) => key.startsWith(cachePrefix) && key !== cacheName)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(PWA.base)
  )
    return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // HTML stays fresh online. Do not save arbitrary catalogue routes or errors.
          return await fetch(new Request(request, { cache: 'no-cache' }));
        } catch {
          const cache = await caches.open(cacheName);
          const fallback =
            url.pathname === PWA.base || `${url.pathname}/` === PWA.base
              ? await cache.match(homeUrl)
              : await cache.match(offlineUrl);
          if (fallback) {
            // navigator.onLine can remain true when the connection is unusable.
            const headers = new Headers(fallback.headers);
            headers.delete('content-length');
            headers.delete('content-encoding');
            return new Response(
              (await fallback.text()).replace('<html', '<html data-chroma-offline'),
              {
                status: 200,
                headers,
              },
            );
          }
          return new Response('Chroma is offline. Reconnect and try again.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      })(),
    );
  } else if (urls.has(url.href)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(cacheName);
        return (await cache.match(request)) || fetch(request);
      })(),
    );
  }
});
