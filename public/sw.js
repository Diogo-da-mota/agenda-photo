/**
 * Service Worker para o Bright Spark Welcome
 * 
 * Versão: 1.2.0
 * Data: 2024-07-27
 * 
 * Funcionalidades:
 * - Cache de assets estáticos (App Shell)
 * - Estratégias de cache (Cache First, Network First, Stale While Revalidate)
 * - Cache de imagens
 * - Limpeza automática de caches antigos
 * - Background Sync (placeholder)
 * - Manuseio de mensagens do cliente (skipWaiting, stats, clear cache)
 */

const CACHE_NAME = 'bright-spark-v1.2.0';
const STATIC_CACHE = 'bright-spark-static-v1.2.0';
const DYNAMIC_CACHE = 'bright-spark-dynamic-v1.2.0';
const IMAGE_CACHE = 'bright-spark-images-v1.2.0';

// Recursos críticos para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  // CSS e JS serão adicionados automaticamente via estratégia
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First - para recursos estáticos
  CACHE_FIRST: 'cache-first',
  // Network First - para dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - para imagens e recursos não críticos
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network Only - para APIs críticas
  NETWORK_ONLY: 'network-only'
};

// Configuração de rotas e estratégias
const ROUTE_STRATEGIES = {
  // Páginas HTML
  '/': CACHE_STRATEGIES.NETWORK_FIRST,
  '/dashboard': CACHE_STRATEGIES.NETWORK_FIRST,
  '/portfolio': CACHE_STRATEGIES.NETWORK_FIRST,
  
  // Assets estáticos
  '\\.(js|css|woff2?|ttf|eot)$': CACHE_STRATEGIES.CACHE_FIRST,
  
  // Imagens
  '\\.(jpg|jpeg|png|gif|webp|svg)$': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  
  // APIs do Supabase
  'supabase\\.co': CACHE_STRATEGIES.NETWORK_FIRST,
  
  // APIs externas
  'api/': CACHE_STRATEGIES.NETWORK_FIRST
};

// Configurações de cache
const CACHE_CONFIG = {
  maxAgeInSeconds: {
    static: 60 * 60 * 24 * 30, // 30 dias
    dynamic: 60 * 60 * 24 * 7,  // 7 dias
    images: 60 * 60 * 24 * 14   // 14 dias
  },
  maxEntries: {
    static: 100,
    dynamic: 50,
    images: 200
  }
};

// ===== EVENT LISTENERS =====

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      cleanupOldCaches(),
      // Tomar controle de todas as abas
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ignorar requisições POST/PUT/DELETE para APIs
  if (event.request.method !== 'GET') {
    return;
  }

  const strategy = getStrategyForRequest(event.request);
  
  event.respondWith(
    handleRequest(event.request, strategy)
  );
});

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_CACHE_STATS':
        getCacheStats().then(stats => {
          event.ports[0].postMessage({ type: 'CACHE_STATS', data: stats });
        });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
        });
        break;
      case 'PRELOAD_ROUTES':
        preloadRoutes(event.data.routes);
        break;
    }
  }
});

// ===== HELPER FUNCTIONS =====

function getStrategyForRequest(request) {
  const url = request.url;
  
  // Verificar cada padrão de rota
  for (const [pattern, strategy] of Object.entries(ROUTE_STRATEGIES)) {
    const regex = new RegExp(pattern);
    if (regex.test(url)) {
      return strategy;
    }
  }
  
  // Estratégia padrão
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    default:
      return networkFirst(request);
  }
}

// Estratégia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheNameForRequest(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheNameForRequest(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('accept').includes('text/html')) {
      const fallbackResponse = await caches.match('/');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Sempre tentar buscar versão atualizada em background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(getCacheNameForRequest(request));
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Ignorar erros em background
  });
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Se não há cache, aguardar network
  return fetchPromise;
}

function getCacheNameForRequest(request) {
  const url = request.url;
  
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return IMAGE_CACHE;
  }
  
  if (url.match(/\.(js|css|woff2?|ttf|eot)$/)) {
    return STATIC_CACHE;
  }
  
  return DYNAMIC_CACHE;
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => {
      console.log('[SW] Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    });
  
  return Promise.all(deletePromises);
}

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  return Promise.all(deletePromises);
}

async function preloadRoutes(routes) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  const preloadPromises = routes.map(async (route) => {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
        console.log('[SW] Preloaded route:', route);
      }
    } catch (error) {
      console.warn('[SW] Failed to preload route:', route, error);
    }
  });
  
  return Promise.all(preloadPromises);
}

// ===== BACKGROUND SYNC =====

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização em background se necessário
  console.log('[SW] Background sync triggered');
}

// ===== BACKGROUND SYNC EXPANDIDO =====

// Configurações do Background Sync
const SYNC_CONFIG = {
  retryDelay: 5000, // 5 segundos
  maxRetries: 3,
  syncTags: {
    PENDING_OPERATIONS: 'background-sync-operations',
    OFFLINE_DATA: 'background-sync-offline-data',
    AUTO_SAVE: 'background-sync-auto-save'
  }
};

// Store para operações pendentes offline
let pendingOperations = [];
let offlineDataQueue = [];

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  switch (event.tag) {
    case SYNC_CONFIG.syncTags.PENDING_OPERATIONS:
      event.waitUntil(syncPendingOperations());
      break;
    case SYNC_CONFIG.syncTags.OFFLINE_DATA:
      event.waitUntil(syncOfflineData());
      break;
    case SYNC_CONFIG.syncTags.AUTO_SAVE:
      event.waitUntil(syncAutoSaveData());
      break;
    default:
      if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
      }
  }
});

