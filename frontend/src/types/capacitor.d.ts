declare module '@capacitor/geolocation' {
  export const Geolocation: {
    getCurrentPosition: (options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }) => Promise<{
      coords: {
        latitude: number;
        longitude: number;
        accuracy: number;
      };
    }>;
  };
}

declare module '@capacitor/network' {
  export interface ConnectionStatus {
    connected: boolean;
    connectionType: string;
  }
  export const Network: {
    getStatus: () => Promise<ConnectionStatus>;
    addListener: (
      eventName: 'networkStatusChange',
      listenerFunc: (status: ConnectionStatus) => void
    ) => Promise<{ remove: () => Promise<void> }>;
  };
}
