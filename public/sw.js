const CACHE_NAME = 'dietician-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/home',
  '/offline.html'
]

// Install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['/'])
    })
  )
  self.skipWaiting()
})

// Activate
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME })
          .map(function(name) { return caches.delete(name) })
      )
    })
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Skip non-GET and API requests
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/')
  ) return

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone)
        })
        return response
      })
      .catch(function() {
        return caches.match(event.request)
      })
  )
})

// Push notification handler
self.addEventListener('push', function(event) {
  console.log('🔔 PUSH FIRED', event.data ? event.data.text() : 'NO DATA')

  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (err) {
    console.error('🔔 PUSH JSON PARSE ERROR', err)
  }

  const title = data.title || 'Dietician'
  const options = {
    body: data.body || 'Time to fill your daily plan!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    color: '#FF69B4',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/home' }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(function() {
        console.log('🔔 showNotification SUCCEEDED')
      })
      .catch(function(err) {
        console.error('🔔 showNotification FAILED', err)
      })
  )
})

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 NOTIFICATION CLICKED')
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/home'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    }).catch(function(err) {
      console.error('🔔 NOTIFICATION CLICK ERROR', err)
    })
  )
})