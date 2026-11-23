import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Compass,
  MapPin,
  Send,
  BookOpen,
  Droplets,
  Zap,
  RefreshCw,
  Phone,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import { gisService, GeoJSONFeature } from '../services/gis'
import { tourismService, AccommodationItem, CommunityContentItem } from '../services/tourism'
import { getFeatureMedia } from './InteractiveMapWorkspace'

export interface SmartPlannerWorkspaceProps {
  onNavigate?: (tab: string, param?: string) => void
  onBackToLanding?: () => void
}

export interface PlannerCardItem {
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
  relatedArticleSlug?: string
  builtYear?: number
}

export interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  recommendations?: PlannerCardItem[]
}

const QUICK_OPTIONS = [
  { label: 'Sejarah & Benteng', query: 'Rekomendasikan situs sejarah dan benteng di Pulau Neira' },
  { label: 'Snorkeling & Bahari', query: 'Spot snorkeling dan terumbu karang terbaik di Banda' },
  { label: 'Penginapan Hemat & Nyaman', query: 'Penginapan terjangkau dengan air minum bersih RO' },
  { label: 'Keliling Kota 1 Hari', query: 'Rute jalan kaki santai 1 hari di sekitar Kota Neira' },
  { label: 'Pulau Rhun & Hatta', query: 'Eksplorasi sejarah Pulau Rhun dan pantai Pulau Hatta' },
]

