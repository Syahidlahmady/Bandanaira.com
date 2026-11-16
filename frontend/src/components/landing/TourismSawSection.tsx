import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { setPreferredTourismSubTab, TourismSubTab } from '../../services/tourism'

export interface PublicSawDestination {
  id: string
  name: string
  island: string
  category: 'Bahari & Selam' | 'Sejarah & Benteng' | 'Alam & Rempah'
  costRp: number
  travelMinutes: number
  facilityScore: number
  attractionScore: number
  description: string
  highlights: string[]
  image: string
  guideWhatsapp: string
}

export const PUBLIC_SAW_DESTINATIONS: PublicSawDestination[] = [
  {
    id: 'saw-1',
    name: 'Taman Laut Lava Flow Banda Api',
    island: 'Banda Api',
    category: 'Bahari & Selam',
    costRp: 150000,
    travelMinutes: 15,
    facilityScore: 88,
    attractionScore: 98,
    description:
      'Koloni karang meja raksasa yang tumbuh di atas aliran lava letusan 1988 dengan visibilitas air hingga 30 meter.',
    highlights: ['Snorkeling & Scuba', 'Karang Vulkanik Unik', '15 Menit Perahu'],
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567891',
  },
  {
    id: 'saw-2',
    name: 'Benteng Belgica & Nassau (UNESCO Trail)',
    island: 'Pulau Neira',
    category: 'Sejarah & Benteng',
    costRp: 35000,
    travelMinutes: 8,
    facilityScore: 95,
    attractionScore: 96,
    description:
      'Benteng berarsitektur pentagon utuh abad ke-17 yang menghadap Teluk Banda dan puncak Gunung Banda Api.',
    highlights: ['Cagar Budaya Nasional', 'Audio Guide Sejarah', 'Spot Sunset Terbaik'],
    image:
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567892',
  },
  {
    id: 'saw-3',
    name: 'Pantai & Wall Diving Pulau Hatta',
    island: 'Pulau Hatta',
    category: 'Bahari & Selam',
    costRp: 250000,
    travelMinutes: 45,
    facilityScore: 86,
    attractionScore: 97,
    description:
      'Pulau tenang dengan pasir putih bersih, tebing karang bawah laut, kawanan lumba-lumba, dan homestay ramah lingkungan.',
    highlights: ['Pasir Putih Alami', 'Penyu & Lumba-lumba', 'Eco-Stay Tepi Pantai'],
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567893',
  },
  {
    id: 'saw-4',
    name: 'Rumah Pengasingan Bung Hatta & Sjahrir',
    island: 'Pulau Neira',
    category: 'Sejarah & Benteng',
    costRp: 25000,
    travelMinutes: 5,
    facilityScore: 94,
    attractionScore: 93,
    description:
      'Museum hidup tempat Mohammad Hatta dan Sutan Sjahrir merumuskan gagasan kemerdekaan Indonesia bersama warga Banda.',
    highlights: ['Museum Kemerdekaan', 'Koleksi Asli 1936', 'Pusat Kota Neira'],
    image:
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567892',
  },
  {
    id: 'saw-5',
    name: 'Pendakian Kaldera Gunung Banda Api (656 mdpl)',
    island: 'Banda Api',
    category: 'Alam & Rempah',
    costRp: 200000,
    travelMinutes: 25,
    facilityScore: 78,
    attractionScore: 95,
    description:
      'Jalur pendakian menantang menuju bibir kawah gunung api aktif di tengah laut dengan lanskap kepulauan 360 derajat.',
    highlights: ['Trekking Sunrise', 'Kawah Vulkanik Aktif', 'Pemandu Resmi'],
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567894',
  },
  {
    id: 'saw-6',
    name: 'Agrowisata Perkebunan Pala Pusaka Lonthoir',
    island: 'Banda Besar',
    category: 'Alam & Rempah',
    costRp: 75000,
    travelMinutes: 20,
    facilityScore: 89,
    attractionScore: 92,
    description:
      'Menyusuri hutan pohon kenari raksasa dan kebun pala berusia berabad-abad bersama petani Poktan Lonthoir.',
    highlights: ['Wisata Petik Pala', 'Sumur Pusaka & Benteng Hollandia', 'Kuliner Kenari'],
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567895',
  },
  {
    id: 'saw-7',
    name: 'Eksplorasi Pulau Ai & Benteng Revenge',
    island: 'Pulau Ai',
    category: 'Bahari & Selam',
    costRp: 220000,
    travelMinutes: 40,
    facilityScore: 84,
    attractionScore: 94,
    description:
      'Perpaduan laguna biru turkois, desa tua bersejarah Benteng Revenge, dan spot berenang bersama hiu karang ramah.',
    highlights: ['Benteng Revenge VOC', 'Laguna Karang Sehat', 'Snorkeling Hiu Karang'],
    image:
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567896',
  },
  {
    id: 'saw-8',
    name: 'Pulau Rhun (Pertukaran Bersejarah Manhattan 1667)',
    island: 'Pulau Rhun',
    category: 'Sejarah & Benteng',
    costRp: 280000,
    travelMinutes: 60,
    facilityScore: 81,
    attractionScore: 96,
    description:
      'Pulau legendaris yang ditukar Inggris dengan pulau Manhattan New York dalam Traktat Breda 1667 karena pala.',
    highlights: ['Traktat Breda 1667', 'Desa Tradisional', 'Wisata Sejarah Unik'],
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567897',
  },
]

