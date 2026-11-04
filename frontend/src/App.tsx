import React, { useEffect, useState } from 'react'

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
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`)
        }
        return res.json()
      })
      .then((data: HealthResponse) => {
        setHealth(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [apiBase])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', color: '#1e3a8a', fontWeight: '800' }}>
          Banda Digital Ecosystem
        </h1>
        <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Platform Terpadu Kependudukan, Pemetaan Petani & Traceability Rempah Banda Neira
        </p>
      </header>

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
          Status Sistem (Phase 1: Project Foundation)
        </h2>
        {loading && <p style={{ color: '#64748b' }}>Memeriksa koneksi layanan backend...</p>}
        {error && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px' }}>
            Backend offline atau belum dapat dihubungi: {error}
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
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>PostgreSQL / PostGIS</span>
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
