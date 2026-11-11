export interface SAWCriterion {
  code: string
  name: string
  criterion_type: 'BENEFIT' | 'COST'
  weight: number
}

export interface SAWAlternativeInput {
  id: string
  name: string
  values: Record<string, number>
  metadata?: {
    island?: string
    type?: string
    has_clean_ro_water?: boolean
    has_solar_backup?: boolean
    eco_stay_badge?: boolean
    contact_whatsapp?: string
    description?: string
    photo_url?: string
    village?: string
    urgency_level?: string
    notes?: string
    [key: string]: unknown
  }
}

export interface SAWAlternativeResult {
  rank: number
  id: string
  name: string
  preference_score: number
  normalized_values: Record<string, number>
  raw_values: Record<string, number>
  metadata?: Record<string, unknown>
}

export interface SAWCalculationResponse {
  mode: string
  total_alternatives: number
  normalized_weights: Record<string, number>
  results: SAWAlternativeResult[]
  top_recommendation: SAWAlternativeResult | null
}

export interface TourismPreferences {
  weight_harga?: number
  weight_jarak?: number
  weight_fasilitas?: number
  weight_daya_tarik?: number
  max_budget_rp?: number
  island_filter?: string
}

export interface CrisisPriorityWeights {
  weight_tds?: number
  weight_populasi?: number
  weight_jarak_air?: number
  weight_padam_listrik?: number
}

const getApiBase = () => {
  return typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8005/api/v1`
    : 'http://localhost:8005/api/v1'
}

export const dssService = {
  async getTourismAlternatives(): Promise<SAWAlternativeInput[]> {
    const res = await fetch(`${getApiBase()}/dss/wisata/alternatives`)
    if (!res.ok) throw new Error(`Gagal mengambil data alternatif wisata: ${res.statusText}`)
    return res.json()
  },

  async getCrisisAlternatives(): Promise<SAWAlternativeInput[]> {
    const res = await fetch(`${getApiBase()}/dss/krisis/alternatives`)
    if (!res.ok) throw new Error(`Gagal mengambil data wilayah krisis: ${res.statusText}`)
    return res.json()
  },

  async calculateTourismRecommendation(prefs: TourismPreferences): Promise<SAWCalculationResponse> {
    const res = await fetch(`${getApiBase()}/dss/rekomendasi-wisata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menghitung rekomendasi wisata.')
    }
    return res.json()
  },

  async calculateCrisisPriority(weights: CrisisPriorityWeights): Promise<SAWCalculationResponse> {
    const res = await fetch(`${getApiBase()}/dss/prioritas-krisis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menghitung prioritas krisis.')
    }
    return res.json()
  },
}
