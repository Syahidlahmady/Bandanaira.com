import { Geolocation } from '@capacitor/geolocation';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Mendapatkan posisi koordinat GPS terkini perangkat secara native.
 * Memiliki fallback otomatis ke HTML5 Geolocation API jika dijalankan di browser biasa.
 */
export async function getCurrentGPSPosition(): Promise<GeoCoordinates> {
  try {
    // Coba minta izin dan ambil koordinat via Capacitor Geolocation
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  } catch (nativeErr) {
    console.warn('Native GPS fetch failed or not supported, falling back to browser API:', nativeErr);

    // Fallback ke browser Geolocation API
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Fallback koordinat default Banda Neira (Nusantara)
        return resolve({
          latitude: -4.5262,
          longitude: 129.9042,
          accuracy: 50
        });
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        () => {
          // Jika ditolak pengguna, gunakan pusat Kepulauan Banda Neira
          resolve({
            latitude: -4.5262,
            longitude: 129.9042,
            accuracy: 100
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }
}
