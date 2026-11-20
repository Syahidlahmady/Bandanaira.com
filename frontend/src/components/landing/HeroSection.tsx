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
      className="relative w-full bg-[#081d35] text-white selection:bg-[#f4b75e] selection:text-black overflow-hidden"
    >
      {isMobile ? (
        /* MOBILE STATIC HERO (Ultra-lightweight, 0% CPU, instant touch momentum) */
        <div className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#081d35]">
          {/* Responsive LCP Image Backdrop */}
          <img
            src="/banda-mobile.webp"
            srcSet="/banda-480.webp 480w, /banda-960.webp 960w, /banda-1440.webp 1440w, /banda.webp 1920w"
            sizes="100vw"
            alt="Pemandangan Banda Neira dari udara dengan laut dan pulau-pulau di sekitarnya"
            width={1920}
            height={1106}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover -z-10"
            draggable={false}
          />

          {/* Scrim gradient for crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081d35] via-black/40 to-black/60 pointer-events-none -z-10" />

          {/* Static Mobile Top Navbar */}
          <div className="w-full px-4 pt-3.5 z-50">
            <header className="flex h-16 items-center justify-between px-4 w-full rounded-2xl border border-solid border-white/20 backdrop-blur-md shadow-2xl bg-[#081d35cc]">
              {/* Brand Logo */}
              <a
                href="#beranda"
                onClick={() => setActiveNav('#beranda')}
                aria-label="bandanaira.com, kembali ke Beranda"
                className="inline-flex items-center gap-2"
              >
                <NutmegLogoIcon />
                <span className="font-normal text-white text-[19px] tracking-tight">
                  bandanaira.com
                </span>
              </a>

              {/* Action Buttons */}
              <div className="inline-flex items-center gap-2">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="inline-flex h-[36px] items-center px-3 bg-amber-500/20 rounded-lg border border-[#f4b75e] text-white text-xs font-semibold"
                  >
                    {currentUser.full_name || currentUser.username}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="inline-flex h-[36px] items-center px-3.5 bg-[#d9770626] hover:bg-[#d9770640] rounded-lg border border-[#f4b75e] text-white text-xs font-semibold cursor-pointer"
                  >
                    {t.navbar.signIn}
                  </button>
                )}

                <LanguageSwitcher variant="dropdown" />

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-white/20 bg-slate-900/60 text-white cursor-pointer"
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
              <div className="relative z-50 w-full mt-2 rounded-2xl bg-[#081d35f2] border border-solid border-white/20 backdrop-blur-xl p-5 shadow-2xl">
                <nav aria-label="Navigasi seluler" className="flex flex-col gap-3">
                  <LanguageSwitcher variant="mobile" />
                  {navigationItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        setActiveNav(item.href)
                        setMobileMenuOpen(false)
                      }}
                      className={`text-sm font-medium py-1.5 transition-colors ${
                        activeNav === item.href ? 'text-[#f4b75e]' : 'text-white/90'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                  {!currentUser && (
                    <div className="flex gap-2 pt-2 border-t border-white/15">
                      {onOpenRegister && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            onOpenRegister()
                          }}
                          className="flex-1 h-9 rounded-lg bg-amber-600 border border-[#f4b75e] text-white text-xs font-semibold"
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
                        className="flex-1 h-9 rounded-lg bg-[#d9770626] border border-[#f4b75e] text-white text-xs font-semibold"
                      >
                        {t.navbar.signIn}
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            )}
          </div>

          {/* Mobile Main Hero Narrative */}
          <div className="w-full px-4 pt-6 pb-12 flex-1 flex flex-col justify-center max-w-lg mx-auto z-10">
            <main className="flex flex-col items-start gap-4">
              <h1
                id="banda-hero-title"
                className="text-white text-3xl sm:text-4xl font-sans font-bold tracking-tight leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
              >
                <span>{t.hero.headlineLine1}</span>
                <br />
                <span className="font-script font-normal text-amber-200 text-4xl sm:text-5xl leading-[1.05] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)]">
                  {t.hero.headlineLine2}
                </span>
              </h1>

              <div className="w-full p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 shadow-2xl">
                <p className="text-white/95 text-sm leading-relaxed font-sans font-normal antialiased">
                  {t.hero.description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 w-full">
                <a
                  href="#wisata"
                  onClick={() => setActiveNav('#wisata')}
                  className="flex-1 inline-flex h-[46px] items-center justify-center gap-2 px-4 bg-amber-600 hover:bg-amber-500 rounded-xl border border-amber-400 font-semibold text-white text-xs tracking-wide shadow-lg"
                >
                  <span>{t.hero.ctaExplore}</span>
                  <ArrowUpRightIcon className="w-4 h-4 text-white" />
                </a>

                <button
                  type="button"
                  onClick={() => onNavigate('gis')}
                  className="flex-1 inline-flex h-[46px] items-center justify-center gap-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/25 backdrop-blur-md font-semibold text-white text-xs tracking-wide"
                >
                  <span>{t.hero.ctaMap}</span>
                  <ArrowUpRightIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </main>
          </div>
        </div>
      ) : (
        /* DESKTOP HERO (Cinematic ScrollExpand with YouTube Video Backdrop) */
        <>
          <div
            className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 pt-3 sm:pt-5 transition-all duration-500 ease-out ${
              navVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-8 pointer-events-none'
            }`}
          >
            <header className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 py-0 w-full max-w-7xl mx-auto rounded-2xl overflow-visible border border-solid border-white/20 transition-all duration-300 backdrop-blur-md shadow-2xl pointer-events-auto bg-[#081d35cc]">
              {/* Brand Logo */}
              <a
                href="#beranda"
                onClick={() => setActiveNav('#beranda')}
                aria-label="bandanaira.com, kembali ke Beranda"
                className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
              >
                <NutmegLogoIcon />
                <span className="relative w-fit font-normal text-white text-[20px] sm:text-[23px] tracking-[-0.90px] leading-[normal]">
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
              <div className="inline-flex items-center gap-2 sm:gap-3 relative flex-[0_0_auto]">
                {currentUser ? (
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('dashboard')}
                      className="inline-flex h-[38px] sm:h-[42px] items-center px-4 py-0 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                    >
                      <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                        {currentUser.full_name || currentUser.username}
                      </span>
                    </button>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex h-[38px] sm:h-[42px] items-center px-3 py-0 bg-rose-500/20 hover:bg-rose-500/35 rounded-lg border border-solid border-rose-400/50 text-white text-xs font-semibold transition-colors cursor-pointer"
                        title="Keluar dari Akun"
                      >
                        {t.navbar.signOut}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2">
                    {onOpenRegister && (
                      <button
                        type="button"
                        onClick={onOpenRegister}
                        className="hidden sm:inline-flex h-[38px] sm:h-[42px] items-center px-4 py-0 bg-amber-600 hover:bg-amber-500 rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] cursor-pointer"
                      >
                        <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                          {t.navbar.register}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="inline-flex h-[38px] sm:h-[42px] items-center px-4 sm:px-5 py-0 bg-[#d9770626] hover:bg-[#d9770640] rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] cursor-pointer"
                    >
                      <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                        {t.navbar.signIn}
                      </span>
                    </button>
                  </div>
                )}

                <div className="hidden sm:block w-px h-6 bg-white/20" />
                <LanguageSwitcher variant="dropdown" />
              </div>
            </header>
          </div>

          <ScrollExpand
            mediaType="youtube"
            youtubeId="bVvv6oNiFnw"
            poster={HERO_IMAGE_URL}
            src={HERO_IMAGE_URL}
            alt="Pemandangan Banda Neira dari udara dengan laut dan pulau-pulau di sekitarnya"
            useWindowScroll
            startWidth={44}
            startHeight={58}
            startRadius={24}
            endRadius={0}
            mediaZoom={1.22}
            scrollDistance={0.75}
            holdDistance={1.6}
            smoothing={0.1}
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
            <div className="w-full max-w-7xl mx-auto flex flex-col justify-center h-full pt-20 sm:pt-24 pb-6 sm:pb-8 pointer-events-auto">
              <main className="flex flex-col items-start gap-4 sm:gap-6 max-w-[850px] my-auto">
                <h1
                  id="banda-hero-title"
                  className="text-white text-3xl sm:text-5xl lg:text-7xl font-sans font-bold tracking-tight leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
                >
                  <span>{t.hero.headlineLine1}</span>
                  <br />
                  <span className="font-script font-normal text-amber-200 text-4xl sm:text-6xl lg:text-8xl leading-[1.05] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)]">
                    {t.hero.headlineLine2}
                  </span>
                </h1>

                <div className="max-w-[580px] p-4 sm:p-5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/15 shadow-2xl">
                  <p className="text-white/95 text-sm sm:text-base lg:text-[17px] leading-relaxed font-sans font-normal antialiased">
                    {t.hero.description}
                  </p>
                </div>

                <div className="inline-flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#wisata"
                    onClick={() => setActiveNav('#wisata')}
                    className="inline-flex h-[46px] sm:h-[52px] items-center gap-3 px-5 sm:px-6 bg-amber-600 hover:bg-amber-500 transition-colors rounded-xl border border-amber-400 font-semibold text-white text-xs sm:text-sm tracking-wide shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>{t.hero.ctaExplore}</span>
                    <ArrowUpRightIcon className="w-4 h-4 text-white" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onNavigate('gis')}
                    className="inline-flex h-[46px] sm:h-[52px] items-center gap-3 px-5 sm:px-6 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/25 backdrop-blur-md font-semibold text-white text-xs sm:text-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>{t.hero.ctaMap}</span>
                    <ArrowUpRightIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              </main>
            </div>
          </ScrollExpand>
        </>
      )}
    </section>
  )
}

export default HeroSection
