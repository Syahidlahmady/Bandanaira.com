import React, { useState, useMemo } from 'react'
import {
  HelpCircle,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Send,
  LifeBuoy,
  PhoneCall,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Wifi,
  Database,
  Smartphone,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Cpu,
} from 'lucide-react'
import { DashboardNavTab } from './dashboard/DashboardLayout'

export interface HelpDeskWorkspaceProps {
  currentUser?: any
  onNavigateTab?: (tab: DashboardNavTab) => void
  onOpenLanding?: () => void
  onOpenMarketplace?: () => void
}

interface FaqItem {
  id: string
  category: 'letters' | 'farming' | 'koperasi' | 'tourism' | 'blockchain' | 'offline'
  question: string
  answer: string
  targetTab?: DashboardNavTab
  keywords: string[]
}

interface GuideItem {
  id: string
  title: string
  category: string
  role: string
  description: string
  steps: string[]
  targetTab?: DashboardNavTab
}

interface SubmittedTicket {
  id: string
  category: string
  subject: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  status: 'Diterima' | 'Diproses'
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'letters',
    question: 'Bagaimana cara mengajukan Surat Keterangan Warga (SKCK/Domisili/Usaha)?',
    answer:
      'Warga dapat membuka menu "Permohonan Surat", memilih jenis surat yang dibutuhkan, melengkapi formulir identitas dan keperluan, kemudian menekan tombol "Kirim Permohonan". Berkas akan langsung masuk ke antrean verifikasi aparatur kantor desa secara real-time.',
    targetTab: 'letters',
    keywords: ['surat', 'keterangan', 'domisili', 'permohonan', 'pengajuan', 'nik'],
  },
  {
    id: 'faq-2',
    category: 'letters',
    question: 'Berapa lama estimasi waktu penerbitan surat resmi desa?',
    answer:
      'Sesuai Standar Layanan Aparatur (SLA) Pemerintah Desa Banda Neira, permohonan surat yang diajukan pada jam kerja (08.00 - 16.00 WIT) diproses dan ditandatangani dalam waktu rata-rata di bawah 2 jam. Surat resmi dilengkapi nomor registrasi dan kode validasi digital.',
    targetTab: 'letters',
    keywords: ['waktu', 'sla', 'lama', 'proses', 'tanda tangan', 'jam kerja'],
  },
  {
    id: 'faq-3',
    category: 'farming',
    question: 'Bagaimana cara mendaftarkan plot kebun pala baru dan memetakan poligon PostGIS?',
    answer:
      'Masuk ke ruang kerja "Plot Kebun GIS", tekan tombol "Tambah Plot Kebun", masukkan nama blok dan luas lahan. Anda dapat menggambar batas poligon koordinat spasial langsung di atas peta satelit beresolusi tinggi.',
    targetTab: 'farming',
    keywords: ['kebun', 'plot', 'gis', 'peta', 'poligon', 'pala', 'tanah'],
  },
  {
    id: 'faq-4',
    category: 'blockchain',
    question: 'Apa fungsi Verifikasi Batch Blockchain pada panen pala Banda?',
    answer:
      'Verifikasi Batch Blockchain mencatat hash kriptografis SHA-256 dari setiap lot panen pala dan fuli ke dalam buku besar publik terdesentralisasi (Ledger EVM). Ini menjamin keaslian asal-usul (provenance), sertifikasi Indikasi Geografis (GI), dan mencegah pemalsuan komoditas warisan Banda Neira.',
    targetTab: 'traceability',
    keywords: ['blockchain', 'verifikasi', 'batch', 'hash', 'pala', 'indikasi geografis', 'gi'],
  },
  {
    id: 'faq-5',
    category: 'offline',
    question: 'Apakah sistem dapat digunakan saat koneksi internet BTS pulau terputus?',
    answer:
      'Ya! Ekosistem Banda Digital dilengkapi arsitektur Progressive Web App (PWA) dan Antrean Sinkronisasi Lokal (IndexedDB). Anda tetap dapat mencatat data panen, transaksi koperasi kasir, atau draf surat. Begitu koneksi BTS terhubung kembali, sistem otomatis menyinkronkan data ke server pusat.',
    keywords: ['offline', 'internet', 'bts', 'sinyal', 'sinkronisasi', 'antrean', 'pwa'],
  },
  {
    id: 'faq-6',
    category: 'koperasi',
    question: 'Bagaimana cara melakukan transaksi belanja dan cetak struk kasir di Koperasi Hatta?',
    answer:
      'Petugas kasir membuka ruang kerja "Kasir Koperasi", memilih produk sembako atau pupuk pertanian dari katalog, memasukkan jumlah barang, memilih metode pembayaran (Tunai / Saldo Anggota), lalu menyelesaikan transaksi dengan opsi cetak struk nota belanja.',
    targetTab: 'koperasi',
    keywords: ['koperasi', 'kasir', 'struk', 'pos', 'belanja', 'sembako', 'transaksi'],
  },
  {
    id: 'faq-7',
    category: 'tourism',
    question: 'Bagaimana operator homestay memperbarui ketersediaan kamar dan fasilitas?',
    answer:
      'Operator homestay dapat mengakses ruang kerja "Pariwisata & Eco-Stay", memilih unit homestay miliknya, lalu memperbarui tarif per malam, kapasitas kamar, fasilitas ramah lingkungan, serta galeri foto.',
    targetTab: 'tourism',
    keywords: ['homestay', 'wisata', 'kamar', 'operator', 'eco-stay', 'booking'],
  },
  {
    id: 'faq-8',
    category: 'blockchain',
    question: 'Di mana pembeli atau wisatawan dapat memverifikasi QR Code produk pala kemasan?',
    answer:
      'Di halaman beranda utama atau marketplace, pembeli cukup menekan tombol "Verifikasi Produk" lalu memasukkan kode token batch (contoh: PALA-BN-2026-A1). Sistem akan menampilkan tanggal petik pohon, nama petani pemilik kebun, elevasi tanah vulkanik, dan nomor sertifikat GI.',
    targetTab: 'marketplace',
    keywords: ['qr', 'verifikasi', 'keaslian', 'kemasan', 'sertifikat', 'wisatawan'],
  },
]

