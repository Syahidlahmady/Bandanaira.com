export interface CommodityDepositInput {
  nik: string
  commodity_type: string
  weight_kg: number
  destination: 'BALANCE' | 'WATER_QUOTA'
  notes?: string
}

export interface WasteDepositInput {
  nik: string
  waste_type: string
  weight_kg: number
  destination?: 'WATER_QUOTA' | 'BALANCE'
  notes?: string
}

export interface WaterRedemptionInput {
  nik: string
  liters_requested: number
  station_code?: string
}

export interface WaterRedemptionResponse {
  transaction_code: string
  liters_dispensed: number
  remaining_quota_ltr: number
  valve_status: string
  dispense_duration_sec: number
  station_code: string
  receipt_hash: string
  message: string
}

export interface CoopTransactionItem {
  id: string
  transaction_code: string
  transaction_type: string
  item_name: string
  weight_or_volume: number
  unit_price_rp: number
  monetary_value_rp: number
  water_quota_impact_ltr: number
  destination: string
  receipt_hash: string
  station_code?: string | null
  notes?: string | null
  created_at: string
}

export interface CitizenCoopProfileResponse {
  nik: string
  full_name: string
  village?: string | null
  occupation?: string | null
  coop_balance_rp: number
  plastic_points: number
  clean_water_quota_ltr: number
  total_commodities_kg: number
  total_plastic_recycled_kg: number
  recent_transactions: CoopTransactionItem[]
}

export interface CoopEcosystemRecap {
  total_active_accounts: number
  total_coop_balance_rp: number
  total_clean_water_quota_ltr: number
  total_commodities_recap_kg: number
  total_plastic_recycled_kg: number
  total_transactions_count: number
}

export const COMMODITY_OPTIONS = [
  { code: 'pala_super', name: 'Pala Banda Grade A Super', price: 75000, icon: '🌰' },
  { code: 'pala_grade_b', name: 'Pala Banda Grade B Kupas', price: 55000, icon: '🌰' },
  { code: 'fuli_merah', name: 'Fuli Merah Murni Banda (Bunga Pala)', price: 95000, icon: '🌺' },
  { code: 'cengkeh', name: 'Cengkeh Kering Petik Kebun', price: 60000, icon: '🌿' },
  { code: 'ikan_cakalang', name: 'Ikan Cakalang Segar Pesisir', price: 25000, icon: '🐟' },
  { code: 'tuna_sirip_kuning', name: 'Tuna Sirip Kuning Segar (Yellowfin)', price: 45000, icon: '🐟' },
]

export const WASTE_OPTIONS = [
  { code: 'botol_plastik_pet', name: 'Botol Plastik Bekas Minum (PET)', price: 5000, waterPerKg: 10, icon: '🍶' },
  { code: 'jeriken_galon_hdpe', name: 'Jeriken & Galon Rusak (HDPE)', price: 6000, waterPerKg: 12, icon: '🪣' },
  { code: 'kardus_kertas', name: 'Kardus & Karton Bersih', price: 2500, waterPerKg: 5, icon: '📦' },
]

export const WATER_STATIONS = [
  { code: 'RO-STATION-LONTHOIR-01', name: 'Stasiun RO Desa Lonthoir (Dekat Perkebunan Pala)' },
  { code: 'RO-STATION-NEIRA-PELABUHAN', name: 'Dispenser Pelabuhan Banda Neira' },
  { code: 'RO-STATION-HATTA-MASJID', name: 'Kiosk Air Bersih Masjid Pulau Hatta' },
  { code: 'RO-STATION-AY-CENTRAL', name: 'Stasiun SWRO Pulau Ay Terpadu' },
]

const getApiBase = () => {
  return typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8005/api/v1`
    : 'http://localhost:8005/api/v1'
}

export const koperasiService = {
  async getCitizenProfile(nik: string): Promise<CitizenCoopProfileResponse> {
    const res = await fetch(`${getApiBase()}/koperasi/warga/${nik}/profil`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal memuat profil akun warga.')
    }
    return res.json()
  },

  async depositCommodity(payload: CommodityDepositInput): Promise<CoopTransactionItem> {
    const res = await fetch(`${getApiBase()}/koperasi/transaksi/setor-komoditas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal mencatat setoran komoditas.')
    }
    return res.json()
  },

  async depositWaste(payload: WasteDepositInput): Promise<CoopTransactionItem> {
    const res = await fetch(`${getApiBase()}/koperasi/transaksi/setor-sampah`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal mencatat setoran sampah.')
    }
    return res.json()
  },

  async redeemWater(payload: WaterRedemptionInput): Promise<WaterRedemptionResponse> {
    const res = await fetch(`${getApiBase()}/koperasi/tebus-air`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal menebus air bersih.')
    }
    return res.json()
  },

  async listTransactions(params?: {
    nik?: string
    trx_type?: string
    limit?: number
  }): Promise<CoopTransactionItem[]> {
    const q = new URLSearchParams()
    if (params?.nik) q.append('nik', params.nik)
    if (params?.trx_type) q.append('trx_type', params.trx_type)
    if (params?.limit) q.append('limit', params.limit.toString())

    const res = await fetch(`${getApiBase()}/koperasi/transaksi?${q.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil daftar transaksi buku besar.')
    return res.json()
  },

  async getRecap(): Promise<CoopEcosystemRecap> {
    const res = await fetch(`${getApiBase()}/koperasi/rekapitulasi`)
    if (!res.ok) throw new Error('Gagal mengambil ringkasan ekosistem koperasi.')
    return res.json()
  },
}
