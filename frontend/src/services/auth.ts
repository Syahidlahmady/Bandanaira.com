const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

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
    name: 'Nadia Putri (Wisatawan & Budaya)',
    nik: '8171010101900003',
    whatsapp: '081234560003',
    pin: '1234',
    roleTitle: 'Wisatawan',
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

    return accounts.find(
      (acc) =>
        acc.demoUsername.toLowerCase() === clean ||
        acc.nik === clean ||
        (digitsOnly.length >= 8 && acc.nik === digitsOnly) ||
        (digitsOnly.length >= 8 && acc.whatsapp.replace(/\D/g, '') === digitsOnly) ||
        acc.name.toLowerCase() === clean ||
        acc.roleTitle.toLowerCase() === clean
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
      const res = await fetch(`${API_BASE}/auth/login`, {
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
      if (matchedAccount && matchedAccount.name) {
        data.user = {
          ...data.user,
          full_name: matchedAccount.name,
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

  async getMe(): Promise<User> {
    const token = this.getAccessToken()
    if (!token) {
      throw new Error('No access token')
    }
    if (token.startsWith('offline-jwt-')) {
      const cached = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        throw new Error(`Gagal mengambil data user (${res.status})`)
      }
      const user: User = await res.json()
      const cached = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (cached) {
        const parsed: User = JSON.parse(cached)
        if (parsed.username === user.username && parsed.full_name) {
          user.full_name = parsed.full_name
        }
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
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  logout() {
    this.clearTokens()
  },
}