interface TourismHighlightItem {
  title: string
  description: string
  iconType: 'marine' | 'heritage' | 'volcano'
  actionLabel: string
  targetSubTab: TourismSubTab
}

const TOURISM_HIGHLIGHTS: TourismHighlightItem[] = [
  {
    title: 'Taman laut & karang',
    description: 'Karang meja Lava Flow Banda Api, wall diving Pulau Hatta, dan laguna Pulau Ai.',
    iconType: 'marine',
    actionLabel: 'Lihat tempat wisata',
    targetSubTab: 'destinations',
  },
  {
    title: 'Benteng & jejak sejarah',
    description: 'Benteng Belgica, Nassau, Rumah Pengasingan Hatta-Sjahrir, hingga Pulau Rhun.',
    iconType: 'heritage',
    actionLabel: 'Lihat cagar budaya',
    targetSubTab: 'heritage',
  },
  {
    title: 'Kaldera & kebun pala',
    description: 'Pendakian sunrise Gunung Banda Api dan agrowisata pala pusaka Lonthoir.',
    iconType: 'volcano',
    actionLabel: 'Lihat tempat wisata',
    targetSubTab: 'destinations',
  },
]

export interface TourismSawSectionProps {
  onNavigate: (tab: any) => void
}

export const TourismSawSection: React.FC<TourismSawSectionProps> = ({ onNavigate }) => {
  const openTourismSubTab = (subTab: TourismSubTab) => {
    setPreferredTourismSubTab(subTab)
    onNavigate('tourism')
  }

  return (
    <section
      id="wisata"
      aria-labelledby="tourism-routes-heading"
      className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-16 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
    >
      <header className="flex flex-col max-w-[430px] items-start gap-[18px] relative">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
          <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            DESTINASI WISATA &amp; PERENCANA CERDAS
          </p>
        </div>

        <h2
          id="tourism-routes-heading"
          className="relative self-stretch font-medium text-[#0f2c59] text-[28px] sm:text-[31px] tracking-[-1.00px] leading-[38.8px]"
        >
          Bahari jernih, benteng tua, dan puncak api.
        </h2>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => openTourismSubTab('destinations')}
            className="inline-flex h-[42px] items-center gap-2 bg-[#0f2c59] hover:bg-[#173d7a] text-white rounded-lg px-5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2c59]"
          >
            <span>Jelajahi Destinasi</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('smart_planner')}
            className="inline-flex h-[42px] items-center gap-2 border border-[#dce1df] bg-white hover:bg-amber-50 text-[#0f2c59] rounded-lg px-4 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            <span>Kalkulator Wisata SAW</span>
          </button>
        </div>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-[30px] relative flex-1 w-full">
        {TOURISM_HIGHLIGHTS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-start gap-3.5 relative flex-1 grow"
          >
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
              {item.iconType === 'marine' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 15c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 5-2" />
                  <path d="M2 19c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 5-2" />
                  <circle cx="12" cy="7" r="3" />
                </svg>
              )}
              {item.iconType === 'heritage' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                </svg>
              )}
              {item.iconType === 'volcano' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 20h18L14 7l-3 5-2-3-6 11z" />
                </svg>
              )}
            </div>
            <h3 className="relative self-stretch font-semibold text-[#0f2c59] text-[15px] tracking-[0] leading-[normal]">
              {item.title}
            </h3>
            <p className="relative self-stretch font-normal text-[#63717d] text-[13px] tracking-[0] leading-[21.4px]">
              {item.description}
            </p>
            <button
              type="button"
              onClick={() => openTourismSubTab(item.targetSubTab)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-[#0f2c59] transition-colors"
            >
              <span>{item.actionLabel}</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TourismSawSection
