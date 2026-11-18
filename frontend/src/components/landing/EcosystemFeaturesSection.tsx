import React from 'react'
import AnimatedNumber from '../ui/AnimatedNumber'

export interface EcosystemFeaturesSectionProps {
  onNavigate?: (tab: any) => void
  onOpenLogin?: () => void
  currentUser?: any
}

export const EcosystemFeaturesSection: React.FC<EcosystemFeaturesSectionProps> = () => {
  return (
    <section
      id="infografis-wisata"
      aria-label="Statistik Destinasi Banda"
      className="w-full py-12 sm:py-16 px-6 sm:px-12 lg:px-20 bg-[#081d35] text-white border-y border-white/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={22} />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Wisata Sejarah
            </p>
          </div>

          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={20} />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Wisata Alam
            </p>
          </div>

          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={42} />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Total Destinasi
            </p>
          </div>

          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={30} suffix="+" />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Penginapan
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EcosystemFeaturesSection
