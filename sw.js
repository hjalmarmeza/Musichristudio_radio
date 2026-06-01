const CACHE_NAME = "musichris-radio-cache-v5";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./assets/musichris_logo.png",
  "./assets/cover.png",
  "./assets/banner.png",
  "./assets/world_map_seamless_color.png"
];

// Install Event: cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate strategy
// This guarantees fast loading from cache, while updating resources in the background.
// Note: We bypass caching for external audio stream URLs and API database queries (like Firebase REST)!
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypass cache for audio streaming, Firebase, and ALL external API calls
  const externalApis = [
    "sslip.io",
    "oraclecloud.com",
    "earthquake.usgs.gov",
    "allorigins.win",
    "translate.googleapis.com",
    "api.rss2json.com",
    "api.nasa.gov",
    "epic.gsfc.nasa.gov",
    "sdo.gsfc.nasa.gov",
    "firebase",
    "firebaseio.com",
    "firebaseapp.com",
    "bbci.co.uk",
    "relevantmagazine.com",
    "christianitytoday.com"
  ];

  const isBypassed =
    externalApis.some(domain => requestUrl.hostname.includes(domain)) ||
    requestUrl.pathname.includes(".json") ||
    event.request.method !== "GET";

  if (isBypassed) {
    return; // Let the browser fetch directly from network
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200 && event.request.url.startsWith("http")) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Offline fallback if network fails
          return cachedResponse;
        });

        // Return cached version immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
