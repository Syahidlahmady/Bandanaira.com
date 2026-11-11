import React, { useState } from 'react'
import {
  Compass,
  Layers,
  Home,
  Database,
  Scale,
  Radio,
  ShieldCheck,
  Users,
  QrCode,
  ShoppingBag,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Lock,
  Mail,
  Zap,
  Droplets,
  Award,
  ChevronRight,
} from 'lucide-react'

interface LandingPortalWorkspaceProps {
  onNavigate: (tab: 'population' | 'letters' | 'farming' | 'traceability' | 'koperasi' | 'iot' | 'tourism' | 'gis' | 'audit' | 'smart_planner' | 'survei') => void
  onOpenLogin: () => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  currentUser: any
}

export const LandingPortalWorkspace: React.FC<LandingPortalWorkspaceProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenMarketplace,
  onPublicVerify,
  currentUser,
}) => {
  const [quickSearchInput, setQuickSearchInput] = useState('')

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickSearchInput.trim()
    if (!trimmed) return

    // If starts with BATCH- or 16-char token -> verify product
    if (trimmed.toUpperCase().startsWith('BATCH-') || trimmed.length > 20) {
      onPublicVerify(trimmed)
      return
    }

    // If 16 digit number -> open citizen portal / koperasi
    if (/^\d{16}$/.test(trimmed)) {
      onNavigate('koperasi')
      return
    }

    // Otherwise if mentions map / gis
    if (/peta|gis|layer|lokasi|dermaga|benteng/i.test(trimmed)) {
      onNavigate('gis')
      return
    }

    // If mentions penginapan / hotel / homestay
    if (/vila|homestay|hotel|inap|kamar|stay/i.test(trimmed)) {
      onNavigate('tourism')
      return
    }

    // If mentions sampah / air / koperasi
    if (/sampah|air|koperasi|saldo|kuota/i.test(trimmed)) {
      onNavigate('koperasi')
      return
    }

    // Fallback: search as product batch verification
    onPublicVerify(trimmed)
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', color: '#f8fafc' }}>
      {/* HERO SECTION */}
      <section
        className="app-card animate-fade-in"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '3rem 2rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(8, 12, 20, 0.98) 0%, rgba(13, 21, 39, 0.95) 50%, rgba(6, 78, 59, 0.25) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.1)',
          marginBottom: '2.5rem',
        }}
      >
        {/* Ambient decorative glowing spots */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '20%',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.825rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={15} color="#10b981" />
            Portal Terpadu Kepulauan • BST-NIRANA Ecosystem
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 1.25rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Satu Pintu Ekosistem Digital Banda Neira
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: '#94a3b8',
              margin: '0 auto 2rem',
              maxWidth: '740px',
            }}
          >
            Menghubungkan wisatawan, warga, petani rempah pala, dan pemerintah desa dalam satu platform digital terpadu.
            Didukung <strong style={{ color: '#38bdf8' }}>Peta 7-Layer PostGIS</strong>,{' '}
            <strong style={{ color: '#34d399' }}>Ketertelusuran Blockchain SHA-256</strong>,{' '}
            <strong style={{ color: '#fbbf24' }}>Koperasi Hatta &amp; Air Bersih RO</strong>, serta{' '}
            <strong style={{ color: '#c084fc' }}>Telemetri IoT Tenaga Surya</strong>.
          </p>

          {/* Universal Quick Search Bar */}
          <form
            onSubmit={handleQuickSearch}
            style={{
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '0.4rem 0.4rem 0.4rem 1.1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
              maxWidth: '680px',
              margin: '0 auto 2rem',
              alignItems: 'center',
            }}
          >
            <Search size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Cari cagar budaya, nama penginapan, kode batch rempah, atau 16 digit NIK..."
              value={quickSearchInput}
              onChange={(e) => setQuickSearchInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '0.925rem',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#080c14',
                border: 'none',
                padding: '0.7rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Telusuri</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('gis')}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#080c14',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Layers size={18} /> Jelajah Peta 7-Layer
            </button>

            <button
              onClick={onOpenMarketplace}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#080c14',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              }}
            >
              <ShoppingBag size={18} /> Marketplace Rempah &amp; Ikan
            </button>

            {!currentUser ? (
              <button
                onClick={onOpenLogin}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Lock size={18} /> Masuk Akun / Kiosk Desa
              </button>
            ) : (
              <button
                onClick={() => onNavigate('population')}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Users size={18} /> Masuk Dasbor ({currentUser.full_name})
              </button>
            )}
          </div>

          {/* System Trust & Architecture Barometer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span>
                <strong style={{ color: '#f8fafc' }}>7 Layer</strong> Spasial PostGIS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="#06b6d4" />
              <span>
                <strong style={{ color: '#f8fafc' }}>39 Titik</strong> 5 Pulau Terkoneksi
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="#f59e0b" />
              <span>
                <strong style={{ color: '#f8fafc' }}>SHA-256</strong> Blockchain Ledger
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="#a855f7" />
              <span>
                <strong style={{ color: '#f8fafc' }}>AES-256-GCM</strong> Blind Index NIK
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span>
                <strong style={{ color: '#f8fafc' }}>78 Tests</strong> 100% Passed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PINTU GERBANG UTAMA (BENTO GRID SATU PINTU) */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Empat Gerbang Layanan Pulau Terintegrasi
          </h2>
          <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Pilih zona layanan di bawah untuk membuka fitur sesuai peran dan kebutuhan Anda:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* GERBANG 1: SMART TOURISM & BUDAYA */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '20px',
              background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Compass size={24} color="#06b6d4" />
              </div>

              <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 1 • Wisatawan &amp; Publik
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                Smart Tourism &amp; Warisan Budaya
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Eksplorasi Banda Neira dengan panduan cerdas, peta interaktif, cagar budaya bersejarah, dan booking ramah lingkungan.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('gis')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={15} color="#06b6d4" /> 🗺️ Peta Interaktif 7-Layer PostGIS
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('tourism')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={15} color="#f59e0b" /> 🏡 Direktori Eco-Stay &amp; WA Booking
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('smart_planner')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={15} color="#a855f7" /> 🧭 Perencana Wisata Cerdas (SAW)
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={onOpenMarketplace}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={15} color="#10b981" /> 🛍️ Marketplace Rempah &amp; Ikan
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => onNavigate('gis')}
                style={{
                  width: '100%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#06b6d4',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Portal Pariwisata <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* GERBANG 2: LAYANAN WARGA & KOPERASI HATTA */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '20px',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Scale size={24} color="#10b981" />
              </div>

              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 2 • Kiosk Desa &amp; Warga
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                Layanan Warga &amp; Koperasi Hatta
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Akses saldo komoditas, kuota air minum RO, tabungan bank sampah botol plastik, dan pencetakan surat mandiri.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('koperasi')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={15} color="#06b6d4" /> 💧 Tebus Kuota Air Bersih RO
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('koperasi')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scale size={15} color="#10b981" /> ♻️ Konversi Bank Sampah Plastik
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('letters')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={15} color="#38bdf8" /> 📬 Pelayanan Surat Desa Otomatis
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('population')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={15} color="#a78bfa" /> 👥 Direktori Warga &amp; Profesi
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => onNavigate('koperasi')}
                style={{
                  width: '100%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Kasir &amp; Koperasi <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* GERBANG 3: IOT TELEMETRI & KETAHANAN ENERGI */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '20px',
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Radio size={24} color="#f59e0b" />
              </div>

              <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 3 • Infrastruktur &amp; Ketahanan
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                IoT Telemetri &amp; Resiliensi Pulau
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Monitoring kualitas air baku TDS, volume tandon komunal, energi surya mandiri, dan penghematan solar desa.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('iot')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Radio size={15} color="#f59e0b" /> 📡 Dasbor 4 Stasiun Telemetri ESP32
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('iot')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={15} color="#06b6d4" /> 💧 Sensor TDS Air Baku vs Hasil RO
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('iot')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={15} color="#fbbf24" /> ⚡ Energi Surya vs Diesel Generator
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('smart_planner')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={15} color="#c084fc" /> 🚨 DSS Prioritas Krisis Desa (SAW Mode 2)
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => onNavigate('iot')}
                style={{
                  width: '100%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Komando Telemetri <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* GERBANG 4: RISET, SURVEI & BLOCKCHAIN AUDIT */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '20px',
              background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={24} color="#a855f7" />
              </div>

              <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 4 • Riset, KKN &amp; Tata Kelola
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                Survei Lapangan &amp; Audit Rantai
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Pengumpulan data lapangan dinamis NoSQL, pipa migrasi ETL ke PostGIS, dan ketertelusuran rempah on-chain.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('survei')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={15} color="#34d399" /> 📋 Form Survei NoSQL &amp; Pipa ETL
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('traceability')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={15} color="#38bdf8" /> 📦 Panen &amp; Rantai Pasok Blockchain
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('farming')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="#f59e0b" /> 🗺️ Poligon Kebun Pala &amp; Poktan
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('audit')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={15} color="#c084fc" /> 🛡️ Audit Kriptografi OWASP Top 10
                  </span>
                  <ChevronRight size={14} color="#64748b" />
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => onNavigate('audit')}
                style={{
                  width: '100%',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c084fc',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Audit &amp; Survei <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VERIFICATION STRIP */}
      <section
        className="app-card"
        style={{
          padding: '2rem',
          borderRadius: '18px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Award size={16} /> Indikasi Geografis Terverifikasi
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            Beli Rempah Pala Asli Banda Neira Tanpa Ragu
          </h3>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Setiap kemasan produk Koperasi Hatta dilengkapi QR Digital Passport yang mencatat rantai pasok dari petani pemanen hingga sertifikat mutu keaslian aroma <em>Myristica fragrans</em>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => onPublicVerify('demo-qr-token')}
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#06b6d4',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <QrCode size={16} /> Coba Verifikasi Sampel
          </button>
          <button
            onClick={onOpenMarketplace}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#080c14',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ShoppingBag size={16} /> Lihat Etalase Produk
          </button>
        </div>
      </section>
    </div>
  )
}
