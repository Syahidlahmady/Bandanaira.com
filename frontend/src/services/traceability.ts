import { authService } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'

export interface Harvest {
  id: string
  farm_id: string
  farmer_id: string
  harvest_code: string
  commodity: string
  harvest_date: string
  quantity_kg: number
  quality_grade?: string
  notes?: string
}

export interface BatchEvent {
  id: string
  batch_id: string
  event_type: string
  event_timestamp: string
  location?: string
  description?: string
  event_hash: string
  previous_event_hash?: string
}

export interface ProductBatch {
  id: string
  batch_code: string
  commodity: string
  total_quantity_kg: number
  production_date: string
  public_verification_token: string
  status: string
  blockchain_status: string
  events: BatchEvent[]
  qr_code_base64?: string
}

export interface PublicBatchVerification {
  batch_code: string
  commodity: string
  total_quantity_kg: number
  production_date: string
  origin_village: string
  origin_farms: string[]
  status: string
  blockchain_status: string
  verified_integrity: boolean
  timeline: {
    event_type: string
    event_timestamp: string
    location?: string
    description?: string
    event_hash: string
  }[]
  qr_code_base64: string
}

export interface BlockchainTransaction {
  id: string
  batch_id: string
  event_id?: string
  transaction_hash?: string
  block_number?: number
  contract_address: string
  data_hash: string
  status: string
  submitted_at?: string
  confirmed_at?: string
  error_message?: string
  created_at: string
}

export interface BlockchainVerification {
  batch_id: string
  batch_code: string
  latest_db_hash: string
  on_chain_hash?: string
  is_verified: boolean
  status: string
  network_chain_id: number
  contract_address: string
  block_number?: number
  transaction_hash?: string
  verified_at: string
  message: string
}

export const traceabilityService = {
  getAuthHeaders(): HeadersInit {
    const token = authService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  },

  async listHarvests(): Promise<{ items: Harvest[]; total: number }> {
    const res = await fetch(`${API_BASE}/harvests?limit=100`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat catatan panen (${res.status})`)
    return res.json()
  },

  async createHarvest(data: {
    farm_id: string
    farmer_id: string
    harvest_code: string
    commodity: string
    harvest_date: string
    quantity_kg: number
    quality_grade?: string
  }): Promise<Harvest> {
    const res = await fetch(`${API_BASE}/harvests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal mencatat panen (${res.status})`)
    }
    return res.json()
  },

  async listBatches(): Promise<{ items: ProductBatch[]; total: number }> {
    const res = await fetch(`${API_BASE}/batches?limit=100`, { headers: this.getAuthHeaders() })
    if (!res.ok) throw new Error(`Gagal memuat data batch (${res.status})`)
    return res.json()
  },

  async createBatch(data: {
    batch_code: string
    commodity: string
    production_date: string
    harvests: { harvest_id: string; allocated_quantity_kg: number }[]
  }): Promise<ProductBatch> {
    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal membuat batch produk (${res.status})`)
    }
    return res.json()
  },

  async appendEvent(
    batchId: string,
    data: { event_type: string; location?: string; description?: string }
  ): Promise<BatchEvent> {
    const res = await fetch(`${API_BASE}/batches/${batchId}/events`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal menambahkan event rantai pasok (${res.status})`)
    }
    return res.json()
  },

  async anchorToBlockchain(batchId: string, eventId?: string): Promise<BlockchainTransaction> {
    const res = await fetch(`${API_BASE}/blockchain/batches/${batchId}/anchor`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventId ? { event_id: eventId } : {}),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal menjangkar batch ke blockchain (${res.status})`)
    }
    return res.json()
  },

  async getBlockchainTransactions(batchId: string): Promise<BlockchainTransaction[]> {
    const res = await fetch(`${API_BASE}/blockchain/batches/${batchId}/transactions`, {
      headers: this.getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Gagal memuat transaksi blockchain (${res.status})`)
    return res.json()
  },

  async verifyBlockchain(batchId: string): Promise<BlockchainVerification> {
    const res = await fetch(`${API_BASE}/blockchain/batches/${batchId}/verify`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Gagal memverifikasi blockchain (${res.status})`)
    }
    return res.json()
  },

  async verifyPublic(token: string): Promise<PublicBatchVerification> {
    const res = await fetch(`${API_BASE}/public/verify/${encodeURIComponent(token)}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Verifikasi QR gagal (${res.status})`)
    }
    return res.json()
  },
}

