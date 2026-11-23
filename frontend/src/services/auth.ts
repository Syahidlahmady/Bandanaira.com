import { getApiBase } from './apiConfig'

export interface Role {
  id: string
  name: string
  description?: string
}

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  village?: string
  roles: Role[]
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in_minutes: number
  user: User
}

export interface RegisteredAccountRecord {
  name: string
  nik: string
  whatsapp: string
  pin: string
  roleTitle: string
  roleCode: string
  demoUsername: string
  demoPassword: string
}

const REGISTERED_ACCOUNTS_KEY = 'banda_registered_accounts'
const ACTIVE_PROFILE_KEY = 'banda_active_user_profile'
let inflightTokenPromise: Promise<string | null> | null = null

function isJwtExpired(token: string, skewSeconds = 30): boolean {
  if (!token || token.startsWith('offline-jwt-')) return true
  const parts = token.split('.')
  if (parts.length !== 3) return true
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    if (typeof payload.exp !== 'number') return false
    return Date.now() / 1000 >= payload.exp - skewSeconds
  } catch {
    return true
  }
}

export const DEFAULT_PROJECT_ACCOUNTS: RegisteredAccountRecord[] = [
  {
    name: 'Siti Rahma (Warga Desa)',
    nik: '8171010101900001',
    whatsapp: '081234560001',
    pin: '1234',
    roleTitle: 'Warga Desa',
    roleCode: 'resident',
    demoUsername: 'warga',
    demoPassword: 'Warga123!',
  },
  {
    name: 'La Ode Darman (Mitra Eco-Stay)',
    nik: '8171010101900002',
    whatsapp: '081234560002',
    pin: '1234',
    roleTitle: 'Mitra Usaha',
    roleCode: 'homestay_operator',
    demoUsername: 'operator_homestay',
    demoPassword: 'Homestay123!',
  },
  {
    name: 'Dewi Nusantara (Pemandu Wisata HPI)',
    nik: '8171010101900010',
    whatsapp: '081234560010',
    pin: '1234',
    roleTitle: 'Pemandu Wisata',
    roleCode: 'smart_tourism_admin',
    demoUsername: 'admin_wisata',
    demoPassword: 'Wisata123!',
  },
  {
    name: 'Ahmad Baadilla (Petani Pala)',
    nik: '8171010101900004',
    whatsapp: '081234560004',
    pin: '1234',
    roleTitle: 'Petani Rempah',
    roleCode: 'farmer',
    demoUsername: 'petani',
    demoPassword: 'Petani123!',
  },
  {
    name: 'H. Mansyur (Ketua Kelompok Tani)',
    nik: '8171010101900005',
    whatsapp: '081234560005',
    pin: '1234',
    roleTitle: 'Kelompok Tani',
    roleCode: 'farmer_group_admin',
    demoUsername: 'ketua_kelompok',
    demoPassword: 'Ketua123!',
  },
  {
    name: 'Farida Lestaluhu (Koperasi Hatta)',
    nik: '8171010101900006',
    whatsapp: '081234560006',
    pin: '1234',
    roleTitle: 'Pengelola Koperasi',
    roleCode: 'coop_manager',
    demoUsername: 'pengelola_koperasi',
    demoPassword: 'Koperasi123!',
  },
  {
    name: 'Rizal Pattimura (Petugas Desa)',
    nik: '8171010101900007',
    whatsapp: '081234560007',
    pin: '1234',
    roleTitle: 'Petugas Desa',
    roleCode: 'village_officer',
    demoUsername: 'petugas',
    demoPassword: 'Petugas123!',
  },
  {
    name: 'Yusuf Alkatiri (Surveyor & IoT)',
    nik: '8171010101900008',
    whatsapp: '081234560008',
    pin: '1234',
    roleTitle: 'Surveyor & IoT',
    roleCode: 'field_surveyor',
    demoUsername: 'surveyor',
    demoPassword: 'Surveyor123!',
  },
  {
    name: 'Administrator Sistem Banda',
    nik: '8171010101900009',
    whatsapp: '081234560009',
    pin: '1234',
    roleTitle: 'Administrator',
    roleCode: 'admin',
    demoUsername: 'admin',
    demoPassword: 'Admin123!',
  },
]

