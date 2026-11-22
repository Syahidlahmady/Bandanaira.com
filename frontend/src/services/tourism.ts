export interface AccommodationItem {
  id: string
  name: string
  type: string
  island_name: string
  address: string
  price_per_night_rp: number
  rooms_available: number
  has_clean_ro_water: boolean
  has_solar_backup: boolean
  eco_stay_badge: boolean
  contact_whatsapp: string
  description: string
  photo_url?: string | null
  is_verified: boolean
  created_at: string
}

export interface BookingCreateInput {
  accommodation_id: string
  guest_name: string
  guest_whatsapp: string
  guest_email?: string
  check_in: string
  check_out: string
  rooms_count: number
  notes?: string
}

export interface BookingItem {
  id: string
  booking_code: string
  accommodation_id: string
  accommodation_name: string
  guest_name: string
  guest_whatsapp: string
  check_in: string
  check_out: string
  total_nights: number
  rooms_count: number
  total_price_rp: number
  status: string
  wa_link: string
  notes?: string | null
  created_at: string
}

export interface HeritageCatalogItem {
  slug: string
  title: string
  category: string
  island: string
  historical_period: string
  narrative: string
  audio_guide_url: string
  coordinates: [number, number]
  photo_url: string
}

export interface TourGuideItem {
  id: string
  name: string
  license_number: string
  phone_whatsapp: string
  specialties: string
  languages: string
  fee_per_day_rp: number
  photo_url?: string | null
  bio: string
  island_base: string
  is_verified: boolean
  is_active: boolean
  rating: number
  trips_completed: number
  created_at: string
}

export interface AccommodationCreatePayload {
  name: string
  type: string
  island_name: string
  address: string
  price_per_night_rp: number
  rooms_available: number
  has_clean_ro_water: boolean
  has_solar_backup: boolean
  eco_stay_badge: boolean
  contact_whatsapp: string
  description: string
  photo_url?: string | null
}

export interface AccommodationUpdatePayload {
  name?: string
  type?: string
  island_name?: string
  address?: string
  price_per_night_rp?: number
  rooms_available?: number
  has_clean_ro_water?: boolean
  has_solar_backup?: boolean
  eco_stay_badge?: boolean
  contact_whatsapp?: string
  description?: string
  photo_url?: string | null
  is_verified?: boolean
}

export interface TourGuideCreatePayload {
  name: string
  license_number: string
  phone_whatsapp: string
  specialties: string
  languages: string
  fee_per_day_rp: number
  photo_url?: string | null
  bio: string
  island_base: string
  is_verified?: boolean
  is_active?: boolean
}

export interface TourGuideUpdatePayload {
  name?: string
  license_number?: string
  phone_whatsapp?: string
  specialties?: string
  languages?: string
  fee_per_day_rp?: number
  photo_url?: string | null
  bio?: string
  island_base?: string
  is_verified?: boolean
  is_active?: boolean
}

export interface CommunityContentItem {
  id: string
  content_code: string
  title: string
  slug: string
  content_type: string
  priority_category: string
  island_name: string
  author_name: string
  author_role: string
  summary: string
  body_narrative: string
  media_url?: string | null
  latitude?: number | null
  longitude?: number | null
  sop_stage: string
  qc_accuracy: boolean
  qc_language: boolean
  qc_visual: boolean
  qc_adat_ethics: boolean
  qc_source_validated: boolean
  qc_consent_copyright: boolean
  qc_passed_count: number
  is_published: boolean
  created_at: string
  updated_at?: string | null
}

export interface CommunityContentCreatePayload {
  content_code?: string
  title: string
  slug?: string
  content_type: string
  priority_category: string
  island_name: string
  author_name: string
  author_role: string
  summary: string
  body_narrative: string
  media_url?: string | null
  latitude?: number | null
  longitude?: number | null
  sop_stage: string
  qc_accuracy: boolean
  qc_language: boolean
  qc_visual: boolean
  qc_adat_ethics: boolean
  qc_source_validated: boolean
  qc_consent_copyright: boolean
  is_published: boolean
}

export interface CommunityContentUpdatePayload {
  title?: string
  content_type?: string
  priority_category?: string
  island_name?: string
  author_name?: string
  author_role?: string
  summary?: string
  body_narrative?: string
  media_url?: string | null
  latitude?: number | null
  longitude?: number | null
  sop_stage?: string
  qc_accuracy?: boolean
  qc_language?: boolean
  qc_visual?: boolean
  qc_adat_ethics?: boolean
  qc_source_validated?: boolean
  qc_consent_copyright?: boolean
  is_published?: boolean
}

