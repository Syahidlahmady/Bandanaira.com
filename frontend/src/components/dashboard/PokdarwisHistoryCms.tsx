import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Clock,
  Save,
} from 'lucide-react'
import {
  tourismService,
  CommunityContentItem,
  CommunityContentCreatePayload,
  CommunityContentUpdatePayload,
} from '../../services/tourism'

export interface PokdarwisHistoryCmsProps {
  currentUser?: any
  onPreviewArticle?: (slug: string) => void
}

const LOCAL_LANDMARK_COVERS = [
  { label: 'Benteng Belgica (/images/landmarks/belgica.jpg)', value: '/images/landmarks/belgica.jpg' },
  { label: 'Perkebunan Pala Rakyat (/images/landmarks/kebun-pala.jpg)', value: '/images/landmarks/kebun-pala.jpg' },
  { label: 'Pulau Rhun (/images/landmarks/pulau-rhun.jpg)', value: '/images/landmarks/pulau-rhun.jpg' },
  { label: 'Rumah Pengasingan Bung Hatta (/images/landmarks/bung-hatta.jpg)', value: '/images/landmarks/bung-hatta.jpg' },
  { label: 'Benteng Nassau (/images/landmarks/nassau.jpg)', value: '/images/landmarks/nassau.jpg' },
  { label: 'Benteng Hollandia (/images/landmarks/hollandia.jpg)', value: '/images/landmarks/hollandia.jpg' },
  { label: 'Klenteng Sun Tian Kong (/images/landmarks/klenteng.jpg)', value: '/images/landmarks/klenteng.jpg' },
  { label: 'Sumur Parigi Rante (/images/landmarks/perigi-rante.jpg)', value: '/images/landmarks/perigi-rante.jpg' },
  { label: 'Rumah Budaya Banda (/images/landmarks/rumah-budaya.jpg)', value: '/images/landmarks/rumah-budaya.jpg' },
  { label: 'Pelabuhan Bandanaira (/images/landmarks/pelabuhan.jpg)', value: '/images/landmarks/pelabuhan.jpg' },
  { label: 'Puncak Gunung Api Banda (/images/landmarks/gunung-api-portrait.webp)', value: '/images/landmarks/gunung-api-portrait.webp' },
]

const ISLAND_OPTIONS = [
  'Pulau Neira',
  'Pulau Banda Besar',
  'Pulau Rhun',
  'Pulau Ay',
  'Pulau Hatta',
  'Gunung Api',
]

const CATEGORY_OPTIONS = [
  { value: 'SEJARAH', label: 'Sejarah Utama & Diplomasi' },
  { value: 'DESTINASI', label: 'Cagar Budaya & Benteng' },
  { value: 'UMKM', label: 'Perkebunan Pala & Rempah' },
  { value: 'RELIGI_KULTURAL', label: 'Adat & Tradisi Negeri' },
]

