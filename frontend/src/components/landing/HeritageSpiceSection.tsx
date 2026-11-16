import React from 'react'
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
}

export const STORIES: StoryItem[] = [
  {
    id: 'pala',
    title: 'Pala yang Dicari Dunia',
    description:
      'Dahulu, buah pala hanya tumbuh di tanah Banda. Aromanya yang khas dan khasiatnya yang langka membuat bangsa-bangsa dari berbagai belahan bumi berlayar ribuan mil untuk mencarinya. Nilainya saat itu bahkan melampaui emas.',
  },
  {
    id: 'belgica',
    title: 'Benteng Belgica & Jalur Rempah',
    description:
      'Untuk mengamankan perdagangan pala, Belanda membangun benteng kokoh di atas perbukitan Neira. Dari benteng inilah seluruh perairan dan kapal-kapal niaga yang melintas di Laut Banda diawasi secara ketat selama ratusan tahun.',
  },
  {
    id: 'rhun',
    title: 'Pulau Rhun & Barter Manhattan',
    description:
      'Sebuah pulau karang kecil di Banda pernah menjadi pusat sengketa antara Inggris dan Belanda. Demi menguasai Pulau Rhun seutuhnya, Belanda rela menukarnya dengan koloni New Amsterdam di Amerika—wilayah yang kini dikenal sebagai Manhattan, New York.',
  },
  {
    id: 'hatta',
    title: 'Rumah Pengasingan Bung Hatta',
    description:
      'Banda Neira juga menyimpan jejak perjuangan kemerdekaan. Di pulau yang tenang ini, Bung Hatta dan Sutan Sjahrir pernah diasingkan. Sambil mengajar anak-anak setempat, mereka terus menulis dan merajut gagasan tentang masa depan Indonesia.',
  },
]

export interface HeritageSpiceSectionProps {
  onNavigate: (tab: any) => void
}

export const HeritageSpiceSection: React.FC<HeritageSpiceSectionProps> = ({ onNavigate }) => {
  return (
    <section
      id="sejarah"
      aria-labelledby="heritage-heading"
      className="relative w-full bg-[#081d35] text-white py-24 sm:py-32 px-4 sm:px-8 lg:px-16 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#113a68_0%,#081d35_70%)] pointer-events-none" />

      {/* Subtle motif watermark in corner */}
      <div className="absolute -top-16 -right-16 w-80 h-80 opacity-5 pointer-events-none">
        <img
          src="/images/ornaments/motif-pala.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* SECTION HEADER */}
        <header className="flex flex-col items-center text-center max-w-2xl mb-16 sm:mb-20">
          <span className="font-mono text-xs tracking-widest text-[#f4b75e] uppercase mb-3">
            SEJARAH BANDA NEIRA
          </span>

          <h2
            id="heritage-heading"
            className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white leading-tight"
          >
            Cerita dari Jantung Rempah
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Perjalanan pulau kecil di Maluku yang pernah mengguncang perdagangan dunia dan melahirkan pemikiran besar para pendiri bangsa.
          </p>
        </header>

        {/* INTERACTIVE SCROLLYTELLING CONTAINER */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* LEFT COLUMN: Sticky 3D FlyingPosters Canvas */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 w-full z-10">
            <div
              className="w-full rounded-3xl overflow-hidden border border-amber-400/20 bg-slate-950/60 shadow-2xl backdrop-blur-sm"
              style={{ height: 600, position: 'relative' }}
            >
              <FlyingPosters
                items={ITEMS}
                planeWidth={320}
                planeHeight={320}
                distortion={3}
                scrollEase={0.01}
                cameraFov={45}
                cameraZ={20}
                pageScroll={0.4}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Sequential Story Narratives */}
          <div className="lg:col-span-5 flex flex-col gap-10 sm:gap-14 lg:py-6">
            {STORIES.map((story) => (
              <article
                key={story.id}
                className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 hover:border-amber-400/30 transition-all duration-300"
              >
                <h3 className="text-xl sm:text-2xl font-sans font-semibold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                  {story.title}
                </h3>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  {story.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <footer className="mt-20 w-full flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-400/40 rounded-xl transition-all text-sm font-medium shadow-lg hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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
