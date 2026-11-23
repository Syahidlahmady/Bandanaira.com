import React, { useEffect, useState, Suspense } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { HeroSection } from '../../components/landing/HeroSection'

const PetaInteractiveSection = React.lazy(() => import('../../components/landing/PetaInteractiveSection'))
const HeritageSpiceSection = React.lazy(() => import('../../components/landing/HeritageSpiceSection'))
const TourismSawSection = React.lazy(() => import('../../components/landing/TourismSawSection'))
const EcoStayCatalogSection = React.lazy(() => import('../../components/landing/EcoStayCatalogSection'))
const EcosystemFeaturesSection = React.lazy(() => import('../../components/landing/EcosystemFeaturesSection'))
const TraceabilityMarketplaceSection = React.lazy(() => import('../../components/landing/TraceabilityMarketplaceSection'))
const SustainableTravelSection = React.lazy(() => import('../../components/landing/SustainableTravelSection'))
const PlanYourVisitSection = React.lazy(() => import('../../components/landing/PlanYourVisitSection'))
const LandingFooterSection = React.lazy(() => import('../../components/landing/LandingFooterSection'))
const TourismChatbotBubble = React.lazy(() => import('../../components/landing/TourismChatbotBubble'))

export type NavTabType =
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
  | 'sejarah'

export interface BandanairaBerandaProps {
  onNavigate: (tab: NavTabType, slugOrParam?: string) => void
  onOpenLogin: () => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  currentUser: any
  isOnline?: boolean
  onLogout?: () => void
  onOpenQuickLogin?: () => void
  onToggleViewMode?: () => void
  viewMode?: 'editorial' | 'command'
}

/**
 * BandanairaBeranda - Clean Architecture Landing Page Composer
 * Mengorkestrasi 10 section independen dari components/landing/
 * Sesuai arsitektur clean code & blueprint fhinisCleanCode.md
 */
export const BandanairaBeranda: React.FC<BandanairaBerandaProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenMarketplace,
  onPublicVerify,
  currentUser,
  onLogout,
  onOpenQuickLogin,
}) => {
  const [activeNav, setActiveNav] = useState<string>('#beranda')

  // Smooth scrolling initialization via Lenis (Desktop only; native momentum scrolling for mobile)
  useEffect(() => {
    const isMobileDevice = typeof window !== 'undefined' && (
      window.innerWidth < 1024 ||
      window.matchMedia('(pointer: coarse)').matches ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )

    // On mobile devices, bypass Lenis to utilize native 60/120Hz GPU-accelerated momentum scrolling
    if (isMobileDevice) {
      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
        if (target && target.hash) {
          const targetElement = document.querySelector(target.hash)
          if (targetElement) {
            e.preventDefault()
            targetElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
      document.addEventListener('click', handleAnchorClick)
      return () => {
        document.removeEventListener('click', handleAnchorClick)
      }
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    })

    // Smooth anchor link click handling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (target && target.hash) {
        const targetElement = document.querySelector(target.hash)
        if (targetElement) {
          e.preventDefault()
          lenis.scrollTo(targetElement, { offset: -20, duration: 1.2 })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-start bg-[#f7f5f0] text-[#0f2c59] selection:bg-[#f4b75e] selection:text-[#081d35] overflow-x-clip">
      {/* 1. Hero & Navbar Section */}
      <HeroSection
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        currentUser={currentUser}
        onLogout={onLogout}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      <Suspense
        fallback={
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3 bg-[#f7f5f0]">
            <div className="w-8 h-8 rounded-full border-2 border-[#0f2c59] border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-slate-600">
              Memuat bagian penjelajahan pulau...
            </span>
          </div>
        }
      >
        {/* 3. Interactive Spatial Map Section */}
        <div className="w-full content-auto">
          <PetaInteractiveSection
            onNavigate={onNavigate}
            currentUser={currentUser}
          />
        </div>

        {/* 4. Spice Heritage & Cultural Sites Section */}
        <HeritageSpiceSection
          onNavigate={onNavigate}
        />

        {/* 5. Marine & Heritage Tourism with SAW Recommender */}
        <div className="w-full content-auto">
          <TourismSawSection
            onNavigate={onNavigate}
          />
        </div>

        {/* 6. Island Stays & Eco-Lodges Directory */}
        <div className="w-full content-auto">
          <EcoStayCatalogSection
            onNavigate={onNavigate}
            onOpenLogin={onOpenLogin}
            onOpenQuickLogin={onOpenQuickLogin}
          />
        </div>

        {/* 7. Resident Services & Digital Island Ecosystem */}
        <div className="w-full content-auto">
          <EcosystemFeaturesSection
            onNavigate={onNavigate}
            onOpenLogin={onOpenLogin}
            currentUser={currentUser}
          />
        </div>

        {/* 8. Verified Blockchain Marketplace & Local UMKM */}
        <div className="w-full content-auto">
          <TraceabilityMarketplaceSection
            onNavigate={onNavigate}
            onOpenMarketplace={onOpenMarketplace}
            onPublicVerify={onPublicVerify}
          />
        </div>

        {/* 9. Demographics & Island Vitality Stats */}
        <div className="w-full content-auto">
          <SustainableTravelSection
            onNavigate={onNavigate}
            onOpenLogin={onOpenLogin}
            currentUser={currentUser}
          />
        </div>

        {/* 10. Plan Your Visit CTA */}
        <div className="w-full content-auto">
          <PlanYourVisitSection
            onNavigate={onNavigate}
          />
        </div>

        {/* 11. Comprehensive Ecosystem Footer */}
        <div className="w-full content-auto">
          <LandingFooterSection
            onNavigate={onNavigate}
            onOpenLogin={onOpenLogin}
            onOpenQuickLogin={onOpenQuickLogin}
            setActiveNav={setActiveNav}
          />
        </div>

        {/* 12. Floating Tourism Recommendation Chatbot Bubble */}
        <TourismChatbotBubble onNavigate={onNavigate} />
      </Suspense>
    </div>
  )
}

export default BandanairaBeranda
