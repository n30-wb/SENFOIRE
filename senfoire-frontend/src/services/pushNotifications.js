import API from './api';

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY || '';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await sendSubscriptionToServer(existingSubscription);
      return true;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
    });

    await sendSubscriptionToServer(subscription);
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

async function sendSubscriptionToServer(subscription) {
  const keys = subscription.getKey ? {
    public_key: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
    auth_token: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
  } : {};

  await API.post('/push-subscriptions', {
    endpoint: subscription.endpoint,
    ...keys,
    p256dh_key: keys.public_key || '',
  });
}

export async function unsubscribePush() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await API.delete('/push-subscriptions', { data: { endpoint: subscription.endpoint } });
    }
  } catch (error) {
    console.error('Unsubscribe failed:', error);
  }
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
