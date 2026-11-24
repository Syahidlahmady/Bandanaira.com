import React, { useState, useMemo, useEffect } from 'react'
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Send,
  PhoneCall,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Users,
  FileText,
  Package,
  UserCheck,
  TrendingUp,
  CreditCard,
  PlaySquare,
  MessageSquare,
  Mail,
  Phone,
  Plus,
  Edit2,
  Trash2,
  X,
  Settings,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { DashboardNavTab } from './dashboard/DashboardLayout'

export interface HelpDeskWorkspaceProps {
  currentUser?: any
  onNavigateTab?: (tab: DashboardNavTab) => void
  onOpenLanding?: () => void
  onOpenMarketplace?: () => void
}

export type HelpDeskCategoryId =
  | 'community'
  | 'orders'
  | 'returns'
  | 'account'
  | 'business'
  | 'payment'
  | 'guides'
  | 'faq'

export interface CategoryCardMeta {
  id: HelpDeskCategoryId
  title: string
  subtopics: string[]
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconBg: string
  iconColor: string
  description: string
}

export interface FaqItem {
  id: string
  category: HelpDeskCategoryId
  question: string
  answer: string
  tags: string[]
  targetTab?: DashboardNavTab
  keywords: string[]
  isCustom?: boolean
  updatedAt?: string
}

export interface ContactSettings {
  phone: string
  email: string
  whatsapp: string
  heroTitle: string
  heroSubtitle: string
}

export interface SubmittedTicket {
  id: string
  category: string
  subject: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  status: 'Diterima' | 'Diproses' | 'Selesai'
  phone?: string
  description: string
}

// 8 Kategori Standar sesuai Layout Referensi Gambar (2x4 Grid)
export const HELP_CATEGORIES: CategoryCardMeta[] = [
  {
    id: 'community',
    title: 'Community',
    subtopics: ['Share', 'Discussion', 'Network'],
    icon: Users,
    iconBg: 'bg-indigo-50 hover:bg-indigo-100/80',
    iconColor: 'text-indigo-600',
    description: 'Forum musyawarah warga, profil dusun, dan keterlibatan komunitas kepulauan.',
  },
  {
    id: 'orders',
    title: 'Orders',
    subtopics: ['Tracking', 'Delivery', 'Management'],
    icon: FileText,
    iconBg: 'bg-blue-50 hover:bg-blue-100/80',
    iconColor: 'text-blue-600',
    description: 'Pelayanan berkas kependudukan, tracking permohonan surat resmi, dan legalitas desa.',
  },
  {
    id: 'returns',
    title: 'Return and Refund',
    subtopics: ['Methods', 'Process'],
    icon: Package,
    iconBg: 'bg-violet-50 hover:bg-violet-100/80',
    iconColor: 'text-violet-600',
    description: 'Sortasi mutu panen pala, verifikasi lot blockchain, dan retur komoditas pergudangan.',
  },
  {
    id: 'account',
    title: 'Account Issues',
    subtopics: ['Profile', 'Settings', 'Password'],
    icon: UserCheck,
    iconBg: 'bg-sky-50 hover:bg-sky-100/80',
    iconColor: 'text-sky-600',
    description: 'Akses akun warga terenkripsi AES, pemulihan sandi, dan validasi NIK kependudukan.',
  },
  {
    id: 'business',
    title: 'Business Help',
    subtopics: ['Dashboard', 'Reports', 'Logistics'],
    icon: TrendingUp,
    iconBg: 'bg-emerald-50 hover:bg-emerald-100/80',
    iconColor: 'text-emerald-600',
    description: 'Plot kebun pala spasial PostGIS, rekap kelompok tani, dan analitik produktivitas.',
  },
  {
    id: 'payment',
    title: 'Payment',
    subtopics: ['Methods', 'VAT', 'Security'],
    icon: CreditCard,
    iconBg: 'bg-amber-50 hover:bg-amber-100/80',
    iconColor: 'text-amber-700',
    description: 'Kasir POS Koperasi Hatta, nota digital sembako, tabungan warga, dan air bersih SWRO.',
  },
  {
    id: 'guides',
    title: 'Guides',
    subtopics: ['Tutorials', 'Blogs', 'Newsletters'],
    icon: PlaySquare,
    iconBg: 'bg-rose-50 hover:bg-rose-100/80',
    iconColor: 'text-rose-600',
    description: 'Video panduan penggunaan, SOP alur modul aparatur, dan buletin ekosistem Banda.',
  },
  {
    id: 'faq',
    title: 'FAQ',
    subtopics: ['Help', 'Articles'],
    icon: HelpCircle,
    iconBg: 'bg-cyan-50 hover:bg-cyan-100/80',
    iconColor: 'text-cyan-700',
    description: 'Tanya jawab operasional kepulauan, arsitektur offline PWA, dan penanganan kendala.',
  },
]

