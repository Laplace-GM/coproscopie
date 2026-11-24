const CACHE='copro-solo-v1';
const ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c =>
    Promise.allSettled(ASSETS.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  ev.respondWith(caches.match(ev.request, {ignoreSearch:true})
    .then(r => r || fetch(ev.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(ev.request, copy)).catch(()=>{});
      return resp;
    }).catch(() => caches.match('index.html'))));
});
