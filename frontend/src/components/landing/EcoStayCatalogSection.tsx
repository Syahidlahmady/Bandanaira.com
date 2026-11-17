import React, { useState } from 'react'
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
    created_at: '2026-01-18T00:00:00Z',
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
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567805',
    description:
      'Singgah di lereng bukit perkebunan pala tertua, menikmati teh kayu manis pala dan panorama siluet Gunung Banda Api.',
    photo_url:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'acc-5',
    name: 'Maulana Waterfront Heritage Hotel',
    type: 'BOUTIQUE ECO-HOTEL',
    island_name: 'Pulau Neira',
    address: 'Tepi Laut Pelabuhan Neira, Banda Neira',
    price_per_night_rp: 550000,
    rooms_available: 8,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567806',
    description:
      'Hotel legendaris dengan dermaga pribadi menghadap langsung ke kerucut megah Gunung Api dan perairan lumba-lumba.',
    photo_url:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-22T00:00:00Z',
  },
  {
    id: 'acc-6',
    name: 'Ai Island Lagoon Eco-Lodge',
    type: 'BEACH BUNGALOW',
    island_name: 'Pulau Ai',
    address: 'Laguna Pesisir Timur, Pulau Ai',
    price_per_night_rp: 320000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567807',
    description:
      'Penginapan ramah alam di samping laguna biru kristal Pulau Ai dengan paket diving dan konservasi penyu.',
    photo_url:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-25T00:00:00Z',
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

  const openAccommodations = () => {
    setPreferredTourismSubTab('accommodations')
    onNavigate('tourism')
  }

  return (
    <section
      id="eco-stay"
      aria-labelledby="island-stays-heading"
      className="relative w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#f9f8f5] text-slate-900 border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row: Title on Left, Outline Explore More on Right (Ala indonesia.travel) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
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

          <button
            type="button"
            onClick={openAccommodations}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#0f2c59] text-[#0f2c59] hover:bg-[#0f2c59] hover:text-white text-xs font-semibold tracking-wide transition-all duration-200 group self-start md:self-auto"
          >
            <span>Lihat Semua Penginapan</span>
            <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedFilter(opt.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedFilter === opt.key
                  ? 'bg-[#0f2c59] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Catalog Showcase Cards (Poster Style with Terracotta Badge) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((stay) => {
            const formattedPrice = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(stay.price_per_night_rp)

            return (
              <div
                key={stay.id}
                className="group relative flex flex-col rounded-[2rem] overflow-hidden bg-slate-900 aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-300 select-none"
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

                {/* Top Header inside Card */}
                <div className="relative z-10 p-5 flex items-start justify-between w-full">
                  {/* Terracotta/Orange Badge (Identical to 'Music' badge in indonesia.travel) */}
                  <span className="inline-block bg-[#e0672e] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded shadow-sm uppercase font-sans">
                    {stay.type}
                  </span>

                  {/* Eco Verified Pill */}
                  {stay.eco_stay_badge && (
                    <span className="inline-flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm font-sans">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Eco-Stay
                    </span>
                  )}
                </div>

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
        </div>
      </div>
    </section>
  )
}

export default EcoStayCatalogSection
