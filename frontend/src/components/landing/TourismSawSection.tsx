import React, { useState, useRef } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { setPreferredTourismSubTab, TourismSubTab } from '../../services/tourism'
import { useLanguage } from '../../context/LanguageContext'

export interface PublicSawDestination {
  id: string
  name: string
  island: string
  category: 'Bahari & Selam' | 'Sejarah & Benteng' | 'Alam & Rempah'
  costRp: number
  travelMinutes: number
  facilityScore: number
  attractionScore: number
  description: string
  highlights: string[]
  image: string
  guideWhatsapp: string
}

export const PUBLIC_SAW_DESTINATIONS: PublicSawDestination[] = [
  {
    id: 'saw-1',
    name: 'Taman Laut Lava Flow Banda Api',
    island: 'Banda Api',
    category: 'Bahari & Selam',
    costRp: 150000,
    travelMinutes: 15,
    facilityScore: 88,
    attractionScore: 98,
    description:
      'Koloni karang meja raksasa yang tumbuh subur di atas aliran lava letusan 1988 dengan visibilitas air hingga 30 meter.',
    highlights: ['Snorkeling & Scuba', 'Karang Vulkanik', '15 Menit Perahu'],
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567891',
  },
  {
    id: 'saw-2',
    name: 'Benteng Belgica & Nassau (UNESCO Trail)',
    island: 'Pulau Neira',
    category: 'Sejarah & Benteng',
    costRp: 35000,
    travelMinutes: 8,
    facilityScore: 95,
    attractionScore: 96,
    description:
      'Benteng berarsitektur pentagon utuh abad ke-17 yang bertengger gagah menghadap Teluk Banda dan siluet Gunung Api.',
    highlights: ['Cagar Budaya Nasional', 'Arsitektur Pentagon', 'Spot Sunset Terbaik'],
    image:
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567892',
  },
  {
    id: 'saw-3',
    name: 'Pantai & Wall Diving Pulau Hatta',
    island: 'Pulau Hatta',
    category: 'Bahari & Selam',
    costRp: 250000,
    travelMinutes: 45,
    facilityScore: 86,
    attractionScore: 97,
    description:
      'Tebing bawah laut bertaraf dunia dengan terumbu karang terjaga, kawanan lumba-lumba liar, dan pasir putih lembut.',
    highlights: ['Wall Drop-Off', 'Penyu & Lumba-lumba', 'Eco-Stay Pesisir'],
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567893',
  },
  {
    id: 'saw-4',
    name: 'Rumah Pengasingan Bung Hatta & Sjahrir',
    island: 'Pulau Neira',
    category: 'Sejarah & Benteng',
    costRp: 25000,
    travelMinutes: 5,
    facilityScore: 94,
    attractionScore: 93,
    description:
      'Museum hidup saksi bisu para bapak bangsa merumuskan gagasan kemerdekaan Indonesia sembari mengajar anak-anak Banda.',
    highlights: ['Museum Kemerdekaan', 'Koleksi Asli 1936', 'Pusat Kota Neira'],
    image:
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567892',
  },
  {
    id: 'saw-5',
    name: 'Pendakian Kaldera Gunung Banda Api (656 mdpl)',
    island: 'Banda Api',
    category: 'Alam & Rempah',
    costRp: 200000,
    travelMinutes: 25,
    facilityScore: 78,
    attractionScore: 95,
    description:
      'Jalur pendakian memacu adrenalin menuju bibir kawah aktif dengan panorama 360 derajat seluruh gugusan Kepulauan Banda.',
    highlights: ['Trekking Sunrise', 'Kawah Vulkanik Aktif', 'Pemandu Resmi'],
    image: '/images/landmarks/gunung-api-portrait.webp',
    guideWhatsapp: '6281234567894',
  },
  {
    id: 'saw-6',
    name: 'Agrowisata Perkebunan Pala Pusaka Lonthoir',
    island: 'Banda Besar',
    category: 'Alam & Rempah',
    costRp: 75000,
    travelMinutes: 20,
    facilityScore: 89,
    attractionScore: 92,
    description:
      'Menyusuri naungan kanopi kenari raksasa dan kebun pala berumur ratusan tahun bersama kelompok tani adat Lonthoir.',
    highlights: ['Wisata Petik Pala', 'Benteng Hollandia', 'Sumur Keramat'],
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567895',
  },
  {
    id: 'saw-7',
    name: 'Eksplorasi Pulau Ai & Benteng Revenge',
    island: 'Pulau Ai',
    category: 'Bahari & Selam',
    costRp: 220000,
    travelMinutes: 40,
    facilityScore: 84,
    attractionScore: 94,
    description:
      'Laguna air kristal turkois, situs bersejarah Benteng Revenge VOC, dan titik snorkeling berenang bersama hiu karang jinak.',
    highlights: ['Benteng Revenge VOC', 'Laguna Karang Kristal', 'Hiu Karang Karang'],
    image:
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567896',
  },
  {
    id: 'saw-8',
    name: 'Pulau Rhun (Traktat Bersejarah Manhattan 1667)',
    island: 'Pulau Rhun',
    category: 'Sejarah & Benteng',
    costRp: 280000,
    travelMinutes: 60,
    facilityScore: 81,
    attractionScore: 96,
    description:
      'Pulau penghasil pala legendaris yang ditukar Inggris dengan pulau Manhattan New York dalam Traktat Breda 1667.',
    highlights: ['Traktat Breda 1667', 'Desa Pesisir Tenang', 'Situs Sejarah Dunia'],
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567897',
  },
]

