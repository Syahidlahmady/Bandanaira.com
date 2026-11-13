import React, { useEffect, useMemo, useState } from 'react'
import bandaCinematicVideoBackdrop from '../../assets/image.webp'
import { InteractiveMapWorkspace } from '../InteractiveMapWorkspace'
import { VERIFIED_MARKETPLACE_PRODUCTS } from '../../components/VerifiedMarketplaceModal'
import { tourismService, AccommodationItem } from '../../services/tourism'

export type NavTabType =
  | 'population'
  | 'letters'
  | 'farming'
  | 'traceability'
  | 'koperasi'
  | 'iot'
  | 'tourism'
  | 'gis'
  | 'audit'
  | 'smart_planner'
  | 'survei'

export interface BandanairaBerandaProps {
  onNavigate: (tab: NavTabType) => void
  onOpenLogin: () => void
  onOpenRegister?: () => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  currentUser: any
  isOnline?: boolean
  onLogout?: () => void
  onOpenQuickLogin?: () => void
  onToggleViewMode?: () => void
  viewMode?: 'editorial' | 'command'
}

interface FooterLinkItem {
  label: string
  href?: string
  tab?: NavTabType
  action?: 'login' | 'register' | 'quicklogin'
}

interface FooterLinkGroup {
  title: string
  links: FooterLinkItem[]
}

const navigationItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Peta GIS', href: '#peta' },
  { label: 'Wisata (SAW)', href: '#wisata' },
  { label: 'Penginapan', href: '#eco-stay' },
  { label: 'Marketplace UMKM', href: '#layanan-umkm' },
  { label: 'Sejarah & Warga', href: '#sejarah' },
]

const introductionItems = [
  {
    title: 'Jelajahi pulau',
    description: 'Temukan laut, sejarah, dan tempat singgah.',
    iconType: 'compass' as const,
  },
  {
    title: 'Kenali warisannya',
    description: 'Baca kisah di balik 177 situs cagar budaya.',
    iconType: 'heritage' as const,
  },
  {
    title: 'Dukung kehidupan lokal',
    description: 'Terhubung dengan warga dan usaha pulau.',
    iconType: 'community' as const,
  },
]

interface PublicSawDestination {
  id: string
  name: string
  island: string
  category: 'Bahari & Selam' | 'Sejarah & Benteng' | 'Alam & Rempah'
  costRp: number // C1 (Cost - semakin terjangkau semakin tinggi skor)
  travelMinutes: number // C2 (Cost - waktu tempuh dari Pelabuhan Neira)
  facilityScore: number // C3 (Benefit 1-100 - kelengkapan 4A)
  attractionScore: number // C4 (Benefit 1-100 - keunikan & rating)
  description: string
  highlights: string[]
  image: string
  guideWhatsapp: string
}

const PUBLIC_SAW_DESTINATIONS: PublicSawDestination[] = [
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
    highlights: ['Laguna Turkois', 'Benteng Revenge 1616', 'Snorkeling Tebing Ai'],
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567896',
  },
  {
    id: 'saw-8',
    name: 'Pulau Rhun (Pulau Pertukaran Manhattan)',
    island: 'Pulau Rhun',
    category: 'Sejarah & Benteng',
    costRp: 320000,
    travelMinutes: 65,
    facilityScore: 80,
    attractionScore: 96,
    description:
      'Pulau bersejarah dalam Perjanjian Breda 1667 yang ditukar Belanda dengan Pulau Manhattan (New York) karena monopoli pala.',
    highlights: ['Sejarah Perjanjian Breda 1667', 'Terumbu Karang Perawan', 'Wisata Edukasi Dunia'],
    image:
      'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567897',
  },
]

const FALLBACK_ACCOMMODATIONS: AccommodationItem[] = [
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
    id: 'acc-3',
    name: 'Baba Lagoon Waterfront Eco-Lodge',
    type: 'ECO-LODGE',
    island_name: 'Pulau Neira',
    address: 'Tepi Teluk Tanah Rata, Banda Neira',
    price_per_night_rp: 520000,
    rooms_available: 5,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567803',
    description:
      'Bungalow kayu di tepi perairan tenang menghadap Gunung Banda Api dengan dermaga pribadi untuk perahu snorkeling.',
    photo_url:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-15T00:00:00Z',
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
  {
    id: 'acc-5',
    name: 'Ai Island Spice Garden Cottage',
    type: 'HOMESTAY WARGA',
    island_name: 'Pulau Ai',
    address: 'Desa Ai, Dekat Benteng Revenge, Pulau Ai',
    price_per_night_rp: 280000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: false,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567805',
    description:
      'Penginapan asri milik komunitas petani pala Pulau Ai dengan suasana kampung rempah yang tenang dan autentik.',
    photo_url:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'acc-6',
    name: 'Lonthoir Nutmeg Ridge Guest House',
    type: 'HOMESTAY WARGA',
    island_name: 'Banda Besar',
    address: 'Desa Lonthoir, Pulau Banda Besar',
    price_per_night_rp: 320000,
    rooms_available: 3,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567806',
    description:
      'Singgah di tengah sentra perkebunan pala tertua Banda Besar dengan tur langsung pengeringan pala dan fuli bersama warga.',
    photo_url:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-22T00:00:00Z',
  },
]

const heritageThemes = [
  'Benteng & arsitektur',
  'Jalur rempah',
  'Cerita masyarakat',
]

const residentServices = [
  {
    title: 'Air bersih RO',
    description:
      'Informasi kuota air reverse osmosis untuk kebutuhan rumah tangga dan kehidupan sehari-hari.',
    action: 'Lihat layanan air',
    actionTab: 'koperasi' as NavTabType,
    iconType: 'water' as const,
  },
  {
    title: 'Energi surya',
    description:
      'Kenali layanan dan informasi energi surya sebagai bagian dari ekosistem pulau.',
    action: 'Informasi energi',
    actionTab: 'iot' as NavTabType,
    iconType: 'solar' as const,
  },
  {
    title: 'Administrasi NIK',
    description:
      'Akses informasi administrasi kependudukan dan kebutuhan data NIK melalui portal warga.',
    action: 'Layanan kependudukan',
    actionTab: 'letters' as NavTabType,
    iconType: 'id' as const,
  },
]

const travelGuidelines = [
  {
    title: 'Jaga lautnya',
    description: 'Biarkan karang dan biota tetap di habitatnya.',
    iconType: 'waves' as const,
  },
  {
    title: 'Hormati budayanya',
    description: 'Kenali adat dan hargai ruang hidup warga.',
    iconType: 'culture' as const,
  },
  {
    title: 'Pilih yang lokal',
    description: 'Singgah, belanja, dan tumbuh bersama pulau.',
    iconType: 'leaf' as const,
  },
]

const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Jelajahi Banda',
    links: [
      { label: 'Beranda', href: '#beranda' },
      { label: 'Peta', href: '#peta' },
      { label: 'Sejarah', href: '#sejarah' },
      { label: 'Wisata', href: '#wisata' },
    ],
  },
  {
    title: 'Ekosistem pulau',
    links: [
      { label: 'Penduduk & Fasilitas', href: '#penduduk-fasilitas' },
      { label: 'Layanan UMKM', href: '#layanan-umkm' },
      { label: 'Koperasi Hatta', tab: 'koperasi' },
      { label: 'Direktori Eco-Stay', tab: 'tourism' },
    ],
  },
  {
    title: 'Akses akun',
    links: [
      { label: 'Daftar Akun Baru', action: 'register' },
      { label: 'Masuk / Login', action: 'login' },
      { label: 'Penduduk', tab: 'letters' },
      { label: 'Mitra homestay', tab: 'tourism' },
      { label: 'Operator', action: 'quicklogin' },
    ],
  },
]