async function syncPendingOperations() {
  console.log('[SW] Iniciando sincronização de operações pendentes...');
  
  try {
    // Buscar operações pendentes do IndexedDB
    const operations = await getStoredOperations();
    
    for (const operation of operations) {
      try {
        await executeOperation(operation);
        await removeStoredOperation(operation.id);
        console.log('[SW] Operação sincronizada:', operation.type);
      } catch (error) {
        console.error('[SW] Erro ao sincronizar operação:', error);
        await incrementRetryCount(operation.id);
      }
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de operações:', error);
  }
}

async function syncOfflineData() {
  console.log('[SW] Sincronizando dados offline...');
  
  try {
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      try {
        const response = await fetch(data.endpoint, {
          method: data.method || 'POST',
          headers: data.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload)
        });
        
        if (response.ok) {
          await removeOfflineData(data.id);
          console.log('[SW] Dados offline sincronizados:', data.type);
        }
      } catch (error) {
        console.error('[SW] Erro ao sincronizar dados offline:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de dados offline:', error);
  }
}

async function syncAutoSaveData() {
  console.log('[SW] Sincronizando auto-save...');
  
  try {
    const autoSaveData = await getAutoSaveData();
    
    for (const data of autoSaveData) {
      try {
        // Verificar se os dados ainda são válidos (não muito antigos)
        const dataAge = Date.now() - data.timestamp;
        if (dataAge > 60 * 60 * 1000) { // 1 hora
          await removeAutoSaveData(data.id);
          continue;
        }
        
        const response = await fetch(data.endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': data.auth || ''
          },
          body: JSON.stringify(data.payload)
        });
        
        if (response.ok) {
          await removeAutoSaveData(data.id);
          console.log('[SW] Auto-save sincronizado:', data.type);
        }
      } catch (error) {
        console.error('[SW] Erro ao sincronizar auto-save:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de auto-save:', error);
  }
}

async function executeOperation(operation) {
  switch (operation.type) {
    case 'CREATE':
      return await fetch(operation.endpoint, {
        method: 'POST',
        headers: operation.headers,
        body: JSON.stringify(operation.data)
      });
    case 'UPDATE':
      return await fetch(operation.endpoint, {
        method: 'PUT',
        headers: operation.headers,
        body: JSON.stringify(operation.data)
      });
    case 'DELETE':
      return await fetch(operation.endpoint, {
        method: 'DELETE',
        headers: operation.headers
      });
    default:
      throw new Error('Tipo de operação desconhecido: ' + operation.type);
  }
}

// ===== INDEXEDDB HELPERS =====

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BrightSparkOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('operations')) {
        const operationsStore = db.createObjectStore('operations', { keyPath: 'id' });
        operationsStore.createIndex('type', 'type');
        operationsStore.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('offlineData')) {
        const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
        offlineStore.createIndex('type', 'type');
        offlineStore.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('autoSave')) {
        const autoSaveStore = db.createObjectStore('autoSave', { keyPath: 'id' });
        autoSaveStore.createIndex('type', 'type');
        autoSaveStore.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

async function getStoredOperations() {
  const db = await openIndexedDB();
  const transaction = db.transaction(['operations'], 'readonly');
  const store = transaction.objectStore('operations');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeStoredOperation(id) {
  const db = await openIndexedDB();
  const transaction = db.transaction(['operations'], 'readwrite');
  const store = transaction.objectStore('operations');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function incrementRetryCount(id) {
  const db = await openIndexedDB();
  const transaction = db.transaction(['operations'], 'readwrite');
  const store = transaction.objectStore('operations');
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onerror = () => reject(getRequest.error);
    
    getRequest.onsuccess = () => {
      const operation = getRequest.result;
      if (operation) {
        operation.retryCount = (operation.retryCount || 0) + 1;
        
        if (operation.retryCount >= SYNC_CONFIG.maxRetries) {
          // Remover operação após máximo de tentativas
          store.delete(id);
        } else {
          store.put(operation);
        }
      }
      resolve();
    };
  });
}

async function getOfflineData() {
  const db = await openIndexedDB();
  const transaction = db.transaction(['offlineData'], 'readonly');
  const store = transaction.objectStore('offlineData');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeOfflineData(id) {
  const db = await openIndexedDB();
  const transaction = db.transaction(['offlineData'], 'readwrite');
  const store = transaction.objectStore('offlineData');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getAutoSaveData() {
  const db = await openIndexedDB();
  const transaction = db.transaction(['autoSave'], 'readonly');
  const store = transaction.objectStore('autoSave');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeAutoSaveData(id) {
  const db = await openIndexedDB();
  const transaction = db.transaction(['autoSave'], 'readwrite');
  const store = transaction.objectStore('autoSave');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ===== PUSH NOTIFICATIONS =====

self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  let pushData = {};
  try {
    pushData = event.data.json();
  } catch (e) {
    pushData = {
        title: 'AgendaPRO',
        body: event.data.text()
    };
  }

  const title = pushData.title || 'AgendaPRO';
  const options = {
    body: pushData.body || 'Você tem uma nova notificação.',
    icon: '/lovable-uploads/Nova%20pasta/7f19ef7b-a1e8-4647-a6fa-e7743474e649.png',
    badge: '/lovable-uploads/Nova%20pasta/7f19ef7b-a1e8-4647-a6fa-e7743474e649.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

console.log('[SW] Service Worker loaded successfully');