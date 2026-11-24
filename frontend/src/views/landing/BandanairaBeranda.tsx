import React, { useEffect, useState } from 'react'
import { HeroSection } from '../../components/landing/HeroSection'
import PetaInteractiveSection from '../../components/landing/PetaInteractiveSection'
import HeritageSpiceSection from '../../components/landing/HeritageSpiceSection'
import TourismSawSection from '../../components/landing/TourismSawSection'
import EcoStayCatalogSection from '../../components/landing/EcoStayCatalogSection'
import EcosystemFeaturesSection from '../../components/landing/EcosystemFeaturesSection'
import TraceabilityMarketplaceSection from '../../components/landing/TraceabilityMarketplaceSection'
import SustainableTravelSection from '../../components/landing/SustainableTravelSection'
import PlanYourVisitSection from '../../components/landing/PlanYourVisitSection'
import LandingFooterSection from '../../components/landing/LandingFooterSection'
import TourismChatbotBubble from '../../components/landing/TourismChatbotBubble'
import MobileBottomNav from '../../components/landing/MobileBottomNav'

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
  | 'marketplace'

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
  activeTab?: string
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
  activeTab = 'landing',
}) => {
  const [activeNav, setActiveNav] = useState<string>('#beranda')

  // 1. Intercept all button and anchor clicks on landing page to capture scroll position, anchor & section
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const btn = target?.closest('button, a, [data-scroll-anchor]') as HTMLElement | null
      if (btn) {
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0
        const anchor = btn.getAttribute('data-scroll-anchor') || btn.id
        const section = btn.closest('section')?.id || ''
        try {
          sessionStorage.setItem('banda_landing_scroll_y', String(scrollY))
          if (section) {
            sessionStorage.setItem('banda_landing_scroll_section', section)
          }
          if (anchor) {
            sessionStorage.setItem('banda_landing_scroll_anchor', anchor)
          } else {
            const label = (btn.textContent || '').trim().slice(0, 25).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
            const dynamicId = `btn-${label || 'nav'}-${Math.floor(scrollY)}`
            btn.setAttribute('data-scroll-anchor', dynamicId)
            sessionStorage.setItem('banda_landing_scroll_anchor', dynamicId)
          }
        } catch {
          // ignore
        }
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [])

  // 2. Restore scroll position back to the exact pressed button/section when landing becomes active
  useEffect(() => {
    if (activeTab !== 'landing') return

    const savedAnchor = sessionStorage.getItem('banda_landing_scroll_anchor')
    const savedSection = sessionStorage.getItem('banda_landing_scroll_section')
    const savedYStr = sessionStorage.getItem('banda_landing_scroll_y')
    if (!savedAnchor && !savedSection && !savedYStr) return

    const targetY = savedYStr ? parseFloat(savedYStr) : null

    const performScrollRestore = () => {
      const targetEl = savedAnchor
        ? (document.getElementById(savedAnchor) || document.querySelector(`[data-scroll-anchor="${savedAnchor}"]`))
        : null
      const targetSec = savedSection ? document.getElementById(savedSection) : null
      const finalTarget = (targetEl || targetSec) as HTMLElement | null

      if (finalTarget) {
        finalTarget.scrollIntoView({ behavior: 'auto', block: 'center' })
        return true
      } else if (targetY !== null && !isNaN(targetY)) {
        window.scrollTo({ top: targetY, behavior: 'auto' })
        return true
      }
      return false
    }

    // Attempt immediately and across short intervals to ensure the page is centered on the button
    performScrollRestore()
    const t1 = setTimeout(performScrollRestore, 30)
    const t2 = setTimeout(performScrollRestore, 100)
    const t3 = setTimeout(performScrollRestore, 250)
    const t4 = setTimeout(() => {
      performScrollRestore()
      sessionStorage.removeItem('banda_landing_scroll_anchor')
      sessionStorage.removeItem('banda_landing_scroll_section')
      sessionStorage.removeItem('banda_landing_scroll_y')
    }, 450)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [activeTab])

  // 3. Smooth native anchor link clicks (e.g. href="#wisata", href="#peta")
  useEffect(() => {
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
  }, [])

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-start bg-[#f7f5f0] text-[#0f2c59] selection:bg-[#f4b75e] selection:text-[#081d35] overflow-x-clip pb-16 lg:pb-0">
      {/* 1. Hero & Navbar Section */}
      <HeroSection
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        currentUser={currentUser}
        onLogout={onLogout}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* 3. Interactive Spatial Map Section */}
      <div className="w-full">
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
      <div className="w-full">
        <TourismSawSection
          onNavigate={onNavigate}
        />
      </div>

      {/* 6. Island Stays & Eco-Lodges Directory */}
      <div className="w-full">
        <EcoStayCatalogSection
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          onOpenQuickLogin={onOpenQuickLogin}
        />
      </div>

      {/* 7. Resident Services & Digital Island Ecosystem */}
      <div className="w-full">
        <EcosystemFeaturesSection
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          currentUser={currentUser}
        />
      </div>

      {/* 8. Verified Blockchain Marketplace & Local UMKM */}
      <div className="w-full">
        <TraceabilityMarketplaceSection
          onNavigate={onNavigate}
          onOpenMarketplace={onOpenMarketplace}
          onPublicVerify={onPublicVerify}
        />
      </div>

      {/* 9. Demographics & Island Vitality Stats */}
      <div className="w-full">
        <SustainableTravelSection
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          currentUser={currentUser}
        />
      </div>

      {/* 10. Plan Your Visit CTA */}
      <div className="w-full">
        <PlanYourVisitSection
          onNavigate={onNavigate}
        />
      </div>

      {/* 11. Comprehensive Ecosystem Footer */}
      <div className="w-full">
        <LandingFooterSection
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          onOpenQuickLogin={onOpenQuickLogin}
          setActiveNav={setActiveNav}
        />
      </div>

      {/* 12. Floating Tourism Recommendation Chatbot Bubble */}
      <TourismChatbotBubble onNavigate={onNavigate} />

      {/* 13. Mobile App Bottom Navigation Bar (Capacitor & Mobile DevTools Viewport) */}
      <MobileBottomNav
        activeTab={activeTab}
        externalActiveNav={activeNav}
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        currentUser={currentUser}
        onOpenMarketplace={onOpenMarketplace}
      />
    </div>
  )
}

export default BandanairaBeranda
