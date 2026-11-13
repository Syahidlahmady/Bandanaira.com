import React, { useState } from 'react'
import {
  HeroSection,
  PanoramaIslandSection,
  PetaInteractiveSection,
  HeritageSpiceSection,
  TourismSawSection,
  EcoStayCatalogSection,
  EcosystemFeaturesSection,
  TraceabilityMarketplaceSection,
  SustainableTravelSection,
  PlanYourVisitSection,
  LandingFooterSection,
} from '../../components/landing'

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

export interface BandanairaBerandaProps {
  onNavigate: (tab: NavTabType) => void
  onOpenLogin: () => void
  onOpenRegister?: () => void
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
  onOpenRegister,
  onOpenMarketplace,
  onPublicVerify,
  currentUser,
  onLogout,
  onOpenQuickLogin,
}) => {
  const [activeNav, setActiveNav] = useState<string>('#beranda')

  return (
    <div className="flex min-h-screen w-full flex-col items-start bg-[#f7f5f0] text-[#0f2c59] selection:bg-[#f4b75e] selection:text-[#081d35]">
      {/* 1. Hero & Navbar Section */}
      <HeroSection
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        currentUser={currentUser}
        onLogout={onLogout}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* 2. Island Introduction & Panorama Section */}
      <PanoramaIslandSection />

      {/* 3. Interactive Spatial Map Section */}
      <PetaInteractiveSection
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* 4. Spice Heritage & Cultural Sites Section */}
      <HeritageSpiceSection
        onNavigate={onNavigate}
      />

      {/* 5. Marine & Heritage Tourism with SAW Recommender */}
      <TourismSawSection
        onNavigate={onNavigate}
      />

      {/* 6. Island Stays & Eco-Lodges Directory */}
      <EcoStayCatalogSection
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenQuickLogin={onOpenQuickLogin}
      />

      {/* 7. Resident Services & Digital Island Ecosystem */}
      <EcosystemFeaturesSection
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        currentUser={currentUser}
      />

      {/* 8. Verified Blockchain Marketplace & Local UMKM */}
      <TraceabilityMarketplaceSection
        onNavigate={onNavigate}
        onOpenMarketplace={onOpenMarketplace}
        onPublicVerify={onPublicVerify}
      />

      {/* 9. Sustainable Travel Guidelines */}
      <SustainableTravelSection />

      {/* 10. Plan Your Visit CTA */}
      <PlanYourVisitSection
        onNavigate={onNavigate}
      />

      {/* 11. Comprehensive Ecosystem Footer */}
      <LandingFooterSection
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenQuickLogin={onOpenQuickLogin}
        setActiveNav={setActiveNav}
      />
    </div>
  )
}

export default BandanairaBeranda
