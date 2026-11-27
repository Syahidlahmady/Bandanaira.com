/**
 * Fallback shim untuk paket native @capacitor saat dijalankan di lingkungan web / browser
 * jika paket native belum/tidak terpasang di host node_modules.
 */

export const Geolocation = {
  getCurrentPosition: async () => {
    throw new Error('Native Geolocation not installed, use browser fallback');
  },
};

export const Network = {
  getStatus: async () => {
    return {
      connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: 'browser',
    };
  },
  addListener: () => {
    throw new Error('Native Network not installed, use browser fallback');
  },
};
