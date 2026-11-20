import React, { useEffect, useRef, useState } from 'react'
import FlyingPosters from '../ui/FlyingPosters'
import { useLanguage } from '../../context/LanguageContext'

const ITEMS = [
  '/images/landmarks/kebun-pala.jpg',
  '/images/landmarks/belgica.jpg',
  '/images/landmarks/pulau-rhun.jpg',
  '/images/landmarks/bung-hatta.jpg',
]

export interface StoryItem {
  id: string
  title: string
  subtitle?: string
  description: string
  align: 'left' | 'right'
}

export const STORIES: StoryItem[] = [
  {
    id: 'pala',
    title: 'Pala yang Dicari Dunia',
    description:
      'Dahulu, buah pala hanya tumbuh di tanah Banda. Aromanya yang khas dan khasiatnya yang langka membuat bangsa-bangsa dari berbagai belahan bumi berlayar ribuan mil untuk mencarinya. Nilainya saat itu bahkan melampaui emas.',
    align: 'right',
  },
  {
    id: 'belgica',
    title: 'Benteng Belgica & Jalur Rempah',
    description:
      'Untuk mengamankan perdagangan pala, Belanda membangun benteng kokoh di atas perbukitan Neira. Dari benteng inilah seluruh perairan dan kapal-kapal niaga yang melintas di Laut Banda diawasi secara ketat selama ratusan tahun.',
    align: 'left',
  },
  {
    id: 'rhun',
    title: 'Pulau Rhun & Barter Manhattan',
    description:
      'Sebuah pulau karang kecil di Banda pernah menjadi pusat sengketa antara Inggris dan Belanda. Demi menguasai Pulau Rhun seutuhnya, Belanda rela menukarnya dengan koloni New Amsterdam di Amerika—wilayah yang kini dikenal sebagai Manhattan, New York.',
    align: 'right',
  },
  {
    id: 'hatta',
    title: 'Pengasingan Bung Hatta',
    description:
      'Banda Neira juga menyimpan jejak perjuangan kemerdekaan. Di pulau yang tenang ini, Bung Hatta dan Sutan Sjahrir pernah diasingkan. Sambil mengajar anak-anak setempat, mereka terus menulis dan merajut gagasan tentang masa depan Indonesia.',
    align: 'left',
  },
]

export interface HeritageSpiceSectionProps {
  onNavigate: (tab: any) => void
}

