import { authService } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'

export interface Resident {
  id: string
  nik: string
  full_name: string
  gender: string
  birth_place?: string
  birth_date?: string
  address?: string
  rt?: string
  rw?: string
  village: string
  occupation?: string
  phone_number?: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_by?: string
  verified_at?: string
  created_at: string
}

export interface ResidentListResponse {
  items: Resident[]
  total: number
  page: number
  limit: number
}

export interface PopulationStatistics {
  total_residents: number
  total_verified: number
  total_pending: number
  total_rejected: number
  gender_distribution: Record<string, number>
  top_occupations: Record<string, number>
}

export interface ResidentCreateInput {
  nik: string
  full_name: string
  gender: 'L' | 'P'
  birth_place?: string
  address?: string
  rt?: string
  rw?: string
  occupation?: string
  phone_number?: string
}

export const populationService = {
  getAuthHeaders(): HeadersInit {
    const token = authService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  },

  async listResidents(page = 1, limit = 20, search?: string): Promise<ResidentListResponse> {
    let url = `${API_BASE}/population/residents?page=${page}&limit=${limit}`
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    const res = await fetch(url, { headers: this.getAuthHeaders() })
    if (!res.ok) {
      throw new Error(`Gagal memuat data penduduk (${res.status})`)
    }
    return res.json()
  },

  async createResident(input: ResidentCreateInput): Promise<Resident> {
    const res = await fetch(`${API_BASE}/population/residents`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ...input, village: 'Banda Neira' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal menambahkan penduduk (${res.status})`)
    }
    return res.json()
  },

  async verifyResident(id: string, status: 'verified' | 'rejected', notes?: string): Promise<Resident> {
    const res = await fetch(`${API_BASE}/population/residents/${id}/verify`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ verification_status: status, notes }),
    })
    if (!res.ok) {
      throw new Error(`Gagal memverifikasi penduduk (${res.status})`)
    }
    return res.json()
  },

  async getStatistics(): Promise<PopulationStatistics> {
    const res = await fetch(`${API_BASE}/population/statistics`, {
      headers: this.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error(`Gagal memuat statistik penduduk (${res.status})`)
    }
    return res.json()
  },
}
