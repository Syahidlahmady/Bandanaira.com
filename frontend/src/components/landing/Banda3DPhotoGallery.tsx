import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

export interface PhotoItem {
  id: string
  src: string
  cardSrc?: string
  alt: string
}

export const BANDA_3D_PHOTOS: PhotoItem[] = [
  {
    id: 'belgica',
    src: '/images/landmarks/belgica.jpg',
    cardSrc: '/images/landmarks/belgica-card.webp',
    alt: 'Benteng Belgica',
  },
  {
    id: 'gunung-api',
    src: '/images/landmarks/gunung-api.jpg',
    cardSrc: '/images/landmarks/gunung-api-card.webp',
    alt: 'Gunung Api Banda',
  },
  {
    id: 'istana-mini',
    src: '/images/landmarks/istana-mini.jpg',
    cardSrc: '/images/landmarks/istana-mini-card.webp',
    alt: 'Istana Mini VOC',
  },
  {
    id: 'lava-flow',
    src: '/images/landmarks/lava-flow.jpg',
    cardSrc: '/images/landmarks/lava-flow-card.webp',
    alt: 'Lava Flow Coral Reef',
  },
  {
    id: 'pulau-rhun',
    src: '/images/landmarks/pulau-rhun.jpg',
    cardSrc: '/images/landmarks/pulau-rhun-card.webp',
    alt: 'Pulau Rhun',
  },
  {
    id: 'pulau-hatta',
    src: '/images/landmarks/pulau-hatta.jpg',
    cardSrc: '/images/landmarks/pulau-hatta-card.webp',
    alt: 'Pulau Hatta',
  },
  {
    id: 'kebun-pala',
    src: '/images/landmarks/kebun-pala.jpg',
    cardSrc: '/images/landmarks/kebun-pala-card.webp',
    alt: 'Perkebunan Pala Kuno',
  },
  {
    id: 'nassau',
    src: '/images/landmarks/nassau.jpg',
    cardSrc: '/images/landmarks/nassau-card.webp',
    alt: 'Benteng Nassau',
  },
  {
    id: 'bung-hatta',
    src: '/images/landmarks/bung-hatta.jpg',
    cardSrc: '/images/landmarks/bung-hatta-card.webp',
    alt: 'Rumah Pengasingan Bung Hatta',
  },
  {
    id: 'pulau-ay',
    src: '/images/landmarks/pulau-ay.jpg',
    cardSrc: '/images/landmarks/pulau-ay-card.webp',
    alt: 'Pulau Ay',
  },
  {
    id: 'pelabuhan',
    src: '/images/landmarks/pelabuhan.jpg',
    cardSrc: '/images/landmarks/pelabuhan-card.webp',
    alt: 'Pelabuhan Banda Neira',
  },
  {
    id: 'pohon-sejuta-umat',
    src: '/images/landmarks/pohon-sejuta-umat.webp',
    cardSrc: '/images/landmarks/pohon-sejuta-umat-card.webp',
    alt: 'Pohon Sejuta Umat & Gunung Api Banda',
  },
]

export const Banda3DPhotoGallery: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section
      id="galeri-neira"
      aria-label="Kompilasi Galeri Foto Banda Neira"
      className="relative z-10 w-full bg-[#081d35] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[#081d35] bg-[radial-gradient(circle_at_50%_25%,#113a68_0%,#0c2b4e_50%,#081d35_90%)] pointer-events-none" />

      {/* Cultural Header Plate */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center w-full max-w-2xl mx-auto mb-10 sm:mb-14 px-2">
        <div className="relative flex flex-col items-center gap-2 sm:gap-3 px-6 sm:px-12 py-7 sm:py-9 rounded-3xl bg-[#081d35]/95 border-2 border-amber-400/35 shadow-2xl w-full">
          {/* Corner Nutmeg Ornament Top-Left */}
          <img
            src="/images/ornaments/motif-pala.png"
            alt="Motif Buah Pala"
            width={72}
            height={72}
            className="absolute -top-8 -left-6 sm:-top-10 sm:-left-8 w-16 h-16 sm:w-20 sm:h-20 object-contain -rotate-12 drop-shadow-md pointer-events-none"
            loading="lazy"
          />

          {/* Corner Fish Ornament Bottom-Right */}
          <img
            src="/images/ornaments/motif-ikan.png"
            alt="Motif Ikan Banda"
            width={80}
            height={54}
            className="absolute -bottom-7 -right-6 sm:-bottom-9 sm:-right-8 w-20 h-14 sm:w-24 sm:h-16 object-contain rotate-6 drop-shadow-md pointer-events-none"
            loading="lazy"
          />

          <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.24em] text-amber-300 uppercase">
            {t.gallery.tagline}
          </span>

          <h2 className="text-3xl sm:text-5xl font-script font-normal text-white tracking-wide leading-tight drop-shadow-lg">
            {t.gallery.title}
          </h2>

          <p className="text-xs sm:text-sm text-white/85 font-sans max-w-md mt-1">
            Koleksi fotografi pusaka bersejarah kolonial dan panorama alam bahari Kepulauan Banda.
          </p>
        </div>
      </div>

      {/* Desktop: 4-Column Responsive Grid */}
      <div className="hidden md:grid relative z-20 w-full max-w-7xl mx-auto grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {BANDA_3D_PHOTOS.map((item, index) => (
          <div
            key={item.id}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 bg-slate-900/60 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-2xl"
          >
            <img
              src={item.cardSrc || item.src}
              alt={item.alt}
              width={350}
              height={262}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 pointer-events-none">
              <span className="text-[10px] font-sans font-semibold tracking-wider text-amber-300 uppercase">
                Pusaka #{index + 1}
              </span>
              <span className="text-base font-sans font-bold text-white tracking-tight drop-shadow line-clamp-1">
                {item.alt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Smooth Horizontal Touch-Snap Rail */}
      <div className="md:hidden relative z-20 w-full max-w-6xl mx-auto">
        <div
          className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {BANDA_3D_PHOTOS.map((item, index) => (
            <div
              key={item.id}
              className="group relative shrink-0 snap-center w-[250px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 bg-slate-900/60 shadow-xl transition-transform active:scale-[0.98]"
            >
              <img
                src={item.cardSrc || item.src}
                alt={item.alt}
                width={300}
                height={225}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                <span className="text-[10px] font-sans font-semibold tracking-wider text-amber-300 uppercase">
                  Pusaka #{index + 1}
                </span>
                <span className="text-sm font-sans font-bold text-white tracking-tight drop-shadow">
                  {item.alt}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Swipe Guidance Hint */}
        <div className="flex items-center justify-between px-2 pt-2 text-[11px] font-sans text-amber-200/70">
          <span>Geser untuk menjelajahi 12 pusaka & panorama</span>
          <span className="text-white/60">12 Destinasi</span>
        </div>
      </div>
    </section>
  )
}

export default Banda3DPhotoGallery