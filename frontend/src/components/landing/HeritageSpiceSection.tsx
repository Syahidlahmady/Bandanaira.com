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
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const totalScrollable = rect.height - window.innerHeight
      if (totalScrollable <= 0) return

      const currentScroll = -rect.top
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable))
      const nextIndex = Math.min(STORIES.length - 1, Math.floor(progress * STORIES.length))
      setActiveIndex(nextIndex)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="sejarah"
      aria-labelledby="heritage-heading"
      className="relative w-full bg-[#081d35] text-white"
      style={{ height: '280vh' }}
    >
      {/* Sticky viewport staying centered during section scroll */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center py-8 sm:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#113a68_0%,#081d35_70%)] pointer-events-none" />

        {/* SECTION HEADER */}
        <header className="relative z-10 flex flex-col items-center text-center max-w-2xl shrink-0">
          <span className="font-mono text-xs tracking-widest text-[#f4b75e] uppercase mb-2">
            SEJARAH BANDA NEIRA
          </span>
          <h2
            id="heritage-heading"
            className="text-2xl sm:text-4xl font-sans font-bold tracking-tight text-white leading-tight"
          >
            Cerita dari Jantung Rempah
          </h2>
          <p className="mt-1.5 text-slate-300 text-xs sm:text-sm max-w-md hidden sm:block">
            Gulir ke bawah untuk menelusuri perjalanan sejarah Banda Neira
          </p>
        </header>

        {/* CENTER STAGE: FlyingPosters + Synchronized Story Narratives */}
        <div className="relative z-10 w-full max-w-6xl my-auto flex items-center justify-center">
          <div
            style={{ height: 600, position: 'relative' }}
            className="w-full rounded-3xl overflow-hidden border border-amber-400/20 bg-slate-950/60 shadow-2xl backdrop-blur-sm"
          >
            <FlyingPosters
              items={ITEMS}
              planeWidth={320}
              planeHeight={320}
              distortion={3}
              scrollEase={0.01}
              cameraFov={45}
              cameraZ={20}
              pageScroll={0.8}
            />

            {/* Desktop / Tablet Alternating Story Overlays */}
            <div className="hidden sm:flex absolute inset-0 pointer-events-none items-center justify-between p-6 sm:p-10 lg:p-14">
              {/* Left Slot (for stories with align === 'left') */}
              <div className="relative w-full max-w-sm lg:max-w-md h-full flex items-center">
                {STORIES.map((story, i) => {
                  if (story.align !== 'left') return null
                  const isActive = activeIndex === i
                  return (
                    <article
                      key={story.id}
                      className={`absolute inset-x-0 p-6 sm:p-8 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-400/30 shadow-2xl transition-all duration-500 ease-out ${
                        isActive
                          ? 'opacity-100 translate-x-0 pointer-events-auto'
                          : 'opacity-0 -translate-x-8 pointer-events-none'
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
              <div className="relative w-full max-w-sm lg:max-w-md h-full flex items-center">
                {STORIES.map((story, i) => {
                  if (story.align !== 'right') return null
                  const isActive = activeIndex === i
                  return (
                    <article
                      key={story.id}
                      className={`absolute inset-x-0 p-6 sm:p-8 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-400/30 shadow-2xl transition-all duration-500 ease-out ${
                        isActive
                          ? 'opacity-100 translate-x-0 pointer-events-auto'
                          : 'opacity-0 translate-x-8 pointer-events-none'
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

            {/* Mobile Story Card (bottom aligned inside stage) */}
            <div className="sm:hidden absolute bottom-3 inset-x-3 pointer-events-auto">
              <article className="p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-400/30 shadow-2xl">
                <h3 className="text-base font-bold text-white">
                  {STORIES[activeIndex].title}
                </h3>
                <p className="mt-1.5 text-slate-300 text-xs leading-relaxed">
                  {STORIES[activeIndex].description}
                </p>
              </article>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROLS: Timeline Step Indicators & CTA */}
        <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl shrink-0 pt-2">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {STORIES.map((story, i) => (
              <div
                key={story.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeIndex === i
                    ? 'w-8 bg-amber-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-400/40 rounded-xl transition-all text-xs sm:text-sm font-medium shadow-md hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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
