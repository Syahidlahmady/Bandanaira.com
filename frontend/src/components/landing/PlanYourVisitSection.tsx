import React from 'react'
import bandaCinematicVideoBackdrop from '../../assets/image.webp'
import { ArrowUpRightIcon } from './LandingIcons'
import { setPreferredTourismSubTab } from '../../services/tourism'
import { useLanguage } from '../../context/LanguageContext'

export interface PlanYourVisitSectionProps {
  onNavigate: (tab: any) => void
}

export const PlanYourVisitSection: React.FC<PlanYourVisitSectionProps> = ({ onNavigate }) => {
  const { t } = useLanguage()

  return (
    <section
      className="flex flex-col min-h-[500px] items-center justify-center gap-6 px-6 sm:px-12 lg:px-20 py-[80px] relative self-stretch w-full bg-[#081d35] overflow-hidden text-center"
      aria-labelledby="plan-your-visit-heading"
    >
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="Pemandangan pulau Banda saat senja"
        src={bandaCinematicVideoBackdrop}
        loading="lazy"
        decoding="async"
      />
      {/* Cinematic dark scrim overlay */}
      <div
        className="absolute inset-0 w-full h-full bg-[#071426]/85 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {/* Decorative tag / Attribution */}
      <div className="inline-flex items-center gap-2 sm:gap-3 relative z-10 flex-[0_0_auto]">
        <span className="w-4 sm:w-8 relative h-px bg-[#f4b75e]" aria-hidden="true" />
        <span className="font-sans font-bold text-[#f4b75e] text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] uppercase whitespace-nowrap">
          {t.planYourVisit.quoteAuthor}
        </span>
        <span className="w-4 sm:w-8 relative h-px bg-[#f4b75e]" aria-hidden="true" />
      </div>

      {/* Legendary Quote in Intro Script cursive */}
      <h2
        id="plan-your-visit-heading"
        className="relative z-10 max-w-4xl font-script font-normal text-amber-200 text-4xl sm:text-7xl lg:text-8xl leading-[1.18] tracking-wide drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] px-2 sm:px-4"
      >
        {t.planYourVisit.quote}
      </h2>

      {/* Action buttons: Balanced Row on Mobile & Desktop */}
      <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-4 relative z-10 w-full max-w-md sm:max-w-none">
        <button
          type="button"
          onClick={() => {
            setPreferredTourismSubTab('destinations')
            onNavigate('tourism')
          }}
          className="flex-1 sm:flex-initial inline-flex h-[46px] sm:h-[50px] items-center justify-center gap-2 sm:gap-3 px-5 sm:px-7 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-amber-600/30 group cursor-pointer"
          aria-label={t.planYourVisit.exploreBtn}
        >
          <span>{t.planYourVisit.exploreBtn}</span>
          <ArrowUpRightIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('gis')}
          className="flex-1 sm:flex-initial inline-flex h-[46px] sm:h-[50px] items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer"
          aria-label={t.planYourVisit.openMapBtn}
        >
          <span>{t.planYourVisit.openMapBtn}</span>
          <ArrowUpRightIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>
      </div>
    </section>
  )
}

export default PlanYourVisitSection
