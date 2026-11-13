import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

export const defaultHeritageThemes = [
  'Benteng & arsitektur',
  'Jalur rempah',
  'Cerita masyarakat',
]

export interface HeritageSpiceSectionProps {
  onNavigate: (tab: any) => void
  themes?: string[]
}

export const HeritageSpiceSection: React.FC<HeritageSpiceSectionProps> = ({
  onNavigate,
  themes = defaultHeritageThemes,
}) => {
  return (
    <section
      id="sejarah"
      aria-labelledby="heritage-heading"
      className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-24 relative self-stretch w-full flex-[0_0_auto] bg-[#081d35]"
    >
      <figure className="flex flex-col w-full lg:w-[600px] items-start relative shrink-0">
        <div className="relative w-full h-[380px] sm:h-[510px] overflow-hidden rounded-xl">
          <img
            className="w-full h-full object-cover"
            alt="Benteng Belgica overlooking the sea in Banda Neira"
            src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=85"
            loading="lazy"
            decoding="async"
          />
          <div
            className="inline-flex flex-col items-start gap-1 px-6 py-5 absolute bottom-6 left-6 bg-[#081d35d9] backdrop-blur-sm rounded-lg border border-[#ffffff24] overflow-hidden"
            aria-label="177 cultural heritage sites"
          >
            <span className="relative w-fit mt-[-1.00px] font-serif font-normal text-[#f4b75e] text-5xl sm:text-6xl tracking-[0] leading-[60px] whitespace-nowrap">
              177
            </span>
            <span className="relative w-fit font-normal text-white text-[11px] tracking-[1.00px] leading-[normal] whitespace-nowrap">
              SITUS CAGAR BUDAYA
            </span>
          </div>
        </div>
        <figcaption className="flex items-start justify-between pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <span className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
            Benteng Belgica, Banda Neira
          </span>
          <span className="relative w-fit mt-[-1.00px] font-normal text-[#f4b75e] text-[10px] tracking-[1.20px] leading-[normal] whitespace-nowrap">
            JEJAK KEPULAUAN REMPAH
          </span>
        </figcaption>
      </figure>

      <div className="flex flex-col items-start gap-6 relative flex-1 grow">
        <div
          className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
          aria-label="Section category"
        >
          <span className="w-6 relative h-px bg-[#f4b75e]" aria-hidden="true" />
          <span className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            SEJARAH YANG MASIH HIDUP
          </span>
        </div>

        <h2
          id="heritage-heading"
          className="font-medium text-white text-[38px] sm:text-[52px] tracking-[-2.00px] leading-[1.12] sm:leading-[58.2px] relative self-stretch"
        >
          Pulau kecil.
          <br />
          Jejak besar dalam
          <br />
          sejarah dunia.
        </h2>

        <p className="text-[#c1ced8] text-base leading-7 relative self-stretch font-normal tracking-[0]">
          Dari kebun pala hingga benteng di tepi laut, Banda menyimpan kisah
          kejayaan perdagangan rempah dunia. Di balik setiap bangunan, ada
          cerita tentang perjumpaan, perjuangan, dan kehidupan yang terus
          tumbuh.
        </p>

        <ul
          className="flex flex-wrap items-start gap-8 px-0 py-5 relative self-stretch w-full flex-[0_0_auto] border-t border-b border-[#ffffff38]"
          aria-label="Heritage topics"
        >
          {themes.map((theme) => (
            <li
              key={theme}
              className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap"
            >
              ✦ {theme}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onNavigate('tourism')}
          className="bg-amber-600 hover:bg-amber-500 transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
          aria-label="Telusuri sejarah Banda"
        >
          <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
            Telusuri sejarah Banda
          </span>
          <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
        </button>
      </div>
    </section>
  )
}

export default HeritageSpiceSection
