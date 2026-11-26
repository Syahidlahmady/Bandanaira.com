import React, { useState, useRef, useEffect } from 'react'
import { AccommodationItem, setPreferredTourismSubTab } from '../../services/tourism'
import { ArrowUpRightIcon } from './LandingIcons'
import { useLanguage } from '../../context/LanguageContext'
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Droplets,
  Sun,
  ShieldCheck,
} from 'lucide-react'

export const FALLBACK_ACCOMMODATIONS: AccommodationItem[] = [
  {
    id: 'acc-1',
    name: 'Cilu Bintang Estate Heritage Stay',
    type: 'BOUTIQUE ECO-HOTEL',
    island_name: 'Pulau Neira',
    address: 'Jl. Benteng Belgica, Desa Nusantara, Banda Neira',
    price_per_night_rp: 650000,
    rooms_available: 6,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567801',
    description:
      'Penginapan bergaya kolonial Hindia dengan pemandangan langsung ke Benteng Belgica, dilengkapi suplai Air Bersih RO dan panel surya.',
    photo_url: '/images/landmarks/hotel-maulana.jpg',
    is_verified: true,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'acc-2',
    name: 'The Nutmeg Tree Homestay Banda',
    type: 'HOMESTAY WARGA',
    island_name: 'Pulau Neira',
    address: 'Kampung Baru, Banda Neira',
    price_per_night_rp: 350000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567802',
    description:
      'Homestay keluarga di bawah naungan pohon pala dan kenari, sarapan kuliner lokal kue kenari dan ikan asar segar.',
    photo_url: '/images/landmarks/nutmeg-tree-resort.jpg',
    is_verified: true,
    created_at: '2026-01-12T00:00:00Z',
  },
  {
    id: 'acc-3',
    name: 'Hatta Coral Reef Beach Bungalow',
    type: 'BEACH BUNGALOW',
    island_name: 'Pulau Hatta',
    address: 'Pesisir Barat Kampung Lama, Pulau Hatta',
    price_per_night_rp: 300000,
    rooms_available: 7,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567804',
    description:
      'Bungalow kayu tepi pantai berpasir putih, hanya 10 langkah dari tebing karang drop-off bawah laut Pulau Hatta.',
    photo_url: '/images/landmarks/pulau-hatta.jpg',
    is_verified: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'acc-4',
    name: 'Lonthoir Spice Vista Homestay',
    type: 'HOMESTAY WARGA',
    island_name: 'Banda Besar',
    address: 'Desa Adat Lonthoir, Banda Besar',
    price_per_night_rp: 280000,
    rooms_available: 5,
    has_clean_ro_water: true,
    has_solar_backup: false,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567805',
    description:
      'Panorama langsung ke Laut Banda dan Gunung Api dari ketinggian tebing Lonthoir, dekat anak tangga keramat menuju perkebunan pala.',
    photo_url: '/images/landmarks/abba-homestay.jpg',
    is_verified: true,
    created_at: '2026-01-18T00:00:00Z',
  },
  {
    id: 'acc-5',
    name: 'Maulana Waterfront Heritage Hotel',
    type: 'BOUTIQUE ECO-HOTEL',
    island_name: 'Pulau Neira',
    address: 'Jl. Pelabuhan Lama No. 2, Banda Neira',
    price_per_night_rp: 550000,
    rooms_available: 8,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567803',
    description:
      'Hotel legendaris tepi dermaga Neira yang pernah disinggahi tamu negara dan pesohor dunia, dengan teras menghadap selat gunung api.',
    photo_url: '/images/landmarks/hotel-maulana.jpg',
    is_verified: true,
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'acc-6',
    name: 'Ai Island Lagoon Eco-Lodge',
    type: 'BEACH BUNGALOW',
    island_name: 'Pulau Ay',
    address: 'Pesisir Timur Pulau Ay',
    price_per_night_rp: 320000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567806',
    description:
      'Ketenangan total di pulau perkebunan pala tertua, dikelilingi laguna jernih yang menjadi habitat kura-kura dan hiu karang jinak.',
    photo_url: '/images/landmarks/baba-lagoon.jpg',
    is_verified: true,
    created_at: '2026-01-22T00:00:00Z',
  },
]

export interface EcoStayCatalogSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin: () => void
  onOpenQuickLogin?: () => void
}

