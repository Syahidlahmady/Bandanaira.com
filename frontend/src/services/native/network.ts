import { Network } from '@capacitor/network';

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

/**
 * Mendapatkan status konektivitas jaringan (Online / Offline).
 * Sangat berguna untuk mendeteksi sinyal lemah atau blank spot saat menyeberang pulau di Banda.
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType
    };
  } catch {
    return {
      connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: 'unknown'
    };
  }
}

/**
 * Mendengarkan perubahan status jaringan (Online/Offline event listener).
 */
export function onNetworkStatusChange(callback: (status: NetworkStatus) => void): () => void {
  try {
    const handlePromise = Network.addListener('networkStatusChange', (status: { connected: boolean; connectionType: string }) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType
      });
    });

    return () => {
      handlePromise.then((h: { remove: () => Promise<void> }) => h.remove());
    };
  } catch {
    const onlineHandler = () => callback({ connected: true, connectionType: 'browser' });
    const offlineHandler = () => callback({ connected: false, connectionType: 'none' });

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }
}
