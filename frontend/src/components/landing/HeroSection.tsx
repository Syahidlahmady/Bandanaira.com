import React, { useState } from 'react'
import { NutmegLogoIcon, ArrowUpRightIcon } from './LandingIcons'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'

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

  return (
    <section
      id="beranda"
      aria-labelledby="banda-hero-title"
      className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#081d35] text-white selection:bg-[#f4b75e] selection:text-black"
    >
      {/* High-Resolution Responsive Backdrop */}
      <img
        src="/banda.webp"
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

      {/* Top Navbar */}
      <div className="sticky top-0 w-full px-3.5 sm:px-6 lg:px-12 pt-3 sm:pt-5 z-50 pointer-events-auto">
        <header className="flex h-14 sm:h-18 lg:h-20 items-center justify-between px-3.5 sm:px-6 w-full max-w-7xl mx-auto rounded-2xl border border-solid border-white/20 backdrop-blur-md shadow-2xl bg-[#081d35cc]">
          {/* Brand Logo */}
          <a
            href="#beranda"
            onClick={() => setActiveNav('#beranda')}
            aria-label="bandanaira.com, kembali ke Beranda"
            className="inline-flex items-center gap-2 sm:gap-2.5"
          >
            <NutmegLogoIcon />
            <span className="font-normal text-white text-[19px] sm:text-[22px] tracking-tight">
              bandanaira.com
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden lg:inline-flex items-center gap-6"
          >
            {navigationItems.map((item) => {
              const isActive = activeNav === item.href
              return (
                <div key={item.label} className="inline-flex flex-col items-start gap-1">
                  <a
                    href={item.href}
                    onClick={() => setActiveNav(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="font-medium text-white/90 hover:text-[#f4b75e] transition-colors text-xs tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                  >
                    {item.label}
                  </a>
                  {isActive && <div aria-hidden="true" className="w-[20px] h-0.5 bg-[#f4b75e]" />}
                </div>
              )
            })}
          </nav>

          {/* Action Buttons */}
          <div className="inline-flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex h-[36px] sm:h-[40px] items-center px-3 sm:px-4 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-[#f4b75e] text-white text-xs font-semibold transition-colors"
                >
                  {currentUser.full_name || currentUser.username}
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-[36px] sm:h-[40px] items-center px-3 bg-rose-500/20 hover:bg-rose-500/35 rounded-lg border border-rose-400/50 text-white text-xs font-semibold transition-colors cursor-pointer"
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
                    className="hidden sm:inline-flex h-[36px] sm:h-[40px] items-center px-4 bg-amber-600 hover:bg-amber-500 rounded-lg border border-[#f4b75e] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.navbar.register}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex h-[36px] sm:h-[40px] items-center px-3.5 sm:px-4 bg-[#d9770626] hover:bg-[#d9770640] rounded-lg border border-[#f4b75e] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.navbar.signIn}
                </button>
              </div>
            )}

            <div className="hidden sm:block w-px h-6 bg-white/20" />
            <LanguageSwitcher variant="dropdown" />

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-white/20 bg-slate-900/60 text-white cursor-pointer"
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
          <div className="lg:hidden relative z-50 w-full max-w-7xl mx-auto mt-2 rounded-2xl bg-[#081d35f2] border border-solid border-white/20 backdrop-blur-xl p-5 shadow-2xl">
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

      {/* Main Hero Narrative */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 my-auto z-10">
        <main className="flex flex-col items-start gap-4 sm:gap-6 max-w-[850px]">
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

          <div className="max-w-[580px] p-4 sm:p-5 rounded-2xl bg-[#081d35d9] border border-white/15 shadow-2xl">
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

      {/* Bottom Spacer / Anchor point */}
      <div className="h-4 sm:h-8" />
    </section>
  )
}

export default HeroSection