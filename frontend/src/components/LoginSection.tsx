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
  onVerifySampleBatch,
  onPublicVerify,
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
      badge: 'Pertanian & Panen',
      badgeClass: 'badge-green',
      desc: 'Catat hasil panen pala/cengkeh & lihat peta lahan',
    },
    {
      role: 'Warga Masyarakat Desa',
      icon: '👤',
      u: 'warga',
      p: 'Warga123!',
      badge: 'Layanan Mandiri',
      badgeClass: 'badge-blue',
      desc: 'Pengajuan surat SKU, domisili, dan pengantar KTP',
    },
    {
      role: 'Petugas Kantor Desa',
      icon: '🏛️',
      u: 'petugas',
      p: 'Petugas123!',
      badge: 'Pemerintahan Desa',
      badgeClass: 'badge-amber',
      desc: 'Kelola data kependudukan, kelompok tani & penerbitan batch',
    },
    {
      role: 'Ketua Kelompok Tani',
      icon: '🌾',
      u: 'ketua_kelompok',
      p: 'Ketua123!',
      badge: 'Poktan Lonthoir',
      badgeClass: 'badge-purple',
      desc: 'Rekapitulasi kelompok tani & alokasi hasil panen',
    },
    {
      role: 'Administrator Desa',
      icon: '👑',
      u: 'admin',
      p: 'Admin123!',
      badge: 'Akses Lengkap',
      badgeClass: 'badge-purple',
      desc: 'Pengaturan sistem, audit blockchain, dan manajemen hak akses',
    },
  ]

  const handleSelectRole = (u: string, p: string, roleName: string) => {
    setUsername(u)
    setPassword(p)
    setSelectedRoleHint(`Akun ${roleName} dipilih. Klik tombol 'Masuk Sekarang' di bawah untuk verifikasi otentikasi.`)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    if (onPublicVerify) {
      onPublicVerify(tokenInput.trim())
    }
  }

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* 1. HERO HEADER WITH SECURITY BADGE */}
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
                background: 'rgba(16, 185, 129, 0.3)',
                color: '#ecfdf5',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid rgba(16, 185, 129, 0.5)',
              }}
            >
              <Lock size={12} /> Akses Terenkripsi & Terlindungi (Bcrypt & JWT)
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
            Portal Terpadu Desa Banda Neira
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#e0f2fe', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Layanan resmi administrasi kependudukan sipil, pendataan mata pencaharian warga (petani pala, nelayan, dll), pemetaan kebun rempah, dan jaminan keaslian Indikasi Geografis Pala Banda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem' }}>
              <b style={{ display: 'block', color: '#ffffff' }}>👥 Pendataan Penduduk & Profesi</b>
              <span style={{ color: '#cbd5e1' }}>Petani pala, nelayan, pengolah rempah</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem' }}>
              <b style={{ display: 'block', color: '#ffffff' }}>🌾 Catatan Panen Lapangan</b>
              <span style={{ color: '#cbd5e1' }}>Tetap bekerja di kebun tanpa sinyal</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem' }}>
              <b style={{ display: 'block', color: '#ffffff' }}>🔒 Keamanan Berbasis Peran</b>
              <span style={{ color: '#cbd5e1' }}>Data terlindungi dengan verifikasi login</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID: SECURE LOGIN FORM (LEFT) + ROLE ACCOUNT ASSISTANT (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* SECURE LOGIN CARD */}
        <div
          className="app-card"
          style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '16px',
            border: '2px solid #bfdbfe',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#dbeafe',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={16} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                Masuk ke Akun Resmi
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Masukkan username dan kata sandi Anda untuk mengakses data kependudukan dan sistem perkebunan desa:
            </p>

            {selectedRoleHint && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.65rem 0.85rem',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#1e40af',
                }}
              >
                💡 {selectedRoleHint}
              </div>
            )}

            <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Username / ID Pengguna
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: petugas, petani, warga..."
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Kata Sandi (Password)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem', fontSize: '0.95rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '11px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid #fecaca',
                  }}
                >
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#1e40af',
                }}
              >
                {loading ? 'Memverifikasi Otentikasi...' : 'Masuk Sekarang (Login Aman)'} <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
            🛡️ Dilindungi enkripsi password standar industri (Bcrypt Hash) dan token JWT dengan masa kedaluwarsa otomatis.
          </div>
        </div>

        {/* ROLE CREDENTIAL SELECTOR ASSISTANT */}
        <div
          className="app-card"
          style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🔑</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Bantuan Akun Peran Sistem
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Klik salah satu peran di bawah untuk mengisi kredensial resmi secara otomatis ke formulir:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {demoAccounts.map((acc) => {
                const isSelected = username === acc.u
                return (
                  <button
                    key={acc.u}
                    type="button"
                    onClick={() => handleSelectRole(acc.u, acc.p, acc.role)}
                    style={{
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      borderColor: isSelected ? '#3b82f6' : '#e2e8f0',
                      borderWidth: isSelected ? '2px' : '1px',
                      borderStyle: 'solid',
                      textAlign: 'left',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.35rem' }}>{acc.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <b style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {acc.role}
                          </b>
                          {isSelected && <CheckCircle2 size={13} color="#2563eb" />}
                        </div>
                        <span style={{ fontSize: '0.73rem', color: '#64748b', display: 'block' }}>
                          {acc.desc}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${acc.badgeClass}`} style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      User: {acc.u}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.78rem', color: '#64748b' }}>
            💡 Setiap peran memiliki hak akses berbeda (RBAC) untuk melindungi kerahasiaan NIK dan data pribadi warga desa.
          </div>
        </div>
      </div>

      {/* 3. PUBLIC SPICE AUTHENTICITY CHECK (NO LOGIN NEEDED FOR TOURISTS/CONSUMERS) */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '2px solid #86efac',
          padding: '1.75rem',
          borderRadius: '16px',
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
              Pemeriksaan Keaslian Rempah Pala Asal Banda Neira
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
              Wisatawan dan konsumen pembeli rempah dapat memeriksa sertifikat digital keaslian Indikasi Geografis pala tanpa perlu akun desa.
            </p>

            <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Masukkan nomor kode rempah atau token QR kemasan..."
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
                <QrCode size={16} /> Cek Keaslian Sekarang
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#4b5563' }}>
              <span>💡 Contoh sertifikat rempah resmi Banda:</span>
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
    </div>
  )
}