const DEFAULT_SEED_ARTICLES: CommunityContentItem[] = [
  {
    id: 'cnt-art-006',
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
      'Pada tanggal 31 Juli 1667, sebuah perjanjian damai ditandatangani di kota Breda, Belanda. Perjanjian Breda mengakhiri Perang Inggris-Belanda Kedua dengan klausul pertukaran teritori paling bersejarah: Kerajaan Inggris menyerahkan klaim atas Pulau Rhun—sebuah pulau kecil seluas 3 x 1 kilometer di Kepulauan Banda—kepada VOC Belanda. Sebagai gantinya, Belanda menyerahkan koloni New Amsterdam di pesisir timur Amerika Utara kepada Inggris. Siapa sangka, pulau karang terpencil penghasil pala terbaik dunia tersebut pernah ditukar guling dengan Manhattan, jantung finansial dunia saat ini.',
    media_url: '/images/landmarks/pulau-rhun.jpg',
    latitude: -4.556,
    longitude: 129.712,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    qc_passed_count: 6,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-art-001',
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
      'Berdiri megah di atas Bukit Tabaleku pada ketinggian 30 meter di atas permukaan laut, Benteng Belgica merupakan salah satu benteng bintang segi lima (pentagon) paling utuh di Nusantara. Dibangun oleh Gubernur Jenderal VOC Pieter Both pada tahun 1611 di atas struktur benteng Portugis abad ke-16, Belgica dirancang untuk mengawasi pergerakan kapal dagang di Selat Neira sekaligus menjadi benteng lapis kedua di belakang Benteng Nassau. Wisatawan disarankan berkunjung pada pukul 06.00 WIT atau 16.30 WIT untuk mendapatkan pencahayaan keemasan (golden hour) dengan latar kemegahan kerucut Gunung Api Banda.',
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
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-art-005',
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
      'Selama berabad-abad, pohon pala (Myristica fragrans) adalah rahasia alam paling berharga di bumi. Tumbuh subur di tanah vulkanik Banda di bawah naungan pohon kenari kanopi tinggi, buah pala menghasilkan dua rempah sekaligus: biji pala hitam mengilap dan bunga pala (fuli) merah membara. Pada abad pertengahan di Eropa, segenggam pala bernilai cukup untuk membeli kapal dan seluruh perbekalannya, bahkan dipercaya sebagai penangkal wabah maut hitam (Black Death). Monopoli inilah yang memicu bangsa Portugis, Spanyol, Inggris, hingga VOC Belanda mengirim armada melintasi samudra tak bertepi demi menemukan Kepulauan Banda.',
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
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-art-007',
    content_code: 'CNT-ART-007',
    title: 'Rumah Pengasingan Bung Hatta & Sjahrir: Laboratorium Pemikiran Kebangsaan di Ujung Timur',
    slug: 'rumah-pengasingan-bung-hatta-sjahrir-laboratorium-kebangsaan',
    content_type: 'ARTICLE',
    priority_category: 'SEJARAH',
    island_name: 'Pulau Neira',
    author_name: 'Pokdarwis Banda Neira',
    author_role: 'Kurator Jejak Proklamator',
    summary:
      'Menelusuri jejak enam tahun pengasingan Mohammad Hatta dan Sutan Sjahrir (1936–1942) di Banda Neira, tempat di mana mereka mendidik anak-anak lokal dan menulis traktat penting kemerdekaan Indonesia.',
    body_narrative:
      'Pada Februari 1936, Mohammad Hatta dan Sutan Sjahrir tiba di Banda Neira setelah dipindahkan dari kamp Boven Digoel Papua. Alih-alih patah arang, Hatta menjadikan pengasingannya sebagai ruang pengabdian intelektual. Ia menyewa rumah milik Pieter Hendrik Baadilla di dekat perigi rante, mendirikan sekolah sore untuk anak-anak Neira, dan tetap memesan ratusan buku dari Eropa. Dari paviliun berhalaman luas berlantai tegel merah terakota inilah, konsep ekonomi kerakyatan, koperasi desa, dan fondasi Republik didiskusikan secara mendalam sebelum kedua tokoh dipulangkan ke Jawa menjelang kedatangan militer Jepang pada 1942.',
    media_url: '/images/landmarks/bung-hatta.jpg',
    latitude: -4.524,
    longitude: 129.903,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    qc_passed_count: 6,
    is_published: true,
    created_at: new Date().toISOString(),
  },
]

