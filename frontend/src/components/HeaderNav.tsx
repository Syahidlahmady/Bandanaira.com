import React, { useState } from 'react'
import {
  RefreshCw,
  LogOut,
  Shield,
  Layers,
  Smartphone,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  MoreVertical,
  MapPin,
  ShoppingBag,
  Zap,
  UserCheck,
} from 'lucide-react'
import { User } from '../services/auth'
import { usePWA } from '../offline/usePWA'
import bandaHeroBackdrop from '../assets/image.webp'

export type EcosystemTabId =
  | 'landing'
  | 'register'
  | 'dashboard'
  | 'population'
  | 'letters'
  | 'farming'
  | 'traceability'
  | 'koperasi'
  | 'iot'
  | 'tourism'
  | 'gis'
  | 'audit'
  | 'smart_planner'
  | 'survei'

interface HeaderNavProps {
  currentUser: User | null
  isOnline: boolean
  pendingSyncCount: number
  isSyncing: boolean
  activeTab?: EcosystemTabId
  onSelectTab?: (tab: EcosystemTabId) => void
  onLogout: () => void
  onManualSync: () => void
  onOpenQueueModal: () => void
  onOpenMarketplace?: () => void
  onOpenLanding?: () => void
  onOpenQuickSwitch?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  isOnline,
  pendingSyncCount,
  isSyncing,
  activeTab,
  onSelectTab,
  onLogout,
  onManualSync,
  onOpenQueueModal,
  onOpenMarketplace,
  onOpenLanding,
  onOpenQuickSwitch,
}) => {
  const { canInstall, isInstalled, hasUpdate, installApp, updateApp } = usePWA()
  const [installing, setInstalling] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      const installed = await installApp()
      if (!installed) {
        setShowGuideModal(true)
      }
    } finally {
      setInstalling(false)
    }
  }

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Administrator Desa'
      case 'village_officer':
        return 'Petugas Kantor Desa'
      case 'farmer_group_admin':
        return 'Ketua Kelompok Tani'
      case 'farmer':
        return 'Petani Rempah Pala'
      case 'resident':
        return 'Warga Desa'
      case 'coop_manager':
        return 'Pengelola Koperasi Hatta'
      case 'homestay_operator':
        return 'Pengelola Eco-Stay & Wisata'
      case 'smart_tourism_admin':
        return 'Pengelola Smart Tourism & Budaya'
      case 'field_surveyor':
        return 'Surveyor Lapangan & IoT'
      default:
        return roleName
    }
  }

  const roleNames = currentUser ? currentUser.roles.map((r) => r.name) : []
  const isAdmin = Boolean(currentUser?.is_superuser || roleNames.includes('admin'))

  const getRoleNavigationItems = (): Array<{
    label: string
    isActive: boolean
    onClick: () => void
  }> => {
    const items: Array<{ label: string; isActive: boolean; onClick: () => void }> = [
      {
        label: '🌐 Beranda Publik',
        isActive: activeTab === 'landing',
        onClick: () => (onOpenLanding ? onOpenLanding() : onSelectTab?.('landing')),
      },
      {
        label: '📊 Dasbor Ekosistem',
        isActive: activeTab === 'dashboard',
        onClick: () => onSelectTab?.('dashboard'),
      },
    ]

    if (isAdmin) {
      items.push(
        { label: '👥 Warga & Profesi', isActive: activeTab === 'population', onClick: () => onSelectTab?.('population') },
        { label: '📬 Pelayanan Surat', isActive: activeTab === 'letters', onClick: () => onSelectTab?.('letters') },
        { label: '🗺️ Lahan & Poktan', isActive: activeTab === 'farming', onClick: () => onSelectTab?.('farming') },
        { label: '📦 Panen & Mutu', isActive: activeTab === 'traceability', onClick: () => onSelectTab?.('traceability') },
        { label: '⚖️ Koperasi', isActive: activeTab === 'koperasi', onClick: () => onSelectTab?.('koperasi') },
        { label: '🏡 Penginapan & Wisata', isActive: activeTab === 'tourism', onClick: () => onSelectTab?.('tourism') },
        { label: '📡 IoT', isActive: activeTab === 'iot', onClick: () => onSelectTab?.('iot') },
        { label: '📋 Survei', isActive: activeTab === 'survei', onClick: () => onSelectTab?.('survei') },
        { label: '🏛️ Audit', isActive: activeTab === 'audit', onClick: () => onSelectTab?.('audit') }
      )
    } else if (roleNames.includes('village_officer')) {
      items.push(
        { label: '👥 Data Warga & Profesi', isActive: activeTab === 'population', onClick: () => onSelectTab?.('population') },
        { label: '📬 Pelayanan Surat Warga', isActive: activeTab === 'letters', onClick: () => onSelectTab?.('letters') },
        { label: '🗺️ Verifikasi Lahan Kebun', isActive: activeTab === 'farming', onClick: () => onSelectTab?.('farming') },
        { label: '🏛️ Rekap & Audit Desa', isActive: activeTab === 'audit', onClick: () => onSelectTab?.('audit') }
      )
    } else if (roleNames.includes('coop_manager')) {
      items.push(
        { label: '⚖️ Kasir Koperasi & Bank Sampah', isActive: activeTab === 'koperasi', onClick: () => onSelectTab?.('koperasi') },
        { label: '📦 Rantai Pasok Komoditas', isActive: activeTab === 'traceability', onClick: () => onSelectTab?.('traceability') },
        { label: '📡 Telemetri Tandon Air RO', isActive: activeTab === 'iot', onClick: () => onSelectTab?.('iot') }
      )
    } else if (roleNames.includes('homestay_operator')) {
      items.push(
        { label: '🏡 Kelola Penginapan & Reservasi Tamu', isActive: activeTab === 'tourism', onClick: () => onSelectTab?.('tourism') }
      )
    } else if (roleNames.includes('smart_tourism_admin')) {
      items.push(
        { label: '🏖️ Destinasi, Penginapan & 177 Cagar Budaya', isActive: activeTab === 'tourism', onClick: () => onSelectTab?.('tourism') },
        { label: '🧭 Rekomendasi Wisata (SAW)', isActive: activeTab === 'smart_planner', onClick: () => onSelectTab?.('smart_planner') },
        { label: '🗺️ Peta Wisata 7-Layer', isActive: activeTab === 'gis', onClick: () => onSelectTab?.('gis') }
      )
    } else if (roleNames.includes('field_surveyor')) {
      items.push(
        { label: '📋 Survei Lapangan & Pipa ETL', isActive: activeTab === 'survei', onClick: () => onSelectTab?.('survei') },
        { label: '📡 Telemetri 4 Stasiun IoT', isActive: activeTab === 'iot', onClick: () => onSelectTab?.('iot') },
        { label: '🗺️ Validasi Spasial PostGIS', isActive: activeTab === 'gis', onClick: () => onSelectTab?.('gis') }
      )
    } else if (roleNames.includes('farmer_group_admin')) {
      items.push(
        { label: '🗺️ Peta & Pengajuan Lahan Poktan', isActive: activeTab === 'farming', onClick: () => onSelectTab?.('farming') },
        { label: '📦 Rekap Panen & Mutu Poktan', isActive: activeTab === 'traceability', onClick: () => onSelectTab?.('traceability') }
      )
    } else if (roleNames.includes('farmer')) {
      items.push(
        { label: '📦 Catatan Panen & QR Saya', isActive: activeTab === 'traceability', onClick: () => onSelectTab?.('traceability') },
        { label: '🗺️ Peta Lahan Kebun Saya', isActive: activeTab === 'farming', onClick: () => onSelectTab?.('farming') }
      )
    } else if (roleNames.includes('resident')) {
      items.push(
        { label: '🪪 Layanan Surat & Kuota Warga', isActive: activeTab === 'letters', onClick: () => onSelectTab?.('letters') }
      )
    }

    return items
  }

  const navigationItems = getRoleNavigationItems()

  return (
    <header className="mb-7 select-none">
      {/* Service Worker Update Notification Banner */}
      {hasUpdate && (
        <div className="animate-fade-in mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#f4b75e]/50 bg-gradient-to-r from-[#d97706]/25 to-[#081d35]/90 px-5 py-3.5 shadow-[0_8px_28px_rgba(217,119,6,0.25)] backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f4b75e]/50 bg-[#d97706]/25 text-[#f4b75e]">
              <Sparkles size={19} />
            </div>
            <div>
              <div className="font-serif text-base font-bold text-[#f4b75e]">
                Pembaruan Sistem Tersedia!
              </div>
              <div className="text-xs text-white/80">
                Versi mutakhir aplikasi telah siap. Klik perbarui untuk mengaktifkannya secara instan tanpa kehilangan data offline.
              </div>
            </div>
          </div>
          <button
            onClick={updateApp}
            className="btn btn-sm btn-warning font-bold"
          >
            <RefreshCw size={14} /> Perbarui Sekarang
          </button>
        </div>
      )}

      {/* Main Panoramic Glassmorphic Header Shell (desainsaatini/BandaHeroSection.tsx + 21st.dev Elevate Navbar) */}
      <div className="relative overflow-hidden rounded-3xl border border-[#f4b75e]/25 bg-[#081d35] shadow-[0_20px_50px_rgba(4,12,24,0.75)]">
        {/* Authentic Banda Neira Asset Backdrop */}
        <img
          src={bandaHeroBackdrop}
          alt="Kepulauan Banda Neira"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-35"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(8,29,53,0.92) 0%, rgba(15,44,89,0.78) 50%, rgba(8,29,53,0.95) 100%)',
          }}
        />

        {/* Top Floating Glassmorphic Navbar Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#081d35]/70 px-5 py-3.5 backdrop-blur-md md:px-7">
          {/* Brand Logo & Identity (Matches BandaHeroSection.tsx) */}
          <div
            onClick={onOpenLanding}
            className="flex cursor-pointer items-center gap-3.5 group"
            title="Klik untuk kembali ke Beranda Utama bandanaira.com"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f4b75e]/45 bg-[#d97706]/20 shadow-[0_0_20px_rgba(244,183,94,0.25)] transition-transform duration-300 group-hover:scale-105">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f4b75e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-xl font-bold tracking-[0.4px] text-white transition-colors group-hover:text-[#f4b75e] md:text-2xl">
                  bandanaira.com
                </span>
                <span className="hidden rounded-full border border-[#f4b75e]/40 bg-[#d97706]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#f4b75e] sm:inline-block">
                  Kepulauan Banda
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <span className="inline-flex items-center gap-1 text-[#f4b75e]">
                  <MapPin size={11} /> 4°31′S 129°54′E
                </span>
                <span>&bull;</span>
                <span className="font-mono text-white/65">
                  PostGIS 7-Layer &amp; EVM Traceability
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (desainsaatini/BandaHeroSection.tsx style) */}
          <nav
            aria-label="Navigasi Utama Ekosistem"
            className="hidden items-center gap-6 lg:flex"
          >
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`relative bg-transparent px-1 py-1.5 text-sm transition-colors ${
                  item.isActive
                    ? 'font-semibold text-[#f4b75e]'
                    : 'font-normal text-white/80 hover:text-white'
                }`}
              >
                {item.label}
                {item.isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e]" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Controls: Marketplace + Login/Role Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenMarketplace && (
              <button
                type="button"
                onClick={onOpenMarketplace}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:border-[#f4b75e]/60 hover:bg-white/15 hover:text-[#f4b75e]"
                title="Buka Katalog Marketplace Produk Rempah & Ikan Terverifikasi Blockchain"
              >
                <ShoppingBag size={14} className="text-[#f4b75e]" />
                <span>Marketplace UMKM</span>
              </button>
            )}

            {!currentUser && onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('register')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/70 bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(217,119,6,0.35)] transition-all hover:bg-amber-500"
                title="Buka halaman Pendaftaran Akun Baru (Warga, Mitra Usaha, Wisatawan)"
              >
                <span>Daftar Akun</span>
              </button>
            )}

            {onOpenQuickSwitch && (
              <button
                type="button"
                onClick={onOpenQuickSwitch}
                className="inline-flex items-center gap-2 rounded-xl border border-[#f4b75e] bg-[#d9770626] px-4 py-2 text-xs font-semibold text-[#f4b75e] shadow-[0_0_20px_rgba(217,119,6,0.2)] transition-all hover:bg-[#d9770640]"
                title="Ganti peran aktor secara instan atau masuk ke akun desa"
              >
                <Zap size={13} fill="#f4b75e" />
                <span>
                  {currentUser ? `Peran: @${currentUser.username}` : 'Masuk / Login'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Telemetry, PWA Sync & Active User Session Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-[#061527]/75 px-5 py-2.5 text-xs md:px-7">
          {/* Left: Signal Status, Offline Queue & PWA */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Signal Indicator Pill */}
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-bold ${
                isOnline
                  ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-rose-400/40 bg-rose-500/15 text-rose-300'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isOnline
                    ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    : 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                }`}
              />
              <span>{isOnline ? 'ONLINE & SYNCED' : 'OFFLINE KEBUN'}</span>
              {pendingSyncCount > 0 && (
                <span className="rounded-full border border-[#f4b75e]/40 bg-[#d97706]/25 px-1.5 py-0.2 text-[10px] text-[#f4b75e]">
                  📦 {pendingSyncCount}
                </span>
              )}
            </div>

            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={onManualSync}
                disabled={!isOnline || isSyncing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#f4b75e]/50 bg-[#d97706]/25 px-2.5 py-1 text-[11px] font-bold text-[#f4b75e] hover:bg-[#d97706]/40"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Mengirim...' : 'Kirim Antrean'}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenQueueModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:border-[#f4b75e]/40 hover:text-[#f4b75e]"
              title="Buka daftar data offline di perangkat"
            >
              <Layers size={12} /> Antrean Offline ({pendingSyncCount})
            </button>

            {canInstall ? (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#f4b75e]/50 bg-[#d97706]/20 px-2.5 py-1 text-[11px] font-bold text-[#f4b75e] hover:bg-[#d97706]/35"
              >
                <Smartphone size={12} />
                {installing ? 'Memasang...' : '📲 Pasang Aplikasi'}
              </button>
            ) : isInstalled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 size={12} /> Terpasang di HP
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 hover:border-white/25 hover:text-white"
              >
                <Smartphone size={12} /> Panduan PWA
              </button>
            )}
          </div>

          {/* Right: Active User Identity or Guest Explorer Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 rounded-full border border-[#f4b75e]/35 bg-[#0f2c59]/80 px-3 py-1">
                  <UserCheck size={13} className="text-[#f4b75e]" />
                  <span className="font-semibold text-white">
                    {currentUser.full_name || currentUser.username}
                  </span>
                  <span className="font-mono text-[11px] text-[#f4b75e]">
                    (@{currentUser.username})
                  </span>
                  {currentUser.roles.map((r) => (
                    <span
                      key={r.id}
                      className="hidden rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 sm:inline-flex sm:items-center sm:gap-1"
                    >
                      <Shield size={10} /> {getRoleLabel(r.name)}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-500/15 px-2.5 py-1 text-[11px] font-bold text-rose-200 transition-colors hover:bg-rose-500/30"
                >
                  <LogOut size={12} /> Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-white/75">
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  🌏 Mode Eksplorasi Publik
                </span>
                {onOpenLanding && (
                  <button
                    type="button"
                    onClick={onOpenLanding}
                    className="rounded-lg border border-[#f4b75e]/40 bg-[#d97706]/15 px-2.5 py-1 font-semibold text-[#f4b75e] hover:bg-[#d97706]/30"
                  >
                    ← Kembali ke Beranda
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Panduan Pasang Aplikasi PWA di HP */}
      {showGuideModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="modal-content animate-fade-in"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f4b75e]/40 bg-[#d97706]/20 text-[#f4b75e] shadow-[0_0_20px_rgba(244,183,94,0.2)]">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Pasang Aplikasi di Layar HP
                  </h3>
                  <p className="mt-0.5 text-xs text-white/70">
                    Akses instan seperti aplikasi native &amp; bekerja di kebun tanpa sinyal internet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-sm btn-secondary rounded-full p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              {/* Android Guide */}
              <div className="rounded-2xl border border-white/10 bg-[#061527]/70 p-4">
                <div className="mb-2 flex items-center gap-2 font-bold text-[#f4b75e]">
                  <MoreVertical size={16} /> 1. Pengguna Android (Chrome / Edge / Samsung Internet)
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed text-white/80">
                  <li>Tekan ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas layar peramban.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Pasang Aplikasi"</strong>.</li>
                  <li>Tekan <strong>Install / Tambah</strong>. Ikon Desa Digital akan muncul di beranda HP Anda.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div className="rounded-2xl border border-white/10 bg-[#061527]/70 p-4">
                <div className="mb-2 flex items-center gap-2 font-bold text-emerald-300">
                  <Share2 size={16} /> 2. Pengguna iPhone / iPad (Safari)
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed text-white/80">
                  <li>Buka website ini menggunakan browser bawaan <strong>Safari</strong>.</li>
                  <li>Tekan tombol <strong>Bagikan (Share)</strong> yang berlogo kotak panah ke atas (⎋) di bilah bawah.</li>
                  <li>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
                </ol>
              </div>

              {/* Benefits Box */}
              <div className="rounded-2xl border border-[#f4b75e]/30 bg-[#d97706]/15 p-4 text-xs text-white/90">
                <strong className="text-[#f4b75e]">🌟 Keunggulan Aplikasi Desa Digital Banda Neira:</strong>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 leading-relaxed">
                  <li>Buka aplikasi dalam satu sentuhan langsung dari layar HP tanpa mengetik URL.</li>
                  <li>Peta GIS Kepulauan Banda tetap tampil secara offline tanpa jaringan internet.</li>
                  <li>Pencatatan data penduduk &amp; hasil panen otomatis tersimpan aman di memori lokal HP.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-primary px-6 py-2.5"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