export const HeritageSpiceSection: React.FC<HeritageSpiceSectionProps> = () => {
  const { t, isEnglish } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const activeStories: StoryItem[] = [
    {
      id: 'pala',
      title: t.heritage.stories.pala.title,
      subtitle: t.heritage.stories.pala.subtitle,
      description: t.heritage.stories.pala.desc,
      align: 'right',
    },
    {
      id: 'belgica',
      title: t.heritage.stories.belgica.title,
      subtitle: t.heritage.stories.belgica.subtitle,
      description: t.heritage.stories.belgica.desc,
      align: 'left',
    },
    {
      id: 'rhun',
      title: t.heritage.stories.rhun.title,
      subtitle: t.heritage.stories.rhun.subtitle,
      description: t.heritage.stories.rhun.desc,
      align: 'right',
    },
    {
      id: 'hatta',
      title: t.heritage.stories.hatta.title,
      subtitle: t.heritage.stories.hatta.subtitle,
      description: t.heritage.stories.hatta.desc,
      align: 'left',
    },
  ]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const totalScrollable = rect.height - window.innerHeight
      if (totalScrollable <= 0) return

      const currentScroll = -rect.top
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToStory = (index: number) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const sectionTop = window.scrollY + rect.top
    const totalScrollable = rect.height - window.innerHeight
    const targetY = sectionTop + (index / (activeStories.length - 1)) * totalScrollable
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  const currentStory = activeStories[activeIndex] || activeStories[0]

  return (
    <section
      ref={sectionRef}
      id="sejarah"
      aria-labelledby="heritage-heading"
      className="relative w-full bg-[#081d35] text-white scroll-mt-28"
      style={{ height: '300vh' }}
    >
      {/* Sticky full-screen viewport taking entire section */}
      <div className="sticky top-0 h-[100dvh] min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#113a68_0%,#081d35_70%)] pointer-events-none" />

        {/* FULL SECTION FLYING POSTERS */}
        <div className="absolute inset-0 z-0">
          <FlyingPosters
            items={ITEMS}
            planeWidth={isMobile ? 260 : 380}
            planeHeight={isMobile ? 195 : 285}
            radius={18}
            distortion={1.5}
            scrollEase={0.06}
            cameraFov={45}
            cameraZ={20}
            progress={scrollProgress}
            onActiveIndexChange={(idx) => setActiveIndex(idx)}
            onItemClick={(_, idx) => scrollToStory(idx)}
            className="w-full h-full"
          />
        </div>

        {/* SECTION HEADER: Placed safely below the fixed navbar */}
        <header className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto pt-20 sm:pt-28 lg:pt-32 px-4 shrink-0 pointer-events-none">
          <span className="font-sans text-xs font-semibold tracking-widest text-[#f4b75e] uppercase mb-2">
            {t.heritage.sectionBadge}
          </span>
          <h2
            id="heritage-heading"
            className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white leading-tight drop-shadow-lg"
          >
            {isEnglish ? (
              <>
                Tales from the{' '}
                <span className="font-script font-normal text-amber-200 text-4xl sm:text-6xl inline-block ml-1">
                  Heart of Spice
                </span>
              </>
            ) : (
              <>
                Cerita dari{' '}
                <span className="font-script font-normal text-amber-200 text-4xl sm:text-6xl inline-block ml-1">
                  Jantung Rempah
                </span>
              </>
            )}
          </h2>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-md hidden sm:block drop-shadow">
            {isEnglish
              ? 'Scroll down to trace the historical timeline of Banda Neira'
              : 'Gulir ke bawah untuk menelusuri linimasa perjalanan sejarah Banda Neira'}
          </p>
        </header>

        {/* DESKTOP TIMELINE SYSTEM: Vertical Line, Center Point Node, and Horizontal Connectors */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-10">
          {/* Vertical Timeline Guide Line */}
          <div className="absolute left-1/2 top-36 bottom-24 -translate-x-1/2 w-[1.5px] bg-amber-400/25" />

          {/* Central Point Node right in the middle of active poster */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.85)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
          </div>

          {/* Dynamic Horizontal Connector Line: Extends from center node through poster edge to the narrative */}
          {currentStory.align === 'right' ? (
            <div
              className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[1.5px] bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-500 origin-left w-[250px] lg:w-[285px] xl:w-[320px]"
            />
          ) : (
            <div
              className="absolute right-1/2 top-1/2 -translate-y-1/2 h-[1.5px] bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-500 origin-right w-[250px] lg:w-[285px] xl:w-[320px]"
            />
          )}
        </div>

        {/* FRAMELESS DESKTOP NARRATIVES: Floating naturally with guaranteed clearance from photo */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-10">
          {/* Left Slot (stories with align === 'left') */}
          <div className="absolute right-[calc(50%+250px)] lg:right-[calc(50%+285px)] xl:right-[calc(50%+320px)] top-1/2 -translate-y-1/2 w-[280px] lg:w-[340px] xl:w-[390px] max-w-[calc(50vw-48px)] min-h-[220px] flex items-center text-right">
            {activeStories.map((story, i) => {
              if (story.align !== 'left') return null
              const isActive = activeIndex === i
              return (
                <div
                  key={story.id}
                  className={`absolute inset-x-0 transition-all duration-500 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 pointer-events-auto'
                      : 'opacity-0 -translate-x-8 pointer-events-none'
                  }`}
                >
                  <h3 className="font-script font-normal text-4xl sm:text-5xl lg:text-6xl text-amber-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-[1.18] mb-1">
                    {story.title}
                  </h3>
                  {story.subtitle && (
                    <p className="text-[11px] sm:text-xs font-mono font-medium tracking-wide text-[#f4b75e] uppercase mb-2.5 drop-shadow-sm">
                      {story.subtitle}
                    </p>
                  )}
                  <p className="font-sans text-slate-100 text-sm sm:text-base leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                    {story.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Right Slot (stories with align === 'right') */}
          <div className="absolute left-[calc(50%+250px)] lg:left-[calc(50%+285px)] xl:left-[calc(50%+320px)] top-1/2 -translate-y-1/2 w-[280px] lg:w-[340px] xl:w-[390px] max-w-[calc(50vw-48px)] min-h-[220px] flex items-center text-left">
            {activeStories.map((story, i) => {
              if (story.align !== 'right') return null
              const isActive = activeIndex === i
              return (
                <div
                  key={story.id}
                  className={`absolute inset-x-0 transition-all duration-500 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 pointer-events-auto'
                      : 'opacity-0 translate-x-8 pointer-events-none'
                  }`}
                >
                  <h3 className="font-script font-normal text-4xl sm:text-5xl lg:text-6xl text-amber-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-[1.18] mb-1">
                    {story.title}
                  </h3>
                  {story.subtitle && (
                    <p className="text-[11px] sm:text-xs font-mono font-medium tracking-wide text-[#f4b75e] uppercase mb-2.5 drop-shadow-sm">
                      {story.subtitle}
                    </p>
                  )}
                  <p className="font-sans text-slate-100 text-sm sm:text-base leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                    {story.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* MOBILE PRESENTATION: Frameless typography with center node indicator */}
        <div className="md:hidden relative z-10 w-full px-6 mb-4 pointer-events-auto text-center flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-950 shadow-md mb-2 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
          <div className="w-[1.5px] h-4 bg-amber-400/80 mb-2" />
          <h3 className="font-script font-normal text-3xl sm:text-4xl text-amber-200 drop-shadow-lg leading-tight mb-1">
            {currentStory.title}
          </h3>
          {currentStory.subtitle && (
            <p className="text-[10px] font-mono font-medium tracking-wide text-[#f4b75e] uppercase mb-1.5 drop-shadow-sm max-w-xs">
              {currentStory.subtitle}
            </p>
          )}
          <p className="font-sans text-slate-100 text-xs leading-relaxed max-w-xs drop-shadow-md">
            {currentStory.description}
          </p>
        </div>

        {/* BOTTOM CONTROLS: Clean Minimal Timeline Progress Bar (Button Removed) */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 sm:pb-12 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-950/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
            {activeStories.map((story, i) => (
              <button
                key={story.id}
                type="button"
                onClick={() => scrollToStory(i)}
                aria-label={isEnglish ? `View story: ${story.title}` : `Lihat cerita: ${story.title}`}
                className="h-8 px-1 flex items-center justify-center cursor-pointer"
              >
                <span
                  className={`h-2 rounded-full transition-all duration-500 block ${
                    activeIndex === i
                      ? 'w-10 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                      : 'w-2.5 bg-slate-600/80 hover:bg-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </footer>
      </div>
    </section>
  )
}

export default HeritageSpiceSection