export const SmartPlannerWorkspace: React.FC<SmartPlannerWorkspaceProps> = ({
  onNavigate,
  onBackToLanding,
}) => {
  const [gisFeatures, setGisFeatures] = useState<GeoJSONFeature[]>([])
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [articles, setArticles] = useState<CommunityContentItem[]>([])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Real Database on Mount
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
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
        console.warn('Gagal memuat data spasial & penginapan:', err)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  // 2. Build Unified Catalog from Real Database
  const catalog: PlannerCardItem[] = useMemo(() => {
    const list: PlannerCardItem[] = []

    // GIS Features
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
        categoryLabel = 'Wisata Bahari'
      } else if (layerType === 'LAYER_ACCOMMODATION') {
        type = 'accommodation'
        categoryLabel = 'Penginapan'
      }

      // Match related article
      const matchedArt = articles.find((a) => {
        const title = (a.title || '').toLowerCase()
        const n = name.toLowerCase()
        return title.includes(n) || n.includes(title.slice(0, 15))
      })

      // Match accommodation details
      const matchedAcc = accommodations.find((acc) => {
        return acc.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(acc.name.toLowerCase())
      })

      list.push({
        id: String(feat.id || p.id || `gis-${Math.random()}`),
        name,
        type,
        categoryLabel,
        island,
        description: p.description || media.tag || 'Destinasi autentik di Kepulauan Banda.',
        photoUrl: media.imageUrl || p.image_url || '/images/landmarks/belgica.jpg',
        latitude: lat,
        longitude: lng,
        priceRp: matchedAcc?.price_per_night_rp || p.price_per_night_rp,
        contactWhatsapp: matchedAcc?.contact_whatsapp || p.contact_whatsapp,
        hasCleanRoWater: matchedAcc?.has_clean_ro_water ?? p.has_clean_ro_water,
        hasSolarBackup: matchedAcc?.has_solar_backup ?? p.has_solar_backup,
        relatedArticleSlug: matchedArt?.slug,
        builtYear: p.built_year,
      })
    }

    // Direct accommodations
    for (const acc of accommodations) {
      const exists = list.some((it) => it.name.toLowerCase() === acc.name.toLowerCase())
      if (!exists) {
        list.push({
          id: `acc-${acc.id}`,
          name: acc.name,
          type: 'accommodation',
          categoryLabel: 'Penginapan',
          island: acc.island_name || 'Pulau Neira',
          description: acc.description || 'Penginapan dengan kamar terawat dan suasana tenang.',
          photoUrl: acc.photo_url || '/images/landmarks/hotel-maulana.jpg',
          latitude: -4.524,
          longitude: 129.902,
          priceRp: acc.price_per_night_rp,
          contactWhatsapp: acc.contact_whatsapp,
          hasCleanRoWater: acc.has_clean_ro_water,
          hasSolarBackup: acc.has_solar_backup,
        })
      }
    }

    return list
  }, [gisFeatures, accommodations, articles])

  // Initial welcome message
  useEffect(() => {
    if (catalog.length === 0 || messages.length > 0) return

    const initialRecommendations = catalog.filter((it) =>
      /(belgica|nassau|hatta|lava flow)/i.test(it.name)
    ).slice(0, 3)

    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Halo! Selamat datang di Banda Neira. Saya siap membantu Anda menyusun rute kunjungan, memilih cagar budaya, spot bahari, dan menemukan penginapan yang sesuai.',
        timestamp: 'Sekarang',
        recommendations: initialRecommendations.length > 0 ? initialRecommendations : catalog.slice(0, 3),
      },
    ])
  }, [catalog, messages.length])

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Navigation handlers
  const handleOpenGis = (item: PlannerCardItem) => {
    if (onNavigate) {
      onNavigate('gis', `feature_id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`)
    } else {
      window.location.href = `/gis?feature_id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`
    }
  }

  const handleReadArticle = (slug?: string) => {
    if (!slug) return
    if (onNavigate) {
      onNavigate('sejarah', slug)
    } else {
      window.location.href = `/sejarah?slug=${encodeURIComponent(slug)}`
    }
  }

  const handleBookingWhatsapp = (item: PlannerCardItem) => {
    const phone = (item.contactWhatsapp || '6281234567890').replace(/[^0-9]/g, '')
    const msg = `Halo Pengelola ${item.name}, saya melihat informasi tempat Anda di Portal Banda Neira dan ingin bertanya mengenai ketersediaan kamar.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  // Handle user query
  const handleSendMessage = (textToSend?: string) => {
    const q = (textToSend || inputText).trim()
    if (!q) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Baru saja',
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    setTimeout(() => {
      const qLower = q.toLowerCase()

      // Detect intent
      const isAcc = /(hotel|homestay|penginapan|kamar|menginap|tidur|ro|air|budget|murah|hemat)/i.test(qLower)
      const isMarine = /(snorkeling|selam|diving|karang|pantai|laut|ikan|lava flow|tampa nama)/i.test(qLower)
      const isHeritage = /(benteng|sejarah|hatta|sjahrir|belgica|nassau|museum|kolonial|voc|rhun)/i.test(qLower)
      const isRhunHatta = /(rhun|hatta)/i.test(qLower)

      let results: PlannerCardItem[] = []
      let replyText = 'Berikut beberapa tempat pilihan yang bisa Anda kunjungi:'

      if (isAcc) {
        results = catalog.filter((it) => it.type === 'accommodation')
        if (qLower.includes('ro') || qLower.includes('air')) {
          results = results.filter((it) => it.hasCleanRoWater)
        }
        replyText = 'Berikut pilihan penginapan terdaftar di Kepulauan Banda yang siap Anda hubungi:'
      } else if (isMarine) {
        results = catalog.filter((it) => it.type === 'nature')
        replyText = 'Berikut spot bahari dan snorkeling favorit dengan perairan jernih:'
      } else if (isRhunHatta) {
        results = catalog.filter((it) => /(rhun|hatta)/i.test(it.island) || /(rhun|hatta)/i.test(it.name))
        replyText = 'Berikut destinasi utama di Pulau Rhun dan Pulau Hatta:'
      } else if (isHeritage) {
        results = catalog.filter((it) => it.type === 'heritage')
        replyText = 'Berikut situs bersejarah dan benteng yang dapat Anda jelajahi:'
      } else {
        results = catalog.filter((it) => {
          const text = `${it.name} ${it.description} ${it.island}`.toLowerCase()
          return qLower.split(' ').some((word) => word.length > 3 && text.includes(word))
        })
        if (results.length === 0) {
          results = catalog.slice(0, 3)
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: 'Baru saja',
        recommendations: results.slice(0, 3),
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 450)
  }

  const handleResetChat = () => {
    const initial = catalog.filter((it) => /(belgica|nassau|hatta)/i.test(it.name)).slice(0, 3)
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'bot',
        text: 'Percakapan telah direset. Silakan tanyakan rute, penginapan, atau klik salah satu pilihan di atas.',
        timestamp: 'Baru saja',
        recommendations: initial,
      },
    ])
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#FDFBF7] text-[#081D35] overflow-hidden selection:bg-[#F4B75E] selection:text-[#081D35]">
      {/* 1. Minimal & Elegant Top Navigation */}
      <header className="flex-shrink-0 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-6 py-2.5 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F4B75E]/20 text-[#0c2340] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Beranda</span>
              </button>
            )}
            <span className="font-serif font-bold text-sm tracking-tight text-[#0c2340]">
              bandanaira<span className="text-[#F4B75E]">.com</span>
            </span>
            <span className="hidden sm:inline text-stone-300">|</span>
            <span className="hidden sm:inline text-xs font-serif font-medium text-stone-600">
              Perencana Wisata
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('gis')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 text-[#0c2340] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <Compass size={13} />
              <span className="hidden sm:inline">Peta Spasial GIS</span>
            </button>
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset Percakapan"
              className="p-1.5 rounded-full bg-white hover:bg-stone-50 text-stone-600 border border-[#D5CEBF] transition cursor-pointer"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Quick Suggestion Pills */}
      <div className="flex-shrink-0 bg-[#FAF8F5]/90 border-b border-[#E8E2D5] px-4 py-2 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-[#4a6b82] uppercase tracking-wider whitespace-nowrap hidden sm:inline">
            Pilihan:
          </span>
          {QUICK_OPTIONS.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(opt.query)}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#F4B75E]/20 text-[#0c2340] border border-[#D5CEBF] text-xs font-medium transition cursor-pointer whitespace-nowrap shadow-2xs active:scale-[0.98]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Fullscreen Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 bg-[#FAF8F5]/30">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-[#0c2340] text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot size={15} />
                </div>
              )}

              <div className="max-w-[90%] sm:max-w-[80%] space-y-2.5">
                {/* Speech Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0c2340] text-white rounded-tr-none'
                      : 'bg-white text-[#0c2340] border border-[#E8E2D5] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 font-sans ${
                      msg.sender === 'user' ? 'text-white/60 text-right' : 'text-stone-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-2 pt-0.5">
                    {msg.recommendations.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-[#E8E2D5] hover:border-[#D5CEBF] p-3 sm:p-3.5 shadow-2xs transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                      >
                        <div className="flex items-start gap-3 w-full sm:w-auto overflow-hidden">
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg object-cover flex-shrink-0 bg-stone-100 border border-[#E8E2D5]"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = '/images/landmarks/belgica.jpg'
                            }}
                          />
                          <div className="overflow-hidden space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a6b82]">
                                {item.categoryLabel}
                              </span>
                              <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                                <MapPin size={10} className="text-rose-500" />
                                {item.island}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm sm:text-base font-semibold text-[#0c2340] leading-snug truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-stone-600 line-clamp-1 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Attributes */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {item.priceRp && (
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Rp {item.priceRp.toLocaleString('id-ID')}/malam
                                </span>
                              )}
                              {item.hasCleanRoWater && (
                                <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 flex items-center gap-1">
                                  <Droplets size={10} className="text-sky-500" /> Air RO
                                </span>
                              )}
                              {item.hasSolarBackup && (
                                <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                  <Zap size={10} className="text-amber-500" /> Listrik PLTS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E2D5] flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenGis(item)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-[#0c2340] border border-[#D5CEBF] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Compass size={13} className="text-[#0c2340]" />
                            <span>Lihat di Peta</span>
                          </button>

                          {item.type === 'accommodation' && item.contactWhatsapp && (
                            <button
                              type="button"
                              onClick={() => handleBookingWhatsapp(item)}
                              className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            >
                              <Phone size={12} />
                              <span>Pesan WA</span>
                            </button>
                          )}

                          {item.relatedArticleSlug && (
                            <button
                              type="button"
                              onClick={() => handleReadArticle(item.relatedArticleSlug)}
                              className="px-3 py-1.5 rounded-lg bg-[#0c2340] hover:bg-[#183e75] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            >
                              <BookOpen size={12} />
                              <span>Baca Kisah</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#F4B75E] text-[#081D35] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-stone-500 text-xs py-2 px-3 bg-white rounded-xl border border-[#E8E2D5] w-fit shadow-2xs">
              <Sparkles size={14} className="animate-spin text-[#F4B75E]" />
              <span>Menyiapkan rekomendasi...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 4. Docked Bottom Input Bar */}
      <div className="flex-shrink-0 bg-white border-t border-[#E8E2D5] px-4 py-3 sm:py-3.5 shadow-sm z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanyakan rute wisata, cagar budaya, atau penginapan..."
            className="flex-1 bg-[#FAF8F5] border border-[#D5CEBF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#081D35] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4B75E] focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#183e75] text-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>Kirim</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default SmartPlannerWorkspace
