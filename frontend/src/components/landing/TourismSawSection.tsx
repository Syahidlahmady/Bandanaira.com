import React, { useState, useRef, useEffect } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { setPreferredTourismSubTab, TourismSubTab } from '../../services/tourism'
import { useLanguage } from '../../context/LanguageContext'

export interface BandaVisualReelItem {
  id: string
  title: string
  subtitle: string
  location: string
  aspectLabel: string
  isAnimatedWebp: boolean
  src: string
  posterSrc: string
  caption: string
}

export const BANDA_PORTRAIT_REELS: BandaVisualReelItem[] = [
  {
    id: 'reel-pohon-sejuta-umat',
    title: 'Teduhnya Pohon Sejuta Umat',
    subtitle: 'Reels 9:16 · 15fps Motion WebP',
    location: 'Benteng Lonthoir, Banda Besar',
    aspectLabel: '9:16 LIVE MOTION',
    isAnimatedWebp: true,
    src: '/images/media/pohon-sejuta-umat-motion.webp',
    posterSrc: '/images/landmarks/pohon-sejuta-umat.webp',
    caption:
      'Suasana angin sepoi di bawah naungan Pohon Sejuta Umat menghadap langsung ke kerucut Gunung Api Banda dan perairan hijau turkois Selat Zonnegat.',
  },
  {
    id: 'reel-sunset-pelabuhan',
    title: 'Senja Keemasan Pelabuhan Neira',
    subtitle: 'Reels 9:16 · 15fps Motion WebP',
    location: 'Pelabuhan Bandanaira',
    aspectLabel: '9:16 LIVE MOTION',
    isAnimatedWebp: true,
    src: '/images/media/sunset-pelabuhan-gunung-api.webp',
    posterSrc: '/images/landmarks/pelabuhan.jpg',
    caption:
      'Momen matahari terbenam di balik siluet megah Gunung Api Banda yang memantulkan cahaya keemasan di sepanjang dermaga Pelabuhan Bandanaira.',
  },
  {
    id: 'portrait-gunung-api',
    title: 'Siluet Agung Gunung Banda Api',
    subtitle: 'Potret Vertikal · 3024×4032',
    location: 'Selat Neira (656 mdpl)',
    aspectLabel: '3:4 PORTRAIT',
    isAnimatedWebp: false,
    src: '/images/landmarks/gunung-api-portrait.webp',
    posterSrc: '/images/landmarks/gunung-api-portrait.webp',
    caption:
      'Bingkai alami dedaunan pesisir memagari kemegahan Gunung Api Banda dari seberang selat yang tenang.',
  },
]

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
  const [reelsInView, setReelsInView] = useState(false)
  const [selectedReelModal, setSelectedReelModal] = useState<BandaVisualReelItem | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const reelsSectionRef = useRef<HTMLDivElement>(null)

  const activeDest = PUBLIC_SAW_DESTINATIONS[activeIndex]

  // Viewport gating for 11-14MB animated WebP reels so FCP/LCP on initial load is never blocked
  useEffect(() => {
    const el = reelsSectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReelsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '80px', threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-16">
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

            {/* Action Buttons: Pill style */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => openTourismSubTab('destinations')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-[#071322] text-white text-xs font-semibold tracking-wide transition-all duration-200 group cursor-pointer"
              >
                <span>{t.tourismSaw.exploreAllBtn}</span>
                <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('smart_planner')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-xs font-semibold transition-all duration-200 cursor-pointer"
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
                <span className="ml-3 text-xs text-amber-300/80 font-sans tracking-wide">
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
                  className={`group relative flex-shrink-0 w-[270px] sm:w-[310px] aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer snap-start transition-all duration-300 select-none ${
                    isActive
                      ? 'ring-2 ring-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.25)] scale-[1.02]'
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

      {/* 9:16 Visual Reels & Portrait Moments Strip (Viewport-Gated for FCP/LCP Protection) */}
      <div
        ref={reelsSectionRef}
        className="relative max-w-7xl mx-auto mt-16 pt-12 border-t border-white/10"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-sans text-[11px] font-bold tracking-[0.22em] text-amber-400 uppercase">
                REELS &amp; POTRET VERTIKAL 9:16 · @NEIRABASUDARA
              </span>
            </div>
            <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white">
              Momen Hidup dari{' '}
              <span className="font-script font-normal text-amber-300 text-3xl sm:text-4xl ml-1">
                Sudut Kepulauan
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => openTourismSubTab('community_literacy')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-amber-400 hover:text-[#071322] hover:border-amber-400 text-xs font-semibold text-slate-200 transition-all self-start sm:self-auto"
          >
            <span>Buka Galeri &amp; Jurnal Komunitas</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BANDA_PORTRAIT_REELS.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setSelectedReelModal(reel)}
              className="group relative aspect-[9/16] max-h-[480px] w-full mx-auto rounded-3xl overflow-hidden cursor-pointer border border-white/15 bg-[#081d35] shadow-xl hover:ring-2 hover:ring-amber-400 transition-all duration-300"
            >
              <img
                src={reelsInView ? reel.src : reel.posterSrc}
                alt={reel.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/25 to-black/20" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 px-3 py-1 text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                  {reel.isAnimatedWebp && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {reel.aspectLabel}
                </span>
                <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white">
                  {reel.location}
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="block text-[11px] font-semibold text-amber-300 mb-1">
                  {reel.subtitle}
                </span>
                <h4 className="font-sans font-bold text-lg text-white leading-snug mb-1.5 group-hover:text-amber-300 transition-colors">
                  {reel.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {reel.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9:16 Portrait Lightbox Modal */}
      {selectedReelModal && (
        <div
          onClick={() => setSelectedReelModal(null)}
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#071322]/85 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col sm:flex-row max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-3xl bg-[#081d35] border border-white/20 shadow-2xl text-white"
          >
            <div className="relative w-full sm:w-[320px] aspect-[9/16] max-h-[75vh] sm:max-h-[85vh] shrink-0 bg-black mx-auto">
              <img
                src={selectedReelModal.src}
                alt={selectedReelModal.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-8 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    {selectedReelModal.aspectLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedReelModal(null)}
                    aria-label="Tutup pratinjau"
                    className="rounded-full bg-white/10 hover:bg-amber-400 hover:text-[#071322] p-2 text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {selectedReelModal.title}
                </h3>
                <p className="text-xs font-semibold text-amber-300 mb-4">
                  {selectedReelModal.location} · {selectedReelModal.subtitle}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {selectedReelModal.caption}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedReelModal(null)
                  openTourismSubTab('community_literacy')
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4b75e] px-5 py-3 text-xs font-extrabold text-[#081d35] hover:bg-amber-400 transition-colors"
              >
                <span>Jelajahi Seluruh Karya di Jurnal Komunitas</span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default TourismSawSection
