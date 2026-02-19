// Minimal service worker for PWA installability.
// Satisfies Chrome's requirement of a fetch-handling SW.
// No offline caching — the app requires connectivity.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {});
