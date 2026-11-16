import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Compass,
  Landmark,
  Home,
  Store,
  Shield,
  Droplets,
  Zap,
  Search,
  RefreshCw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MapPin,
  Edit2,
  Edit3,
  Download,
  Save,
  X,
  Sparkles,
  Crosshair,
  Globe,
  Check,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Route,
  Navigation,
  Navigation2,
  Undo,
  RotateCcw,
  Mountain,
  Map as MapIcon,
  Eye,
  Maximize2,
  Minimize2,
  Star,
  Copy,
  Clock,
  Phone,
} from 'lucide-react'
import {
  gisService,
  GeoJSONFeature,
  GeocodingResult,
} from '../services/gis'
import { Panorama360Modal } from '../components/modals/Panorama360Modal'
import { authService } from '../services/auth'
import {
  BANDA_VILLAGES_GEOJSON,
  VILLAGE_DETAILS,
  VillageInfo,
} from '../data/bandaVillagesData'

export interface InteractiveMapWorkspaceProps {
  currentUser?: any
}

// Helper icons mapping
const LAYER_ICONS: Record<string, React.ReactNode> = {
  LAYER_TOURISM_4A: <Compass size={14} />,
  LAYER_HERITAGE: <Landmark size={14} />,
  LAYER_ACCOMMODATION: <Home size={14} />,
  LAYER_KOPERASI_UMKM: <Store size={14} />,
  LAYER_PUBLIC_SAFETY: <Shield size={14} />,
  LAYER_DESA_ADMIN: <Shield size={14} />,
  LAYER_WATER_INFRA: <Droplets size={14} />,
  LAYER_ENERGY_WASTE: <Zap size={14} />,
}

const LAYER_COLORS: Record<string, string> = {
  LAYER_TOURISM_4A: '#06b6d4', // Cyan
  LAYER_HERITAGE: '#f59e0b', // Amber
  LAYER_ACCOMMODATION: '#10b981', // Emerald
  LAYER_KOPERASI_UMKM: '#8b5cf6', // Violet
  LAYER_PUBLIC_SAFETY: '#3b82f6', // Blue
  LAYER_DESA_ADMIN: '#3b82f6', // Blue alias
  LAYER_WATER_INFRA: '#0ea5e9', // Sky Teal
  LAYER_ENERGY_WASTE: '#f43f5e', // Rose
}

const LAYER_LABELS: Record<string, string> = {
  LAYER_TOURISM_4A: 'Wisata & Bahari',
  LAYER_HERITAGE: 'Cagar Budaya',
  LAYER_ACCOMMODATION: 'Penginapan',
  LAYER_KOPERASI_UMKM: 'Sentra UMKM',
  LAYER_PUBLIC_SAFETY: 'Fasilitas Umum',
  LAYER_DESA_ADMIN: 'Fasilitas Umum',
  LAYER_WATER_INFRA: 'Air Bersih',
  LAYER_ENERGY_WASTE: 'Energi & Lingkungan',
}

export type BasemapId = 'standard' | 'satellite' | 'terrain'

export interface BasemapConfig {
  id: BasemapId
  label: string
  subtitle: string
  url: string
  attribution: string
  maxZoom: number
  subdomains?: string[]
  previewBg: string
  accentColor: string
}

