const CACHE = 'codex-viu-canonical-v47';
const ASSETS = [
  './', './index.html', './styles.css', './rosa.css', './rosa-enhanced.css', './rosa-inter-nos.css', './cartographia.css',
  './germinacio.css', './radices-brodsky.css', './app.js', './foundation.js', './core.js', './germinacio.js', './phase3.js', './seed-bridge.js', './compost-cycle.js', './metabolism.js', './homeostasis.js', './lineage.js',
  './rosa.js', './rosa-enhanced.js', './rosa-inter-nos.js', './memoria-radicum.js', './probatio-radicum.js', './lex-radicum.js', './constitutio-vitae.js', './promocio.js', './promocio.css', './branques.js', './branques.css', './pressio.js', './pressio.css', './homeostasi-constitucional.js', './homeostasi-constitucional.css', './histeresi.js', './histeresi.css', './allostasi.js', './allostasi.css', './consolidacio.js', './consolidacio.css', './reconsolidacio.js', './reconsolidacio.css', './breathing.js', './attention.js', './context-propi.js', './radices-brodsky.js', './ressonancia.js', './ressonancia.css',
  './pont-site.json', './arrels/joseph-brodsky-creativitat.md',
  './manifest.webmanifest', './LICENSE.md', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error()}))});
