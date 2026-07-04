import api from './api';

export async function subscribe(endpoint, keys) {
  const { data } = await api.post('/push/subscribe', { endpoint, keys });
  return data;
}

export async function unsubscribe(endpoint) {
  const { data } = await api.delete('/push/unsubscribe', { data: { endpoint } });
  return data;
}

export async function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function requestPushPermission(registration) {
  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission === 'denied') {
    return null;
  }

  if (Notification.permission === 'granted') {
    return subscribePush(registration);
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    return subscribePush(registration);
  }

  return null;
}

export async function subscribePush(registration) {
  try {
    const applicationServerKey = await urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
    );

    if (!applicationServerKey.length) {
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    const subJSON = subscription.toJSON();

    await subscribe(subJSON.endpoint, subJSON.keys);

    return subscription;
  } catch (error) {
    console.warn('[Push] Falha ao inscrever:', error.message);
    return null;
  }
}
