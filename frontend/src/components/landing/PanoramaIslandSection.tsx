import React from 'react'

export interface IntroductionItem {
  title: string
  description: string
  iconType: 'compass' | 'heritage' | 'community'
}

export const defaultIntroductionItems: IntroductionItem[] = [
  {
    title: 'Jelajahi pulau',
    description: 'Temukan laut, sejarah, dan tempat singgah.',
    iconType: 'compass',
  },
  {
    title: 'Kenali warisannya',
    description: 'Baca kisah di balik 177 situs cagar budaya.',
    iconType: 'heritage',
  },
  {
    title: 'Dukung kehidupan lokal',
    description: 'Terhubung dengan warga dan usaha pulau.',
    iconType: 'community',
  },
]

export interface PanoramaIslandSectionProps {
  items?: IntroductionItem[]
}

export const PanoramaIslandSection: React.FC<PanoramaIslandSectionProps> = ({
  items = defaultIntroductionItems,
}) => {
  return (
    <section
      aria-labelledby="island-introduction-title"
      className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-16 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
    >
      <header className="flex flex-col max-w-[430px] items-start gap-[18px] relative">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
          <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            BANDA SMART TOURISM &amp; ISLAND ECOSYSTEM
          </p>
        </div>
        <h2
          id="island-introduction-title"
          className="relative self-stretch font-medium text-[#0f2c59] text-[28px] sm:text-[31px] tracking-[-1.00px] leading-[38.8px]"
        >
          Bukan sekadar destinasi. Sebuah kehidupan yang terhubung.
        </h2>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-[30px] relative flex-1 w-full">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-start gap-3.5 relative flex-1 grow"
          >
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
              {item.iconType === 'compass' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              )}
              {item.iconType === 'heritage' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                </svg>
              )}
              {item.iconType === 'community' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            </div>
            <h3 className="relative self-stretch font-semibold text-[#0f2c59] text-[15px] tracking-[0] leading-[normal]">
              {item.title}
            </h3>
            <p className="relative self-stretch font-normal text-[#63717d] text-[13px] tracking-[0] leading-[21.4px]">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PanoramaIslandSection
