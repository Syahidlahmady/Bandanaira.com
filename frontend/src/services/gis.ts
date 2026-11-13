import { offlineDB } from '../offline/db'

export interface GeoJSONGeometry {
  type: string
  coordinates: [number, number] | any
}

export interface GeoJSONProperties {
  id: string
  name: string
  layer_type: string
  category: 'publik' | 'resiliensi'
  island_name: string
  description?: string
  latitude: number
  longitude: number
  // Optional meta fields
  sub_type?: string
  price_per_night_rp?: number
  has_clean_ro_water?: boolean
  has_solar_backup?: boolean
  contact_whatsapp?: string
  audio_url?: string
  slug?: string
  built_year?: number
  era?: string
  live_tds_ppm?: number
  water_quality_status?: string
  tank_level_pct?: number
  water_source?: string
  daily_dispensed_liters?: number
  solenoid_valve_status?: string
  total_recycled_kg?: number
  plastic_conversion_rule?: string
  capacity_kwp?: number
  diesel_saved_liters_daily?: number
  commodities_accepted?: string
  emergency_phone?: string
  hazard_type?: string
  alert_level?: string
  [key: string]: any
}

export interface GeoJSONFeature {
  type: 'Feature'
  id: string
  geometry: GeoJSONGeometry
  properties: GeoJSONProperties
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
  total_features: number
  active_layers: string[]
}

export interface LayerMetadata {
  id: string
  name: string
  category: 'publik' | 'resiliensi'
  color: string
  icon: string
  description: string
  feature_count: number
}

export interface GISSummaryResponse {
  total_features: number
  public_layers_count: number
  resiliency_layers_count: number
  layers: LayerMetadata[]
  available_islands: string[]
}

export interface GeocodingResult {
  name: string
  lat: number
  lng: number
  address: string
  island: string
  suggested_layer: string
  source: string
}

export interface GeocodingResponse {
  query: string
  total: number
  results: GeocodingResult[]
}

const getApiBase = () => {
  return typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8005/api/v1`
    : 'http://localhost:8005/api/v1'
}

export const gisService = {
  getLayers: async (params?: {
    layers?: string
    category?: string
    island?: string
  }): Promise<GeoJSONFeatureCollection> => {
    const query = new URLSearchParams()
    if (params?.layers) query.append('layers', params.layers)
    if (params?.category) query.append('category', params.category)
    if (params?.island) query.append('island', params.island)

    const isFullDataset = !params?.layers && !params?.category && !params?.island
    const url = `${getApiBase()}/gis/layers${query.toString() ? `?${query.toString()}` : ''}`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal memuat layer spasial GeoJSON')
      const data: GeoJSONFeatureCollection = await res.json()

      // Automatically cache full dataset in IndexedDB for seamless offline availability
      if (isFullDataset) {
        try {
          await offlineDB.cacheData('gis_layers_all', data)
        } catch (cacheErr) {
          console.warn('Gagal menyimpan cache GIS di IndexedDB:', cacheErr)
        }
      }

      return data
    } catch (networkErr) {
      // Offline fallback: try reading from IndexedDB
      console.warn('Network fetch GIS gagal atau offline, mencoba membaca cache offline IndexedDB...', networkErr)
      const cached = await offlineDB.getCachedData<GeoJSONFeatureCollection>('gis_layers_all')
      if (cached && cached.features) {
        return cached
      }
      throw new Error('Peta tidak dapat dimuat: Anda sedang offline dan data belum tersimpan di cache lokal perangkat.')
    }
  },

  getMetadata: async (): Promise<GISSummaryResponse> => {
    try {
      const res = await fetch(`${getApiBase()}/gis/meta`)
      if (!res.ok) throw new Error('Gagal memuat metadata 7-layer spasial')
      const data: GISSummaryResponse = await res.json()
      try {
        await offlineDB.cacheData('gis_meta', data)
      } catch (cacheErr) {
        console.warn('Gagal menyimpan cache metadata GIS di IndexedDB:', cacheErr)
      }
      return data
    } catch (networkErr) {
      const cached = await offlineDB.getCachedData<GISSummaryResponse>('gis_meta')
      if (cached && cached.layers) {
        return cached
      }
      throw new Error('Metadata GIS tidak dapat dimuat secara offline.')
    }
  },

  getHeritageDetail: async (slug: string): Promise<GeoJSONFeature> => {
    const res = await fetch(`${getApiBase()}/gis/cagar-budaya/${slug}`)
    if (!res.ok) throw new Error(`Situs cagar budaya '${slug}' tidak ditemukan`)
    return res.json()
  },

  searchExternal: async (query: string): Promise<GeocodingResponse> => {
    const res = await fetch(`${getApiBase()}/gis/cari-eksternal?q=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error('Gagal mencari titik eksternal')
    return res.json()
  },

  createFeature: async (data: any, token: string): Promise<any> => {
    const res = await fetch(`${getApiBase()}/gis/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Gagal menambahkan titik spasial')
    }
    return res.json()
  },

  updateFeature: async (id: string, data: any, token: string): Promise<any> => {
    const res = await fetch(`${getApiBase()}/gis/features/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Gagal memperbarui titik spasial')
    }
    return res.json()
  },

  deleteFeature: async (id: string, token: string): Promise<any> => {
    const res = await fetch(`${getApiBase()}/gis/features/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Gagal menghapus titik spasial')
    }
    return res.json()
  },

  resetSeeds: async (): Promise<{ status: string; features_added: number; message: string }> => {
    const res = await fetch(`${getApiBase()}/gis/seed-reset`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error('Gagal sinkronisasi data kurasi spasial')
    return res.json()
  },

  /**
   * Mengunduh dan menyimpan seluruh layer spasial ke IndexedDB untuk akses offline di kebun/pulau
   */
  cacheAllGISOffline: async (): Promise<{ success: boolean; totalFeatures: number; cachedAt: string }> => {
    const [metaRes, layersRes] = await Promise.all([
      gisService.getMetadata(),
      gisService.getLayers(),
    ])
    const cachedAt = new Date().toISOString()
    await offlineDB.cacheData('gis_meta', metaRes)
    await offlineDB.cacheData('gis_layers_all', layersRes)
    return {
      success: true,
      totalFeatures: layersRes.total_features || layersRes.features.length,
      cachedAt,
    }
  },

  /**
   * Memeriksa status keberadaan cache peta offline di IndexedDB
   */
  getOfflineGISStatus: async (): Promise<{ isCached: boolean; cachedAt: string | null; featureCount: number }> => {
    try {
      const record = await offlineDB.getCachedRecord<GeoJSONFeatureCollection>('gis_layers_all')
      if (!record || !record.data || !record.data.features) {
        return { isCached: false, cachedAt: null, featureCount: 0 }
      }
      return {
        isCached: true,
        cachedAt: record.updatedAt,
        featureCount: record.data.features.length,
      }
    } catch {
      return { isCached: false, cachedAt: null, featureCount: 0 }
    }
  },

  /**
   * Menghapus cache peta offline dari IndexedDB
   */
  clearOfflineGISCache: async (): Promise<void> => {
    await offlineDB.deleteCachedData('gis_layers_all')
    await offlineDB.deleteCachedData('gis_meta')
  },
}