export const BASEMAP_CONFIGS: Record<BasemapId, BasemapConfig> = {
  standard: {
    id: 'standard',
    label: 'Standar',
    subtitle: 'Peta Jalan',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors | Banda Digital Ecosystem',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    previewBg: 'linear-gradient(135deg, #bae6fd 0%, #bbf7d0 50%, #fef08a 100%)',
    accentColor: '#0284c7',
  },
  satellite: {
    id: 'satellite',
    label: 'Satelit',
    subtitle: 'Citra Asli Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
    maxZoom: 19,
    previewBg: 'linear-gradient(135deg, #064e3b 0%, #0369a1 45%, #0f172a 100%)',
    accentColor: '#10b981',
  },
  terrain: {
    id: 'terrain',
    label: 'Topografi',
    subtitle: 'Kontur & Relief Alam',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; USGS, DeLorme, NAVTEQ',
    maxZoom: 19,
    previewBg: 'linear-gradient(135deg, #d97706 0%, #84cc16 50%, #38bdf8 100%)',
    accentColor: '#f59e0b',
  },
}

// Cartographic density classification tiers for Choropleth Population Heatmap
export const getDensityTier = (density?: number | string | null) => {
  const d = typeof density === 'string' ? parseFloat(density) : (density || 0)
  if (d >= 300) {
    return {
      tier: 'Sangat Padat',
      color: '#e11d48', // Crimson / Rose 600
      borderColor: '#be123c',
      fillOpacity: 0.72,
      label: '≥ 300 jiwa/km²',
    }
  }
  if (d >= 200) {
    return {
      tier: 'Cukup Padat',
      color: '#f59e0b', // Amber 500
      borderColor: '#d97706',
      fillOpacity: 0.62,
      label: '200 - 299 jiwa/km²',
    }
  }
  if (d >= 100) {
    return {
      tier: 'Kepadatan Sedang',
      color: '#0d9488', // Teal 600
      borderColor: '#0f766e',
      fillOpacity: 0.50,
      label: '100 - 199 jiwa/km²',
    }
  }
  return {
    tier: 'Renggang',
    color: '#10b981', // Emerald 500
    borderColor: '#059669',
    fillOpacity: 0.40,
    label: '< 100 jiwa/km²',
  }
}

// Bounding box strictly locked to Kepulauan Banda archipelago (Rhun, Ai, Neira, Gunung Api, Banda Besar, Hatta)
export const BANDA_ARCHIPELAGO_BOUNDS = L.latLngBounds(
  [-4.7000, 129.6000], // Southwest (Selatan Pulau Rhun / Banda Besar)
  [-4.3800, 130.1500]  // Northeast (Utara Pulau Neira / Timur Pulau Hatta)
)

export interface LandmarkMediaInfo {
  imageUrl: string
  panoramaUrl: string
  rating: number
  reviewsCount: number
  operatingHours: string
  tag: string
  address: string
}

// Curated authentic imagery and 360 panorama references for Banda Neira landmarks
export const BANDA_LANDMARK_MEDIA: Record<
  string,
  {
    image: string
    panorama: string
    rating: number
    reviews: number
    hours: string
    tag: string
  }
> = {
  'Benteng Belgica': {
    image: '/images/landmarks/belgica.jpg',
    panorama: '/images/landmarks/belgica.jpg',
    rating: 4.9,
    reviews: 142,
    hours: '08:00 - 18:00 WIT',
    tag: 'Benteng Bersejarah VOC & Cagar Budaya',
  },
  'Benteng Nassau': {
    image: '/images/landmarks/nassau.jpg',
    panorama: '/images/landmarks/nassau.jpg',
    rating: 4.7,
    reviews: 68,
    hours: 'Buka 24 Jam',
    tag: 'Situs Cagar Budaya Abad ke-17',
  },
  'Benteng Hollandia': {
    image: '/images/landmarks/hollandia.jpg',
    panorama: '/images/landmarks/hollandia.jpg',
    rating: 4.8,
    reviews: 54,
    hours: '07:00 - 18:00 WIT',
    tag: 'Panorama Selat Banda & Perkebunan Pala',
  },
  'Benteng Concordia': {
    image: '/images/landmarks/concordia.jpg',
    panorama: '/images/landmarks/concordia.jpg',
    rating: 4.6,
    reviews: 32,
    hours: 'Buka 24 Jam',
    tag: 'Benteng Pesisir Banda Besar',
  },
  'Benteng Revengie': {
    image: '/images/landmarks/benteng-revenge.jpg',
    panorama: '/images/landmarks/benteng-revenge.jpg',
    rating: 4.7,
    reviews: 29,
    hours: 'Buka 24 Jam',
    tag: 'Benteng Bersejarah Pulau Ay',
  },
  'Benteng Swanenburg': {
    image: '/images/landmarks/benteng-swanenburg.jpg',
    panorama: '/images/landmarks/benteng-swanenburg.jpg',
    rating: 4.6,
    reviews: 21,
    hours: 'Buka 24 Jam',
    tag: 'Cagar Budaya Pulau Rhun',
  },
  'Benteng Kora-Kora': {
    image: '/images/landmarks/benteng-kora-kora.jpg',
    panorama: '/images/landmarks/benteng-kora-kora.jpg',
    rating: 4.6,
    reviews: 18,
    hours: 'Buka 24 Jam',
    tag: 'Situs Pos Pengintai Bersejarah',
  },
  'Istana Mini': {
    image: '/images/landmarks/istana-mini.jpg',
    panorama: '/images/landmarks/istana-mini.jpg',
    rating: 4.8,
    reviews: 86,
    hours: '08:00 - 17:00 WIT',
    tag: 'Kediaman Gubernur Jenderal VOC',
  },
  'Rumah Pengasingan Bung Hatta': {
    image: '/images/landmarks/bung-hatta.jpg',
    panorama: '/images/landmarks/bung-hatta.jpg',
    rating: 4.9,
    reviews: 110,
    hours: '08:00 - 16:30 WIT',
    tag: 'Museum Sejarah Kemerdekaan RI',
  },
  'Rumah Pengasingan Sutan Sjahrir': {
    image: '/images/landmarks/sutan-sjahrir.jpg',
    panorama: '/images/landmarks/sutan-sjahrir.jpg',
    rating: 4.9,
    reviews: 95,
    hours: '08:00 - 16:30 WIT',
    tag: 'Museum Sejarah Negosiator Bangsa',
  },
  'Rumah Budaya Banda Neira': {
    image: '/images/landmarks/rumah-budaya.jpg',
    panorama: '/images/landmarks/rumah-budaya.jpg',
    rating: 4.8,
    reviews: 88,
    hours: '09:00 - 17:00 WIT',
    tag: 'Museum Koleksi Artefak Jalur Rempah',
  },
  'Gunung Api Banda': {
    image: '/images/landmarks/gunung-api.jpg',
    panorama: '/images/landmarks/gunung-api.jpg',
    rating: 4.9,
    reviews: 120,
    hours: '05:00 - 18:00 WIT (Pendakian)',
    tag: 'Gunung Berapi Aktif & Trekking',
  },
  'Lava Flow': {
    image: '/images/landmarks/lava-flow.jpg',
    panorama: '/images/landmarks/lava-flow.jpg',
    rating: 5.0,
    reviews: 135,
    hours: '07:00 - 17:00 WIT',
    tag: 'Spot Snorkeling & Coral Garden Ternama',
  },
  'Pohon Sejuta Umat (Pohon Talang)': {
    image: '/images/landmarks/pohon-talang.jpg',
    panorama: '/images/landmarks/pohon-talang.jpg',
    rating: 4.9,
    reviews: 79,
    hours: 'Buka 24 Jam',
    tag: 'Spot Foto Ikonik Berlatar Gunung Api',
  },
  'Pulau Nailaka': {
    image: '/images/landmarks/pulau-nailaka.jpg',
    panorama: '/images/landmarks/pulau-nailaka.jpg',
    rating: 4.9,
    reviews: 64,
    hours: 'Buka 24 Jam',
    tag: 'Gosong Pasir Putih & Terumbu Karang',
  },
  'Pulau Rhun': {
    image: '/images/landmarks/pulau-rhun.jpg',
    panorama: '/images/landmarks/pulau-rhun.jpg',
    rating: 4.8,
    reviews: 58,
    hours: 'Buka 24 Jam',
    tag: 'Pulau Bersejarah Traktat Breda 1667',
  },
  'Pulau Hatta': {
    image: '/images/landmarks/pulau-hatta.jpg',
    panorama: '/images/landmarks/pulau-hatta.jpg',
    rating: 5.0,
    reviews: 98,
    hours: 'Buka 24 Jam',
    tag: 'Surga Diving Drop-Off Wall Terbaik',
  },
  'Pulau Ay': {
    image: '/images/landmarks/pulau-ay.jpg',
    panorama: '/images/landmarks/pulau-ay.jpg',
    rating: 4.8,
    reviews: 52,
    hours: 'Buka 24 Jam',
    tag: 'Pusat Perkebunan Pala Tua & Manta Point',
  },
  'Pulau Pisang': {
    image: '/images/landmarks/pulau-pisang.jpg',
    panorama: '/images/landmarks/pulau-pisang.jpg',
    rating: 4.8,
    reviews: 44,
    hours: 'Buka 24 Jam',
    tag: 'Spot Snorkeling Pulau Sjahrir',
  },
  'Bandara Banda Neira': {
    image: '/images/landmarks/bandara.jpg',
    panorama: '/images/landmarks/bandara.jpg',
    rating: 4.7,
    reviews: 43,
    hours: '08:00 - 15:00 WIT',
    tag: 'Bandara Udara Perintis (NDA)',
  },
  'Pelabuhan Banda Neira': {
    image: '/images/landmarks/pelabuhan.jpg',
    panorama: '/images/landmarks/pelabuhan.jpg',
    rating: 4.6,
    reviews: 82,
    hours: 'Buka 24 Jam',
    tag: 'Pelabuhan Kapal PELNI & Ferry Cepat',
  },
  'The Maulana Hotel': {
    image: '/images/landmarks/hotel-maulana.jpg',
    panorama: '/images/landmarks/hotel-maulana.jpg',
    rating: 4.9,
    reviews: 77,
    hours: 'Check-in 14:00 · Check-out 12:00',
    tag: 'Hotel Ikonik Tepi Laut Bersejarah',
  },
  'Hotel Maulana': {
    image: '/images/landmarks/hotel-maulana.jpg',
    panorama: '/images/landmarks/hotel-maulana.jpg',
    rating: 4.9,
    reviews: 77,
    hours: 'Check-in 14:00 · Check-out 12:00',
    tag: 'Hotel Ikonik Tepi Laut Bersejarah',
  },
  'Mutiara Guesthouse': {
    image: '/images/landmarks/mutiara-guesthouse.jpg',
    panorama: '/images/landmarks/mutiara-guesthouse.jpg',
    rating: 4.8,
    reviews: 56,
    hours: 'Check-in 13:00 · Check-out 11:30',
    tag: 'Penginapan Wisatawan & Diver',
  },
  'Baba Lagoon': {
    image: '/images/landmarks/baba-lagoon.jpg',
    panorama: '/images/landmarks/baba-lagoon.jpg',
    rating: 4.8,
    reviews: 49,
    hours: 'Check-in 14:00 · Check-out 12:00',
    tag: 'Resort & Dive Center Tepi Laut',
  },
  'Abba Homestay': {
    image: '/images/landmarks/abba-homestay.jpg',
    panorama: '/images/landmarks/abba-homestay.jpg',
    rating: 4.7,
    reviews: 38,
    hours: 'Check-in 14:00 · Check-out 12:00',
    tag: 'Homestay Nyaman di Pusat Kota Neira',
  },
  'Delfika Homestay': {
    image: '/images/landmarks/delfika-homestay.jpg',
    panorama: '/images/landmarks/delfika-homestay.jpg',
    rating: 4.7,
    reviews: 41,
    hours: 'Check-in 14:00 · Check-out 12:00',
    tag: 'Penginapan Bernuansa Rumah Kolonial',
  },
  'Nutmeg Tree Hotel': {
    image: '/images/landmarks/nutmeg-tree-resort.jpg',
    panorama: '/images/landmarks/nutmeg-tree-resort.jpg',
    rating: 4.8,
    reviews: 52,
    hours: 'Check-in 14:00 · Check-out 12:00',
    tag: 'Resort Tropis & Kebun Rempah',
  },
  'Klenteng Sun Hok Bio': {
    image: '/images/landmarks/klenteng.jpg',
    panorama: '/images/landmarks/klenteng.jpg',
    rating: 4.8,
    reviews: 65,
    hours: '08:00 - 18:00 WIT',
    tag: 'Klenteng Tertua di Maluku (1686)',
  },
  'Gereja Tua Banda': {
    image: '/images/landmarks/gereja-tua.jpg',
    panorama: '/images/landmarks/gereja-tua.jpg',
    rating: 4.8,
    reviews: 58,
    hours: '08:00 - 17:00 WIT',
    tag: 'Gereja Protestan Bersejarah 1873',
  },
  'Gereja Betlehem Pulau Ay': {
    image: '/images/landmarks/gereja-betlehem.jpg',
    panorama: '/images/landmarks/gereja-betlehem.jpg',
    rating: 4.7,
    reviews: 26,
    hours: '08:00 - 17:00 WIT',
    tag: 'Gereja Cagar Budaya Pulau Ay',
  },
  'Sumur Pusaka Lonthoir': {
    image: '/images/landmarks/sumur-lonthoir.jpg',
    panorama: '/images/landmarks/sumur-lonthoir.jpg',
    rating: 4.8,
    reviews: 47,
    hours: '08:00 - 17:00 WIT',
    tag: 'Sumur Adat Keramat Banda Besar',
  },
  'Perkebunan Pala Lonthoir': {
    image: '/images/landmarks/kebun-pala.jpg',
    panorama: '/images/landmarks/kebun-pala.jpg',
    rating: 4.9,
    reviews: 83,
    hours: '08:00 - 17:00 WIT',
    tag: 'Kebun Pala Bersejarah Abad VOC',
  },
  'Perk Welvaren Pulau Ay': {
    image: '/images/landmarks/welvaren.jpg',
    panorama: '/images/landmarks/welvaren.jpg',
    rating: 4.7,
    reviews: 31,
    hours: '08:00 - 17:00 WIT',
    tag: 'Situs Perkebunan Pala VOC Pulau Ay',
  },
}

export const getFeatureMedia = (feat: GeoJSONFeature): LandmarkMediaInfo => {
  const name = feat.properties.name || ''
  const layer = feat.properties.layer_type || ''
  const island = feat.properties.island_name || 'Kepulauan Banda'
  const propsMeta = (feat.properties.properties_meta as any) || {}
  const explicitImage = feat.properties.image_url || propsMeta.image_url
  const explicitPanorama = feat.properties.panorama_url || propsMeta.panorama_url

  // 1. Direct exact or partial match in curated registry
  for (const [key, val] of Object.entries(BANDA_LANDMARK_MEDIA)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return {
        imageUrl: explicitImage || val.image,
        panoramaUrl: explicitPanorama || val.panorama,
        rating: val.rating,
        reviewsCount: val.reviews,
        operatingHours: val.hours,
        tag: val.tag,
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
    }
  }

  // 2. If explicit image was provided via GeoJSON / PostGIS properties
  if (explicitImage) {
    return {
      imageUrl: explicitImage,
      panoramaUrl: explicitPanorama || explicitImage,
      rating: 4.8,
      reviewsCount: 35,
      operatingHours: 'Buka Setiap Hari',
      tag: 'Titik Spasial Banda Digital Ecosystem',
      address: `${island}, Kepulauan Banda, Maluku Tengah`,
    }
  }

  // 3. Keyword matching with authentic local imagery
  const lowerName = name.toLowerCase()
  if (lowerName.includes('benteng') || lowerName.includes('fort')) {
    return {
      imageUrl: '/images/landmarks/belgica.jpg',
      panoramaUrl: '/images/landmarks/belgica.jpg',
      rating: 4.8,
      reviewsCount: 42,
      operatingHours: '08:00 - 18:00 WIT',
      tag: 'Benteng Cagar Budaya Bersejarah',
      address: `${island}, Kepulauan Banda, Maluku Tengah`,
    }
  }
  if (lowerName.includes('pulau') || lowerName.includes('pantai') || lowerName.includes('tanjung') || lowerName.includes('batu') || lowerName.includes('pante')) {
    return {
      imageUrl: '/images/landmarks/pulau-nailaka.jpg',
      panoramaUrl: '/images/landmarks/pulau-nailaka.jpg',
      rating: 4.9,
      reviewsCount: 56,
      operatingHours: 'Buka 24 Jam',
      tag: 'Panorama Bahari & Pesisir Alami',
      address: `${island}, Kepulauan Banda, Maluku Tengah`,
    }
  }
  if (lowerName.includes('hotel') || lowerName.includes('guesthouse') || lowerName.includes('homestay') || lowerName.includes('resort') || lowerName.includes('villa')) {
    return {
      imageUrl: '/images/landmarks/hotel-maulana.jpg',
      panoramaUrl: '/images/landmarks/hotel-maulana.jpg',
      rating: 4.8,
      reviewsCount: 48,
      operatingHours: 'Check-in 14:00 · Check-out 12:00',
      tag: 'Penginapan & Eco-Stay Kepulauan',
      address: `${island}, Kepulauan Banda, Maluku Tengah`,
    }
  }
  if (lowerName.includes('pelabuhan') || lowerName.includes('dermaga') || lowerName.includes('bandara')) {
    return {
      imageUrl: '/images/landmarks/pelabuhan.jpg',
      panoramaUrl: '/images/landmarks/pelabuhan.jpg',
      rating: 4.7,
      reviewsCount: 65,
      operatingHours: 'Buka 24 Jam',
      tag: 'Infrastruktur Konektivitas Transportasi',
      address: `${island}, Kepulauan Banda, Maluku Tengah`,
    }
  }

  // 4. Fallback based on Layer Type
  switch (layer) {
    case 'LAYER_HERITAGE':
      return {
        imageUrl: '/images/landmarks/belgica.jpg',
        panoramaUrl: '/images/landmarks/belgica.jpg',
        rating: 4.8,
        reviewsCount: 38,
        operatingHours: '08:00 - 17:00 WIT',
        tag: 'Situs Warisan Cagar Budaya Banda',
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
    case 'LAYER_ACCOMMODATION':
      return {
        imageUrl: '/images/landmarks/hotel-maulana.jpg',
        panoramaUrl: '/images/landmarks/hotel-maulana.jpg',
        rating: 4.8,
        reviewsCount: 52,
        operatingHours: 'Check-in 14:00 · Check-out 12:00',
        tag: 'Akomodasi & Homestay Wisata',
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
    case 'LAYER_WATER_INFRA':
      return {
        imageUrl: '/images/landmarks/sumur-lonthoir.jpg',
        panoramaUrl: '/images/landmarks/sumur-lonthoir.jpg',
        rating: 4.9,
        reviewsCount: 24,
        operatingHours: 'Operasional 24 Jam',
        tag: 'Infrastruktur Air Bersih Komunal',
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
    case 'LAYER_ENERGY_WASTE':
      return {
        imageUrl: '/images/landmarks/pltd-neira.jpg',
        panoramaUrl: '/images/landmarks/pltd-neira.jpg',
        rating: 4.8,
        reviewsCount: 19,
        operatingHours: '08:00 - 17:00 WIT',
        tag: 'Resiliensi Energi & Pengolahan Sampah',
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
    case 'LAYER_KOPERASI_UMKM':
      return {
        imageUrl: '/images/landmarks/kebun-pala.jpg',
        panoramaUrl: '/images/landmarks/kebun-pala.jpg',
        rating: 4.8,
        reviewsCount: 35,
        operatingHours: '08:00 - 21:00 WIT',
        tag: 'Sentra UMKM & Komoditas Rempah',
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
    default:
      return {
        imageUrl: '/images/landmarks/belgica.jpg',
        panoramaUrl: '/images/landmarks/belgica.jpg',
        rating: 4.9,
        reviewsCount: 60,
        operatingHours: 'Buka 24 Jam',
        tag: 'Destinasi Bahari & Wisata 4A',
        address: `${island}, Kepulauan Banda, Maluku Tengah`,
      }
  }
}

export const InteractiveMapWorkspace: React.FC<InteractiveMapWorkspaceProps> = ({ currentUser }) => {
  const workspaceContainerRef = useRef<HTMLDivElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const draftMarkerRef = useRef<L.Marker | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Basemap Tile Layers Management (Google Maps Style Layer Switcher)
  const baseTileLayerRef = useRef<L.TileLayer | null>(null)
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null)
  const [activeBasemap, setActiveBasemap] = useState<BasemapId>(() => {
    try {
      const saved = localStorage.getItem('banda_gis_active_basemap')
      if (saved && ['standard', 'satellite', 'terrain'].includes(saved)) {
        return saved as BasemapId
      }
    } catch (e) {
      // ignore
    }
    return 'standard'
  })
  const [showLabelsOnSatellite, setShowLabelsOnSatellite] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('banda_gis_satellite_labels')
      if (saved !== null) return saved === 'true'
    } catch (e) {}
    return true
  })
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false)

  // Role permissions check
  const activeUser = currentUser || authService.getCachedProfile()
  const userRoleNames: string[] = activeUser
    ? (activeUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(activeUser?.is_superuser)
  const isOfficerOrAdmin = isSuperuser || userRoleNames.some((r) => ['admin', 'village_officer'].includes(r))

  // State
  const [features, setFeatures] = useState<GeoJSONFeature[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null)
  const [is360ModalOpen, setIs360ModalOpen] = useState<boolean>(false)
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false)
  const [copiedCoord, setCopiedCoord] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [islandFilter, setIslandFilter] = useState<string>('')

  // Admin Studio States
  const [adminStudioOpen, setAdminStudioOpen] = useState<boolean>(false)
  const [adminTab, setAdminTab] = useState<'search' | 'form' | 'polygon'>('search')
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null)

  // External Geocoder States
  const [searchGmapsQuery, setSearchGmapsQuery] = useState<string>('')
  const [searchGmapsResults, setSearchGmapsResults] = useState<GeocodingResult[]>([])
  const [searchGmapsLoading, setSearchGmapsLoading] = useState<boolean>(false)

  // Spatial Feature Form States
  const [formName, setFormName] = useState<string>('')
  const [formLayer, setFormLayer] = useState<string>('LAYER_TOURISM_4A')
  const [formCategory, setFormCategory] = useState<'publik' | 'resiliensi'>('publik')
  const [formIsland, setFormIsland] = useState<string>('Pulau Neira')
  const [formLat, setFormLat] = useState<number>(-4.5261)
  const [formLng, setFormLng] = useState<number>(129.8989)
  const [formDescription, setFormDescription] = useState<string>('')

  // 4A Tourism Specific Form States
  const [form4aSubType, setForm4aSubType] = useState<string>('bahari')
  const [form4aHighlights, setForm4aHighlights] = useState<string>('')
  const [form4aBoatAccess, setForm4aBoatAccess] = useState<string>('')
  const [form4aTravelTime, setForm4aTravelTime] = useState<string>('')
  const [form4aEntryFee, setForm4aEntryFee] = useState<string>('')
  const [form4aBestTime, setForm4aBestTime] = useState<string>('')
  const [form4aFacilities, setForm4aFacilities] = useState<string>('')
  const [form4aContactWhatsapp, setForm4aContactWhatsapp] = useState<string>('')
  const [form4aGuideAvailable, setForm4aGuideAvailable] = useState<boolean>(true)

  // Route / Polyline Drawing States
  const [geometryMode, setGeometryMode] = useState<'point' | 'route'>('point')
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][]>([])
  const [routeType, setRouteType] = useState<'maritime' | 'heritage' | 'trekking'>('maritime')
  const [routeTransport, setRouteTransport] = useState<string>('Speedboat')
  const [routeTravelTime, setRouteTravelTime] = useState<string>('')
  const [routeStartName, setRouteStartName] = useState<string>('')
  const [routeEndName, setRouteEndName] = useState<string>('')
  const [showRoutes, setShowRoutes] = useState<boolean>(true)

  // Village Boundary (Choropleth Polygons) States
  const [showVillageBoundaries, setShowVillageBoundaries] = useState<boolean>(true)
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(false)
  const [selectedVillage, setSelectedVillage] = useState<VillageInfo | null>(null)
  const villageBoundariesLayerRef = useRef<L.GeoJSON | null>(null)

  const sanitizeVillageGeoJSON = (data: any) => {
    if (!data || !data.features || !Array.isArray(data.features)) return data
    const filtered = data.features.filter((f: any) => {
      const name = f?.properties?.name
      const id = f?.id
      return (
        name !== 'Gunung Api' &&
        name !== 'Pulau Keraka' &&
        id !== 'desa-gunung-api' &&
        id !== 'desa-pulau-keraka'
      )
    })
    return { ...data, features: filtered }
  }

  // Village Polygon Interactive Editor States (Berbasis Langsung dari PostGIS Database)
  const [villageGeoJSON, setVillageGeoJSON] = useState<any>(() => {
    try {
      localStorage.removeItem('banda_village_polygons_v1')
      localStorage.removeItem('banda_village_polygons_v2')
    } catch {}
    return sanitizeVillageGeoJSON(BANDA_VILLAGES_GEOJSON)
  })
  const [villageDetailsMap, setVillageDetailsMap] = useState<Record<string, VillageInfo>>(() => {
    try {
      localStorage.removeItem('banda_village_details_v1')
      localStorage.removeItem('banda_village_details_v2')
    } catch {}
    return VILLAGE_DETAILS
  })

  const [editingVillageId, setEditingVillageId] = useState<string | null>(null)
  // Dukungan beberapa bagian daratan terpisah (misal pulau/dusun terpisah)
  const [polygonParts, setPolygonParts] = useState<[number, number][][]>([[]])
  const [activePartIndex, setActivePartIndex] = useState<number>(0)
  const [polygonEditMode, setPolygonEditMode] = useState<'move' | 'add'>('move')

  const [editingVillageName, setEditingVillageName] = useState<string>('')
  const [editingVillageIsland, setEditingVillageIsland] = useState<string>('Pulau Neira')
  const [editingVillageColor, setEditingVillageColor] = useState<string>('#34d399')
  const [editingVillageDesc, setEditingVillageDesc] = useState<string>('')
  const [editingVillagePop, setEditingVillagePop] = useState<string>('')
  const [editingVillageCommodity, setEditingVillageCommodity] = useState<string>('')
  const [editingVillageArea, setEditingVillageArea] = useState<string>('')
  const [editingVillageAreaKm2, setEditingVillageAreaKm2] = useState<string | number>('')
  const [editingVillageDensity, setEditingVillageDensity] = useState<string | number>('')
  const [isSyncingVillages, setIsSyncingVillages] = useState<boolean>(false)

  const draftPolygonPartsRef = useRef<L.Polygon[]>([])
  const draftPolygonVertexMarkersRef = useRef<L.Marker[]>([])

  const draftPolylineRef = useRef<L.Polyline | null>(null)
  const draftVertexMarkersRef = useRef<L.Marker[]>([])

  // Calculate distance in km between two [lat, lng] points using Haversine formula
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateTotalDistance = (waypoints: [number, number][]): { km: number; nm: number } => {
    if (waypoints.length < 2) return { km: 0, nm: 0 }
    let totalKm = 0
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalKm += calculateDistanceKm(
        waypoints[i][0],
        waypoints[i][1],
        waypoints[i + 1][0],
        waypoints[i + 1][1]
      )
    }
    return {
      km: parseFloat(totalKm.toFixed(2)),
      nm: parseFloat((totalKm * 0.539957).toFixed(2)),
    }
  }

  const [isSavingFeature, setIsSavingFeature] = useState<boolean>(false)
  const [isDeletingFeature, setIsDeletingFeature] = useState<boolean>(false)
  const [atlasLegendOpen, setAtlasLegendOpen] = useState<boolean>(true)

  const [notificationMsg, setNotificationMsg] = useState<{
    type: 'success' | 'info' | 'error'
    text: string
  } | null>(null)

  // Active Layers Multi-selection (all enabled by default)
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(
    new Set([
      'LAYER_TOURISM_4A',
      'LAYER_HERITAGE',
      'LAYER_ACCOMMODATION',
      'LAYER_KOPERASI_UMKM',
      'LAYER_PUBLIC_SAFETY',
      'LAYER_DESA_ADMIN',
      'LAYER_WATER_INFRA',
      'LAYER_ENERGY_WASTE',
    ])
  )

  // Load Data on Mount
  useEffect(() => {
    loadGISData()
  }, [])

  const loadGISData = async () => {
    setLoading(true)
    try {
      const [layersRes, villagesRes, villageDetailsRes] = await Promise.all([
        gisService.getLayers(),
        gisService.getVillages(),
        gisService.getVillageDetails(),
      ])
      setFeatures(layersRes.features)
      if (villagesRes && villagesRes.features && villagesRes.features.length > 0) {
        const cleanServerData = sanitizeVillageGeoJSON(villagesRes)
        setVillageGeoJSON(cleanServerData)
      }
      if (villageDetailsRes && Object.keys(villageDetailsRes).length > 0) {
        const merged = { ...VILLAGE_DETAILS, ...villageDetailsRes }
        setVillageDetailsMap(merged)
      }
    } catch (err) {
      console.warn('Gagal memuat data spasial:', err)
    } finally {
      setLoading(false)
    }
  }

  // Basemap Tile Layers Updater
  const updateBasemapLayer = (targetId: BasemapId, withLabels: boolean, targetMap?: L.Map | null) => {
    const map = targetMap || mapInstanceRef.current
    if (!map) return
    const config = BASEMAP_CONFIGS[targetId] || BASEMAP_CONFIGS.standard

    // Remove old base layer
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current)
      baseTileLayerRef.current = null
    }

    // Remove old labels layer
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current)
      labelsTileLayerRef.current = null
    }

    // Add new base layer
    const newBaseLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || ['a', 'b', 'c'],
    }).addTo(map)
    newBaseLayer.bringToBack()
    baseTileLayerRef.current = newBaseLayer

    // If satellite and labels are turned on, overlay the labels
    if (targetId === 'satellite' && withLabels) {
      const labelsLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri',
          maxZoom: 19,
        }
      ).addTo(map)
      labelsTileLayerRef.current = labelsLayer
    }
  }

  // Update basemap when activeBasemap or showLabelsOnSatellite changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateBasemapLayer(activeBasemap, showLabelsOnSatellite)
    }
  }, [activeBasemap, showLabelsOnSatellite])

  const handleSelectBasemap = (id: BasemapId) => {
    setActiveBasemap(id)
    try {
      localStorage.setItem('banda_gis_active_basemap', id)
    } catch (e) {}
  }

  const handleToggleSatelliteLabels = () => {
    setShowLabelsOnSatellite((prev) => {
      const next = !prev
      try {
        localStorage.setItem('banda_gis_satellite_labels', String(next))
      } catch (e) {}
      return next
    })
  }

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      // Center coordinates of Banda Neira: -4.5300, 129.9000 strictly locked to Banda Archipelago
      const map = L.map(mapContainerRef.current, {
        center: [-4.5300, 129.9000],
        zoom: 12,
        minZoom: 11,
        maxZoom: 18,
        maxBounds: BANDA_ARCHIPELAGO_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
      })

      // Standard Google Maps style bottom-right zoom controls
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      layerGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map

      // Apply initial basemap from configuration
      updateBasemapLayer(activeBasemap, showLabelsOnSatellite, map)

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 200)
    } else {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 150)
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Manage draft marker on the map for Admin Studio
  const updateDraftMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    if (draftMarkerRef.current) {
      draftMarkerRef.current.setLatLng([lat, lng])
    } else {
      const pinIcon = L.divIcon({
        className: 'draft-editor-pin',
        html: `
          <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(239, 68, 68, 0.45)); cursor: grab;">
            <svg width="34" height="44" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
                fill="#ef4444"
                stroke="#ffffff"
                stroke-width="2"
              />
              <circle cx="14" cy="13.5" r="5.5" fill="#ffffff" />
              <circle cx="14" cy="13.5" r="3" fill="#ef4444" />
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -44],
      })
      const marker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map)

      marker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng()
        setFormLat(parseFloat(pos.lat.toFixed(6)))
        setFormLng(parseFloat(pos.lng.toFixed(6)))
      })

      draftMarkerRef.current = marker
    }
  }

  const removeDraftMarker = () => {
    if (draftMarkerRef.current) {
      draftMarkerRef.current.remove()
      draftMarkerRef.current = null
    }
  }

  // Handle map click when Admin Studio is open
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (adminStudioOpen) {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))
        if (adminTab === 'polygon') {
          if (polygonEditMode === 'add') {
            setPolygonParts((prev) => {
              const updated = prev.map((part) => [...part])
              if (!updated[activePartIndex]) {
                updated[activePartIndex] = []
              }
              updated[activePartIndex].push([lat, lng])
              return updated
            })
          }
          return
        }
        if (geometryMode === 'route') {
          setRouteWaypoints((prev) => [...prev, [lat, lng]])
        } else {
          setFormLat(lat)
          setFormLng(lng)
          updateDraftMarker(lat, lng)
        }
      }
    }

    map.on('click', onMapClick)
    return () => {
      map.off('click', onMapClick)
    }
  }, [adminStudioOpen, adminTab, polygonEditMode, activePartIndex, geometryMode])

  // Manage draft route polyline and draggable vertex handles for Admin Studio
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Clean up previous draft route
    if (draftPolylineRef.current) {
      draftPolylineRef.current.remove()
      draftPolylineRef.current = null
    }
    draftVertexMarkersRef.current.forEach((m) => m.remove())
    draftVertexMarkersRef.current = []

    if (!adminStudioOpen || geometryMode !== 'route') return

    // Draw polyline if at least 2 points
    if (routeWaypoints.length >= 2) {
      const color =
        routeType === 'maritime' ? '#0284c7' : routeType === 'heritage' ? '#b45309' : '#dc2626'
      const poly = L.polyline(routeWaypoints, {
        color,
        weight: 4.5,
        dashArray: routeType === 'maritime' ? '8, 8' : undefined,
        opacity: 0.9,
      }).addTo(map)
      draftPolylineRef.current = poly
    }

    // Draw vertex handles for every point in routeWaypoints
    routeWaypoints.forEach(([lat, lng], idx) => {
      const isStart = idx === 0
      const isEnd = idx === routeWaypoints.length - 1
      const vertexColor = isStart ? '#059669' : isEnd ? '#dc2626' : '#0284c7'

      const vertexIcon = L.divIcon({
        className: 'route-vertex-handle',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid ${vertexColor};
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
          ">${idx + 1}</div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      const vertexMarker = L.marker([lat, lng], {
        icon: vertexIcon,
        draggable: true,
      }).addTo(map)

      // Live dragging update
      vertexMarker.on('drag', (ev: any) => {
        const pos = ev.target.getLatLng()
        const updated = [...routeWaypoints]
        updated[idx] = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]
        if (draftPolylineRef.current) {
          draftPolylineRef.current.setLatLngs(updated)
        }
      })

      // Commit dragged position on dragend
      vertexMarker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng()
        setRouteWaypoints((prev) => {
          const next = [...prev]
          next[idx] = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]
          return next
        })
      })

      draftVertexMarkersRef.current.push(vertexMarker)
    })
  }, [adminStudioOpen, geometryMode, routeWaypoints, routeType])

  // Manage draft polygon parts and draggable vertex handles for Village Polygon Studio
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Clean up previous draft polygon parts and handles
    draftPolygonPartsRef.current.forEach((p) => p.remove())
    draftPolygonPartsRef.current = []
    draftPolygonVertexMarkersRef.current.forEach((m) => m.remove())
    draftPolygonVertexMarkersRef.current = []

    if (!adminStudioOpen || adminTab !== 'polygon') return

    // Draw all parts of the village
    polygonParts.forEach((part, partIdx) => {
      const isActive = partIdx === activePartIndex
      if (part.length >= 3) {
        const poly = L.polygon(part, {
          color: editingVillageColor || '#059669',
          weight: isActive ? 3.5 : 2,
          fillColor: editingVillageColor || '#059669',
          fillOpacity: isActive ? 0.45 : 0.22,
          dashArray: isActive ? undefined : '5, 5',
        }).addTo(map)

        // Clicking on an inactive part switches to it
        if (!isActive) {
          poly.on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            setActivePartIndex(partIdx)
          })
        }
        draftPolygonPartsRef.current.push(poly)
      } else if (part.length === 2 && isActive) {
        const line = L.polyline(part, {
          color: editingVillageColor || '#059669',
          weight: 2.5,
          dashArray: '4, 4',
        }).addTo(map)
        draftPolygonPartsRef.current.push(line as any)
      }
    })

    // Draw vertex handles ONLY on the ACTIVE part to keep UI clean and prevent confusion
    const activePart = polygonParts[activePartIndex] || []
    activePart.forEach(([lat, lng], idx) => {
      const vertexIcon = L.divIcon({
        className: 'custom-vertex-handle',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #ffffff;
            border: 2.5px solid ${editingVillageColor || '#059669'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: grab;
            user-select: none;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([lat, lng], {
        icon: vertexIcon,
        draggable: true,
      }).addTo(map)

      marker.on('drag', (ev: any) => {
        const newLatLng = ev.target.getLatLng()
        const updatedPart = [...activePart]
        updatedPart[idx] = [parseFloat(newLatLng.lat.toFixed(6)), parseFloat(newLatLng.lng.toFixed(6))]
        const activePoly = draftPolygonPartsRef.current[activePartIndex]
        if (activePoly) {
          activePoly.setLatLngs(updatedPart)
        }
      })

      marker.on('dragend', (ev: any) => {
        const newLatLng = ev.target.getLatLng()
        setPolygonParts((prev) => {
          const next = prev.map((p, pIdx) => {
            if (pIdx !== activePartIndex) return [...p]
            const updated = [...p]
            updated[idx] = [parseFloat(newLatLng.lat.toFixed(6)), parseFloat(newLatLng.lng.toFixed(6))]
            return updated
          })
          return next
        })
      })

      // Right click to delete vertex
      marker.on('contextmenu', (ev: any) => {
        L.DomEvent.stopPropagation(ev)
        setPolygonParts((prev) => {
          const next = prev.map((p, pIdx) => {
            if (pIdx !== activePartIndex) return p
            return p.filter((_, i) => i !== idx)
          })
          return next
        })
      })

      draftPolygonVertexMarkersRef.current.push(marker)
    })
  }, [adminStudioOpen, adminTab, polygonParts, activePartIndex, editingVillageColor])

  const handleUndoLastWaypoint = () => {
    setRouteWaypoints((prev) => prev.slice(0, -1))
  }

  const handleClearRoute = () => {
    setRouteWaypoints([])
  }

  // Admin Studio Handlers
  const handleOpenNewPoint = () => {
    setEditingFeatureId(null)
    setGeometryMode('point')
    setRouteWaypoints([])
    setFormName('')
    setFormLayer('LAYER_TOURISM_4A')
    setFormCategory('publik')
    setFormIsland('Pulau Neira')
    setFormLat(-4.5261)
    setFormLng(129.8989)
    setFormDescription('')
    setForm4aSubType('bahari')
    setForm4aHighlights('')
    setForm4aBoatAccess('')
    setForm4aTravelTime('')
    setForm4aEntryFee('')
    setForm4aBestTime('')
    setForm4aFacilities('')
    setForm4aContactWhatsapp('')
    setForm4aGuideAvailable(true)
    setAdminTab('search')
    setAdminStudioOpen(true)
    updateDraftMarker(-4.5261, 129.8989)
  }

  const handleOpenNewRoute = () => {
    setEditingFeatureId(null)
    setGeometryMode('route')
    setRouteWaypoints([])
    setRouteType('maritime')
    setRouteTransport('Speedboat')
    setRouteTravelTime('25 - 35 Menit')
    setRouteStartName('Pelabuhan Laut Utama Banda Neira')
    setRouteEndName('Terminal Dermaga Pulau Ay')
    setFormName('Jalur Penyeberangan Speedboat Neira - Pulau Ay')
    setFormLayer('LAYER_PUBLIC_SAFETY')
    setFormCategory('publik')
    setFormIsland('Pulau Ay')
    setFormDescription('Jalur penyeberangan speedboat antar-pulau melintasi perairan Selat Ay.')
    setAdminTab('form')
    setAdminStudioOpen(true)
    removeDraftMarker()
  }

  const handleCloseAdminStudio = () => {
    setAdminStudioOpen(false)
    setEditingFeatureId(null)
    setEditingVillageId(null)
    removeDraftMarker()
    if (draftPolylineRef.current) {
      draftPolylineRef.current.remove()
      draftPolylineRef.current = null
    }
    draftVertexMarkersRef.current.forEach((m) => m.remove())
    draftVertexMarkersRef.current = []
    setRouteWaypoints([])
    draftPolygonPartsRef.current.forEach((p) => p.remove())
    draftPolygonPartsRef.current = []
    draftPolygonVertexMarkersRef.current.forEach((m) => m.remove())
    draftPolygonVertexMarkersRef.current = []
    setPolygonParts([[]])
    setActivePartIndex(0)
  }

  // Village Polygon Handlers (Dukungan Multi-Bagian Wilayah Terpisah)
  const handleStartEditVillagePolygon = (vName: string) => {
    const feat = villageGeoJSON.features.find((f: any) => f.properties.name === vName)
    if (!feat) return

    let parts: [number, number][][] = []
    if (feat.geometry?.type === 'Polygon' && Array.isArray(feat.geometry.coordinates)) {
      feat.geometry.coordinates.forEach((ring: any) => {
        if (Array.isArray(ring)) {
          const latlngs: [number, number][] = ring.map((c: any) => [Number(c[1]), Number(c[0])])
          if (
            latlngs.length > 2 &&
            latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
            latlngs[0][1] === latlngs[latlngs.length - 1][1]
          ) {
            latlngs.pop()
          }
          if (latlngs.length > 0) parts.push(latlngs)
        }
      })
    } else if (feat.geometry?.type === 'MultiPolygon' && Array.isArray(feat.geometry.coordinates)) {
      feat.geometry.coordinates.forEach((poly: any) => {
        if (Array.isArray(poly) && Array.isArray(poly[0])) {
          const latlngs: [number, number][] = poly[0].map((c: any) => [Number(c[1]), Number(c[0])])
          if (
            latlngs.length > 2 &&
            latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
            latlngs[0][1] === latlngs[latlngs.length - 1][1]
          ) {
            latlngs.pop()
          }
          if (latlngs.length > 0) parts.push(latlngs)
        }
      })
    }

    if (parts.length === 0) {
      parts = [[]]
    }

    const details = villageDetailsMap[vName] || {}

    setEditingVillageId(feat.id || `desa-${vName.toLowerCase().replace(/\s+/g, '-')}`)
    setEditingVillageName(vName)
    setEditingVillageIsland(feat.properties.island || details.island || 'Pulau Neira')
    setEditingVillageColor(feat.properties.color || details.color || '#3b82f6')
    setEditingVillageDesc(details.description || '')
    setEditingVillagePop(details.population || '')
    setEditingVillageCommodity(details.main_commodity || '')
    setEditingVillageArea(details.area_ha || '')
    setEditingVillageAreaKm2(details.area_km2 || '')
    setEditingVillageDensity(details.density || '')
    setPolygonParts(parts)
    setActivePartIndex(0)
    setPolygonEditMode('move') // Standar mode geser agar aman dan tidak membuat titik liar

    setAdminStudioOpen(true)
    setAdminTab('polygon')

    if (mapInstanceRef.current && parts[0] && parts[0].length > 0) {
      const allPoints: [number, number][] = []
      parts.forEach((p) => allPoints.push(...p))
      const bounds = L.latLngBounds(allPoints)
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
    }
  }

  const handleAddNewVillagePolygon = () => {
    setEditingVillageId(null)
    setEditingVillageName('')
    setEditingVillageIsland('Pulau Neira')
    setEditingVillageColor('#3b82f6')
    setEditingVillageDesc('')
    setEditingVillagePop('')
    setEditingVillageCommodity('')
    setEditingVillageArea('')
    setEditingVillageAreaKm2('')
    setEditingVillageDensity('')
    setPolygonParts([[]])
    setActivePartIndex(0)
    setPolygonEditMode('add')
    setAdminStudioOpen(true)
    setAdminTab('polygon')
  }

  const handleAddNewVillagePart = () => {
    setPolygonParts((prev) => [...prev, []])
    setActivePartIndex(polygonParts.length)
    setPolygonEditMode('add')
  }

  const handleDeleteActiveVillagePart = (partIdx: number) => {
    if (polygonParts.length <= 1) {
      setPolygonParts([[]])
      setActivePartIndex(0)
      return
    }
    const updated = polygonParts.filter((_, idx) => idx !== partIdx)
    setPolygonParts(updated)
    setActivePartIndex(Math.max(0, partIdx - 1))
  }

  const handleSaveVillagePolygon = () => {
    // Validasi setiap bagian daratan desa
    const validParts: [number, number][][] = []
    polygonParts.forEach((part) => {
      if (part.length >= 3) {
        const closed: [number, number][] = part.map(([lat, lng]) => [lng, lat])
        const first = closed[0]
        const last = closed[closed.length - 1]
        if (first[0] !== last[0] || first[1] !== last[1]) {
          closed.push([first[0], first[1]])
        }
        validParts.push(closed)
      }
    })

    if (validParts.length === 0) {
      alert('Tentukan setidaknya 3 titik sudut untuk membentuk batas wilayah desa!')
      return
    }
    if (!editingVillageName.trim()) {
      alert('Nama desa / wilayah wajib diisi!')
      return
    }

    const featureId = editingVillageId || `desa-${editingVillageName.toLowerCase().replace(/\s+/g, '-')}`

    const updatedFeatures = villageGeoJSON.features.filter(
      (f: any) => f.id !== featureId && f.properties.name !== editingVillageName
    )

    let geometry: any
    if (validParts.length === 1) {
      geometry = {
        type: 'Polygon',
        coordinates: [validParts[0]],
      }
    } else {
      geometry = {
        type: 'MultiPolygon',
        coordinates: validParts.map((p) => [p]),
      }
    }

    const newFeature = {
      type: 'Feature',
      id: featureId,
      properties: {
        name: editingVillageName,
        island: editingVillageIsland,
        color: editingVillageColor,
      },
      geometry,
    }
    updatedFeatures.push(newFeature)

    const newGeoJSON = {
      ...villageGeoJSON,
      features: updatedFeatures,
    }

    setVillageGeoJSON(newGeoJSON)

    // Update village details
    const updatedDetails = {
      ...villageDetailsMap,
      [editingVillageName]: {
        name: editingVillageName,
        island: editingVillageIsland,
        color: editingVillageColor,
        description: editingVillageDesc || 'Wilayah administrasi desa di Kepulauan Banda.',
        population: editingVillagePop,
        main_commodity: editingVillageCommodity,
        area_ha: editingVillageArea,
        area_km2: editingVillageAreaKm2,
        density: editingVillageDensity,
      },
    }
    setVillageDetailsMap(updatedDetails)

    // Simpan langsung ke basis data PostGIS dan seeder server
    const token = authService.getAccessToken() || undefined
    gisService.saveVillagePolygon({
      name: editingVillageName,
      island: editingVillageIsland,
      geometry,
      color: editingVillageColor,
      description: editingVillageDesc,
      population: editingVillagePop,
      main_commodity: editingVillageCommodity,
      area_ha: editingVillageArea,
      area_km2: editingVillageAreaKm2,
      density: editingVillageDensity,
      demographics: villageDetailsMap[editingVillageName]?.demographics || {},
    }, token).catch((err) => {
      console.warn('Gagal menyimpan poligon langsung ke database PostGIS:', err)
    })

    gisService.syncVillages(newGeoJSON, updatedDetails, token).catch((err) => {
      console.warn('Gagal sync seluruh zona desa ke PostGIS:', err)
    })

    setNotificationMsg({
      type: 'success',
      text: `Batas wilayah desa ${editingVillageName} berhasil disimpan ke basis data PostGIS!`,
    })
    setTimeout(() => setNotificationMsg(null), 5000)
    setAdminStudioOpen(false)
  }

  const handleSyncVillagesToServer = async () => {
    setIsSyncingVillages(true)
    try {
      const token = authService.getAccessToken() || undefined
      const res = await gisService.syncVillages(villageGeoJSON, villageDetailsMap, token)
      setNotificationMsg({
        type: 'success',
        text: `Berhasil! ${res.message || 'Seluruh zona batas wilayah desa telah tersimpan ke seeder dan basis data PostGIS untuk seluruh tim.'}`,
      })
      setTimeout(() => setNotificationMsg(null), 5000)
    } catch (err: any) {
      alert(`Gagal menyimpan ke server: ${err?.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsSyncingVillages(false)
    }
  }

  const handleDeleteVillagePolygon = () => {
    if (!editingVillageName) return
    if (!window.confirm(`Hapus batas wilayah ${editingVillageName}?`)) return

    const updatedFeatures = villageGeoJSON.features.filter(
      (f: any) => f.id !== editingVillageId && f.properties.name !== editingVillageName
    )
    const newGeoJSON = {
      ...villageGeoJSON,
      features: updatedFeatures,
    }
    setVillageGeoJSON(newGeoJSON)
    localStorage.setItem('banda_village_polygons_v1', JSON.stringify(newGeoJSON))
    localStorage.setItem('banda_village_polygons_v2', JSON.stringify(newGeoJSON))

    // Hapus juga langsung dari database PostGIS
    const token = authService.getAccessToken() || undefined
    gisService.syncVillages(newGeoJSON, villageDetailsMap, token).catch((err) => {
      console.warn('Gagal sync penghapusan zona desa ke PostGIS:', err)
    })

    setPolygonParts([[]])
    setActivePartIndex(0)
    setEditingVillageId(null)
    setNotificationMsg({
      type: 'info',
      text: `Batas wilayah ${editingVillageName} telah dihapus dari basis data dan peta.`,
    })
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleResetVillagePolygons = () => {
    if (!window.confirm('Kembalikan seluruh batas wilayah desa ke bentuk awal?')) return
    localStorage.removeItem('banda_village_polygons_v1')
    localStorage.removeItem('banda_village_details_v1')
    localStorage.removeItem('banda_village_details_v2')
    setVillageGeoJSON(BANDA_VILLAGES_GEOJSON)
    setVillageDetailsMap(VILLAGE_DETAILS)
    setPolygonParts([[]])
    setActivePartIndex(0)
    setEditingVillageId(null)
    setNotificationMsg({
      type: 'info',
      text: 'Batas wilayah desa telah dikembalikan ke setelan awal.',
    })
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleDownloadVillageGeoJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(villageGeoJSON, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', 'banda_villages_calibrated.geojson')
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleStartEditFeature = (feat: GeoJSONFeature) => {
    const p = feat.properties
    setEditingFeatureId(feat.id)
    setFormName(p.name || '')
    setFormLayer(p.layer_type || 'LAYER_TOURISM_4A')
    setFormCategory(p.category || 'publik')
    setFormIsland(p.island_name || 'Pulau Neira')
    setFormDescription(p.description || '')

    const isLine = feat.geometry?.type === 'LineString' && Array.isArray(feat.geometry.coordinates)
    if (isLine) {
      setGeometryMode('route')
      const waypoints: [number, number][] = feat.geometry.coordinates.map((c: any) => [
        Number(c[1]),
        Number(c[0]),
      ])
      setRouteWaypoints(waypoints)
      setRouteType(p.properties_meta?.route_type || p.route_type || 'maritime')
      setRouteTransport(p.properties_meta?.transport_mode || p.transport_mode || 'Speedboat')
      setRouteTravelTime(p.properties_meta?.travel_time || p.travel_time || '')
      setRouteStartName(p.properties_meta?.start_point || p.start_point || '')
      setRouteEndName(p.properties_meta?.end_point || p.end_point || '')
      removeDraftMarker()
      if (waypoints.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(waypoints[0], 13)
      }
    } else {
      setGeometryMode('point')
      setRouteWaypoints([])
      const [lng, lat] = feat.geometry.coordinates
      setFormLat(lat)
      setFormLng(lng)
      updateDraftMarker(lat, lng)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 15)
      }
    }

    // 4A metadata fields
    setForm4aSubType(p.sub_type || 'bahari')
    setForm4aHighlights(p.highlights || p.era || '')
    setForm4aBoatAccess(p.boat_access || '')
    setForm4aTravelTime(p.travel_time || '')
    setForm4aEntryFee(p.entry_fee_rp?.toString() || p.price_per_night_rp?.toString() || '')
    setForm4aBestTime(p.best_time || '')
    setForm4aFacilities(p.facilities || '')
    setForm4aContactWhatsapp(p.contact_whatsapp || '')
    setForm4aGuideAvailable(Boolean(p.guide_available))

    setAdminTab('form')
    setAdminStudioOpen(true)
  }

  const handleSearchGmaps = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchGmapsQuery.trim() || searchGmapsQuery.trim().length < 2) return

    setSearchGmapsLoading(true)
    try {
      const res = await gisService.searchExternal(searchGmapsQuery.trim())
      setSearchGmapsResults(res.results || [])
    } catch (err: any) {
      alert(`Gagal mencari titik eksternal: ${err?.message || 'Terjadi kesalahan'}`)
    } finally {
      setSearchGmapsLoading(false)
    }
  }

  const handleSelectGmapsResult = (res: GeocodingResult) => {
    if (geometryMode === 'route') {
      setRouteWaypoints((prev) => [...prev, [res.lat, res.lng]])
      setAdminTab('form')
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([res.lat, res.lng], 15)
      }
      return
    }

    setFormName(res.name)
    setFormLat(res.lat)
    setFormLng(res.lng)
    setFormIsland(res.island)
    setFormLayer(res.suggested_layer || 'LAYER_TOURISM_4A')
    setFormCategory(['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(res.suggested_layer) ? 'resiliensi' : 'publik')
    updateDraftMarker(res.lat, res.lng)
    setAdminTab('form')

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 15)
    }
  }

  const handleSaveSpatialFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      alert(geometryMode === 'route' ? 'Nama rute jalur wajib diisi.' : 'Nama objek/titik wajib diisi.')
      return
    }

    if (geometryMode === 'route' && routeWaypoints.length < 2) {
      alert('Garis rute memerlukan minimal 2 titik belokan pada peta. Silakan klik peta untuk menambahkan lintasan rute.')
      return
    }

    const token = authService.getAccessToken()
    if (!token) {
      alert('Sesi autentikasi telah berakhir. Harap login kembali.')
      return
    }

    setIsSavingFeature(true)
    try {
      let payload: any = {}

      if (geometryMode === 'route') {
        const dist = calculateTotalDistance(routeWaypoints)
        const midIdx = Math.floor(routeWaypoints.length / 2)
        const routePropertiesMeta: Record<string, any> = {
          is_route: true,
          route_type: routeType,
          transport_mode: routeTransport,
          travel_time: routeTravelTime.trim() || undefined,
          total_distance_km: dist.km,
          total_distance_nm: dist.nm,
          waypoints_count: routeWaypoints.length,
          start_point: routeStartName.trim() || undefined,
          end_point: routeEndName.trim() || undefined,
        }

        payload = {
          name: formName.trim(),
          layer_type: formLayer,
          category: ['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(formLayer) ? 'resiliensi' : formCategory,
          island_name: formIsland,
          latitude: Number(routeWaypoints[midIdx][0]),
          longitude: Number(routeWaypoints[midIdx][1]),
          geometry_geojson: {
            type: 'LineString',
            coordinates: routeWaypoints.map(([lat, lng]) => [lng, lat]),
          },
          properties_meta: routePropertiesMeta,
          description: formDescription.trim() || undefined,
          is_active: true,
        }
      } else {
        const properties_meta: Record<string, any> = {}
        if (formLayer === 'LAYER_TOURISM_4A') {
          if (form4aSubType) properties_meta.sub_type = form4aSubType
          if (form4aHighlights) properties_meta.highlights = form4aHighlights
          if (form4aBoatAccess) properties_meta.boat_access = form4aBoatAccess
          if (form4aTravelTime) properties_meta.travel_time = form4aTravelTime
          if (form4aEntryFee) properties_meta.entry_fee_rp = parseInt(form4aEntryFee, 10) || 0
          if (form4aBestTime) properties_meta.best_time = form4aBestTime
          if (form4aFacilities) properties_meta.facilities = form4aFacilities
          if (form4aContactWhatsapp) properties_meta.contact_whatsapp = form4aContactWhatsapp
          properties_meta.guide_available = form4aGuideAvailable
        } else if (formLayer === 'LAYER_ACCOMMODATION') {
          if (form4aEntryFee) properties_meta.price_per_night_rp = parseInt(form4aEntryFee, 10) || 0
          if (form4aContactWhatsapp) properties_meta.contact_whatsapp = form4aContactWhatsapp
          if (form4aFacilities) properties_meta.facilities = form4aFacilities
        } else if (formLayer === 'LAYER_HERITAGE') {
          if (form4aHighlights) properties_meta.era = form4aHighlights
          if (form4aEntryFee) properties_meta.entry_fee_rp = parseInt(form4aEntryFee, 10) || 0
        }

        payload = {
          name: formName.trim(),
          layer_type: formLayer,
          category: ['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(formLayer) ? 'resiliensi' : formCategory,
          island_name: formIsland,
          latitude: Number(formLat),
          longitude: Number(formLng),
          properties_meta,
          description: formDescription.trim() || undefined,
          is_active: true,
        }
      }

      if (editingFeatureId) {
        await gisService.updateFeature(editingFeatureId, payload, token)
        setNotificationMsg({
          type: 'success',
          text: `Berhasil memperbarui ${geometryMode === 'route' ? 'garis rute' : 'titik'} '${formName}' di PostGIS!`,
        })
      } else {
        await gisService.createFeature(payload, token)
        setNotificationMsg({
          type: 'success',
          text: `Berhasil menambahkan ${geometryMode === 'route' ? 'rute baru' : 'titik baru'} '${formName}' di PostGIS!`,
        })
      }

      await loadGISData()
      handleCloseAdminStudio()
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err?.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setIsSavingFeature(false)
    }
  }

  const handleDeleteFeature = async (featureId: string, featureName: string) => {
    if (!window.confirm(`Yakin ingin menghapus titik '${featureName}' dari database PostGIS? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    const token = authService.getAccessToken()
    if (!token) {
      alert('Sesi autentikasi telah berakhir. Harap login kembali.')
      return
    }

    setIsDeletingFeature(true)
    try {
      await gisService.deleteFeature(featureId, token)
      setNotificationMsg({
        type: 'info',
        text: `Titik '${featureName}' berhasil dihapus dari database PostGIS.`,
      })
      setSelectedFeature(null)
      await loadGISData()
    } catch (err: any) {
      alert(`Gagal menghapus titik: ${err?.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsDeletingFeature(false)
    }
  }

  // Filter features according to active filters
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const { layer_type, island_name, name, description } = feat.properties

      // Layer multi-selection filter
      if (!selectedLayers.has(layer_type)) return false

      // Island filter
      if (islandFilter && island_name !== islandFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = name.toLowerCase().includes(q)
        const matchDesc = description ? description.toLowerCase().includes(q) : false
        const matchIsland = island_name.toLowerCase().includes(q)
        if (!matchName && !matchDesc && !matchIsland) return false
      }

      return true
    })
  }, [features, selectedLayers, islandFilter, searchQuery])

  // Update Leaflet markers whenever filteredFeatures change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return

    layerGroupRef.current.clearLayers()

    filteredFeatures.forEach((feat) => {
      // 1. Render Route (LineString) features
      if (feat.geometry?.type === 'LineString' && Array.isArray(feat.geometry.coordinates)) {
        if (!showRoutes) return
        const latlngs: [number, number][] = feat.geometry.coordinates.map((c: any) => [
          Number(c[1]),
          Number(c[0]),
        ])
        if (latlngs.length < 2) return

        const { name, properties_meta } = feat.properties
        const rType = properties_meta?.route_type || 'maritime'
        const isSelected = selectedFeature?.id === feat.id

        const color =
          rType === 'maritime'
            ? '#0284c7'
            : rType === 'heritage'
            ? '#b45309'
            : rType === 'trekking'
            ? '#dc2626'
            : '#2563eb'

        const polyline = L.polyline(latlngs, {
          color,
          weight: isSelected ? 5.5 : 4,
          dashArray: rType === 'maritime' ? '8, 8' : undefined,
          opacity: isSelected ? 1 : 0.85,
        })

        const distKm = properties_meta?.total_distance_km ? `${properties_meta.total_distance_km} km` : ''
        const tTime = properties_meta?.travel_time ? ` · ${properties_meta.travel_time}` : ''
        const mode = properties_meta?.transport_mode ? ` · ${properties_meta.transport_mode}` : ''

        polyline.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; font-weight: 600;"><b>${name}</b><br/><span style="font-size: 10px; color: #64748b;">${distKm}${tTime}${mode}</span></div>`,
          { sticky: true }
        )

        polyline.on('click', () => {
          setSelectedFeature(feat)
          setIsDrawerCollapsed(false)
        })

        layerGroupRef.current?.addLayer(polyline)
        return
      }

      // 2. Render Point features
      if (!feat.geometry?.coordinates || !Array.isArray(feat.geometry.coordinates)) return
      const [lng, lat] = feat.geometry.coordinates
      if (typeof lng !== 'number' || typeof lat !== 'number') return

      const { name, layer_type, island_name, description } = feat.properties

      const color = LAYER_COLORS[layer_type] || '#10b981'
      const label = LAYER_LABELS[layer_type] || layer_type
      const isSelected = selectedFeature?.id === feat.id

      // Cartographic Location Pin SVG (replacing pulse dots)
      const pinWidth = isSelected ? 32 : 26
      const pinHeight = isSelected ? 40 : 34
      const iconHtml = `
        <div class="banda-gis-pin-wrapper" style="
          position: relative;
          width: ${pinWidth}px;
          height: ${pinHeight}px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          filter: drop-shadow(0 3px 6px rgba(15, 23, 42, 0.35));
          transition: transform 0.15s ease-out;
        ">
          <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
              fill="${color}"
              stroke="#ffffff"
              stroke-width="${isSelected ? '2.2' : '1.8'}"
            />
            <circle cx="14" cy="13.5" r="5.5" fill="#ffffff" />
            <circle cx="14" cy="13.5" r="3.2" fill="${color}" />
          </svg>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: iconHtml,
        iconSize: [pinWidth, pinHeight],
        iconAnchor: [pinWidth / 2, pinHeight],
        popupAnchor: [0, -pinHeight],
      })

      const marker = L.marker([lat, lng], { icon: customIcon })

      // Custom Popup HTML
      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; color: #1e293b; min-width: 220px; max-width: 260px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em;">
              ${label}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 800; color: #0f172a;">${name}</h4>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${island_name}</span>
          </div>
          ${description ? `<p style="margin: 0 0 8px; font-size: 11px; color: #475569; line-height: 1.4;">${description.slice(0, 110)}...</p>` : ''}
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; font-family: monospace;">
            Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on('click', () => {
        setSelectedFeature(feat)
        setIsDrawerCollapsed(false)
      })

      layerGroupRef.current?.addLayer(marker)
    })
  }, [filteredFeatures, selectedFeature])

  // Manage and Render Administrative Village Boundaries (Choropleth Polygons)
  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (villageBoundariesLayerRef.current) {
      villageBoundariesLayerRef.current.remove()
      villageBoundariesLayerRef.current = null
    }

    if (!showVillageBoundaries) return

    const sanitizedData = sanitizeVillageGeoJSON(villageGeoJSON)
    const geoJsonLayer = L.geoJSON(sanitizedData, {
      style: (feat) => {
        const vName = feat?.properties?.name
        const isSelected = selectedVillage?.name === vName
        const isBeingEdited = adminStudioOpen && adminTab === 'polygon' && editingVillageName === vName
        if (isBeingEdited) {
          // Hide polygon while in active edit mode so draft polygon with handles is shown
          return { fillOpacity: 0, opacity: 0 }
        }

        const details = villageDetailsMap[vName] || VILLAGE_DETAILS[vName]

        if (showDensityHeatmap) {
          const tier = getDensityTier(details?.density)
          return {
            fillColor: tier.color,
            fillOpacity: isSelected ? 0.85 : tier.fillOpacity,
            color: isSelected ? '#0f172a' : tier.borderColor,
            weight: isSelected ? 2.5 : 1.4,
            dashArray: isSelected ? undefined : '2, 2',
          }
        }

        const baseColor = feat?.properties?.color || '#3b82f6'
        return {
          fillColor: baseColor,
          fillOpacity: isSelected ? 0.62 : 0.28,
          color: isSelected ? '#0f172a' : baseColor,
          weight: isSelected ? 2.5 : 1.2,
          dashArray: isSelected ? undefined : '3, 3',
        }
      },
      onEachFeature: (feat, layer) => {
        const { name, island, color } = feat.properties
        const details = villageDetailsMap[name] || VILLAGE_DETAILS[name]
        const tier = getDensityTier(details?.density)

        const tooltipHtml = showDensityHeatmap
          ? `<div style="font-family: inherit; font-size: 11px; font-weight: 700; color: #0f172a; padding: 1px 0;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
                <b>${name}</b>
                <span style="font-size: 8.5px; padding: 1px 5px; border-radius: 4px; background: ${tier.color}; color: #ffffff; font-weight: 700;">
                  ${tier.tier}
                </span>
              </div>
              <div style="font-size: 9px; color: #64748b; font-weight: 500;">${island}</div>
              <div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; font-size: 9px; color: #0f172a;">
                <b>Kepadatan:</b> <span style="color: ${tier.color}; font-weight: 800;">${details?.density || '-'} jiwa/km²</span>
                ${details?.population ? `<br/><span style="color: #64748b;">Penduduk: ${details.population}</span>` : ''}
                ${details?.area_km2 ? `<br/><span style="color: #64748b;">Luas: ${details.area_km2} km²</span>` : ''}
              </div>
            </div>`
          : `<div style="font-family: inherit; font-size: 11px; font-weight: 700; color: #0f172a;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${color}; margin-right: 4px;"></span>
              <b>${name}</b><br/>
              <span style="font-size: 9px; color: #64748b; font-weight: 500;">${island}</span>
              ${details?.area_km2 ? `<br/><span style="font-size: 9px; color: #0f766e; font-weight: 600;">Luas: ${details.area_km2} km² | Kepadatan: ${details.density} jiwa/km²</span>` : ''}
            </div>`

        layer.bindTooltip(tooltipHtml, { sticky: true, opacity: 0.98 })

        layer.on({
          mouseover: (e: any) => {
            const l = e.target
            if (selectedVillage?.name !== name) {
              l.setStyle({
                fillOpacity: showDensityHeatmap ? 0.88 : 0.52,
                weight: 2,
              })
            }
          },
          mouseout: (e: any) => {
            const l = e.target
            if (selectedVillage?.name !== name) {
              const defaultOpacity = showDensityHeatmap ? tier.fillOpacity : 0.28
              l.setStyle({
                fillOpacity: defaultOpacity,
                weight: showDensityHeatmap ? 1.4 : 1.2,
              })
            }
          },
          click: (e: any) => {
            L.DomEvent.stopPropagation(e)
            if (details) {
              setSelectedVillage(details)
            } else {
              setSelectedVillage({
                name,
                island,
                color,
                description: 'Wilayah administrasi desa di Kepulauan Banda.',
              })
            }
          },
        })
      },
    })

    geoJsonLayer.addTo(mapInstanceRef.current)
    geoJsonLayer.bringToBack()
    villageBoundariesLayerRef.current = geoJsonLayer
  }, [showVillageBoundaries, showDensityHeatmap, selectedVillage, villageGeoJSON, villageDetailsMap, adminStudioOpen, adminTab, editingVillageName])

  const handleFocusVillage = (vName: string) => {
    const details = villageDetailsMap[vName] || VILLAGE_DETAILS[vName]
    if (details) setSelectedVillage(details)
    if (villageBoundariesLayerRef.current && mapInstanceRef.current) {
      villageBoundariesLayerRef.current.eachLayer((layer: any) => {
        if (layer.feature?.properties?.name === vName) {
          const bounds = layer.getBounds()
          mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
      })
    }
  }

  // Toggle single layer
  const toggleLayer = (layerId: string) => {
    setSelectedLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layerId)) {
        next.delete(layerId)
      } else {
        next.add(layerId)
      }
      return next
    })
  }

  // Select all or clear layers
  const selectAllLayers = () => {
    setSelectedLayers(
      new Set([
        'LAYER_TOURISM_4A',
        'LAYER_HERITAGE',
        'LAYER_ACCOMMODATION',
        'LAYER_KOPERASI_UMKM',
        'LAYER_PUBLIC_SAFETY',
        'LAYER_WATER_INFRA',
        'LAYER_ENERGY_WASTE',
      ])
    )
  }

  const clearAllLayers = () => {
    setSelectedLayers(new Set())
  }

  // Center map on specific feature
  const handleFocusFeature = (feat: GeoJSONFeature) => {
    setSelectedFeature(feat)
    setIsDrawerCollapsed(false)
    if (mapInstanceRef.current) {
      if (feat.geometry?.type === 'LineString' && Array.isArray(feat.geometry.coordinates)) {
        const coords: [number, number][] = feat.geometry.coordinates.map((c: any) => [Number(c[1]), Number(c[0])])
        const bounds = L.latLngBounds(coords)
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
      } else if (Array.isArray(feat.geometry?.coordinates)) {
        const [lng, lat] = feat.geometry.coordinates
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true })
      }
    }
  }

  // Copy Coordinates to Clipboard with user feedback
  const handleCopyCoordinates = async () => {
    if (!selectedFeature) return
    let text = ''
    if (Array.isArray(selectedFeature.geometry?.coordinates)) {
      if (typeof selectedFeature.geometry.coordinates[0] === 'number') {
        const [lng, lat] = selectedFeature.geometry.coordinates
        text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
    }
    if (!text && selectedFeature.properties.latitude && selectedFeature.properties.longitude) {
      text = `${Number(selectedFeature.properties.latitude).toFixed(6)}, ${Number(selectedFeature.properties.longitude).toFixed(6)}`
    }
    if (!text) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
      setCopiedCoord(true)
      setTimeout(() => setCopiedCoord(false), 2000)
    } catch (err) {
      console.error('Failed to copy coordinates:', err)
    }
  }

  // Fullscreen Toggle Handler (Native HTML5 API with CSS fallback)
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (workspaceContainerRef.current?.requestFullscreen) {
          await workspaceContainerRef.current.requestFullscreen()
        } else if ((workspaceContainerRef.current as any)?.webkitRequestFullscreen) {
          await (workspaceContainerRef.current as any).webkitRequestFullscreen()
        } else {
          setIsFullscreen(true)
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch {
      // In case native fullscreen permission is restricted in environment, fallback to CSS overlay fullscreen
      setIsFullscreen((prev) => !prev)
    }
  }

  // Synchronize Leaflet map sizing and Esc key with fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement)
      setIsFullscreen(isFs)
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 150)
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 350)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false)
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 200)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  // Invalidate map size when adminStudioOpen or isFullscreen changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [isFullscreen, adminStudioOpen])

  // Reset Map View to default Banda center
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-4.5300, 129.9000], 12, { animate: true })
    }
  }

  return (
    <div
      ref={workspaceContainerRef}
      className={`workspace-container animate-fade-in ${isFullscreen ? 'workspace-fullscreen' : ''}`}
      style={
        isFullscreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
              background: '#f8fafc',
              overflowY: 'auto',
              padding: '0.85rem 1.25rem',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }
          : undefined
      }
    >
      {/* Workspace Header */}
      <div
        className="workspace-header"
        style={{
          marginBottom: isFullscreen ? '0.65rem' : '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: isFullscreen ? '1.25rem' : '1.45rem',
              fontWeight: 800,
              color: '#0f2c59',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Peta Kepulauan Banda Neira
            {isFullscreen && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                Layar Penuh
              </span>
            )}
          </h2>
          {!isFullscreen && (
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.825rem' }}>
              Eksplorasi destinasi wisata bahari, cagar budaya, penginapan, dan fasilitas umum di seluruh pulau.
            </p>
          )}
        </div>

        {/* Action Controls (Clean Admin Actions & Fullscreen Toggle) */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isOfficerOrAdmin && (
            <>
              <button
                type="button"
                onClick={handleOpenNewRoute}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.42rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: adminStudioOpen && geometryMode === 'route' ? '#0284c7' : '#ffffff',
                  color: adminStudioOpen && geometryMode === 'route' ? '#ffffff' : '#0284c7',
                  border: '1.5px solid #0284c7',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(2, 132, 199, 0.08)',
                }}
              >
                <Route size={13} />
                Tarik Rute Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  if (adminStudioOpen) {
                    handleCloseAdminStudio()
                  } else {
                    handleOpenNewPoint()
                  }
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.42rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: adminStudioOpen && geometryMode === 'point' ? '#059669' : '#ffffff',
                  color: adminStudioOpen && geometryMode === 'point' ? '#ffffff' : '#059669',
                  border: '1.5px solid #059669',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(5, 150, 105, 0.08)',
                }}
              >
                <Edit2 size={13} />
                {adminStudioOpen && geometryMode === 'point' ? 'Tutup Studio' : 'Tambah Titik'}
              </button>
            </>
          )}

          {/* Fullscreen Toggle Icon Button (Accessible for both regular users and admins) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              width: '34px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isFullscreen ? '#0f172a' : '#ffffff',
              color: isFullscreen ? '#ffffff' : '#334155',
              border: isFullscreen ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease',
            }}
            title={isFullscreen ? 'Keluar dari Layar Penuh (Esc)' : 'Layar Penuh Peta (Fullscreen)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {notificationMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background:
              notificationMsg.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : notificationMsg.type === 'info'
                ? 'rgba(6, 182, 212, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${
              notificationMsg.type === 'success'
                ? 'rgba(16, 185, 129, 0.4)'
                : notificationMsg.type === 'info'
                ? 'rgba(6, 182, 212, 0.4)'
                : 'rgba(239, 68, 68, 0.4)'
            }`,
            color:
              notificationMsg.type === 'success'
                ? '#34d399'
                : notificationMsg.type === 'info'
                ? '#38bdf8'
                : '#f87171',
            fontSize: '0.825rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 size={15} />
            ) : notificationMsg.type === 'info' ? (
              <AlertCircle size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Streamlined Search & Island Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '0.85rem',
        }}
      >
        {/* Search Box */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
          {loading ? (
            <RefreshCw size={13} className="animate-spin" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
          ) : (
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          )}
          <input
            type="text"
            placeholder="Cari tempat, benteng, pantai, penginapan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 2rem 0.45rem 2.2rem',
              fontSize: '0.8rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '999px',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(15, 44, 89, 0.04)',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Island Filter Chips */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {['', 'Pulau Neira', 'Banda Besar', 'Pulau Hatta', 'Pulau Ay', 'Pulau Rhun'].map((isl) => {
            const isSelected = islandFilter === isl
            return (
              <button
                type="button"
                key={isl}
                onClick={() => setIslandFilter(isl)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.32rem 0.75rem',
                  borderRadius: '999px',
                  border: isSelected ? '1.5px solid #081d35' : '1px solid #e2e8f0',
                  background: isSelected ? '#081d35' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  boxShadow: isSelected ? '0 2px 4px rgba(8, 29, 53, 0.15)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isl || 'Semua Pulau'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Admin Studio Editor Panel */}
      {adminStudioOpen && isOfficerOrAdmin && (
        <div
          className="animate-fade-in"
          style={{
            padding: '1.25rem',
            background: '#ffffff',
            border: '1.5px solid #081d35',
            borderRadius: '16px',
            marginBottom: '1.25rem',
            boxShadow: '0 10px 30px rgba(15, 44, 89, 0.08)',
          }}
        >
          {/* Studio Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                }}
              >
                <Edit2 size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f2c59' }}>
                  {adminTab === 'polygon'
                    ? `Batas Wilayah Desa: ${editingVillageName || 'Wilayah Baru'}`
                    : editingFeatureId
                    ? 'Edit Titik Spasial PostGIS'
                    : 'Studio Editor Titik Spasial PostGIS'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  {adminTab === 'polygon'
                    ? 'Geser titik-titik batas di peta untuk menyesuaikan garis batas pulau dan desa sesuai kondisi lapangan.'
                    : editingFeatureId
                    ? `Memperbarui titik: ${formName || 'Objek Terpilih'}`
                    : 'Tambah titik baru secara presisi atau tarik koordinat dari Google Maps / OSM'}
                </p>
              </div>
            </div>

            {/* Tab Switcher & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  padding: '0.2rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setAdminTab('form')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: adminTab === 'form' ? '#081d35' : 'transparent',
                    color: adminTab === 'form' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <MapPin size={12} />
                  Form Atribut &amp; 4A
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('search')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: adminTab === 'search' ? '#0284c7' : 'transparent',
                    color: adminTab === 'search' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Globe size={12} />
                  Cari Google Maps / OSM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('polygon')
                    if (!editingVillageName && villageGeoJSON.features.length > 0) {
                      handleStartEditVillagePolygon(villageGeoJSON.features[0].properties.name)
                    }
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: adminTab === 'polygon' ? '#0f766e' : 'transparent',
                    color: adminTab === 'polygon' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Layers size={12} />
                  Atur Batas Desa
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseAdminStudio}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Tutup Studio Editor"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tab 1: Google Maps / OSM Geocoding Search */}
          {adminTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={searchGmapsQuery}
                    onChange={(e) => setSearchGmapsQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearchGmaps()
                      }
                    }}
                    placeholder="Contoh: Benteng Belgica, The Maulana Hotel, Clove Farm..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchGmaps}
                  disabled={searchGmapsLoading || !searchGmapsQuery.trim()}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    background: '#081d35',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Search size={13} className={searchGmapsLoading ? 'animate-spin' : ''} />
                  {searchGmapsLoading ? 'Mencari...' : 'Tarik dari Google Maps / OSM'}
                </button>
              </div>

              {/* Geocoding Results List */}
              {searchGmapsResults.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {searchGmapsResults.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                            {item.source}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {item.island}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f2c59' }}>
                          {item.name}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectGmapsResult(item)}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#081d35',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={12} />
                        Gunakan Titik Ini &amp; Isi Form
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Form Atribut & 4A Wisata */}
          {adminTab === 'form' && (
            <form onSubmit={handleSaveSpatialFeature} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Geometry Mode Switcher: Point vs Route */}
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.35rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => {
                    setGeometryMode('point')
                    if (draftPolylineRef.current) draftPolylineRef.current.remove()
                    draftVertexMarkersRef.current.forEach((m) => m.remove())
                    draftVertexMarkersRef.current = []
                    updateDraftMarker(formLat, formLng)
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: geometryMode === 'point' ? '1.5px solid #0284c7' : '1px solid transparent',
                    background: geometryMode === 'point' ? '#ffffff' : 'transparent',
                    color: geometryMode === 'point' ? '#0284c7' : '#64748b',
                    boxShadow: geometryMode === 'point' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <MapPin size={14} />
                  <span>Titik Tunggal (Point)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGeometryMode('route')
                    removeDraftMarker()
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: geometryMode === 'route' ? '1.5px solid #0284c7' : '1px solid transparent',
                    background: geometryMode === 'route' ? '#ffffff' : 'transparent',
                    color: geometryMode === 'route' ? '#0284c7' : '#64748b',
                    boxShadow: geometryMode === 'route' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <Route size={14} />
                  <span>Garis Rute / Jalur (Polyline)</span>
                </button>
              </div>

              {/* Interactive Instructions / Status */}
              {geometryMode === 'point' ? (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Crosshair size={14} />
                  <span>
                    Tip: Klik pada peta atau seret marker pin merah untuk memperbarui titik koordinat secara langsung.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Navigation size={14} />
                      <span>{routeWaypoints.length} Titik Lintasan Belokan</span>
                    </div>
                    {routeWaypoints.length > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        Panjang: {calculateTotalDistance(routeWaypoints).km} km ({calculateTotalDistance(routeWaypoints).nm} NM)
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
                    Klik berulang kali pada peta untuk menambah titik belokan jalur. Seret nomor titik di peta untuk membelokkan jalur rute secara presisi.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <button
                      type="button"
                      onClick={handleUndoLastWaypoint}
                      disabled={routeWaypoints.length === 0}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: routeWaypoints.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: routeWaypoints.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <Undo size={12} />
                      <span>Hapus Titik Terakhir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearRoute}
                      disabled={routeWaypoints.length === 0}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#dc2626',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: routeWaypoints.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: routeWaypoints.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Bersihkan Seluruh Jalur</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Grid 1: Basic Identifiers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Nama Titik / Objek <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama objek wisata / fasilitas..."
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Layer Spasial <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formLayer}
                    onChange={(e) => {
                      const lyr = e.target.value
                      setFormLayer(lyr)
                      if (['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(lyr)) {
                        setFormCategory('resiliensi')
                      } else {
                        setFormCategory('publik')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="LAYER_TOURISM_4A">4A Wisata &amp; Bahari (Attraction, Access, Amenities, Ancillary)</option>
                    <option value="LAYER_HERITAGE">Situs Sejarah &amp; Cagar Budaya</option>
                    <option value="LAYER_ACCOMMODATION">Akomodasi &amp; Penginapan</option>
                    <option value="LAYER_KOPERASI_UMKM">Koperasi &amp; Sentra UMKM Rempah</option>
                    <option value="LAYER_PUBLIC_SAFETY">Fasilitas Umum &amp; Transportasi (Dermaga, Pelabuhan, Kantor)</option>
                    <option value="LAYER_WATER_INFRA">Infrastruktur Air RO &amp; Sensor IoT</option>
                    <option value="LAYER_ENERGY_WASTE">Energi Surya &amp; Pengelolaan Sampah</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Pulau <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formIsland}
                    onChange={(e) => setFormIsland(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="Banda Neira">Banda Neira</option>
                    <option value="Banda Besar">Banda Besar (Lonthoir)</option>
                    <option value="Banda Api">Banda Api (Gunung Api)</option>
                    <option value="Pulau Ay">Pulau Ay</option>
                    <option value="Pulau Hatta">Pulau Hatta (Rozengain)</option>
                    <option value="Pulau Rhun">Pulau Rhun (PRun)</option>
                    <option value="Pulau Pisang">Pulau Pisang (Syahrir)</option>
                    <option value="Karang Hatta">Karang Hatta (Atol Selat)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Kategori Sistem
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as 'publik' | 'resiliensi')}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="publik">Publik / Pariwisata</option>
                    <option value="resiliensi">Resiliensi &amp; Infrastruktur</option>
                  </select>
                </div>
              </div>

              {/* Coordinates or Route Specific Attributes */}
              {geometryMode === 'point' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Latitude (Lintang) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLat}
                      onChange={(e) => {
                        const latVal = parseFloat(e.target.value) || 0
                        setFormLat(latVal)
                        updateDraftMarker(latVal, formLng)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Longitude (Bujur) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLng}
                      onChange={(e) => {
                        const lngVal = parseFloat(e.target.value) || 0
                        setFormLng(lngVal)
                        updateDraftMarker(formLat, lngVal)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Navigation size={14} />
                    <span>Parameter Jalur &amp; Navigasi Maritim / Trekking</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Jenis Koridor / Rute
                      </label>
                      <select
                        value={routeType}
                        onChange={(e) => setRouteType(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      >
                        <option value="maritime">Jalur Pelayaran Laut (Maritime Route)</option>
                        <option value="heritage">Jalur Napak Tilas Sejarah &amp; Rempah</option>
                        <option value="trekking">Jalur Trekking &amp; Pendakian Gunung</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Moda Transportasi Utama
                      </label>
                      <input
                        type="text"
                        value={routeTransport}
                        onChange={(e) => setRouteTransport(e.target.value)}
                        placeholder="Contoh: Speedboat 2 Mesin, Perahu Motor Ketinting, Jalan Kaki"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Titik Awal (Origin)
                      </label>
                      <input
                        type="text"
                        value={routeStartName}
                        onChange={(e) => setRouteStartName(e.target.value)}
                        placeholder="Contoh: Dermaga Banda Neira"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Titik Tujuan (Destination)
                      </label>
                      <input
                        type="text"
                        value={routeEndName}
                        onChange={(e) => setRouteEndName(e.target.value)}
                        placeholder="Contoh: Terminal Dermaga Pulau Ay"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Estimasi Waktu Tempuh
                      </label>
                      <input
                        type="text"
                        value={routeTravelTime}
                        onChange={(e) => setRouteTravelTime(e.target.value)}
                        placeholder="Contoh: 30 - 45 Menit"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Deskripsi / Narasi Objek
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Informasi sejarah, keunikan, daya tarik, atau catatan operasional..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* 4A Tourism Dimension Specific Fields */}
              {(formLayer === 'LAYER_TOURISM_4A' || formLayer === 'LAYER_HERITAGE' || formLayer === 'LAYER_ACCOMMODATION') && (
                <div
                  style={{
                    padding: '0.85rem',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                    <Sparkles size={14} color="#059669" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2c59' }}>
                      Metadata Dimensi 4A Kepariwisataan (Attraction, Accessibility, Amenities, Ancillary)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {/* Sub-type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Sub-Tipe 4A (Attraction)
                      </label>
                      <input
                        type="text"
                        value={form4aSubType}
                        onChange={(e) => setForm4aSubType(e.target.value)}
                        placeholder="Contoh: Spot Diving, Cagar Budaya, Pantai Pasir Putih"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Highlights */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Daya Tarik Utama (Attraction Highlights)
                      </label>
                      <input
                        type="text"
                        value={form4aHighlights}
                        onChange={(e) => setForm4aHighlights(e.target.value)}
                        placeholder="Contoh: Terumbu karang meja raksasa, wall diving"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Boat Access */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Aksesibilitas (Boat Access)
                      </label>
                      <input
                        type="text"
                        value={form4aBoatAccess}
                        onChange={(e) => setForm4aBoatAccess(e.target.value)}
                        placeholder="Contoh: Speedboat dari Pelabuhan Neira"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Travel Time */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Estimasi Waktu Tempuh
                      </label>
                      <input
                        type="text"
                        value={form4aTravelTime}
                        onChange={(e) => setForm4aTravelTime(e.target.value)}
                        placeholder="Contoh: 25 menit"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Entry Fee */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Tarif / Tiket Masuk (Rp)
                      </label>
                      <input
                        type="number"
                        value={form4aEntryFee}
                        onChange={(e) => setForm4aEntryFee(e.target.value)}
                        placeholder="Contoh: 20000"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Best Time */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Waktu Kunjungan Terbaik
                      </label>
                      <input
                        type="text"
                        value={form4aBestTime}
                        onChange={(e) => setForm4aBestTime(e.target.value)}
                        placeholder="Contoh: 08:00 - 16:00 WIT, Oktober-April"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Facilities */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Fasilitas (Amenities)
                      </label>
                      <input
                        type="text"
                        value={form4aFacilities}
                        onChange={(e) => setForm4aFacilities(e.target.value)}
                        placeholder="Contoh: Toilet, Gazebo, Penyewaan Alat Snorkel"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* WhatsApp Contact */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        WhatsApp Pemandu / Pengelola (Ancillary)
                      </label>
                      <input
                        type="text"
                        value={form4aContactWhatsapp}
                        onChange={(e) => setForm4aContactWhatsapp(e.target.value)}
                        placeholder="6281234567890"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      id="guideCheckbox"
                      checked={form4aGuideAvailable}
                      onChange={(e) => setForm4aGuideAvailable(e.target.checked)}
                      style={{ accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <label htmlFor="guideCheckbox" style={{ fontSize: '0.75rem', color: '#334155', cursor: 'pointer' }}>
                      Tersedia Pemandu Lokal Resmi (Kelompok Sadar Wisata Pokdarwis Banda)
                    </label>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseAdminStudio}
                  disabled={isSavingFeature}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingFeature}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 1.25rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <Save size={13} className={isSavingFeature ? 'animate-spin' : ''} />
                  {isSavingFeature
                    ? 'Menyimpan ke PostGIS...'
                    : editingFeatureId
                    ? geometryMode === 'route'
                      ? 'Perbarui Jalur Rute'
                      : 'Perbarui Titik'
                    : geometryMode === 'route'
                    ? 'Simpan Jalur Rute ke PostGIS'
                    : 'Simpan Titik ke PostGIS'}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Interactive Village Polygon Boundary Editor */}
          {adminTab === 'polygon' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Top Controls: Village Selector & New Village Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  background: '#f8fafc',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f2c59', whiteSpace: 'nowrap' }}>
                    Pilih Desa / Wilayah yang Diedit:
                  </label>
                  <select
                    value={editingVillageName}
                    onChange={(e) => handleStartEditVillagePolygon(e.target.value)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      border: '1.5px solid #0f766e',
                      borderRadius: '8px',
                      color: '#0f2c59',
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: '200px',
                    }}
                  >
                    {villageGeoJSON.features.map((feat: any) => (
                      <option key={feat.properties.name} value={feat.properties.name}>
                        {feat.properties.name} ({feat.properties.island})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleAddNewVillagePolygon}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Edit3 size={12} />
                    + Tambah Wilayah Desa
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncVillagesToServer}
                    disabled={isSyncingVillages}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#1d4ed8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isSyncingVillages ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 1px 3px rgba(29, 78, 216, 0.25)',
                    }}
                    title="Simpan zona wilayah desa hasil kalibrasi ke seeder server dan PostGIS untuk seluruh tim"
                  >
                    <Save size={12} />
                    {isSyncingVillages ? 'Menyimpan...' : 'Simpan ke Server & Seeder Tim'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadVillageGeoJSON}
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    title="Unduh data batas desa yang sudah disesuaikan"
                  >
                    <Download size={12} />
                    Unduh Data Peta
                  </button>
                  <button
                    type="button"
                    onClick={handleResetVillagePolygons}
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#dc2626',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    title="Kembalikan semua batas desa ke bentuk awal"
                  >
                    <RefreshCw size={12} />
                    Kembalikan Awal
                  </button>
                </div>
              </div>

              {/* Controls: Mode Interaksi di Peta & Manajemen Bagian Wilayah Terpisah */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {/* 1. Mode Kerja di Peta */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f2c59', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Crosshair size={14} />
                      Mode Kerja di Peta:
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Total titik tersimpan: {polygonParts.reduce((acc, p) => acc + p.length, 0)} titik di {polygonParts.length} bagian wilayah
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setPolygonEditMode('move')}
                      style={{
                        flex: '1 1 200px',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        border: polygonEditMode === 'move' ? '2px solid #0f766e' : '1px solid #cbd5e1',
                        background: polygonEditMode === 'move' ? '#f0fdf4' : '#ffffff',
                        color: polygonEditMode === 'move' ? '#166534' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        boxShadow: polygonEditMode === 'move' ? '0 1px 3px rgba(15, 118, 110, 0.15)' : 'none',
                      }}
                    >
                      <Navigation size={13} />
                      <span>Hanya Geser Titik Batas</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>(Aman saat geser peta)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPolygonEditMode('add')}
                      style={{
                        flex: '1 1 200px',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        border: polygonEditMode === 'add' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: polygonEditMode === 'add' ? '#eff6ff' : '#ffffff',
                        color: polygonEditMode === 'add' ? '#1d4ed8' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        boxShadow: polygonEditMode === 'add' ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none',
                      }}
                    >
                      <Crosshair size={13} />
                      <span>+ Tambah Titik Baru</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>(Klik di peta untuk menambah)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Pemisahan Bagian Daratan Wilayah (Solusi Nusantara, Merdeka, & Wilayah Terpisah) */}
                <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f2c59' }}>
                        Bagian Wilayah Daratan:
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Gunakan bagian terpisah jika desa memiliki daratan di pulau berbeda atau dusun seberang agar garis batas tidak melintasi laut.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewVillagePart}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title="Tambah bagian daratan terpisah baru untuk desa ini"
                    >
                      + Tambah Bagian Wilayah Terpisah
                    </button>
                  </div>

                  {/* Part Pills */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {polygonParts.map((part, pIdx) => {
                      const isPartActive = pIdx === activePartIndex
                      const label = pIdx === 0 ? 'Bagian Utama' : `Wilayah Terpisah ${pIdx + 1}`
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setActivePartIndex(pIdx)}
                          style={{
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: isPartActive ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
                            background: isPartActive ? '#0f766e' : '#f8fafc',
                            color: isPartActive ? '#ffffff' : '#334155',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <span>{label}</span>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              padding: '1px 5px',
                              borderRadius: '999px',
                              background: isPartActive ? '#115e59' : '#e2e8f0',
                              color: isPartActive ? '#ccfbf1' : '#475569',
                            }}
                          >
                            {part.length} titik
                          </span>
                        </button>
                      )
                    })}

                    {polygonParts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteActiveVillagePart(activePartIndex)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          color: '#dc2626',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginLeft: 'auto',
                        }}
                        title="Hapus bagian daratan yang sedang aktif ini"
                      >
                        <Trash2 size={11} />
                        Hapus Bagian Ini
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Pengendali Titik untuk Bagian Aktif */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} />
                    <span>
                      Bagian Aktif: {activePartIndex === 0 ? 'Bagian Utama' : `Wilayah Terpisah ${activePartIndex + 1}`} ({(polygonParts[activePartIndex] || []).length} titik batas)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPolygonParts((prev) => {
                          const updated = prev.map((part) => [...part])
                          if (updated[activePartIndex] && updated[activePartIndex].length > 0) {
                            updated[activePartIndex].pop()
                          }
                          return updated
                        })
                      }}
                      disabled={!polygonParts[activePartIndex] || polygonParts[activePartIndex].length === 0}
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: !polygonParts[activePartIndex] || polygonParts[activePartIndex].length === 0 ? 'not-allowed' : 'pointer',
                        opacity: !polygonParts[activePartIndex] || polygonParts[activePartIndex].length === 0 ? 0.5 : 1,
                      }}
                    >
                      <Undo size={11} />
                      Hapus Titik Terakhir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPolygonParts((prev) => {
                          const updated = prev.map((part) => [...part])
                          if (updated[activePartIndex]) {
                            updated[activePartIndex] = []
                          }
                          return updated
                        })
                      }}
                      disabled={!polygonParts[activePartIndex] || polygonParts[activePartIndex].length === 0}
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#dc2626',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: !polygonParts[activePartIndex] || polygonParts[activePartIndex].length === 0 ? 'not-allowed' : 'pointer',
                        opacity: !polygonParts[activePartIndex] || polygonParts[activePartIndex].length === 0 ? 0.5 : 1,
                      }}
                    >
                      <RotateCcw size={11} />
                      Bersihkan Bagian Ini
                    </button>
                  </div>
                </div>

                {/* 4. Panduan Ringkas Bahasa Awam */}
                <div style={{ background: '#f0fdf4', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.73rem', color: '#166534', lineHeight: 1.5 }}>
                  <b>Panduan Menyesuaikan Batas Wilayah:</b>
                  <br />
                  1. <b>Geser Titik:</b> Tekan dan seret nomor titik di peta untuk menyesuaikan lekukan garis pantai.
                  <br />
                  2. <b>Tambah Titik Baru:</b> Aktifkan mode <i>Tambah Titik Baru</i>, lalu klik di peta pada posisi lekukan daratan.
                  <br />
                  3. <b>Wilayah Terpisah (Merdeka / Nusantara):</b> Jika desa memiliki wilayah di pulau atau seberang laut yang terpisah, klik <i>+ Tambah Bagian Wilayah Terpisah</i> agar garis batas tidak melintasi laut.
                  <br />
                  4. <b>Hapus Titik:</b> Klik kanan langsung pada nomor titik di peta atau gunakan tombol <i>Hapus Titik Terakhir</i>.
                </div>
              </div>

              {/* Form Input Attributes for Village */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Nama Desa / Wilayah <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVillageName}
                    onChange={(e) => setEditingVillageName(e.target.value)}
                    placeholder="Contoh: Lonthoir"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Pulau Induk <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={editingVillageIsland}
                    onChange={(e) => setEditingVillageIsland(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="Banda Besar">Banda Besar (Lonthoir)</option>
                    <option value="Pulau Neira">Pulau Neira</option>
                    <option value="Pulau Ay">Pulau Ay</option>
                    <option value="Pulau Rhun">Pulau Rhun</option>
                    <option value="Pulau Hatta">Pulau Hatta</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Warna Garis &amp; Arsiran Wilayah
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editingVillageColor}
                      onChange={(e) => setEditingVillageColor(e.target.value)}
                      style={{
                        width: '36px',
                        height: '34px',
                        padding: '1px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      type="text"
                      value={editingVillageColor}
                      onChange={(e) => setEditingVillageColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Estimasi Jumlah Penduduk
                  </label>
                  <input
                    type="text"
                    value={editingVillagePop}
                    onChange={(e) => setEditingVillagePop(e.target.value)}
                    placeholder="Contoh: 2.620 Jiwa"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Komoditas / Potensi Utama
                  </label>
                  <input
                    type="text"
                    value={editingVillageCommodity}
                    onChange={(e) => setEditingVillageCommodity(e.target.value)}
                    placeholder="Contoh: Pala Lonthoir Grade AAA & Minyak Fuli"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Luas Wilayah Resmi (km²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingVillageAreaKm2}
                    onChange={(e) => setEditingVillageAreaKm2(e.target.value)}
                    placeholder="Contoh: 13.16"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Kepadatan Penduduk (jiwa/km²)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={editingVillageDensity}
                    onChange={(e) => setEditingVillageDensity(e.target.value)}
                    placeholder="Contoh: 122"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Deskripsi &amp; Narasi Wilayah
                </label>
                <textarea
                  rows={2}
                  value={editingVillageDesc}
                  onChange={(e) => setEditingVillageDesc(e.target.value)}
                  placeholder="Informasi sejarah, batas alam, dan karakteristik desa..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Action Buttons: Save & Delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div>
                  {editingVillageId && (
                    <button
                      type="button"
                      onClick={handleDeleteVillagePolygon}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#dc2626',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Trash2 size={13} />
                      Hapus Batas Wilayah Ini
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseAdminStudio}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.45rem 1rem',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#334155',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveVillagePolygon}
                    disabled={!polygonParts.some((p) => p.length >= 3) || !editingVillageName.trim()}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.45rem 1.35rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                      background: !polygonParts.some((p) => p.length >= 3) || !editingVillageName.trim() ? '#94a3b8' : '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: !polygonParts.some((p) => p.length >= 3) || !editingVillageName.trim() ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)',
                    }}
                  >
                    <Save size={13} />
                    Simpan Batas Wilayah Desa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Map Container (Full Width with Overlay Google Maps Drawer) */}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Leaflet Map Card */}
        <div
          style={{
            padding: 0,
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(15, 44, 89, 0.06)',
            position: 'relative',
            background: '#ffffff',
          }}
        >
          {/* Subtle In-Map Fullscreen Toggle Button (Top Right) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 1000,
              width: '34px',
              height: '34px',
              background: isFullscreen ? '#0f172a' : '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              color: isFullscreen ? '#ffffff' : '#334155',
              transition: 'all 0.15s ease',
            }}
            title={isFullscreen ? 'Keluar dari Layar Penuh (Esc)' : 'Layar Penuh Peta (Fullscreen)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Subtle In-Map Re-Center Compass Button (Top Right under Fullscreen) */}
          <button
            type="button"
            onClick={handleResetMapView}
            style={{
              position: 'absolute',
              top: '56px',
              right: '16px',
              zIndex: 1000,
              width: '34px',
              height: '34px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              color: '#334155',
              transition: 'all 0.15s ease',
            }}
            title="Pusatkan kembali ke Kepulauan Banda"
          >
            <Compass size={16} />
          </button>

          {/* Leaflet Map Div */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: isFullscreen
                ? (adminStudioOpen ? 'calc(100vh - 380px)' : 'calc(100vh - 145px)')
                : '640px',
              minHeight: isFullscreen ? '480px' : '640px',
              background: '#e0f2fe',
              transition: 'height 0.2s ease',
            }}
          />

          {/* Selected Village Detail Inspection Card (Matching User Mockup) */}
          {selectedVillage && (
            <div
              className="animate-fade-in"
              data-lenis-prevent
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.15rem 1.25rem',
                maxWidth: '310px',
                width: 'calc(100% - 24px)',
                boxShadow: '0 10px 30px rgba(15, 44, 89, 0.14)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f766e', letterSpacing: '-0.02em' }}>
                    {selectedVillage.name}
                  </h3>
                  <div style={{ width: '40px', height: '3.5px', background: '#f97316', borderRadius: '2px', marginTop: '4px' }} />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVillage(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#64748b',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Tutup Profil Desa"
                >
                  <X size={13} />
                </button>
              </div>

              <p style={{ margin: '0.65rem 0 0.85rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                {selectedVillage.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', fontSize: '0.73rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Pulau:</span>
                  <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedVillage.island}</span>
                </div>
                {selectedVillage.population && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Populasi:</span>
                    <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedVillage.population}</span>
                  </div>
                )}
                {selectedVillage.area_km2 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Luas Wilayah:</span>
                    <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedVillage.area_km2} km²</span>
                  </div>
                )}
                {selectedVillage.density && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Kepadatan Penduduk:</span>
                    <span style={{ fontWeight: 700, color: '#0f766e' }}>{selectedVillage.density} jiwa/km²</span>
                  </div>
                )}
                {selectedVillage.main_commodity && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Komoditas / Potensi:</span>
                    <span style={{ fontWeight: 600, color: '#059669', textAlign: 'right', maxWidth: '170px' }}>{selectedVillage.main_commodity}</span>
                  </div>
                )}
                {selectedVillage.highlights && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '0.3rem' }}>
                    <span style={{ color: '#64748b' }}>Daya Tarik:</span>
                    <span style={{ fontWeight: 600, color: '#0284c7', textAlign: 'right', maxWidth: '170px' }}>{selectedVillage.highlights}</span>
                  </div>
                )}
                {selectedVillage.demographics && (
                  <div
                    style={{
                      marginTop: '0.45rem',
                      padding: '0.55rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#0f766e',
                        marginBottom: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Statistik Resmi Desa (2026)</span>
                      <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>Tercatat</span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.3rem',
                        textAlign: 'center',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <div style={{ background: '#ffffff', padding: '0.3rem 0.2rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Laki-laki</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2c59' }}>{selectedVillage.demographics.male}</div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '0.3rem 0.2rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Perempuan</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2c59' }}>{selectedVillage.demographics.female}</div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '0.3rem 0.2rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Keluarga</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2c59' }}>{selectedVillage.demographics.households} KK</div>
                      </div>
                    </div>

                    {selectedVillage.demographics.top_occupations && (
                      <div style={{ fontSize: '0.66rem', color: '#475569', lineHeight: 1.4, borderTop: '1px dashed #cbd5e1', paddingTop: '0.3rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f2c59' }}>Profesi Utama: </span>
                        {selectedVillage.demographics.top_occupations}
                      </div>
                    )}
                    {selectedVillage.demographics.umkm_count && (
                      <div style={{ fontSize: '0.66rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.25rem' }}>
                        Terdata {selectedVillage.demographics.umkm_count} Unit UMKM Binaan Aktif
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleFocusVillage(selectedVillage.name)}
                  style={{
                    flex: 1,
                    padding: '0.38rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    background: '#081d35',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Compass size={12} />
                  Fokuskan
                </button>
                {isOfficerOrAdmin && (
                  <button
                    type="button"
                    onClick={() => handleStartEditVillagePolygon(selectedVillage.name)}
                    style={{
                      padding: '0.38rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      background: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    title="Edit dan sesuaikan titik sudut poligon desa ini di peta"
                  >
                    <Edit3 size={11} />
                    Edit Poligon
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedVillage(null)}
                  style={{
                    padding: '0.38rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Population Density Heatmap Legend (Active when Heatmap Layer is Toggled) */}
          {showDensityHeatmap && showVillageBoundaries && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '92px',
                zIndex: 1010,
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '0.55rem 0.75rem',
                boxShadow: '0 4px 18px rgba(15, 44, 89, 0.12)',
                maxWidth: '280px',
                fontSize: '0.72rem',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: '#0f2c59', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Kepadatan Penduduk (jiwa/km²)
                </span>
                <button
                  type="button"
                  onClick={() => setShowDensityHeatmap(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Tutup layer heatmap"
                  aria-label="Close heatmap"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Sequential Color Ramp Bar */}
              <div
                style={{
                  height: '5px',
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, #10b981 0%, #0d9488 33%, #f59e0b 66%, #e11d48 100%)',
                  marginBottom: '6px',
                }}
              />

              {/* 4 Tiers Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
                <div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981', margin: '0 auto 2px' }} />
                  <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                    &lt; 100
                  </span>
                  <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Renggang</span>
                </div>
                <div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0d9488', margin: '0 auto 2px' }} />
                  <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                    100-199
                  </span>
                  <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Sedang</span>
                </div>
                <div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b', margin: '0 auto 2px' }} />
                  <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                    200-299
                  </span>
                  <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Padat</span>
                </div>
                <div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#e11d48', margin: '0 auto 2px' }} />
                  <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                    ≥ 300
                  </span>
                  <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Tinggi</span>
                </div>
              </div>
            </div>
          )}

          {/* Google Maps Style "Layers" Floating Control Button & Panel */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: !isMobile && selectedFeature && !isDrawerCollapsed ? '424px' : '16px',
              zIndex: 1010,
              transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* The Floating Square Trigger Button (Clean Stacking Icon & Label) */}
            <button
              type="button"
              onClick={() => setIsLayerMenuOpen((prev) => !prev)}
              style={{
                width: '66px',
                height: '66px',
                borderRadius: '12px',
                border: isLayerMenuOpen ? '2.5px solid #0284c7' : '2px solid #ffffff',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
                background: BASEMAP_CONFIGS[activeBasemap]?.previewBg || 'linear-gradient(135deg, #0284c7, #0f172a)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                padding: '6px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isLayerMenuOpen ? 'scale(1.04)' : 'scale(1)',
              }}
              title="Pilih gaya peta dan lapisan"
            >
              {/* Dark subtle overlay for contrast */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(1px)',
                }}
              />

              {/* Centered Stacking Layers Icon */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={25} color="#ffffff" strokeWidth={2.2} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} />
              </div>

              {/* Text Label "Layers" */}
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  marginTop: '4px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                }}
              >
                Layers
              </span>
            </button>

            {/* Google Maps Style Expanded Popup Panel */}
            {isLayerMenuOpen && (
              <div
                className="animate-fade-in"
                data-lenis-prevent
                style={{
                  position: 'absolute',
                  bottom: '78px',
                  left: '0',
                  zIndex: 1020,
                  width: '300px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  boxShadow: '0 12px 36px rgba(15, 23, 42, 0.22)',
                  padding: '14px',
                }}
              >
                {/* Popup Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={15} color="#0284c7" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f2c59' }}>
                      Gaya Peta
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLayerMenuOpen(false)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                    title="Tutup menu"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Section 1: Peta Dasar (Basemap Options) */}
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#64748b',
                      marginBottom: '8px',
                    }}
                  >
                    Peta Dasar
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                    }}
                  >
                    {(Object.keys(BASEMAP_CONFIGS) as BasemapId[]).map((bId) => {
                      const cfg = BASEMAP_CONFIGS[bId]
                      const isSelected = activeBasemap === bId
                      return (
                        <div
                          key={bId}
                          onClick={() => handleSelectBasemap(bId)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '52px',
                              borderRadius: '10px',
                              background: cfg.previewBg,
                              border: isSelected ? '2.5px solid #0284c7' : '1.5px solid #cbd5e1',
                              boxShadow: isSelected
                                ? '0 0 0 2px rgba(2, 132, 199, 0.25), 0 3px 8px rgba(0,0,0,0.1)'
                                : '0 2px 5px rgba(0,0,0,0.06)',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              transition: 'all 0.15s ease',
                              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            }}
                          >
                            {isSelected && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#0284c7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }}
                              >
                                <Check size={10} color="#ffffff" strokeWidth={3} />
                              </div>
                            )}

                            {bId === 'satellite' ? (
                              <Globe size={18} color="#ffffff" />
                            ) : bId === 'terrain' ? (
                              <Mountain size={18} color="#78350f" />
                            ) : (
                              <MapIcon size={18} color="#0f766e" />
                            )}
                          </div>
                          <span
                            style={{
                              marginTop: '4px',
                              fontSize: '0.72rem',
                              fontWeight: isSelected ? 800 : 600,
                              color: isSelected ? '#0284c7' : '#334155',
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Sub-toggle: Satellite Labels */}
                {activeBasemap === 'satellite' && (
                  <div
                    onClick={handleToggleSatelliteLabels}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={13} color="#15803d" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#166534' }}>
                        Nama Tempat &amp; Jalan
                      </span>
                    </div>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: showLabelsOnSatellite ? '#16a34a' : '#e2e8f0',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {showLabelsOnSatellite && <Check size={11} color="#ffffff" strokeWidth={3} />}
                    </div>
                  </div>
                )}

                {/* Section 2: Spatial Data Overlays */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#64748b',
                      marginBottom: '8px',
                    }}
                  >
                    Informasi Peta
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Toggle Village Boundaries */}
                    <div
                      onClick={() => setShowVillageBoundaries((prev) => !prev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: showVillageBoundaries ? '#ecfdf5' : '#f8fafc',
                        border: '1px solid',
                        borderColor: showVillageBoundaries ? '#a7f3d0' : '#e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '10px',
                            background: 'rgba(52, 211, 153, 0.4)',
                            border: '1.5px solid #059669',
                            borderRadius: '2px',
                          }}
                        />
                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#0f2c59' }}>
                          Wilayah Desa
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: showVillageBoundaries ? '#059669' : '#94a3b8',
                        }}
                      >
                        17 Desa
                      </span>
                    </div>

                    {/* Toggle Population Density Heatmap */}
                    <div
                      onClick={() => {
                        setShowDensityHeatmap((prev) => {
                          const next = !prev
                          if (next && !showVillageBoundaries) {
                            setShowVillageBoundaries(true)
                          }
                          return next
                        })
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: showDensityHeatmap ? '#fff1f2' : '#f8fafc',
                        border: '1px solid',
                        borderColor: showDensityHeatmap ? '#fecdd3' : '#e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '10px',
                            background: 'linear-gradient(90deg, #10b981 0%, #0d9488 33%, #f59e0b 66%, #e11d48 100%)',
                            borderRadius: '2px',
                          }}
                        />
                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#0f2c59' }}>
                          Heatmap Kepadatan
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: showDensityHeatmap ? '#e11d48' : '#94a3b8',
                        }}
                      >
                        {showDensityHeatmap ? 'Aktif' : 'Mati'}
                      </span>
                    </div>

                    {/* Toggle Maritime Routes */}
                    <div
                      onClick={() => setShowRoutes((prev) => !prev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: showRoutes ? '#f0f9ff' : '#f8fafc',
                        border: '1px solid',
                        borderColor: showRoutes ? '#bae6fd' : '#e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '2.5px', borderTop: '2px dashed #0284c7' }} />
                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#0f2c59' }}>
                          Jalur Laut
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: showRoutes ? '#0284c7' : '#94a3b8',
                        }}
                      >
                        {filteredFeatures.filter((f) => f.geometry?.type === 'LineString').length > 0 ? 'Aktif' : 'Kosong'}
                      </span>
                    </div>

                    {/* Toggle Open Atlas Legend Shortcut */}
                    <button
                      type="button"
                      onClick={() => setAtlasLegendOpen((prev) => !prev)}
                      style={{
                        marginTop: '4px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Legenda Lokasi</span>
                      <span style={{ color: '#0284c7', fontWeight: 700 }}>
                        {atlasLegendOpen ? 'Tutup' : 'Buka'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Atlas-Style Map Legend Card (Inside Map - Atlas Cartography Layout) */}
          <div
            data-lenis-prevent
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '56px',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              boxShadow: '0 4px 18px rgba(15, 44, 89, 0.12)',
              maxWidth: '240px',
              width: 'calc(100% - 32px)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* Legend Card Header */}
            <div
              onClick={() => setAtlasLegendOpen((prev) => !prev)}
              style={{
                padding: '0.55rem 0.75rem',
                borderBottom: atlasLegendOpen ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              title="Klik untuk menyembunyikan / menampilkan legenda"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Layers size={13} color="#0f2c59" />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#0f2c59',
                  }}
                >
                  Legenda Peta
                </span>
              </div>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {atlasLegendOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>

            {/* Legend Content */}
            {atlasLegendOpen && (
              <div
                style={{
                  padding: '0.55rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  maxHeight: '280px',
                  overflowY: 'auto',
                }}
              >
                {/* Select All / Clear shortcuts inside Legend */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.25rem', marginBottom: '0.2rem', borderBottom: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={selectAllLayers}
                    style={{ background: 'none', border: 'none', color: '#0369a1', fontSize: '0.675rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={clearAllLayers}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.675rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Kosongkan
                  </button>
                </div>
                {Object.entries(LAYER_COLORS).map(([lyr, col]) => {
                  const isActive = selectedLayers.has(lyr)
                  const label = LAYER_LABELS[lyr] || lyr
                  const count = filteredFeatures.filter((f) => f.properties.layer_type === lyr).length
                  return (
                    <div
                      key={lyr}
                      onClick={() => toggleLayer(lyr)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.45rem',
                        cursor: 'pointer',
                        opacity: isActive ? 1 : 0.4,
                        transition: 'opacity 0.15s ease',
                        padding: '0.15rem 0',
                      }}
                      title={isActive ? `Klik untuk menyembunyikan ${label}` : `Klik untuk menampilkan ${label}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {/* Miniature Location Pin Matching the Map Pin */}
                        <svg width="13" height="17" viewBox="0 0 28 36" fill="none" style={{ flexShrink: 0 }}>
                          <path
                            d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
                            fill={col}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <circle cx="14" cy="13.5" r="5" fill="#ffffff" />
                          <circle cx="14" cy="13.5" r="2.8" fill={col} />
                        </svg>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#0f2c59' : '#94a3b8',
                            lineHeight: 1.2,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: isActive ? col : '#94a3b8',
                          background: `${col}15`,
                          padding: '0.05rem 0.35rem',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  )
                })}

                {/* Routes & Connectivity Toggle */}
                <div
                  onClick={() => setShowRoutes((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    opacity: showRoutes ? 1 : 0.4,
                    transition: 'opacity 0.15s ease',
                    padding: '0.25rem 0',
                    borderTop: '1px dashed #e2e8f0',
                    marginTop: '0.2rem',
                    paddingTop: '0.35rem',
                  }}
                  title={showRoutes ? 'Sembunyikan seluruh garis rute' : 'Tampilkan seluruh garis rute'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '13px', height: '3px', borderTop: '2.5px dashed #0284c7' }} />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: showRoutes ? 700 : 500,
                        color: showRoutes ? '#0369a1' : '#94a3b8',
                        lineHeight: 1.2,
                      }}
                    >
                      Jalur Laut
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: showRoutes ? '#0284c7' : '#94a3b8',
                      background: '#0284c718',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {filteredFeatures.filter((f) => f.geometry?.type === 'LineString').length}
                  </span>
                </div>

                {/* Village Territories (Polygons) Toggle */}
                <div
                  onClick={() => setShowVillageBoundaries((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    opacity: showVillageBoundaries ? 1 : 0.4,
                    transition: 'opacity 0.15s ease',
                    padding: '0.25rem 0',
                    borderTop: '1px dashed #e2e8f0',
                    marginTop: '0.2rem',
                    paddingTop: '0.35rem',
                  }}
                  title={showVillageBoundaries ? 'Sembunyikan wilayah desa' : 'Tampilkan wilayah desa'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '13px', height: '11px', background: 'rgba(52, 211, 153, 0.4)', border: '1.5px solid #059669', borderRadius: '3px' }} />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: showVillageBoundaries ? 700 : 500,
                        color: showVillageBoundaries ? '#0f766e' : '#94a3b8',
                        lineHeight: 1.2,
                      }}
                    >
                      Wilayah Desa
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: showVillageBoundaries ? '#059669' : '#94a3b8',
                      background: '#05966918',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    17
                  </span>
                </div>

                {/* Sub-list of Villages matching user's exact mockup list */}
                {showVillageBoundaries && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.25rem 0.4rem',
                      padding: '0.35rem 0.3rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      marginTop: '0.15rem',
                      maxHeight: '130px',
                      overflowY: 'auto',
                    }}
                  >
                    {Object.values(villageDetailsMap).map((v) => {
                      const isVSelected = selectedVillage?.name === v.name
                      return (
                        <div
                          key={v.name}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFocusVillage(v.name)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            padding: '0.15rem 0.3rem',
                            borderRadius: '4px',
                            background: isVSelected ? '#e2e8f0' : 'transparent',
                            transition: 'all 0.15s ease',
                          }}
                          title={`Klik untuk fokus ke wilayah ${v.name} (${v.island})`}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: v.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: isVSelected ? 800 : 500,
                              color: isVSelected ? '#0f172a' : '#334155',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {v.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    marginTop: '0.3rem',
                    paddingTop: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.625rem',
                    color: '#94a3b8',
                  }}
                >
                  <span>Proyeksi Spasial</span>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>WGS 84 · RFC 7946</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected Feature Detail Inspection Drawer (Google Maps Desktop Layout) */}
          {selectedFeature && (() => {
            const mediaInfo = getFeatureMedia(selectedFeature)
            const coords = selectedFeature.geometry?.coordinates
            const isLineString = selectedFeature.geometry?.type === 'LineString'
            const featureLat = Array.isArray(coords) && typeof coords[1] === 'number'
              ? coords[1]
              : Number(selectedFeature.properties.latitude || -4.5261)
            const featureLng = Array.isArray(coords) && typeof coords[0] === 'number'
              ? coords[0]
              : Number(selectedFeature.properties.longitude || 129.8989)

            return (
              <>
                {/* Floating Tab When Drawer is Collapsed */}
                {isDrawerCollapsed && (
                  <button
                    type="button"
                    onClick={() => setIsDrawerCollapsed(false)}
                    className="animate-fade-in"
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      zIndex: 1005,
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '24px',
                      padding: '0.45rem 0.85rem',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.18)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#0f2c59',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      transition: 'all 0.15s ease',
                    }}
                    title="Buka panel rincian"
                  >
                    <ChevronRight size={15} color="#0284c7" />
                    <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedFeature.properties.name}
                    </span>
                  </button>
                )}

                {/* Left-Docked Google Maps Inspection Drawer */}
                <div
                  className="animate-fade-in"
                  data-lenis-prevent
                  style={{
                    position: 'absolute',
                    top: isMobile ? 'auto' : '12px',
                    left: '12px',
                    bottom: '12px',
                    right: isMobile ? '12px' : 'auto',
                    width: isMobile ? 'auto' : '390px',
                    maxHeight: isMobile ? '70vh' : 'calc(100% - 24px)',
                    zIndex: 1005,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transform: isDrawerCollapsed
                      ? (isMobile ? 'translateY(calc(100% + 24px))' : 'translateX(calc(-100% - 24px))')
                      : 'translate(0, 0)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: isDrawerCollapsed ? 'none' : 'auto',
                  }}
                >
                  {/* Drawer Collapse Button on Right Edge (Desktop Only) */}
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={() => setIsDrawerCollapsed(true)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '-13px',
                        transform: 'translateY(-50%)',
                        width: '26px',
                        height: '48px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderLeft: 'none',
                        borderRadius: '0 8px 8px 0',
                        boxShadow: '3px 0 8px rgba(0, 0, 0, 0.08)',
                        cursor: 'pointer',
                        zIndex: 1010,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        transition: 'all 0.15s ease',
                      }}
                      title="Sembunyikan panel rincian"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}

                  {/* 1. Hero Cover Image */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '190px',
                      background: '#0f172a',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={mediaInfo.imageUrl}
                      alt={selectedFeature.properties.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/landmarks/belgica.jpg'
                      }}
                    />

                    {/* Gradient Overlay for text contrast */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.15) 45%, rgba(15, 23, 42, 0.5) 100%)',
                      }}
                    />

                    {/* Top Row: Category Pill & Close Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '12px',
                        right: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#ffffff',
                          background: 'rgba(15, 23, 42, 0.7)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.22rem 0.55rem',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {LAYER_ICONS[selectedFeature.properties.layer_type]}
                        {LAYER_LABELS[selectedFeature.properties.layer_type] || selectedFeature.properties.layer_type}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedFeature(null)}
                        style={{
                          background: 'rgba(15, 23, 42, 0.7)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.15s ease',
                        }}
                        title="Tutup rincian"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Bottom Floating 360 Panorama Button Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '12px',
                        zIndex: 2,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setIs360ModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff',
                          border: '1.5px solid rgba(56, 189, 248, 0.65)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                          transition: 'all 0.15s ease',
                        }}
                        title="Buka tampilan panorama 360 derajat interaktif"
                      >
                        <Eye size={13} color="#38bdf8" />
                        <span>Lihat Panorama 360°</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Scrollable Body Content */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '1.1rem 1.25rem 0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                    }}
                  >
                    {/* Title, Rating & Island Heading */}
                    <div>
                      <h2
                        style={{
                          margin: '0 0 0.35rem',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#0f2c59',
                          lineHeight: 1.3,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {selectedFeature.properties.name}
                      </h2>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309' }}>
                            {mediaInfo.rating.toFixed(1)}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            ({mediaInfo.reviewsCount})
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>•</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0369a1' }}>
                          {mediaInfo.tag}
                        </span>
                      </div>
                    </div>

                    {/* 3. Google Maps Style Action Pill Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        paddingBottom: '0.25rem',
                      }}
                    >
                      {/* Action 1: Fokuskan / Rute */}
                      <button
                        type="button"
                        onClick={() => handleFocusFeature(selectedFeature)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.75rem',
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <Navigation2 size={13} fill="#ffffff" />
                        <span>Fokuskan Peta</span>
                      </button>

                      {/* Action 2: 360 Viewer */}
                      <button
                        type="button"
                        onClick={() => setIs360ModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.75rem',
                          background: '#f8fafc',
                          color: '#0f2c59',
                          border: '1px solid #cbd5e1',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RotateCcw size={13} color="#0284c7" />
                        <span>Panorama 360°</span>
                      </button>

                      {/* Action 3: Salin Koordinat */}
                      <button
                        type="button"
                        onClick={handleCopyCoordinates}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.75rem',
                          background: copiedCoord ? '#ecfdf5' : '#f8fafc',
                          color: copiedCoord ? '#059669' : '#0f2c59',
                          border: `1px solid ${copiedCoord ? '#a7f3d0' : '#cbd5e1'}`,
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {copiedCoord ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedCoord ? 'Tersalin!' : 'Salin Koordinat'}</span>
                      </button>

                      {/* Action 4: WhatsApp (if available) */}
                      {selectedFeature.properties.contact_whatsapp && (
                        <a
                          href={`https://wa.me/${selectedFeature.properties.contact_whatsapp}?text=${encodeURIComponent(
                            `Halo Pengelola ${selectedFeature.properties.name}, saya menemukan tempat Anda melalui Peta Digital Banda Neira dan ingin bertanya lebih lanjut.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.75rem',
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Phone size={13} />
                          <span>Kontak WA</span>
                        </a>
                      )}

                      {/* Action 5: Audio Guide (if available) */}
                      {selectedFeature.properties.audio_url && (
                        <a
                          href={selectedFeature.properties.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.75rem',
                            background: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Volume2 size={13} />
                          <span>Audio Guide</span>
                        </a>
                      )}
                    </div>

                    {/* 4. Google Maps Style Information Rows */}
                    <div
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {/* Row: Location / Island */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ marginTop: '2px', color: '#0284c7', flexShrink: 0 }}>
                          <MapPin size={16} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#1e293b' }}>
                          <div style={{ fontWeight: 700 }}>{selectedFeature.properties.island_name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '1px' }}>
                            {mediaInfo.address}
                          </div>
                        </div>
                      </div>

                      {/* Row: Coordinates (Monospace WGS 84) */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ marginTop: '2px', color: '#64748b', flexShrink: 0 }}>
                          <Globe size={16} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#1e293b', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f2c59' }}>
                              {featureLat.toFixed(5)}, {featureLng.toFixed(5)}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                              WGS 84 · EPSG:4326
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row: Operating Hours or Era */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ marginTop: '2px', color: '#10b981', flexShrink: 0 }}>
                          <Clock size={16} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#1e293b' }}>
                          <div style={{ fontWeight: 700, color: '#047857' }}>
                            {mediaInfo.operatingHours}
                          </div>
                          {selectedFeature.properties.built_year && (
                            <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '1px' }}>
                              Didirikan: Tahun {selectedFeature.properties.built_year} (Cagar Budaya Nasional)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Specific Attributes: LineString Maritime Routes */}
                      {isLineString && (
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.65rem 0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Route size={13} />
                              Panjang Lintasan:
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>
                              {selectedFeature.properties.properties_meta?.total_distance_km || 0} km
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginLeft: '0.3rem' }}>
                                ({selectedFeature.properties.properties_meta?.total_distance_nm || 0} NM)
                              </span>
                            </span>
                          </div>
                          {selectedFeature.properties.properties_meta?.travel_time && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem' }}>
                              <span style={{ color: '#64748b' }}>Waktu Tempuh:</span>
                              <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedFeature.properties.properties_meta.travel_time}</span>
                            </div>
                          )}
                          {selectedFeature.properties.properties_meta?.transport_mode && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem' }}>
                              <span style={{ color: '#64748b' }}>Moda:</span>
                              <span style={{ fontWeight: 600, color: '#0f2c59' }}>{selectedFeature.properties.properties_meta.transport_mode}</span>
                            </div>
                          )}
                          {(selectedFeature.properties.properties_meta?.origin || selectedFeature.properties.properties_meta?.destination) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.3rem' }}>
                              <span style={{ color: '#64748b' }}>Rute:</span>
                              <span style={{ fontWeight: 600, color: '#0f2c59' }}>
                                {selectedFeature.properties.properties_meta?.origin || 'Awal'} &rarr; {selectedFeature.properties.properties_meta?.destination || 'Tujuan'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Water Infra Attributes */}
                      {selectedFeature.properties.layer_type === 'LAYER_WATER_INFRA' && (
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {selectedFeature.properties.live_tds_ppm !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Kualitas Air (TDS):</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                                {selectedFeature.properties.live_tds_ppm} ppm
                              </span>
                            </div>
                          )}
                          {selectedFeature.properties.tank_level_pct !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem' }}>
                              <span style={{ color: '#64748b' }}>Tandon Komunal:</span>
                              <span style={{ color: '#0284c7', fontWeight: 700 }}>{selectedFeature.properties.tank_level_pct}% Penuh</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Accommodation Attributes */}
                      {selectedFeature.properties.layer_type === 'LAYER_ACCOMMODATION' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {selectedFeature.properties.price_per_night_rp && (
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Tarif Menginap:</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                                Rp {selectedFeature.properties.price_per_night_rp.toLocaleString('id-ID')} / malam
                              </span>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {selectedFeature.properties.has_clean_ro_water && (
                              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Droplets size={10} /> Air Bersih RO
                              </span>
                            )}
                            {selectedFeature.properties.has_solar_backup && (
                              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#fffbeb', color: '#92400e', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Zap size={10} /> Listrik Surya
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Energy & Waste Attributes */}
                      {selectedFeature.properties.layer_type === 'LAYER_ENERGY_WASTE' && (
                        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {selectedFeature.properties.capacity_kwp && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#9f1239', fontWeight: 600 }}>Kapasitas PLTS:</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e11d48' }}>
                                {selectedFeature.properties.capacity_kwp} kWp
                              </span>
                            </div>
                          )}
                          {selectedFeature.properties.plastic_conversion_rule && (
                            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                              Program: {selectedFeature.properties.plastic_conversion_rule}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Koperasi & UMKM Attributes */}
                      {selectedFeature.properties.layer_type === 'LAYER_KOPERASI_UMKM' && (
                        <>
                          {selectedFeature.properties.commodities_accepted && (
                            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                              <span style={{ fontSize: '0.7rem', color: '#6d28d9', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                                Komoditas / Fokus Produk:
                              </span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>
                                {selectedFeature.properties.commodities_accepted}
                              </span>
                            </div>
                          )}

                          {(() => {
                            const umkmUnits =
                              selectedFeature.properties.umkm_units ||
                              selectedFeature.properties.properties_meta?.umkm_units
                            if (!Array.isArray(umkmUnits) || umkmUnits.length === 0) return null

                            return (
                              <div
                                style={{
                                  background: '#faf5ff',
                                  border: '1.5px solid #e9d5ff',
                                  borderRadius: '10px',
                                  padding: '0.65rem 0.75rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #e9d5ff',
                                    paddingBottom: '0.35rem',
                                  }}
                                >
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6b21a8' }}>
                                    Daftar Pelaku Usaha Binaan
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      background: '#8b5cf6',
                                      color: '#ffffff',
                                      padding: '0.15rem 0.4rem',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {umkmUnits.length} UMKM Terdaftar
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                                  {umkmUnits.map((u: any, idx: number) => (
                                    <div
                                      key={idx}
                                      style={{
                                        background: '#ffffff',
                                        border: '1px solid #f3e8ff',
                                        borderRadius: '6px',
                                        padding: '0.4rem 0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.15rem',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f2c59' }}>
                                          {u.business || u.name}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 600,
                                            padding: '0.1rem 0.35rem',
                                            background: '#f3e8ff',
                                            color: '#7e22ce',
                                            borderRadius: '3px',
                                          }}
                                        >
                                          {u.category}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.67rem', color: '#64748b' }}>
                                        <span>Pemilik: <strong style={{ color: '#334155' }}>{u.name}</strong></span>
                                        {u.year && <span>Berdiri {u.year} · {u.workforce || 1} Tenaga Kerja</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })()}
                        </>
                      )}
                    </div>

                    {/* 5. Description Narrative */}
                    {selectedFeature.properties.description && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                        <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', fontWeight: 800, color: '#0f2c59', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Tentang Destinasi Ini
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                          {selectedFeature.properties.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 6. Admin Management Toolbar (Docked at Bottom if Admin/Officer) */}
                  {isOfficerOrAdmin && (
                    <div
                      style={{
                        padding: '0.75rem 1.25rem',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleStartEditFeature(selectedFeature)}
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          padding: '0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          color: '#0f2c59',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Edit2 size={13} />
                        <span>{selectedFeature.geometry?.type === 'LineString' ? 'Edit Garis Rute' : 'Edit Titik Ini'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeature(selectedFeature.id, selectedFeature.properties.name)}
                        disabled={isDeletingFeature}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.15s ease',
                        }}
                        title={selectedFeature.geometry?.type === 'LineString' ? 'Hapus rute ini secara permanen dari PostGIS' : 'Hapus titik ini secara permanen dari PostGIS'}
                      >
                        <Trash2 size={13} />
                        <span>{isDeletingFeature ? 'Menghapus...' : 'Hapus'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* 360 Degree Panorama Viewer Modal */}
      <Panorama360Modal
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
        title={selectedFeature?.properties?.name || 'Panorama Banda Neira'}
        islandName={selectedFeature?.properties?.island_name}
        panoramaUrl={selectedFeature ? getFeatureMedia(selectedFeature).panoramaUrl : undefined}
      />
    </div>
  )
}
