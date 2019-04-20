// taken from: https://glitch.com/edit/#!/web-share?path=service-worker.js

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  return self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  event.respondWith(fetch(event.request));
});
