import React, { useState, useEffect, useRef } from 'react'
import logoImg from '../../assets/logo.png'
import {
  LayoutDashboard,
  Users,
  Mail,
  Sprout,
  MapPin,
  Scale,
  Home,
  Layers,
  Compass,
  Radio,
  Database,
  ShieldCheck,
  ShoppingBag,
  QrCode,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
  FileText,
  HelpCircle,
  Settings,
  UserCheck,
  Search,
  Moon,
  Sun,
  LayoutGrid,
  CornerDownLeft,
  Server,
  Activity,
  RefreshCw,
} from 'lucide-react'

export type DashboardNavTab =
  | 'landing'
  | 'dashboard'
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

export interface DashboardLayoutProps {
  currentUser: any
  activeTab: DashboardNavTab
  onSelectTab: (tab: DashboardNavTab) => void
  onOpenLanding: () => void
  onOpenMarketplace: () => void
  onPublicVerify: (token?: string) => void
  onOpenQueueModal?: () => void
  onOpenQuickSwitch?: () => void
  onLogout: () => void
  isOnline?: boolean
  pendingSyncCount?: number
  isSyncing?: boolean
  adminPendingLettersCount?: number
  pendingFarmsCount?: number
  systemHealth?: {
    status: string
    version: string
    timestamp: string
    services: {
      api: string
      database: string
    }
  } | null
  loadingHealth?: boolean
  healthError?: string | null
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenLanding,
  onOpenMarketplace,
  onPublicVerify,
  onOpenQueueModal,
  onOpenQuickSwitch,
  onLogout,
  isOnline = true,
  pendingSyncCount = 0,
  isSyncing = false,
  adminPendingLettersCount = 0,
  pendingFarmsCount = 0,
  systemHealth = null,
  loadingHealth = false,
  healthError = null,
  children,
}) => {
  // Simpan state collapsed di localStorage agar konsisten saat refresh
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('banda_sidebar_collapsed')
      return saved === 'true'
    }
    return false
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showQuickMenuDropdown, setShowQuickMenuDropdown] = useState(false)
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [showTelemetryPopover, setShowTelemetryPopover] = useState(false)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)
  const quickMenuDropdownRef = useRef<HTMLDivElement>(null)
  const telemetryPopoverRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Shortcut global Ctrl + / (atau Cmd + / di Mac) untuk fokus ke pencarian
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setIsSearchFocused(true)
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Efek toggle Dark / Light mode pada elemen html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('banda_sidebar_collapsed', String(collapsed))
    }
  }, [collapsed])

  // Menutup dropdown settings & hasil pencarian saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSettingsDropdown(false)
      }
      if (
        quickMenuDropdownRef.current &&
        !quickMenuDropdownRef.current.contains(e.target as Node)
      ) {
        setShowQuickMenuDropdown(false)
      }
      if (
        telemetryPopoverRef.current &&
        !telemetryPopoverRef.current.contains(e.target as Node)
      ) {
        setShowTelemetryPopover(false)
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ekstraksi peran pengguna
  const roles: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isAdmin = isSuperuser || roles.includes('admin')
  const isOfficerOrAdmin = isAdmin || roles.some((r) => ['admin', 'village_officer'].includes(r))
  const isFarmer = roles.includes('farmer') || roles.includes('petani')
  const isFarmerGroupAdmin = roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')
  const isHomestayOperator = roles.includes('homestay_operator') || roles.includes('operator_homestay')
  const isCoopManager = roles.includes('coop_manager') || roles.includes('pengelola_koperasi')
  const isSmartTourismAdmin = roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')
  const isSurveyor = roles.includes('field_surveyor') || roles.includes('surveyor')

  const getRoleDisplayName = () => {
    if (isSuperuser || roles.includes('admin')) return 'Administrator Sistem'
    if (roles.includes('village_officer')) return 'Petugas Kantor Desa'
    if (isFarmer) return 'Petani Rempah Pala'
    if (isFarmerGroupAdmin) return 'Ketua Kelompok Tani'
    if (isHomestayOperator) return 'Mitra Usaha & Eco-Stay'
    if (isCoopManager) return 'Pengelola Koperasi Hatta'
    if (isSmartTourismAdmin) return 'Pemandu Cagar Budaya'
    if (isSurveyor) return 'Surveyor Lapangan & IoT'
    return 'Warga Masyarakat Desa'
  }

  const getUserInitials = () => {
    const name = currentUser?.full_name || currentUser?.username || 'Warga Banda'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const userDisplayName = currentUser?.full_name || currentUser?.username || 'Jonathan'
  const userDisplayEmail =
    currentUser?.email || (currentUser?.username ? `${currentUser.username}@bandanaira.com` : 'admin@bandanaira.com')

  // Hitung total notifikasi aktif untuk badge hijau (sesuai referensi angka hijau "5")
  const totalNotifications = Math.max(
    adminPendingLettersCount + pendingFarmsCount + pendingSyncCount,
    adminPendingLettersCount > 0 || pendingFarmsCount > 0 ? adminPendingLettersCount + pendingFarmsCount : 5
  )

  // Definisi Item Navigasi Workspace
  interface SidebarItem {
    id: DashboardNavTab
    label: string
    shortLabel: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    badge?: number | string
    visible: boolean
  }

  const sidebarNavItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'letters',
      label: isOfficerOrAdmin ? 'Pelayanan Surat' : 'Permohonan Surat',
      shortLabel: 'Surat',
      icon: Mail,
      badge: isOfficerOrAdmin && adminPendingLettersCount > 0 ? adminPendingLettersCount : undefined,
      visible: true,
    },
    {
      id: 'population',
      label: 'Kependudukan',
      shortLabel: 'Penduduk',
      icon: Users,
      visible: isOfficerOrAdmin,
    },
    {
      id: 'traceability',
      label: isCoopManager
        ? 'Penerimaan Rempah Gudang'
        : isFarmer || isFarmerGroupAdmin
        ? 'Catat Panen & Grading'
        : 'Panen & Mutu Rempah',
      shortLabel: 'Rempah',
      icon: Sprout,
      visible: isFarmer || isFarmerGroupAdmin || isCoopManager || isOfficerOrAdmin,
    },
    {
      id: 'farming',
      label: isFarmerGroupAdmin ? 'Plot Kebun Poktan' : isFarmer ? 'Peta Kebun Saya' : 'Plot & Peta Kebun',
      shortLabel: 'Kebun',
      icon: MapPin,
      badge: (isFarmerGroupAdmin || isOfficerOrAdmin) && pendingFarmsCount > 0 ? pendingFarmsCount : undefined,
      visible: isFarmer || isFarmerGroupAdmin || isOfficerOrAdmin,
    },
    {
      id: 'koperasi',
      label: isCoopManager || isOfficerOrAdmin ? 'Kasir Koperasi Hatta' : 'Koperasi & Tabungan Warga',
      shortLabel: isCoopManager || isOfficerOrAdmin ? 'Kasir' : 'Koperasi',
      icon: Scale,
      visible: true,
    },
    {
      id: 'tourism',
      label: isHomestayOperator
        ? 'Kelola Eco-Stay & Tamu'
        : isSmartTourismAdmin
        ? 'Pemandu & Cagar Budaya'
        : isOfficerOrAdmin
        ? 'Master Data Wisata'
        : 'Cagar Budaya & Wisata',
      shortLabel: 'Wisata',
      icon: Home,
      visible: true,
    },
    {
      id: 'gis',
      label: isOfficerOrAdmin ? 'Peta GIS & Spatial Studio' : 'Peta Spasial GIS',
      shortLabel: 'Peta GIS',
      icon: Layers,
      visible: true,
    },
    {
      id: 'smart_planner',
      label: isOfficerOrAdmin ? 'Perencana DSS & SAW Admin' : 'Perencana Cerdas DSS',
      shortLabel: 'Smart DSS',
      icon: Compass,
      visible: true,
    },
    {
      id: 'iot',
      label: 'Telemetri IoT Cuaca',
      shortLabel: 'IoT Cuaca',
      icon: Radio,
      visible: true,
    },
    {
      id: 'survei',
      label: 'Survei Lapangan',
      shortLabel: 'Survei',
      icon: Database,
      visible: isSurveyor || isOfficerOrAdmin,
    },
    {
      id: 'audit',
      label: 'Jejak Audit & Verifikasi',
      shortLabel: 'Audit',
      icon: ShieldCheck,
      visible: isOfficerOrAdmin,
    },
  ]

  const visibleItems = sidebarNavItems.filter((item) => item.visible)

  interface QuickSearchResult {
    id: string
    title: string
    subtitle: string
    category: 'Ruang Kerja' | 'Aksi Cepat' | 'Blockchain'
    icon: React.ComponentType<{ size?: number; className?: string }>
    badge?: string
    badgeColor?: string
    action: () => void
  }

  // Kata kunci dan deskripsi pencarian cepat per workspace
  const workspaceDescriptions: Record<string, { desc: string; keywords: string[] }> = {
    dashboard: {
      desc: 'Ringkasan KPI global, demografi warga, dan status pulau',
      keywords: ['dashboard', 'ringkasan', 'kpi', 'ikhtisar', 'metrik', 'statistik', 'dasbor'],
    },
    letters: {
      desc: 'Layanan administrasi, SKU, domisili, dan tanda tangan digital',
      keywords: ['surat', 'sku', 'domisili', 'ktp', 'layanan', 'permohonan', 'cetak', 'qr', 'pengantar'],
    },
    population: {
      desc: 'Master NIK warga, KK, piramida usia, dan data bansos',
      keywords: ['penduduk', 'nik', 'kk', 'warga', 'demografi', 'profesi', 'bansos', 'kependudukan'],
    },
    traceability: {
      desc: 'Pencatatan batch panen, grading mutu A/B/C, dan QR pala',
      keywords: ['panen', 'rempah', 'pala', 'fuli', 'biji', 'batch', 'grading', 'mutu', 'traceability'],
    },
    farming: {
      desc: 'Peta batas kebun, kelompok tani poktan, dan luas lahan',
      keywords: ['kebun', 'lahan', 'plot', 'poktan', 'petani', 'peta kebun'],
    },
    koperasi: {
      desc: 'Kasir komoditas, bank sampah plastik, dan air minum RO',
      keywords: ['koperasi', 'kasir', 'sembako', 'air ro', 'galon', 'bank sampah', 'timbangan', 'tabungan'],
    },
    tourism: {
      desc: '177 cagar budaya Banda, direktori homestay, dan pemandu HPI',
      keywords: ['wisata', 'cagar budaya', 'homestay', 'eco-stay', 'kamar', 'benteng', 'belgica', 'hatta', 'pemandu'],
    },
    gis: {
      desc: 'Peta interaktif 7-layer spasial, kontur, dan jalur evakuasi',
      keywords: ['gis', 'peta', 'layer', 'spasial', 'kontur', 'koordinat', 'evakuasi'],
    },
    smart_planner: {
      desc: 'DSS SAW perencana itinerary rute wisata cerdas',
      keywords: ['smart planner', 'dss', 'saw', 'rute', 'itinerary', 'rekomendasi', 'perencana'],
    },
    iot: {
      desc: 'Telemetri 4 stasiun cuaca pulau dan sensor tanah',
      keywords: ['iot', 'telemetri', 'sensor', 'cuaca', 'suhu', 'kelembaban', 'stasiun'],
    },
    survei: {
      desc: 'Formulir survei dinamis NoSQL dan pipa ETL PostGIS',
      keywords: ['survei', 'kuesioner', 'etl', 'form', 'data lapangan'],
    },
    audit: {
      desc: 'Jejak audit blockchain tamper-evident dan validator node',
      keywords: ['audit', 'blockchain', 'jejak', 'log', 'transaksi', 'validator'],
    },
  }

  // Komputasi hasil pencarian cepat (Command Palette)
  const searchResults: QuickSearchResult[] = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const results: QuickSearchResult[] = []

    if (!query) {
      // Rekomendasi pintasan default jika input kosong
      visibleItems.slice(0, 4).forEach((item) => {
        const info = workspaceDescriptions[item.id]
        results.push({
          id: `ws-${item.id}`,
          title: item.label,
          subtitle: info?.desc || 'Buka ruang kerja operasional',
          category: 'Ruang Kerja',
          icon: item.icon,
          action: () => {
            onSelectTab(item.id)
            setIsSearchFocused(false)
            setSearchQuery('')
          },
        })
      })

      results.push({
        id: 'act-verify',
        title: 'Verifikasi Batch & Hash Blockchain',
        subtitle: 'Pindai atau masukkan token keaslian pala',
        category: 'Aksi Cepat',
        icon: QrCode,
        badge: 'On-Chain',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        action: () => {
          onPublicVerify()
          setIsSearchFocused(false)
          setSearchQuery('')
        },
      })

      results.push({
        id: 'act-market',
        title: 'Marketplace Rempah Banda',
        subtitle: 'Katalog komoditas pala langsung dari petani',
        category: 'Aksi Cepat',
        icon: ShoppingBag,
        badge: 'Koperasi',
        badgeColor: 'bg-amber-100 text-amber-800',
        action: () => {
          onOpenMarketplace()
          setIsSearchFocused(false)
          setSearchQuery('')
        },
      })

      return results
    }

    // 1. Pencarian Ruang Kerja (Workspace)
    visibleItems.forEach((item) => {
      const info = workspaceDescriptions[item.id]
      const matchesTitle = item.label.toLowerCase().includes(query)
      const matchesShort = item.shortLabel.toLowerCase().includes(query)
      const matchesKw = info?.keywords.some((kw) => kw.includes(query) || query.includes(kw))

      if (matchesTitle || matchesShort || matchesKw) {
        results.push({
          id: `ws-${item.id}`,
          title: item.label,
          subtitle: info?.desc || 'Buka ruang kerja',
          category: 'Ruang Kerja',
          icon: item.icon,
          badge: item.badge ? String(item.badge) : undefined,
          action: () => {
            onSelectTab(item.id)
            setIsSearchFocused(false)
            setSearchQuery('')
          },
        })
      }
    })

    // 2. Pencarian Aksi Cepat Sistem
    const quickActions = [
      {
        id: 'act-verify',
        title: 'Verifikasi Blockchain',
        subtitle: 'Pindai sertifikat QR dan riwayat asal-usul panen',
        keywords: ['verifikasi', 'qr', 'scan', 'blockchain', 'hash', 'pala', 'keaslian'],
        icon: QrCode,
        badge: 'On-Chain',
        action: () => onPublicVerify(),
      },
      {
        id: 'act-market',
        title: 'Marketplace Rempah',
        subtitle: 'Bursa komoditas pala & hasil bumi Banda',
        keywords: ['marketplace', 'pasar', 'jual', 'beli', 'rempah', 'toko', 'komoditas'],
        icon: ShoppingBag,
        badge: 'Koperasi',
        action: () => onOpenMarketplace(),
      },
      {
        id: 'act-landing',
        title: 'Beranda Satu Pintu Desa',
        subtitle: 'Halaman portal publik Banda Neira',
        keywords: ['beranda', 'landing', 'portal', 'desa', 'depan', 'home'],
        icon: Home,
        badge: 'Publik',
        action: () => onOpenLanding(),
      },
    ]

    if (onOpenQuickSwitch) {
      quickActions.push({
        id: 'act-switch',
        title: 'Simulasi Ganti Role Pengguna',
        subtitle: 'Uji perspektif dasbor untuk seluruh 10 peran ekosistem',
        keywords: ['role', 'simulasi', 'ganti', 'switch', 'pengguna', 'admin', 'aktor'],
        icon: UserCheck,
        badge: 'Simulator',
        action: () => onOpenQuickSwitch(),
      })
    }

    if (onOpenQueueModal && pendingSyncCount > 0) {
      quickActions.push({
        id: 'act-queue',
        title: `Antrean Sinkronisasi Offline (${pendingSyncCount})`,
        subtitle: 'Data mutasi yang menunggu tersambung ke server',
        keywords: ['offline', 'antrean', 'sinkron', 'sync', 'queue'],
        icon: Database,
        badge: `${pendingSyncCount} Item`,
        action: () => onOpenQueueModal(),
      })
    }

    quickActions.forEach((act) => {
      const matchTitle = act.title.toLowerCase().includes(query)
      const matchKw = act.keywords.some((kw) => kw.includes(query) || query.includes(kw))
      if (matchTitle || matchKw) {
        results.push({
          id: act.id,
          title: act.title,
          subtitle: act.subtitle,
          category: 'Aksi Cepat',
          icon: act.icon,
          badge: act.badge,
          action: () => {
            act.action()
            setIsSearchFocused(false)
            setSearchQuery('')
          },
        })
      }
    })

    // 3. Pencarian Hash / Batch Dinamis di Blockchain
    if (query.length >= 2) {
      results.push({
        id: `bc-query-${query}`,
        title: `Cek Batch / Hash "${query}"`,
        subtitle: 'Lakukan verifikasi integritas data ledger blockchain',
        category: 'Blockchain',
        icon: QrCode,
        badge: 'Verifikasi',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        action: () => {
          onPublicVerify(query)
          setIsSearchFocused(false)
          setSearchQuery('')
        },
      })
    }

    return results
  }, [
    searchQuery,
    visibleItems,
    onOpenMarketplace,
    onOpenLanding,
    onPublicVerify,
    onOpenQuickSwitch,
    onOpenQueueModal,
    pendingSyncCount,
    onSelectTab,
  ])

  // Navigasi Keyboard (Panah Atas / Bawah / Enter / Esc)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults[selectedResultIndex]) {
        searchResults[selectedResultIndex].action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsSearchFocused(false)
      searchInputRef.current?.blur()
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-[#F7F5F0] text-[#081D35] relative font-sans antialiased">
      {/* =====================================================================
          1. MOBILE TOPBAR (Untuk Layar Handphone / Tablet Kecil)
      ====================================================================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#081D35] text-white flex items-center justify-between px-4 z-40 border-b border-[#1E3A5F] shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F4B75E] transition"
            aria-label="Buka Menu Sidebar"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-[#0F2C59] border border-[#F4B75E]/40 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
              <img src={logoImg} alt="Logo Banda Digital" className="size-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white font-serif">
              bandanaira<span className="text-[#F4B75E]">.com</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-[#0F2C59] border border-[#F4B75E]/30 text-[#F4B75E] font-bold text-xs flex items-center justify-center">
            {getUserInitials()}
          </div>
        </div>
      </div>

      {/* BACKDROP MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* =====================================================================
          2. SIDEBAR DARK ELEGAN SESUAI PALET ASLI BANDA NEIRA
          Model: Floating Rounded-3xl Card di Desktop (#081D35 Deep Navy)
      ====================================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#081D35] text-white shadow-2xl transition-all duration-300 ease-in-out border border-[#1E3A5F] ${
          collapsed
            ? 'w-20 lg:top-3 lg:bottom-3 lg:left-3 lg:h-[calc(100vh-1.5rem)] lg:rounded-3xl'
            : 'w-64 lg:top-3 lg:bottom-3 lg:left-3 lg:h-[calc(100vh-1.5rem)] lg:rounded-3xl'
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* --- 2.1 HEADER SIDEBAR: LOGO, JUDUL & DROPDOWN CHEVRON --- */}
        <div className="h-20 flex items-center px-4 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* Circular Emblem dengan Logo Asli Banda Digital */}
                <div className="size-11 rounded-full bg-[#0F2C59] border border-[#F4B75E]/30 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-inner">
                  <img src={logoImg} alt="Logo Banda Digital" className="size-full object-contain" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm tracking-wide text-white leading-tight font-serif">
                    bandanaira<span className="text-[#F4B75E]">.com</span>
                  </span>
                  <span className="text-[11px] text-[#F4B75E] font-medium leading-normal truncate">
                    Ruang Kerja Terpadu
                  </span>
                </div>
              </div>

              {/* Tombol ciutkan / toggle chevron */}
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#F4B75E] hover:bg-white/10 transition"
                title="Ciutkan Sidebar"
              >
                <ChevronDown size={17} className="transition-transform duration-200" />
              </button>
            </div>
          ) : (
            /* Mode Collapsed: Emblem di tengah */
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="mx-auto size-11 rounded-full bg-[#0F2C59] border border-[#F4B75E]/30 flex items-center justify-center p-1.5 overflow-hidden hover:border-[#F4B75E] transition shadow-inner group relative"
              title="Perluas Sidebar"
            >
              <img
                src={logoImg}
                alt="Logo Banda Digital"
                className="size-full object-contain group-hover:scale-105 transition-transform"
              />

              {/* Tooltip Collapsed */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F2C59] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                bandanaira.com (Klik untuk lebarkan)
              </div>
            </button>
          )}
        </div>

        {/* --- 2.2 DAFTAR WORKSPACE UTAMA --- */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id)
                  setMobileSidebarOpen(false)
                }}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
                  collapsed
                    ? 'justify-center py-2.5 px-0 h-11'
                    : 'gap-3.5 px-3 py-2.5 text-left'
                } ${
                  isActive
                    ? 'bg-[#0F2C59] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Indikator Bar Vertikal Emas (#F4B75E) Aktif di Border Kiri Sesuai Gambar Referensi */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#F4B75E] rounded-r-full shadow-xs" />
                )}

                {/* Icon Menu */}
                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-[#F4B75E]' : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                {/* Label Menu (Jika Expanded) */}
                {!collapsed && (
                  <span className="truncate flex-1 text-[13px] tracking-tight">{item.label}</span>
                )}

                {/* Badge Angka (Jika ada) */}
                {!collapsed && item.badge !== undefined && (
                  <span className="size-5 rounded-full bg-[#F4B75E] text-[#081D35] font-bold text-[10px] flex items-center justify-center shrink-0">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip Floating Sesuai Gambar Referensi (Saat Collapsed) */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F2C59] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            )
          })}

          {/* --- 2.3 GARIS PEMISAH TIPIS ELEGAN SESUAI PALET (#1E3A5F) --- */}
          <div className="my-3 border-t border-[#1E3A5F] mx-1" />

          {/* --- 2.4 SECTION UTILITAS: NOTIFICATION, DOCUMENTS, HELP --- */}
          {/* Notification Item dengan Badge Emas/Hijau Sesuai Gambar */}
          <button
            type="button"
            onClick={() => {
              setShowNotificationToast(true)
              setTimeout(() => setShowNotificationToast(false), 3500)
            }}
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
              collapsed
                ? 'justify-center py-2.5 px-0 h-11'
                : 'gap-3.5 px-3 py-2.5 text-left'
            } text-slate-300 hover:text-white hover:bg-white/5`}
          >
            <div className="relative shrink-0">
              <Bell size={19} className="text-slate-400 group-hover:text-[#F4B75E] transition-colors" />
              {/* Green/Gold Dot di collapsed mode seperti gambar referensi */}
              {collapsed && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#F4B75E]" />
              )}
            </div>

            {!collapsed && (
              <>
                <span className="truncate flex-1 text-[13px] tracking-tight text-slate-300 group-hover:text-white">
                  Notification
                </span>
                {/* Circle Badge persis seperti di gambar referensi */}
                <span className="size-5 rounded-full bg-[#F4B75E] text-[#081D35] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                  {totalNotifications}
                </span>
              </>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F2C59] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Notification ({totalNotifications})
              </div>
            )}
          </button>

          {/* Documents Item */}
          <button
            type="button"
            onClick={() => {
              onPublicVerify()
              setMobileSidebarOpen(false)
            }}
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
              collapsed
                ? 'justify-center py-2.5 px-0 h-11'
                : 'gap-3.5 px-3 py-2.5 text-left'
            } text-slate-300 hover:text-white hover:bg-white/5`}
          >
            <FileText size={19} className="shrink-0 text-slate-400 group-hover:text-[#F4B75E] transition-colors" />

            {!collapsed && (
              <span className="truncate flex-1 text-[13px] tracking-tight text-slate-300 group-hover:text-white">
                Documents
              </span>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F2C59] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Documents &amp; Verifikasi
              </div>
            )}
          </button>

          {/* Help Item */}
          <button
            type="button"
            onClick={() => {
              onOpenLanding()
              setMobileSidebarOpen(false)
            }}
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
              collapsed
                ? 'justify-center py-2.5 px-0 h-11'
                : 'gap-3.5 px-3 py-2.5 text-left'
            } text-slate-300 hover:text-white hover:bg-white/5`}
          >
            <HelpCircle size={19} className="shrink-0 text-slate-400 group-hover:text-[#F4B75E] transition-colors" />

            {!collapsed && (
              <span className="truncate flex-1 text-[13px] tracking-tight text-slate-300 group-hover:text-white">
                Help
              </span>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F2C59] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Help &amp; Beranda Desa
              </div>
            )}
          </button>
        </div>

        {/* --- 2.5 USER PROFILE CARD DI BAGIAN BAWAH PERSIS SESUAI GAMBAR --- */}
        <div className="p-3 shrink-0 relative" ref={settingsDropdownRef}>
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-[#0F2C59]/60 hover:bg-[#0F2C59] transition border border-[#1E3A5F]">
              <div className="flex items-center gap-3 min-w-0">
                {/* Foto / Avatar Pengguna Berbentuk Lingkaran dengan aksen emas */}
                <div className="relative size-10 rounded-full bg-[#081D35] border border-[#F4B75E]/40 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src="logo.png"
                    alt={userDisplayName}
                    className="size-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <span className="font-bold text-xs text-[#F4B75E] uppercase select-none">
                    {getUserInitials()}
                  </span>
                </div>

                <div className="flex flex-col truncate">
                  <span className="font-bold text-xs text-white truncate leading-tight">
                    {userDisplayName}
                  </span>
                  <span className="text-[11px] text-[#F4B75E] truncate leading-normal font-medium">
                    {userDisplayEmail}
                  </span>
                </div>
              </div>

              {/* Settings Gear Icon dengan Dropdown Opsi */}
              <button
                type="button"
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#F4B75E] hover:bg-white/10 transition shrink-0"
                title="Pengaturan Akun & Aksi"
              >
                <Settings size={18} />
              </button>
            </div>
          ) : (
            /* Mode Collapsed: Avatar di tengah dengan Settings Modal saat diklik */
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="relative size-10 rounded-full bg-[#081D35] border border-[#F4B75E]/40 overflow-hidden flex items-center justify-center hover:border-[#F4B75E] transition group"
                title={`${userDisplayName} (${getRoleDisplayName()})`}
              >
                <img
                  src="logo.png"
                  alt={userDisplayName}
                  className="size-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
                <span className="font-bold text-xs text-[#F4B75E] uppercase select-none">
                  {getUserInitials()}
                </span>

                {/* Tooltip Collapsed */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F2C59] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {userDisplayName} • Pengaturan
                </div>
              </button>
            </div>
          )}

          {/* DROPDOWN POPUP DARI SETTINGS GEAR / AVATAR */}
          {showSettingsDropdown && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0F2C59] border border-[#1E3A5F] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-[#1E3A5F]">
                <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                <p className="text-[11px] text-[#F4B75E] font-medium truncate">{getRoleDisplayName()}</p>
              </div>

              {onOpenQuickSwitch && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsDropdown(false)
                    onOpenQuickSwitch()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <UserCheck size={15} className="text-sky-400" />
                  <span>Simulasi Ganti Role</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowSettingsDropdown(false)
                  onOpenMarketplace()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <ShoppingBag size={15} className="text-[#F4B75E]" />
                <span>Marketplace Rempah</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsDropdown(false)
                  onPublicVerify()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <QrCode size={15} className="text-emerald-400" />
                <span>Verifikasi Blockchain</span>
              </button>

              {onOpenQueueModal && pendingSyncCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsDropdown(false)
                    onOpenQueueModal()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-500/15 transition"
                >
                  <Database size={15} className={`text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : `Antrean Offline (${pendingSyncCount})`}</span>
                </button>
              )}

              <div className="border-t border-[#1E3A5F] pt-1" />

              <button
                type="button"
                onClick={() => {
                  setShowSettingsDropdown(false)
                  onLogout()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 transition font-medium"
              >
                <LogOut size={15} />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* TOAST PEMBERITAHUAN SAAT NOTIFIKASI DIKLIK */}
      {showNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#081D35] text-white border border-[#1E3A5F] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="size-8 rounded-full bg-[#F4B75E]/20 text-[#F4B75E] flex items-center justify-center">
            <Bell size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Notifikasi Ekosistem Aktif</p>
            <p className="text-[11px] text-slate-300">
              Ada {totalNotifications} antrean layanan surat &amp; verifikasi kebun yang memerlukan tindak lanjut.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotificationToast(false)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================================
          3. AREA KONTEN UTAMA (DI KANAN SIDEBAR)
      ====================================================================== */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-24' : 'lg:ml-72'
        } pt-16 lg:pt-0`}
      >
        {/* Floating Topbar / Header Minimalis Satu Baris Bergaya Vuexy / Sneat UI */}
        <header className="sticky top-3 z-30 mx-4 sm:mx-6 lg:mx-8 mt-3 mb-2 h-14 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between px-4 sm:px-5">
          {/* Sisi Kiri: Search Bar Global Melebar Tanpa Border Kotak Dalam */}
          <div className="relative flex items-center flex-1 max-w-xl gap-2.5 mr-4" ref={searchContainerRef}>
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari data, batch, berkas... (Ctrl+/)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedResultIndex(0)
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-transparent border-none text-xs sm:text-sm text-[#081D35] placeholder-slate-400 focus:outline-none focus:ring-0 p-0 leading-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedResultIndex(0)
                  searchInputRef.current?.focus()
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200 shrink-0 select-none">
              Ctrl+/
            </kbd>

            {/* POPUP HASIL PENCARIAN CEPAT (COMMAND PALETTE DROPDOWN) */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[560px] mt-2.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 px-3">
                  <span className="text-[11px] font-bold tracking-wide uppercase text-slate-500">
                    {searchQuery.trim()
                      ? `Hasil Pencarian (${searchResults.length})`
                      : 'Pintasan & Akses Cepat'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Esc untuk tutup
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((res, idx) => {
                      const Icon = res.icon
                      const isSelected = idx === selectedResultIndex
                      return (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => res.action()}
                          onMouseEnter={() => setSelectedResultIndex(idx)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F2C59]/10 text-[#081D35] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#0F2C59] text-[#F4B75E] shadow-xs'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                                {res.title}
                              </span>
                              {res.badge && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    res.badgeColor || 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {res.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-snug">
                              {res.subtitle}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
                              <CornerDownLeft size={12} />
                              <span>Pilih</span>
                            </div>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <Search size={28} className="mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600">
                        Tidak ada hasil untuk "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Coba kata kunci lain seperti surat, kebun, panen, atau NIK.
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    Gunakan <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">↓</kbd> untuk navigasi
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">Enter</kbd> untuk buka
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Deretan Tombol Ikon Utilitas Rapi */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Minimalist Telemetry Icon (Khusus Admin Sistem - 21st.dev Style) */}
            {isAdmin && (
              <div className="relative" ref={telemetryPopoverRef}>
                <button
                  type="button"
                  onClick={() => setShowTelemetryPopover(!showTelemetryPopover)}
                  className={`relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    showTelemetryPopover
                      ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                      : 'text-slate-500 hover:text-[#081D35] hover:bg-slate-100'
                  }`}
                  title="Telemetri Infrastruktur Kepulauan (Khusus Admin)"
                  aria-label="Telemetri Infrastruktur"
                >
                  <Server size={18} />
                  {/* Status indicator ping (21st.dev style) */}
                  <span className="absolute top-1.5 right-1.5 flex size-2">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                        healthError ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span
                      className={`relative inline-flex size-2 rounded-full ${
                        healthError ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </span>
                </button>

                {showTelemetryPopover && (
                  <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#081D35] text-[#F4B75E]">
                          <Activity size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#081D35] leading-tight">
                            Telemetri Infrastruktur
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            PostGIS 3 • PostgreSQL 15 • FastAPI
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          healthError
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            healthError ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                        />
                        {healthError ? 'KENDALA SISTEM' : 'SISTEM OPERASIONAL'}
                      </span>
                    </div>

                    {loadingHealth && (
                      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-[#D97706]" />
                        Memeriksa koneksi layanan backend...
                      </div>
                    )}

                    {healthError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-2">
                        ⚠️ Backend offline: {healthError}
                      </div>
                    )}

                    {systemHealth && !loadingHealth && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 border-l-[3px] border-l-[#F4B75E]">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            API Gateway
                          </span>
                          <span className="text-xs font-black text-[#D97706] block">
                            {systemHealth.services?.api?.toUpperCase() || 'HEALTHY'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            v{systemHealth.version || '1.0.0'}
                          </span>
                        </div>

                        <div
                          className={`p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 border-l-[3px] ${
                            systemHealth.services?.database === 'connected'
                              ? 'border-l-emerald-500'
                              : 'border-l-amber-500'
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            Database
                          </span>
                          <span
                            className={`text-xs font-black block ${
                              systemHealth.services?.database === 'connected'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {systemHealth.services?.database?.toUpperCase() || 'CONNECTED'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            PostGIS 3
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 border-l-[3px] border-l-sky-500">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            Global
                          </span>
                          <span className="text-xs font-black text-sky-700 block">
                            {systemHealth.status?.toUpperCase() || 'HEALTHY'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            bandanaira.com
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Privilese Super Administrator</span>
                      <span className="font-mono">WIT (Waktu Banda)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* a. Indikator Status Sistem ("Online" dengan Titik Hijau) */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
                  : 'bg-amber-50 text-amber-800 border-amber-200/70'
              }`}
              title={isOnline ? 'Sistem Terhubung Online' : 'Sistem Mode Offline'}
            >
              <span
                className={`size-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden md:inline font-medium text-[11px]">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* b. Tombol Toggle Dark/Light Mode (Ikon Bulan) */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-[#081D35] hover:bg-slate-100 transition cursor-pointer"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Mode Tampilan"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
            </button>

            {/* c. Tombol Quick Menu / App Grid (Ikon Kotak 4) */}
            <div className="relative" ref={quickMenuDropdownRef}>
              <button
                type="button"
                onClick={() => setShowQuickMenuDropdown(!showQuickMenuDropdown)}
                className="p-2 rounded-xl text-slate-500 hover:text-[#081D35] hover:bg-slate-100 transition cursor-pointer"
                title="Pintasan Cepat Ekosistem"
                aria-label="Pintasan Cepat"
              >
                <LayoutGrid size={18} />
              </button>

              {showQuickMenuDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pintasan Cepat Ekosistem
                    </p>
                  </div>
                  <div className="space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickMenuDropdown(false)
                        onOpenLanding()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#081D35] hover:bg-slate-50 transition text-left"
                    >
                      <Home size={16} className="text-[#0F2C59]" />
                      <div>
                        <p className="leading-tight">Beranda Desa</p>
                        <p className="text-[10px] text-slate-400 font-normal">Portal satu pintu Banda Neira</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickMenuDropdown(false)
                        onPublicVerify()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#081D35] hover:bg-slate-50 transition text-left"
                    >
                      <QrCode size={16} className="text-emerald-600" />
                      <div>
                        <p className="leading-tight">Verifikasi Batch Blockchain</p>
                        <p className="text-[10px] text-slate-400 font-normal">Cek keaslian sertifikat rempah</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickMenuDropdown(false)
                        onOpenMarketplace()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#081D35] hover:bg-slate-50 transition text-left"
                    >
                      <ShoppingBag size={16} className="text-[#D97706]" />
                      <div>
                        <p className="leading-tight">Marketplace Rempah</p>
                        <p className="text-[10px] text-slate-400 font-normal">Komoditas langsung dari petani</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* d. Tombol Notifikasi (Ikon Lonceng) dengan Badge Angka Merah di Pojok Kanan Atas */}
            <button
              type="button"
              onClick={() => {
                setShowNotificationToast(true)
                setTimeout(() => setShowNotificationToast(false), 3500)
              }}
              className="relative p-2 rounded-xl text-slate-500 hover:text-[#081D35] hover:bg-slate-100 transition cursor-pointer"
              title="Pemberitahuan Ekosistem"
              aria-label="Notifikasi"
            >
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                {totalNotifications}
              </span>
            </button>
          </div>
        </header>

        {/* Konten Ruang Kerja Dinamis */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
