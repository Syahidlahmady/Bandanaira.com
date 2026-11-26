import React, { useState, useEffect, useCallback } from 'react'
import { NutmegLogoIcon, ArrowUpRightIcon } from './LandingIcons'
import { ScrollExpand } from '../ui/ScrollExpand'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  LifeBuoy,
  HelpCircle,
  PhoneCall,
  Home,
  Map,
  Compass,
  Palmtree,
  Store,
  BookOpen,
} from 'lucide-react'

const HERO_IMAGE_URL = '/banda.webp'

export const defaultNavigationItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Peta', href: '#peta' },
  { label: 'Destinasi', href: '#wisata' },
  { label: 'Penginapan', href: '#eco-stay' },
  { label: 'Marketplace', href: '#layanan-umkm' },
  { label: 'Sejarah & Warga', href: '#sejarah' },
]

export interface HeroSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin: () => void
  currentUser: any
  onLogout?: () => void
  activeNav?: string
  setActiveNav?: (href: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onOpenLogin,
  currentUser,
  onLogout,
  activeNav: externalActiveNav,
  setActiveNav: externalSetActiveNav,
}) => {
  const { t } = useLanguage()
  const [internalActiveNav, setInternalActiveNav] = useState<string>('#beranda')
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [navVisible, setNavVisible] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return (
      window.innerWidth < 1024 ||
      window.matchMedia('(pointer: coarse)').matches ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
  })

  const navigationItems = [
    { label: t.navbar.navHome, href: '#beranda' },
    { label: t.navbar.navMap, href: '#peta' },
    { label: t.navbar.navDestinations, href: '#wisata' },
    { label: t.navbar.navAccommodations, href: '#eco-stay' },
    { label: t.navbar.navMarketplace, href: '#layanan-umkm' },
    { label: t.navbar.navHistory, href: '#sejarah' },
  ]

  const activeNav = externalActiveNav || internalActiveNav
  const setActiveNav = externalSetActiveNav || setInternalActiveNav

  useEffect(() => {
    const handleResize = () => {
      const mobile =
        window.innerWidth < 1024 ||
        window.matchMedia('(pointer: coarse)').matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleProgressChange = useCallback((p: number) => {
    const isVisible = p >= 0.85
    setNavVisible((prev) => (prev !== isVisible ? isVisible : prev))
  }, [])

  return (
    <section
      id="beranda"
      aria-labelledby="banda-hero-title"
      className="relative w-full bg-black text-white selection:bg-[#f4b75e] selection:text-black"
    >
      {/* 1. FIXED TOP NAVBAR (Visible on mobile as Logo + 3-Lines Icon; expands gracefully on desktop) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-8 lg:px-12 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] sm:pt-5 transition-all duration-500 ease-out ${
          isMobile || navVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <header
          className="flex h-13 sm:h-20 items-center justify-between px-3 sm:px-6 py-0 w-full max-w-7xl mx-auto rounded-xl sm:rounded-2xl overflow-visible border border-solid border-white/20 transition-all duration-300 backdrop-blur-md bg-[#081d35f2] shadow-2xl pointer-events-auto will-change-transform transform-gpu"
        >
          {/* Brand Logo - On mobile only Logo and Hamburger icon are shown */}
          <a
            href="#beranda"
            onClick={() => setActiveNav('#beranda')}
            aria-label="bandanaira.com, kembali ke Beranda"
            className="inline-flex items-center gap-2 sm:gap-2.5 relative shrink min-w-0"
          >
            <NutmegLogoIcon />
            <span className="font-semibold text-white text-[16px] sm:text-[20px] md:text-[23px] tracking-tight truncate leading-none">
              bandanaira.com
            </span>
          </a>

          {/* Desktop Navigation Links (hidden on mobile) */}
          <nav
            aria-label="Navigasi utama"
            className="hidden lg:inline-flex items-center gap-[25px] relative flex-[0_0_auto]"
          >
            {navigationItems.map((item) => {
              const isActive = activeNav === item.href
              return (
                <div
                  key={item.label}
                  className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]"
                >
                  <a
                    href={item.href}
                    onClick={() => setActiveNav(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative w-fit mt-[-1.00px] font-medium text-white/90 hover:text-[#f4b75e] transition-colors text-xs tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                  >
                    {item.label}
                  </a>
                  {isActive && (
                    <div
                      aria-hidden="true"
                      className="relative w-[22px] h-0.5 bg-[#f4b75e]"
                    />
                  )}
                </div>
              )
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2.5 relative shrink-0">
            {/* Desktop User Profile / Dashboard (hidden on mobile, in 3-lines menu) */}
            {currentUser ? (
              <div className="hidden lg:inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex h-[38px] sm:h-[40px] items-center gap-2 px-3.5 sm:px-4 py-0 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#f4b75e] shrink-0" />
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal] truncate max-w-[160px]">
                    {currentUser.full_name || currentUser.username}
                  </span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-[38px] sm:h-[40px] items-center gap-1.5 px-3 py-0 bg-rose-500/20 hover:bg-rose-500/35 rounded-xl border border-solid border-rose-400/50 text-white text-xs font-semibold transition-colors cursor-pointer"
                    title="Keluar dari Akun"
                  >
                    <LogOut size={13} className="shrink-0" />
                    <span>{t.navbar.signOut}</span>
                  </button>
                )}
              </div>
            ) : (
              /* Desktop Sign In (hidden on mobile, in 3-lines menu) */
              <button
                type="button"
                onClick={onOpenLogin}
                className="hidden lg:inline-flex h-[34px] sm:h-[40px] items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-0 bg-gradient-to-r from-amber-500 to-[#F4B75E] hover:from-amber-400 hover:to-[#f6c276] rounded-lg sm:rounded-xl border border-amber-300/40 text-[#081D35] text-xs sm:text-sm font-bold shadow-xs hover:shadow-[0_0_15px_rgba(244,183,94,0.35)] transition-all active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
              >
                <LogIn size={13} className="shrink-0 text-[#081D35] sm:w-[14px] sm:h-[14px]" />
                <span className="tracking-wide">
                  {t.navbar.signIn}
                </span>
              </button>
            )}

            {/* Desktop Switcher Bahasa (hidden on mobile, in 3-lines menu) */}
            <div className="hidden lg:block">
              <LanguageSwitcher variant="icon" />
            </div>

            {/* Mobile Menu Hamburger (Icon 3 Garis - SATU-SATUNYA yang tampil di kanan pada mode mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-solid border-white/20 bg-slate-900/70 text-white cursor-pointer hover:bg-slate-900 transition-all active:scale-95 shrink-0"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-[#f4b75e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown / Drawer */}
        {mobileMenuOpen && (
          <div className="relative z-50 w-full max-w-7xl mx-auto mt-2 rounded-2xl bg-[#081d35]/98 border border-white/20 backdrop-blur-2xl p-4 sm:p-5 lg:hidden pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain pb-6">
            <nav aria-label="Navigasi seluler" className="flex flex-col gap-3.5">
              
              {/* 1. PUSAT BANTUAN & PANDUAN (Permintaan Pengguna: di dalam garis 3 isikan dengan bantuan) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#0c2444] to-blue-950/40 border border-[#f4b75e]/30 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f4b75e]/20 border border-[#f4b75e]/40 flex items-center justify-center text-[#f4b75e] shrink-0">
                    <LifeBuoy size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white tracking-tight">Pusat Bantuan & Panduan</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[#f4b75e] border border-amber-400/30">
                        24 Jam
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                      Panduan tiket Pelni, reservasi eco-stay, FAQ, & nomor posko darurat Banda.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onNavigate('help')
                    }}
                    className="h-9 flex items-center justify-center gap-1.5 rounded-lg bg-[#f4b75e] hover:bg-amber-400 text-[#081d35] text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <HelpCircle size={15} />
                    <span>Buka Bantuan</span>
                  </button>
                  <a
                    href="tel:112"
                    className="h-9 flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold active:scale-95 transition-all"
                  >
                    <PhoneCall size={14} />
                    <span>Posko SAR / Darurat</span>
                  </a>
                </div>
              </div>

              {/* 2. JIKA USER TELAH LOGIN: TAMPILKAN USER PROFILE & AKSI LOGOUT */}
              {currentUser ? (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/35 border border-[#F4B75E]/60 text-[#F4B75E] font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Masuk Sebagai
                      </div>
                      <div className="text-sm font-bold text-white truncate">
                        {currentUser.full_name || currentUser.username}
                      </div>
                      {currentUser.role && (
                        <div className="text-[10px] font-semibold text-[#F4B75E] uppercase tracking-wide">
                          {currentUser.role}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onNavigate('dashboard')
                      }}
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#F4B75E] text-[#081D35] font-bold text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <LayoutDashboard size={15} />
                      <span>Buka Dashboard Komando</span>
                    </button>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onLogout()
                        }}
                        className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-rose-200 hover:text-white font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>{t.navbar.signOut}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* JIKA BELUM LOGIN: TOMBOL MASUK KE PORTAL */
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onOpenLogin()
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#F4B75E] text-[#081D35] font-bold text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LogIn size={16} />
                  <span>{t.navbar.signIn} / Masuk ke Akun</span>
                </button>
              )}

              {/* 3. MENU NAVIGASI EKOSISTEM BANDA NEIRA (Grid 2 Kolom Ergonomis) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Navigasi Ekosistem
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="#beranda"
                    onClick={() => {
                      setActiveNav('#beranda')
                      setMobileMenuOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      activeNav === '#beranda'
                        ? 'bg-amber-500/20 border-[#f4b75e] text-[#f4b75e] font-bold'
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Home size={16} className="shrink-0 text-[#f4b75e]" />
                    <span className="text-xs truncate">Beranda</span>
                  </a>

                  <a
                    href="#peta"
                    onClick={() => {
                      setActiveNav('#peta')
                      setMobileMenuOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      activeNav === '#peta'
                        ? 'bg-amber-500/20 border-[#f4b75e] text-[#f4b75e] font-bold'
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Map size={16} className="shrink-0 text-cyan-400" />
                    <span className="text-xs truncate">Peta Spasial GIS</span>
                  </a>

                  <a
                    href="#wisata"
                    onClick={() => {
                      setActiveNav('#wisata')
                      setMobileMenuOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      activeNav === '#wisata'
                        ? 'bg-amber-500/20 border-[#f4b75e] text-[#f4b75e] font-bold'
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Compass size={16} className="shrink-0 text-amber-400" />
                    <span className="text-xs truncate">Destinasi</span>
                  </a>

                  <a
                    href="#eco-stay"
                    onClick={() => {
                      setActiveNav('#eco-stay')
                      setMobileMenuOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      activeNav === '#eco-stay'
                        ? 'bg-amber-500/20 border-[#f4b75e] text-[#f4b75e] font-bold'
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Palmtree size={16} className="shrink-0 text-emerald-400" />
                    <span className="text-xs truncate">Eco-Stay</span>
                  </a>

                  <a
                    href="#layanan-umkm"
                    onClick={() => {
                      setActiveNav('#layanan-umkm')
                      setMobileMenuOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      activeNav === '#layanan-umkm'
                        ? 'bg-amber-500/20 border-[#f4b75e] text-[#f4b75e] font-bold'
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Store size={16} className="shrink-0 text-orange-400" />
                    <span className="text-xs truncate">Pasar Rempah</span>
                  </a>

                  <a
                    href="#sejarah"
                    onClick={() => {
                      setActiveNav('#sejarah')
                      setMobileMenuOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      activeNav === '#sejarah'
                        ? 'bg-amber-500/20 border-[#f4b75e] text-[#f4b75e] font-bold'
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <BookOpen size={16} className="shrink-0 text-sky-400" />
                    <span className="text-xs truncate">Sejarah & Warga</span>
                  </a>
                </div>
              </div>

              {/* 4. PENGATURAN BAHASA */}
              <div className="pt-1 border-t border-white/10">
                <LanguageSwitcher variant="mobile" />
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* 2. SCROLL EXPAND COMPONENT INTEGRATION (Pure WebP Image for Ultra 60-120fps Performance) */}
      <ScrollExpand
        mediaType="image"
        poster={HERO_IMAGE_URL}
        src={HERO_IMAGE_URL}
        alt="Pemandangan Banda Neira dari udara dengan laut dan pulau-pulau di sekitarnya"
        useWindowScroll
        startWidth={isMobile ? 74 : 44}
        startHeight={isMobile ? 54 : 58}
        startRadius={isMobile ? 16 : 24}
        endRadius={0}
        mediaZoom={isMobile ? 1.05 : 1.15}
        scrollDistance={isMobile ? 0.35 : 0.75}
        holdDistance={isMobile ? 0.05 : 0.15}
        smoothing={0}
        overlayScrim={0.4}
        onProgressChange={handleProgressChange}
        title={
          <div className="w-full flex items-center justify-center text-center pointer-events-none select-none">
            <h2 className="font-sans font-black tracking-[-0.035em] text-white text-[clamp(1.75rem,5.6vw,7.5rem)] leading-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.95)] whitespace-nowrap">
              {t.hero.centerTitle}
            </h2>
          </div>
        }
      >
        {/* OVERLAY CONTENT (Fades in once frame expands to full bleed) */}
        <div className="w-full max-w-7xl mx-auto flex flex-col justify-center h-full pt-16 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 pointer-events-auto">
          {/* MAIN EDITORIAL HERO NARRATIVE (Asymmetric Left-Aligned Layout) */}
          <main className="flex flex-col items-start gap-3.5 sm:gap-6 max-w-[850px] my-auto">
            {/* Display Headline */}
            <h1
              id="banda-hero-title"
              className="text-white text-2xl sm:text-5xl lg:text-7xl font-sans font-bold tracking-tight leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            >
              <span>{t.hero.headlineLine1}</span>
              <br />
              <span className="font-script font-normal text-amber-200 text-3xl sm:text-6xl lg:text-8xl leading-[1.08] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)]">
                {t.hero.headlineLine2}
              </span>
            </h1>

            {/* Narrative Paragraph with Frosted Glass Plate for Crisp Readability */}
            <div className="max-w-[580px] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl">
              <p className="text-white/95 text-xs sm:text-base lg:text-[17px] leading-relaxed font-sans font-normal antialiased">
                {t.hero.description}
              </p>
            </div>

            {/* Dual Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto max-w-xs sm:max-w-none">
              <a
                href="#wisata"
                onClick={() => setActiveNav('#wisata')}
                className="w-full sm:w-auto inline-flex h-12 sm:h-[52px] items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-6 bg-amber-600 hover:bg-amber-500 transition-colors rounded-xl border border-amber-400 font-semibold text-white text-xs sm:text-sm tracking-wide shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>{t.hero.ctaExplore}</span>
                <ArrowUpRightIcon className="w-4 h-4 text-white shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => onNavigate('gis')}
                className="w-full sm:w-auto inline-flex h-12 sm:h-[52px] items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-6 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/25 backdrop-blur-md font-semibold text-white text-xs sm:text-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>{t.hero.ctaMap}</span>
                <ArrowUpRightIcon className="w-4 h-4 text-white shrink-0" />
              </button>
            </div>
          </main>
        </div>
      </ScrollExpand>
    </section>
  )
}

export default HeroSection