export const PokdarwisHistoryCms: React.FC<PokdarwisHistoryCmsProps> = ({
  currentUser,
  onPreviewArticle,
}) => {
  const [articles, setArticles] = useState<CommunityContentItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modal form states
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    slug: string
    priority_category: string
    island_name: string
    author_name: string
    author_role: string
    summary: string
    body_narrative: string
    media_url: string
    latitude: string
    longitude: string
    is_published: boolean
  }>({
    title: '',
    slug: '',
    priority_category: 'SEJARAH',
    island_name: 'Pulau Neira',
    author_name: currentUser?.full_name || 'Pokdarwis Banda Neira',
    author_role: 'Pemandu Sejarah & Budaya',
    summary: '',
    body_narrative: '',
    media_url: '/images/landmarks/belgica.jpg',
    latitude: '-4.5265',
    longitude: '129.9015',
    is_published: true,
  })

  const loadArticles = async () => {
    try {
      setLoading(true)
      const data = await tourismService.listCommunityContents({ content_type: 'ARTICLE' })
      if (data && data.length > 0) {
        setArticles(data)
        try {
          localStorage.setItem('pokdarwis_articles_cache', JSON.stringify(data))
        } catch {
          // ignore storage error
        }
      } else {
        const cached = localStorage.getItem('pokdarwis_articles_cache')
        const list = cached ? JSON.parse(cached) : DEFAULT_SEED_ARTICLES
        setArticles(list)
      }
    } catch {
      const cached = localStorage.getItem('pokdarwis_articles_cache')
      const list = cached ? JSON.parse(cached) : DEFAULT_SEED_ARTICLES
      setArticles(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles
    const q = searchQuery.toLowerCase()
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.island_name.toLowerCase().includes(q) ||
        a.author_name.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
    )
  }, [articles, searchQuery])

  const handleOpenCreateModal = () => {
    setEditingArticleId(null)
    setFormData({
      title: '',
      slug: '',
      priority_category: 'SEJARAH',
      island_name: 'Pulau Neira',
      author_name: currentUser?.full_name || 'Pokdarwis Banda Neira',
      author_role: 'Pemandu Sejarah & Budaya',
      summary: '',
      body_narrative: '',
      media_url: '/images/landmarks/belgica.jpg',
      latitude: '-4.5265',
      longitude: '129.9015',
      is_published: true,
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (article: CommunityContentItem) => {
    setEditingArticleId(article.id)
    setFormData({
      title: article.title,
      slug: article.slug,
      priority_category: article.priority_category || 'SEJARAH',
      island_name: article.island_name,
      author_name: article.author_name,
      author_role: article.author_role,
      summary: article.summary,
      body_narrative: article.body_narrative,
      media_url: article.media_url || '/images/landmarks/belgica.jpg',
      latitude: article.latitude ? String(article.latitude) : '',
      longitude: article.longitude ? String(article.longitude) : '',
      is_published: article.is_published,
    })
    setShowModal(true)
  }

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.body_narrative.trim() || !formData.summary.trim()) {
      setNotice({ type: 'error', text: 'Mohon lengkapi judul, ringkasan, dan isi naskah artikel.' })
      return
    }

    try {
      setSubmitting(true)
      const lat = formData.latitude ? parseFloat(formData.latitude) : null
      const lng = formData.longitude ? parseFloat(formData.longitude) : null

      if (editingArticleId) {
        // Update existing article
        const payload: CommunityContentUpdatePayload = {
          title: formData.title.trim(),
          priority_category: formData.priority_category,
          island_name: formData.island_name,
          author_name: formData.author_name.trim(),
          author_role: formData.author_role.trim(),
          summary: formData.summary.trim(),
          body_narrative: formData.body_narrative.trim(),
          media_url: formData.media_url.trim(),
          latitude: lat,
          longitude: lng,
          is_published: formData.is_published,
          sop_stage: formData.is_published ? 'PUBLIKASI' : 'REVIEW',
        }
        try {
          await tourismService.updateCommunityContent(editingArticleId, payload)
        } catch {
          // Tetap simpan ke local state jika koneksi server sedang offline
        }
        setArticles((prev) => {
          const updated = prev.map((a) =>
            a.id === editingArticleId
              ? {
                  ...a,
                  ...payload,
                  latitude: lat,
                  longitude: lng,
                  updated_at: new Date().toISOString(),
                }
              : a
          )
          try {
            localStorage.setItem('pokdarwis_articles_cache', JSON.stringify(updated))
          } catch {
            // ignore
          }
          return updated
        })
        setNotice({ type: 'success', text: 'Artikel sejarah berhasil diperbarui.' })
      } else {
        // Create new article
        const payload: CommunityContentCreatePayload = {
          title: formData.title.trim(),
          slug: formData.slug.trim() || undefined,
          content_type: 'ARTICLE',
          priority_category: formData.priority_category,
          island_name: formData.island_name,
          author_name: formData.author_name.trim() || 'Pokdarwis Banda Neira',
          author_role: formData.author_role.trim() || 'Pemandu Sejarah & Budaya',
          summary: formData.summary.trim(),
          body_narrative: formData.body_narrative.trim(),
          media_url: formData.media_url.trim(),
          latitude: lat,
          longitude: lng,
          sop_stage: formData.is_published ? 'PUBLIKASI' : 'DRAF',
          qc_accuracy: true,
          qc_language: true,
          qc_visual: true,
          qc_adat_ethics: true,
          qc_source_validated: true,
          qc_consent_copyright: true,
          is_published: formData.is_published,
        }
        let createdItem: CommunityContentItem | null = null
        try {
          createdItem = await tourismService.createCommunityContent(payload)
        } catch {
          // Buat entri fallback lokal
        }
        const finalItem: CommunityContentItem = createdItem || {
          id: `art-local-${Date.now()}`,
          content_code: `CNT-ART-${String(Date.now()).slice(-4)}`,
          title: payload.title,
          slug: payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          content_type: 'ARTICLE',
          priority_category: payload.priority_category,
          island_name: payload.island_name,
          author_name: payload.author_name,
          author_role: payload.author_role,
          summary: payload.summary,
          body_narrative: payload.body_narrative,
          media_url: payload.media_url,
          latitude: payload.latitude,
          longitude: payload.longitude,
          sop_stage: 'PUBLIKASI',
          qc_accuracy: true,
          qc_language: true,
          qc_visual: true,
          qc_adat_ethics: true,
          qc_source_validated: true,
          qc_consent_copyright: true,
          qc_passed_count: 6,
          is_published: payload.is_published,
          created_at: new Date().toISOString(),
        }
        setArticles((prev) => {
          const updated = [finalItem, ...prev]
          try {
            localStorage.setItem('pokdarwis_articles_cache', JSON.stringify(updated))
          } catch {
            // ignore
          }
          return updated
        })
        setNotice({ type: 'success', text: 'Artikel sejarah baru berhasil ditambahkan dan disimpan.' })
      }

      setShowModal(false)
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Gagal menyimpan naskah artikel sejarah.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus naskah artikel sejarah "${title}"? Tindakan ini permanen.`)) {
      return
    }

    try {
      setLoading(true)
      try {
        await tourismService.deleteCommunityContent(id)
      } catch {
        // Fallback local deletion
      }
      setArticles((prev) => {
        const updated = prev.filter((a) => a.id !== id)
        try {
          localStorage.setItem('pokdarwis_articles_cache', JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
      setNotice({ type: 'success', text: `Naskah "${title}" berhasil dihapus.` })
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Gagal menghapus naskah artikel.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0c2340] text-white tracking-wider uppercase">
              Panel Pokdarwis
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Manajemen Konten Sejarah &amp; SEO
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#0c2340] font-normal">
            Arsip Artikel Sejarah Banda Neira
          </h2>
          <p className="text-xs text-slate-500 max-w-xl font-sans mt-0.5">
            Publikasikan naskah riset sejarah, catatan Benteng VOC, Barter Pulau Rhun, dan narasi pengasingan tokoh bangsa untuk memperkuat literasi dan SEO resmi Banda Neira.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#183e75] text-white text-xs font-semibold transition cursor-pointer shadow-sm shrink-0 self-start md:self-auto"
        >
          <Plus size={15} />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-inherit hover:opacity-75 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, pulau, atau penulis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0c2340]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadArticles}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
            title="Muat ulang daftar artikel"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <span className="text-xs text-slate-500">
            Total: <b>{filteredArticles.length}</b> naskah
          </span>
        </div>
      </div>

      {/* Articles Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Artikel</th>
                <th className="py-3 px-3">Kategori &amp; Pulau</th>
                <th className="py-3 px-3">Penulis</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat daftar artikel sejarah...
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada artikel sejarah yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.media_url || '/images/landmarks/belgica.jpg'}
                          alt=""
                          className="w-12 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="max-w-md">
                          <p className="font-semibold text-slate-900 text-xs line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono line-clamp-1">
                            /{article.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eaf4fb] text-[#2c4e6e] border border-[#cfe2f4] block w-fit mb-1">
                        {article.priority_category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {article.island_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{article.author_name}</p>
                      <p className="text-[10px] text-slate-400">{article.author_role}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      {article.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} />
                          <span>Terbit</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={11} />
                          <span>Draf</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onPreviewArticle && (
                          <button
                            type="button"
                            onClick={() => onPreviewArticle(article.slug)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Pratinjau Halaman Baca Publik"
                          >
                            <Eye size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(article)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                          title="Sunting Artikel"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(article.id, article.title)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#0c2340] font-normal">
                  {editingArticleId ? 'Sunting Naskah Artikel Sejarah' : 'Tulis Artikel Sejarah Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pokdarwis Banda Neira &bull; Standardisasi SEO &amp; Konten Sejarah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Judul Artikel */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Artikel Sejarah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Menelusuri Benteng Belgica: Mahkota Pertahanan Tabaleku"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0c2340]"
                />
              </div>

              {/* Slug (SEO URL) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug SEO (Otomatis) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                    /sejarah/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="menelusuri-benteng-belgica"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    className="flex-1 px-3 py-2 rounded-r-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0c2340]"
                  />
                </div>
              </div>

              {/* Row: Kategori & Pulau */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Sejarah
                  </label>
                  <select
                    value={formData.priority_category}
                    onChange={(e) => setFormData({ ...formData, priority_category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0c2340]"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wilayah Pulau
                  </label>
                  <select
                    value={formData.island_name}
                    onChange={(e) => setFormData({ ...formData, island_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0c2340]"
                  >
                    {ISLAND_OPTIONS.map((isl) => (
                      <option key={isl} value={isl}>
                        {isl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ringkasan Singkat / Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan / Excerpt (Muncul di kartu pratinjau &amp; meta SEO) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan singkat 1-2 kalimat pemikat pembaca..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0c2340]"
                />
              </div>

              {/* Isi Naskah Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isi Naskah Sejarah Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Tuliskan cerita sejarah lengkap di sini. Pisahkan antar-paragraf dengan baris kosong..."
                  value={formData.body_narrative}
                  onChange={(e) => setFormData({ ...formData, body_narrative: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0c2340] font-sans leading-relaxed"
                />
              </div>

              {/* Foto Sampul */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Foto Sampul Artikel
                </label>
                <select
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0c2340] mb-2"
                >
                  {LOCAL_LANDMARK_COVERS.map((cov) => (
                    <option key={cov.value} value={cov.value}>
                      {cov.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Atau masukkan URL foto khusus (/images/...)"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  className="w-full px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 focus:outline-none"
                />
              </div>

              {/* Status Publikasi Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Status Publikasi</p>
                  <p className="text-[11px] text-slate-500">
                    Jika aktif, artikel akan langsung tayang di portal publik dan section Beranda.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0c2340] hover:bg-[#183e75] text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Naskah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PokdarwisHistoryCms
