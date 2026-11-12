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
  MapPin,
  CheckCircle2,
  Lock,
  Mail,
  Zap,
  Droplets,
  Award,
  ChevronRight,
  Waves,
  Mountain,
  Camera,
  Eye,
  Sun,
  Anchor,
  Palmtree,
  Sailboat,
  Star,
} from 'lucide-react'

interface LandingPortalWorkspaceProps {
  onNavigate: (tab: 'population' | 'letters' | 'farming' | 'traceability' | 'koperasi' | 'iot' | 'tourism' | 'gis' | 'audit' | 'smart_planner' | 'survei') => void
  onOpenLogin: () => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  currentUser: any
}

interface ScenicTheme {
  id: string
  title: string
  subtitle: string
  location: string
  imageUrl: string
  emoji: string
  badge: string
  waterTemp: string
  visibility: string
  weather: string
  highlight: string
}

const SCENIC_THEMES: ScenicTheme[] = [
  {
    id: 'laut_banda',
    title: 'Lautan Tropis & Terumbu Karang',
    subtitle: 'Air laut sebening kaca dan surga bawah laut segitiga karang dunia',
    location: 'Selat Neira — Laut Banda',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    emoji: '🌊',
    badge: 'Wisata Bahari Unggulan',
    waterTemp: '28.5°C',
    visibility: '30m (Kristal)',
    weather: 'Cerah Berawan 29°C',
    highlight: 'Dinding Karang Vertikal & Terumbu Karang Alami',
  },
  {
    id: 'gunung_api',
    title: 'Gunung Api Banda & Teluk Neira',
    subtitle: 'Ikon megah 656 mdpl menjulang di atas perairan laut tenang dan koloni karang',
    location: 'Teluk Neira — Pulau Gunung Api',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85',
    emoji: '🌋',
    badge: 'Trekking & Snorkeling Lava',
    waterTemp: '28.6°C',
    visibility: '26m (Lava Flow)',
    weather: 'Cerah Hangat 30°C',
    highlight: 'Snorkeling Karang Meja & Trekking Kawah Aktif',
  },
  {
    id: 'pulau_hatta',
    title: 'Pulau Hatta & Pasir Putih',
    subtitle: 'Hamparan pantai pasir putih murni dengan dinding palung bawah laut spektakuler',
    location: 'Kepulauan Banda Terluar — Pulau Hatta',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=2000&q=85',
    emoji: '🏝️',
    badge: 'Surga Wall Diving & Penyu',
    waterTemp: '28.2°C',
    visibility: '35m (Wall Dive)',
    weather: 'Cerah Tropis 28°C',
    highlight: 'Titik Selam Dunia & Eco-Stay Tepi Laut',
  },
  {
    id: 'benteng_belgica',
    title: 'Benteng Belgica & Kota Tua',
    subtitle: 'Cagar budaya megah VOC abad ke-17 di bukit hijau menghadap samudra lepas',
    location: 'Bukit Tabaleku — Neira Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=2000&q=85',
    emoji: '🏰',
    badge: 'UNESCO Heritage Tentative',
    waterTemp: '28.4°C',
    visibility: '28m (Pelabuhan)',
    weather: 'Semilir Angin Laut 29°C',
    highlight: 'Benteng Bintang Lima 1611 & Rumah Bung Hatta',
  },
]

interface TourismSpotlight {
  id: string
  name: string
  category: string
  badge: string
  island: string
  coords: string
  photo: string
  description: string
  actionTab: 'gis' | 'tourism' | 'smart_planner' | 'traceability' | 'koperasi' | 'iot'
  actionLabel: string
}

const TOURISM_SPOTLIGHTS: TourismSpotlight[] = [
  {
    id: 'gunung-api',
    name: 'Gunung Api Banda (656 mdpl)',
    category: 'Trekking Vulkanik & Snorkeling Lava Flow',
    badge: 'Spot Primadona Wisata',
    island: 'Pulau Gunung Api',
    coords: '-4.5250, 129.8800',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Pendakian 2-3 jam menuju puncak kawah aktif dengan pemandangan 360° seluruh gugusan pulau Banda. Snorkeling di terumbu karang meja yang tumbuh tercepat di dunia pasca letusan 1988.',
    actionTab: 'gis',
    actionLabel: 'Peta Spasial GIS 📍',
  },
  {
    id: 'pulau-hatta',
    name: 'Pulau Hatta & Dinding Palung Banda',
    category: 'World-Class Diving & Konservasi Bahari',
    badge: 'Visibilitas 35m+',
    island: 'Pulau Hatta (Rozengain)',
    coords: '-4.6000, 130.0100',
    photo: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    description: 'Perairan laut sebening kristal dengan dinding karang vertikal menuju kedalaman palung, pasir putih lembut, serta titik temu migrasi kawanan hiu martil dan lumba-lumba.',
    actionTab: 'tourism',
    actionLabel: 'Pesan Eco-Stay Hatta 🏡',
  },
  {
    id: 'benteng-belgica',
    name: 'Benteng Belgica & Kota Pusaka Neira',
    category: 'Cagar Budaya Nasional Abad ke-17',
    badge: 'Warisan Dunia',
    island: 'Pulau Banda Neira',
    coords: '-4.5244, 129.9042',
    photo: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    description: 'Benteng pertahanan berbentuk bintang lima yang dibangun VOC pada 1611, diabadikan pada pecahan uang kertas Rupiah dengan panorama memesona ke laut lepas dan Gunung Api.',
    actionTab: 'gis',
    actionLabel: 'Cagar Budaya GIS 📜',
  },
  {
    id: 'lonthoir-nutmeg',
    name: 'Perkebunan Pala & Tebing Lonthoir',
    category: 'Agrowisata Jalur Rempah Dunia',
    badge: 'Indikasi Geografis',
    island: 'Pulau Banda Besar',
    coords: '-4.5312, 129.8974',
    photo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Pohon kenari purba menaungi tanaman pala bernilai sejarah ratusan tahun, berlatar tebing samudra megah menghadap Pulau Rhun dan laut biru Banda Besar.',
    actionTab: 'smart_planner',
    actionLabel: 'Panduan Cerdas (SAW) 🧭',
  },
]

