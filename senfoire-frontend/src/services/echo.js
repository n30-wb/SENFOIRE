import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export function initEcho() {
  if (echoInstance) return echoInstance;

  try {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY || '',
      wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
      wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
      wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
    });

    return echoInstance;
  } catch (error) {
    console.error('Echo init failed:', error);
    return null;
  }
}

export function getEcho() {
  return echoInstance || initEcho();
}

export function listenToConversation(conversationId, callback) {
  const echo = getEcho();
  if (!echo) return null;
  
  return echo.private(`conversation.${conversationId}`)
    .listen('.message.new', callback);
}

export function listenToLivreurLocation(commandeId, callback) {
  const echo = getEcho();
  if (!echo) return null;
  
  return echo.private(`livreur-location.${commandeId}`)
    .listen('.location.update', callback);
}

export function listenToOrderStatus(commandeId, callback) {
  const echo = getEcho();
  if (!echo) return null;
  
  return echo.private(`commande.${commandeId}`)
    .listen('.commande.statut', callback);
}

export function listenToUserEvents(userId, callback) {
  const echo = getEcho();
  if (!echo) return null;
  
  return echo.private(`user.${userId}`)
    .listen('.commande.statut', callback);
}

export function leaveChannel(channel) {
  if (channel && echoInstance) {
    echoInstance.leave(channel);
  }
}
