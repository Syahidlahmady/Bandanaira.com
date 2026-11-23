import React, { useState, useEffect, useCallback } from 'react'
import { NutmegLogoIcon, ArrowUpRightIcon } from './LandingIcons'
import { ScrollExpand } from '../ui/ScrollExpand'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'

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
  onOpenRegister?: () => void
  currentUser: any
  onLogout?: () => void
  activeNav?: string
  setActiveNav?: (href: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister,
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
        className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-8 lg:px-12 pt-2.5 sm:pt-5 transition-all duration-500 ease-out ${
          navVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <header
          className="flex h-14 sm:h-20 items-center justify-between px-3.5 sm:px-6 py-0 w-full max-w-7xl mx-auto rounded-xl sm:rounded-2xl overflow-visible border border-solid border-white/20 transition-all duration-300 backdrop-blur-md bg-[#081d35f2] shadow-xl pointer-events-auto will-change-transform transform-gpu"
        >
          {/* Brand Logo */}
          <a
            href="#beranda"
            onClick={() => setActiveNav('#beranda')}
            aria-label="bandanaira.com, kembali ke Beranda"
            className="inline-flex items-center gap-2 sm:gap-2.5 relative flex-[0_0_auto]"
          >
            <NutmegLogoIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="relative w-fit font-normal text-white text-[17px] sm:text-[23px] tracking-tight leading-none">
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
          <div className="inline-flex items-center gap-1.5 sm:gap-3 relative flex-[0_0_auto]">
            {currentUser ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex h-9 sm:h-[42px] items-center px-3 sm:px-4 py-0 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                >
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-none truncate max-w-[110px] sm:max-w-none">
                    {currentUser.full_name || currentUser.username}
                  </span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-9 sm:h-[42px] items-center px-2.5 sm:px-3 py-0 bg-rose-500/20 hover:bg-rose-500/35 rounded-lg border border-solid border-rose-400/50 text-white text-xs font-semibold transition-colors cursor-pointer"
                    title="Keluar dari Akun"
                  >
                    {t.navbar.signOut}
                  </button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 sm:gap-2">
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="hidden sm:inline-flex h-9 sm:h-[42px] items-center px-4 py-0 bg-amber-600 hover:bg-amber-500 rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] cursor-pointer"
                  >
                    <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-none">
                      {t.navbar.register}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex h-9 sm:h-[42px] items-center px-3.5 sm:px-5 py-0 bg-[#d9770626] hover:bg-[#d9770640] rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] cursor-pointer active:scale-95"
                >
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-none">
                    {t.navbar.signIn}
                  </span>
                </button>
              </div>
            )}

            {/* Divider vertikal pemisah rapi */}
            <div className="hidden sm:block w-px h-6 bg-white/20" />

            {/* Dropdown Pemilihan Bahasa (Desktop only di navbar; di mobile sudah ada di dalam drawer) */}
            <div className="hidden sm:block">
              <LanguageSwitcher variant="dropdown" />
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-solid border-white/20 bg-slate-900/60 text-white cursor-pointer active:scale-95"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="relative z-50 w-full max-w-7xl mx-auto mt-2 rounded-2xl bg-[#081d35f2] border border-solid border-white/20 backdrop-blur-xl p-4 sm:p-5 lg:hidden pointer-events-auto shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav aria-label="Navigasi seluler" className="flex flex-col gap-2.5">
              {/* Mobile Language Switcher */}
              <LanguageSwitcher variant="mobile" />

              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActiveNav(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                    activeNav === item.href
                      ? 'text-[#f4b75e] bg-white/10 font-semibold'
                      : 'text-white/90 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              {!currentUser && (
                <>
                  <div className="h-px bg-white/15 my-1.5" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {onOpenRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onOpenRegister()
                        }}
                        className="h-10 px-3 rounded-lg bg-amber-600 border border-[#f4b75e] text-white text-xs font-semibold flex items-center justify-center active:scale-95"
                      >
                        {t.navbar.register}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onOpenLogin()
                      }}
                      className="h-10 px-3 rounded-lg bg-[#d9770626] border border-[#f4b75e] text-white text-xs font-semibold flex items-center justify-center active:scale-95"
                    >
                      {t.navbar.signIn}
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
