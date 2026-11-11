import { authService } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export interface FarmerGroup {
  id: string
  name: string
  leader_name?: string
  village: string
  contact_number?: string
  created_at: string
}

export interface Farmer {
  id: string
  farmer_code: string
  name: string
  phone?: string
  status: string
  farmer_group_id?: string
  group?: FarmerGroup
  created_at: string
}

export interface Farm {
  id: string
  farmer_id: string
  farm_code: string
  name: string
  location_description?: string
  latitude: number
  longitude: number
  area_sqm: number
  primary_commodity: string
  verification_status: string
  created_at: string
}

export interface FarmGeoJSONFeature {
  type: string
  id: string
  geometry: {
    type: string
    coordinates: [number, number] // [lng, lat]
  }
  properties: {
    farm_code: string
    name: string
    commodity: string
    area_sqm: number
    farmer_id: string
    location_description?: string
    verification_status?: string
    polygon_boundary_geojson?: Record<string, unknown>
  }
}

export interface FarmBoundaryValidationRequest {
  polygon_boundary_geojson: Record<string, unknown>
  exclude_farm_id?: string
}

export interface FarmBoundaryValidationResponse {
  is_valid: boolean
  has_overlap: boolean
  overlapping_farm_id?: string
  overlapping_farm_code?: string
  overlapping_farm_name?: string
  calculated_area_sqm: number
  message: string
}


export interface FarmGeoJSONFeatureCollection {
  type: string
  features: FarmGeoJSONFeature[]
}

export interface FarmStatistics {
  total_farmers: number
  total_farmer_groups: number
  total_farms: number
  total_area_sqm: number
  commodity_distribution: Record<string, number>
  verified_farms?: number
  pending_farms?: number
}

export const farmerService = {
  getAuthHeaders(): HeadersInit {
    const token = authService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  },

  async listGroups(): Promise<FarmerGroup[]> {
    const res = await fetch(`${API_BASE}/farmers/groups`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat kelompok tani (${res.status})`)
    return res.json()
  },

  async createGroup(data: { name: string; leader_name?: string }): Promise<FarmerGroup> {
    const res = await fetch(`${API_BASE}/farmers/groups`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ...data, village: 'Banda Neira' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal membuat kelompok tani (${res.status})`)
    }
    return res.json()
  },

  async listFarmers(): Promise<{ items: Farmer[]; total: number }> {
    const res = await fetch(`${API_BASE}/farmers?limit=100`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat daftar petani (${res.status})`)
    return res.json()
  },

  async createFarmer(data: { farmer_code: string; name: string; phone?: string; farmer_group_id?: string }): Promise<Farmer> {
    const res = await fetch(`${API_BASE}/farmers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ...data, status: 'active' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mendaftarkan petani (${res.status})`)
    }
    return res.json()
  },

  async listFarms(): Promise<{ items: Farm[]; total: number }> {
    const res = await fetch(`${API_BASE}/farms?limit=100`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat data kebun (${res.status})`)
    return res.json()
  },

  async createFarm(data: {
    farmer_id: string
    farm_code: string
    name: string
    latitude: number
    longitude: number
    area_sqm: number
    primary_commodity: string
    location_description?: string
  }): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mendaftarkan kebun (${res.status})`)
    }
    return res.json()
  },

  async getFarmsGeoJSON(): Promise<FarmGeoJSONFeatureCollection> {
    const res = await fetch(`${API_BASE}/farms/geojson/all`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat GeoJSON kebun (${res.status})`)
    return res.json()
  },

  async getStatistics(): Promise<FarmStatistics> {
    const res = await fetch(`${API_BASE}/farms/statistics/summary`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat statistik pertanian (${res.status})`)
    return res.json()
  },

  async verifyFarm(farmId: string, status: 'verified' | 'rejected', notes?: string): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms/${farmId}/verification`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ verification_status: status, notes }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal memverifikasi kebun (${res.status})`)
    }
    return res.json()
  },

  async validateBoundary(data: FarmBoundaryValidationRequest): Promise<FarmBoundaryValidationResponse> {
    const res = await fetch(`${API_BASE}/farms/validate-boundary`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal memvalidasi batas poligon (${res.status})`)
    }
    return res.json()
  },
}

