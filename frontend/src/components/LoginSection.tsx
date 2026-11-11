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
  Eye,
  EyeOff,
  Compass,
  Cpu,
  Fingerprint,
  ShoppingBag,
  Scale,
  Radio,
  Home,
  Layers,
  Database,
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
  onOpenMarketplace?: () => void
  onOpenPlanner?: () => void
  onOpenKoperasi?: () => void
  onOpenTelemetry?: () => void
  onOpenTourism?: () => void
  onOpenGIS?: () => void
  onOpenSurvei?: () => void
  loading: boolean
  error: string | null
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  onLogin,
  onVerifySampleBatch,
  onPublicVerify,
  onOpenMarketplace,
  onOpenPlanner,
  onOpenKoperasi,
  onOpenTelemetry,
  onOpenTourism,
  onOpenGIS,
  onOpenSurvei,
  loading,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [selectedRoleHint, setSelectedRoleHint] = useState<string | null>(null)

  const demoAccounts = [
    {
      role: 'Petani Rempah Pala',
      icon: '👨‍🌾',
      u: 'petani',
      p: 'Petani123!',
      badge: 'Pala & Cengkeh',
      accentColor: '#10b981',
      badgeClass: 'badge-emerald',
      desc: 'Catat hasil panen kebun & pantau geolokasi petak lahan',
    },
    {
      role: 'Warga Masyarakat Desa',
      icon: '👤',
      u: 'warga',
      p: 'Warga123!',
      badge: 'Layanan Mandiri',
      accentColor: '#06b6d4',
      badgeClass: 'badge-blue',
      desc: 'Permohonan surat SKU usaha, domisili, & pengantar KTP',
    },
    {
      role: 'Petugas Kantor Desa',
      icon: '🏛️',
      u: 'petugas',
      p: 'Petugas123!',
      badge: 'Pemerintahan',
      accentColor: '#f59e0b',
      badgeClass: 'badge-amber',
      desc: 'Verifikasi kependudukan, validasi lahan & terbitkan surat',
    },
    {
      role: 'Ketua Kelompok Tani',
      icon: '🌾',
      u: 'ketua_kelompok',
      p: 'Ketua123!',
      badge: 'Poktan Lonthoir',
      accentColor: '#a855f7',
      badgeClass: 'badge-purple',
      desc: 'Daftarkan petak anggota & monitoring rekapitulasi panen',
    },
    {
      role: 'Administrator Sistem',
      icon: '👑',
      u: 'admin',
      p: 'Admin123!',
      badge: 'Root Access',
      accentColor: '#ec4899',
      badgeClass: 'badge-red',
      desc: 'Audit trail kriptografis, anchoring blockchain & konfigurasi',
    },
  ]

  const handleSelectRole = (u: string, p: string, roleName: string) => {
    setUsername(u)
    setPassword(p)
    setSelectedRoleHint(`Pass Digital ${roleName} aktif. Kredensial telah disuntikkan ke terminal login.`)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    if (onPublicVerify) {
      onPublicVerify(tokenInput.trim())
    }
  }

  return (
    <div style={{ marginBottom: '2.5rem' }} className="animate-fade-in">
      {/* 1. CYBER COMMAND BANNER (HERO) */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 78, 59, 0.35) 60%, rgba(10, 15, 29, 0.95) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.15)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Top Glow Sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #10b981, #06b6d4, transparent)',
          }}
        />

        <div style={{ maxWidth: '880px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={13} /> SISTEM RESMI DESA BANDA NEIRA
            </span>
            <span
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid rgba(6, 182, 212, 0.4)',
              }}
            >
              <Cpu size={13} /> BCRYPT &amp; JWT CRYPTO VAULT
            </span>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid rgba(245, 158, 11, 0.35)',
              }}
            >
              <MapPin size={13} /> 4°31′S 129°54′E &bull; BANDA BESAR
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.35rem',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '0.85rem',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ffffff 40%, #a7f3d0 80%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ekosistem Digital Terpadu Banda Neira
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#94a3b8',
              lineHeight: 1.65,
              marginBottom: '1.75rem',
              maxWidth: '820px',
            }}
          >
            Infrastruktur digital berdaulat untuk tata kelola kependudukan kepulauan, pendataan mata pencaharian bahari-agraris (petani pala, nelayan tradisional, pengolah fuli), pemetaan geospasial petak kebun rempah, serta verifikasi mutu &amp; keaslian Indikasi Geografis Pala Banda berbasis blockchain.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '3px solid #10b981',
              }}
            >
              <b style={{ display: 'block', color: '#f8fafc', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                👥 Sensus Profesi Warga Desa
              </b>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>
                Petani pala, nelayan tangkap, pengolah fuli merah &amp; pedagang rempah pesisir.
              </span>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '3px solid #06b6d4',
              }}
            >
              <b style={{ display: 'block', color: '#f8fafc', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                🌾 Log Mutu &amp; Panen Offline
              </b>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>
                Tetap dapat mencatat di tengah kebun tanpa internet via PWA IndexedDB cache.
              </span>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '3px solid #f59e0b',
              }}
            >
              <b style={{ display: 'block', color: '#f8fafc', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                ⛓️ Paspor Mutu Rempah EVM
              </b>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>
                Kriptografi hash permanen menjamin keaslian Pala Banda ke seluruh dunia.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL BENTO TERMINAL: AUTHENTICATION (LEFT) & HOLOGRAPHIC ROLE PASSES (RIGHT) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2rem',
        }}
      >
        {/* SECURE TERMINAL LOGIN CARD */}
        <div
          className="app-card"
          style={{
            padding: '2.25rem 2rem',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.25)',
                }}
              >
                <Fingerprint size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Akses Terproteksi
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                  Terminal Masuk Akun
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              Otentikasi operator desa, ketua kelompok tani, petani rempah, atau warga untuk mengelola layanan mandiri &amp; perkebunan.
            </p>

            {selectedRoleHint && (
              <div
                className="animate-fade-in"
                style={{
                  marginBottom: '1.25rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.825rem',
                  color: '#a7f3d0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)',
                }}
              >
                <Sparkles size={16} color="#34d399" style={{ flexShrink: 0 }} />
                <span>{selectedRoleHint}</span>
              </div>
            )}

            <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.825rem' }}>
                  ID PENGGUNA / USERNAME
                </label>
                <div style={{ position: 'relative' }}>
                  <Users
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                    }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: petugas, petani, warga..."
                    required
                    className="form-control"
                    style={{ paddingLeft: '2.65rem', fontSize: '0.925rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.825rem' }}>
                  KATA SANDI / SECURITY KEY
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun..."
                    required
                    className="form-control"
                    style={{ paddingLeft: '2.65rem', paddingRight: '2.85rem', fontSize: '0.925rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="animate-fade-in"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={17} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.975rem',
                  fontWeight: 800,
                  marginTop: '0.5rem',
                  letterSpacing: '0.02em',
                }}
              >
                {loading ? 'Memverifikasi Otentikasi...' : 'Masuk Sekarang (Login Aman)'}{' '}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.15rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              color: '#64748b',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span>Dilindungi enkripsi Bcrypt Salt rounds &amp; token JWT dengan kedaluwarsa otomatis.</span>
          </div>
        </div>

        {/* HOLOGRAPHIC PERSONA PASSES (ROLE SELECTOR) */}
        <div
          className="app-card"
          style={{
            padding: '2.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
                }}
              >
                <Compass size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Quick Simulator
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                  Pass Persona Pengguna
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.55 }}>
              Klik salah satu pass digital di bawah untuk mengisikan kredensial otomatis sesuai hak akses (RBAC):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {demoAccounts.map((acc) => {
                const isSelected = username === acc.u
                return (
                  <button
                    key={acc.u}
                    type="button"
                    onClick={() => handleSelectRole(acc.u, acc.p, acc.role)}
                    className="app-card-interactive"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, rgba(15, 23, 42, 0.95), ${acc.accentColor}25)`
                        : 'rgba(15, 23, 42, 0.65)',
                      borderColor: isSelected ? acc.accentColor : 'rgba(255, 255, 255, 0.08)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderLeft: `4px solid ${acc.accentColor}`,
                      textAlign: 'left',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected
                        ? `0 6px 20px -2px ${acc.accentColor}40, 0 0 15px ${acc.accentColor}25`
                        : 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                        {acc.icon}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <b style={{ fontSize: '0.9rem', color: isSelected ? '#ffffff' : '#f1f5f9' }}>
                            {acc.role}
                          </b>
                          {isSelected && <CheckCircle2 size={15} color={acc.accentColor} />}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
                          {acc.desc}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        background: `${acc.accentColor}20`,
                        color: acc.accentColor,
                        border: `1px solid ${acc.accentColor}40`,
                        whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      @{acc.u}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.15rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            💡 Setiap peran menerapkan otorisasi ketat (Role-Based Access Control) untuk melindungi kerahasiaan NIK dan dokumen warga desa.
          </div>
        </div>
      </div>

      {/* 3. PUBLIC SPICE AUTHENTICITY RADAR (NO LOGIN REQUIRED) */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(8, 12, 20, 0.95) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.15)',
          padding: '2rem 2.25rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.18)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={30} />
          </div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">
                <CheckCircle2 size={12} /> RADAR VERIFIKASI REMPAH PUBLIK
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                &bull; Akses Terbuka Konsumen Global &amp; Wisatawan
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.45rem' }}>
              Pemeriksaan Keaslian Indikasi Geografis Pala Asli Banda
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.35rem', lineHeight: 1.6 }}>
              Wisatawan, eksportir, dan konsumen rempah dapat menelusuri riwayat pohon kebun, sertifikasi mutu panen, dan bukti hash smart contract tanpa perlu akun login desa.
            </p>

            <form
              onSubmit={handleVerify}
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Masukkan nomor kode batch atau token QR kemasan..."
                  className="form-control"
                  style={{ paddingLeft: '2.65rem', fontSize: '0.925rem' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-success"
                style={{
                  fontWeight: 800,
                  padding: '0.7rem 1.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  letterSpacing: '0.02em',
                }}
              >
                <QrCode size={17} /> Cek Keaslian Sekarang
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#94a3b8' }}>
              <span>💡 Uji coba sertifikat resmi Banda:</span>
              <button
                type="button"
                onClick={() => {
                  setTokenInput('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')
                  if (onVerifySampleBatch) {
                    onVerifySampleBatch('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')
                  }
                }}
                className="badge badge-emerald"
                style={{
                  cursor: 'pointer',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                🌿 Pala Super Lonthoir (Uji Cek)
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
                style={{
                  cursor: 'pointer',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                🌺 Fuli Merah Belgica (Uji Cek)
              </button>
            </div>

            {onOpenMarketplace && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: 700 }}>Marketplace Produk Banda Terverifikasi On-Chain</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Pala, fuli merah, sirup buah pala, ikan asar cakalang, dan tuna sirip kuning dengan QR batch</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={onOpenMarketplace}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.825rem',
                      padding: '0.55rem 1.15rem',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#a7f3d0',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <ShoppingBag size={15} /> Buka Katalog Marketplace
                  </button>

                  {onOpenPlanner && (
                    <button
                      type="button"
                      onClick={onOpenPlanner}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.825rem',
                        padding: '0.55rem 1.15rem',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#7dd3fc',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Compass size={15} /> 🧭 Perencana Wisata &amp; Krisis (SAW)
                    </button>
                  )}

                  {onOpenKoperasi && (
                    <button
                      type="button"
                      onClick={onOpenKoperasi}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.825rem',
                        padding: '0.55rem 1.15rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#a7f3d0',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Scale size={15} /> ⚖️ Kasir Koperasi &amp; Bank Sampah
                    </button>
                  )}

                  {onOpenTelemetry && (
                    <button
                      type="button"
                      onClick={onOpenTelemetry}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.825rem',
                        padding: '0.55rem 1.15rem',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        color: '#67e8f9',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Radio size={15} /> 📡 Telemetri IoT &amp; Resiliensi
                    </button>
                  )}

                  {onOpenTourism && (
                    <button
                      type="button"
                      onClick={onOpenTourism}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.825rem',
                        padding: '0.55rem 1.15rem',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        color: '#fde68a',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Home size={15} /> 🏡 Eco-Stay &amp; Budaya
                    </button>
                  )}

                  {onOpenGIS && (
                    <button
                      type="button"
                      onClick={onOpenGIS}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.825rem',
                        padding: '0.55rem 1.15rem',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        color: '#67e8f9',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Layers size={15} /> 🗺️ Peta 7-Layer
                    </button>
                  )}

                  {onOpenSurvei && (
                    <button
                      type="button"
                      onClick={onOpenSurvei}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.825rem',
                        padding: '0.55rem 1.15rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#6ee7b7',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Database size={15} /> 📋 Survei &amp; ETL Hybrid
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
