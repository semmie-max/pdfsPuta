const CACHE = "sputta-v21";
const ASSETS = [
  "/",
  "/index.html",
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Syne:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (url.includes("firebaseapp.com") ||
      url.includes("googleapis.com/identitytoolkit") ||
      url.includes("firestore.googleapis.com") ||
      url.includes("api.cohere.com") ||
      url.includes("securetoken.google.com") ||
      url.includes("gstatic.com/firebasejs")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (e.request.method === "GET" && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match("/"))
  );
});
