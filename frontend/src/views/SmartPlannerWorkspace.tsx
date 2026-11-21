import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Compass,
  Home,
  MapPin,
  Sparkles,
  Send,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  BookOpen,
  Droplets,
  Zap,
  ArrowRight,
  Printer,
  Bot,
  User,
  RefreshCw,
  Phone,
  Bookmark,
  BookmarkCheck,
  Layers,
  Clock,
  Info,
} from 'lucide-react'
import { gisService, GeoJSONFeature } from '../services/gis'
import { tourismService, AccommodationItem, CommunityContentItem } from '../services/tourism'
import { getFeatureMedia } from './InteractiveMapWorkspace'
import { BandaUnifiedFooter } from '../components/common/BandaUnifiedFooter'

export interface SmartPlannerWorkspaceProps {
  onNavigate?: (tab: string, param?: string) => void
}

export interface UnifiedPlannerItem {
  id: string
  name: string
  type: 'heritage' | 'nature' | 'accommodation'
  categoryLabel: string
  island: string
  description: string
  photoUrl: string
  latitude: number
  longitude: number
  priceRp?: number
  contactWhatsapp?: string
  hasCleanRoWater?: boolean
  hasSolarBackup?: boolean
  audioUrl?: string
  relatedArticleSlug?: string
  historicalEra?: string
  builtYear?: number
  hoursOrAccess?: string
  relevanceScore?: number
}

export interface ItineraryDay {
  dayNumber: number
  title: string
  focusArea: string
  items: UnifiedPlannerItem[]
  curatorNotes: string
}

export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: string
  highlightedItems?: UnifiedPlannerItem[]
  itineraryPlan?: ItineraryDay[]
}

const QUICK_PROMPT_CHIPS = [
  'Jelajah 3 Hari Sejarah Benteng & Jejak Bung Hatta',
  'Snorkeling Karang Lava Flow & Wisata Bahari Pulau Hatta',
  'Penginapan Hemat Air Bersih RO & Listrik Surya di Neira',
  'Island Hopping Banda Besar, Perkebunan Pala & Pulau Rhun',
  'Rute 1 Hari Keliling Kota Neira Jalan Kaki',
]

