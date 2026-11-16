import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

export interface HistoricalChapter {
  number: string
  year: string
  tag: string
  title: string
  headline: string
  description: string
  details: string[]
  imageSrc: string
  imageAlt: string
  imageCaption: string
}

export const HISTORICAL_CHAPTERS: HistoricalChapter[] = [
  {
    number: '01',
    year: '1512',
    tag: 'TITIK NOL REMPAH PURBA',
    title: 'Monopoli Alam Semesta',
    headline: 'Pala yang Bernilai Melebihi Emas',
    description:
      'Selama ribuan tahun, Kepulauan Banda adalah satu-satunya tanah di muka bumi tempat pohon pala (Myristica fragrans) tumbuh secara alami. Bernilai lebih mahal dari emas di pasar Eropa abad pertengahan sebagai pengawet dan obat wabah, aroma pala memicu penjelajahan samudra besar-besaran oleh Portugis, Spanyol, Inggris, dan Belanda.',
    details: [
      'Pala & fuli endemik alami di 6 pulau vulkanik',
      'Pemberhentian kapal niaga Arab, Persia, Tiongkok, & Melayu',
      'Sistem perniagaan bebas oleh dewan adat Orang Kaya',
    ],
    imageSrc: '/images/landmarks/kebun-pala.jpg',
    imageAlt: 'Perkebunan pala purba di bawah rindangnya pohon kenari Banda Neira',
    imageCaption: 'Perkebunan Pala Kuno di Bawah Naungan Pohon Kenari',
  },
  {
    number: '02',
    year: '1621',
    tag: 'PERTAHANAN KEPULAUAN',
    title: 'Tragedi Monopoli VOC',
    headline: 'Benteng Pentagonal di Atas Bukit',
    description:
      'Gubernur Jenderal VOC Jan Pieterszoon Coen menaklukkan Banda secara brutal demi memaksakan monopoli rempah sepihak, menewaskan 44 Orang Kaya pemimpin adat. Di atas bukit Neira, VOC memperkokoh Benteng Belgica (1611)—benteng pertahanan pentagonal bertingkat dua yang menjadi markas pengawasan lalu lintas kapal perang di Laut Banda.',
    details: [
      'Benteng Belgica menghadap langsung ke Selat Neira',
      'Sistem pembagian tanah perkebunan VOC (Perkeniers)',
      'Simbol ketangguhan arsitektur militer abad ke-17',
    ],
    imageSrc: '/images/landmarks/belgica.jpg',
    imageAlt: 'Kemegahan Benteng Belgica dengan latar puncak Gunung Api Banda',
    imageCaption: 'Benteng Belgica (1611) Menghadap Teluk & Gunung Api',
  },
  {
    number: '03',
    year: '1667',
    tag: 'DIPLOMASI GLOBAL',
    title: 'Traktat Breda 1667',
    headline: 'Manhattan Ditukar dengan Pulau Rhun',
    description:
      'Persaingan berdarah antara armada Inggris dan Belanda di Laut Banda berakhir melalui Traktat Breda pada 31 Juli 1667. Demi mempertahankan monopoli penuh atas sebuah pulau karang kecil penghasil pala bernama Pulau Rhun, Belanda rela menyerahkan koloninya di Amerika Utara bernama Nieuw Amsterdam kepada Inggris—yang kini dikenal dunia sebagai Pulau Manhattan, New York.',
    details: [
      'Pertukaran geopolitik paling legendaris dalam sejarah modern',
      'Pulau Rhun diakui sebagai benteng pertahanan EIC Inggris',
      'Bukti betapa mahalnya harga pala di meja perundingan dunia',
    ],
    imageSrc: '/images/landmarks/pulau-rhun.jpg',
    imageAlt: 'Pemandangan pesisir dan tebing laut Pulau Rhun dari udara',
    imageCaption: 'Pulau Rhun, Tanah yang Pernah Ditukar dengan Manhattan',
  },
  {
    number: '04',
    year: '1936',
    tag: 'MEMORI KEBANGSAAN',
    title: 'Pengasingan Tokoh Bangsa',
    headline: 'Sekolah Sore Bung Hatta & Sjahrir',
    description:
      'Pemerintah kolonial Hindia Belanda mengasingkan para bapak bangsa, Mohammad Hatta dan Sutan Sjahrir, ke Banda Neira (1936–1942). Jauh dari hiruk-pikuk Jawa, Bung Hatta mendirikan sekolah sore tanpa bayaran untuk anak-anak lokal, menulis pemikiran politik, dan bersama Sjahrir merajut dasar-dasar kemerdekaan Republik Indonesia.',
    details: [
      'Rumah pengasingan dengan ruang belajar dan koleksi buku utuh',
      'Kelahiran ikatan persaudaraan erat kaum pergerakan dengan warga Neira',
      'Ungkapan legendaris: "Jangan mati sebelum ke Banda Neira"',
    ],
    imageSrc: '/images/landmarks/bung-hatta.jpg',
    imageAlt: 'Rumah pengasingan Mohammad Hatta di jalan utama Banda Neira',
    imageCaption: 'Rumah Pengasingan Bung Hatta di Pusat Kota Banda Neira',
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
      {/* Background Ambience: Subtle deep ocean radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#113a68_0%,#081d35_70%)] pointer-events-none" />

      {/* Decorative watermark ornament in the background */}
      <div className="absolute -top-16 -right-16 w-80 h-80 opacity-5 pointer-events-none">
        <img
          src="/images/ornaments/motif-pala.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* SECTION HEADER */}
        <header className="flex flex-col items-center text-center max-w-3xl mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/30 backdrop-blur-md shadow-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4b75e]" />
            <span className="font-mono text-[11px] sm:text-xs tracking-[0.22em] text-[#f4b75e] uppercase">
              SEJARAH KEPULAUAN · TITIK NOL REMPAH DUNIA
            </span>
          </div>

          <h2
            id="heritage-heading"
            className="text-3xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white leading-tight drop-shadow-md"
          >
            Empat Babak yang{' '}
            <span className="font-serif italic font-normal text-amber-200">
              Mengubah Dunia.
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans max-w-2xl">
            Dari sebuah pulau terpencil pencetak sejarah niaga global, barter Manhattan di Amerika Serikat,
            hingga tempat para bapak bangsa merajut fondasi kemerdekaan Republik Indonesia.
          </p>
        </header>

        {/* ZIG-ZAG RIVER SCROLLYTELLING CONTAINER */}
        <div className="relative w-full flex flex-col gap-24 sm:gap-36">
          {/* Subtle Vertical Timeline River Line (Visible on Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-px -translate-x-1/2 bg-gradient-to-b from-amber-400/10 via-amber-400/40 to-amber-400/10 pointer-events-none"
          />

          {HISTORICAL_CHAPTERS.map((chapter, index) => {
            const isEven = index % 2 === 1 // Babak 02 & 04: Teks di Kiri, Foto di Kanan

            return (
              <article
                key={chapter.number}
                aria-label={`Babak ${chapter.number}: ${chapter.headline}`}
                className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center"
              >
                {/* 1. VISUAL FLYING POSTER FRAME (Order swapped dynamically via CSS Grid) */}
                <div
                  className={`w-full flex justify-center ${
                    isEven ? 'lg:order-2 lg:justify-start' : 'lg:order-1 lg:justify-end'
                  }`}
                >
                  <div className="relative w-full max-w-[560px] group">
                    {/* Atmospheric Glow behind frame */}
                    <div className="absolute -inset-2 rounded-3xl bg-amber-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Physical Framed Photographic Poster */}
                    <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:border-amber-400/60">
                      <div className="relative aspect-[16/11] w-full overflow-hidden">
                        <img
                          src={chapter.imageSrc}
                          alt={chapter.imageAlt}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Film grain / dark gradient vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

                        {/* Top-Right Historical Year Badge */}
                        <div className="absolute top-4 right-4 px-3.5 py-1 rounded-xl bg-black/60 border border-white/20 backdrop-blur-md">
                          <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 tracking-wider">
                            {chapter.year}
                          </span>
                        </div>
                      </div>

                      {/* Poster Bottom Caption Bar */}
                      <figcaption className="px-5 py-3.5 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                        <span className="font-sans font-medium text-slate-200 truncate">
                          {chapter.imageCaption}
                        </span>
                        <span className="font-mono text-[10px] tracking-widest text-[#f4b75e] uppercase shrink-0">
                          {chapter.tag}
                        </span>
                      </figcaption>
                    </div>
                  </div>
                </div>

                {/* 2. EDITORIAL NARRATION CONTENT */}
                <div
                  className={`flex flex-col items-start gap-4 sm:gap-6 ${
                    isEven ? 'lg:order-1 lg:pr-8' : 'lg:order-2 lg:pl-8'
                  }`}
                >
                  {/* Sequence Stamp & Subtitle */}
                  <div className="inline-flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-400/60">
                      {chapter.number}
                    </span>
                    <div className="w-8 h-px bg-amber-400/40" />
                    <span className="font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-amber-300">
                      {chapter.title}
                    </span>
                  </div>

                  {/* Chapter Main Headline */}
                  <h3 className="text-2xl sm:text-4xl font-sans font-bold tracking-tight text-white leading-tight">
                    {chapter.headline}
                  </h3>

                  {/* Narrative Body Paragraph */}
                  <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans font-normal">
                    {chapter.description}
                  </p>

                  {/* Micro Historical Takeaways */}
                  <ul className="flex flex-col gap-2 pt-2 border-t border-white/10 w-full text-xs sm:text-sm text-slate-300">
                    {chapter.details.map((detail, dIndex) => (
                      <li key={dIndex} className="inline-flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="font-sans leading-normal">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>

        {/* BOTTOM SECTION CTA: Explore 177 Heritage Sites in GIS & Tourism */}
        <footer className="mt-24 sm:mt-32 w-full max-w-4xl p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-amber-400/30 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-amber-300 uppercase tracking-widest">
              Laboratorium Sejarah Bahari Nusantara
            </span>
            <h4 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
              177 Situs Cagar Budaya Terpetakan Secara Digital
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Setiap benteng, rumah tua, kebun pala, dan sumur pusaka di Banda telah didokumentasikan dalam peta geospasial interaktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('gis')}
              className="inline-flex h-12 items-center gap-2.5 px-6 bg-amber-600 hover:bg-amber-500 transition-colors rounded-xl border border-amber-400 font-semibold text-white text-xs sm:text-sm tracking-wide shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Buka Peta Cagar Budaya (GIS)</span>
              <ArrowUpRightIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default HeritageSpiceSection