export const LandingPortalWorkspace: React.FC<LandingPortalWorkspaceProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenMarketplace,
  onPublicVerify,
  currentUser,
}) => {
  const [activeTheme, setActiveTheme] = useState<ScenicTheme>(SCENIC_THEMES[0])
  const [quickSearchInput, setQuickSearchInput] = useState('')

  const executeSearch = (rawInput: string) => {
    const trimmed = rawInput.trim()
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
    if (/peta|gis|layer|lokasi|dermaga|benteng|gunung|api|belgica/i.test(trimmed)) {
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

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(quickSearchInput)
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', color: '#f8fafc' }}>
      {/* HERO HEADER SECTION WITH AUTHENTIC BANDA SCENIC BACKGROUND */}
      <section
        className="app-card animate-fade-in"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 2.25rem 3.25rem',
          borderRadius: '28px',
          backgroundImage: `linear-gradient(180deg, rgba(8, 12, 20, 0.40) 0%, rgba(8, 12, 20, 0.65) 55%, rgba(8, 12, 20, 0.92) 100%), url(${activeTheme.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.15)',
          marginBottom: '3rem',
          transition: 'background-image 0.5s ease-in-out',
        }}
      >
        {/* Content Container inside Header */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '920px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Top Bar: Scene Indicator & Panorama Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1.75rem',
              background: 'rgba(8, 12, 20, 0.75)',
              backdropFilter: 'blur(12px)',
              padding: '0.45rem 0.95rem',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Current Active Location Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800 }}>
              <Waves size={16} color="#06b6d4" />
              <span>{activeTheme.location}</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={13} fill="#34d399" color="#34d399" /> {activeTheme.badge}
              </span>
            </div>

            {/* Interactive Scenic Panorama Selector */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.2rem', fontWeight: 600 }}>
                <Camera size={13} color="#06b6d4" /> Latar Header:
              </span>
              {SCENIC_THEMES.map((theme) => {
                const isSelected = activeTheme.id === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setActiveTheme(theme)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'rgba(255, 255, 255, 0.08)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                      color: isSelected ? '#080c14' : '#e2e8f0',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.45)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    title={theme.title}
                  >
                    <span>{theme.emoji}</span>
                    <span className="hidden sm:inline">{theme.title.split('&')[0].trim()}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Travel Brand Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1.25rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#34d399',
              fontSize: '0.825rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Palmtree size={16} color="#34d399" />
            Wonderful Banda Neira • Portal Wisata Bahari &amp; Rempah Dunia
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.4vw, 3.6rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              margin: '0 0 1.15rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 45%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
            }}
          >
            Selamat Datang di Surga Bahari Banda Neira
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: '#e2e8f0',
              margin: '0 auto 1.85rem',
              maxWidth: '780px',
              fontWeight: 500,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
            }}
          >
            Eksplorasi keajaiban bawah laut palung terdalam, mendaki Gunung Api 656 mdpl, menjelajahi benteng megah abad ke-17,
            serta menikmati harum pala asli Nusantara melalui ekosistem digital kepulauan yang cerdas dan terpadu.
          </p>

          {/* Live Weather & Marine Barometer */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.25rem',
              background: 'rgba(8, 12, 20, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: '999px',
              padding: '0.45rem 1.35rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.825rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
              <Sun size={16} /> Cuaca: <strong>{activeTheme.weather}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8' }}>
              <Waves size={16} /> Laut Banda: <strong>{activeTheme.waterTemp}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
              <Eye size={16} /> Visibilitas: <strong>{activeTheme.visibility}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f43f5e' }}>
              <Mountain size={16} /> Gunung Api: <strong>Level I (Aman)</strong>
            </div>
          </div>

          {/* Bright Floating Luxury Travel Search Bar */}
          <form
            onSubmit={handleQuickSearch}
            style={{
              display: 'flex',
              gap: '0.5rem',
              background: '#ffffff',
              border: 'none',
              borderRadius: '22px',
              padding: '0.5rem 0.5rem 0.5rem 1.4rem',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
              maxWidth: '740px',
              margin: '0 auto 1.25rem',
              alignItems: 'center',
            }}
          >
            <Search size={24} color="#0284c7" />
            <input
              type="text"
              placeholder="Cari spot diving, nama homestay, benteng, kode batch pala, atau NIK..."
              value={quickSearchInput}
              onChange={(e) => setQuickSearchInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#0f172a',
                fontSize: '0.975rem',
                fontWeight: 600,
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1.75rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
              }}
            >
              <span>Telusuri</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Travel Filter Chips */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '2.25rem',
              fontSize: '0.78rem',
              color: '#cbd5e1',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600 }}>Tren Populer:</span>
            {[
              { label: '🤿 Diving Pulau Hatta', term: 'diving hatta' },
              { label: '🌋 Snorkeling Lava Flow', term: 'gunung api' },
              { label: '🏰 Benteng Belgica 1611', term: 'benteng belgica' },
              { label: '🏡 Eco-Stay Tepi Laut', term: 'homestay' },
              { label: '📦 Rempah BATCH-PALA-001', term: 'BATCH-PALA-001' },
              { label: '💧 Kuota Air Bersih', term: 'air koperasi' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuickSearchInput(chip.term)
                  executeSearch(chip.term)
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '0.28rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('gis')}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#080c14',
                border: 'none',
                padding: '0.9rem 1.75rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.925rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 22px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Layers size={18} /> Jelajah Peta Spasial 7-Layer
            </button>

            <button
              onClick={() => onNavigate('tourism')}
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                border: '1.5px solid rgba(6, 182, 212, 0.45)',
                padding: '0.9rem 1.75rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.925rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Home size={18} color="#38bdf8" /> Direktori Homestay &amp; Wisata
            </button>

            <button
              onClick={onOpenMarketplace}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#080c14',
                border: 'none',
                padding: '0.9rem 1.75rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.925rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 22px rgba(16, 185, 129, 0.35)',
              }}
            >
              <ShoppingBag size={18} /> Marketplace Rempah &amp; Ikan
            </button>

            {!currentUser ? (
              <button
                onClick={onOpenLogin}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  padding: '0.9rem 1.75rem',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Lock size={18} color="#cbd5e1" /> Masuk Akun / Kiosk Desa
              </button>
            ) : (
              <button
                onClick={() => onNavigate('population')}
                style={{
                  background: 'rgba(139, 92, 246, 0.25)',
                  color: '#c084fc',
                  border: '1.5px solid rgba(139, 92, 246, 0.45)',
                  padding: '0.9rem 1.75rem',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backdropFilter: 'blur(8px)',
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
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              flexWrap: 'wrap',
              fontSize: '0.825rem',
              color: '#cbd5e1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#06b6d4" />
              <span>
                <strong style={{ color: '#f8fafc' }}>7 Layer</strong> Spasial PostGIS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>
                <strong style={{ color: '#f8fafc' }}>39 Titik</strong> 5 Pulau Terkoneksi
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#f59e0b" />
              <span>
                <strong style={{ color: '#f8fafc' }}>SHA-256</strong> Blockchain Ledger
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#a855f7" />
              <span>
                <strong style={{ color: '#f8fafc' }}>AES-256-GCM</strong> Blind Index NIK
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#06b6d4" />
              <span>
                <strong style={{ color: '#f8fafc' }}>78 Tests</strong> 100% Passed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SMART TOURISM SPOTLIGHT: PESONA BAHARI & WARISAN BANDA NEIRA */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              <Anchor size={16} /> Destinasi Unggulan Kepulauan
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.025em' }}>
              Pesona Wisata Bahari &amp; Cagar Budaya Banda
            </h2>
            <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.925rem', maxWidth: '680px' }}>
              Jelajahi perpaduan magis antara terumbu karang palung laut Banda, trekking vulkanik 656 mdpl, dan benteng pertahanan rempah dunia abad ke-17.
            </p>
          </div>

          <button
            onClick={() => onNavigate('gis')}
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1.5px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              padding: '0.7rem 1.4rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.15)',
            }}
          >
            <Layers size={16} /> Buka Peta Tematik Spasial
          </button>
        </div>

        {/* 4 Spotlight Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {TOURISM_SPOTLIGHTS.map((spot) => (
            <div
              key={spot.id}
              className="app-card hover-lift"
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              {/* Photo Header */}
              <div style={{ height: '190px', position: 'relative', overflow: 'hidden', background: '#080c14' }}>
                <img
                  src={spot.photo}
                  alt={spot.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8, 12, 20, 0.1) 0%, rgba(8, 12, 20, 0.75) 100%)' }} />
                
                {/* Badges on Photo */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.4rem' }}>
                  <span
                    style={{
                      background: 'rgba(8, 12, 20, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(6, 182, 212, 0.5)',
                      color: '#38bdf8',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    {spot.badge}
                  </span>
                </div>

                {/* Island Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  <MapPin size={14} color="#06b6d4" /> {spot.island}
                </div>
              </div>

              {/* Body Content */}
              <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {spot.category}
                  </span>
                  <h3 style={{ margin: '0.35rem 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                    {spot.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    {spot.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.35rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button
                    onClick={() => onNavigate(spot.actionTab)}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      color: '#38bdf8',
                      padding: '0.65rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>{spot.actionLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 PINTU GERBANG UTAMA (BENTO GRID SATU PINTU) */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <Layers size={16} /> Layanan Cerdas Terintegrasi
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.025em' }}>
            Empat Gerbang Layanan Pulau Banda
          </h2>
          <p style={{ margin: '0.4rem auto 0', color: '#94a3b8', fontSize: '0.925rem', maxWidth: '640px' }}>
            Pilih portal di bawah untuk mengakses fasilitas cerdas pariwisata, ekonomi warga, telemetri, dan tata kelola desa:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* GERBANG 1: SMART TOURISM & BUDAYA */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1.5px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Sailboat size={26} color="#06b6d4" />
              </div>

              <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 1 • Wisatawan &amp; Publik
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                Smart Tourism &amp; Cagar Budaya
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Eksplorasi Banda Neira dengan panduan cerdas, peta interaktif 7-layer, cagar budaya bersejarah, dan booking eco-stay ramah lingkungan.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('gis')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={16} color="#06b6d4" /> 🗺️ Peta Interaktif 7-Layer PostGIS
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('tourism')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={16} color="#f59e0b" /> 🏡 Direktori Eco-Stay &amp; WA Booking
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('smart_planner')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={16} color="#a855f7" /> 🧭 Perencana Wisata Cerdas (SAW)
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={onOpenMarketplace}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={16} color="#10b981" /> 🛍️ Marketplace Rempah &amp; Ikan
                  </span>
                  <ChevronRight size={15} color="#64748b" />
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
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Portal Pariwisata <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* GERBANG 2: LAYANAN WARGA & KOPERASI HATTA */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Scale size={26} color="#10b981" />
              </div>

              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 2 • Kiosk Desa &amp; Warga
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                Layanan Warga &amp; Koperasi Hatta
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Akses saldo komoditas, kuota air minum RO, tabungan bank sampah botol plastik, dan pencetakan surat mandiri.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('koperasi')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={16} color="#06b6d4" /> 💧 Tebus Kuota Air Bersih RO
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('koperasi')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scale size={16} color="#10b981" /> ♻️ Konversi Bank Sampah Plastik
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('letters')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} color="#38bdf8" /> 📬 Pelayanan Surat Desa Otomatis
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('population')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="#a78bfa" /> 👥 Direktori Warga &amp; Profesi
                  </span>
                  <ChevronRight size={15} color="#64748b" />
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
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Kasir &amp; Koperasi <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* GERBANG 3: IOT TELEMETRI & KETAHANAN ENERGI */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Radio size={26} color="#f59e0b" />
              </div>

              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 3 • Infrastruktur &amp; Energi
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                IoT Telemetri &amp; Resiliensi Pulau
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Monitoring kualitas air baku TDS, volume tandon komunal, energi surya mandiri, dan penghematan solar desa.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('iot')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Radio size={16} color="#f59e0b" /> 📡 Dasbor 4 Stasiun Telemetri ESP32
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('iot')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={16} color="#06b6d4" /> 💧 Sensor TDS Air Baku vs Hasil RO
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('iot')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={16} color="#fbbf24" /> ⚡ Energi Surya vs Diesel Generator
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('smart_planner')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={16} color="#c084fc" /> 🚨 DSS Prioritas Krisis Desa (SAW Mode 2)
                  </span>
                  <ChevronRight size={15} color="#64748b" />
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
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Komando Telemetri <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* GERBANG 4: RISET, SURVEI & BLOCKCHAIN AUDIT */}
          <div
            className="app-card"
            style={{
              padding: '1.75rem',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(8, 12, 20, 0.95) 100%)',
              border: '1.5px solid rgba(139, 92, 246, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={26} color="#a855f7" />
              </div>

              <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zona 4 • Riset, KKN &amp; Tata Kelola
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: '0.35rem 0 0.75rem' }}>
                Survei Lapangan &amp; Audit Rantai
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Pengumpulan data lapangan dinamis NoSQL, pipa migrasi ETL ke PostGIS, dan ketertelusuran rempah on-chain.
              </p>

              {/* Sub features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => onNavigate('survei')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={16} color="#34d399" /> 📋 Form Survei NoSQL &amp; Pipa ETL
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('traceability')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={16} color="#38bdf8" /> 📦 Panen &amp; Rantai Pasok Blockchain
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('farming')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#f59e0b" /> 🗺️ Poligon Kebun Pala &amp; Poktan
                  </span>
                  <ChevronRight size={15} color="#64748b" />
                </button>

                <button
                  onClick={() => onNavigate('audit')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="#c084fc" /> 🛡️ Audit Kriptografi OWASP Top 10
                  </span>
                  <ChevronRight size={15} color="#64748b" />
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
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Buka Audit &amp; Survei <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VERIFICATION STRIP & GEOGRAPHICAL INDICATION PASSPORT */}
      <section
        className="app-card"
        style={{
          padding: '2.25rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(6, 78, 59, 0.25) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.45rem' }}>
            <Award size={18} /> Indikasi Geografis Terverifikasi &amp; Digital Passport
          </div>
          <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc' }}>
            Beli Rempah Pala Asli Banda Neira Tanpa Ragu
          </h3>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Setiap kemasan produk Koperasi Hatta dilengkapi QR Digital Passport yang mencatat rantai pasok dari petani pemanen hingga sertifikat mutu keaslian aroma <em>Myristica fragrans</em>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onPublicVerify('demo-qr-token')}
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1.5px solid rgba(6, 182, 212, 0.4)',
              color: '#06b6d4',
              padding: '0.85rem 1.45rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <QrCode size={18} /> Coba Verifikasi Sampel
          </button>
          <button
            onClick={onOpenMarketplace}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#080c14',
              padding: '0.85rem 1.45rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <ShoppingBag size={18} /> Lihat Etalase Produk
          </button>
        </div>
      </section>
    </div>
  )
}
