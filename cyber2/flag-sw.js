// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
// Ultimate Flag 18 — Header Whisper. Answers only requests to telemetry.beacon.
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(event){
  if (event.request.url.indexOf('telemetry.beacon') !== -1){
    event.respondWith(new Response('ok', {
      status: 200,
      headers: { 'Content-Type': 'text/plain', 'X-Ultimate-Flag': '071eac9b3d.html' }
    }));
  }
});