const GUIDES: GuideItem[] = [
  {
    id: 'g-1',
    title: 'Alur Penerbitan Surat Keterangan Warga Desa',
    category: 'Kependudukan & Surat',
    role: 'Warga & Aparatur Desa',
    description: 'Panduan lengkap dari pengajuan mandiri oleh warga hingga verifikasi aparatur dan pencetakan berkas.',
    steps: [
      'Warga login ke portal dan membuka menu "Permohonan Surat".',
      'Pilih klasifikasi surat (Surat Pengantar SKCK, Keterangan Usaha, Domisili, atau Keterangan Belum Menikah).',
      'Lengkapi formulir keperluan dan periksa kesesuaian data NIK otomatis.',
      'Aparatur desa menerima notifikasi di tab "Kotak Masuk Surat" dan meninjau berkas.',
      'Aparatur menyetujui permohonan dengan satu klik untuk membubuhkan nomor registrasi resmi.',
      'Warga atau petugas dapat mencetak berkas berstandar format resmi A4 Pemerintah Kabupaten Maluku Tengah.',
    ],
    targetTab: 'letters',
  },
  {
    id: 'g-2',
    title: 'Protokol Pencatatan Panen & Grading Mutu Biji Pala',
    category: 'Pertanian & Mutu',
    role: 'Petani & Kelompok Tani',
    description: 'Standar Operasional Prosedur (SOP) sortasi mutu pala ekspor Indikasi Geografis Banda.',
    steps: [
      'Kumpulkan hasil panen pala dari pohon induk terdaftar di plot GIS.',
      'Buka ruang kerja "Panen & Batch Blockchain", pilih blok kebun asal.',
      'Timbang berat kotor gelondong dan catat kadar air awal.',
      'Lakukan pemilahan grade: Grade A (Utuh > 8g, kadar air < 10%), Grade B (Kecil/Mulus), Grade C (Pecah/Penyulingan).',
      'Kunci batch panen dan terbitkan identitas unik lot untuk verifikasi blockchain.',
    ],
    targetTab: 'traceability',
  },
  {
    id: 'g-3',
    title: 'Manajemen Kasir POS & Rekap Kas Koperasi Desa',
    category: 'Keuangan & Koperasi',
    role: 'Pengelola Koperasi Hatta',
    description: 'Tata cara pencatatan transaksi kasir, inventaris barang, dan laporan penjualan harian.',
    steps: [
      'Buka workspace "Kasir Koperasi" pada awal shift kerja kasir.',
      'Gunakan pemindai atau pencarian cepat nama produk untuk memasukkan item ke keranjang.',
      'Pilih profil pembeli (Anggota Koperasi berhak atas SHU atau Pelanggan Umum).',
      'Pilih metode pembayaran dan konfirmasi nominal pembayaran diterima.',
      'Cetak bukti struk pembayaran dan pantau ringkasan saldo kas pada barometer keuangan harian.',
    ],
    targetTab: 'koperasi',
  },
  {
    id: 'g-4',
    title: 'Penanganan Kondisi Darurat Jaringan (Offline Sync)',
    category: 'Teknis & Infrastruktur',
    role: 'Semua Pengguna',
    description: 'Panduan mempertahankan integritas data operasional kepulauan saat sinyal seluler padam.',
    steps: [
      'Pastikan aplikasi tetap terbuka di peramban (browser) yang mendukung cache PWA.',
      'Lakukan pengisian data seperti biasa; sistem otomatis menampilkan indikator "Mode Offline Aktif".',
      'Setiap perubahan disimpan aman di ruang penyimpanan browser terenkripsi (IndexedDB).',
      'Ketika sinyal BTS pulih, periksa ikon sinkronisasi di bilah atas.',
      'Klik "Sinkronkan Sekarang" jika ingin memicu pengiriman data antrean secara instan.',
    ],
  },
]

