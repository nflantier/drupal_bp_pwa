importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');
const staticAssets = [
    'offline.html'
];
workbox.precaching.precacheAndRoute([
    { url: '/offline.html' },
]);

workbox.routing.registerRoute(
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  workbox.strategies.cacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);

workbox.routing.registerRoute(
  new RegExp('.*\.css'),
  workbox.strategies.cacheFirst({
    cacheName: 'css-cache',
  })
);
workbox.routing.registerRoute(
  new RegExp('.*\.js'),
  workbox.strategies.cacheFirst({
    cacheName: 'js-cache',
  })
);

workbox.routing.registerRoute(
  new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
  workbox.strategies.cacheFirst({
    cacheName: 'googleapis',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 30,
      }),
    ],
  }),
);