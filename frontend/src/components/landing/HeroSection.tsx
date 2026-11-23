import React, { useState, useEffect, useCallback } from 'react'
import { NutmegLogoIcon, ArrowUpRightIcon } from './LandingIcons'
import { ScrollExpand } from '../ui/ScrollExpand'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { LogIn, LogOut, LayoutDashboard, User } from 'lucide-react'

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
      {/* 1. FIXED TOP NAVBAR (Hides during resting/expansion, smoothly emerges once fully expanded) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 px-2 sm:px-8 lg:px-12 pt-2 sm:pt-5 transition-all duration-500 ease-out ${
          navVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <header
          className="flex h-14 sm:h-20 items-center justify-between px-2.5 sm:px-6 py-0 w-full max-w-7xl mx-auto rounded-xl sm:rounded-2xl overflow-visible border border-solid border-white/20 transition-all duration-300 backdrop-blur-md bg-[#081d35f2] shadow-2xl pointer-events-auto will-change-transform transform-gpu"
        >
          {/* Brand Logo */}
          <a
            href="#beranda"
            onClick={() => setActiveNav('#beranda')}
            aria-label="bandanaira.com, kembali ke Beranda"
            className="inline-flex items-center gap-1.5 sm:gap-2.5 relative shrink min-w-0"
          >
            <NutmegLogoIcon />
            <span className="font-semibold text-white text-[15px] sm:text-[20px] md:text-[23px] tracking-tight truncate leading-none">
              bandanaira.com
            </span>
          </a>

          {/* Desktop Navigation Links */}
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
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex h-[34px] sm:h-[40px] items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-0 bg-gradient-to-r from-amber-500 to-[#F4B75E] hover:from-amber-400 hover:to-[#f6c276] rounded-lg sm:rounded-xl border border-amber-300/40 text-[#081D35] text-xs sm:text-sm font-bold shadow-xs hover:shadow-[0_0_15px_rgba(244,183,94,0.35)] transition-all active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
              >
                <LogIn size={13} className="shrink-0 text-[#081D35] sm:w-[14px] sm:h-[14px]" />
                <span className="tracking-wide">
                  {t.navbar.signIn}
                </span>
              </button>
            )}

            {/* Switcher Bahasa Ikon Murni (Hemat ruang & responsif di semua frame termasuk mobile) */}
            <LanguageSwitcher variant="icon" />

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex lg:hidden h-[34px] w-[34px] sm:h-[40px] sm:w-[40px] items-center justify-center rounded-lg sm:rounded-xl border border-solid border-white/20 bg-slate-900/60 text-white cursor-pointer hover:bg-slate-900/80 transition-colors shrink-0"
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="relative z-50 w-full max-w-7xl mx-auto mt-2 rounded-xl sm:rounded-2xl bg-[#081d35f8] border border-solid border-white/20 backdrop-blur-xl p-4 sm:p-5 lg:hidden pointer-events-auto shadow-2xl">
            <nav aria-label="Navigasi seluler" className="flex flex-col gap-3">
              {/* Mobile Language Switcher */}
              <LanguageSwitcher variant="mobile" />

              {/* 1. JIKA USER TELAH LOGIN: TAMPILKAN USER PROFILE & AKSI LOGOUT DI DALAM MENU SESUAI PERMINTAAN */}
              {currentUser && (
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
              )}

              {/* Navigation Items */}
              <div className="flex flex-col gap-1 py-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setActiveNav(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`text-sm font-medium py-2 px-2.5 rounded-lg transition-colors ${
                      activeNav === item.href
                        ? 'text-[#f4b75e] bg-white/10 font-bold'
                        : 'text-white/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* JIKA BELUM LOGIN: TAMPILKAN TOMBOL MASUK */}
              {!currentUser && (
                <>
                  <div className="h-px bg-white/15 my-1" />
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onOpenLogin()
                      }}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#F4B75E] text-[#081D35] font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <LogIn size={16} />
                      <span>{t.navbar.signIn}</span>
                    </button>
                  </div>
                </>
              )}
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
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
              <a
                href="#wisata"
                onClick={() => setActiveNav('#wisata')}
                className="flex-1 sm:flex-initial inline-flex h-11 sm:h-[52px] items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 bg-amber-600 hover:bg-amber-500 transition-colors rounded-xl border border-amber-400 font-semibold text-white text-xs sm:text-sm tracking-wide shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
              >
                <span>{t.hero.ctaExplore}</span>
                <ArrowUpRightIcon className="w-4 h-4 text-white" />
              </a>

              <button
                type="button"
                onClick={() => onNavigate('gis')}
                className="flex-1 sm:flex-initial inline-flex h-11 sm:h-[52px] items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/25 backdrop-blur-md font-semibold text-white text-xs sm:text-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
              >
                <span>{t.hero.ctaMap}</span>
                <ArrowUpRightIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </main>
        </div>
      </ScrollExpand>
    </section>
  )
}

export default HeroSection
