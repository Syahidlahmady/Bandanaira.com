import React from 'react'
import { InteractiveMapWorkspace } from '../../views/InteractiveMapWorkspace'
import { ArrowUpRightIcon } from './LandingIcons'

export interface PetaInteractiveSectionProps {
  onNavigate: (tab: any) => void
  currentUser: any
}

export const PetaInteractiveSection: React.FC<PetaInteractiveSectionProps> = ({
  onNavigate,
  currentUser,
}) => {
  return (
    <section
      id="peta"
      className="flex flex-col items-start gap-[32px] pt-12 pb-20 px-6 sm:px-12 lg:px-20 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col max-w-[700px] items-start gap-[18px] relative">
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <div className="relative w-6 h-px bg-amber-600" />
            <span className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
              PETA EKSPLORASI SPASIAL
            </span>
          </div>
          <h2 className="relative self-stretch font-medium text-[#0f2c59] text-[36px] sm:text-[50px] tracking-[-2.00px] leading-[1.12]">
            Banda, dari sudut pandang baru.
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="inline-flex h-10 items-center gap-2 px-5 bg-[#081d35] hover:bg-[#0f2c59] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <span>Layar Penuh Peta</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full min-h-[640px] rounded-2xl overflow-hidden border border-[#dce1df] shadow-md bg-white p-4 sm:p-6">
        <InteractiveMapWorkspace currentUser={currentUser} />
      </div>
    </section>
  )
}

export default PetaInteractiveSection
