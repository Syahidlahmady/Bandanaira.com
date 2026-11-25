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
  residence_status?: 'active' | 'moving' | 'moved_out' | 'temporary' | 'deceased'
  death_date?: string
  death_place?: string
  death_cause?: string
  death_certificate_no?: string
  death_notes?: string
  reported_death_at?: string
  created_at: string
  access_pin?: string
  account_username?: string
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
  village?: string
  occupation?: string
  phone_number?: string
  access_pin?: string
}

export interface ResidentCredentialResult {
  resident_id: string
  nik: string
  full_name: string
  username: string
  access_pin: string
  message: string
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

export interface ResidentReportDeathInput {
  death_date: string
  death_place?: string
  death_cause?: string
  death_certificate_no?: string
  death_notes?: string
}

export interface ResidentMutation {
  id: string
  resident_id: string
  resident_nik?: string
  resident_name?: string
  origin_village: string
  destination_village: string
  new_address?: string
  new_rt?: string
  new_rw?: string
  reason?: string
  skpwni_number?: string
  status: 'pending_destination' | 'pending_origin' | 'completed' | 'rejected' | 'cancelled'
  initiated_by_village: string
  origin_approved_by?: string
  origin_approved_at?: string
  destination_approved_by?: string
  destination_approved_at?: string
  rejection_reason?: string
  rejected_by?: string
  rejected_at?: string
  created_at: string
  updated_at: string
}

export interface ResidentMutationListResponse {
  items: ResidentMutation[]
  total: number
  page: number
  limit: number
}

export interface ResidentMutationCreateInput {
  resident_id: string
  destination_village: string
  new_address?: string
  new_rt?: string
  new_rw?: string
  reason?: string
  skpwni_number?: string
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

  async listResidents(page = 1, limit = 20, search?: string, occupation?: string, village?: string): Promise<ResidentListResponse> {
    let path = `/population/residents?page=${page}&limit=${limit}`
    if (search) {
      path += `&search=${encodeURIComponent(search)}`
    }
    if (occupation) {
      path += `&occupation=${encodeURIComponent(occupation)}`
    }
    if (village) {
      path += `&village=${encodeURIComponent(village)}`
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
      body: JSON.stringify({ ...input, village: input.village || 'Lonthoir' }),
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

  async resetResidentPin(id: string, newPin?: string): Promise<ResidentCredentialResult> {
    const res = await this.requestWithAuth(`/population/residents/${id}/reset-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin: newPin }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mengatur ulang PIN akun warga (${res.status})`)
    }
    return res.json()
  },

  async checkNik(nik: string): Promise<{ available: boolean; nik: string; village?: string; full_name?: string; message: string }> {
    const res = await this.requestWithAuth(`/population/residents/check-nik?nik=${encodeURIComponent(nik)}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal memeriksa NIK (${res.status})`)
    }
    return res.json()
  },

  async getStatistics(village?: string): Promise<PopulationStatistics> {
    const q = village ? `?village=${encodeURIComponent(village)}` : ''
    const res = await this.requestWithAuth(`/population/statistics${q}`)
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

  async reportDeath(residentId: string, input: ResidentReportDeathInput): Promise<Resident> {
    const res = await this.requestWithAuth(`/population/residents/${residentId}/report-death`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mencatat kematian warga (${res.status})`)
    }
    return res.json()
  },

  async revokeDeath(residentId: string): Promise<Resident> {
    const res = await this.requestWithAuth(`/population/residents/${residentId}/revoke-death`, {
      method: 'POST',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal membatalkan status kematian (${res.status})`)
    }
    return res.json()
  },

  async listMutations(page = 1, limit = 50, mutationType?: 'incoming' | 'outgoing', status?: string): Promise<ResidentMutationListResponse> {
    let path = `/population/mutations?page=${page}&limit=${limit}`
    if (mutationType) {
      path += `&mutation_type=${encodeURIComponent(mutationType)}`
    }
    if (status) {
      path += `&status=${encodeURIComponent(status)}`
    }
    const res = await this.requestWithAuth(path)
    if (!res.ok) {
      throw new Error(`Gagal memuat daftar mutasi kependudukan (${res.status})`)
    }
    return res.json()
  },

  async createMutation(input: ResidentMutationCreateInput): Promise<ResidentMutation> {
    const res = await this.requestWithAuth('/population/mutations', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mengajukan mutasi kependudukan (${res.status})`)
    }
    return res.json()
  },

  async approveMutation(
    mutationId: string,
    details?: { new_address?: string; new_rt?: string; new_rw?: string; notes?: string }
  ): Promise<ResidentMutation> {
    const res = await this.requestWithAuth(`/population/mutations/${mutationId}/approve`, {
      method: 'POST',
      body: JSON.stringify(details || {}),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal menyetujui mutasi kependudukan (${res.status})`)
    }
    return res.json()
  },

  async rejectMutation(mutationId: string, reason: string): Promise<ResidentMutation> {
    const res = await this.requestWithAuth(`/population/mutations/${mutationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal menolak mutasi kependudukan (${res.status})`)
    }
    return res.json()
  },
}
