import React, { useEffect, useState } from 'react'
import { authService, User } from './services/auth.ts'

interface HealthResponse {
  status: string
  version: string
  timestamp: string
  services: {
    api: string
    database: string
  }
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true)
  const [healthError, setHealthError] = useState<string | null>(null)

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string>('admin')
  const [password, setPassword] = useState<string>('Admin123!')
  const [authLoading, setAuthLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'

  useEffect(() => {
    // 1. Fetch Health
    fetch(`${apiBase}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
        return res.json()
      })
      .then((data: HealthResponse) => {
        setHealth(data)
        setLoadingHealth(false)
      })
      .catch((err: Error) => {
        setHealthError(err.message)
        setLoadingHealth(false)
      })

    // 2. Check existing session
    const token = authService.getAccessToken()
    if (token) {
      authService
        .getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => authService.clearTokens())
    }
  }, [apiBase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await authService.login(username, password)
      setCurrentUser(response.user)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError('Terjadi kesalahan autentikasi')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', color: '#1e3a8a', fontWeight: '800' }}>
          Banda Digital Ecosystem
        </h1>
        <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Platform Terpadu Kependudukan, Pemetaan Petani & Traceability Rempah Banda Neira
        </p>
      </header>

      {/* Authentication & User Session Section */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>
          Autentikasi & Akses Pengguna (Phase 2: RBAC)
        </h2>

        {currentUser ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                Selamat datang, {currentUser.full_name} (@{currentUser.username})
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {currentUser.roles.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    {r.name}
                  </span>
                ))}
                {currentUser.is_superuser && (
                  <span
                    style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    superuser
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              Keluar (Logout)
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            {authError && (
              <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.6rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                {authError}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.25rem' }}>
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.25rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              style={{
                background: '#1e40af',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '6px',
                fontWeight: '600',
                marginTop: '0.25rem',
              }}
            >
              {authLoading ? 'Memproses...' : 'Masuk (Login)'}
            </button>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Default development admin: <code>admin</code> / <code>Admin123!</code>
            </span>
          </form>
        )}
      </section>

      {/* System Status Section */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>
          Status Infrastruktur Sistem
        </h2>
        {loadingHealth && <p style={{ color: '#64748b' }}>Memeriksa koneksi layanan backend...</p>}
        {healthError && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px' }}>
            Backend offline atau belum dapat dihubungi: {healthError}
          </div>
        )}
        {health && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>API Gateway</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669', marginTop: '0.25rem' }}>
                {health.services.api.toUpperCase()} (v{health.version})
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Database Engine</span>
              <p
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: health.services.database === 'connected' ? '#059669' : '#d97706',
                  marginTop: '0.25rem',
                }}
              >
                {health.services.database.toUpperCase()}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Status Global</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginTop: '0.25rem' }}>
                {health.status.toUpperCase()}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 3 Main Pillars Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>
            1. Kependudukan Desa
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6' }}>
            Identitas digital penduduk lokal (UUID internal), verifikasi berkas, dan administrasi layanan desa.
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#059669', marginBottom: '0.5rem' }}>
            2. Pemetaan Petani Rempah
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6' }}>
            Pendataan kelompok tani, petani rempah, dan visualisasi spasial kebun (pala & cengkih) dengan PostGIS + Leaflet.
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#7c3aed', marginBottom: '0.5rem' }}>
            3. Traceability Rempah
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6' }}>
            Pencatatan panen, rantai batch, bukti hash audit trail di smart contract blockchain, dan verifikasi QR publik.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
