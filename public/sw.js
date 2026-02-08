const CACHE_NAME = 'zentum-v3';
const RUNTIME_CACHE = 'zentum-runtime';

// تخزين الملفات الأساسية لضمان سرعة الفتح على الموبايل
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg'
];

// Install - Cache essential files
self.addEventListener('install', event => {
  console.log('⚡ ZENTUM Service Worker installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache failed:', err))
  );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
  console.log('✅ ZENTUM Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network first, falling back to cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response for caching
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Push notifications support (for future use)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New trading alert',
    icon: '/logo.svg',
    badge: '/logo.svg',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('ZENTUM Trading', options)
  );
});