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
      desc: 'Catat hasil panen pala/cengkeh & lihat peta lahan kebun',
    },
    {
      role: 'Warga Masyarakat Desa',
      icon: '👤',
      u: 'warga',
      p: 'Warga123!',
      badge: 'Layanan Mandiri',
      badgeClass: 'badge-blue',
      desc: 'Permohonan surat SKU, domisili, dan pengantar KTP mandiri',
    },
    {
      role: 'Petugas Kantor Desa',
      icon: '🏛️',
      u: 'petugas',
      p: 'Petugas123!',
      badge: 'Pemerintahan Desa',
      badgeClass: 'badge-amber',
      desc: 'Verifikasi warga, persetujuan lahan & penerbitan surat desa',
    },
    {
      role: 'Ketua Kelompok Tani',
      icon: '🌾',
      u: 'ketua_kelompok',
      p: 'Ketua123!',
      badge: 'Poktan Lonthoir',
      badgeClass: 'badge-purple',
      desc: 'Daftarkan petak lahan anggota & rekap hasil panen kelompok',
    },
    {
      role: 'Administrator Desa',
      icon: '👑',
      u: 'admin',
      p: 'Admin123!',
      badge: 'Akses Lengkap',
      badgeClass: 'badge-purple',
      desc: 'Audit trail ekosistem, blockchain anchoring, & rekap tahunan',
    },
  ]

  const handleSelectRole = (u: string, p: string, roleName: string) => {
    setUsername(u)
    setPassword(p)
    setSelectedRoleHint(`Akun ${roleName} dipilih. Klik tombol 'Masuk Sekarang' untuk mengonfirmasi autentikasi.`)
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
      {/* 1. HERO HEADER WITH SECURITY & BANDA DIGITAL IDENTITY */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, #0f2c59 0%, #1e3a8a 55%, #065f46 100%)',
          color: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 16px 36px -6px rgba(15, 44, 89, 0.35)',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Sparkles size={13} /> Sistem Resmi Desa Banda Neira
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.25)',
                color: '#a7f3d0',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Lock size={12} /> Terenkripsi Standar Bcrypt & JWT
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <MapPin size={12} /> Kepulauan Banda, Maluku Tengah
            </span>
          </div>

          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '0.75rem',
              letterSpacing: '-0.025em',
            }}
          >
            Ekosistem Digital Terpadu Banda Neira
          </h2>
          <p
            style={{
              fontSize: '0.975rem',
              color: '#e0f2fe',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Digitalisasi pelayanan administrasi kependudukan sipil, pendataan mata pencaharian warga (petani pala, nelayan tradisional, pengolah fuli), pemetaan geospasial perkebunan rempah, serta jaminan keaslian Indikasi Geografis Pala Banda berbasis blockchain.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            >
              <b style={{ display: 'block', color: '#ffffff', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                👥 Penduduk & Profesi Warga
              </b>
              <span style={{ color: '#cbd5e1', fontSize: '0.775rem' }}>
                Petani pala, nelayan, pengolah fuli & pedagang rempah
              </span>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            >
              <b style={{ display: 'block', color: '#ffffff', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                🌾 Catatan Panen Lapangan
              </b>
              <span style={{ color: '#cbd5e1', fontSize: '0.775rem' }}>
                Bekerja di kebun tanpa sinyal dengan PWA Offline cache
              </span>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            >
              <b style={{ display: 'block', color: '#ffffff', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                ⛓️ Integritas Blockchain EVM
              </b>
              <span style={{ color: '#cbd5e1', fontSize: '0.775rem' }}>
                Bukti keaslian produk rempah tercatat permanen di blockchain
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID: SECURE LOGIN FORM (LEFT) + ROLE ACCOUNT ASSISTANT (RIGHT) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2rem',
        }}
      >
        {/* SECURE LOGIN CARD */}
        <div
          className="app-card"
          style={{
            padding: '2rem',
            border: '2px solid #bfdbfe',
            boxShadow: '0 8px 24px -4px rgba(30, 58, 138, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bfdbfe',
                }}
              >
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                Masuk ke Akun Resmi
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Masukkan ID pengguna dan kata sandi Anda untuk mengakses layanan administrasi kependudukan & sistem perkebunan:
            </p>

            {selectedRoleHint && (
              <div
                className="animate-fade-in"
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.825rem',
                  color: '#1e40af',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={15} style={{ flexShrink: 0 }} />
                <span>{selectedRoleHint}</span>
              </div>
            )}

            <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label className="form-label">
                  Username / ID Pengguna
                </label>
                <div style={{ position: 'relative' }}>
                  <Users
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: petugas, petani, warga..."
                    required
                    className="form-control"
                    style={{ paddingLeft: '2.45rem', fontSize: '0.925rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Kata Sandi (Password)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun..."
                    required
                    className="form-control"
                    style={{ paddingLeft: '2.45rem', paddingRight: '2.75rem', fontSize: '0.925rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0.25rem',
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
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid #fecaca',
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(30, 58, 138, 0.35)',
                  marginTop: '0.25rem',
                }}
              >
                {loading ? 'Memverifikasi Otentikasi...' : 'Masuk Sekarang (Login Aman)'}{' '}
                <ArrowRight size={17} />
              </button>
            </form>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.78rem',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            🛡️ Dilindungi enkripsi password standar industri (Bcrypt Hash) dan token JWT dengan masa kedaluwarsa otomatis.
          </div>
        </div>

        {/* ROLE CREDENTIAL SELECTOR ASSISTANT */}
        <div
          className="app-card"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #fde68a',
                }}
              >
                <Compass size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Bantuan Akun Peran Sistem
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.15rem', lineHeight: 1.5 }}>
              Pilih salah satu peran di bawah untuk mengisi kredensial resmi secara otomatis ke formulir:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {demoAccounts.map((acc) => {
                const isSelected = username === acc.u
                return (
                  <button
                    key={acc.u}
                    type="button"
                    onClick={() => handleSelectRole(acc.u, acc.p, acc.role)}
                    className="app-card-interactive"
                    style={{
                      background: isSelected ? '#eff6ff' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                      borderWidth: isSelected ? '2px' : '1px',
                      borderStyle: 'solid',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{acc.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <b style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            {acc.role}
                          </b>
                          {isSelected && <CheckCircle2 size={14} color="#2563eb" />}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.1rem' }}>
                          {acc.desc}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${acc.badgeClass}`} style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      @{acc.u}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px dashed var(--border-color)',
              fontSize: '0.78rem',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
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
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              <CheckCircle2 size={12} /> Cek Keaslian Pala Banda (Publik / Wisatawan)
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534', margin: '0 0 0.35rem' }}>
              Pemeriksaan Keaslian Rempah Pala Asal Banda Neira
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.15rem', lineHeight: 1.5 }}>
              Wisatawan dan konsumen pembeli rempah dapat memeriksa sertifikat digital keaslian Indikasi Geografis pala tanpa perlu akun desa.
            </p>

            <form
              onSubmit={handleVerify}
              style={{
                display: 'flex',
                gap: '0.65rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Masukkan nomor kode batch atau token QR kemasan..."
                  className="form-control"
                  style={{ paddingLeft: '2.4rem', fontSize: '0.9rem' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-success"
                style={{
                  fontWeight: 700,
                  padding: '0.65rem 1.4rem',
                }}
              >
                <QrCode size={16} /> Cek Keaslian Sekarang
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#4b5563' }}>
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
                style={{ cursor: 'pointer', border: '1px solid #86efac', background: '#dcfce7', padding: '0.35rem 0.75rem' }}
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
                style={{ cursor: 'pointer', border: '1px solid #fde68a', background: '#fef3c7', padding: '0.35rem 0.75rem' }}
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
