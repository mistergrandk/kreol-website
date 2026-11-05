const C='kreol-v5',SHELL=['./','index.html','style.css','app.js','config.js','vendor/supabase.js','icons/icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
 if(u.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));}
 else if(u.pathname.startsWith('/rest/v1/entries')){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C+'-api').then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)));}});