/* Inline SVG Helpers matching Figma vectors */
const NutmegLogoIcon = () => (
  <svg
    className="relative w-[20.32px] h-[25.24px] shrink-0"
    viewBox="0 0 21 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10.5 2C6.5 6 4 10.5 4 14.5C4 18.09 6.91 21 10.5 21C14.09 21 17 18.09 17 14.5C17 10.5 14.5 6 10.5 2Z"
      stroke="#F4B75E"
      strokeWidth="1.6"
      fill="rgba(244, 183, 94, 0.18)"
    />
    <path
      d="M10.5 7.5C8.8 10 8 12.2 8 14.2C8 15.86 9.12 17.2 10.5 17.2C11.88 17.2 13 15.86 13 14.2C13 12.2 12.2 10 10.5 7.5Z"
      fill="#F4B75E"
    />
    <path
      d="M2 23.5C4.5 22 7.2 22 10.5 23.5C13.8 25 16.5 25 19 23.5"
      stroke="#F4B75E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const ArrowUpRightIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4.5 13.5L13.5 4.5M13.5 4.5H6M13.5 4.5V12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ArrowDownIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8 3V13M8 13L12.5 8.5M8 13L3.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const BandanairaBeranda: React.FC<BandanairaBerandaProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenMarketplace,
  onPublicVerify,
  currentUser,
  onLogout,
  onOpenQuickLogin,
}) => {
  const [activeNav, setActiveNav] = useState<string>('#beranda')
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  // SAW Wisata States
  const [sawIslandFilter, setSawIslandFilter] = useState<string>('SEMUA')
  const [sawCategoryFilter, setSawCategoryFilter] = useState<string>('SEMUA')
  const [wCost, setWCost] = useState<number>(0.25)
  const [wDistance, setWDistance] = useState<number>(0.20)
  const [wFacility, setWFacility] = useState<number>(0.30)
  const [wAttraction, setWAttraction] = useState<number>(0.25)

  // Penginapan States
  const [accommodationsList, setAccommodationsList] = useState<AccommodationItem[]>(FALLBACK_ACCOMMODATIONS)
  const [stayIslandFilter, setStayIslandFilter] = useState<string>('SEMUA')
  const [stayRoFilter, setStayRoFilter] = useState<boolean>(false)
  const [staySolarFilter, setStaySolarFilter] = useState<boolean>(false)
  const [bookingModalAcc, setBookingModalAcc] = useState<AccommodationItem | null>(null)
  const [bookingGuestName, setBookingGuestName] = useState<string>('')
  const [bookingGuestPhone, setBookingGuestPhone] = useState<string>('')
  const [bookingCheckIn, setBookingCheckIn] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  )
  const [bookingNights, setBookingNights] = useState<number>(2)
  const [bookingRooms, setBookingRooms] = useState<number>(1)

  // Marketplace States
  const [marketCategory, setMarketCategory] = useState<'ALL' | 'REMPAH' | 'PERIKANAN' | 'OLAHAN'>('ALL')
  const [marketSearch, setMarketSearch] = useState<string>('')

  // Fetch Accommodations API with Fallback
  useEffect(() => {
    let isMounted = true
    tourismService
      .listAccommodations()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setAccommodationsList(data)
        }
      })
      .catch(() => {
        // Fallback to FALLBACK_ACCOMMODATIONS
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Dynamic SAW Destinations Ranking
  const sawRankedDestinations = useMemo(() => {
    const filtered = PUBLIC_SAW_DESTINATIONS.filter((d) => {
      const matchIsland = sawIslandFilter === 'SEMUA' || d.island === sawIslandFilter
      const matchCat = sawCategoryFilter === 'SEMUA' || d.category === sawCategoryFilter
      return matchIsland && matchCat
    })

    if (filtered.length === 0) return []

    const sumW = (wCost + wDistance + wFacility + wAttraction) || 1.0
    const normW1 = wCost / sumW
    const normW2 = wDistance / sumW
    const normW3 = wFacility / sumW
    const normW4 = wAttraction / sumW

    const minCost = Math.min(...filtered.map((d) => d.costRp))
    const minDistance = Math.min(...filtered.map((d) => d.travelMinutes))
    const maxFacility = Math.max(...filtered.map((d) => d.facilityScore))
    const maxAttraction = Math.max(...filtered.map((d) => d.attractionScore))

    const scored = filtered.map((d) => {
      const rCost = d.costRp > 0 ? minCost / d.costRp : 1
      const rDistance = d.travelMinutes > 0 ? minDistance / d.travelMinutes : 1
      const rFacility = maxFacility > 0 ? d.facilityScore / maxFacility : 1
      const rAttraction = maxAttraction > 0 ? d.attractionScore / maxAttraction : 1

      const score = normW1 * rCost + normW2 * rDistance + normW3 * rFacility + normW4 * rAttraction

      return {
        ...d,
        rCost,
        rDistance,
        rFacility,
        rAttraction,
        sawScore: Number(score.toFixed(4)),
        sawPercent: Math.round(score * 100),
      }
    })

    return scored.sort((a, b) => b.sawScore - a.sawScore)
  }, [sawIslandFilter, sawCategoryFilter, wCost, wDistance, wFacility, wAttraction])

  // Filtered Accommodations
  const filteredAccommodations = useMemo(() => {
    return accommodationsList.filter((acc) => {
      const matchIsland = stayIslandFilter === 'SEMUA' || acc.island_name.toLowerCase().includes(stayIslandFilter.toLowerCase())
      const matchRo = !stayRoFilter || acc.has_clean_ro_water
      const matchSolar = !staySolarFilter || acc.has_solar_backup
      return matchIsland && matchRo && matchSolar
    })
  }, [accommodationsList, stayIslandFilter, stayRoFilter, staySolarFilter])

  // Filtered Marketplace Products
  const filteredProducts = useMemo(() => {
    const q = marketSearch.trim().toLowerCase()
    return VERIFIED_MARKETPLACE_PRODUCTS.filter((prod) => {
      const matchCat = marketCategory === 'ALL' || prod.category === marketCategory
      const matchQuery =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.producer.toLowerCase().includes(q) ||
        prod.originVillage.toLowerCase().includes(q) ||
        prod.batchCode.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [marketCategory, marketSearch])

  return (
    <div className="flex min-h-screen w-full flex-col items-start bg-[#f7f5f0] text-[#0f2c59] selection:bg-[#f4b75e] selection:text-[#081d35]">
      {/* =====================================================================
          1. BANDA HERO SECTION + NAVBAR (Sesuai desainsaatini/BandaHeroSection.tsx)
      ====================================================================== */}
      <section
        id="beranda"
        aria-labelledby="banda-hero-title"
        className="flex flex-col min-h-[820px] lg:h-[900px] items-start justify-between pt-6 pb-8 px-5 sm:px-8 lg:px-12 relative self-stretch w-full bg-[#081d35] overflow-hidden"
      >
        {/* Background Image dari frontend/src/assets/image.webp */}
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt="Pemandangan Banda Neira dari udara dengan laut dan pulau-pulau di sekitarnya"
          src={bandaCinematicVideoBackdrop}
        />

        {/* Gradient Overlay sesuai Figma */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-[linear-gradient(0deg,rgba(8,29,53,0.47)_0%,rgba(8,29,53,0.13)_30%,rgba(8,29,53,0.47)_70%,rgba(8,29,53,0.96)_100%)]"
        />

        {/* NAVBAR (Sesuai desainsaatini/BandaHeroSection.tsx lines 33-82) */}
        <header className="flex h-20 items-center justify-between px-6 py-0 relative z-20 self-stretch w-full bg-[#081d354d] rounded-2xl overflow-hidden border border-solid border-[#ffffff38] backdrop-blur-[9px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(9px)_brightness(100%)]">
          <a
            href="#beranda"
            onClick={() => setActiveNav('#beranda')}
            aria-label="bandanaira.com, kembali ke Beranda"
            className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
          >
            <NutmegLogoIcon />
            <span className="relative w-fit font-normal text-white text-[21px] sm:text-[23px] tracking-[-0.90px] leading-[normal]">
              bandanaira.com
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav
            aria-label="Navigasi utama"
            className="hidden lg:inline-flex items-center gap-[25px] relative flex-[0_0_auto]"
          >
            {navigationItems.map((item) => {
              const isActive = activeNav === item.href
              return (
                <div
                  key={item.label}
                  className="inline-flex flex-col items-start gap-2 relative flex-[0_0_auto]"
                >
                  <a
                    href={item.href}
                    onClick={() => setActiveNav(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative w-fit mt-[-1.00px] font-normal text-white hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
                  >
                    {item.label}
                  </a>
                  {isActive && (
                    <div
                      aria-hidden="true"
                      className="relative w-[22px] h-0.5 bg-[#f4b75e]"
                    />
                  )}
                </div>
              )
            })}
          </nav>

          {/* Right Action Area: Masuk / Login */}
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            {currentUser ? (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('population')}
                  className="inline-flex h-[42px] items-center px-[18px] py-0 relative flex-[0_0_auto] bg-[#d9770626] hover:bg-[#d9770640] rounded-md overflow-hidden border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                >
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                    {currentUser.full_name || currentUser.username}
                  </span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-[42px] items-center px-3 py-0 bg-rose-500/20 hover:bg-rose-500/35 rounded-md border border-solid border-rose-400/50 text-white text-xs font-semibold transition-colors"
                    title="Keluar dari Akun"
                  >
                    Keluar
                  </button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2">
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="hidden sm:inline-flex h-[42px] items-center px-[16px] py-0 relative flex-[0_0_auto] bg-amber-600 hover:bg-amber-500 rounded-md overflow-hidden border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
                  >
                    <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                      Daftar
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex h-[42px] items-center px-[18px] py-0 relative flex-[0_0_auto] bg-[#d9770626] hover:bg-[#d9770640] rounded-md overflow-hidden border border-solid border-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
                >
                  <span className="font-semibold text-white text-xs tracking-[0] relative w-fit leading-[normal]">
                    Masuk / Login
                  </span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex lg:hidden h-[42px] w-[42px] items-center justify-center rounded-md border border-solid border-[#ffffff38] bg-[#081d3566] text-white text-lg"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="relative z-30 w-full mt-2 rounded-2xl bg-[#081d35e6] border border-solid border-[#ffffff38] backdrop-blur-md p-5 lg:hidden">
            <nav aria-label="Navigasi seluler" className="flex flex-col gap-3.5">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActiveNav(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className={`text-sm font-medium py-1 ${
                    activeNav === item.href ? 'text-[#f4b75e]' : 'text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              {!currentUser && (
                <>
                  <div className="h-px bg-[#ffffff38] my-1" />
                  <div className="flex flex-wrap gap-2">
                    {onOpenRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onOpenRegister()
                        }}
                        className="h-10 px-4 rounded-md bg-amber-600 border border-[#f4b75e] text-white text-xs font-semibold"
                      >
                        Daftar Akun
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onOpenLogin()
                      }}
                      className="h-10 px-4 rounded-md bg-[#d9770626] border border-[#f4b75e] text-white text-xs font-semibold"
                    >
                      Masuk / Login
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}

        {/* HERO MAIN CONTENT (Sesuai desainsaatini/BandaHeroSection.tsx lines 83-138) */}
        <main className="flex flex-col items-start gap-6 pt-12 lg:pt-[95px] pb-0 px-2 sm:px-8 relative z-10 self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
            <div aria-hidden="true" className="w-8 relative h-px bg-[#f4b75e]" />
            <p className="relative w-fit mt-[-1.00px] font-normal text-white text-xs tracking-[2.60px] leading-[normal]">
              KEPULAUAN BANDA · MALUKU, INDONESIA
            </p>
          </div>

          <h1
            id="banda-hero-title"
            className="relative max-w-[1000px] font-normal text-white text-[44px] sm:text-[64px] lg:text-[80px] leading-[1.05] lg:leading-[83.2px]"
          >
            <span className="font-medium tracking-[-2.0px] lg:tracking-[-3.20px]">
              Di jantung rempah dunia,
              <br />
            </span>
            <span className="font-serif font-medium italic text-[52px] sm:text-[74px] lg:text-[94px] tracking-[-1.88px] leading-[1.04] lg:leading-[97.8px]">
              temukan Banda.
            </span>
          </h1>

          <p className="relative max-w-[580px] font-normal text-[#c1ced8] text-[16px] sm:text-[17px] tracking-[0] leading-[28.9px]">
            Laut yang menyimpan keajaiban. Jejak sejarah yang hidup. Satu pintu
            untuk menjelajah dan terhubung dengan kehidupan pulau.
          </p>

          <div className="inline-flex flex-wrap items-start gap-3 pt-2 pb-0 px-0 relative flex-[0_0_auto]">
            <a
              href="#wisata"
              onClick={() => setActiveNav('#wisata')}
              className="inline-flex h-[54px] items-center gap-4 px-6 py-0 relative flex-[0_0_auto] bg-amber-600 hover:bg-amber-500 transition-colors rounded-lg overflow-hidden border border-solid border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
            >
              <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
                Mulai jelajahi Banda
              </span>
              <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
            </a>

            <button
              type="button"
              onClick={() => onNavigate('gis')}
              className="flex-[0_0_auto] border-[#ffffff38] bg-[#081d3540] hover:bg-[#ffffff1a] transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081d35]"
            >
              <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
                Lihat peta pulau
              </span>
              <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
            </button>
          </div>
        </main>

        {/* HERO FOOTER BAR (Sesuai desainsaatini/BandaHeroSection.tsx lines 139-172) */}
        <footer className="flex flex-wrap items-center justify-between gap-4 pt-11 pb-0 px-2 sm:px-8 relative z-10 self-stretch w-full flex-[0_0_auto] border-0 border-none">
          <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
            <div className="flex w-9 h-9 items-center justify-center relative rounded-[100px] overflow-hidden border border-solid border-[#ffffff38]">
              <svg
                className="w-3.5 h-3.5 text-white fill-current ml-0.5"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M4 2.5v11l9-5.5-9-5.5z" />
              </svg>
            </div>
            <p className="relative w-fit font-normal text-white text-[11px] tracking-[1.00px] leading-[normal] whitespace-nowrap">
              SEKILAS BANDA · VIDEO BERULANG
            </p>
          </div>

          <a
            href="#sejarah"
            onClick={() => setActiveNav('#sejarah')}
            className="inline-flex items-center gap-3 relative flex-[0_0_auto] text-white hover:text-[#f4b75e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
          >
            <span className="mt-[-1.00px] font-normal text-[11px] tracking-[0] whitespace-nowrap relative w-fit leading-[normal]">
              Ada cerita di setiap pulau
            </span>
            <ArrowDownIcon className="w-4 h-4" />
          </a>

          <p className="relative w-fit font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
            Banda Neira &amp; Gunung Banda Api
          </p>
        </footer>
      </section>

      {/* =====================================================================
          2. ISLAND INTRODUCTION SECTION (desainsaatini/IslanIntroductionSection.tsx)
      ====================================================================== */}
      <section
        aria-labelledby="island-introduction-title"
        className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-16 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
      >
        <header className="flex flex-col max-w-[430px] items-start gap-[18px] relative">
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
            <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
              BANDA SMART TOURISM &amp; ISLAND ECOSYSTEM
            </p>
          </div>
          <h2
            id="island-introduction-title"
            className="relative self-stretch font-medium text-[#0f2c59] text-[28px] sm:text-[31px] tracking-[-1.00px] leading-[38.8px]"
          >
            Bukan sekadar destinasi. Sebuah kehidupan yang terhubung.
          </h2>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-[30px] relative flex-1 w-full">
          {introductionItems.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-start gap-3.5 relative flex-1 grow"
            >
              <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
                {item.iconType === 'compass' && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                )}
                {item.iconType === 'heritage' && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  </svg>
                )}
                {item.iconType === 'community' && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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

      {/* =====================================================================
          3. INTERACTIVE ISLAND MAP SECTION (desainsaatini/interactiveMapSection.tsx)
      ====================================================================== */}
      <section
        id="peta"
        className="flex flex-col items-start gap-[32px] pt-12 pb-20 px-6 sm:px-12 lg:px-20 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col max-w-[700px] items-start gap-[18px] relative">
            <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
              <div className="relative w-6 h-px bg-amber-600" />
              <span className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
                PETA EKSPLORASI SPASIAL
              </span>
            </div>
            <h2 className="relative self-stretch font-medium text-[#0f2c59] text-[36px] sm:text-[50px] tracking-[-2.00px] leading-[1.12]">
              Banda, dari sudut pandang baru.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('gis')}
              className="inline-flex h-10 items-center gap-2 px-5 bg-[#081d35] hover:bg-[#0f2c59] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Layar Penuh Peta</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="w-full min-h-[640px] rounded-2xl overflow-hidden border border-[#dce1df] shadow-md bg-white p-4 sm:p-6">
          <InteractiveMapWorkspace currentUser={currentUser} />
        </div>
      </section>

      {/* =====================================================================
          4. SPICE HERITAGE SECTION (desainsaatini/SpiceHeritageSection.tsx)
      ====================================================================== */}
      <section
        id="sejarah"
        aria-labelledby="heritage-heading"
        className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-24 relative self-stretch w-full flex-[0_0_auto] bg-[#081d35]"
      >
        <figure className="flex flex-col w-full lg:w-[600px] items-start relative shrink-0">
          <div className="relative w-full h-[380px] sm:h-[510px] overflow-hidden rounded-xl">
            <img
              className="w-full h-full object-cover"
              alt="Benteng Belgica overlooking the sea in Banda Neira"
              src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=85"
            />
            <div
              className="inline-flex flex-col items-start gap-1 px-6 py-5 absolute bottom-6 left-6 bg-[#081d35d9] backdrop-blur-sm rounded-lg border border-[#ffffff24] overflow-hidden"
              aria-label="177 cultural heritage sites"
            >
              <span className="relative w-fit mt-[-1.00px] font-serif font-normal text-[#f4b75e] text-5xl sm:text-6xl tracking-[0] leading-[60px] whitespace-nowrap">
                177
              </span>
              <span className="relative w-fit font-normal text-white text-[11px] tracking-[1.00px] leading-[normal] whitespace-nowrap">
                SITUS CAGAR BUDAYA
              </span>
            </div>
          </div>
          <figcaption className="flex items-start justify-between pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <span className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
              Benteng Belgica, Banda Neira
            </span>
            <span className="relative w-fit mt-[-1.00px] font-normal text-[#f4b75e] text-[10px] tracking-[1.20px] leading-[normal] whitespace-nowrap">
              JEJAK KEPULAUAN REMPAH
            </span>
          </figcaption>
        </figure>

        <div className="flex flex-col items-start gap-6 relative flex-1 grow">
          <div
            className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
            aria-label="Section category"
          >
            <span className="w-6 relative h-px bg-[#f4b75e]" aria-hidden="true" />
            <span className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
              SEJARAH YANG MASIH HIDUP
            </span>
          </div>

          <h2
            id="heritage-heading"
            className="font-medium text-white text-[38px] sm:text-[52px] tracking-[-2.00px] leading-[1.12] sm:leading-[58.2px] relative self-stretch"
          >
            Pulau kecil.
            <br />
            Jejak besar dalam
            <br />
            sejarah dunia.
          </h2>

          <p className="text-[#c1ced8] text-base leading-7 relative self-stretch font-normal tracking-[0]">
            Dari kebun pala hingga benteng di tepi laut, Banda menyimpan kisah
            kejayaan perdagangan rempah dunia. Di balik setiap bangunan, ada
            cerita tentang perjumpaan, perjuangan, dan kehidupan yang terus
            tumbuh.
          </p>

          <ul
            className="flex flex-wrap items-start gap-8 px-0 py-5 relative self-stretch w-full flex-[0_0_auto] border-t border-b border-[#ffffff38]"
            aria-label="Heritage topics"
          >
            {heritageThemes.map((theme) => (
              <li
                key={theme}
                className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap"
              >
                ✦ {theme}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => onNavigate('tourism')}
            className="bg-amber-600 hover:bg-amber-500 transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
            aria-label="Telusuri sejarah Banda"
          >
            <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
              Telusuri sejarah Banda
            </span>
            <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
          </button>
        </div>
      </section>

      {/* =====================================================================
          5. MARINE & HERITAGE TOURISM WITH SAW RECOMMENDER SECTION
      ====================================================================== */}
      <section
        id="wisata"
        aria-labelledby="marine-experiences-title"
        className="relative flex w-full flex-col items-start gap-10 self-stretch bg-[#f7f5f0] px-6 py-16 sm:px-12 lg:px-20 lg:py-24"
      >
        <header className="flex w-full flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div className="relative flex w-full flex-col items-start gap-[18px] md:max-w-[760px]">
            <div className="relative inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="relative h-px w-6 bg-amber-600"
              />
              <span className="relative w-fit whitespace-nowrap text-[11px] font-semibold leading-[normal] tracking-[1.80px] text-amber-600">
                DESTINASI &amp; SISTEM PENDUKUNG KEPUTUSAN WISATA (SAW)
              </span>
            </div>
            <h2
              id="marine-experiences-title"
              className="relative self-stretch text-[36px] font-medium leading-[42px] tracking-[-2.00px] text-[#0f2c59] md:text-[50px] md:leading-[56px]"
            >
              Destinasi Pilihan &amp;
              <br />
              Rekomendasi Cerdas Wisata
            </h2>
            <p className="text-[#63717d] text-base leading-relaxed">
              Temukan spot bahari, sejarah, dan alam terbaik di Kepulauan Banda. Sesuaikan preferensi bobot Anda
              untuk mendapatkan peringkat rekomendasi berbasis algoritma <b>Simple Additive Weighting (SAW)</b>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('smart_planner')}
              className="inline-flex h-[46px] shrink-0 items-center gap-3 overflow-hidden rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-5 py-0 text-xs font-semibold transition-colors"
            >
              <span>Buka Smart Planner Penuh</span>
              <ArrowUpRightIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SAW Controls & Preferences Panel */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-[#dce1df] shadow-sm flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#dce1df]">
            <div>
              <h3 className="text-base font-bold text-[#0f2c59]">
                Kalkulator Rekomendasi Cerdas SAW
              </h3>
              <p className="text-xs text-[#63717d] mt-0.5">
                Atur bobot kriteria sesuai gaya perjalanan Anda untuk mengurutkan destinasi secara objektif.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#63717d] font-medium mr-1">Preset Cepat:</span>
              <button
                type="button"
                onClick={() => {
                  setWCost(0.40)
                  setWDistance(0.25)
                  setWFacility(0.20)
                  setWAttraction(0.15)
                }}
                className="px-3 py-1.5 rounded-md bg-[#f7f5f0] hover:bg-amber-100 hover:text-amber-900 text-[#0f2c59] font-medium transition-colors"
              >
               Hemat Budget
              </button>
              <button
                type="button"
                onClick={() => {
                  setWCost(0.15)
                  setWDistance(0.45)
                  setWFacility(0.25)
                  setWAttraction(0.15)
                }}
                className="px-3 py-1.5 rounded-md bg-[#f7f5f0] hover:bg-amber-100 hover:text-amber-900 text-[#0f2c59] font-medium transition-colors"
              >
                Dekat &amp; Akses Cepat
              </button>
              <button
                type="button"
                onClick={() => {
                  setWCost(0.15)
                  setWDistance(0.15)
                  setWFacility(0.25)
                  setWAttraction(0.45)
                }}
                className="px-3 py-1.5 rounded-md bg-[#f7f5f0] hover:bg-amber-100 hover:text-amber-900 text-[#0f2c59] font-medium transition-colors"
              >
                Daya Tarik Maksimal
              </button>
              <button
                type="button"
                onClick={() => {
                  setWCost(0.25)
                  setWDistance(0.20)
                  setWFacility(0.30)
                  setWAttraction(0.25)
                }}
                className="px-3 py-1.5 rounded-md bg-amber-600 text-white font-medium transition-colors"
              >
                Seimbang (Default)
              </button>
            </div>
          </div>

          {/* Sliders Bobot SAW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#0f2c59]">C1: Biaya / Tiket (Cost)</span>
                <span className="font-mono font-bold text-amber-700">{Math.round(wCost * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={wCost}
                onChange={(e) => setWCost(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-[#63717d]">Semakin murah semakin diprioritaskan</span>
            </div>

            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#0f2c59]">C2: Waktu Tempuh (Cost)</span>
                <span className="font-mono font-bold text-amber-700">{Math.round(wDistance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={wDistance}
                onChange={(e) => setWDistance(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-[#63717d]">Semakin cepat akses semakin disukai</span>
            </div>

            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#0f2c59]">C3: Kelengkapan Fasilitas</span>
                <span className="font-mono font-bold text-amber-700">{Math.round(wFacility * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={wFacility}
                onChange={(e) => setWFacility(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-[#63717d]">Kesiapan amenitas 4A &amp; toilet/dermaga</span>
            </div>

            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#0f2c59]">C4: Daya Tarik &amp; Rating</span>
                <span className="font-mono font-bold text-amber-700">{Math.round(wAttraction * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={wAttraction}
                onChange={(e) => setWAttraction(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-[#63717d]">Keunikan pemandangan &amp; reputasi dunia</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#dce1df]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#0f2c59] mr-2">Pulau:</span>
              {['SEMUA', 'Pulau Neira', 'Banda Api', 'Banda Besar', 'Pulau Hatta', 'Pulau Ai', 'Pulau Rhun'].map((isl) => (
                <button
                  key={isl}
                  type="button"
                  onClick={() => setSawIslandFilter(isl)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    sawIslandFilter === isl
                      ? 'bg-[#0f2c59] text-white'
                      : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
                  }`}
                >
                  {isl}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#0f2c59] mr-2">Kategori:</span>
              {['SEMUA', 'Bahari & Selam', 'Sejarah & Benteng', 'Alam & Rempah'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSawCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    sawCategoryFilter === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SAW Ranked Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {sawRankedDestinations.map((dest, idx) => (
            <article
              key={dest.id}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#dce1df] shadow-sm hover:shadow-md transition-all relative"
            >
              {/* Gambar & Badges */}
              <div className="h-48 w-full relative overflow-hidden bg-slate-200">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081d35cc] via-transparent to-transparent" />
                
                {/* Ranking Badge SAW */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-bold shadow">
                  <span>#{idx + 1}</span>
                  <span>Skor {dest.sawScore}</span>
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#081d35]/80 backdrop-blur-sm text-white text-[10px] font-medium">
                  {dest.island}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold text-amber-300">
                    Rp {dest.costRp.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] opacity-90">
                    ~{dest.travelMinutes} Menit
                  </span>
                </div>
              </div>

              {/* Konten Destinasi */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                    {dest.category}
                  </span>
                  <h3 className="text-base font-bold text-[#0f2c59] leading-snug group-hover:text-amber-700 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-[#63717d] line-clamp-3 leading-relaxed">
                    {dest.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dest.highlights.map((h) => (
                      <span
                        key={h}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#f7f5f0] text-[#0f2c59] font-medium"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Breakdown & Action */}
                <div className="pt-3 border-t border-[#dce1df] flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#63717d] bg-[#f7f5f0] p-2 rounded-lg">
                    <div>Fasilitas 4A: <b className="text-[#0f2c59]">{dest.facilityScore}/100</b></div>
                    <div>Daya Tarik: <b className="text-[#0f2c59]">{dest.attractionScore}/100</b></div>
                  </div>

                  <a
                    href={`https://wa.me/${dest.guideWhatsapp}?text=${encodeURIComponent(
                      `Halo Pemandu Banda, saya melihat destinasi ${dest.name} di bandanaira.com (Skor SAW #${idx + 1}). Mohon informasi paket tur dan jadwal keberangkatan.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span> Tanya Pemandu via WA</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================================
          6. ISLAND STAYS & ECO-LODGES DIRECTORY SECTION
      ====================================================================== */}
      <section
        id="eco-stay"
        aria-labelledby="island-stays-heading"
        className="flex flex-col items-start gap-10 pt-4 pb-24 px-6 sm:px-12 lg:px-20 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
      >
        <header className="flex w-full flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col items-start gap-3 max-w-[720px]">
            <div className="inline-flex items-center gap-2.5">
              <div aria-hidden="true" className="w-6 h-px bg-amber-600" />
              <span className="font-semibold text-amber-600 text-[11px] tracking-[1.80px] uppercase">
                DIREKTORI PENGINAPAN &amp; ECO-STAY
              </span>
            </div>
            <h2
              id="island-stays-heading"
              className="font-medium text-[#0f2c59] text-[36px] sm:text-[50px] tracking-[-2.00px] leading-[1.12]"
            >
              Singgah Lebih Dekat.
              <br />
              Penginapan Berkelanjutan Banda.
            </h2>
            <p className="text-[#63717d] text-base leading-relaxed">
              Daftar homestay warga, beach bungalow, dan eco-lodge ramah lingkungan yang dilengkapi pasokan
              <b> Air Bersih Reverse Osmosis (RO)</b> dan <b>Cadangan Listrik Tenaga Surya</b>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('tourism')}
              className="inline-flex h-[46px] items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 py-0 text-xs font-semibold transition-colors"
            >
              <span>Semua Penginapan di Portal</span>
              <ArrowUpRightIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenQuickLogin || onOpenLogin}
              className="inline-flex h-[46px] items-center gap-2 border border-[#dce1df] hover:bg-white text-[#0f2c59] rounded-lg px-4 py-0 text-xs font-medium transition-colors"
            >
              <span>Masuk Mitra Homestay</span>
            </button>
          </div>
        </header>

        {/* Filter Bar Penginapan */}
        <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#dce1df] shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#0f2c59] mr-2">Pulau:</span>
            {['SEMUA', 'Pulau Neira', 'Pulau Hatta', 'Banda Besar', 'Pulau Ai'].map((isl) => (
              <button
                key={isl}
                type="button"
                onClick={() => setStayIslandFilter(isl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stayIslandFilter === isl
                    ? 'bg-[#0f2c59] text-white'
                    : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
                }`}
              >
                {isl}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0f2c59] cursor-pointer">
              <input
                type="checkbox"
                checked={stayRoFilter}
                onChange={(e) => setStayRoFilter(e.target.checked)}
                className="rounded accent-amber-600"
              />
              <span>Air Bersih RO Tersedia</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0f2c59] cursor-pointer">
              <input
                type="checkbox"
                checked={staySolarFilter}
                onChange={(e) => setStaySolarFilter(e.target.checked)}
                className="rounded accent-amber-600"
              />
              <span>Listrik Tenaga Surya</span>
            </label>
          </div>
        </div>

        {/* Grid Katalog Penginapan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredAccommodations.map((acc) => (
            <article
              key={acc.id}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#dce1df] shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-56 w-full relative overflow-hidden bg-slate-200">
                <img
                  src={acc.photo_url || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85'}
                  alt={acc.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081d35cc] via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow">
                  ECO-STAY
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#081d35]/80 text-white text-[10px] font-medium">
                  {acc.island_name}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <span className="text-lg font-bold text-amber-300">
                      Rp {acc.price_per_night_rp.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] opacity-80"> / malam</span>
                  </div>
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-white font-medium">
                    {acc.rooms_available} Kamar Tersedia
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase">
                    {acc.type}
                  </span>
                  <h3 className="text-lg font-bold text-[#0f2c59] leading-tight">
                    {acc.name}
                  </h3>
                  <p className="text-xs text-[#63717d] leading-relaxed line-clamp-2">
                    {acc.description}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {acc.address}
                  </p>

                  {/* Badges Eco */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {acc.has_clean_ro_water && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                        Air Minum RO
                      </span>
                    )}
                    {acc.has_solar_backup && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                        Listrik Surya
                      </span>
                    )}
                    {acc.is_verified && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        ✓ Terverifikasi Desa
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#dce1df] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalAcc(acc)}
                    className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold text-center transition-colors"
                  >
                    Pesan Kamar Sekarang
                  </button>
                  <a
                    href={`https://wa.me/${acc.contact_whatsapp}?text=${encodeURIComponent(
                      `Halo Pengelola ${acc.name}, saya menemukan homestay Anda di bandanaira.com. Apakah kamar tersedia untuk tanggal yang akan datang?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-[#0f2c59] hover:bg-[#1a4175] text-white rounded-lg text-xs font-semibold transition-colors"
                    title="Chat Langsung via WhatsApp"
                  >
                    💬 WA
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Modal Booking Eco-Stay */}
        {bookingModalAcc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#dce1df] flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Reservasi Penginapan</span>
                  <h3 className="text-lg font-bold text-[#0f2c59]">{bookingModalAcc.name}</h3>
                  <p className="text-xs text-[#63717d]">{bookingModalAcc.island_name} · Rp {bookingModalAcc.price_per_night_rp.toLocaleString('id-ID')} / malam</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalAcc(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#0f2c59] block mb-1">Nama Tamu / Wisatawan</label>
                  <input
                    type="text"
                    value={bookingGuestName}
                    onChange={(e) => setBookingGuestName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full p-2.5 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0f2c59] block mb-1">Nomor Kontak WhatsApp</label>
                  <input
                    type="text"
                    value={bookingGuestPhone}
                    onChange={(e) => setBookingGuestPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full p-2.5 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-1">
                    <label className="font-semibold text-[#0f2c59] block mb-1">Check-In</label>
                    <input
                      type="date"
                      value={bookingCheckIn}
                      onChange={(e) => setBookingCheckIn(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59] text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#0f2c59] block mb-1">Malam</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={bookingNights}
                      onChange={(e) => setBookingNights(parseInt(e.target.value) || 1)}
                      className="w-full p-2 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59] text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#0f2c59] block mb-1">Kamar</label>
                    <input
                      type="number"
                      min="1"
                      max={bookingModalAcc.rooms_available || 5}
                      value={bookingRooms}
                      onChange={(e) => setBookingRooms(parseInt(e.target.value) || 1)}
                      className="w-full p-2 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59] text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex justify-between items-center">
                  <span>Estimasi Total ({bookingNights} malam):</span>
                  <span className="font-bold text-sm">
                    Rp {(bookingModalAcc.price_per_night_rp * bookingNights * bookingRooms).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModalAcc(null)}
                  className="flex-1 py-2.5 rounded-lg border border-[#dce1df] text-xs font-semibold text-[#63717d] hover:bg-slate-50"
                >
                  Batal
                </button>
                <a
                  href={`https://wa.me/${bookingModalAcc.contact_whatsapp}?text=${encodeURIComponent(
                    `Halo Pengelola ${bookingModalAcc.name},\nSaya ${bookingGuestName || 'Tamu'} (WA: ${bookingGuestPhone || '-'})\ningin memesan penginapan:\n- Check-In: ${bookingCheckIn}\n- Durasi: ${bookingNights} Malam\n- Estimasi Total: Rp ${(bookingModalAcc.price_per_night_rp * bookingNights * bookingRooms).toLocaleString('id-ID')}\n\nApakah ketersediaan kamar pada tanggal tersebut dapat dikonfirmasi? Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBookingModalAcc(null)}
                  className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center shadow"
                >
                  Kirim Reservasi WhatsApp &rarr;
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          7. RESIDENT SERVICES SECTION (desainsaatini/ResidentServicesSection.tsx)
      ====================================================================== */}
      <section
        id="penduduk-fasilitas"
        aria-labelledby="resident-services-heading"
        className="flex flex-col items-start gap-9 px-6 sm:px-12 lg:px-20 py-20 relative self-stretch w-full flex-[0_0_auto] bg-[#0f2c59]"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative self-stretch w-full flex-[0_0_auto]">
          <div className="max-w-[690px] flex flex-col items-start gap-[18px] relative">
            <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
              <span
                aria-hidden="true"
                className="w-6 relative h-px bg-[#f4b75e]"
              />
              <span className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
                PENDUDUK &amp; FASILITAS
              </span>
            </div>
            <h2
              id="resident-services-heading"
              className="font-medium text-white text-[38px] sm:text-[52px] tracking-[-2.00px] leading-[1.12] sm:leading-[58.2px] relative self-stretch"
            >
              Pulau yang indah,
              <br />
              kehidupan yang terlayani.
            </h2>
          </div>

          <div className="flex flex-col max-w-[390px] items-start gap-5 relative">
            <p className="mt-[-1.00px] text-[#c1ced8] text-base leading-7 relative self-stretch font-normal tracking-[0]">
              Ruang digital untuk kebutuhan warga. Akses informasi layanan pulau
              melalui akun penduduk.
            </p>
            <button
              type="button"
              onClick={() => (currentUser ? onNavigate('population') : onOpenLogin())}
              className="bg-amber-600 hover:bg-amber-500 transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
            >
              <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
                Masuk portal penduduk
              </span>
              <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative self-stretch w-full flex-[0_0_auto]">
          {residentServices.map((service) => (
            <article
              key={service.title}
              className="flex flex-col items-start justify-between gap-[21px] p-[30px] relative flex-1 self-stretch grow bg-[#ffffff12] rounded-2xl overflow-hidden border border-solid border-[#ffffff38]"
            >
              <div className="flex flex-col items-start gap-[21px] w-full">
                <div className="flex w-12 h-12 items-center justify-center relative bg-[#f4b75e14] rounded-[10px] text-[#f4b75e]">
                  {service.iconType === 'water' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  )}
                  {service.iconType === 'solar' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                    </svg>
                  )}
                  {service.iconType === 'id' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="2" />
                      <line x1="15" y1="8" x2="17" y2="8" />
                      <line x1="15" y1="12" x2="17" y2="12" />
                      <line x1="7" y1="16" x2="17" y2="16" />
                    </svg>
                  )}
                </div>
                <h3 className="relative self-stretch font-medium text-white text-[22px] tracking-[0] leading-[normal]">
                  {service.title}
                </h3>
                <p className="relative self-stretch font-normal text-[#c1ced8] text-sm tracking-[0] leading-[24.5px]">
                  {service.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(service.actionTab)}
                className="flex items-center justify-between pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] text-[#f4b75e] hover:text-white transition-colors"
              >
                <span className="relative w-fit mt-[-1.00px] font-semibold text-xs tracking-[0] leading-[normal]">
                  {service.action}
                </span>
                <ArrowUpRightIcon className="w-[17px] h-[17px]" />
              </button>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 self-stretch w-full relative flex-[0_0_auto]">
          <p className="relative w-fit mt-[-0.50px] font-normal text-[#c1ced8] text-xs tracking-[0] leading-[normal]">
            Akses sesuai peran: penduduk, mitra homestay, dan operator.
          </p>
          <div
            id="portal-penduduk"
            className="inline-flex items-center gap-2 relative flex-[0_0_auto]"
          >
            <span aria-hidden="true" className="text-[#f4b75e] text-xs">
            
            </span>
            <p className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
              Layanan personal melalui akun Anda
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. VERIFIED BLOCKCHAIN MARKETPLACE & LOCAL UMKM SECTION
      ====================================================================== */}
      <section
        id="layanan-umkm"
        aria-labelledby="local-cuisine-heading"
        className="flex flex-col items-start gap-10 px-6 sm:px-12 lg:px-20 py-24 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
      >
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="max-w-[730px] flex flex-col items-start gap-[18px] relative">
            <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
              <span
                aria-hidden="true"
                className="relative w-6 h-px bg-amber-600"
              />
              <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal] uppercase">
                MARKETPLACE UMKM · KOPERASI HATTA &amp; BLOCKCHAIN
              </p>
            </div>
            <h2
              id="local-cuisine-heading"
              className="relative self-stretch font-medium text-[#0f2c59] text-[36px] sm:text-[50px] tracking-[-2.00px] leading-[1.12]"
            >
              Rempah &amp; Hasil Laut Banda,
              <br />
              Terverifikasi Langsung dari Petani.
            </h2>
            <p className="text-[#63717d] text-base leading-relaxed">
              Dukung perekonomian warga kepulauan. Setiap produk rempah pala, fuli, ikan asar, dan olahan kenari
              dilengkapi sertifikat keaslian kriptografis Indikasi Geografis (IG) yang tercatat di Blockchain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenMarketplace}
              className="inline-flex h-[46px] items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 py-0 text-xs font-semibold transition-colors"
            >
              <span>Buka Modal Marketplace</span>
              <ArrowUpRightIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('koperasi')}
              className="inline-flex h-[46px] items-center gap-2 border border-[#dce1df] hover:bg-white text-[#0f2c59] rounded-lg px-4 py-0 text-xs font-medium transition-colors"
            >
              <span>Kasir Koperasi Hatta</span>
            </button>
          </div>
        </header>

        {/* Filter & Search Bar Marketplace */}
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#dce1df] shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'Semua Produk' },
              { id: 'REMPAH', label: '🌿 Rempah & Fuli' },
              { id: 'PERIKANAN', label: '🐟 Hasil Laut' },
              { id: 'OLAHAN', label: '🍹 Minuman & Kudapan' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setMarketCategory(cat.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  marketCategory === cat.id
                    ? 'bg-[#0f2c59] text-white shadow-sm'
                    : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <input
              type="search"
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
              placeholder="Cari pala, tuna, fuli, sirup..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-[#f7f5f0] border border-[#dce1df] rounded-lg text-[#0f2c59] placeholder-[#63717d] focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span className="absolute left-3 top-2.5 text-[#63717d] text-xs">🔍</span>
          </div>
        </div>

        {/* Grid Marketplace Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative self-stretch w-full flex-[0_0_auto]">
          {filteredProducts.map((prod) => (
            <article
              key={prod.id}
              className="group flex flex-col items-start justify-between bg-white rounded-2xl overflow-hidden shadow-sm border border-[#dce1df] hover:shadow-md transition-all p-6 gap-5"
            >
              <div className="flex flex-col gap-3.5 w-full">
                {/* Header Card: Icon & Category */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
                    {prod.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase bg-amber-100/80 px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Stok: {prod.stockQty} unit
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-[#0f2c59] text-lg leading-snug group-hover:text-amber-700 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#63717d] mt-1 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {/* Origin & Traceability Specs */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#f7f5f0] text-[11px] text-[#4a5568]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Produsen:</span>
                    <span className="font-semibold text-[#0f2c59] text-right truncate max-w-[180px]">
                      {prod.producer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Asal Desa:</span>
                    <span className="font-medium text-[#0f2c59]">{prod.originVillage}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#dce1df]/80 font-mono text-[10px]">
                    <span className="text-slate-400">Batch Code:</span>
                    <span className="text-amber-800 font-bold">{prod.batchCode}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-col gap-3 w-full pt-3 border-t border-[#dce1df]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Harga Langsung Petani:</span>
                    <span className="text-xl font-bold text-[#0f2c59]">
                      Rp {prod.priceRp.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#63717d] bg-slate-100 px-2 py-1 rounded">
                    {prod.weight}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onPublicVerify(prod.verificationToken)}
                    className="py-2.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    title="Verifikasi Hash Blockchain & IPFS"
                  >
                    <span>Cek QR Chain</span>
                  </button>

                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                      `Halo Pengelola UMKM & Koperasi Hatta,\nSaya ingin memesan produk:\n- Nama: ${prod.name}\n- Kode Batch: ${prod.batchCode}\n- Harga: Rp ${prod.priceRp.toLocaleString('id-ID')}\n- Produsen: ${prod.producer} (${prod.originVillage})\n\nMohon info ketersediaan stok dan ongkir pengiriman. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Pesan WA</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Marketplace Footer Guarantee */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 self-stretch w-full p-5 rounded-2xl bg-[#0f2c59] text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl"></span>
            <div>
              <h4 className="text-sm font-bold text-white">
                Garansi Indikasi Geografis &amp; Rantai Pasok Berkelanjutan
              </h4>
              <p className="text-xs text-[#c1ced8]">
                Setiap pembelian langsung mengalirkan 100% pendapatan adil kepada petani dan nelayan lokal Banda Neira.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="inline-flex h-10 shrink-0 items-center gap-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#081d35] font-bold text-xs transition-colors"
          >
            <span>Buka Katalog Lengkap</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </button>
        </footer>
      </section>

      {/* =====================================================================
          9. SUSTAINABLE TRAVEL SECTION (desainsaatini/SustainableTravelSection.tsx)
      ====================================================================== */}
      <section
        aria-labelledby="sustainable-travel-title"
        className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16 px-6 sm:px-12 lg:px-20 py-[52px] relative self-stretch w-full flex-[0_0_auto] bg-[#eaf0ed]"
      >
        <div className="flex flex-col max-w-[355px] items-start gap-4 relative shrink-0">
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
            <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
              DATANG SEBAGAI TAMU
            </p>
          </div>
          <h2
            id="sustainable-travel-title"
            className="font-serif font-normal italic text-[#0f2c59] text-[34px] sm:text-[38px] tracking-[0] leading-[41.8px] relative self-stretch"
          >
            Tinggalkan kenangan,
            <br />
            bukan jejak.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative flex-1 w-full">
          {travelGuidelines.map((guideline) => (
            <article
              key={guideline.title}
              className="flex-col gap-3 flex items-start relative flex-1 grow"
            >
              <div aria-hidden="true" className="text-amber-600 text-xl">
                {guideline.iconType === 'waves' && '≈'}
                {guideline.iconType === 'culture' && '🏛️'}
                {guideline.iconType === 'leaf' && '✦'}
              </div>
              <h3 className="relative w-fit font-semibold text-[#0f2c59] text-sm tracking-[0] leading-[normal]">
                {guideline.title}
              </h3>
              <p className="text-[#63717d] text-xs leading-[20.4px] relative self-stretch font-normal tracking-[0]">
                {guideline.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================================
          10. PLAN YOUR VISIT SECTION (desainsaatini/PlanYourVisitSection.tsx)
      ====================================================================== */}
      <section
        className="flex flex-col min-h-[450px] items-center justify-center gap-6 px-6 sm:px-12 lg:px-20 py-[72px] relative self-stretch w-full bg-[#081d35] overflow-hidden"
        aria-labelledby="plan-your-visit-heading"
      >
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt="Pemandangan pulau Banda saat senja"
          src={bandaCinematicVideoBackdrop}
        />
        <div
          className="absolute inset-0 w-full h-full bg-[#081d35c8]"
          aria-hidden="true"
        />

        <div className="inline-flex items-center gap-2.5 relative z-10 flex-[0_0_auto]">
          <span className="w-6 relative h-px bg-[#f4b75e]" aria-hidden="true" />
          <span className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            PERJALANANMU DIMULAI DI SINI
          </span>
        </div>

        <h2
          id="plan-your-visit-heading"
          className="self-stretch font-medium text-white text-[36px] sm:text-[56px] text-center tracking-[-2.30px] relative z-10 leading-[1.1]"
        >
          Banda menanti. Apa ceritamu?
        </h2>

        <p className="relative z-10 max-w-[660px] font-normal text-[#c1ced8] text-base text-center tracking-[0] leading-[27.2px]">
          Temukan tempat yang ingin kamu datangi, kisah yang ingin kamu dengar,
          dan kehidupan pulau yang ingin kamu kenal.
        </p>

        <div className="inline-flex flex-wrap justify-center items-start gap-3 pt-2 pb-0 px-0 relative z-10 flex-[0_0_auto]">
          <button
            type="button"
            onClick={() => onNavigate('tourism')}
            className="inline-flex h-[54px] items-center gap-4 px-6 py-0 relative flex-[0_0_auto] bg-amber-600 hover:bg-amber-500 transition-colors rounded-lg overflow-hidden border border-solid border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
            aria-label="Jelajahi Banda sekarang"
          >
            <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
              Jelajahi Banda sekarang
            </span>
            <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="flex-[0_0_auto] border-[#ffffff38] bg-[#081d3566] hover:bg-[#ffffff1a] transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
            aria-label="Buka peta Banda"
          >
            <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
              Buka peta
            </span>
            <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
          </button>
        </div>
      </section>

      {/* =====================================================================
          11. FOOTER SECTION (desainsaatini/FootherSection.tsx)
      ====================================================================== */}
      <footer className="flex flex-col items-start gap-12 pt-16 pb-7 px-6 sm:px-12 lg:px-20 relative self-stretch w-full flex-[0_0_auto] bg-[#081d35]">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-[72px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col max-w-[390px] items-start gap-5 relative">
            <a
              className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
              href="#beranda"
              onClick={() => setActiveNav('#beranda')}
              aria-label="bandanaira.com beranda"
            >
              <NutmegLogoIcon />
              <span className="relative w-fit font-normal text-white text-[23px] tracking-[-0.90px] leading-[normal]">
                bandanaira.com
              </span>
            </a>
            <p className="relative max-w-[330px] font-normal text-[#c1ced8] text-[13px] tracking-[0] leading-[23.4px]">
              Banda Smart Tourism &amp; Island Ecosystem. Menghubungkan
              perjalanan, warisan, dan kehidupan di Kepulauan Banda.
            </p>
            <address className="not-italic inline-flex items-center gap-2 relative flex-[0_0_auto]">
              <span className="text-[#f4b75e] text-xs" aria-hidden="true">
                ⌖
              </span>
              <span className="relative w-fit mt-[-0.50px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
                Kepulauan Banda, Maluku, Indonesia
              </span>
            </address>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full">
            {footerLinkGroups.map((group) => (
              <nav
                className="flex flex-col items-start gap-[17px] relative flex-1 grow"
                key={group.title}
                aria-label={group.title}
              >
                <h2 className="relative w-fit mt-[-1.00px] font-semibold text-white text-[13px] tracking-[0] leading-[normal]">
                  {group.title}
                </h2>
                {group.links.map((link) => {
                  if (link.href) {
                    const targetHref = link.href
                    return (
                      <a
                        key={link.label}
                        href={targetHref}
                        onClick={() => setActiveNav(targetHref)}
                        className="relative w-fit font-normal text-[#c1ced8] hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal]"
                      >
                        {link.label}
                      </a>
                    )
                  }
                  if (link.tab) {
                    const targetTab = link.tab
                    return (
                      <button
                        key={link.label}
                        type="button"
                        onClick={() => onNavigate(targetTab)}
                        className="relative w-fit font-normal text-[#c1ced8] hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal] text-left"
                      >
                        {link.label}
                      </button>
                    )
                  }
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() =>
                        link.action === 'register' && onOpenRegister
                          ? onOpenRegister()
                          : link.action === 'quicklogin' && onOpenQuickLogin
                            ? onOpenQuickLogin()
                            : onOpenLogin()
                      }
                      className="relative w-fit font-normal text-[#c1ced8] hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal] text-left"
                    >
                      {link.label}
                    </button>
                  )
                })}
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative self-stretch w-full h-px bg-[#ffffff38]" />
          <div className="flex flex-wrap items-center justify-between gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
              © 2026 bandanaira.com. Seluruh hak cipta dilindungi.
            </p>
            <p className="w-fit mt-[-1.00px] font-serif font-normal italic text-[#f4b75e] text-[17px] tracking-[0] relative leading-[normal]">
              Dari Banda, untuk dunia.
            </p>
            <nav
              className="inline-flex items-start gap-6 relative flex-[0_0_auto]"
              aria-label="Informasi legal"
            >
              <a
                className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] hover:text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
                href="#beranda"
              >
                Kebijakan privasi
              </a>
              <a
                className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] hover:text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
                href="#beranda"
              >
                Syarat penggunaan
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BandanairaBeranda
