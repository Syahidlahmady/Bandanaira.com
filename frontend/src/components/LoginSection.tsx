import React from 'react'
import { ShieldCheck, MapPin, Users, Lock, User as UserIcon, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'

interface LoginSectionProps {
  username: string
  setUsername: (u: string) => void
  password: string
  setPassword: (p: string) => void
  onLogin: (e: React.FormEvent) => void
  loading: boolean
  error: string | null
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  onLogin,
  loading,
  error,
}) => {
  const demoAccounts = [
    {
      role: 'Administrator Desa',
      icon: '👑',
      u: 'admin',
      p: 'Admin123!',
      badge: 'Full Access',
      badgeClass: 'badge-purple',
      desc: 'Konfigurasi sistem, jangkar blockchain EVM, manajemen peran',
    },
    {
      role: 'Petugas Kantor Desa',
      icon: '🏛️',
      u: 'petugas',
      p: 'Petugas123!',
      badge: 'Verifikator',
      badgeClass: 'badge-blue',
      desc: 'Verifikasi penduduk sipil, pemetaan kebun, batch produk',
    },
    {
      role: 'Ketua Kelompok Tani',
      icon: '🌾',
      u: 'ketua_kelompok',
      p: 'Ketua123!',
      badge: 'Poktan Admin',
      badgeClass: 'badge-amber',
      desc: 'Manajemen kelompok tani Lonthoir & alokasi hasil panen',
    },
    {
      role: 'Petani Rempah Pala',
      icon: '👨‍🌾',
      u: 'petani',
      p: 'Petani123!',
      badge: 'Field Producer',
      badgeClass: 'badge-green',
      desc: 'Pencatatan panen lapangan & pemetaan lahan kebun sendiri',
    },
    {
      role: 'Warga Masyarakat Desa',
      icon: '👤',
      u: 'warga',
      p: 'Warga123!',
      badge: 'Resident Self-Service',
      badgeClass: 'badge-blue',
      desc: 'Portal mandiri cek identitas & permohonan surat keterangan',
    },
  ]

  return (
    <div
      className="app-card"
      style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Left column: Value Proposition & Hero info */}
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={12} /> Ekosistem Digital Terpadu 2026
          </span>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.25, marginBottom: '0.75rem' }}>
            Digitalisasi Pelayanan & Rantai Pasok Rempah Banda Neira
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Integrasi administrasi kependudukan sipil, pemetaan geospasial perkebunan pala dan fuli berbasis PostGIS, serta transparansi rantai pasok dengan bukti kriptografis Smart Contract EVM.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#dbeafe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={14} />
              </div>
              <span>Administrasi Kependudukan Sipil & Verifikasi Identitas Warga</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#dcfce7', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={14} />
              </div>
              <span>Pemetaan Lahan Geospasial Petani & Kelompok Tani (PostGIS)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fef3c7', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={14} />
              </div>
              <span>Ketertelusuran Rantai Pasok Berbasis EVM Blockchain & PWA Offline</span>
            </div>
          </div>
        </div>

        {/* Right column: Login form & Demo chip selector */}
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Masuk ke Sistem Administrasi
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Gunakan akun resmi desa atau pilih salah satu peran demo di bawah:
          </p>

          <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                Username / Email
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email..."
                  required
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                Kata Sandi (Password)
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
              {loading ? 'Memproses Otentikasi...' : 'Masuk ke Portal'} <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
              💡 Pilihan Akun Demo (1-Click Pilih & Uji Peran):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {demoAccounts.map((demo) => (
                <button
                  key={demo.u}
                  type="button"
                  onClick={() => {
                    setUsername(demo.u)
                    setPassword(demo.p)
                  }}
                  style={{
                    background: username === demo.u ? '#eff6ff' : '#f8fafc',
                    borderColor: username === demo.u ? '#93c5fd' : '#e2e8f0',
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    color: '#1e293b',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{demo.icon}</span>
                    <div>
                      <b style={{ fontSize: '0.82rem', display: 'block', color: 'var(--text-main)' }}>
                        {demo.role}
                      </b>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        User: {demo.u}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${demo.badgeClass}`} style={{ fontSize: '0.65rem' }}>
                    {demo.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
