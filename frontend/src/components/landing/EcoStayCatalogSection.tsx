import React, { useState, useRef, useEffect } from 'react'
import { AccommodationItem, setPreferredTourismSubTab } from '../../services/tourism'
import { ArrowUpRightIcon } from './LandingIcons'

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
    photo_url:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85',
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
    photo_url:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85',
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
    photo_url:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=85',
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
    photo_url:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85',
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
    photo_url:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85',
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
    photo_url:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=85',
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
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BOUTIQUE' | 'HOMESTAY' | 'BUNGALOW'>('ALL')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const filterOptions = [
    { key: 'ALL', label: 'Semua Penginapan' },
    { key: 'BOUTIQUE', label: 'Boutique Eco-Hotel' },
    { key: 'HOMESTAY', label: 'Homestay Warga' },
    { key: 'BUNGALOW', label: 'Beach Bungalow' },
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
    const scrollAmount = card ? (card.clientWidth + 24) * (direction === 'left' ? -1 : 1) : 380 * (direction === 'left' ? -1 : 1)
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
      className="relative w-full py-16 px-6 sm:px-12 lg:px-20 bg-[#f9f8f5] text-slate-900 border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row: Title on Left, Controls & Selengkapnya on Right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-amber-600" />
              <p className="font-sans text-[11px] font-bold tracking-[0.2em] text-amber-600 uppercase">
                DIREKTORI PENGINAPAN &amp; ECO-STAY
              </p>
            </div>

            <h2
              id="island-stays-heading"
              className="font-sans font-bold text-3xl sm:text-4xl lg:text-[42px] leading-tight tracking-tight text-[#0f2c59]"
            >
              Peraduan Nyaman di{' '}
              <span className="font-script text-amber-600 font-normal text-4xl sm:text-5xl lg:text-[50px] inline-block tracking-normal ml-1">
                Pulau Rempah
              </span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 max-w-xl mt-2 leading-relaxed">
              Dikelola langsung oleh warga pulau dengan jaminan air minum RO dan cadangan listrik ramah lingkungan.
            </p>
          </div>

          {/* Actions: Prev/Next Carousel Arrows + Selengkapnya button */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Carousel navigation arrows */}
            <div className="flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Geser ke kiri"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'border-slate-300 text-slate-800 hover:border-[#0f2c59] hover:bg-[#0f2c59] hover:text-white cursor-pointer shadow-sm'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Geser ke kanan"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'border-slate-300 text-slate-800 hover:border-[#0f2c59] hover:bg-[#0f2c59] hover:text-white cursor-pointer shadow-sm'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={openAccommodations}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0f2c59] text-[#0f2c59] hover:bg-[#0f2c59] hover:text-white text-xs font-semibold tracking-wide transition-all duration-200 group cursor-pointer"
            >
              <span>Selengkapnya</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSelectedFilter(opt.key)
                scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedFilter === opt.key
                  ? 'bg-[#0f2c59] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Carousel Showcase (Single row of top 3 visible, smooth horizontal snap) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-6 px-6 sm:-mx-12 sm:px-12 lg:-mx-20 lg:px-20"
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
                className="group relative shrink-0 w-[85vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] min-w-[260px] max-w-[420px] snap-start flex flex-col rounded-[2rem] overflow-hidden bg-slate-900 aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-300 select-none"
              >
                {/* Background Image */}
                <img
                  src={stay.photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85'}
                  alt={stay.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626]/95 via-[#0a1626]/40 to-black/20" />

                {/* Bottom Information Overlay */}
                <div className="relative z-10 mt-auto p-6 flex flex-col justify-end text-white">
                  <h3 className="font-sans font-bold text-lg sm:text-xl text-white leading-snug group-hover:text-amber-300 transition-colors mb-2">
                    {stay.name}
                  </h3>

                  {/* Price info */}
                  <div className="flex items-center gap-2 mb-2 font-mono text-sm text-amber-300 font-bold">
                    <span>{formattedPrice}</span>
                    <span className="text-xs font-normal text-slate-300 font-sans">/ malam</span>
                  </div>

                  {/* Island & Address Pin */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 font-sans">
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span className="truncate">{stay.island_name} &bull; {stay.address}</span>
                  </div>

                  {/* WhatsApp Direct Action */}
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <a
                      href={`https://wa.me/${stay.contact_whatsapp}?text=Halo%2C%20saya%20ingin%20reservasi%20di%20${encodeURIComponent(stay.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Reservasi Penginapan</span>
                    </a>

                    <span className="text-[11px] text-slate-400 font-sans">
                      {stay.rooms_available} kamar tersisa
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* "Selengkapnya" Final Card in Carousel */}
          <div className="group relative shrink-0 w-[85vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] min-w-[260px] max-w-[420px] snap-start flex flex-col justify-between rounded-[2rem] bg-gradient-to-br from-[#0f2c59] to-[#081d35] p-8 text-white aspect-[3/4] shadow-md border border-white/10 hover:border-amber-400/40 transition-all select-none">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-6">
                <ArrowUpRightIcon className="w-6 h-6" />
              </div>
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#f4b75e] uppercase block mb-2">
                DIREKTORI LENGKAP
              </span>
              <h3 className="font-sans font-bold text-2xl text-white leading-tight mb-3">
                30+ Penginapan di Seluruh Banda
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Temukan pilihan homestay cagar budaya, boutique villa, dan beach bungalow di Pulau Neira, Banda Besar, Ay, Rhun, dan Hatta.
              </p>
            </div>

            <button
              type="button"
              onClick={openAccommodations}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-md group cursor-pointer"
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
