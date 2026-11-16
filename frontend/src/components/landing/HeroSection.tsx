import React, { useState, useEffect } from 'react'
import bandaCinematicVideoBackdrop from '../../assets/image.webp'
import { NutmegLogoIcon, ArrowUpRightIcon, ArrowDownIcon } from './LandingIcons'
import { ScrollExpand } from '../ui/ScrollExpand'

export const defaultNavigationItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Peta GIS', href: '#peta' },
  { label: 'Wisata (SAW)', href: '#wisata' },
  { label: 'Penginapan', href: '#eco-stay' },
  { label: 'Marketplace UMKM', href: '#layanan-umkm' },
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
  const [internalActiveNav, setInternalActiveNav] = useState<string>('#beranda')
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  const activeNav = externalActiveNav || internalActiveNav
  const setActiveNav = externalSetActiveNav || setInternalActiveNav

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section
      id="beranda"
      aria-labelledby="banda-hero-title"
      className="relative w-full bg-[#081d35] text-white selection:bg-[#f4b75e] selection:text-[#081d35]"
    >
      {/* 1. FIXED TOP NAVBAR (Always accessible across resting, expansion, and full-bleed states) */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 pt-3 sm:pt-5 pointer-events-none">
        <header className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 py-0 w-full max-w-7xl mx-auto bg-[#081d35cc] rounded-2xl overflow-hidden border border-solid border-white/20 backdrop-blur-md shadow-2xl pointer-events-auto">
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
            {defaultNavigationItems.map((item) => {
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
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
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
                    className="inline-flex h-[38px] sm:h-[42px] items-center px-3 py-0 bg-rose-500/20 hover:bg-rose-500/35 rounded-lg border border-solid border-rose-400/50 text-white text-xs font-semibold transition-colors"
                    title="Keluar dari Akun"
                  >
                    Keluar
                  </button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2">
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="hidden sm:inline-flex h-[38px] sm:h-[42px] items-center px-4 py-0 bg-amber-600 hover:bg-amber-500 rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                  >
                    <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                      Daftar
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex h-[38px] sm:h-[42px] items-center px-4 sm:px-5 py-0 bg-[#d9770626] hover:bg-[#d9770640] rounded-lg border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                >
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                    Masuk
                  </span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex lg:hidden h-[38px] w-[38px] items-center justify-center rounded-lg border border-solid border-white/20 bg-slate-900/60 text-white text-base"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="relative z-50 w-full max-w-7xl mx-auto mt-2 rounded-2xl bg-[#081d35f2] border border-solid border-white/20 backdrop-blur-xl p-5 lg:hidden pointer-events-auto shadow-2xl">
            <nav aria-label="Navigasi seluler" className="flex flex-col gap-3">
              {defaultNavigationItems.map((item) => (
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
                <>
                  <div className="h-px bg-white/15 my-2" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {onOpenRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onOpenRegister()
                        }}
                        className="h-10 px-4 rounded-lg bg-amber-600 border border-[#f4b75e] text-white text-xs font-semibold"
                      >
                        Daftar Akun
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onOpenLogin()
                      }}
                      className="h-10 px-4 rounded-lg bg-[#d9770626] border border-[#f4b75e] text-white text-xs font-semibold"
                    >
                      Masuk / Login
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* 2. SCROLL EXPAND COMPONENT INTEGRATION */}
      <ScrollExpand
        src={bandaCinematicVideoBackdrop}
        alt="Pemandangan Banda Neira dari udara dengan laut dan pulau-pulau di sekitarnya"
        useWindowScroll
        startWidth={isMobile ? 88 : 46}
        startHeight={isMobile ? 54 : 60}
        startRadius={isMobile ? 20 : 28}
        endRadius={0}
        mediaZoom={1.3}
        scrollDistance={1.1}
        holdDistance={0.35}
        smoothing={0.12}
        overlayScrim={0.52}
        title={
          <div className="flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3.5 px-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/20 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#f4b75e] animate-pulse" />
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] text-[#f4b75e] uppercase">
                Kepulauan Banda · Maluku
              </span>
            </div>
            <h2 className="font-sans font-bold tracking-tight text-white text-2xl sm:text-4xl lg:text-5xl leading-[1.15] drop-shadow-lg">
              Di jantung rempah dunia,{' '}
              <span className="font-serif italic font-normal text-amber-200">
                temukan Banda.
              </span>
            </h2>
          </div>
        }
        scrollHint={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-mono tracking-wider shadow-lg">
            <span>Gulir untuk membuka pulau</span>
            <ArrowDownIcon className="w-3.5 h-3.5 animate-bounce text-amber-400" />
          </div>
        }
      >
        {/* OVERLAY CONTENT (Fades in once frame expands to full bleed) */}
        <div className="w-full max-w-7xl mx-auto flex flex-col justify-between h-full pt-20 sm:pt-24 pb-4 sm:pb-6 pointer-events-auto">
          {/* Spacer Top for Navbar clearance */}
          <div className="h-4 sm:h-8" />

          {/* MAIN EDITORIAL HERO NARRATIVE (Asymmetric Left-Aligned Layout) */}
          <main className="flex flex-col items-start gap-3 sm:gap-5 max-w-[850px] my-auto">
            {/* Geographic Coordinates & Epoch Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 backdrop-blur-md">
              <div aria-hidden="true" className="w-4 h-0.5 bg-[#f4b75e]" />
              <p className="font-mono text-[10px] sm:text-xs tracking-[0.18em] text-amber-300 uppercase">
                4°31′24″ LS · 129°54′18″ BT · TITIK NOL JALUR REMPAH
              </p>
            </div>

            {/* Display Headline */}
            <h1
              id="banda-hero-title"
              className="text-white text-3xl sm:text-5xl lg:text-7xl font-sans font-bold tracking-tight leading-[1.08]"
            >
              <span>Di jantung rempah dunia,</span>
              <br />
              <span className="font-serif italic font-normal text-amber-300 text-4xl sm:text-6xl lg:text-8xl leading-[1.05]">
                temukan Banda.
              </span>
            </h1>

            {/* Narrative Paragraph */}
            <p className="max-w-[560px] text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed font-sans">
              Laut yang menyimpan keajaiban karang purba. Jejak benteng kolonial yang hidup.
              Satu pintu digital untuk menjelajah ekosistem pulau, pemetaan cagar budaya, dan kearifan masyarakat Banda.
            </p>

            {/* Dual Action CTAs */}
            <div className="inline-flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#wisata"
                onClick={() => setActiveNav('#wisata')}
                className="inline-flex h-[46px] sm:h-[52px] items-center gap-3 px-5 sm:px-6 bg-amber-600 hover:bg-amber-500 transition-colors rounded-xl border border-amber-400 font-semibold text-white text-xs sm:text-sm tracking-wide shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Mulai jelajahi Banda</span>
                <ArrowUpRightIcon className="w-4 h-4 text-white" />
              </a>

              <button
                type="button"
                onClick={() => onNavigate('gis')}
                className="inline-flex h-[46px] sm:h-[52px] items-center gap-3 px-5 sm:px-6 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/25 backdrop-blur-md font-semibold text-white text-xs sm:text-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Lihat peta pulau (GIS)</span>
                <ArrowUpRightIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </main>

          {/* HERO FOOTER STATUS BAR */}
          <footer className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-slate-300 font-sans">
            <div className="inline-flex items-center gap-3">
              <div className="flex w-7 h-7 items-center justify-center rounded-full bg-white/10 border border-white/20">
                <svg
                  className="w-3 h-3 text-white fill-current ml-0.5"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M4 2.5v11l9-5.5-9-5.5z" />
                </svg>
              </div>
              <span className="font-mono text-[11px] tracking-wider uppercase text-white/90">
                Sekilas Banda · Lanskap Kepulauan
              </span>
            </div>

            <a
              href="#sejarah"
              onClick={() => setActiveNav('#sejarah')}
              className="inline-flex items-center gap-2 text-white/90 hover:text-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
            >
              <span className="font-normal text-[11px] sm:text-xs">
                Ada cerita di setiap pulau
              </span>
              <ArrowDownIcon className="w-3.5 h-3.5 text-amber-400" />
            </a>

            <span className="font-mono text-[11px] text-slate-400">
              Gunung Api · Banda Besar · Pulau Hatta · Rhun · Ay
            </span>
          </footer>
        </div>
      </ScrollExpand>
    </section>
  )
}

export default HeroSection
