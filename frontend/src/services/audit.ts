import { authService } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'

export interface AuditLogItem {
  id: string
  user_id?: string
  user?: {
    id: string
    username: string
    full_name?: string
  }
  action: string
  entity_name: string
  entity_id: string
  changes_json?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface AuditLogListResponse {
  total: number
  limit: number
  offset: number
  items: AuditLogItem[]
}

export interface EcosystemSummary {
  generated_at: string
  village_name: string
  population: {
    total_residents: number
    verified_residents: number
    pending_residents: number
    livelihoods_count: Record<string, number>
  }
  farms: {
    total_farmers: number
    total_farmer_groups: number
    total_farms: number
    verified_farms: number
    pending_farms: number
    total_area_sqm: number
    total_area_hectares: number
  }
  harvests: {
    total_harvest_records: number
    total_quantity_kg: number
    commodity_distribution: Record<string, number>
    grade_distribution: Record<string, number>
  }
  traceability: {
    total_batches: number
    blockchain_anchored_batches: number
    total_trace_events: number
  }
  letters: {
    total_requests: number
    approved_requests: number
    pending_requests: number
    rejected_requests: number
  }
  total_audit_events: number
  recent_audit_logs: AuditLogItem[]
}

export const auditService = {
  getAuthHeaders(): HeadersInit {
    const token = authService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  },

  async getLogs(params?: {
    entity_name?: string
    action?: string
    limit?: number
    offset?: number
  }): Promise<AuditLogListResponse> {
    const query = new URLSearchParams()
    if (params?.entity_name) query.append('entity_name', params.entity_name)
    if (params?.action) query.append('action', params.action)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    const res = await fetch(`${API_BASE}/audit/logs?${query.toString()}`, {
      headers: this.getAuthHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Gagal memuat log audit')
    }
    return res.json()
  },

  async getEcosystemSummary(): Promise<EcosystemSummary> {
    const res = await fetch(`${API_BASE}/audit/ecosystem-summary`, {
      headers: this.getAuthHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Gagal memuat rekapitulasi ekosistem desa')
    }
    return res.json()
  },
}