export interface TourismSawSectionProps {
  onNavigate: (tab: any) => void
}

export const TourismSawSection: React.FC<TourismSawSectionProps> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const activeDest = PUBLIC_SAW_DESTINATIONS[activeIndex]

  const openTourismSubTab = (subTab: TourismSubTab) => {
    setPreferredTourismSubTab(subTab)
    onNavigate('tourism')
  }

  const handlePrev = () => {
    const nextIdx = activeIndex === 0 ? PUBLIC_SAW_DESTINATIONS.length - 1 : activeIndex - 1
    setActiveIndex(nextIdx)
    scrollToCard(nextIdx)
  }

  const handleNext = () => {
    const nextIdx = activeIndex === PUBLIC_SAW_DESTINATIONS.length - 1 ? 0 : activeIndex + 1
    setActiveIndex(nextIdx)
    scrollToCard(nextIdx)
  }

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = 320
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section
      id="wisata"
      aria-labelledby="tourism-routes-heading"
      className="relative w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#071322] text-white overflow-hidden"
    >
      {/* Subtle decorative cultural motif / backdrop ambient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 right-0 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-16">
        {/* Left Column: Spotlight Editorial Controller (Ala indonesia.travel) */}
        <div className="flex flex-col justify-between items-start w-full lg:w-[42%] lg:max-w-[460px] flex-shrink-0 z-10">
          <div>
            {/* Spotlight uppercase tracking tag */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <p className="font-sans text-[11px] font-bold tracking-[0.25em] text-amber-400 uppercase">
                {t.tourismSaw.tagline}
              </p>
            </div>

            {/* Display Headline with Nexa Pro + Intro Script */}
            <h2
              id="tourism-routes-heading"
              className="font-sans font-bold text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] tracking-tight text-white mb-5"
            >
              {t.tourismSaw.headingPrefix}{' '}
              <span className="font-script text-amber-300 font-normal text-4xl sm:text-5xl lg:text-[52px] inline-block tracking-normal ml-1">
                {t.tourismSaw.headingScript}
              </span>{' '}
              {t.tourismSaw.headingSuffix}
            </h2>

            {/* Dynamic Editorial Paragraph for the currently highlighted destination */}
            <div className="min-h-[85px] mb-6">
              <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed">
                {activeDest.description}
              </p>
            </div>

            {/* Action Buttons: Pill style in balanced row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8 w-full sm:w-auto">
              <button
                type="button"
                id="btn-tourism-explore-all"
                data-scroll-anchor="btn-tourism-explore-all"
                onClick={() => openTourismSubTab('destinations')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-[#071322] text-white text-xs font-semibold tracking-wide transition-all duration-200 group cursor-pointer"
              >
                <span>{t.tourismSaw.exploreAllBtn}</span>
                <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                type="button"
                id="btn-tourism-smart-planner"
                data-scroll-anchor="btn-tourism-smart-planner"
                onClick={() => onNavigate('smart_planner')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <span>{t.tourismSaw.smartPlannerBtn}</span>
              </button>
            </div>
          </div>

          {/* Bottom Pagination & Arrow Controls (Identical to indonesia.travel) */}
          <div className="w-full pt-6 border-t border-white/10 flex flex-col gap-4">
            {/* Progress line */}
            <div className="w-full h-[2px] bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${((activeIndex + 1) / PUBLIC_SAW_DESTINATIONS.length) * 100}%`,
                }}
              />
            </div>

            {/* Counter + Arrow Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-bold text-white tracking-wider">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-slate-400">
                  / {String(PUBLIC_SAW_DESTINATIONS.length).padStart(2, '0')}
                </span>
                <span className="ml-2 sm:ml-3 text-[11px] sm:text-xs text-amber-300/80 font-sans tracking-wide truncate max-w-[130px] sm:max-w-xs">
                  {activeDest.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label={t.tourismSaw.prevDest}
                  className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={t.tourismSaw.nextDest}
                  className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tall Spotlight Showcase Cards (Horizontal Overflow Carousel) */}
        <div className="w-full lg:w-[58%] overflow-hidden relative">
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PUBLIC_SAW_DESTINATIONS.map((dest, idx) => {
              const isActive = idx === activeIndex

              return (
                <div
                  key={dest.id}
                  onClick={() => {
                    setActiveIndex(idx)
                    scrollToCard(idx)
                  }}
                  className={`group relative flex-shrink-0 w-[78vw] sm:w-[310px] aspect-[4/5] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden cursor-pointer snap-start transition-all duration-300 select-none ${
                    isActive
                      ? 'ring-2 ring-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.25)] scale-[1.01] sm:scale-[1.02]'
                      : 'opacity-70 hover:opacity-100 hover:scale-[0.99] border border-white/10'
                  }`}
                >
                  {/* Photo with zoom on hover */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Bottom Gradient Scrim & Typography */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/50 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase mb-1">
                      {dest.island}
                    </span>
                    <h3 className="font-sans font-bold text-lg sm:text-xl text-white leading-snug mb-2 group-hover:text-amber-300 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="font-sans text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                      {dest.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/15">
                      {dest.highlights.slice(0, 2).map((hl) => (
                        <span
                          key={hl}
                          className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-md"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TourismSawSection