export const SmartPlannerWorkspace: React.FC<SmartPlannerWorkspaceProps> = ({ onNavigate }) => {
  const [gisFeatures, setGisFeatures] = useState<GeoJSONFeature[]>([])
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [articles, setArticles] = useState<CommunityContentItem[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Current selected itinerary / recommendations
  const [activePlanDays, setActivePlanDays] = useState<ItineraryDay[]>([])
  const [activeItems, setActiveItems] = useState<UnifiedPlannerItem[]>([])
  const [planTitle, setPlanTitle] = useState('Rencana Perjalanan Rekomendasi Kurator')
  const [planSummary, setPlanSummary] = useState('Pilihan destinasi dan penginapan otentik berdasarkan kurasi data spasial Kepulauan Banda.')

  // Saved / Bookmarked items
  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('banda_saved_planner_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // View state: 'itinerary' (Day-by-Day) vs 'all' (Grid list) vs 'saved'
  const [canvasTab, setCanvasTab] = useState<'itinerary' | 'all' | 'saved'>('itinerary')
  // Mobile tab state: 'chat' vs 'canvas'
  const [mobileActiveView, setMobileActiveView] = useState<'chat' | 'canvas'>('chat')
  const [copiedPlan, setCopiedPlan] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Real Database on Mount
  useEffect(() => {
    let isMounted = true

    const loadRealData = async () => {
      setIsLoadingData(true)
      try {
        const [layersRes, accRes, artRes] = await Promise.all([
          gisService.getLayers({ layers: 'LAYER_HERITAGE,LAYER_TOURISM_4A,LAYER_ACCOMMODATION' }).catch(() => ({ type: 'FeatureCollection' as const, features: [] })),
          tourismService.listAccommodations().catch(() => []),
          tourismService.listCommunityContents({ content_type: 'ARTICLE' }).catch(() => []),
        ])

        if (isMounted) {
          setGisFeatures(layersRes.features || [])
          setAccommodations(accRes || [])
          setArticles(artRes || [])
        }
      } catch (err) {
        console.warn('Gagal memuat data basis data untuk smart planner:', err)
      } finally {
        if (isMounted) {
          setIsLoadingData(false)
        }
      }
    }

    loadRealData()
    return () => {
      isMounted = false
    }
  }, [])

  // 2. Build Unified Master Catalog from Real Database
  const masterCatalog: UnifiedPlannerItem[] = useMemo(() => {
    const items: UnifiedPlannerItem[] = []

    // Map GIS Features
    for (const feat of gisFeatures) {
      const p = feat.properties || {}
      const name = p.name || 'Destinasi Banda'
      const layerType = p.layer_type || ''
      const island = p.island_name || 'Pulau Neira'
      const coords = feat.geometry?.coordinates
      const lng = Array.isArray(coords) && typeof coords[0] === 'number' ? coords[0] : Number(p.longitude || 129.8989)
      const lat = Array.isArray(coords) && typeof coords[1] === 'number' ? coords[1] : Number(p.latitude || -4.5261)
      const media = getFeatureMedia(feat)

      let type: 'heritage' | 'nature' | 'accommodation' = 'heritage'
      let categoryLabel = 'Cagar Budaya'

      if (layerType === 'LAYER_TOURISM_4A') {
        type = 'nature'
        categoryLabel = 'Wisata Bahari & Alam'
      } else if (layerType === 'LAYER_ACCOMMODATION') {
        type = 'accommodation'
        categoryLabel = 'Penginapan'
      }

      // Check if related article exists
      const matchedArt = articles.find((a) => {
        const artTitle = (a.title || '').toLowerCase()
        const n = name.toLowerCase()
        return artTitle.includes(n) || n.includes(artTitle.slice(0, 15))
      })

      // Check if accommodation details match
      const matchedAcc = accommodations.find((acc) => {
        return acc.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(acc.name.toLowerCase())
      })

      items.push({
        id: String(feat.id || p.id || `gis-${Math.random()}`),
        name,
        type,
        categoryLabel,
        island,
        description: p.description || media.tag || 'Destinasi wisata bersejarah di Kepulauan Banda.',
        photoUrl: media.imageUrl || p.image_url || '/images/landmarks/belgica.jpg',
        latitude: lat,
        longitude: lng,
        priceRp: matchedAcc?.price_per_night_rp || p.price_per_night_rp,
        contactWhatsapp: matchedAcc?.contact_whatsapp || p.contact_whatsapp,
        hasCleanRoWater: matchedAcc?.has_clean_ro_water ?? p.has_clean_ro_water,
        hasSolarBackup: matchedAcc?.has_solar_backup ?? p.has_solar_backup,
        audioUrl: p.audio_url,
        relatedArticleSlug: matchedArt?.slug,
        historicalEra: p.era || (p.built_year ? `Tahun ${p.built_year}` : undefined),
        builtYear: p.built_year,
        hoursOrAccess: media.operatingHours || 'Akses Terbuka Setiap Hari',
      })
    }

    // Also include accommodations from accommodations table not in GIS
    for (const acc of accommodations) {
      const alreadyIn = items.some((it) => it.name.toLowerCase() === acc.name.toLowerCase())
      if (!alreadyIn) {
        items.push({
          id: `acc-${acc.id}`,
          name: acc.name,
          type: 'accommodation',
          categoryLabel: 'Penginapan Eco-Stay',
          island: acc.island_name || 'Pulau Neira',
          description: acc.description || 'Penginapan ramah lingkungan dengan fasilitas terawat.',
          photoUrl: acc.photo_url || '/images/landmarks/hotel-maulana.jpg',
          latitude: -4.524,
          longitude: 129.902,
          priceRp: acc.price_per_night_rp,
          contactWhatsapp: acc.contact_whatsapp,
          hasCleanRoWater: acc.has_clean_ro_water,
          hasSolarBackup: acc.has_solar_backup,
          hoursOrAccess: 'Check-in 14:00 · Check-out 12:00',
        })
      }
    }

    return items
  }, [gisFeatures, accommodations, articles])

  // Initialize initial welcome message and default curated plan
  useEffect(() => {
    if (masterCatalog.length === 0) return

    // Default 3-Day Heritage & Marine Itinerary
    const day1Items = masterCatalog.filter((it) =>
      /(belgica|nassau|hatta|sjahrir|istana mini)/i.test(it.name)
    ).slice(0, 3)

    const day2Items = masterCatalog.filter((it) =>
      /(lava flow|tampa nama|gunung api|selam|snorkeling|hatta)/i.test(it.name)
    ).slice(0, 3)

    const day3Items = masterCatalog.filter((it) =>
      /(kebun pala|lonthoir|hollandia|rhun|perigi rante|welvaren)/i.test(it.name)
    ).slice(0, 3)

    const defaultAccommodations = masterCatalog.filter((it) => it.type === 'accommodation').slice(0, 2)

    const initialPlan: ItineraryDay[] = [
      {
        dayNumber: 1,
        title: 'Hari 1: Pusaka Benteng & Jejak Pengasingan Tokoh Bangsa',
        focusArea: 'Pulau Neira (Kota Pusaka)',
        items: day1Items.length > 0 ? day1Items : masterCatalog.slice(0, 3),
        curatorNotes: 'Awali pagi hari menjelajahi Benteng Belgica saat fajar, dilanjutkan ke Benteng Nassau dan Kompleks Pengasingan Bung Hatta & Sutan Sjahrir yang berada dalam jarak jalan kaki.',
      },
      {
        dayNumber: 2,
        title: 'Hari 2: Eksplorasi Bawah Laut & Snorkeling Karang Lava',
        focusArea: 'Selat Neira, Gunung Api & Pulau Hatta',
        items: day2Items.length > 0 ? day2Items : masterCatalog.slice(3, 6),
        curatorNotes: 'Menyeberang perahu cepat ke Lava Flow untuk menyaksikan regenerasi terumbu karang tercepat di dunia, lalu berlayar ke Pulau Hatta untuk menikmati drop-off karang spektakuler.',
      },
      {
        dayNumber: 3,
        title: 'Hari 3: Legenda Perkebunan Pala Tua & Jejak Diplomasi Rhun',
        focusArea: 'Pulau Banda Besar & Pulau Rhun',
        items: day3Items.length > 0 ? day3Items : masterCatalog.slice(6, 9),
        curatorNotes: 'Mengunjungi pohon pala berusia ratusan tahun di Lonthoir, menaiki tangga Benteng Hollandia, dan menelusuri sejarah barter Pulau Rhun dengan Manhattan pada Traktat Breda 1667.',
      },
    ]

    setActivePlanDays(initialPlan)
    const combined = [...day1Items, ...day2Items, ...day3Items, ...defaultAccommodations]
    const uniqueCombined = Array.from(new Map(combined.map((m) => [m.id, m])).values())
    setActiveItems(uniqueCombined)

    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content:
            'Halo! Selamat datang di Asisten Perencana Perjalanan Kepulauan Banda. Saya siap membantu Anda merancang liburan terbaik di Kepulauan Banda dengan menghubungkan langsung titik-titik cagar budaya bersejarah, spot bahari, dan penginapan ramah lingkungan dari basis data spasial resmi.\n\nSilakan tanyakan apa saja, sebutkan durasi perjalanan, anggaran, pulau tujuan, atau klik salah satu pilihan cepat di bawah ini.',
          timestamp: 'Baru saja',
          highlightedItems: uniqueCombined.slice(0, 3),
          itineraryPlan: initialPlan,
        },
      ])
    }
  }, [masterCatalog])

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Save/Unsave Item Handler
  const handleToggleSaveItem = (item: UnifiedPlannerItem) => {
    setSavedItemIds((prev) => {
      const isSaved = prev.includes(item.id)
      const next = isSaved ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      try {
        localStorage.setItem('banda_saved_planner_items', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Interconnected Action: Open in GIS Map
  const handleOpenInGis = (item: UnifiedPlannerItem) => {
    if (onNavigate) {
      onNavigate('gis', `feature_id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`)
    } else {
      window.location.href = `/gis?feature_id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`
    }
  }

  // Interconnected Action: Read History Article
  const handleReadArticle = (slug?: string) => {
    if (!slug) return
    if (onNavigate) {
      onNavigate('sejarah', slug)
    } else {
      window.location.href = `/sejarah?slug=${encodeURIComponent(slug)}`
    }
  }

  // Interconnected Action: Booking / WhatsApp Direct Link
  const handleBookingWhatsapp = (item: UnifiedPlannerItem) => {
    const phone = (item.contactWhatsapp || '6281234567890').replace(/[^0-9]/g, '')
    const message = `Halo Pengelola ${item.name}, saya merancang rencana perjalanan di Portal Digital Banda Neira dan ingin menanyakan ketersediaan kamar serta fasilitas untuk liburan mendatang. Terima kasih.`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Process User Query & Generate Conversational Response with Real Data
  const handleSendPrompt = (promptText?: string) => {
    const q = (promptText || inputValue).trim()
    if (!q) return

    const userMessageId = `usr-${Date.now()}`
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: q,
      timestamp: 'Baru saja',
    }

    setMessages((prev) => [...prev, userMsg])
    if (!promptText) setInputValue('')
    setIsTyping(true)

    // Analyze intent against real database
    setTimeout(() => {
      const qLower = q.toLowerCase()

      // 1. Detect Island Filter
      let targetIsland = ''
      if (/(neira|kota)/i.test(qLower)) targetIsland = 'Pulau Neira'
      else if (/(banda besar|lonthoir|lontor)/i.test(qLower)) targetIsland = 'Pulau Banda Besar'
      else if (/(hatta|rozengain)/i.test(qLower)) targetIsland = 'Pulau Hatta'
      else if (/(rhun|run)/i.test(qLower)) targetIsland = 'Pulau Rhun'
      else if (/(\bai\b|pulau ai|pulau ay|\bay\b)/i.test(qLower)) targetIsland = 'Pulau Ay'

      // 2. Detect Focus / Theme
      const wantsAccommodation = /(hotel|homestay|penginapan|kamar|menginap|tidur|ro|air|surya|listrik|budget|murah|hemat)/i.test(qLower)
      const wantsMarine = /(snorkeling|selam|diving|karang|pantai|laut|ikan|lava flow|tampa nama)/i.test(qLower)
      const wantsHeritage = /(benteng|sejarah|hatta|sjahrir|belgica|nassau|museum|budaya|voc|kolonial|perigi|istana)/i.test(qLower)
      const wants1Day = /(1 hari|satu hari|seharian|singkat|express|jalan kaki)/i.test(qLower)
      const wantsBudget = /(hemat|murah|budget|terjangkau|ekonomis|backpacker)/i.test(qLower)

      // 3. Filter and score real items from master catalog
      const scoredItems = masterCatalog.map((item) => {
        let score = 0
        const itemText = `${item.name} ${item.description} ${item.island} ${item.categoryLabel}`.toLowerCase()

        if (targetIsland && item.island.toLowerCase().includes(targetIsland.toLowerCase())) {
          score += 40
        }

        if (wantsAccommodation && item.type === 'accommodation') {
          score += 50
          if (wantsBudget && item.priceRp && item.priceRp <= 350000) score += 30
          if (item.hasCleanRoWater) score += 20
          if (item.hasSolarBackup) score += 15
        }

        if (wantsMarine && item.type === 'nature') {
          score += 50
        }

        if (wantsHeritage && item.type === 'heritage') {
          score += 50
          if (item.relatedArticleSlug) score += 15
        }

        // Direct keyword matching
        const words = qLower.split(/\s+/).filter((w) => w.length > 3)
        for (const word of words) {
          if (itemText.includes(word)) score += 10
        }

        return { ...item, relevanceScore: score }
      })

      scoredItems.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

      const topPicks = scoredItems.filter((it) => (it.relevanceScore || 0) > 10).slice(0, 6)
      const finalPicks = topPicks.length >= 3 ? topPicks : masterCatalog.slice(0, 5)

      // 4. Construct Narrative Answer
      let botResponseText = ''
      let newItinerary: ItineraryDay[] = []

      if (wantsAccommodation) {
        botResponseText =
          `Berikut adalah kurasi penginapan riil di Kepulauan Banda yang paling sesuai dengan kebutuhan Anda. Seluruh penginapan berikut terverifikasi memiliki nomor kontak resmi pengelola, ketersediaan air bersih RO yang layak konsumsi, serta sistem kelistrikan andal.`
        setPlanTitle('Rekomendasi Penginapan & Eco-Stay Terverifikasi')
        setPlanSummary('Daftar penginapan otentik dengan tarif riil per malam, air bersih RO, dan cadangan listrik surya.')
      } else if (wants1Day) {
        botResponseText =
          `Untuk durasi 1 hari (jalan kaki di Pulau Neira), rute terbaik dirancang memusat di kawasan kota pusaka agar efisien dan tidak menguras energi.`
        newItinerary = [
          {
            dayNumber: 1,
            title: 'Eksplorasi Kota Pusaka Neira (Rute Jalan Kaki)',
            focusArea: 'Pulau Neira',
            items: finalPicks.slice(0, 4),
            curatorNotes: 'Awali pagi di Benteng Belgica (pukul 06.00 WIT), berjalan kaki ke Benteng Nassau, Istana Mini, dan Rumah Pengasingan Bung Hatta. Sore hari nikmati senja di pelabuhan.',
          },
        ]
        setPlanTitle('Rencana Perjalanan 1 Hari: Rute Warisan Pusaka Neira')
        setPlanSummary('Rute jalan kaki santai menyusuri situs bersejarah abad ke-17 di jantung Pulau Neira.')
      } else if (wantsMarine) {
        botResponseText =
          `Untuk wisata bahari dan selam, Kepulauan Banda menawarkan keanekaragaman karang kelas dunia. Kami mengombinasikan spot snorkeling dangkal di Lava Flow dengan drop-off karang dinding Pulau Hatta.`
        newItinerary = [
          {
            dayNumber: 1,
            title: 'Hari 1: Snorkeling Karang Meja Lava Flow & Kaki Gunung Api',
            focusArea: 'Selat Neira & Kaki Gunung Api Banda',
            items: finalPicks.filter((it) => it.type === 'nature' || it.name.includes('Lava')).slice(0, 3),
            curatorNotes: 'Waktu terbaik berenang adalah pukul 08.00 - 11.00 WIT saat air sangat tenang dan visibilitas mencapai 25 meter.',
          },
          {
            dayNumber: 2,
            title: 'Hari 2: Menembus Samudra Menuju Karang Pulau Hatta',
            focusArea: 'Pulau Hatta',
            items: finalPicks.filter((it) => it.island.includes('Hatta') || it.type === 'heritage').slice(0, 3),
            curatorNotes: 'Sewa perahu dari Neira memakan waktu sekitar 45 menit. Bawa perlengkapan snorkeling pribadi dan nikmati pantai pasir putih bersih.',
          },
        ]
        setPlanTitle('Rencana Wisata Bahari & Terumbu Karang Banda')
        setPlanSummary('Kurasi spot snorkeling terbaik dengan visibilitas air sejernih kristal.')
      } else {
        botResponseText =
          `Tentu, kami telah menyusun rencana perjalanan terintegrasi yang memadukan titik cagar budaya, wisata bahari, dan rekomendasi penginapan riil. Anda dapat membuka setiap titik langsung di Peta Spasial GIS, membaca kisah sejarahnya, atau memesan penginapan via WhatsApp.`
        newItinerary = [
          {
            dayNumber: 1,
            title: 'Hari 1: Jejak Sejarah Benteng & Tokoh Kemerdekaan',
            focusArea: targetIsland || 'Pulau Neira',
            items: finalPicks.slice(0, 3),
            curatorNotes: 'Menikmati panorama fajar dari puncak Benteng Belgica dan mendalami naskah pengasingan tokoh bangsa.',
          },
          {
            dayNumber: 2,
            title: 'Hari 2: Wisata Bahari & Keindahan Alam Kepulauan',
            focusArea: 'Laut Banda & Pulau Sekitar',
            items: finalPicks.slice(3, 6),
            curatorNotes: 'Snorkeling di terumbu karang alami dan menjelajahi pulau-pulau eksotis dengan perahu nelayan lokal.',
          },
        ]
        setPlanTitle('Rencana Perjalanan Eksplorasi Kepulauan Banda')
        setPlanSummary('Kombinasi situs cagar budaya, lanskap alam vulkanik, dan penginapan terakreditasi.')
      }

      setActiveItems(finalPicks)
      if (newItinerary.length > 0) {
        setActivePlanDays(newItinerary)
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botResponseText,
        timestamp: 'Baru saja',
        highlightedItems: finalPicks.slice(0, 3),
        itineraryPlan: newItinerary.length > 0 ? newItinerary : activePlanDays,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
      // Switch view on mobile to canvas to let user immediately see results
      if (window.innerWidth < 1024) {
        setMobileActiveView('canvas')
      }
    }, 400)
  }

  // Copy Itinerary Text to Clipboard
  const handleCopyItineraryText = () => {
    let text = `*${planTitle}*\n`
    text += `${planSummary}\n`
    text += `Disusun melalui Portal Digital Banda Neira (https://bandanaira.com)\n\n`

    if (activePlanDays.length > 0) {
      activePlanDays.forEach((day) => {
        text += `[${day.title}] - ${day.focusArea}\n`
        text += `Catatan Kurator: ${day.curatorNotes}\n`
        day.items.forEach((it, idx) => {
          text += `  ${idx + 1}. ${it.name} (${it.categoryLabel} - ${it.island})\n`
          if (it.priceRp) text += `     Tarif: Rp ${it.priceRp.toLocaleString('id-ID')}/malam\n`
          if (it.historicalEra) text += `     Era: ${it.historicalEra}\n`
        })
        text += `\n`
      })
    } else {
      activeItems.forEach((it, idx) => {
        text += `${idx + 1}. ${it.name} (${it.categoryLabel} - ${it.island})\n`
        if (it.priceRp) text += `   Tarif: Rp ${it.priceRp.toLocaleString('id-ID')}/malam\n`
        text += `   Deskripsi: ${it.description}\n\n`
      })
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedPlan(true)
      setTimeout(() => setCopiedPlan(false), 2500)
    })
  }

  // Saved items list
  const savedItems = useMemo(() => {
    return masterCatalog.filter((it) => savedItemIds.includes(it.id))
  }, [masterCatalog, savedItemIds])

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-700/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg text-slate-950 font-black">
              <Compass size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  Perencana Wisata Cerdas
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 size={11} /> Basis Data Spasial Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Asisten Kurator Perjalanan Berbasis Titik GIS & Penginapan Riil Kepulauan Banda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('gis')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all active:scale-[0.98]"
            >
              <Layers size={14} className="text-cyan-400" />
              <span className="hidden md:inline">Buka Peta Spasial GIS</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('landing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all active:scale-[0.98] shadow-sm font-bold"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Beranda</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MOBILE VIEW SWITCHER (< 1024px) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMobileActiveView('chat')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mobileActiveView === 'chat'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Bot size={15} /> Obrolan Asisten
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveView('canvas')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mobileActiveView === 'canvas'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Compass size={15} /> Rencana Wisata ({activeItems.length})
        </button>
      </div>

      {/* 3. MAIN WORKSPACE BODY (SPLIT-SCREEN) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN: CONVERSATIONAL CHATBOT (7 Cols on LG) ================= */}
        <section
          className={`lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[600px] lg:h-[calc(100vh-140px)] ${
            mobileActiveView === 'canvas' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Chat Header Status */}
          <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Bot size={16} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Kurator Wisata Banda</h3>
                <p className="text-[10px] text-slate-500">
                  {isLoadingData ? 'Menghubungkan basis data spasial...' : `${masterCatalog.length} titik destinasi riil siap dipetakan`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (masterCatalog.length > 0) {
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      role: 'assistant',
                      content: 'Percakapan direset. Silakan tanyakan rencana perjalanan baru atau pilih rekomendasi cepat.',
                      timestamp: 'Baru saja',
                    },
                  ])
                }
              }}
              title="Reset Percakapan"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Chat Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#0B192C] text-amber-400 flex-shrink-0 flex items-center justify-center mt-0.5 text-xs font-bold shadow-sm">
                    <Compass size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#0B192C] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* If Bot message provides quick highlight cards */}
                  {msg.highlightedItems && msg.highlightedItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500" />
                        Destinasi Terkait:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.highlightedItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img
                                src={item.photoUrl}
                                alt={item.name}
                                className="w-9 h-9 rounded object-cover flex-shrink-0"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = '/images/landmarks/belgica.jpg'
                                }}
                              />
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-[11px] text-slate-900 truncate">
                                  {item.name}
                                </h4>
                                <span className="text-[10px] text-slate-500">{item.island}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenInGis(item)}
                                className="p-1 rounded text-cyan-600 hover:bg-cyan-50 border border-cyan-200 transition-colors"
                                title="Buka di Peta GIS"
                              >
                                <MapPin size={12} />
                              </button>
                              {item.relatedArticleSlug && (
                                <button
                                  type="button"
                                  onClick={() => handleReadArticle(item.relatedArticleSlug)}
                                  className="p-1 rounded text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
                                  title="Baca Kisah Sejarah"
                                >
                                  <BookOpen size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 font-medium ${
                      msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex-shrink-0 flex items-center justify-center mt-0.5 text-xs font-bold shadow-sm">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-3 bg-white rounded-xl border border-slate-200 w-fit">
                <Sparkles size={14} className="animate-spin text-amber-500" />
                <span>Menghubungkan koordinat spasial & kurasi rencana...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" /> Ide Pertanyaan Cepat:
            </p>
            <div className="flex gap-1.5 pb-1 flex-nowrap sm:flex-wrap">
              {QUICK_PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(chip)}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 border border-slate-200/80 transition-colors whitespace-nowrap active:scale-[0.98]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendPrompt()
            }}
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik durasi liburan, anggaran, atau pulau tujuan..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <span>Kirim</span>
              <Send size={13} />
            </button>
          </form>
        </section>

        {/* ================= RIGHT COLUMN: INTERACTIVE ITINERARY & SPATIAL CANVAS (7 Cols on LG) ================= */}
        <section
          className={`lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[600px] lg:h-[calc(100vh-140px)] ${
            mobileActiveView === 'chat' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Canvas Header & Sub-Tabs */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-[#0B192C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Kurasi Terintegrasi
                </span>
                <span className="text-xs text-slate-400">
                  {activeItems.length} Destinasi & Penginapan Terpilih
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{planTitle}</h2>
              <p className="text-xs text-slate-300 max-w-xl line-clamp-1">{planSummary}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopyItineraryText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-[0.98]"
              >
                {copiedPlan ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedPlan ? 'Tersalin!' : 'Salin Rute'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-[0.98]"
                title="Cetak Rencana Perjalanan"
              >
                <Printer size={13} />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar inside Canvas */}
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCanvasTab('itinerary')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  canvasTab === 'itinerary'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar size={13} /> Rute Harian (Day-by-Day)
              </button>
              <button
                type="button"
                onClick={() => setCanvasTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  canvasTab === 'all'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={13} /> Semua Titik ({activeItems.length})
              </button>
              <button
                type="button"
                onClick={() => setCanvasTab('saved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  canvasTab === 'saved'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark size={13} /> Disimpan ({savedItems.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('gis')}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 transition-colors"
            >
              Lihat di Peta GIS <ArrowRight size={12} />
            </button>
          </div>

          {/* Canvas Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-slate-50/50">
            {/* VIEW 1: DAY-BY-DAY ITINERARY */}
            {canvasTab === 'itinerary' && (
              <div className="space-y-6">
                {activePlanDays.length > 0 ? (
                  activePlanDays.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4"
                    >
                      {/* Day Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1.5">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B192C] text-amber-400">
                            Hari {day.dayNumber}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">{day.title}</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin size={12} className="text-rose-500" /> {day.focusArea}
                        </span>
                      </div>

                      {/* Curator Notes Alert */}
                      <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                        <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Saran Kurator Lokal: </strong>
                          {day.curatorNotes}
                        </div>
                      </div>

                      {/* Day Items Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {day.items.map((item) => (
                          <PlannerCard
                            key={item.id}
                            item={item}
                            isSaved={savedItemIds.includes(item.id)}
                            onToggleSave={() => handleToggleSaveItem(item)}
                            onOpenGis={() => handleOpenInGis(item)}
                            onReadArticle={() => handleReadArticle(item.relatedArticleSlug)}
                            onBookingWhatsapp={() => handleBookingWhatsapp(item)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Compass size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Belum ada rute harian. Tanyakan pada asisten untuk menyusunnya.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: ALL CURATED ITEMS */}
            {canvasTab === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeItems.map((item) => (
                  <PlannerCard
                    key={item.id}
                    item={item}
                    isSaved={savedItemIds.includes(item.id)}
                    onToggleSave={() => handleToggleSaveItem(item)}
                    onOpenGis={() => handleOpenInGis(item)}
                    onReadArticle={() => handleReadArticle(item.relatedArticleSlug)}
                    onBookingWhatsapp={() => handleBookingWhatsapp(item)}
                  />
                ))}
              </div>
            )}

            {/* VIEW 3: SAVED BOOKMARKS */}
            {canvasTab === 'saved' && (
              <div>
                {savedItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedItems.map((item) => (
                      <PlannerCard
                        key={item.id}
                        item={item}
                        isSaved={true}
                        onToggleSave={() => handleToggleSaveItem(item)}
                        onOpenGis={() => handleOpenInGis(item)}
                        onReadArticle={() => handleReadArticle(item.relatedArticleSlug)}
                        onBookingWhatsapp={() => handleBookingWhatsapp(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8">
                    <Bookmark size={32} className="mx-auto text-slate-400 mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">Belum Ada Destinasi Disimpan</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Klik ikon simpan pada kartu destinasi atau penginapan untuk mengumpulkannya ke dalam daftar favorit perjalanan Anda.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Action Ecosystem Navigation */}
          <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">
              Data terhubung langsung dengan Peta Spasial GIS & Manajemen Artikel Pokdarwis.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('gis')}
                className="px-3 py-1.5 rounded-lg bg-[#0B192C] text-amber-400 hover:bg-slate-800 font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <Layers size={13} />
                <span>Lihat Seluruh Titik di Peta GIS</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 4. FOOTER */}
      <BandaUnifiedFooter onNavigateTab={onNavigate} />
    </div>
  )
}

// Subcomponent: Interactive Destination/Accommodation Card
interface PlannerCardProps {
  item: UnifiedPlannerItem
  isSaved: boolean
  onToggleSave: () => void
  onOpenGis: () => void
  onReadArticle: () => void
  onBookingWhatsapp: () => void
}

const PlannerCard: React.FC<PlannerCardProps> = ({
  item,
  isSaved,
  onToggleSave,
  onOpenGis,
  onReadArticle,
  onBookingWhatsapp,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-sm overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Image with badges */}
        <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
          <img
            src={item.photoUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/images/landmarks/belgica.jpg'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

          {/* Category Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm ${
                item.type === 'heritage'
                  ? 'bg-amber-500 text-slate-950'
                  : item.type === 'nature'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {item.categoryLabel}
            </span>
          </div>

          {/* Save / Bookmark Button */}
          <button
            type="button"
            onClick={onToggleSave}
            title={isSaved ? 'Hapus dari Tersimpan' : 'Simpan Destinasi'}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-sm transition-colors"
          >
            {isSaved ? <BookmarkCheck size={14} className="text-amber-400" /> : <Bookmark size={14} />}
          </button>

          {/* Island location at bottom of image */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-semibold drop-shadow">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="text-rose-400 flex-shrink-0" />
              {item.island}
            </span>
            {item.historicalEra && (
              <span className="text-[10px] bg-slate-900/70 px-1.5 py-0.5 rounded text-amber-300">
                {item.historicalEra}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 space-y-2">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 leading-snug">
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Special Facilities (RO water, solar backup, price) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
            {item.priceRp && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Rp {item.priceRp.toLocaleString('id-ID')}/malam
              </span>
            )}
            {item.hasCleanRoWater && (
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200 flex items-center gap-1">
                <Droplets size={10} className="text-sky-500" /> Air Minum RO
              </span>
            )}
            {item.hasSolarBackup && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1">
                <Zap size={10} className="text-amber-500" /> PLTS Surya
              </span>
            )}
            {item.hoursOrAccess && (
              <span className="text-slate-500 flex items-center gap-1">
                <Clock size={10} /> {item.hoursOrAccess}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons (Connected Ecosystem Links) */}
      <div className="p-3 pt-0 flex items-center gap-1.5 border-t border-slate-100 mt-2">
        {/* Action 1: Open in GIS */}
        <button
          type="button"
          onClick={onOpenGis}
          className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
        >
          <MapPin size={12} className="text-cyan-600" />
          <span>Buka di Peta GIS</span>
        </button>

        {/* Action 2: WhatsApp for accommodations */}
        {item.type === 'accommodation' && item.contactWhatsapp && (
          <button
            type="button"
            onClick={onBookingWhatsapp}
            className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.98] shadow-sm"
            title="Pesan Langsung via WhatsApp"
          >
            <Phone size={12} />
            <span className="hidden sm:inline">Pesan WA</span>
          </button>
        )}

        {/* Action 3: Read History Article if available */}
        {item.relatedArticleSlug && (
          <button
            type="button"
            onClick={onReadArticle}
            className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
            title="Baca Narasi Sejarah di Portal Pokdarwis"
          >
            <BookOpen size={12} className="text-amber-600" />
            <span className="hidden sm:inline">Baca Sejarah</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default SmartPlannerWorkspace
