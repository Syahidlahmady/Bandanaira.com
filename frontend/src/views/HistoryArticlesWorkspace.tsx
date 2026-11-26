import React, { useState, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Compass,
  Share2,
  Copy,
  Check,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  Search,
  Shield,
} from 'lucide-react'
import { tourismService, CommunityContentItem } from '../services/tourism'
import { BandaUnifiedFooter } from '../components/common/BandaUnifiedFooter'

export interface HistoryArticlesWorkspaceProps {
  initialSlug?: string | null
  onNavigateHome?: () => void
  onNavigateToGis?: () => void
  onNavigateToTourism?: () => void
  onNavigateToDashboard?: () => void
  onOpenQuickLogin?: () => void
  currentUser?: any
}

// Fallback high-quality curated stories when offline or initial loading
const FALLBACK_HISTORY_ARTICLES: CommunityContentItem[] = [
  {
    id: 'art-001',
    content_code: 'CNT-ART-001',
    title: 'Menelusuri Benteng Belgica: Mahkota Pertahanan Segi Lima di Puncak Bukit Tabaleku',
    slug: 'menelusuri-benteng-belgica-mahkota-pertahanan-tabaleku',
    content_type: 'ARTICLE',
    priority_category: 'SEJARAH',
    island_name: 'Pulau Neira',
    author_name: 'Pokdarwis Banda Neira',
    author_role: 'Pemandu Sejarah & Budaya',
    summary:
      'Panduan lengkap wisata sejarah Benteng Belgica (1611), spot matahari terbit terbaik menghadap Gunung Api Banda dan Selat Neira yang diabadikan pada uang kertas Rp 1.000.',
    body_narrative:
      'Berdiri megah di atas Bukit Tabaleku pada ketinggian 30 meter di atas permukaan laut, Benteng Belgica merupakan salah satu benteng bintang segi lima (pentagon) paling utuh di Nusantara.\n\nDibangun oleh Gubernur Jenderal VOC Pieter Both pada tahun 1611 di atas reruntuhan struktur pertahanan Portugis abad ke-16, Belgica dirancang sebagai menara pengawas maritim utama yang mampu memantau lalu lintas kapal dagang di Selat Neira sekaligus menjadi pertahanan lapis kedua di belakang Benteng Nassau di tepi pantai.\n\nKeunikan arsitektur Belgica terletak pada struktur dinding gandanya. Lapisan luar memiliki lima bastion sudut yang masing-masing dilengkapi pos penjagaan dan meriam perunggu berbobot ratusan pon. Dari menara utama di lantai dua benteng, para pengunjung disuguhi panorama 360 derajat yang dramatis: kerucut megah Gunung Api Banda di seberang selat, lanskap atap seng kuno Kota Neira, serta bentangan air biru Laut Banda yang tenang.\n\nWisatawan dianjurkan berkunjung saat fajar pukul 06.00 WIT untuk menikmati matahari terbit bernuansa keemasan di balik Gunung Api Banda, atau menjelang senja pukul 17.00 WIT saat hembusan angin laut membawa kesejukan ke pelataran benteng yang sarat dengan cerita ratusan tahun.',
    media_url: '/images/landmarks/belgica.jpg',
    latitude: -4.5265,
    longitude: 129.9015,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    qc_passed_count: 6,
    is_published: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'art-002',
    content_code: 'CNT-ART-005',
    title: 'Pala yang Dicari Dunia: Emas Hijau dari Kepulauan Banda Neira',
    slug: 'pala-yang-dicari-dunia-dan-jalur-rempah-nusantara',
    content_type: 'ARTICLE',
    priority_category: 'SEJARAH',
    island_name: 'Pulau Banda Besar',
    author_name: 'Pokdarwis Banda Neira',
    author_role: 'Kurator Jalur Rempah',
    summary:
      'Dahulu, buah pala hanya tumbuh di tanah Banda. Aromanya yang khas dan khasiatnya yang langka membuat bangsa-bangsa dari berbagai belahan bumi berlayar ribuan mil untuk mencarinya. Nilainya saat itu melampaui emas.',
    body_narrative:
      'Selama berabad-abad sebelum era eksplorasi samudra besar-besaran, pohon pala (Myristica fragrans) adalah rahasia botani paling dijaga di bumi. Hanya di gugusan kepulauan vulkanik kecil Banda di jantung Kepulauan Maluku inilah pohon pala dapat tumbuh subur secara alami.\n\nPala Banda memerlukan kondisi tanah andosol vulkanik yang kaya mineral, kelembapan tropis stabil, dan yang terpenting: naungan kanopi rimbun dari pohon kenari raksasa (Canarium indicum). Pohon kenari berfungsi sebagai penahan terpaan angin badai laut sekaligus menjaga kelembapan mikro di sekitar akar pala.\n\nSetiap buah pala menghasilkan dua komoditas bernilai tinggi sekaligus: biji pala keras berwarna cokelat kehitaman di bagian dalam, serta selaput fuli (mace) berwarna merah menyala menyerupai renda yang membalut tempurung biji.\n\nPada abad pertengahan di Eropa, segenggam pala bernilai cukup untuk membeli kapal baru beserta seluruh bekalnya. Selain sebagai pengawet daging dan penyedap hidangan kaum bangsawan, pala diyakini sebagai penangkal wabah Maut Hitam (Black Death). Obsesi terhadap komoditas inilah yang memicu bangsa Portugis, Spanyol, Inggris, dan VOC Belanda berlayar mengitari Benua Afrika dan menyeberangi Samudra Hindia demi menguasai Kepulauan Banda.',
    media_url: '/images/landmarks/kebun-pala.jpg',
    latitude: -4.545,
    longitude: 129.902,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    qc_passed_count: 6,
    is_published: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'art-003',
    content_code: 'CNT-ART-006',
    title: 'Pulau Rhun & Barter Manhattan: Perjanjian Breda 1667 yang Mengubah Peta Dunia',
    slug: 'pulau-rhun-barter-manhattan-perjanjian-breda-1667',
    content_type: 'ARTICLE',
    priority_category: 'SEJARAH',
    island_name: 'Pulau Rhun',
    author_name: 'Pokdarwis Banda Neira',
    author_role: 'Peneliti Sejarah Maritim',
    summary:
      'Sebuah pulau karang kecil di barat Banda pernah menjadi pusat sengketa antara Inggris dan Belanda. Demi menguasai Pulau Rhun seutuhnya, Belanda rela menukarnya dengan koloni New Amsterdam yang kini dikenal sebagai Manhattan, New York.',
    body_narrative:
      'Di ujung barat Kepulauan Banda, terhampar sebuah pulau karang terpencil berukuran panjang sekitar 3 kilometer dan lebar kurang dari 1 kilometer: Pulau Rhun. Meskipun mungil dan terisolasi dari pulau utama Neira, pulau ini pernah menjadi episentrum perebutan kekuasaan maritim global antara Kerajaan Inggris dan Republik Belanda.\n\nPada Desember 1616, kapten kapal Inggris Nathaniel Courthope mendarat di Pulau Rhun dan membujuk para tetua adat Banda untuk menandatangani perjanjian perlindungan dagang. Langkah ini menjadikan Pulau Rhun sebagai koloni seberang lautan pertama dalam sejarah imperium maritim Inggris.\n\nKehadiran pos Inggris di Rhun mengancam monopoli mutlak VOC di Kepulauan Banda. Selama lebih dari empat tahun, Courthope dan pasukannya bertahan dari kepungan armada Belanda sebelum akhirnya benteng pertahanan mereka ditaklukkan.\n\nSengketa perebutan Pulau Rhun terus memicu perseteruan hingga meletusnya Perang Inggris-Belanda Kedua. Pada 31 Juli 1667, sebuah perjanjian damai ditandatangani di kota Breda, Belanda. Melalui Traktat Breda, Inggris setuju melepaskan klaim kedaulatan atas Pulau Rhun kepada Belanda. Sebagai kompensasinya, Belanda menyerahkan koloni New Amsterdam di pesisir Amerika Utara kepada Inggris—wilayah yang kemudian diubah namanya menjadi New York dan kini menjadi pulau Manhattan, pusat keuangan modern dunia.\n\nKini, Pulau Rhun berdiri damai dengan kebun-kebun pala yang masih dipetik oleh keturunan warga lokal, menjadi saksi bisu barter wilayah paling legendaris dalam sejarah diplomasi dunia.',
    media_url: '/images/landmarks/pulau-rhun.jpg',
    latitude: -4.555,
    longitude: 129.715,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    qc_passed_count: 6,
    is_published: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'art-004',
    content_code: 'CNT-ART-007',
    title: 'Pengasingan Bung Hatta & Sutan Sjahrir di Banda Neira: Merajut Gagasan Kemerdekaan',
    slug: 'pengasingan-bung-hatta-dan-sjahrir-di-banda-neira',
    content_type: 'ARTICLE',
    priority_category: 'SEJARAH',
    island_name: 'Pulau Neira',
    author_name: 'Pokdarwis Banda Neira',
    author_role: 'Pemandu Cagar Budaya',
    summary:
      'Di pulau yang tenang ini, Mohammad Hatta dan Sutan Sjahrir pernah diasingkan oleh kolonial Belanda (1936-1942). Sambil mengajar anak-anak setempat, mereka terus menulis buku dan merajut gagasan besar tentang masa depan Indonesia.',
    body_narrative:
      'Pada Februari 1936, sebuah kapal uap kolonial merapat di dermaga Banda Neira, membawa dua pemikir kemerdekaan muda Indonesia: Mohammad Hatta dan Sutan Sjahrir. Keduanya baru saja dipindahkan dari kamp pengasingan rawa-rawa malaria di Boven Digoel, Papua.\n\nPemerintah Hindia Belanda sengaja memilih Banda Neira sebagai tempat pengasingan karena lokasinya yang terisolasi di tengah Laut Banda yang berjarak ratusan mil dari pulau besar Jawa. Namun, pengasingan di Banda justru menjadi masa perenungan intelektual yang sangat subur bagi Bung Hatta.\n\nBung Hatta menyewa sebuah rumah berhalaman luas di Desa Dwiwarna, tidak jauh dari pantai. Di dalam rumah tersebut, Hatta membawa ribuan jilid buku ilmiah dari Eropa. Setiap sore hari, Bung Hatta dan Sjahrir mendirikan sekolah sore cuma-cuma di paviliun belakang rumah mereka, mengajarkan membaca, sejarah, berhitung, tata bahasa, dan budi pekerti kepada anak-anak Banda.\n\nDi sela-sela waktu senggangnya, Bung Hatta menulis berbagai esai ekonomi dan politik, merumuskan gagasan tentang koperasi sebagai soko guru perekonomian rakyat, dan prinsip kedaulatan rakyat yang demokratis.\n\nRumah pengasingan ini kini berdiri anggun sebagai Museum Sejarah Nasional di Pulau Neira, dengan perabot meja kerja, mesin ketik tua, kacamata bulat khas Bung Hatta, serta lemari buku yang masih terawat rapi.',
    media_url: '/images/landmarks/bung-hatta.jpg',
    latitude: -4.526,
    longitude: 129.9025,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    qc_passed_count: 6,
    is_published: true,
    created_at: '2026-03-01T00:00:00Z',
  },
]

