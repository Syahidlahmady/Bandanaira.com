import React, { useState } from 'react'
import {
  ShieldCheck,
  MapPin,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  QrCode,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface LoginSectionProps {
  username: string
  setUsername: (u: string) => void
  password: string
  setPassword: (p: string) => void
  onLogin: (e: React.FormEvent) => void
  onQuickLogin?: (u: string, p: string) => void
  onVerifySampleBatch?: (token: string) => void
  onPublicVerify?: (token: string) => void
  loading: boolean
  error: string | null
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  onLogin,
  onQuickLogin,
  onVerifySampleBatch,
  onPublicVerify,
  loading,
  error,
}) => {
  const [showManualLogin, setShowManualLogin] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const handleQuick = (u: string, p: string) => {
    if (onQuickLogin) {
      onQuickLogin(u, p)
    } else {
      setUsername(u)
      setPassword(p)
    }
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    if (onPublicVerify) {
      onPublicVerify(tokenInput.trim())
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* 1. HERO GREETING BANNER */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
          color: '#ffffff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Sparkles size={13} /> Sistem Resmi Desa Banda Neira
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <MapPin size={12} /> Kepulauan Banda, Maluku Tengah
            </span>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.65rem' }}>
            Selamat Datang di Portal Desa Banda Neira
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#e0f2fe', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Aplikasi mudah digunakan untuk seluruh masyarakat: petani dapat mencatat panen pala langsung dari kebun (bisa tanpa sinyal), warga dapat mengurus surat desa secara online, dan pembeli/turis dapat memeriksa keaslian pala asli Banda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem' }}>
              <b style={{ display: 'block', color: '#ffffff' }}>🌾 Catat Panen Mudah</b>
              <span style={{ color: '#cbd5e1' }}>Bisa catat di kebun saat offline</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem' }}>
              <b style={{ display: 'block', color: '#ffffff' }}>🏛️ Layanan Warga Online</b>
              <span style={{ color: '#cbd5e1' }}>Surat SKU, Domisili, dan KTP</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem' }}>
              <b style={{ display: 'block', color: '#ffffff' }}>🛡️ Jaminan Pala Asli</b>
              <span style={{ color: '#cbd5e1' }}>Sertifikat QR Indikasi Geografis</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHOOSE ROLE CARDS (1-CLICK ENTRY) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Siapa Anda? Pilih untuk Langsung Masuk:
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Klik salah satu tombol peran di bawah untuk langsung mencoba sistem:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: Petani */}
          <div
            className="app-card"
            style={{
              background: '#ffffff',
              border: '2px solid #bbf7d0',
              padding: '1.5rem',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.4rem' }}>👨‍🌾</span>
                <span className="badge badge-green">Petani Rempah</span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#166534', marginBottom: '0.35rem' }}>
                Saya Petani Rempah Pala
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Catat hasil petik pala, fuli, atau cengkeh langsung dari kebun. Data tersimpan otomatis walau di kebun tanpa sinyal internet.
              </p>
            </div>
            <button
              onClick={() => handleQuick('petani', 'Petani123!')}
              disabled={loading}
              className="btn btn-primary"
              style={{
                background: '#16a34a',
                borderColor: '#15803d',
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Masuk sebagai Petani <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Warga */}
          <div
            className="app-card"
            style={{
              background: '#ffffff',
              border: '2px solid #bfdbfe',
              padding: '1.5rem',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.4rem' }}>👤</span>
                <span className="badge badge-blue">Warga Desa</span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.35rem' }}>
                Saya Warga Desa Banda
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Cek data kependudukan dan ajukan permohonan surat keterangan (SKU, Domisili, Pengantar KTP) secara mandiri dari HP.
              </p>
            </div>
            <button
              onClick={() => handleQuick('warga', 'Warga123!')}
              disabled={loading}
              className="btn btn-primary"
              style={{
                background: '#2563eb',
                borderColor: '#1d4ed8',
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Masuk sebagai Warga <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 3: Petugas Kantor Desa */}
          <div
            className="app-card"
            style={{
              background: '#ffffff',
              border: '2px solid #fed7aa',
              padding: '1.5rem',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.4rem' }}>🏛️</span>
                <span className="badge badge-amber">Petugas Desa</span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.35rem' }}>
                Saya Petugas Kantor Desa
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Kelola data kependudukan, setujui permohonan surat warga, rekap kelompok tani, dan terbitkan label kemasan rempah pala.
              </p>
            </div>
            <button
              onClick={() => handleQuick('petugas', 'Petugas123!')}
              disabled={loading}
              className="btn btn-primary"
              style={{
                background: '#ea580c',
                borderColor: '#c2410c',
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Masuk sebagai Petugas <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 4: Ketua Poktan & Admin */}
          <div
            className="app-card"
            style={{
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              padding: '1.5rem',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.4rem' }}>🌾</span>
                <span className="badge badge-purple">Admin & Poktan</span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                Ketua Poktan & Admin
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '1rem' }}>
                Akses manajemen kelompok tani Lonthoir atau hak akses penuh seluruh konfigurasi sistem desa.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleQuick('ketua_kelompok', 'Ketua123!')}
                disabled={loading}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.82rem', padding: '0.65rem 0.4rem', fontWeight: 600 }}
              >
                Ketua Poktan
              </button>
              <button
                onClick={() => handleQuick('admin', 'Admin123!')}
                disabled={loading}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.82rem', padding: '0.65rem 0.4rem', fontWeight: 600 }}
              >
                Admin Desa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PUBLIC SPICE AUTHENTICITY CHECK FOR CONSUMERS & TOURISTS */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '2px solid #86efac',
          padding: '1.75rem',
          borderRadius: '16px',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="badge badge-green" style={{ marginBottom: '0.4rem' }}>
              <CheckCircle2 size={12} /> Cek Keaslian Pala Banda (Publik / Wisatawan)
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginBottom: '0.35rem' }}>
              Periksa Keaslian Rempah Pala Asal Banda Neira
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
              Wisatawan dan konsumen dapat memeriksa keaslian asal kebun, tanggal panen, dan kelompok tani tanpa perlu memiliki akun.
            </p>

            <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Masukkan nomor kode rempah atau token QR..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.25rem',
                  fontWeight: 700,
                }}
              >
                <QrCode size={16} /> Periksa Keaslian
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#4b5563' }}>
              <span>💡 Coba langsung contoh:</span>
              <button
                type="button"
                onClick={() => {
                  setTokenInput('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')
                  if (onVerifySampleBatch) {
                    onVerifySampleBatch('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')
                  }
                }}
                className="badge badge-green"
                style={{ cursor: 'pointer', border: '1px solid #86efac', background: '#dcfce7' }}
              >
                🌿 Pala Super Lonthoir (Klik Cek)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTokenInput('BN_VERIFY_FULI_MERAH_2026_BELGICA')
                  if (onVerifySampleBatch) {
                    onVerifySampleBatch('BN_VERIFY_FULI_MERAH_2026_BELGICA')
                  }
                }}
                className="badge badge-amber"
                style={{ cursor: 'pointer', border: '1px solid #fde68a', background: '#fef3c7' }}
              >
                🌺 Fuli Merah Belgica (Klik Cek)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COLLAPSIBLE MANUAL LOGIN FORM */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowManualLogin(!showManualLogin)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
          }}
        >
          {showManualLogin ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{showManualLogin ? 'Sembunyikan Login Manual' : 'Atau Masuk dengan Username & Kata Sandi Manual'}</span>
        </button>

        {showManualLogin && (
          <div
            className="app-card"
            style={{
              maxWidth: '420px',
              margin: '1rem auto 0 auto',
              padding: '1.5rem',
              textAlign: 'left',
              background: '#ffffff',
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Login Akun Manual
            </h4>
            <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  Username / Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username..."
                    required
                    className="form-input"
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  Kata Sandi
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem' }}
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
