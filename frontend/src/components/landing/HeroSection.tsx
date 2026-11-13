import React, { useState } from 'react'
import bandaCinematicVideoBackdrop from '../../assets/image.webp'
import { NutmegLogoIcon, ArrowUpRightIcon, ArrowDownIcon } from './LandingIcons'

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

  const activeNav = externalActiveNav || internalActiveNav
  const setActiveNav = externalSetActiveNav || setInternalActiveNav

  return (
    <section
      id="beranda"
      aria-labelledby="banda-hero-title"
      className="flex flex-col min-h-[100dvh] items-start justify-between pt-3 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-8 lg:px-12 relative self-stretch w-full bg-[#081d35] overflow-hidden"
    >
      {/* Background Image Optimized */}
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="Pemandangan Banda Neira dari udara dengan laut dan pulau-pulau di sekitarnya"
        src={bandaCinematicVideoBackdrop}
        loading="eager"
        decoding="async"
        {...({ fetchPriority: 'high' } as any)}
      />

      {/* Gradient Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full bg-[linear-gradient(0deg,rgba(8,29,53,0.47)_0%,rgba(8,29,53,0.13)_30%,rgba(8,29,53,0.47)_70%,rgba(8,29,53,0.96)_100%)]"
      />

      {/* NAVBAR */}
      <header className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 py-0 relative z-20 self-stretch w-full bg-[#081d354d] rounded-2xl overflow-hidden border border-solid border-[#ffffff38] backdrop-blur-[9px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(9px)_brightness(100%)]">
        <a
          href="#beranda"
          onClick={() => setActiveNav('#beranda')}
          aria-label="bandanaira.com, kembali ke Beranda"
          className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
        >
          <NutmegLogoIcon />
          <span className="relative w-fit font-normal text-white text-[21px] sm:text-[23px] tracking-[-0.90px] leading-[normal]">
            bandanaira.com
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navigasi utama"
          className="hidden lg:inline-flex items-center gap-[25px] relative flex-[0_0_auto]"
        >
          {defaultNavigationItems.map((item) => {
            const isActive = activeNav === item.href
            return (
              <div
                key={item.label}
                className="inline-flex flex-col items-start gap-2 relative flex-[0_0_auto]"
              >
                <a
                  href={item.href}
                  onClick={() => setActiveNav(item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative w-fit mt-[-1.00px] font-normal text-white hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
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

        {/* Right Action Area */}
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          {currentUser ? (
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('population')}
                className="inline-flex h-[42px] items-center px-[18px] py-0 relative flex-[0_0_auto] bg-[#d9770626] hover:bg-[#d9770640] rounded-md overflow-hidden border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
              >
                <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                  {currentUser.full_name || currentUser.username}
                </span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-[42px] items-center px-3 py-0 bg-rose-500/20 hover:bg-rose-500/35 rounded-md border border-solid border-rose-400/50 text-white text-xs font-semibold transition-colors"
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
                  className="hidden sm:inline-flex h-[42px] items-center px-[16px] py-0 relative flex-[0_0_auto] bg-amber-600 hover:bg-amber-500 rounded-md overflow-hidden border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                >
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                    Daftar
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex h-[42px] items-center px-[18px] py-0 relative flex-[0_0_auto] bg-[#d9770626] hover:bg-[#d9770640] rounded-md overflow-hidden border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
              >
                <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                  Masuk / Login
                </span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex lg:hidden h-[42px] w-[42px] items-center justify-center rounded-md border border-solid border-[#ffffff38] bg-[#081d3566] text-white text-lg"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="relative z-30 w-full mt-2 rounded-2xl bg-[#081d35e6] border border-solid border-[#ffffff38] backdrop-blur-md p-5 lg:hidden">
          <nav aria-label="Navigasi seluler" className="flex flex-col gap-3.5">
            {defaultNavigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActiveNav(item.href)
                  setMobileMenuOpen(false)
                }}
                className={`text-sm font-medium py-1 ${
                  activeNav === item.href ? 'text-[#f4b75e]' : 'text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
            {!currentUser && (
              <>
                <div className="h-px bg-[#ffffff38] my-1" />
                <div className="flex flex-wrap gap-2">
                  {onOpenRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onOpenRegister()
                      }}
                      className="h-10 px-4 rounded-md bg-amber-600 border border-[#f4b75e] text-white text-xs font-semibold"
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
                    className="h-10 px-4 rounded-md bg-[#d9770626] border border-[#f4b75e] text-white text-xs font-semibold"
                  >
                    Masuk / Login
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      {/* HERO MAIN CONTENT */}
      <main className="flex flex-col items-start gap-3 sm:gap-5 pt-2 sm:pt-4 pb-2 px-2 sm:px-6 lg:px-8 relative z-10 self-stretch w-full flex-1 justify-center max-w-[1100px] my-auto">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="w-8 relative h-px bg-[#f4b75e]" />
          <p className="relative w-fit mt-[-1.00px] font-normal text-white text-[11px] sm:text-xs tracking-[2.60px] leading-[normal]">
            KEPULAUAN BANDA · MALUKU, INDONESIA
          </p>
        </div>

        <h1
          id="banda-hero-title"
          className="relative max-w-[1000px] font-normal text-white text-[32px] sm:text-[54px] lg:text-[76px] leading-[1.08] lg:leading-[80px]"
        >
          <span className="font-medium tracking-[-1.5px] sm:tracking-[-2.5px] lg:tracking-[-3.20px]">
            Di jantung rempah dunia,
            <br />
          </span>
          <span className="font-serif font-medium italic text-[38px] sm:text-[64px] lg:text-[88px] tracking-[-1.5px] sm:tracking-[-2px] leading-[1.05] lg:leading-[90px]">
            temukan Banda.
          </span>
        </h1>

        <p className="relative max-w-[560px] font-normal text-[#c1ced8] text-[14px] sm:text-[16px] tracking-[0] leading-relaxed">
          Laut yang menyimpan keajaiban. Jejak sejarah yang hidup. Satu pintu
          untuk menjelajah dan terhubung dengan kehidupan pulau.
        </p>

        <div className="inline-flex flex-wrap items-start gap-3 pt-1 pb-0 px-0 relative flex-[0_0_auto]">
          <a
            href="#wisata"
            onClick={() => setActiveNav('#wisata')}
            className="inline-flex h-[48px] sm:h-[54px] items-center gap-3 sm:gap-4 px-5 sm:px-6 py-0 relative flex-[0_0_auto] bg-amber-600 hover:bg-amber-500 transition-colors rounded-lg overflow-hidden border border-solid border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
          >
            <span className="font-semibold text-white text-xs sm:text-sm tracking-[0] relative w-fit leading-[normal]">
              Mulai jelajahi Banda
            </span>
            <ArrowUpRightIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="flex-[0_0_auto] border-[#ffffff38] bg-[#081d3540] hover:bg-[#ffffff1a] transition-colors inline-flex h-[48px] sm:h-[54px] items-center gap-3 sm:gap-4 px-5 sm:px-6 py-0 relative rounded-lg overflow-hidden border border-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
          >
            <span className="font-semibold text-white text-xs sm:text-sm tracking-[0] relative w-fit leading-[normal]">
              Lihat peta pulau
            </span>
            <ArrowUpRightIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
          </button>
        </div>
      </main>

      {/* HERO FOOTER BAR */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-0 px-2 sm:px-6 lg:px-8 relative z-10 self-stretch w-full border-0 border-none">
        <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
          <div className="flex w-9 h-9 items-center justify-center relative rounded-[100px] overflow-hidden border border-solid border-[#ffffff38]">
            <svg
              className="w-3.5 h-3.5 text-white fill-current ml-0.5"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          </div>
          <p className="relative w-fit font-normal text-white text-[11px] tracking-[1.00px] leading-[normal] whitespace-nowrap">
            SEKILAS BANDA · VIDEO BERULANG
          </p>
        </div>

        <a
          href="#sejarah"
          onClick={() => setActiveNav('#sejarah')}
          className="inline-flex items-center gap-3 relative flex-[0_0_auto] text-white hover:text-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
        >
          <span className="mt-[-1.00px] font-normal text-[11px] tracking-[0] whitespace-nowrap relative w-fit leading-[normal]">
            Ada cerita di setiap pulau
          </span>
          <ArrowDownIcon className="w-4 h-4" />
        </a>

        <p className="relative w-fit font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
          Banda Neira &amp; Gunung Banda Api
        </p>
      </footer>
    </section>
  )
}

export default HeroSection
