export interface SecurityAuditReport {
  system_status: string
  owasp_compliance_score: number
  timestamp: string
  aes_encryption: {
    status: string
    cipher: string
    key_length_bits: number
    nonce_iv_bytes: number
    auth_tag_bytes: number
    mode: string
    purpose: string
  }
  hmac_blind_index: {
    status: string
    algorithm: string
    output_length_chars: number
    secret_pepper_configured: boolean
    search_complexity: string
    purpose: string
  }
  rate_limiting: {
    status: string
    max_requests_per_minute: number
    window_seconds: number
    protection: string
  }
  blockchain_zero_pii: {
    status: string
    pii_on_chain_detected: boolean
    rule: string
  }
  database_stats: {
    total_residents: number
    encrypted_residents: number
    cryptographic_coverage_pct: number
  }
}

export interface CryptoRoundtripResponse {
  plain_nik: string
  masked_nik: string
  blind_index: string
  ciphertext_base64: string
  decrypted_matches_original: boolean
  latency_ms: number
  cipher_algorithm: string
  hash_algorithm: string
}

export interface CitizenSecureProfile {
  id: string
  nik_masked: string
  nik_blind_index: string
  full_name: string
  gender: string
  village: string
  address?: string
  occupation?: string
  verification_status: string
  coop_balance_rp: number
  clean_water_quota_ltr: number
  plastic_points: number
  encryption_algorithm: string
  blind_index_algorithm: string
}

const getApiBase = () => {
  return typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8005/api/v1`
    : 'http://localhost:8005/api/v1'
}

export const securityService = {
  getAuditReport: async (): Promise<SecurityAuditReport> => {
    const res = await fetch(`${getApiBase()}/audit-keamanan`)
    if (!res.ok) throw new Error('Gagal memuat laporan audit keamanan.')
    return res.json()
  },

  testCryptoRoundtrip: async (nik: string): Promise<CryptoRoundtripResponse> => {
    const res = await fetch(`${getApiBase()}/security/test-crypto-roundtrip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal memverifikasi kriptografi NIK.')
    }
    return res.json()
  },

  searchCitizenByNIK: async (nik: string): Promise<CitizenSecureProfile> => {
    const res = await fetch(`${getApiBase()}/warga/cari-nik`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Data warga tidak ditemukan.')
    }
    return res.json()
  },
}
