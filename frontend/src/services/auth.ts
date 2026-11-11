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
  },

  async login(username_or_email: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email, password }),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || `Login gagal (${res.status})`)
    }
    const data: TokenResponse = await res.json()
    this.setTokens(data.access_token, data.refresh_token)
    return data
  },

  async getMe(): Promise<User> {
    const token = this.getAccessToken()
    if (!token) {
      throw new Error('No access token')
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      throw new Error(`Gagal mengambil data user (${res.status})`)
    }
    return res.json()
  },

  logout() {
    this.clearTokens()
  },
}
