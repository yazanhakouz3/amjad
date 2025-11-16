const CACHE_NAME = 'classic-chess-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/launcher.html',
  '/manifest.json',
  '/icon.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/game/logic.ts',
  '/game/ai.ts',
  '/components/Board.tsx',
  '/components/Piece.tsx',
  '/components/GameUI.tsx',
  'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
  'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

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