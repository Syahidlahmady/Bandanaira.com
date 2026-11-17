import React, { useEffect, useRef, useState } from 'react'
import FlyingPosters from '../ui/FlyingPosters'
import { ArrowUpRightIcon } from './LandingIcons'

const ITEMS = [
  '/images/landmarks/kebun-pala.jpg',
  '/images/landmarks/belgica.jpg',
  '/images/landmarks/pulau-rhun.jpg',
  '/images/landmarks/bung-hatta.jpg',
]

export interface StoryItem {
  id: string
  title: string
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
    title: 'Rumah Pengasingan Bung Hatta',
    description:
      'Banda Neira juga menyimpan jejak perjuangan kemerdekaan. Di pulau yang tenang ini, Bung Hatta dan Sutan Sjahrir pernah diasingkan. Sambil mengajar anak-anak setempat, mereka terus menulis dan merajut gagasan tentang masa depan Indonesia.',
    align: 'left',
  },
]

export interface HeritageSpiceSectionProps {
  onNavigate: (tab: any) => void
}

export const HeritageSpiceSection: React.FC<HeritageSpiceSectionProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

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
    const targetY = sectionTop + (index / (STORIES.length - 1)) * totalScrollable
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      id="sejarah"
      aria-labelledby="heritage-heading"
      className="relative w-full bg-[#081d35] text-white"
      style={{ height: '280vh' }}
    >
      {/* Sticky full-screen viewport taking entire section */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#113a68_0%,#081d35_70%)] pointer-events-none" />

        {/* FULL SECTION FLYING POSTERS: Fills the entire section without any inner box */}
        <div className="absolute inset-0 z-0">
          <FlyingPosters
            items={ITEMS}
            planeWidth={440}
            planeHeight={330}
            radius={24}
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

        {/* SECTION HEADER: Floats gracefully on top */}
        <header className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto pt-8 sm:pt-12 px-4 shrink-0 pointer-events-none">
          <span className="font-mono text-xs tracking-widest text-[#f4b75e] uppercase mb-2">
            SEJARAH BANDA NEIRA
          </span>
          <h2
            id="heritage-heading"
            className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white leading-tight drop-shadow-md"
          >
            Cerita dari Jantung Rempah
          </h2>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-md hidden sm:block">
            Gulir ke bawah untuk menelusuri perjalanan sejarah Banda Neira
          </p>
        </header>

        {/* DESKTOP/TABLET NARRATIVES: Floating directly in the section on the left and right */}
        <div className="hidden sm:flex relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 my-auto pointer-events-none items-center justify-between">
          {/* Left Slot (for stories with align === 'left') */}
          <div className="relative w-full max-w-sm lg:max-w-md min-h-[220px] flex items-center">
            {STORIES.map((story, i) => {
              if (story.align !== 'left') return null
              const isActive = activeIndex === i
              return (
                <article
                  key={story.id}
                  className={`absolute inset-x-0 p-6 sm:p-8 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-400/30 shadow-2xl transition-all duration-500 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 pointer-events-auto'
                      : 'opacity-0 -translate-x-12 pointer-events-none'
                  }`}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {story.title}
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                    {story.description}
                  </p>
                </article>
              )
            })}
          </div>

          {/* Right Slot (for stories with align === 'right') */}
          <div className="relative w-full max-w-sm lg:max-w-md min-h-[220px] flex items-center">
            {STORIES.map((story, i) => {
              if (story.align !== 'right') return null
              const isActive = activeIndex === i
              return (
                <article
                  key={story.id}
                  className={`absolute inset-x-0 p-6 sm:p-8 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-400/30 shadow-2xl transition-all duration-500 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 pointer-events-auto'
                      : 'opacity-0 translate-x-12 pointer-events-none'
                  }`}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {story.title}
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                    {story.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>

        {/* MOBILE STORY CARD (centered at bottom of screen) */}
        <div className="sm:hidden relative z-10 w-full px-4 mb-3 pointer-events-auto">
          <article className="p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-400/30 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {STORIES[activeIndex].title}
            </h3>
            <p className="mt-1.5 text-slate-300 text-xs leading-relaxed">
              {STORIES[activeIndex].description}
            </p>
          </article>
        </div>

        {/* BOTTOM CONTROLS: Timeline Step Indicators & CTA */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-8 sm:pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {STORIES.map((story, i) => (
              <button
                key={story.id}
                type="button"
                onClick={() => scrollToStory(i)}
                aria-label={`Lihat cerita ${story.title}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  activeIndex === i
                    ? 'w-10 bg-amber-400'
                    : 'w-2.5 bg-slate-700/80 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600/40 hover:bg-amber-600/60 text-amber-200 border border-amber-400/50 rounded-xl transition-all text-xs sm:text-sm font-medium shadow-lg hover:border-amber-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span>Lihat Lokasi Bersejarah di Peta</span>
            <ArrowUpRightIcon className="w-4 h-4 text-amber-300" />
          </button>
        </footer>
      </div>
    </section>
  )
}

export default HeritageSpiceSection
