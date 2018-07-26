const cacheNameLocal = 'cahe-name';
const cacheNameDist = 'dist';
const cacheNameLocalRessource = ['image', 'style', 'script', 'font'];
const cacheNameDistRessource = ['image', 'style', 'script', 'font'];
const originNoCache = ['https://www.gstatic.com']
const staticAssets = [
    'offline.html'
];

self.addEventListener('install', async function () {
    const cache = await caches.open(cacheNameLocal);
    cache.addAll(staticAssets);
});
  
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});
  
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    //console.log('origin '+url.origin+" "+request.url)
    if (url.origin === location.origin) {
      event.respondWith(cacheOrFetch(request, cacheNameLocalRessource, cacheNameLocal));
    } else {
      event.respondWith(cacheOrFetch(request, cacheNameDistRessource, cacheNameDist));
    }
});
    
async function networkFirst(request) {
    return fetch(request);
}

// FIRST GO TO NETWORK THEN TO CACHE FOR TRUE PWA
async function cacheOrFetch(request, cacheLocation, cacheName) {
    const cachedResponse = await caches.match(request);
    if(cachedResponse){
        return cachedResponse;
    }
    const str = cacheName + '-' + request.destination;
    if(cacheLocation.indexOf(request.destination)!=-1){
        const speCache = await caches.open(str);
        try {
            const networkResponse = await fetch(request);
            speCache.put(request, networkResponse.clone());
            return networkResponse;
        } catch (err) {
            console.log(err)
        }
    }
    const networkResponseDefault = await fetch(request);
    return networkResponseDefault;
}

async function fetchOrCache(request, cacheLocation, cacheName) {
  const str = cacheName + '-' + request.destination;
  if(cacheLocation.indexOf(request.destination)!=-1){
      const speCache = await caches.open(str);
      try {
          const networkResponse = await fetch(request);
          speCache.put(request, networkResponse.clone());
          return networkResponse;
      } catch (err) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || await caches.match('./fallback.json');
      }
  }
  const networkResponseDefault = await fetch(request);
  return networkResponseDefault;
}