export interface LiteracyModuleItem {
  module_code: string
  title: string
  validation_status: string
  target_audience: string
  duration_minutes: number
  learning_objectives: string[]
  key_topics: string[]
  practical_output: string
  offline_ready: boolean
}

export interface SopStageItem {
  stage_order: number
  stage_code: string
  stage_name: string
  pic_actor: string
  description: string
  deliverable: string
}

export interface QualityChecklistStandard {
  field: string
  code: string
  label: string
  criteria: string
}

export interface SignalZoneMapping {
  zone_code: string
  zone_name: string
  islands_covered: string
  signal_status: string
  avg_download_mbps: number
  recommended_sync_strategy: string
}

export interface LiteracyGovernanceResponse {
  mandate_owner: string
  community_brand: string
  modules: LiteracyModuleItem[]
  sop_stages: SopStageItem[]
  quality_checklist_standards: QualityChecklistStandard[]
  signal_zones_mapping: SignalZoneMapping[]
}

import { authService } from './auth'

const getApiBase = () => {
  const envUrl = import.meta.env?.VITE_API_BASE_URL
  if (envUrl) return envUrl
  return typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1`
    : 'http://localhost:8005/api/v1'
}

const getAuthHeaders = (hasBody = true): HeadersInit => {
  const token = authService.getAccessToken()
  const headers: Record<string, string> = {}
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const tourismService = {
  async listAccommodations(params?: {
    island?: string
    village?: string
    search?: string
    type?: string
    max_price?: number
    has_ro_water?: boolean
    has_solar?: boolean
  }): Promise<AccommodationItem[]> {
    const q = new URLSearchParams()
    if (params?.island) q.append('island', params.island)
    if (params?.village) q.append('village', params.village)
    if (params?.search) q.append('search', params.search)
    if (params?.type) q.append('type', params.type)
    if (params?.max_price) q.append('max_price', params.max_price.toString())
    if (params?.has_ro_water !== undefined) q.append('has_ro_water', String(params.has_ro_water))
    if (params?.has_solar !== undefined) q.append('has_solar', String(params.has_solar))

    const res = await fetch(`${getApiBase()}/tourism/accommodations?${q.toString()}`)
    if (!res.ok) throw new Error(`Gagal memuat katalog penginapan: ${res.statusText}`)
    return res.json()
  },

  async createBooking(payload: BookingCreateInput): Promise<BookingItem> {
    const res = await fetch(`${getApiBase()}/tourism/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal membuat reservasi penginapan.')
    }
    return res.json()
  },

  async getBooking(bookingCode: string): Promise<BookingItem> {
    const res = await fetch(`${getApiBase()}/tourism/bookings/${bookingCode}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Kode reservasi tidak ditemukan.')
    }
    return res.json()
  },

  async listHeritage(params?: { category?: string; island?: string }): Promise<HeritageCatalogItem[]> {
    const q = new URLSearchParams()
    if (params?.category) q.append('category', params.category)
    if (params?.island) q.append('island', params.island)

    const res = await fetch(`${getApiBase()}/tourism/heritage-catalog?${q.toString()}`)
    if (!res.ok) throw new Error('Gagal memuat katalog cagar budaya.')
    return res.json()
  },

  async listBookings(paramsOrId?: string | { accommodationId?: string; search?: string }): Promise<BookingItem[]> {
    const q = new URLSearchParams()
    if (typeof paramsOrId === 'string') {
      if (paramsOrId) q.append('accommodation_id', paramsOrId)
    } else if (paramsOrId) {
      if (paramsOrId.accommodationId) q.append('accommodation_id', paramsOrId.accommodationId)
      if (paramsOrId.search) q.append('search', paramsOrId.search)
    }

    const res = await fetch(`${getApiBase()}/tourism/bookings?${q.toString()}`, {
      headers: getAuthHeaders(false),
    })
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('Akses ditolak: Silakan login sebagai Operator Homestay atau Admin Desa.')
      }
      throw new Error('Gagal memuat riwayat reservasi.')
    }
    return res.json()
  },

  async createAccommodation(payload: AccommodationCreatePayload): Promise<AccommodationItem> {
    const res = await fetch(`${getApiBase()}/tourism/accommodations`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menambahkan penginapan baru (perlu izin Operator/Admin).')
    }
    return res.json()
  },

  async updateAccommodation(id: string, payload: AccommodationUpdatePayload): Promise<AccommodationItem> {
    const res = await fetch(`${getApiBase()}/tourism/accommodations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal memperbarui data penginapan (perlu izin Operator/Admin).')
    }
    return res.json()
  },

  async deleteAccommodation(id: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/tourism/accommodations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menghapus penginapan (perlu izin Operator/Admin).')
    }
  },

  async listTourGuides(params?: { island?: string; search?: string; is_verified?: boolean }): Promise<TourGuideItem[]> {
    const q = new URLSearchParams()
    if (params?.island) q.append('island', params.island)
    if (params?.search) q.append('search', params.search)
    if (params?.is_verified !== undefined) q.append('is_verified', String(params.is_verified))

    const res = await fetch(`${getApiBase()}/tourism/guides?${q.toString()}`)
    if (!res.ok) throw new Error('Gagal memuat katalog pemandu wisata.')
    return res.json()
  },

  async createTourGuide(payload: TourGuideCreatePayload): Promise<TourGuideItem> {
    const res = await fetch(`${getApiBase()}/tourism/guides`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal mendaftarkan pemandu wisata (perlu izin Smart Tourism Admin).')
    }
    return res.json()
  },

  async updateTourGuide(id: string, payload: TourGuideUpdatePayload): Promise<TourGuideItem> {
    const res = await fetch(`${getApiBase()}/tourism/guides/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal memperbarui profil pemandu (perlu izin Smart Tourism Admin).')
    }
    return res.json()
  },

  async deleteTourGuide(id: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/tourism/guides/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menghapus pemandu wisata (perlu izin Smart Tourism Admin).')
    }
  },

  async listCommunityContents(params?: {
    content_type?: string
    priority_category?: string
    island?: string
    only_published?: boolean
  }): Promise<CommunityContentItem[]> {
    const q = new URLSearchParams()
    if (params?.content_type) q.append('content_type', params.content_type)
    if (params?.priority_category) q.append('priority_category', params.priority_category)
    if (params?.island) q.append('island', params.island)
    if (params?.only_published !== undefined) q.append('only_published', String(params.only_published))

    const res = await fetch(`${getApiBase()}/tourism/community-contents?${q.toString()}`)
    if (!res.ok) throw new Error('Gagal memuat Bank Konten & Karya Komunitas.')
    return res.json()
  },

  async getCommunityContentByIdOrSlug(idOrSlug: string): Promise<CommunityContentItem> {
    const res = await fetch(`${getApiBase()}/tourism/community-contents/${encodeURIComponent(idOrSlug)}`)
    if (!res.ok) throw new Error('Artikel sejarah tidak ditemukan.')
    return res.json()
  },

  async createCommunityContent(payload: CommunityContentCreatePayload): Promise<CommunityContentItem> {
    const res = await fetch(`${getApiBase()}/tourism/community-contents`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal mengunggah konten baru ke CMS BST.')
    }
    return res.json()
  },

  async updateCommunityContent(id: string, payload: CommunityContentUpdatePayload): Promise<CommunityContentItem> {
    const res = await fetch(`${getApiBase()}/tourism/community-contents/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal memperbarui konten komunitas di CMS BST.')
    }
    return res.json()
  },

  async deleteCommunityContent(id: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/tourism/community-contents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menghapus konten dari CMS BST.')
    }
  },

  async getLiteracyModules(): Promise<LiteracyGovernanceResponse> {
    const res = await fetch(`${getApiBase()}/tourism/literacy-modules`)
    if (!res.ok) throw new Error('Gagal memuat kurikulum Modul Literasi Digital & SOP Konten.')
    return res.json()
  },
}

