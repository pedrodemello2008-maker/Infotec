// GreenShot — Service Worker
// Estratégia: "cache-first" para os arquivos do app-shell (funciona offline
// depois da primeira visita) com atualização em segundo plano.

const CACHE_NAME = "greenshot-cache-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./app.html",
  "./styles.css",
  "./app.css",
  "./script.js",
  "./app.js",
  "./ecosystem-3d.js",
  "./manifest.json",
  "./assets/favicon.png",
  "./assets/logo-greenshot.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-32.png",
  "./assets/icons/favicon-16.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Só trata requisições GET; deixa o resto passar direto.
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          // Cacheia também respostas de CDNs externos (ex.: three.js), que
          // chegam como "opaque" em requisições no-cors — não dá para checar
          // o status, mas ainda podem ser salvas para uso offline.
          if (response && (response.ok || response.type === "opaque")) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});
