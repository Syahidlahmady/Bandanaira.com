import React from 'react'
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
      'Homestay keluarga di bawah rindangnya pohon pala dan kenari, sarapan kuliner lokal kue kenari dan ikan asar segar.',
    photo_url:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-12T00:00:00Z',
  },
  {
    id: 'acc-4',
    name: 'Hatta Coral Reef Bungalows',
    type: 'BEACH BUNGALOW',
    island_name: 'Pulau Hatta',
    address: 'Pesisir Barat Pulau Hatta, Kepulauan Banda',
    price_per_night_rp: 300000,
    rooms_available: 7,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567804',
    description:
      'Bungalow tepi pantai berpasir putih hanya 10 langkah dari titik snorkeling drop-off terumbu karang Pulau Hatta.',
    photo_url:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-18T00:00:00Z',
  },
]

interface StayFeatureItem {
  title: string
  description: string
  iconType: 'home' | 'water' | 'solar'
}

const STAY_FEATURES: StayFeatureItem[] = [
  {
    title: 'Homestay keluarga warga',
    description: 'Pilihan rumah singgah dan bungalow pesisir terverifikasi di Neira hingga Hatta.',
    iconType: 'home',
  },
  {
    title: 'Jaminan air bersih RO',
    description: 'Penginapan mitra dilengkapi akses air minum Reverse Osmosis yang higienis.',
    iconType: 'water',
  },
  {
    title: 'Dukungan energi surya',
    description: 'Cadangan listrik tenaga surya ramah lingkungan untuk kenyamanan malam hari.',
    iconType: 'solar',
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
  return (
    <section
      id="eco-stay"
      aria-labelledby="island-stays-heading"
      className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-16 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0] border-t border-[#dce1df]/70"
    >
      <header className="flex flex-col max-w-[430px] items-start gap-[18px] relative">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
          <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            DIREKTORI PENGINAPAN &amp; ECO-STAY
          </p>
        </div>

        <h2
          id="island-stays-heading"
          className="relative self-stretch font-medium text-[#0f2c59] text-[28px] sm:text-[31px] tracking-[-1.00px] leading-[38.8px]"
        >
          Singgah lebih dekat bersama warga pulau.
        </h2>

        <button
          type="button"
          onClick={() => {
            setPreferredTourismSubTab('accommodations')
            onNavigate('tourism')
          }}
          className="inline-flex h-[42px] items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
        >
          <span>Lihat Eco-Stay &amp; Vila</span>
          <ArrowUpRightIcon className="w-4 h-4" />
        </button>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-[30px] relative flex-1 w-full">
        {STAY_FEATURES.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-start gap-3.5 relative flex-1 grow"
          >
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
              {item.iconType === 'home' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
                  <path d="M9 21v-7h6v7" />
                </svg>
              )}
              {item.iconType === 'water' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              )}
              {item.iconType === 'solar' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
            </div>
            <h3 className="relative self-stretch font-semibold text-[#0f2c59] text-[15px] tracking-[0] leading-[normal]">
              {item.title}
            </h3>
            <p className="relative self-stretch font-normal text-[#63717d] text-[13px] tracking-[0] leading-[21.4px]">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default EcoStayCatalogSection
