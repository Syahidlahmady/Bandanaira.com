import React from 'react'
import bandaCinematicVideoBackdrop from '../../assets/image.webp'
import { ArrowUpRightIcon } from './LandingIcons'
import { setPreferredTourismSubTab } from '../../services/tourism'

export interface PlanYourVisitSectionProps {
  onNavigate: (tab: any) => void
}

export const PlanYourVisitSection: React.FC<PlanYourVisitSectionProps> = ({ onNavigate }) => {
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
          SUTAN SJAHRIR &bull; BANDA NEIRA 1936
        </span>
        <span className="w-4 sm:w-8 relative h-px bg-[#f4b75e]" aria-hidden="true" />
      </div>

      {/* Legendary Quote in Intro Script cursive */}
      <h2
        id="plan-your-visit-heading"
        className="relative z-10 max-w-4xl font-script font-normal text-amber-200 text-4xl sm:text-7xl lg:text-8xl leading-[1.18] tracking-wide drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] px-2 sm:px-4"
      >
        &ldquo;Jangan mati sebelum ke Banda Neira!&rdquo;
      </h2>


      {/* Action buttons */}
      <div className="inline-flex flex-wrap justify-center items-center gap-4 pt-4 relative z-10">
        <button
          type="button"
          onClick={() => {
            setPreferredTourismSubTab('destinations')
            onNavigate('tourism')
          }}
          className="inline-flex h-[50px] items-center gap-3 px-7 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-amber-600/30 group"
          aria-label="Jelajahi Banda sekarang"
        >
          <span>Jelajahi Banda Sekarang</span>
          <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('gis')}
          className="inline-flex h-[50px] items-center gap-3 px-6 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold tracking-wide transition-all"
          aria-label="Buka peta interaktif Banda"
        >
          <span>Buka Peta Interaktif</span>
          <ArrowUpRightIcon className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}

export default PlanYourVisitSection
