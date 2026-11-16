/* LocaLino till service worker.
   Stores the whole app on the tablet so it opens and works with no internet.
   VERSION is rewritten by tools/stamp.js whenever a file changes. */
const VERSION = 'ab44fb70b8';
const CACHE = 'localino-' + VERSION;
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'firebase-config.js',
  'css/app.css', 'js/app.js',
  'vendor/firebase-app-compat.js', 'vendor/firebase-auth-compat.js', 'vendor/firebase-firestore-compat.js',
  'fonts/archivo-latin-500-normal.woff2', 'fonts/archivo-latin-600-normal.woff2',
  'fonts/archivo-latin-700-normal.woff2', 'fonts/archivo-latin-800-normal.woff2',
  'fonts/ibm-plex-mono-latin-500-normal.woff2', 'fonts/ibm-plex-mono-latin-600-normal.woff2',
  'icons/favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  // A new version waits until the person taps "Update now", so it never swaps mid-order.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('localino-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Only ever answer from this version's own cache, so files from two versions are never mixed
// while a newer version is installed and waiting.
const hit = (req) => caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // Firebase and Google sign-in go straight to the network
  if (req.mode === 'navigate') {
    e.respondWith(hit('index.html').then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(hit(req).then((r) => r || fetch(req)));
});