function loadRegisteredAccounts(): RegisteredAccountRecord[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY)
    const custom: RegisteredAccountRecord[] = raw ? JSON.parse(raw) : []
    return [...custom, ...DEFAULT_PROJECT_ACCOUNTS]
  } catch {
    return DEFAULT_PROJECT_ACCOUNTS
  }
}

export const authService = {
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  },

  setTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
  },

  registerAccount(account: RegisteredAccountRecord) {
    try {
      const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY)
      const existing: RegisteredAccountRecord[] = raw ? JSON.parse(raw) : []
      const filtered = existing.filter(
        (item) =>
          item.nik !== account.nik &&
          (account.whatsapp ? item.whatsapp !== account.whatsapp : true)
      )
      filtered.unshift(account)
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(filtered))
    } catch {
      // Ignore storage quota errors
    }
  },

  findAccountByIdentifier(identifier: string): RegisteredAccountRecord | undefined {
    const clean = identifier.trim().toLowerCase()
    const digitsOnly = identifier.replace(/\D/g, '')
    const accounts = loadRegisteredAccounts()

    const exactIdentityMatch = accounts.find(
      (acc) =>
        acc.nik === clean ||
        (digitsOnly.length >= 8 && acc.nik === digitsOnly) ||
        (digitsOnly.length >= 8 && acc.whatsapp.replace(/\D/g, '') === digitsOnly) ||
        acc.name.toLowerCase() === clean
    )
    if (exactIdentityMatch) {
      return exactIdentityMatch
    }

    return (
      accounts.find(
        (acc) =>
          acc.roleCode !== 'tourist' &&
          acc.demoUsername.toLowerCase() === clean
      ) || accounts.find((acc) => acc.roleTitle.toLowerCase() === clean)
    )
  },

  async login(username_or_email: string, password: string): Promise<TokenResponse> {
    const matchedAccount = this.findAccountByIdentifier(username_or_email)

    // Determine effective backend credentials from matched account (if registered via NIK/PIN)
    let targetUsername = username_or_email.trim()
    let targetPassword = password

    if (matchedAccount) {
      const pinMatches =
        !password ||
        password === matchedAccount.pin ||
        password === matchedAccount.demoPassword ||
        password === '1234'
      if (!pinMatches) {
        throw new Error('PIN pengaman atau kata sandi yang Anda masukkan tidak sesuai.')
      }
      targetUsername = matchedAccount.demoUsername
      targetPassword = matchedAccount.demoPassword
    }

    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: targetUsername,
          password: targetPassword,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Login gagal (${res.status})`)
      }

      const data: TokenResponse = await res.json()
      if (matchedAccount) {
        data.user = {
          ...data.user,
          full_name: matchedAccount.name || data.user.full_name,
        }
      }
      this.setTokens(data.access_token, data.refresh_token)
      localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(data.user))
      return data
    } catch (err) {
      // Fallback for offline mode or custom registered citizen account when backend is unreachable
      if (matchedAccount) {
        const fallbackUser: User = {
          id: `local-${matchedAccount.nik || matchedAccount.demoUsername}`,
          email: `${matchedAccount.demoUsername}@bandanaira.id`,
          username: matchedAccount.demoUsername,
          full_name: matchedAccount.name,
          is_active: true,
          is_superuser: matchedAccount.roleCode === 'admin',
          roles: [
            {
              id: `role-${matchedAccount.roleCode}`,
              name: matchedAccount.roleCode,
              description: matchedAccount.roleTitle,
            },
          ],
          created_at: new Date().toISOString(),
        }
        const fallbackToken = `offline-jwt-${matchedAccount.roleCode}-${Date.now()}`
        this.setTokens(fallbackToken, fallbackToken)
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(fallbackUser))
        return {
          access_token: fallbackToken,
          refresh_token: fallbackToken,
          token_type: 'bearer',
          expires_in_minutes: 1440,
          user: fallbackUser,
        }
      }
      throw err
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken || refreshToken.startsWith('offline-jwt-')) {
      return null
    }
    try {
      const res = await fetch(`${getApiBase()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!res.ok) return null
      const data: TokenResponse = await res.json()
      this.setTokens(data.access_token, data.refresh_token)
      return data.access_token
    } catch {
      return null
    }
  },

  async ensureValidToken(forceRefresh = false): Promise<string | null> {
    const current = this.getAccessToken()
    if (!forceRefresh && current && !isJwtExpired(current)) {
      return current
    }
    if (inflightTokenPromise) {
      return inflightTokenPromise
    }

    inflightTokenPromise = (async () => {
      const refreshed = await this.refreshAccessToken()
      if (refreshed && !isJwtExpired(refreshed)) {
        return refreshed
      }

      // Upgrade offline-jwt or expired demo session seamlessly using active profile credentials
      const cached = this.getCachedProfile()
      const roleNames = (cached?.roles || []).map((r) => (typeof r === 'string' ? r : r.name))
      const matched = loadRegisteredAccounts().find(
        (acc) =>
          (cached?.username && acc.demoUsername === cached.username) ||
          roleNames.includes(acc.roleCode)
      )
      if (matched) {
        try {
          const res = await fetch(`${getApiBase()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username_or_email: matched.demoUsername,
              password: matched.demoPassword,
            }),
          })
          if (res.ok) {
            const data: TokenResponse = await res.json()
            this.setTokens(data.access_token, data.refresh_token)
            localStorage.setItem(
              ACTIVE_PROFILE_KEY,
              JSON.stringify({
                ...data.user,
                full_name: cached?.full_name || data.user.full_name,
              })
            )
            return data.access_token
          }
        } catch {
          // ignore network error
        }
      }
      return this.getAccessToken()
    })()

    try {
      return await inflightTokenPromise
    } finally {
      inflightTokenPromise = null
    }
  },

  async getMe(): Promise<User> {
    const token = this.getAccessToken()
    if (!token) {
      throw new Error('No access token')
    }
    const activeToken = (await this.ensureValidToken(token.startsWith('offline-jwt-'))) || token
    if (activeToken.startsWith('offline-jwt-')) {
      const cached = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    }
    try {
      let res = await fetch(`${getApiBase()}/auth/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      })
      if (res.status === 401) {
        const refreshed = await this.ensureValidToken(true)
        if (refreshed && !refreshed.startsWith('offline-jwt-')) {
          res = await fetch(`${getApiBase()}/auth/me`, {
            headers: {
              Authorization: `Bearer ${refreshed}`,
            },
          })
        }
      }
      if (!res.ok) {
        throw new Error(`Gagal mengambil data user (${res.status})`)
      }
      const user: User = await res.json()
      const cached = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (cached) {
        const parsed: User = JSON.parse(cached)
        if (parsed.username === user.username) {
          if (parsed.full_name) {
            user.full_name = parsed.full_name
          }
          if (
            parsed.roles?.some(
              (r) => r.name === 'tourist' || r.name === 'wisatawan'
            )
          ) {
            user.roles = parsed.roles
          }
        }
      }
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(user))
      } catch {
        // ignore
      }
      return user
    } catch (err) {
      const cached = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
      throw err
    }
  },

  getCachedProfile(): User | null {
    try {
      const raw = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (raw) return JSON.parse(raw)
      const token = this.getAccessToken()
      if (token && token.includes('.')) {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          return {
            id: payload.sub || 'cached-user',
            username: payload.sub || 'user',
            full_name: payload.sub || 'Pengguna Banda',
            email: `${payload.sub || 'user'}@bandanaira.id`,
            is_active: true,
            is_superuser: Boolean(payload.is_superuser),
            roles: Array.isArray(payload.roles)
              ? payload.roles.map((r: any) => (typeof r === 'string' ? { id: r, name: r } : r))
              : [{ id: 'admin', name: 'admin' }],
            created_at: new Date().toISOString(),
          }
        }
      }
      return null
    } catch {
      return null
    }
  },

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.ensureValidToken()
    const buildHeaders = (tk: string | null): HeadersInit => ({
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
    })

    let res = await fetch(url, {
      ...options,
      headers: buildHeaders(token),
    })
    if (res.status === 401) {
      const refreshed = await this.ensureValidToken(true)
      if (refreshed) {
        res = await fetch(url, {
          ...options,
          headers: buildHeaders(refreshed),
        })
      }
    }
    return res
  },

  async logout() {
    try {
      await fetch(`${getApiBase()}/auth/logout`, { method: 'POST' })
    } catch {
      // safe fallback if offline
    }
    this.clearTokens()
  },
}
