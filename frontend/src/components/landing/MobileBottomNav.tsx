import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          onClick={handleHomeClick}
          aria-label="Navigasi ke Beranda"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
            isHomeActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isHomeActive && (
            <motion.div
              layoutId="landing-mobile-indicator"
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <motion.div
            animate={{
              scale: isHomeActive ? 1.15 : 1,
              y: isHomeActive ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative flex items-center justify-center"
          >
            <Home size={20} strokeWidth={isHomeActive ? 2.5 : 1.8} />
            {isHomeActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e]"
              />
            )}
          </motion.div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Beranda
          </span>
        </motion.button>

        {/* 2. Peta Spasial (GIS) - Sesuai urutan alur scroll landing page */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          onClick={handlePetaClick}
          aria-label="Buka Peta Spasial Kepulauan"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
            isPetaActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isPetaActive && (
            <motion.div
              layoutId="landing-mobile-indicator"
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <motion.div
            animate={{
              scale: isPetaActive ? 1.15 : 1,
              y: isPetaActive ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative flex items-center justify-center"
          >
            <Map size={20} strokeWidth={isPetaActive ? 2.5 : 1.8} />
            {isPetaActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e]"
              />
            )}
          </motion.div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Peta
          </span>
        </motion.button>

        {/* 3. Wisata & Eco-Stay */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          onClick={handleWisataClick}
          aria-label="Navigasi ke Destinasi & Penginapan"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
            isWisataActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isWisataActive && (
            <motion.div
              layoutId="landing-mobile-indicator"
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <motion.div
            animate={{
              scale: isWisataActive ? 1.15 : 1,
              y: isWisataActive ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative flex items-center justify-center"
          >
            <Compass size={20} strokeWidth={isWisataActive ? 2.5 : 1.8} />
            {isWisataActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e]"
              />
            )}
          </motion.div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Wisata
          </span>
        </motion.button>

        {/* 4. Pasar / Marketplace */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          onClick={handleMarketplaceClick}
          aria-label="Buka Marketplace UMKM Banda"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
            isMarketplaceActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isMarketplaceActive && (
            <motion.div
              layoutId="landing-mobile-indicator"
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <motion.div
            animate={{
              scale: isMarketplaceActive ? 1.15 : 1,
              y: isMarketplaceActive ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative flex items-center justify-center"
          >
            <Store size={20} strokeWidth={isMarketplaceActive ? 2.5 : 1.8} />
            {isMarketplaceActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f4b75e] shadow-[0_0_8px_#f4b75e]"
              />
            )}
          </motion.div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
            Pasar
          </span>
        </motion.button>

        {/* 5. Akun / Masuk */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          onClick={handleAccountClick}
          aria-label={currentUser ? 'Buka Dashboard Akun' : 'Masuk ke Portal'}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
            isAccountActive ? 'text-[#f4b75e]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isAccountActive && (
            <motion.div
              layoutId="landing-mobile-indicator"
              className="absolute inset-0 bg-gradient-to-b from-[#f4b75e]/20 via-[#f4b75e]/10 to-transparent rounded-2xl -z-10 border border-[#f4b75e]/25"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <motion.div
            animate={{
              scale: isAccountActive ? 1.15 : 1,
              y: isAccountActive ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative flex items-center justify-center"
          >
            {currentUser ? (
              <User size={20} strokeWidth={isAccountActive ? 2.5 : 1.8} />
            ) : (
              <LogIn size={20} strokeWidth={isAccountActive ? 2.5 : 1.8} />
            )}
            {currentUser && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#081d35]" />
            )}
          </motion.div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none truncate max-w-[56px]">
            {currentUser ? (currentUser.full_name?.split(' ')[0] || 'Akun') : 'Masuk'}
          </span>
        </motion.button>
      </div>
    </nav>
  )
}

export default MobileBottomNav