const CATEGORY_TABS = [
  { id: '', label: 'Semua Kategori' },
  { id: 'SEJARAH', label: 'Sejarah Utama' },
  { id: 'DESTINASI', label: 'Cagar Budaya' },
  { id: 'UMKM', label: 'Perkebunan Pala' },
  { id: 'RELIGI_KULTURAL', label: 'Adat & Tradisi' },
]

const ISLAND_TABS = [
  'Semua Pulau',
  'Pulau Neira',
  'Pulau Banda Besar',
  'Pulau Rhun',
  'Pulau Ay',
  'Pulau Hatta',
]

export const HistoryArticlesWorkspace: React.FC<HistoryArticlesWorkspaceProps> = ({
  initialSlug,
  onNavigateHome,
  onNavigateToGis,
  onNavigateToTourism,
  onNavigateToDashboard,
  onOpenQuickLogin,
  currentUser,
}) => {
  const [articles, setArticles] = useState<CommunityContentItem[]>(() => {
    try {
      const cached = localStorage.getItem('pokdarwis_articles_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return FALLBACK_HISTORY_ARTICLES
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug || null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedIsland, setSelectedIsland] = useState<string>('Semua Pulau')
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Fetch articles from backend API with real-time sync
  useEffect(() => {
    let isMounted = true
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const data = await tourismService.listCommunityContents({ content_type: 'ARTICLE' })
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setArticles(data)
          try {
            localStorage.setItem('pokdarwis_articles_cache', JSON.stringify(data))
          } catch {
            // ignore
          }
        }
      } catch {
        // Fallback already preloaded from cache or constant
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchArticles()

    const handleSync = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        if (isMounted) setArticles(e.detail)
      } else {
        try {
          const cached = localStorage.getItem('pokdarwis_articles_cache')
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && isMounted) setArticles(parsed)
          }
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('banda_articles_updated', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      isMounted = false
      window.removeEventListener('banda_articles_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Sync selectedSlug if initialSlug changes
  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [initialSlug])

  // Active article when reader view is active
  const activeArticle = useMemo(() => {
    if (!selectedSlug) return null
    return (
      articles.find((a) => a.slug === selectedSlug || a.id === selectedSlug) ||
      FALLBACK_HISTORY_ARTICLES.find((a) => a.slug === selectedSlug || a.id === selectedSlug) ||
      null
    )
  }, [selectedSlug, articles])

  // Filtered list of articles
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      // Category filter
      if (selectedCategory && item.priority_category !== selectedCategory) {
        return false
      }
      // Island filter
      if (selectedIsland !== 'Semua Pulau' && item.island_name !== selectedIsland) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchSummary = item.summary.toLowerCase().includes(q)
        const matchAuthor = item.author_name.toLowerCase().includes(q)
        if (!matchTitle && !matchSummary && !matchAuthor) return false
      }
      return true
    })
  }, [articles, selectedCategory, selectedIsland, searchQuery])

  // Related articles (excluding current one)
  const relatedArticles = useMemo(() => {
    if (!activeArticle) return []
    return articles.filter((a) => a.slug !== activeArticle.slug).slice(0, 3)
  }, [articles, activeArticle])

  const handleOpenArticle = (slug: string) => {
    setSelectedSlug(slug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      window.history.pushState(null, '', `/sejarah?slug=${encodeURIComponent(slug)}`)
    } catch {
      // ignore
    }
  }

  const handleBackToList = () => {
    setSelectedSlug(null)
    try {
      window.history.pushState(null, '', '/sejarah')
    } catch {
      // ignore
    }
  }

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleShareWhatsApp = () => {
    if (!activeArticle || typeof window === 'undefined') return
    const text = encodeURIComponent(
      `Baca artikel sejarah Banda Neira: "${activeArticle.title}"\n${window.location.href}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  // =========================================================================
  // SUB-VIEW 1: ARTICLE READER DETAIL VIEW
  // =========================================================================
  if (activeArticle) {
    const paragraphs = activeArticle.body_narrative.split('\n\n').filter((p) => p.trim())
    const estimatedMinutes = Math.max(2, Math.ceil(activeArticle.body_narrative.split(/\s+/).length / 150))

    return (
      <article className="min-h-screen bg-[#FDFBF7] text-[#081D35] pb-24 selection:bg-[#F4B75E] selection:text-[#081D35]">
        {/* Top Floating Control Bar */}
        <div className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-8 py-3.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-[#081D35] border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Arsip Sejarah</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-[#D5CEBF] text-xs font-medium transition cursor-pointer"
                title="Salin Tautan Artikel"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span className="hidden sm:inline">{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                title="Bagikan via WhatsApp"
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">Bagikan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reader Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 text-xs text-slate-500 flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#081D35] transition cursor-pointer"
            >
              Beranda
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={handleBackToList}
              className="hover:text-[#081D35] transition cursor-pointer"
            >
              Sejarah
            </button>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-[240px] sm:max-w-md">
              {activeArticle.title}
            </span>
          </nav>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#081D35] text-white uppercase tracking-wider">
              {activeArticle.island_name}
            </span>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf4fb] text-[#2c4e6e] border border-[#cfe2f4]">
              {activeArticle.priority_category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 ml-auto">
              <Clock size={13} />
              <span>{estimatedMinutes} menit baca</span>
            </span>
          </div>

          {/* Article Main Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#081D35] font-normal leading-[1.22] tracking-tight mb-5">
            {activeArticle.title}
          </h1>

          {/* Author & Curator Strip */}
          <div className="flex items-center gap-3.5 py-4 border-y border-[#E8E2D5] mb-8 text-xs text-slate-600">
            <div className="w-9 h-9 rounded-full bg-[#081D35] text-white flex items-center justify-center font-serif font-bold text-sm">
              {activeArticle.author_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{activeArticle.author_name}</p>
              <p className="text-[11px] text-slate-500">{activeArticle.author_role} &bull; Terverifikasi Pokdarwis</p>
            </div>
            {activeArticle.latitude && activeArticle.longitude && onNavigateToGis && (
              <button
                type="button"
                onClick={onNavigateToGis}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081D35]/5 hover:bg-[#081D35]/10 text-[#081D35] text-xs font-semibold transition cursor-pointer border border-[#cfe2f4]"
              >
                <MapPin size={13} />
                <span>Lihat di Peta GIS</span>
              </button>
            )}
          </div>

          {/* Hero Cover Image */}
          {activeArticle.media_url && (
            <figure className="mb-10 rounded-2xl overflow-hidden border border-[#E8E2D5] shadow-sm bg-white">
              <img
                src={activeArticle.media_url}
                alt={activeArticle.title}
                className="w-full h-auto max-h-[520px] object-cover"
                loading="eager"
              />
              <figcaption className="p-3 bg-white text-slate-500 text-[11px] font-sans border-t border-slate-100 italic text-center">
                Dokumentasi cagar budaya dan sejarah otentik Kepulauan Banda Neira &bull; Sumber: Arsip Pokdarwis Banda
              </figcaption>
            </figure>
          )}

          {/* Intro Pull-Quote / Summary Excerpt */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#f4f8fb] border-l-4 border-[#081D35] mb-8 shadow-xs">
            <p className="font-serif italic text-base sm:text-lg text-[#1e3a5f] leading-relaxed">
              &ldquo;{activeArticle.summary}&rdquo;
            </p>
          </div>

          {/* Main Body Narrative */}
          <div className="font-sans text-slate-800 text-base sm:text-[17px] leading-[1.85] space-y-6">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Article Footer & Verification Note */}
          <div className="mt-14 pt-6 border-t border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-emerald-600" />
              <span>Naskah diverifikasi sesuai 6-Point Quality Control &amp; Etika Adat Negeri</span>
            </div>
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 font-semibold text-[#081D35] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Jelajahi Cerita Sejarah Lainnya</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Related Articles Grid */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-12 border-t-2 border-[#E8E2D5]">
              <h2 className="font-serif text-2xl text-[#081D35] font-normal mb-6">
                Arsip Sejarah Terkait Lainnya
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.slug}
                    onClick={() => handleOpenArticle(rel.slug)}
                    className="group bg-white rounded-xl border border-[#E8E2D5] overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col"
                  >
                    <div className="aspect-16/10 overflow-hidden bg-slate-100 relative">
                      <img
                        src={rel.media_url || '/images/landmarks/belgica.jpg'}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-[#4a6b82] uppercase tracking-wider mb-1 block">
                        {rel.island_name}
                      </span>
                      <h3 className="font-serif text-sm font-medium text-[#081D35] leading-snug group-hover:text-[#0c2a4d] transition line-clamp-2 mb-2">
                        {rel.title}
                      </h3>
                      <span className="text-xs text-[#081D35] font-semibold inline-flex items-center gap-1 mt-auto">
                        <span>Baca Cerita</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    )
  }

  // =========================================================================
  // SUB-VIEW 2: PUBLIC ARTICLES LIST / DIRECTORY VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#081D35] pb-24 selection:bg-[#F4B75E] selection:text-[#081D35]">
      {/* Top Floating Explorer Nav */}
      <nav aria-label="Navigasi arsip sejarah" className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-[#081D35] border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <ArrowLeft size={14} />
                <span>Beranda Utama</span>
              </button>
            )}
            <span className="font-serif font-bold text-sm tracking-tight text-[#081D35]">
              bandanaira<span className="text-[#F4B75E]">.com</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToGis && (
              <button
                type="button"
                onClick={onNavigateToGis}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#081D35] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer"
              >
                <Compass size={13} />
                <span>Peta Spasial GIS</span>
              </button>
            )}
            {currentUser && onNavigateToDashboard && (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#081D35] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer"
              >
                <span>Dasbor</span>
              </button>
            )}
            {currentUser && onNavigateToTourism && (
              <button
                type="button"
                onClick={onNavigateToTourism}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#081D35] text-white hover:bg-[#0c2a4d] text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <BookOpen size={13} />
                <span>Kelola CMS Pokdarwis</span>
              </button>
            )}
            {!currentUser && onOpenQuickLogin && (
              <button
                type="button"
                onClick={onOpenQuickLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#081D35] text-white hover:bg-[#0c2a4d] text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <span>Masuk Portal</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Editorial Header Section */}
      <section className="relative w-full py-16 sm:py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#eaf4fb] via-[#f2f8fc] to-[#FDFBF7] border-b border-[#E8E2D5] overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Top Tagline */}
          <p className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#4a6b82] uppercase mb-3">
            HISTORI &amp; CAGAR BUDAYA BANDA NEIRA
          </p>

          {/* Split Line Heading */}
          <div className="flex items-center justify-center w-full max-w-3xl mx-auto gap-4 sm:gap-8 mb-5">
            <div className="flex-1 h-[1.5px] bg-[#081D35]/70 min-w-[20px]" />
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[48px] text-[#081D35] font-normal tracking-tight whitespace-nowrap">
              Arsip Sejarah Kepulauan
            </h1>
            <div className="flex-1 h-[1.5px] bg-[#081D35]/70 min-w-[20px]" />
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-sans mb-8">
            Dokumentasi narasi otentik Jalur Rempah dunia, benteng-benteng pertahanan VOC, pertukaran bersejarah Pulau Rhun dengan Manhattan, dan jejak kemerdekaan proklamator di Banda Neira.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-xl relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari naskah sejarah, benteng, tokoh, atau peristiwa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#D5CEBF] focus:outline-none focus:border-[#081D35] focus:ring-2 focus:ring-[#081D35]/10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs transition"
            />
          </div>
        </div>
      </section>

      {/* Filter Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORY_TABS.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#081D35] text-white font-medium shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-[#2c4e6e] border border-[#D5CEBF]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Island Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium mr-1 text-slate-600">Pulau:</span>
            {ISLAND_TABS.map((isl) => (
              <button
                type="button"
                key={isl}
                onClick={() => setSelectedIsland(isl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                  selectedIsland === isl
                    ? 'bg-[#081D35]/10 text-[#081D35] font-bold border border-[#081D35]/30'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {isl}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Count & Status */}
        <div className="py-4 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <b>{filteredArticles.length}</b> naskah artikel sejarah</span>
          {loading ? (
            <span className="text-slate-400">Menyelaraskan data...</span>
          ) : currentUser ? (
            <span className="text-emerald-700 font-medium">Mode Kurator Terverifikasi</span>
          ) : null}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E2D5] p-8">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-serif text-lg text-[#081D35] font-medium mb-1">
              Tidak ada artikel yang cocok
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Coba gunakan kata kunci pencarian lain atau pilih kategori &quot;Semua Kategori&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setSelectedIsland('Semua Pulau')
              }}
              className="px-4 py-2 rounded-full bg-[#081D35] text-white text-xs font-medium cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((article) => {
              const estimatedMinutes = Math.max(
                2,
                Math.ceil(article.body_narrative.split(/\s+/).length / 150)
              )

              return (
                <article
                  key={article.slug}
                  onClick={() => handleOpenArticle(article.slug)}
                  className="group bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Card Thumbnail Cover */}
                  <div className="aspect-16/10 overflow-hidden bg-slate-100 relative">
                    <img
                      src={article.media_url || '/images/landmarks/belgica.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#081D35]/90 text-white backdrop-blur-xs uppercase tracking-wider">
                        {article.island_name}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span className="font-semibold text-[#4a6b82] uppercase tracking-wider">
                          {article.priority_category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          <span>{estimatedMinutes} mnt baca</span>
                        </span>
                      </div>

                      <h2 className="font-serif text-xl text-[#081D35] font-medium leading-snug group-hover:text-[#0c2a4d] transition line-clamp-2 mb-3">
                        {article.title}
                      </h2>

                      <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-4 font-sans">
                        {article.summary}
                      </p>
                    </div>

                    {/* Footer Author & CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                        {article.author_name}
                      </span>

                      <span className="text-xs font-semibold text-[#081D35] group-hover:text-[#0c2a4d] inline-flex items-center gap-1 transition">
                        <span>Baca Cerita</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Unified Ecosystem Footer */}
      <div className="mt-16">
        <BandaUnifiedFooter
          onNavigateTab={(tab) => {
            if (tab === 'landing') onNavigateHome?.()
            else if (tab === 'gis') onNavigateToGis?.()
            else if (tab === 'tourism') onNavigateToTourism?.()
          }}
        />
      </div>
    </div>
  )
}

export default HistoryArticlesWorkspace
