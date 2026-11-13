import React from 'react'

export interface TravelGuidelineItem {
  title: string
  description: string
  iconType: 'waves' | 'culture' | 'leaf'
}

export const defaultTravelGuidelines: TravelGuidelineItem[] = [
  {
    title: 'Jaga lautnya',
    description: 'Biarkan karang dan biota tetap di habitatnya.',
    iconType: 'waves',
  },
  {
    title: 'Hormati budayanya',
    description: 'Kenali adat dan hargai ruang hidup warga.',
    iconType: 'culture',
  },
  {
    title: 'Pilih yang lokal',
    description: 'Singgah, belanja, dan tumbuh bersama pulau.',
    iconType: 'leaf',
  },
]

export interface SustainableTravelSectionProps {
  guidelines?: TravelGuidelineItem[]
}

export const SustainableTravelSection: React.FC<SustainableTravelSectionProps> = ({
  guidelines = defaultTravelGuidelines,
}) => {
  return (
    <section
      aria-labelledby="sustainable-travel-title"
      className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16 px-6 sm:px-12 lg:px-20 py-[52px] relative self-stretch w-full flex-[0_0_auto] bg-[#eaf0ed]"
    >
      <div className="flex flex-col max-w-[355px] items-start gap-4 relative shrink-0">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
          <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            DATANG SEBAGAI TAMU
          </p>
        </div>
        <h2
          id="sustainable-travel-title"
          className="font-serif font-normal italic text-[#0f2c59] text-[34px] sm:text-[38px] tracking-[0] leading-[41.8px] relative self-stretch"
        >
          Tinggalkan kenangan,
          <br />
          bukan jejak.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative flex-1 w-full">
        {guidelines.map((guideline) => (
          <article
            key={guideline.title}
            className="flex-col gap-3 flex items-start relative flex-1 grow"
          >
            <div aria-hidden="true" className="text-amber-600 text-xl">
              {guideline.iconType === 'waves' && '≈'}
              {guideline.iconType === 'culture' && '🏛️'}
              {guideline.iconType === 'leaf' && '✦'}
            </div>
            <h3 className="relative w-fit font-semibold text-[#0f2c59] text-sm tracking-[0] leading-[normal]">
              {guideline.title}
            </h3>
            <p className="text-[#63717d] text-xs leading-[20.4px] relative self-stretch font-normal tracking-[0]">
              {guideline.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SustainableTravelSection