export const EcoStayCatalogSection: React.FC<EcoStayCatalogSectionProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage()
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BOUTIQUE' | 'HOMESTAY' | 'BUNGALOW'>('ALL')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const filterOptions = [
    { key: 'ALL', label: t.ecoStay.filterAll || 'Semua Penginapan', count: FALLBACK_ACCOMMODATIONS.length },
    { key: 'BOUTIQUE', label: 'Boutique Eco-Hotel', count: 2 },
    { key: 'HOMESTAY', label: 'Homestay Warga', count: 2 },
    { key: 'BUNGALOW', label: 'Beach Bungalow', count: 2 },
  ] as const

  const filteredItems = FALLBACK_ACCOMMODATIONS.filter((item) => {
    if (selectedFilter === 'ALL') return true
    if (selectedFilter === 'BOUTIQUE') return item.type.includes('BOUTIQUE')
    if (selectedFilter === 'HOMESTAY') return item.type.includes('HOMESTAY')
    if (selectedFilter === 'BUNGALOW') return item.type.includes('BUNGALOW')
    return true
  })

  const checkScrollButtons = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 20)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    checkScrollButtons()
    el.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)
    return () => {
      el.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [filteredItems])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current
    if (!el) return
    const card = el.querySelector('div')
    const scrollAmount = card ? (card.clientWidth + 20) * (direction === 'left' ? -1 : 1) : 320 * (direction === 'left' ? -1 : 1)
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const openAccommodations = () => {
    setPreferredTourismSubTab('accommodations')
    onNavigate('tourism')
  }

  return (
    <section
      id="eco-stay"
      aria-labelledby="island-stays-heading"
      className="relative w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-16 bg-[#f9f8f5] text-slate-900 border-t border-slate-200/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row: Judul di Kiri, Kontrol & Aksi di Kanan */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-5 h-px bg-amber-600" />
              <p className="font-sans text-[11px] font-bold tracking-[0.2em] text-amber-600 uppercase">
                {t.ecoStay.tagline}
              </p>
            </div>

            <h2
              id="island-stays-heading"
              className="font-sans font-bold text-2xl sm:text-4xl lg:text-[42px] leading-tight tracking-tight text-[#081D35]"
            >
              {t.ecoStay.headingPrefix}{' '}
              <span className="font-script text-amber-600 font-normal text-3xl sm:text-5xl lg:text-[50px] inline-block tracking-normal ml-1">
                {t.ecoStay.headingScript}
              </span>
            </h2>
            <p className="font-sans text-xs sm:text-base text-slate-600 max-w-xl mt-1.5 sm:mt-2 leading-relaxed">
              {t.ecoStay.description}
            </p>
          </div>

          {/* Aksi & Navigasi Panah Carousel */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-0">
            {/* Tombol Panah Paginasi Berdimensi 44x44px */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label={t.ecoStay.prev}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  canScrollLeft
                    ? 'border-slate-300 text-slate-800 hover:border-[#081D35] hover:bg-[#081D35] hover:text-white cursor-pointer shadow-xs active:scale-90'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label={t.ecoStay.next}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  canScrollRight
                    ? 'border-slate-300 text-slate-800 hover:border-[#081D35] hover:bg-[#081D35] hover:text-white cursor-pointer shadow-xs active:scale-90'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              type="button"
              id="btn-ecostay-selengkapnya"
              data-scroll-anchor="btn-ecostay-selengkapnya"
              onClick={openAccommodations}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-[#081D35] text-[#081D35] hover:bg-[#081D35] hover:text-white text-xs font-semibold tracking-wide transition-all duration-200 group cursor-pointer active:scale-95 shadow-xs"
            >
              <span>{t.ecoStay.viewMore}</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Filter Kategori Pil (Bisa Digulir Horisontal di Mobile Tanpa Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 sm:mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSelectedFilter(opt.key)
                scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                selectedFilter === opt.key
                  ? 'bg-[#081D35] text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedFilter === opt.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Carousel Kartu Penginapan */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-8 sm:px-8 lg:-mx-16 lg:px-16"
        >
          {filteredItems.map((stay) => {
            const formattedPrice = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(stay.price_per_night_rp)

            return (
              <div
                key={stay.id}
                className="group relative shrink-0 w-[80vw] max-w-[330px] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] min-w-[250px] snap-center sm:snap-start flex flex-col rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-900 aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-300 select-none"
              >
                {/* Foto Latar Penginapan */}
                <img
                  src={stay.photo_url || '/images/landmarks/hotel-maulana.jpg'}
                  alt={stay.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626]/95 via-[#0a1626]/50 to-black/25" />

                {/* Badge Melayang Atas: Pulau & Eco-Stay Terverifikasi */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-semibold text-white">
                    <MapPin size={11} className="text-amber-400" />
                    <span>{stay.island_name}</span>
                  </span>

                  {stay.eco_stay_badge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/50 text-[10px] sm:text-[11px] font-bold text-emerald-300">
                      <ShieldCheck size={11} />
                      <span>Eco-Stay</span>
                    </span>
                  )}
                </div>

                {/* Lapisan Informasi Bawah */}
                <div className="relative z-10 mt-auto p-4 sm:p-5 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                    {stay.type}
                  </span>

                  <h3 className="font-sans font-bold text-base sm:text-lg text-white leading-snug group-hover:text-amber-300 transition-colors mb-1.5 line-clamp-1">
                    {stay.name}
                  </h3>

                  {/* Informasi Tarif */}
                  <div className="flex items-center gap-2 mb-2 font-mono text-sm text-amber-300 font-bold">
                    <span>{formattedPrice}</span>
                    <span className="text-[11px] font-normal text-slate-300 font-sans">/ {t.ecoStay.night}</span>
                  </div>

                  {/* Fasilitas Ramah Lingkungan (Air RO & Listrik Surya) */}
                  <div className="flex items-center gap-1.5 mb-2.5 text-[10px] text-slate-300">
                    {stay.has_clean_ro_water && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                        <Droplets size={10} className="text-sky-300" />
                        <span>Air RO</span>
                      </span>
                    )}
                    {stay.has_solar_backup && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                        <Sun size={10} className="text-amber-300" />
                        <span>Solar Listrik</span>
                      </span>
                    )}
                    <span className="bg-white/10 px-2 py-0.5 rounded-md text-slate-400">
                      {stay.rooms_available} kamar
                    </span>
                  </div>

                  {/* Tombol Reservasi WhatsApp & Detail */}
                  <div className="pt-2.5 border-t border-white/15 flex items-center justify-between">
                    <a
                      href={`https://wa.me/${stay.contact_whatsapp}?text=Halo%2C%20saya%20ingin%20reservasi%20di%20${encodeURIComponent(stay.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.ecoStay.bookWhatsapp} ${stay.name}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-semibold text-emerald-300 hover:text-white transition-all active:scale-95"
                    >
                      <MessageCircle size={14} />
                      <span>{t.ecoStay.bookWhatsapp}</span>
                    </a>

                    <button
                      type="button"
                      onClick={openAccommodations}
                      className="text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Detail &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Kartu Akhir Carousel: Buka Direktori Lengkap */}
          <div className="group relative shrink-0 w-[80vw] max-w-[330px] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] min-w-[250px] snap-center sm:snap-start flex flex-col justify-between rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-[#081D35] to-[#081d35] p-5 sm:p-7 text-white aspect-[3/4] shadow-md border border-white/10 hover:border-amber-400/40 transition-all select-none">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4 sm:mb-6">
                <ArrowUpRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#f4b75e] uppercase block mb-1.5 sm:mb-2">
                DIREKTORI LENGKAP
              </span>
              <h3 className="font-sans font-bold text-xl sm:text-2xl text-white leading-tight mb-2 sm:mb-3">
                30+ Penginapan di Seluruh Banda
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                Temukan pilihan homestay cagar budaya, boutique villa, dan beach bungalow di Pulau Neira, Banda Besar, Ay, Rhun, dan Hatta.
              </p>
            </div>

            <button
              type="button"
              id="btn-ecostay-carousel-selengkapnya"
              data-scroll-anchor="btn-ecostay-carousel-selengkapnya"
              onClick={openAccommodations}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-[#081D35] hover:bg-[#0c2a4d] active:scale-95 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-md group cursor-pointer border border-[#F4B75E]/30"
            >
              <span>Buka Direktori Penginapan</span>
              <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EcoStayCatalogSection
