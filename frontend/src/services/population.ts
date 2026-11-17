import { authService } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

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

export interface AdministrativeRequestItem {
  id: string
  resident_id: string
  resident_name?: string
  resident_nik?: string
  resident_occupation?: string
  request_type: string
  status: 'submitted' | 'in_review' | 'approved' | 'rejected'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AdministrativeRequestListResponse {
  items: AdministrativeRequestItem[]
  total: number
  page: number
  limit: number
}

export const populationService = {
  getAuthHeaders(): HeadersInit {
    const token = authService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  },

  async requestWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
    return authService.fetchWithAuth(`${API_BASE}${path}`, options)
  },

  async listResidents(page = 1, limit = 20, search?: string, occupation?: string): Promise<ResidentListResponse> {
    let path = `/population/residents?page=${page}&limit=${limit}`
    if (search) {
      path += `&search=${encodeURIComponent(search)}`
    }
    if (occupation) {
      path += `&occupation=${encodeURIComponent(occupation)}`
    }
    const res = await this.requestWithAuth(path)
    if (!res.ok) {
      throw new Error(`Gagal memuat data penduduk (${res.status})`)
    }
    return res.json()
  },

  async createResident(input: ResidentCreateInput): Promise<Resident> {
    const res = await this.requestWithAuth('/population/residents', {
      method: 'POST',
      body: JSON.stringify({ ...input, village: 'Banda Neira' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal menambahkan penduduk (${res.status})`)
    }
    return res.json()
  },

  async verifyResident(id: string, status: 'verified' | 'rejected', notes?: string): Promise<Resident> {
    const res = await this.requestWithAuth(`/population/residents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_status: status, notes }),
    })
    if (!res.ok) {
      throw new Error(`Gagal memverifikasi penduduk (${res.status})`)
    }
    return res.json()
  },

  async getStatistics(): Promise<PopulationStatistics> {
    const res = await this.requestWithAuth('/population/statistics')
    if (!res.ok) {
      throw new Error(`Gagal memuat statistik penduduk (${res.status})`)
    }
    return res.json()
  },

  async listRequests(page = 1, limit = 50, status?: string): Promise<AdministrativeRequestListResponse> {
    let path = `/population/requests?page=${page}&limit=${limit}`
    if (status) {
      path += `&status=${encodeURIComponent(status)}`
    }
    const res = await this.requestWithAuth(path)
    if (!res.ok) {
      throw new Error(`Gagal memuat permohonan surat (${res.status})`)
    }
    return res.json()
  },

  async createRequest(input: { resident_id?: string; request_type: string; notes?: string }): Promise<AdministrativeRequestItem> {
    const res = await this.requestWithAuth('/population/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mengirim permohonan surat (${res.status})`)
    }
    return res.json()
  },

  async updateRequestStatus(id: string, status: 'approved' | 'rejected' | 'in_review', notes?: string): Promise<AdministrativeRequestItem> {
    const res = await this.requestWithAuth(`/population/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal memperbarui status permohonan (${res.status})`)
    }
    return res.json()
  },
}
