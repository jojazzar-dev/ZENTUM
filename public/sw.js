const CACHE_NAME = 'zentum-v2';

// تخزين الملفات الأساسية لضمان سرعة الفتح على الموبايل
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// محرك جلب البيانات اللحظية (يسمح بمرور الأسعار دون حجب)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});