const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  phone: '+62 812 4099 2026',
  email: 'bantuan@bandanaira.id',
  whatsapp: 'https://wa.me/6281240992026?text=Halo%20Pusat%20Bantuan%20Banda%20Neira',
  heroTitle: 'Help Center',
  heroSubtitle:
    'Temukan panduan dan solusi cepat untuk berbagai pertanyaan di delapan kategori ekosistem. Mulai dari layanan warga, permohonan surat, pelacakan panen, hingga tata cara transaksi koperasi. Tim bantuan kami siap melayani Anda.',
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'orders',
    question: 'Bagaimana cara mengajukan Surat Keterangan Warga (SKCK/Domisili/Usaha)?',
    answer:
      'Warga dapat membuka menu "Permohonan Surat", memilih jenis surat yang dibutuhkan, melengkapi formulir identitas dan keperluan, kemudian menekan tombol "Kirim Permohonan". Berkas akan langsung masuk ke antrean verifikasi aparatur kantor desa secara real-time dengan nomor registrasi unik.',
    tags: ['Permohonan', 'Surat Desa', 'Tracking Berkas'],
    targetTab: 'letters',
    keywords: ['surat', 'keterangan', 'domisili', 'skck', 'permohonan', 'pengajuan', 'nik', 'orders'],
  },
  {
    id: 'faq-2',
    category: 'orders',
    question: 'Berapa lama estimasi waktu penerbitan surat resmi desa?',
    answer:
      'Sesuai Standar Layanan Aparatur (SLA) Pemerintah Desa Banda Neira, permohonan surat yang diajukan pada jam kerja (08.00 - 16.00 WIT) diproses dan ditandatangani dalam waktu rata-rata di bawah 2 jam. Surat resmi dilengkapi nomor registrasi dan kode validasi digital.',
    tags: ['SLA Waktu', 'Legalitas', 'Jam Kerja'],
    targetTab: 'letters',
    keywords: ['waktu', 'sla', 'lama', 'proses', 'tanda tangan', 'jam kerja', 'orders'],
  },
  {
    id: 'faq-3',
    category: 'business',
    question: 'Bagaimana cara mendaftarkan plot kebun pala baru dan memetakan poligon PostGIS?',
    answer:
      'Masuk ke ruang kerja "Plot Kebun GIS", tekan tombol "Tambah Plot Kebun", masukkan nama blok dan luas lahan. Anda dapat menggambar batas poligon koordinat spasial langsung di atas peta satelit beresolusi tinggi.',
    tags: ['Plot Kebun', 'GIS Spasial', 'Kelompok Tani'],
    targetTab: 'farming',
    keywords: ['kebun', 'plot', 'gis', 'peta', 'poligon', 'pala', 'tanah', 'business'],
  },
  {
    id: 'faq-4',
    category: 'returns',
    question: 'Apa fungsi Verifikasi Batch Blockchain pada panen pala Banda?',
    answer:
      'Verifikasi Batch Blockchain mencatat hash kriptografis SHA-256 dari setiap lot panen pala dan fuli ke dalam buku besar publik terdesentralisasi (Ledger EVM). Ini menjamin keaslian asal-usul (provenance), sertifikasi Indikasi Geografis (GI), dan mencegah pemalsuan komoditas warisan Banda Neira.',
    tags: ['Blockchain', 'Batch Lot', 'Indikasi Geografis'],
    targetTab: 'traceability',
    keywords: ['blockchain', 'verifikasi', 'batch', 'hash', 'pala', 'indikasi geografis', 'gi', 'returns'],
  },
  {
    id: 'faq-5',
    category: 'account',
    question: 'Bagaimana keamanan data NIK dan privasi identitas warga dijamin?',
    answer:
      'Seluruh data kependudukan sensitif (NIK, nomor KK, nomor kontak, dan alamat detail) dienkripsi dengan standar AES-256 di database terproteksi. Data yang dicatat pada blockchain bersifat Zero-PII (hanya hash kriptografis pembuktian transaksi tanpa identitas pribadi).',
    tags: ['Enkripsi AES', 'Zero PII', 'Keamanan Akun'],
    targetTab: 'population',
    keywords: ['nik', 'privasi', 'keamanan', 'enkripsi', 'aes', 'akun', 'password', 'account'],
  },
  {
    id: 'faq-6',
    category: 'payment',
    question: 'Bagaimana cara transaksi belanja dan pencatatan kasir di Koperasi Hatta?',
    answer:
      'Petugas kasir membuka ruang kerja "Kasir Koperasi", memilih produk sembako atau pupuk pertanian dari katalog, memasukkan jumlah barang, memilih metode pembayaran (Tunai / Saldo Anggota), lalu menyelesaikan transaksi dengan opsi cetak struk nota belanja.',
    tags: ['Kasir POS', 'Nota Belanja', 'Saldo Anggota'],
    targetTab: 'koperasi',
    keywords: ['koperasi', 'kasir', 'struk', 'pos', 'belanja', 'sembako', 'transaksi', 'payment'],
  },
  {
    id: 'faq-7',
    category: 'community',
    question: 'Bagaimana warga dapat berpartisipasi dalam musyawarah dan keterlibatan komunitas?',
    answer:
      'Warga dapat memantau agenda musyawarah dusun, transparansi anggaran desa, serta program gotong royong melalui ruang kerja Kependudukan & Komunitas. Setiap aspirasi dapat diajukan secara resmi dan terverifikasi oleh ketua RT/RW setempat.',
    tags: ['Musyawarah', 'Aspirasi Warga', 'Dusun'],
    targetTab: 'population',
    keywords: ['komunitas', 'warga', 'musyawarah', 'dusun', 'aspirasi', 'community'],
  },
  {
    id: 'faq-8',
    category: 'guides',
    question: 'Apakah sistem dapat digunakan saat koneksi internet BTS pulau terputus?',
    answer:
      'Ya! Ekosistem Banda Digital dilengkapi arsitektur Progressive Web App (PWA) dan Antrean Sinkronisasi Lokal (IndexedDB). Anda tetap dapat mencatat data panen, transaksi koperasi kasir, atau draf surat. Begitu koneksi BTS terhubung kembali, sistem otomatis menyinkronkan data ke server pusat.',
    tags: ['Offline PWA', 'IndexedDB', 'Auto Sync'],
    keywords: ['offline', 'internet', 'bts', 'sinyal', 'sinkronisasi', 'antrean', 'pwa', 'guides'],
  },
  {
    id: 'faq-9',
    category: 'faq',
    question: 'Di mana pembeli atau wisatawan dapat memverifikasi QR Code keaslian pala kemasan?',
    answer:
      'Di halaman beranda utama atau katalog marketplace, pembeli cukup menekan tombol "Verifikasi Produk" lalu memasukkan kode token batch (contoh: PALA-BN-2026-A1). Sistem akan menampilkan tanggal petik pohon, nama petani pemilik kebun, elevasi tanah vulkanik, dan sertifikat GI.',
    tags: ['QR Verifikasi', 'Traceability', 'Kemasan'],
    targetTab: 'marketplace',
    keywords: ['qr', 'verifikasi', 'keaslian', 'kemasan', 'sertifikat', 'wisatawan', 'faq'],
  },
]

