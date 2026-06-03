const CACHE_NAME = 'crazy-oma-cache-v2'; // Version erhöht, um Update auszulösen
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg'
];

// Service Worker installieren
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Anfragen zwischenspeichern und zurückgeben
self.addEventListener('fetch', event => {
  // Wir kümmern uns nur um GET-Anfragen.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Anfragen an die Gemini API nicht zwischenspeichern
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Strategie: Zuerst Netzwerk, dann Cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Überprüfen, ob wir eine gültige Antwort erhalten haben
        if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
          // Wenn die Netzwerkanfrage fehlschlägt oder ungültig ist, den Cache versuchen
          return caches.match(event.request).then(cacheResponse => {
            return cacheResponse || response;
          });
        }

        // WICHTIG: Die Antwort klonen. Eine Antwort ist ein Stream
        // und da wir wollen, dass der Browser die Antwort konsumiert
        // sowie der Cache die Antwort konsumiert, müssen wir
        // sie klonen, damit wir zwei Streams haben.
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Netzwerkanfrage fehlgeschlagen, versuche es aus dem Cache zu holen.
        return caches.match(event.request);
      })
  );
});


// Service Worker aktualisieren
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
