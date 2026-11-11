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

    const url = `${getApiBase()}/gis/layers${query.toString() ? `?${query.toString()}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal memuat layer spasial GeoJSON')
    return res.json()
  },

  getMetadata: async (): Promise<GISSummaryResponse> => {
    const res = await fetch(`${getApiBase()}/gis/meta`)
    if (!res.ok) throw new Error('Gagal memuat metadata 7-layer spasial')
    return res.json()
  },

  getHeritageDetail: async (slug: string): Promise<GeoJSONFeature> => {
    const res = await fetch(`${getApiBase()}/gis/cagar-budaya/${slug}`)
    if (!res.ok) throw new Error(`Situs cagar budaya '${slug}' tidak ditemukan`)
    return res.json()
  },

  resetSeeds: async (): Promise<{ status: string; features_added: number; message: string }> => {
    const res = await fetch(`${getApiBase()}/gis/seed-reset`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error('Gagal sinkronisasi data kurasi spasial')
    return res.json()
  },
}
