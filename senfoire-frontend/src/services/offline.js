const CACHE_NAME = 'senfoire-offline-v1';
const OFFLINE_DATA_KEY = 'senfoire-offline-data';

export function isOnline() {
  return navigator.onLine;
}

export function onOffline(callback) {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
}

export function onOnline(callback) {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}

// Cache a cart for offline ordering
export function saveOfflineCart(cart) {
  try {
    localStorage.setItem('senfoire-offline-cart', JSON.stringify(cart));
  } catch {}
}

export function getOfflineCart() {
  try {
    const data = localStorage.getItem('senfoire-offline-cart');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearOfflineCart() {
  localStorage.removeItem('senfoire-offline-cart');
}

// Cache products for offline browsing
export function cacheProducts(products) {
  try {
    localStorage.setItem('senfoire-cached-products', JSON.stringify(products));
  } catch {}
}

export function getCachedProducts() {
  try {
    const data = localStorage.getItem('senfoire-cached-products');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Queue actions for when online
export function queueOfflineAction(action) {
  try {
    const queue = getOfflineQueue();
    queue.push({ ...action, timestamp: Date.now() });
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(queue));
  } catch {}
}

export function getOfflineQueue() {
  try {
    const data = localStorage.getItem(OFFLINE_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_DATA_KEY);
}

// Process queued actions when coming back online
export async function processOfflineQueue(API) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const processed = [];
  for (const action of queue) {
    try {
      if (action.type === 'cart_add') {
        // Re-add to cart when online
        processed.push(action);
      }
    } catch {}
  }

  if (processed.length > 0) {
    clearOfflineQueue();
  }
}
