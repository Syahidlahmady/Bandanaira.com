export type ProblemDomain = 'AIR_DAN_SAMPAH' | 'ENERGI' | 'EKONOMI' | 'WISATA' | 'BUDAYA'
export type UrgencyLevel = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS'
export type ETLStatus = 'PENDING' | 'MIGRATED_TO_POSTGRES' | 'REJECTED'

export interface SurveyInput {
  collector_name: string
  problem_domain: ProblemDomain
  island_name: string
  village_name?: string
  rt_rw?: string
  latitude: number
  longitude: number
  title: string
  urgency_level: UrgencyLevel
  flexible_attributes: Record<string, any>
  photo_evidence_url?: string
  notes?: string
}

export interface SurveyItem {
  id: string
  survey_code: string
  collector_name: string
  problem_domain: ProblemDomain
  island_name: string
  village_name?: string
  rt_rw?: string
  latitude: number
  longitude: number
  gps_point: { lat: number; lng: number }
  title: string
  urgency_level: UrgencyLevel
  flexible_attributes: Record<string, any>
  photo_evidence_url?: string
  notes?: string
  etl_status: ETLStatus
  migrated_feature_id?: string | null
  created_at?: string
}

export interface ETLRunRequest {
  problem_domain?: string
  survey_ids?: string[]
  target_layer_type?: string
  auto_promote_spatial: boolean
}

export interface ETLMigratedItem {
  survey_id: string
  survey_code: string
  spatial_feature_id: string
  name: string
  layer_type: string
  island_name: string
  coordinates: [number, number]
}

export interface ETLRunResult {
  success: boolean
  message: string
  total_scanned: number
  migrated_count: number
  skipped_count: number
  migrated_items: ETLMigratedItem[]
  errors: string[]
}

export interface SurveyStats {
  total_surveys: number
  pending_etl: number
  migrated_to_postgres: number
  by_domain: Record<string, number>
  by_urgency: Record<string, number>
  by_island: Record<string, number>
}

function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '')
  }
  const protocol = window.location.protocol
  const host = window.location.hostname
  return `${protocol}//${host}:8005/api/v1`
}

export async function submitSurvey(payload: SurveyInput): Promise<SurveyItem> {
  const resp = await fetch(`${getApiBase()}/survei/mentah`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail || 'Gagal menyimpan formulir survei lapangan.')
  }
  return resp.json()
}

export async function getSurveys(filters?: {
  problem_domain?: string
  etl_status?: string
  island_name?: string
}): Promise<SurveyItem[]> {
  const params = new URLSearchParams()
  if (filters?.problem_domain) params.append('problem_domain', filters.problem_domain)
  if (filters?.etl_status) params.append('etl_status', filters.etl_status)
  if (filters?.island_name) params.append('island_name', filters.island_name)
  params.append('limit', '100')

  const resp = await fetch(`${getApiBase()}/survei/mentah?${params.toString()}`)
  if (!resp.ok) {
    throw new Error('Gagal mengambil daftar survei mentah.')
  }
  return resp.json()
}

export async function runETLMigration(request: ETLRunRequest): Promise<ETLRunResult> {
  const resp = await fetch(`${getApiBase()}/survei/migrasi-etl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail || 'Gagal menjalankan pipa ETL.')
  }
  return resp.json()
}

export async function getSurveyStats(): Promise<SurveyStats> {
  const resp = await fetch(`${getApiBase()}/survei/stats`)
  if (!resp.ok) {
    throw new Error('Gagal mengambil statistik survei.')
  }
  return resp.json()
}

export async function seedSampleSurveys(): Promise<{ success: boolean; message: string; seeded_count: number }> {
  const resp = await fetch(`${getApiBase()}/survei/seed-sample`, {
    method: 'POST',
  })
  if (!resp.ok) {
    throw new Error('Gagal menyemai data survei autentik.')
  }
  return resp.json()
}
