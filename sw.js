const CACHE = 'sisel-v1';
const FILES = [
  '/sisel-gwanri/',
  '/sisel-gwanri/index.html',
  '/sisel-gwanri/b1.jpg',
  '/sisel-gwanri/b2.jpg',
  '/sisel-gwanri/b3.jpg',
  '/sisel-gwanri/b4.jpg',
  '/sisel-gwanri/data.json',
  '/sisel-gwanri/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // data.json은 네트워크 우선 (최신 데이터), 실패시 캐시
  if(e.request.url.includes('data.json')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