const STORAGE_KEY_FAQS = 'banda_helpdesk_faqs'
const STORAGE_KEY_CONTACT = 'banda_helpdesk_contact'
const STORAGE_KEY_TICKETS = 'banda_helpdesk_tickets'

export const HelpDeskWorkspace: React.FC<HelpDeskWorkspaceProps> = ({
  currentUser,
  onNavigateTab,
  onOpenLanding,
  onOpenMarketplace: _onOpenMarketplace,
}) => {
  // Verifikasi role Administrator
  const isAdmin = useMemo(() => {
    if (!currentUser) return false
    if (currentUser.is_superuser) return true
    const role = currentUser.role || ''
    const roles: string[] = Array.isArray(currentUser.roles) ? currentUser.roles : []
    return (
      role === 'admin' ||
      role === 'village_officer' ||
      role === 'superadmin' ||
      roles.includes('admin') ||
      roles.includes('village_officer')
    )
  }, [currentUser])

  // State Kontak & Hero Info
  const [contactInfo, setContactInfo] = useState<ContactSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTACT)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return DEFAULT_CONTACT_SETTINGS
  })

  // State Daftar FAQ (tersimpan di localStorage)
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAQS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback
    }
    return DEFAULT_FAQS
  })

  // Mode Tampilan: 'user' (Help Center Publik) atau 'admin_cms' (Kelola Informasi)
  const [activeMode, setActiveMode] = useState<'user' | 'admin_cms'>('user')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<HelpDeskCategoryId | 'all'>('all')
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({})

  // Support Modal State (Chat with Support)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)

  // Formulir Pengajuan Tiket Dukungan Warga
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketCategory, setTicketCategory] = useState<HelpDeskCategoryId>('orders')
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [ticketPhone, setTicketPhone] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const [ticketSuccess, setTicketSuccess] = useState<SubmittedTicket | null>(null)
  const [tickets, setTickets] = useState<SubmittedTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return [
      {
        id: 'TKT-BN-2026-089',
        category: 'Orders',
        subject: 'Klarifikasi status pengantar surat domisili RT 02 Neira',
        priority: 'medium',
        timestamp: '2026-11-24 10:15 WIT',
        status: 'Diproses',
        description: 'Menunggu tanda tangan digital kepala seksi pelayanan kependudukan.',
      },
    ]
  })

  // Formulir Admin CMS: Tambah / Edit FAQ
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [faqFormQuestion, setFaqFormQuestion] = useState('')
  const [faqFormCategory, setFaqFormCategory] = useState<HelpDeskCategoryId>('community')
  const [faqFormTags, setFaqFormTags] = useState('')
  const [faqFormAnswer, setFaqFormAnswer] = useState('')
  const [faqFormTargetTab, setFaqFormTargetTab] = useState<DashboardNavTab | ''>('')
  const [faqFormKeywords, setFaqFormKeywords] = useState('')
  const [cmsSaveAlert, setCmsSaveAlert] = useState<string | null>(null)

  // Formulir Admin CMS: Pengaturan Kontak
  const [editPhone, setEditPhone] = useState(contactInfo.phone)
  const [editEmail, setEditEmail] = useState(contactInfo.email)
  const [editWhatsapp, setEditWhatsapp] = useState(contactInfo.whatsapp)
  const [editHeroTitle, setEditHeroTitle] = useState(contactInfo.heroTitle)
  const [editHeroSubtitle, setEditHeroSubtitle] = useState(contactInfo.heroSubtitle)

  // Diagnostics State
  const [isTestingDiag, setIsTestingDiag] = useState(false)
  const [diagTested, setDiagTested] = useState(false)

  // Simpan FAQ ke LocalStorage setiap ada perubahan
  const saveFaqsToStorage = (updatedFaqs: FaqItem[]) => {
    setFaqs(updatedFaqs)
    try {
      localStorage.setItem(STORAGE_KEY_FAQS, JSON.stringify(updatedFaqs))
      window.dispatchEvent(new Event('banda_helpdesk_faqs_updated'))
    } catch (err) {
      console.error('Failed to save FAQs', err)
    }
  }

  // Simpan Kontak ke LocalStorage
  const saveContactToStorage = (updatedContact: ContactSettings) => {
    setContactInfo(updatedContact)
    try {
      localStorage.setItem(STORAGE_KEY_CONTACT, JSON.stringify(updatedContact))
      window.dispatchEvent(new Event('banda_helpdesk_contact_updated'))
    } catch (err) {
      console.error('Failed to save contact settings', err)
    }
  }

  // Sinkronisasi antar-tab browser via Storage Event
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedFaqs = localStorage.getItem(STORAGE_KEY_FAQS)
        if (savedFaqs) setFaqs(JSON.parse(savedFaqs))

        const savedContact = localStorage.getItem(STORAGE_KEY_CONTACT)
        if (savedContact) setContactInfo(JSON.parse(savedContact))
      } catch {
        // ignore
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Filter FAQ berdasarkan pencarian dan kategori terpilih
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory
      if (!matchCategory) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const inQuestion = faq.question.toLowerCase().includes(q)
      const inAnswer = faq.answer.toLowerCase().includes(q)
      const inTags = faq.tags.some((t) => t.toLowerCase().includes(q))
      const inKeywords = faq.keywords.some((k) => k.toLowerCase().includes(q))

      return inQuestion || inAnswer || inTags || inKeywords
    })
  }, [faqs, selectedCategory, searchQuery])

  // Menangani klik kategori dari 8 kartu referensi
  const handleCategoryCardClick = (catId: HelpDeskCategoryId) => {
    if (selectedCategory === catId) {
      setSelectedCategory('all')
    } else {
      setSelectedCategory(catId)
    }
    // Scroll mulus ke bagian FAQ Common Questions
    const faqSection = document.getElementById('common-questions-section')
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Aksi Salin Teks Jawaban
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Feedback Membantu / Tidak
  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }))
  }

  // Admin CMS: Simpan / Edit FAQ
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault()
    if (!faqFormQuestion.trim() || !faqFormAnswer.trim()) return

    const tagArray = faqFormTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const keywordArray = faqFormKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    if (editingFaqId) {
      // Update FAQ yang ada
      const updated = faqs.map((f) => {
        if (f.id === editingFaqId) {
          return {
            ...f,
            question: faqFormQuestion.trim(),
            category: faqFormCategory,
            answer: faqFormAnswer.trim(),
            tags: tagArray.length > 0 ? tagArray : ['Umum'],
            targetTab: faqFormTargetTab ? (faqFormTargetTab as DashboardNavTab) : undefined,
            keywords: keywordArray,
            updatedAt: new Date().toLocaleDateString('id-ID'),
          }
        }
        return f
      })
      saveFaqsToStorage(updated)
      setCmsSaveAlert('Artikel Bantuan (FAQ) berhasil diperbarui!')
    } else {
      // Tambah FAQ Baru
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        category: faqFormCategory,
        question: faqFormQuestion.trim(),
        answer: faqFormAnswer.trim(),
        tags: tagArray.length > 0 ? tagArray : ['Baru'],
        targetTab: faqFormTargetTab ? (faqFormTargetTab as DashboardNavTab) : undefined,
        keywords: keywordArray,
        isCustom: true,
        updatedAt: new Date().toLocaleDateString('id-ID'),
      }
      saveFaqsToStorage([newFaq, ...faqs])
      setCmsSaveAlert('Artikel Bantuan baru berhasil ditambahkan dan diterbitkan!')
    }

    // Reset Form
    setEditingFaqId(null)
    setFaqFormQuestion('')
    setFaqFormAnswer('')
    setFaqFormTags('')
    setFaqFormTargetTab('')
    setFaqFormKeywords('')

    setTimeout(() => setCmsSaveAlert(null), 4000)
  }

  // Admin CMS: Edit Item Click
  const handleStartEditFaq = (faq: FaqItem) => {
    setEditingFaqId(faq.id)
    setFaqFormQuestion(faq.question)
    setFaqFormCategory(faq.category)
    setFaqFormTags(faq.tags.join(', '))
    setFaqFormAnswer(faq.answer)
    setFaqFormTargetTab(faq.targetTab || '')
    setFaqFormKeywords(faq.keywords.join(', '))
    setActiveMode('admin_cms')

    // Scroll ke form
    const formEl = document.getElementById('admin-faq-form')
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
  }

  // Admin CMS: Hapus FAQ
  const handleDeleteFaq = (faqId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel bantuan ini?')) {
      const updated = faqs.filter((f) => f.id !== faqId)
      saveFaqsToStorage(updated)
      setCmsSaveAlert('Artikel bantuan berhasil dihapus.')
      setTimeout(() => setCmsSaveAlert(null), 3000)
    }
  }

  // Admin CMS: Reset ke Default
  const handleResetFaqsToDefault = () => {
    if (window.confirm('Kembalikan seluruh daftar pertanyaan ke standar bawaan ekosistem?')) {
      saveFaqsToStorage(DEFAULT_FAQS)
      saveContactToStorage(DEFAULT_CONTACT_SETTINGS)
      setEditPhone(DEFAULT_CONTACT_SETTINGS.phone)
      setEditEmail(DEFAULT_CONTACT_SETTINGS.email)
      setEditWhatsapp(DEFAULT_CONTACT_SETTINGS.whatsapp)
      setEditHeroTitle(DEFAULT_CONTACT_SETTINGS.heroTitle)
      setEditHeroSubtitle(DEFAULT_CONTACT_SETTINGS.heroSubtitle)
      setCmsSaveAlert('Seluruh data Help Center berhasil direset ke pengaturan bawaan.')
      setTimeout(() => setCmsSaveAlert(null), 3000)
    }
  }

  // Admin CMS: Simpan Kontak
  const handleSaveContactSettings = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: ContactSettings = {
      phone: editPhone.trim() || DEFAULT_CONTACT_SETTINGS.phone,
      email: editEmail.trim() || DEFAULT_CONTACT_SETTINGS.email,
      whatsapp: editWhatsapp.trim() || DEFAULT_CONTACT_SETTINGS.whatsapp,
      heroTitle: editHeroTitle.trim() || DEFAULT_CONTACT_SETTINGS.heroTitle,
      heroSubtitle: editHeroSubtitle.trim() || DEFAULT_CONTACT_SETTINGS.heroSubtitle,
    }
    saveContactToStorage(updated)
    setCmsSaveAlert('Pengaturan kontak dan teks hero berhasil diperbarui!')
    setTimeout(() => setCmsSaveAlert(null), 3000)
  }

  // Kirim Tiket Aduan Warga
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDescription.trim()) return

    setIsSubmittingTicket(true)
    setTimeout(() => {
      const categoryObj = HELP_CATEGORIES.find((c) => c.id === ticketCategory)
      const newTicket: SubmittedTicket = {
        id: `TKT-BN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        category: categoryObj ? categoryObj.title : 'Umum',
        subject: ticketSubject.trim(),
        priority: ticketPriority,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) + ' WIT',
        status: 'Diterima',
        phone: ticketPhone.trim(),
        description: ticketDescription.trim(),
      }

      const updated = [newTicket, ...tickets]
      setTickets(updated)
      try {
        localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated))
      } catch {
        // ignore
      }

      setTicketSuccess(newTicket)
      setIsSubmittingTicket(false)
      setTicketSubject('')
      setTicketDescription('')
      setTicketPhone('')
    }, 600)
  }

  // Jalankan Tes Diagnostik
  const handleRunDiagnostic = () => {
    setIsTestingDiag(true)
    setTimeout(() => {
      setIsTestingDiag(false)
      setDiagTested(true)
    }, 1000)
  }

  return (
    <div className="w-full space-y-8 pb-16 font-sans">
      {/* ===================================================================
          BAR ADMIN CONTROLLER (KHUSUS ADMINISTRATOR SISTEM / APARATUR DESA)
      ==================================================================== */}
      {isAdmin && (
        <div className="rounded-2xl bg-gradient-to-r from-[#081D35] via-[#0F2C59] to-[#1E3A5F] p-4 text-white shadow-sm border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#F4B75E] border border-[#F4B75E]/30 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-[#F4B75E] uppercase">
                  CMS Administrator Help Center
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Akses Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Kelola artikel FAQ, kategori, kontak posko kepulauan, dan tanggapan tiket warga.
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMode('user')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'user'
                  ? 'bg-white text-[#081D35] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Eye size={14} />
              <span>Pratinjau Pengunjung</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('admin_cms')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'admin_cms'
                  ? 'bg-[#F4B75E] text-[#081D35] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Settings size={14} />
              <span>Kelola Informasi (CMS)</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODE 1: PRATINJAU / TAMPILAN RESMI PUSAT BANTUAN (USER VIEW)
          SESUAI DENGAN REFERENSI GAMBAR: HERO GELAP + 8 KARTU + COMMON QUESTIONS
      ==================================================================== */}
      {activeMode === 'user' && (
        <div className="space-y-10">
          {/* ---------------------------------------------------------------
              1. HERO SECTION GELAP SESUAI REFERENSI GAMBAR
          ---------------------------------------------------------------- */}
          <section className="relative overflow-hidden rounded-3xl bg-[#081D35] text-white px-6 py-10 sm:px-12 sm:py-14 shadow-md border border-slate-800">
            {/* Background Texture Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-[#F4B75E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {contactInfo.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl font-normal">
                {contactInfo.heroSubtitle}
              </p>

              {/* Quick Action Pill Buttons Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                {/* Pill Button: Chat with Support */}
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-white/80 hover:border-white bg-transparent hover:bg-white hover:text-[#081D35] text-white font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <MessageSquare size={16} />
                  <span>Chat with Support</span>
                </button>

                {/* Direct Phone Link */}
                <a
                  href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-2 text-slate-200 hover:text-[#F4B75E] transition-colors font-medium tracking-wide"
                >
                  <Phone size={15} className="text-slate-400" />
                  <span>{contactInfo.phone}</span>
                </a>

                {/* Direct Email Link */}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="inline-flex items-center gap-2 text-slate-200 hover:text-[#F4B75E] transition-colors font-medium tracking-wide underline underline-offset-4 decoration-slate-500 hover:decoration-[#F4B75E]"
                >
                  <Mail size={15} className="text-slate-400" />
                  <span>{contactInfo.email}</span>
                </a>

                {/* Return to Landing Portal */}
                {onOpenLanding && (
                  <button
                    type="button"
                    onClick={onOpenLanding}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-medium tracking-wide cursor-pointer"
                  >
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>Portal Beranda</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------
              2. "How can we help?" - 8 KARTU KATEGORI SESUAI GAMBAR REFERENSI
          ---------------------------------------------------------------- */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#081D35] tracking-tight">
                How can we help?
              </h2>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer"
                >
                  <span>Reset Filter Kategori</span>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 8 Kategori dalam Grid 2x4 (Desktop: 4 kolom x 2 baris) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {HELP_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = selectedCategory === cat.id
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryCardClick(cat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCategoryCardClick(cat.id)
                      }
                    }}
                    className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer min-h-[148px] select-none ${
                      isSelected
                        ? 'border-[#081D35] ring-2 ring-[#081D35]/15 shadow-md -translate-y-0.5'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Bagian Atas: Judul Kategori & Sub-topics Horizontal */}
                    <div>
                      <h3 className="text-base font-black text-[#081D35] group-hover:text-[#0F2C59] tracking-tight">
                        {cat.title}
                      </h3>

                      {/* Sub-topik Tags Horizontal */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-slate-500">
                        {cat.subtopics.map((sub, i) => (
                          <span key={i} className="leading-snug">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bagian Bawah-Kiri: Soft Rounded Squircle Icon Badge */}
                    <div className="mt-4 pt-2 flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${cat.iconBg} ${cat.iconColor}`}
                      >
                        <Icon size={19} />
                      </div>

                      {isSelected && (
                        <span className="text-[11px] font-bold text-[#081D35] bg-slate-100 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ---------------------------------------------------------------
              3. "Common Questions" - FAQ ACCORDION SESUAI REFERENSI GAMBAR
          ---------------------------------------------------------------- */}
          <section id="common-questions-section" className="space-y-5 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#081D35] tracking-tight">
                  Common Questions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {selectedCategory === 'all'
                    ? `Menampilkan seluruh ${faqs.length} pertanyaan umum ekosistem.`
                    : `Menampilkan ${filteredFaqs.length} pertanyaan pada kategori "${
                        HELP_CATEGORIES.find((c) => c.id === selectedCategory)?.title
                      }".`}
                </p>
              </div>

              {/* Search Bar Input */}
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pertanyaan, tag, atau kata kunci..."
                  className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:border-[#081D35] focus:ring-1 focus:ring-[#081D35]/20 shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#081D35] text-[#F4B75E] shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                Semua ({faqs.length})
              </button>
              {HELP_CATEGORIES.map((cat) => {
                const count = faqs.filter((f) => f.category === cat.id).length
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#081D35] text-[#F4B75E] shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span>{cat.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <HelpCircle size={38} className="mx-auto text-slate-300" />
                  <h3 className="font-bold text-slate-800 text-base">Tidak ada pertanyaan yang cocok</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Kata kunci &quot;{searchQuery}&quot; tidak ditemukan. Coba gunakan istilah umum atau ajukan tiket bantuan langsung kepada tim posko.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#081D35] text-xs font-bold transition mt-2 cursor-pointer"
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id
                  const isCopied = copiedId === faq.id
                  const feedback = helpfulFeedback[faq.id]
                  const categoryMeta = HELP_CATEGORIES.find((c) => c.id === faq.category)

                  return (
                    <div
                      key={faq.id}
                      className={`rounded-2xl transition-all border ${
                        isExpanded
                          ? 'bg-white border-[#081D35]/30 shadow-xs ring-1 ring-[#081D35]/5'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                              isExpanded ? 'bg-[#081D35] text-[#F4B75E]' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <HelpCircle size={16} />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                {categoryMeta?.title || faq.category}
                              </span>
                              {faq.tags.slice(0, 2).map((tg, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                                >
                                  {tg}
                                </span>
                              ))}
                              {faq.isCustom && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Kustom Admin
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-[#081D35] leading-snug">
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
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 space-y-4 animate-in fade-in duration-150">
                          <p className="leading-relaxed whitespace-pre-line">{faq.answer}</p>

                          {/* Action Toolbar di dalam Accordion */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                            {/* Tombol Tautkan Ruang Kerja */}
                            {faq.targetTab && onNavigateTab ? (
                              <button
                                type="button"
                                onClick={() => onNavigateTab(faq.targetTab!)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold transition-colors cursor-pointer"
                              >
                                <span>Buka Ruang Kerja Terkait</span>
                                <ChevronRight size={13} />
                              </button>
                            ) : (
                              <div />
                            )}

                            {/* Tombol Aksi Tambahan */}
                            <div className="flex items-center gap-3 ml-auto">
                              {/* Edit Button untuk Admin */}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditFaq(faq)}
                                  className="inline-flex items-center gap-1 text-slate-500 hover:text-[#081D35] font-semibold transition cursor-pointer"
                                  title="Edit FAQ ini di CMS"
                                >
                                  <Edit2 size={13} />
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* Salin Teks Jawaban */}
                              <button
                                type="button"
                                onClick={() => handleCopyText(`${faq.question}\n\n${faq.answer}`, faq.id)}
                                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={13} className="text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>

                              {/* Feedback Thumbs */}
                              <div className="inline-flex items-center gap-1 pl-3 border-l border-slate-200">
                                <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">
                                  Membantu?
                                </span>
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
          </section>

          {/* ---------------------------------------------------------------
              4. KOTAK BANTUAN TAMBAHAN: TIKET ADUAN & DIAGNOSTIK
          ---------------------------------------------------------------- */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            {/* Box 1: Layanan Aduan & Tiket */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center mb-3">
                  <Send size={18} />
                </div>
                <h3 className="text-lg font-black text-[#081D35] tracking-tight">
                  Butuh Bantuan Khusus?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Tidak menemukan jawaban di panduan? Kirim formulir tiket aduan atau hubungi kontak posko darurat kepulauan untuk penanganan teknis.
                </p>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#081D35] hover:bg-[#0F2C59] text-[#F4B75E] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Send size={14} />
                  <span>Kirim Tiket / Buka Layanan Chat</span>
                </button>
              </div>
            </div>

            {/* Box 2: Diagnostik PWA & Offline Sync */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
                  <Cpu size={18} />
                </div>
                <h3 className="text-lg font-black text-[#081D35] tracking-tight">
                  Pemeriksaan Sistem &amp; Jaringan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Uji konektivitas sinyal BTS kepulauan, penyimpanan cache offline PWA (IndexedDB), serta sinkronisasi hash blockchain secara instan.
                </p>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="button"
                  disabled={isTestingDiag}
                  onClick={handleRunDiagnostic}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#081D35] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={14} className={isTestingDiag ? 'animate-spin' : ''} />
                  <span>{isTestingDiag ? 'Menguji Latensi Sistem...' : 'Jalankan Tes Diagnostik'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Banner Notifikasi Hasil Diagnostik */}
          {diagTested && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Diagnostik Sukses:</strong> Konektivitas BTS Normal (48ms), Cache Offline PWA Siap Pakai, API Backend Terkoneksi.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDiagTested(false)}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          MODE 2: CMS ADMINISTRATOR (KELOLA PUSAT BANTUAN & FORMULIR UPDATE)
          MEMENUHI PERMINTAAN USER: PADA DASHBOARD ADMIN SEDIAKAN WORKSPACE
          YANG MENGELOLA HALAMAN HELP CENTER DENGAN FORM MENAMBAH INFORMASI.
      ==================================================================== */}
      {isAdmin && activeMode === 'admin_cms' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Banner Status Notifikasi CMS */}
          {cmsSaveAlert && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{cmsSaveAlert}</span>
              </div>
              <button
                type="button"
                onClick={() => setCmsSaveAlert(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Baris Atas: 2 Formulir (Form Tambah FAQ + Form Pengaturan Kontak) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* -------------------------------------------------------------
                FORMULIR 1: TAMBAH / EDIT ARTIKEL BANTUAN (FAQ)
            -------------------------------------------------------------- */}
            <div
              id="admin-faq-form"
              className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#081D35]">
                      {editingFaqId ? 'Perbarui Artikel Bantuan' : 'Formulir Tambah Artikel Bantuan (FAQ)'}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Tambahkan solusi pertanyaan baru agar langsung tayang di Help Center.
                    </p>
                  </div>
                </div>

                {editingFaqId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqId(null)
                      setFaqFormQuestion('')
                      setFaqFormAnswer('')
                      setFaqFormTags('')
                      setFaqFormTargetTab('')
                      setFaqFormKeywords('')
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
                {/* Judul Pertanyaan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pertanyaan Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={faqFormQuestion}
                    onChange={(e) => setFaqFormQuestion(e.target.value)}
                    placeholder="Contoh: Bagaimana cara memverifikasi nomor registrasi surat domisili?"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] focus:bg-white transition"
                  />
                </div>

                {/* Grid Kategori & Target Ruang Kerja */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kategori (8 Pilar Layanan) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={faqFormCategory}
                      onChange={(e) => setFaqFormCategory(e.target.value as HelpDeskCategoryId)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#081D35] focus:bg-white"
                    >
                      {HELP_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} — {c.description.slice(0, 30)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tautkan ke Ruang Kerja Terkait (Opsional)
                    </label>
                    <select
                      value={faqFormTargetTab}
                      onChange={(e) => setFaqFormTargetTab(e.target.value as DashboardNavTab)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#081D35] focus:bg-white"
                    >
                      <option value="">-- Tidak ada tautan langsung --</option>
                      <option value="letters">Permohonan Surat Warga</option>
                      <option value="population">Data Kependudukan</option>
                      <option value="farming">Plot Kebun GIS</option>
                      <option value="traceability">Panen &amp; Rantai Pasok Blockchain</option>
                      <option value="koperasi">Kasir &amp; Koperasi Hatta</option>
                      <option value="tourism">Pariwisata &amp; Eco-Stay</option>
                      <option value="gis">Peta Spasial GIS</option>
                      <option value="iot">Telemetri IoT Cuaca</option>
                      <option value="audit">Jejak Audit &amp; Verifikasi</option>
                      <option value="marketplace">Katalog Marketplace</option>
                    </select>
                  </div>
                </div>

                {/* Sub-topik Tags & Kata Kunci Pencarian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Sub-topik / Label Badge (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={faqFormTags}
                      onChange={(e) => setFaqFormTags(e.target.value)}
                      placeholder="Contoh: Pelayanan, Surat, Verifikasi"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kata Kunci Pencarian (Keywords)
                    </label>
                    <input
                      type="text"
                      value={faqFormKeywords}
                      onChange={(e) => setFaqFormKeywords(e.target.value)}
                      placeholder="Contoh: ktp, domisili, surat, nik"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Jawaban Rinci */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jawaban Lengkap Solusi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={faqFormAnswer}
                    onChange={(e) => setFaqFormAnswer(e.target.value)}
                    placeholder="Uraikan solusi langkah demi langkah secara jelas dan ramah warga..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] focus:bg-white leading-relaxed resize-none"
                  />
                </div>

                {/* Tombol Simpan */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    * Data otomatis tersimpan di penyimpanan ekosistem lokal.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#081D35] hover:bg-[#0F2C59] text-[#F4B75E] font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Check size={14} />
                    <span>{editingFaqId ? 'Simpan Pembaruan FAQ' : 'Terbitkan Artikel Bantuan'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* -------------------------------------------------------------
                FORMULIR 2: PENGATURAN KONTAK HERO & CALL CENTER
            -------------------------------------------------------------- */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#081D35]">Pengaturan Kontak &amp; Hero</h2>
                  <p className="text-[11px] text-slate-500">
                    Sesuaikan nomor posko, email dukungan, dan narasi banner.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveContactSettings} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Utama Hero Header</label>
                  <input
                    type="text"
                    required
                    value={editHeroTitle}
                    onChange={(e) => setEditHeroTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Call Center Telepon</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Layanan Ekosistem</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tautan WhatsApp Posko Desa</label>
                  <input
                    type="text"
                    required
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="https://wa.me/62..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Narasi Deskripsi Subtitle Hero</label>
                  <textarea
                    rows={3}
                    required
                    value={editHeroSubtitle}
                    onChange={(e) => setEditHeroSubtitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] leading-relaxed resize-none"
                  />
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetFaqsToDefault}
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Reset ke Standar Awal
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#081D35] hover:bg-[#0F2C59] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                  >
                    Simpan Kontak
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ---------------------------------------------------------------
              DAFTAR SELURUH ARTIKEL TERDAFTAR (CMS REPOSITORY TABLE)
          ---------------------------------------------------------------- */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#081D35]">
                  Daftar Manajemen Seluruh Artikel Bantuan ({faqs.length} Artikel)
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa, perbarui, atau hapus artikel bantuan yang aktif pada ekosistem.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  {faqs.filter((f) => f.isCustom).length} Kustom Admin / {faqs.filter((f) => !f.isCustom).length} Bawaan
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Pertanyaan &amp; Jawaban Solusi</th>
                    <th className="py-2.5 px-3">Ruang Kerja</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faqs.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#081D35]">
                          {HELP_CATEGORIES.find((c) => c.id === f.category)?.title || f.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold text-[#081D35] text-xs leading-snug">{f.question}</div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{f.answer}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {f.tags.map((t, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        {f.targetTab ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                            {f.targetTab}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        {f.isCustom ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Kustom
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Bawaan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditFaq(f)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-[#081D35] font-semibold p-1"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(f.id)}
                          className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 font-semibold p-1"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL INTERAKTIF: CHAT WITH SUPPORT / TIKET ADUAN WARGA
      ==================================================================== */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#081D35] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#F4B75E]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Layanan Dukungan &amp; Posko Desa</h3>
                  <p className="text-xs text-slate-300">Responsif 08.00 - 16.00 WIT • Kepulauan Banda Neira</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSupportModalOpen(false)
                  setTicketSuccess(null)
                }}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Opsi Cepat 1: Hubungi via WhatsApp */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Respon Instan via WhatsApp</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Hubungi langsung petugas posko di {contactInfo.phone}
                    </p>
                  </div>
                </div>

                <a
                  href={contactInfo.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <span>Chat WhatsApp</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Notifikasi Tiket Berhasil */}
              {ticketSuccess && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                    <CheckCircle2 size={16} className="text-blue-600" />
                    Tiket Aduan Terdaftar: {ticketSuccess.id}
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Aduan Anda mengenai &quot;{ticketSuccess.subject}&quot; telah masuk ke antrean petugas posko. Status saat ini: <strong>{ticketSuccess.status}</strong>.
                  </p>
                </div>
              )}

              {/* Opsi 2: Formulir Tiket Aduan Mandiri */}
              <form onSubmit={handleSubmitTicket} className="space-y-3.5 border-t border-slate-100 pt-4">
                <div className="font-bold text-slate-800 text-sm">Atau Kirim Tiket Aduan Tertulis:</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Masalah</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as HelpDeskCategoryId)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                    >
                      {HELP_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tingkat Urgensi</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTicketPriority(p)}
                          className={`h-9 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            ticketPriority === p
                              ? 'bg-[#081D35] text-[#F4B75E] border-[#081D35]'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {p === 'low' ? 'Rendah' : p === 'medium' ? 'Sedang' : 'Mendesak'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Pokok Kendala</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Contoh: Kesulitan mengunduh surat pengantar domisili"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Kontak / WhatsApp Pemohon</label>
                  <input
                    type="text"
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    placeholder="Contoh: 0812-4099-2026"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rincian Kendala</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Tuliskan kendala Anda secara jelas..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#081D35] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="w-full py-2.5 rounded-xl bg-[#081D35] hover:bg-[#0F2C59] text-[#F4B75E] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTicket ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#F4B75E] border-t-transparent animate-spin" />
                      <span>Mengirim Aduan...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Kirim Tiket Aduan Sekarang</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpDeskWorkspace
