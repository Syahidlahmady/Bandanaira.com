import React, { useEffect, useState } from 'react'
import { Home, Compass, Map, Store, User, LogIn } from 'lucide-react'

export interface MobileBottomNavProps {
  activeTab?: string
  externalActiveNav?: string
  onNavigate: (tab: any, slugOrParam?: string) => void
  onOpenLogin: () => void
  currentUser: any
  onOpenMarketplace?: () => void
}

/**
 * MobileBottomNav
 * 
 * Bar navigasi bawah (Mobile App Bottom Bar) khusus untuk layar smartphone
 * dan WebView Capacitor (lg:hidden).
 * 
 * - Thumb-friendly ergonomic navigation (min 48px hit target).
 * - Safe area inset padding untuk iPhone Dynamic Island / Android gesture bar.
 * - Glassmorphism elegan palet Banda Neira (#081d35/95 + border-white/10).
 * - Menyorot tab aktif secara reaktif mengikuti scroll posisi seksi beranda.
 * - Tab 4: Pasar / Marketplace (menggantikan Bantuan yang dipindah ke menu garis 3 atas).
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab = 'landing',
  externalActiveNav = '#beranda',
  onNavigate,
  onOpenLogin,
  currentUser,
  onOpenMarketplace,
}) => {
  const [currentSection, setCurrentSection] = useState<string>(externalActiveNav || '#beranda')

  // Pantau seksi yang sedang berada di layar untuk menyorot ikon aktif
  useEffect(() => {
    if (activeTab !== 'landing') {
      setCurrentSection(activeTab)
      return
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200
      const petaEl = document.getElementById('peta')
      const wisataEl = document.getElementById('wisata')
      const ecoEl = document.getElementById('eco-stay')
      const umkmEl = document.getElementById('layanan-umkm')

      const umkmTop = umkmEl ? umkmEl.offsetTop : Infinity
      const ecoTop = ecoEl ? ecoEl.offsetTop : Infinity
      const wisataTop = wisataEl ? wisataEl.offsetTop : Infinity
      const petaTop = petaEl ? petaEl.offsetTop : Infinity

      if (scrollPos >= umkmTop) {
        setCurrentSection('#layanan-umkm')
      } else if (scrollPos >= wisataTop || scrollPos >= ecoTop) {
        setCurrentSection('#wisata')
      } else if (scrollPos >= petaTop) {
        setCurrentSection('#peta')
      } else {
        setCurrentSection('#beranda')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeTab])

  const isHomeActive = currentSection === '#beranda' || (activeTab === 'landing' && currentSection === '#beranda')
  const isWisataActive = currentSection === '#wisata' || currentSection === '#eco-stay' || activeTab === 'tourism'
  const isPetaActive = currentSection === '#peta' || activeTab === 'gis'
  const isMarketplaceActive = activeTab === 'marketplace' || activeTab === 'market' || currentSection === '#layanan-umkm'
  const isAccountActive = activeTab === 'dashboard' || activeTab === 'population'

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (activeTab !== 'landing') {
      onNavigate('landing' as any)
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentSection('#beranda')
  }

  const handleWisataClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (activeTab !== 'landing') {
      onNavigate('tourism')
      return
    }
    const el = document.getElementById('wisata') || document.getElementById('eco-stay')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setCurrentSection('#wisata')
    } else {
      onNavigate('tourism')
    }
  }

  const handlePetaClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (activeTab !== 'landing') {
      onNavigate('gis')
      return
    }
    const el = document.getElementById('peta')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setCurrentSection('#peta')
    } else {
      onNavigate('gis')
    }
  }

  const handleMarketplaceClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onOpenMarketplace) {
      onOpenMarketplace()
    } else if (activeTab !== 'landing') {
      onNavigate('marketplace' as any)
    } else {
      const el = document.getElementById('layanan-umkm')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        setCurrentSection('#layanan-umkm')
      } else {
        onNavigate('marketplace' as any)
      }
    }
  }

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentUser) {
      onNavigate('dashboard')
    } else {
      onOpenLogin()
    }
  }

  return (
    <nav
      id="mobile-bottom-app-bar"
      aria-label="Navigasi Bawah Seluler"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#081d35]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] select-none pointer-events-auto will-change-transform"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around relative">
        {/* 1. Beranda */}
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label="Navigasi ke Beranda"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-h-[44px] relative active:scale-90 ${
            isHomeActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isHomeActive && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25 transition-all duration-300"
            />
          )}
          <div
            className={`relative flex items-center justify-center transition-all duration-200 ${
              isHomeActive ? 'scale-110 -translate-y-0.5' : ''
            }`}
          >
            <Home size={20} strokeWidth={isHomeActive ? 2.5 : 1.8} />
            {isHomeActive && (
              <span
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e] animate-pulse"
              />
            )}
          </div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Beranda
          </span>
        </button>

        {/* 2. Peta Spasial (GIS) - Sesuai urutan alur scroll landing page */}
        <button
          type="button"
          onClick={handlePetaClick}
          aria-label="Buka Peta Spasial Kepulauan"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-h-[44px] relative active:scale-90 ${
            isPetaActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isPetaActive && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25 transition-all duration-300"
            />
          )}
          <div
            className={`relative flex items-center justify-center transition-all duration-200 ${
              isPetaActive ? 'scale-110 -translate-y-0.5' : ''
            }`}
          >
            <Map size={20} strokeWidth={isPetaActive ? 2.5 : 1.8} />
            {isPetaActive && (
              <span
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e] animate-pulse"
              />
            )}
          </div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Peta
          </span>
        </button>

        {/* 3. Wisata & Eco-Stay */}
        <button
          type="button"
          onClick={handleWisataClick}
          aria-label="Navigasi ke Destinasi & Penginapan"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-h-[44px] relative active:scale-90 ${
            isWisataActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isWisataActive && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25 transition-all duration-300"
            />
          )}
          <div
            className={`relative flex items-center justify-center transition-all duration-200 ${
              isWisataActive ? 'scale-110 -translate-y-0.5' : ''
            }`}
          >
            <Compass size={20} strokeWidth={isWisataActive ? 2.5 : 1.8} />
            {isWisataActive && (
              <span
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e] animate-pulse"
              />
            )}
          </div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Wisata
          </span>
        </button>

        {/* 4. Pasar / Marketplace */}
        <button
          type="button"
          onClick={handleMarketplaceClick}
          aria-label="Buka Marketplace UMKM Banda"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-h-[44px] relative active:scale-90 ${
            isMarketplaceActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isMarketplaceActive && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25 transition-all duration-300"
            />
          )}
          <div
            className={`relative flex items-center justify-center transition-all duration-200 ${
              isMarketplaceActive ? 'scale-110 -translate-y-0.5' : ''
            }`}
          >
            <Store size={20} strokeWidth={isMarketplaceActive ? 2.5 : 1.8} />
            {isMarketplaceActive && (
              <span
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e] animate-pulse"
              />
            )}
          </div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Pasar
          </span>
        </button>

        {/* 5. Akun / Masuk */}
        <button
          type="button"
          onClick={handleAccountClick}
          aria-label={currentUser ? 'Buka Dashboard Akun' : 'Masuk ke Portal'}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-h-[44px] relative active:scale-90 ${
            isAccountActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isAccountActive && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25 transition-all duration-300"
            />
          )}
          <div
            className={`relative flex items-center justify-center transition-all duration-200 ${
              isAccountActive ? 'scale-110 -translate-y-0.5' : ''
            }`}
          >
            {currentUser ? (
              <User size={20} strokeWidth={isAccountActive ? 2.5 : 1.8} />
            ) : (
              <LogIn size={20} strokeWidth={isAccountActive ? 2.5 : 1.8} />
            )}
            {currentUser && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#081d35]" />
            )}
          </div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none truncate max-w-[56px]">
            {currentUser ? (currentUser.full_name?.split(' ')[0] || 'Akun') : 'Masuk'}
          </span>
        </button>
      </div>
    </nav>
  )
}

export default MobileBottomNav
