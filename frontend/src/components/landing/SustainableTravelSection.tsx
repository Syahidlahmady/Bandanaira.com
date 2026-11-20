import React from 'react'
import AnimatedNumber from '../ui/AnimatedNumber'
import { useLanguage } from '../../context/LanguageContext'

export interface SustainableTravelSectionProps {
  onNavigate?: (tab: any) => void
  onOpenLogin?: () => void
  currentUser?: any
}

export const SustainableTravelSection: React.FC<SustainableTravelSectionProps> = () => {
  const { t } = useLanguage()

  return (
    <section
      id="penduduk-fasilitas"
      aria-label="Statistik Demografi Kepulauan Banda"
      className="w-full py-12 sm:py-16 px-6 sm:px-12 lg:px-20 bg-[#07192f] text-white border-y border-white/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={7} />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              {t.demographics.inhabitedIslands}
            </p>
          </div>

          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={11} />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              {t.demographics.archipelagoVillages}
            </p>
          </div>

          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={21000} suffix="+" />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              {t.demographics.totalPopulation}
            </p>
          </div>

          <div>
            <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2">
              <AnimatedNumber value={1} />
            </div>
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
              {t.demographics.integratedEcosystem}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SustainableTravelSection
