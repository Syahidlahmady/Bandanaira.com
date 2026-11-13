import React from 'react'
import bandaCinematicVideoBackdrop from '../../assets/image.webp'
import { ArrowUpRightIcon } from './LandingIcons'

export interface PlanYourVisitSectionProps {
  onNavigate: (tab: any) => void
}

export const PlanYourVisitSection: React.FC<PlanYourVisitSectionProps> = ({ onNavigate }) => {
  return (
    <section
      className="flex flex-col min-h-[450px] items-center justify-center gap-6 px-6 sm:px-12 lg:px-20 py-[72px] relative self-stretch w-full bg-[#081d35] overflow-hidden"
      aria-labelledby="plan-your-visit-heading"
    >
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="Pemandangan pulau Banda saat senja"
        src={bandaCinematicVideoBackdrop}
      />
      <div
        className="absolute inset-0 w-full h-full bg-[#081d35c8]"
        aria-hidden="true"
      />

      <div className="inline-flex items-center gap-2.5 relative z-10 flex-[0_0_auto]">
        <span className="w-6 relative h-px bg-[#f4b75e]" aria-hidden="true" />
        <span className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
          PERJALANANMU DIMULAI DI SINI
        </span>
      </div>

      <h2
        id="plan-your-visit-heading"
        className="self-stretch font-medium text-white text-[36px] sm:text-[56px] text-center tracking-[-2.30px] relative z-10 leading-[1.1]"
      >
        Banda menanti. Apa ceritamu?
      </h2>

      <p className="relative z-10 max-w-[660px] font-normal text-[#c1ced8] text-base text-center tracking-[0] leading-[27.2px]">
        Temukan tempat yang ingin kamu datangi, kisah yang ingin kamu dengar,
        dan kehidupan pulau yang ingin kamu kenal.
      </p>

      <div className="inline-flex flex-wrap justify-center items-start gap-3 pt-2 pb-0 px-0 relative z-10 flex-[0_0_auto]">
        <button
          type="button"
          onClick={() => onNavigate('tourism')}
          className="inline-flex h-[54px] items-center gap-4 px-6 py-0 relative flex-[0_0_auto] bg-amber-600 hover:bg-amber-500 transition-colors rounded-lg overflow-hidden border border-solid border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
          aria-label="Jelajahi Banda sekarang"
        >
          <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
            Jelajahi Banda sekarang
          </span>
          <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('gis')}
          className="flex-[0_0_auto] border-[#ffffff38] bg-[#081d3566] hover:bg-[#ffffff1a] transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
          aria-label="Buka peta Banda"
        >
          <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
            Buka peta
          </span>
          <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
        </button>
      </div>
    </section>
  )
}

export default PlanYourVisitSection