export const HelpDeskWorkspace: React.FC<HelpDeskWorkspaceProps> = ({
  currentUser: _currentUser,
  onNavigateTab,
  onOpenLanding,
  onOpenMarketplace: _onOpenMarketplace,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'faq' | 'guides' | 'ticket' | 'diagnostics'>('faq')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1')
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('g-1')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({})

  // Form Tiket
  const [ticketCategory, setTicketCategory] = useState('surat')
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [ticketPhone, setTicketPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<SubmittedTicket | null>(null)
  const [myTickets, setMyTickets] = useState<SubmittedTicket[]>([
    {
      id: 'TKT-BN-2026-089',
      category: 'Kependudukan & Surat',
      subject: 'Klarifikasi status pengantar surat domisili RT 02 Neira',
      priority: 'medium',
      timestamp: '2026-11-22 14:30 WIT',
      status: 'Diproses',
    },
  ])

  // Diagnostik status
  const [isTestingDiag, setIsTestingDiag] = useState(false)
  const [diagTested, setDiagTested] = useState(false)

  // Filter FAQ
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((f) => {
      const matchCat = selectedCategory === 'all' || f.category === selectedCategory
      const matchQuery =
        !searchQuery.trim() ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchQuery
    })
  }, [selectedCategory, searchQuery])

  // Filter Guides
  const filteredGuides = useMemo(() => {
    return GUIDES.filter((g) => {
      const matchQuery =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchQuery
    })
  }, [searchQuery])

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }))
  }

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDescription.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const newTicket: SubmittedTicket = {
        id: `TKT-BN-2026-${Math.floor(100 + Math.random() * 900)}`,
        category:
          ticketCategory === 'surat'
            ? 'Kependudukan & Surat'
            : ticketCategory === 'kebun'
            ? 'Pertanian & Plot GIS'
            : ticketCategory === 'koperasi'
            ? 'Kasir & Transaksi Koperasi'
            : ticketCategory === 'offline'
            ? 'Konektivitas & Sinkronisasi'
            : 'Dukungan Umum',
        subject: ticketSubject.trim(),
        priority: ticketPriority,
        timestamp: 'Baru saja',
        status: 'Diterima',
      }

      setMyTickets((prev) => [newTicket, ...prev])
      setSubmitSuccess(newTicket)
      setIsSubmitting(false)
      setTicketSubject('')
      setTicketDescription('')
      setTicketPhone('')
    }, 700)
  }

  const handleRunDiagnostic = () => {
    setIsTestingDiag(true)
    setTimeout(() => {
      setIsTestingDiag(false)
      setDiagTested(true)
    }, 1200)
  }

  return (
    <div className="w-full space-y-6 pb-16 font-sans">
      {/* 1. HEADER BANNER UTAMA */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/40 via-sky-50/20 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shadow-md shrink-0">
              <LifeBuoy size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Layanan Dukungan Terpadu Kepulauan
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#081D35] tracking-tight">
                Pusat Bantuan &amp; Panduan Sistem Ekosistem
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
                Repositori tanya jawab resmi (FAQ), Standar Operasional Prosedur (SOP) modul ruang kerja, tiket aduan kendala teknis, serta diagnostik perangkat digital Banda Neira.
              </p>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('ticket')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#F4B75E] hover:from-amber-400 hover:to-[#f6c276] text-[#081D35] text-xs sm:text-sm font-bold shadow-xs hover:shadow-[0_0_15px_rgba(244,183,94,0.35)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send size={15} />
              <span>Kirim Tiket Aduan</span>
            </button>
            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink size={15} />
                <span>Portal Beranda</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. 4 TOP BENTO BAROMETER METRIK STATUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status Sistem */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Infrastruktur Jaringan
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-emerald-700">100% AKTIF</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">4 Stasiun IoT &amp; SWRO Normal</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 2: Panduan Ruang Kerja */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Modul Dokumentasi
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-[#081D35]">14 Ruang Kerja</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">SOP 10 Peran Warga &amp; Aparatur</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
        </div>

        {/* Card 3: Tanya Jawab Resmi */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Artikel Bantuan (FAQ)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-sky-800">28 Topik Valid</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pemerintah Desa &amp; Pokdarwis</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <HelpCircle size={22} />
          </div>
        </div>

        {/* Card 4: Waktu Respon SLA */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Respon Aduan Warga
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-purple-800">&lt; 15 Menit</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Jam Layanan 08:00 - 16:00 WIT</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* 3. SEARCH BAR PENCARIAN PUSAT BANTUAN */}
      <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="relative flex items-center w-full">
          <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan, panduan surat, grading pala, verifikasi blockchain, atau masalah teknis..."
            className="w-full h-12 pl-11 pr-24 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/15 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1">Kategori:</span>
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'letters', label: 'Surat & Warga' },
            { id: 'farming', label: 'Kebun & Petani' },
            { id: 'blockchain', label: 'Blockchain & Mutu' },
            { id: 'koperasi', label: 'Kasir Koperasi' },
            { id: 'tourism', label: 'Pariwisata' },
            { id: 'offline', label: 'Offline Sync' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#081D35] text-[#F4B75E] shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SUB-TAB SEGMENTED NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'faq', label: 'Tanya Jawab (FAQ)', icon: HelpCircle, count: filteredFaqs.length },
            { id: 'guides', label: 'Panduan Modul SOP', icon: BookOpen, count: filteredGuides.length },
            { id: 'ticket', label: 'Tiket Aduan & Bantuan', icon: Send, count: myTickets.length },
            { id: 'diagnostics', label: 'Diagnostik Jaringan', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#081D35] text-[#081D35]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#F4B75E]' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-[#081D35] text-[#F4B75E]' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. KONTEN TAB */}

      {/* TAB 1: FAQ ACCORDION */}
      {activeSubTab === 'faq' && (
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Tidak ada pertanyaan yang sesuai</h3>
              <p className="text-xs text-slate-400 mt-1">
                Coba ubah kata kunci pencarian atau gunakan kategori "Semua Kategori".
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id
              const isCopied = copiedId === faq.id
              const feedback = helpfulFeedback[faq.id]

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all border ${
                    isExpanded
                      ? 'bg-white border-[#081D35]/30 shadow-sm ring-1 ring-[#081D35]/10'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isExpanded
                            ? 'bg-[#081D35] text-[#F4B75E]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <HelpCircle size={16} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                          {faq.category === 'letters'
                            ? 'Surat & Warga'
                            : faq.category === 'farming'
                            ? 'Kebun & Pertanian'
                            : faq.category === 'blockchain'
                            ? 'Blockchain & GI'
                            : faq.category === 'koperasi'
                            ? 'Kasir Koperasi'
                            : faq.category === 'tourism'
                            ? 'Pariwisata'
                            : 'Offline Sync'}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#081D35] mt-0.5">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isExpanded ? 'rotate-180 text-[#081D35]' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-sm text-slate-600 space-y-4 animate-in fade-in duration-150">
                      <p className="leading-relaxed">{faq.answer}</p>

                      {/* Action Bar inside Accordion */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        {/* Direct Jump to Target Workspace */}
                        {faq.targetTab && onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab(faq.targetTab!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors cursor-pointer"
                          >
                            <span>Buka Ruang Kerja Terkait</span>
                            <ChevronRight size={14} />
                          </button>
                        )}

                        <div className="flex items-center gap-3 ml-auto">
                          {/* Salin Jawaban */}
                          <button
                            type="button"
                            onClick={() => handleCopyText(`${faq.question}\n\n${faq.answer}`, faq.id)}
                            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check size={13} className="text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Salin Teks</span>
                              </>
                            )}
                          </button>

                          {/* Feedback Bermanfaat */}
                          <div className="inline-flex items-center gap-1 pl-3 border-l border-slate-200">
                            <span className="text-slate-400 text-[11px] mr-1">Membantu?</span>
                            <button
                              type="button"
                              onClick={() => handleFeedback(faq.id, true)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                feedback === true
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'hover:bg-slate-100 text-slate-400'
                              }`}
                              title="Ya, jawaban ini membantu"
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(faq.id, false)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                feedback === false
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'hover:bg-slate-100 text-slate-400'
                              }`}
                              title="Tidak membantu"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* TAB 2: PANDUAN MODUL SOP */}
      {activeSubTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => {
            const isExpanded = expandedGuideId === guide.id
            return (
              <div
                key={guide.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                      {guide.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{guide.role}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#081D35] mt-2">{guide.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{guide.description}</p>

                  {/* Langkah-langkah */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tahapan Prosedur ({guide.steps.length} Langkah):
                    </div>
                    <ol className="space-y-1.5 text-xs text-slate-600">
                      {guide.steps.slice(0, isExpanded ? undefined : 3).map((st, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-[#081D35] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{st}</span>
                        </li>
                      ))}
                    </ol>

                    {guide.steps.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors pt-1 cursor-pointer"
                      >
                        {isExpanded ? 'Tutup langkah selengkapnya' : `Lihat ${guide.steps.length - 3} langkah lanjutan...`}
                      </button>
                    )}
                  </div>
                </div>

                {guide.targetTab && onNavigateTab && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onNavigateTab(guide.targetTab!)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#081D35] text-[#081D35] hover:text-[#F4B75E] text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>Buka Halaman Ruang Kerja</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 3: TIKET ADUAN & BANTUAN */}
      {activeSubTab === 'ticket' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Form Pengajuan */}
          <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#081D35]">Formulir Pengajuan Tiket Aduan &amp; Dukungan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Laporkan kendala sistem, data kependudukan, plot GIS kebun, atau pertanyaan operasional desa langsung ke Tim Dukungan Kepulauan.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Tiket Berhasil Terkirim: {submitSuccess.id}
                </div>
                <p>
                  Laporan Anda telah tercatat pada buku aduan digital dengan status <strong>{submitSuccess.status}</strong>. Tim petugas akan menindaklanjuti dalam waktu &lt; 15 menit melalui nomor kontak Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="font-bold underline hover:no-underline cursor-pointer"
                >
                  Tutup Notifikasi
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Masalah</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#081D35]"
                  >
                    <option value="surat">Kependudukan &amp; Permohonan Surat</option>
                    <option value="kebun">Plot Kebun &amp; Pemetaan GIS</option>
                    <option value="blockchain">Panen &amp; Sertifikat Blockchain</option>
                    <option value="koperasi">Kasir &amp; Transaksi Koperasi</option>
                    <option value="offline">Sinyal BTS &amp; Sinkronisasi Offline</option>
                    <option value="lainnya">Pertanyaan Umum Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Urgensi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Rendah' },
                      { id: 'medium', label: 'Sedang' },
                      { id: 'high', label: 'Mendesak' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTicketPriority(p.id as any)}
                        className={`h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          ticketPriority === p.id
                            ? p.id === 'high'
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : 'bg-[#081D35] border-[#081D35] text-[#F4B75E]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Pokok Permasalahan</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Contoh: Kendala mengunduh draf SKCK pada peramban ponsel"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / Kontak Pemohon</label>
                <input
                  type="text"
                  value={ticketPhone}
                  onChange={(e) => setTicketPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890 (Untuk konfirmasi status tindak lanjut)"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uraian Rinci Kendala</label>
                <textarea
                  rows={4}
                  required
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Jelaskan secara detail apa yang terjadi, langkah yang telah dilakukan, atau pesan kesalahan yang muncul..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#081D35] hover:bg-[#0f2c59] text-[#F4B75E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#F4B75E] border-t-transparent animate-spin" />
                    <span>Mendaftarkan Tiket...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Kirim Tiket Aduan Sekarang</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Daftar Tiket Saya & Kontak Cepat */}
          <div className="space-y-4">
            {/* Daftar Tiket */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-[#081D35] mb-3 flex items-center justify-between">
                <span>Tiket Aduan Aktif</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600">
                  {myTickets.length} Terdaftar
                </span>
              </h3>

              <div className="space-y-2.5">
                {myTickets.map((tkt) => (
                  <div key={tkt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-amber-800">{tkt.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                        {tkt.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs leading-snug">{tkt.subject}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>{tkt.category}</span>
                      <span>{tkt.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posko Kontak Langsung */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#081D35] to-[#0F2C59] text-white shadow-md space-y-3">
              <h3 className="text-sm font-bold text-[#F4B75E] flex items-center gap-2">
                <PhoneCall size={16} />
                <span>Kontak Posko Darurat Desa</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Butuh bantuan mendesak di luar sistem digital? Anda dapat menghubungi langsung aparatur kantor desa:
              </p>
              <div className="space-y-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Kantor Desa Banda Neira</div>
                    <div className="text-[11px] text-slate-300">Jl. Pelabuhan Nusantara, Neira</div>
                  </div>
                  <span className="text-[11px] text-[#F4B75E] font-bold">08:00 - 16:00 WIT</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Call Center WhatsApp</div>
                    <div className="text-[11px] text-slate-300">+62 812-4099-2026</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIAGNOSTIK JARINGAN & PERANGKAT */}
      {activeSubTab === 'diagnostics' && (
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#081D35]">Pemeriksaan Diagnostik Mandiri Sistem</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Uji kompatibilitas peramban, sinkronisasi offline cache, dan respon layanan API ekosistem Banda Digital.
              </p>
            </div>
            <button
              type="button"
              disabled={isTestingDiag}
              onClick={handleRunDiagnostic}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#081D35] hover:bg-[#0f2c59] text-[#F4B75E] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} className={isTestingDiag ? 'animate-spin' : ''} />
              <span>{isTestingDiag ? 'Menguji Sistem...' : 'Jalankan Tes Diagnostik'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {/* Status 1: Konektivitas */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wifi size={14} className="text-emerald-600" />
                  Konektivitas Jaringan BTS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Terhubung
                </span>
              </div>
              <p className="text-xs text-slate-500">Protokol HTTPS / WebSocket Aktif (Latensi ~48ms).</p>
            </div>

            {/* Status 2: IndexedDB Local Cache */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Database size={14} className="text-sky-600" />
                  Cache Offline PWA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                  Normal (2.8 MB)
                </span>
              </div>
              <p className="text-xs text-slate-500">Peta offline dan draf formulir tersimpan siap pakai.</p>
            </div>

            {/* Status 3: GPS Geolocation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-purple-600" />
                  Sensor GPS Perangkat
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  Tersedia
                </span>
              </div>
              <p className="text-xs text-slate-500">Koordinat akurat untuk pemetaan plot kebun PostGIS.</p>
            </div>

            {/* Status 4: API Gateway */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu size={14} className="text-amber-600" />
                  API Backend Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  FastAPI v0.110 Online
                </span>
              </div>
              <p className="text-xs text-slate-500">Modul Kependudukan, Pertanian, dan Koperasi aktif.</p>
            </div>

            {/* Status 5: Ledger Blockchain */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-teal-600" />
                  Ledger EVM Traceability
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Sinkron (Block #1982)
                </span>
              </div>
              <p className="text-xs text-slate-500">Integritas hash sertifikat GI terlindungi kriptografi.</p>
            </div>

            {/* Status 6: Versi Web */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  Rilis Versi Sistem
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                  v2.6.4-prod
                </span>
              </div>
              <p className="text-xs text-slate-500">Mendukung standar PWA dan ServiceWorker modern.</p>
            </div>
          </div>

          {diagTested && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Uji Diagnostik Selesai:</span> Seluruh 6 modul layanan utama beroperasi normal tanpa anomali. Perangkat siap digunakan untuk pelayanan warga dan operasional komoditas.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HelpDeskWorkspace