export type TourismSubTab =
  | 'destinations'
  | 'accommodations'
  | 'heritage'
  | 'community_literacy'
  | 'guides'
  | 'lookup'
  | 'bookings'
  | 'cms'

const TOURISM_SUBTAB_STORAGE_KEY = 'banda_tourism_subtab'
const VALID_TOURISM_SUBTABS: ReadonlySet<TourismSubTab> = new Set<TourismSubTab>([
  'destinations',
  'accommodations',
  'heritage',
  'community_literacy',
  'guides',
  'lookup',
  'bookings',
  'cms',
])

/** Simpan sub-tab aktif ruang kerja pariwisata dan kabarkan perubahan ke komponen terpasang. */
export const setPreferredTourismSubTab = (subTab: TourismSubTab): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOURISM_SUBTAB_STORAGE_KEY, subTab)
    window.dispatchEvent(new CustomEvent<TourismSubTab>('banda:tourism-subtab', { detail: subTab }))
  } catch {
    // ignore storage/event errors
  }
}

/** Ambil sub-tab tujuan yang terakhir dipilih, default ke 'accommodations'. */
export const getPreferredTourismSubTab = (): TourismSubTab => {
  if (typeof window === 'undefined') return 'accommodations'
  try {
    const raw = window.localStorage.getItem(TOURISM_SUBTAB_STORAGE_KEY) as TourismSubTab | null
    if (raw && VALID_TOURISM_SUBTABS.has(raw)) {
      return raw
    }
  } catch {
    // ignore storage errors
  }
  return 'accommodations'
}


