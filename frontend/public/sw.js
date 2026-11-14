// Banda Digital Ecosystem - Service Worker
const CACHE_NAME = 'banda-digital-v2'
const MAP_TILES_CACHE = 'banda-map-tiles-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== MAP_TILES_CACHE) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip caching for backend API POST/PUT mutations (handled via IndexedDB Sync Queue)
  if (event.request.method !== 'GET') {
    return
  }

  // Handle navigation requests (SPA fallback for offline & refresh on any route)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html').then((response) => {
          return response || caches.match('/')
        })
      })
    )
    return
  }

  // Cache-first for OpenStreetMap tiles (Offline GIS Navigation for Banda Islands)
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('openstreetmap')) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          if (cached) {
            return cached
          }
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(event.request, networkResponse.clone())
              }
              return networkResponse
            })
            .catch(() => cached || new Response('', { status: 408, statusText: 'Offline Map Tile Unavailable' }))
        })
      })
    )
    return
  }


  // Network-first with Cache fallback for API GET requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          }
          return response
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached
            return new Response(JSON.stringify({ error: 'Offline mode active. Data retrieved from local cache.' }), {
              headers: { 'Content-Type': 'application/json' },
            })
          })
        })
    )
    return
  }

  // Stale-while-revalidate for app static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
          }
          return networkResponse
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})
