import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
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
  X,
  Bell,
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
  BookOpen,
  CheckCheck,
  Trash2,
  ArrowRight,
  Clock,
  AlertCircle,
  HeartPulse,
} from 'lucide-react'
import { setPreferredTourismSubTab } from '../../services/tourism'
import {
  RoleNotificationItem,
  ROLE_NOTIFICATION_PROFILES,
  generateRoleNotifications,
} from '../../services/roleNotifications'
import { RoleKey } from './roles/types'

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
  | 'marketplace'
  | 'help'
  | 'sejarah'
  | 'faskes'

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
  activeRoleKey?: RoleKey
  onRoleChange?: (role: RoleKey) => void
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
  activeRoleKey,
  onRoleChange,
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
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [showTelemetryPopover, setShowTelemetryPopover] = useState(false)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)
  const quickMenuDropdownRef = useRef<HTMLDivElement>(null)
  const notificationDropdownRef = useRef<HTMLDivElement>(null)
  const telemetryPopoverRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('banda_theme_mode')
      if (saved) return saved === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

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

  // Efek toggle Dark / Light mode pada elemen html dan penyimpanan persistensi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('banda_theme_mode', isDarkMode ? 'dark' : 'light')
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      window.dispatchEvent(new Event('banda_theme_changed'))
    }
  }, [isDarkMode])

  // Dengarkan perubahan tema dari komponen anak (misal workspace switcher)
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
    window.addEventListener('banda_theme_changed', handleThemeChange)
    return () => window.removeEventListener('banda_theme_changed', handleThemeChange)
  }, [])

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
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotificationDropdown(false)
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

  // Ekstraksi peran pengguna ter-memoize (mencegah loop re-render array baru pada useMemo notifikasi)
  const roles: string[] = useMemo(() => {
    if (!currentUser?.roles) return []
    return (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
  }, [currentUser?.roles])
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isAdmin = isSuperuser || roles.includes('admin')
  const isOfficerOrAdmin = isAdmin || roles.some((r) => ['admin', 'village_officer'].includes(r))
  const isFarmer = roles.includes('farmer') || roles.includes('petani')
  const isFarmerGroupAdmin = roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')
  const isHomestayOperator = roles.includes('homestay_operator') || roles.includes('operator_homestay')
  const isCoopManager = roles.includes('coop_manager') || roles.includes('pengelola_koperasi')
  const isSmartTourismAdmin = roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')
  const isSurveyor = roles.includes('field_surveyor') || roles.includes('surveyor')

  // State accordion dropdown untuk 5 Pilar Super Admin
  const [openAdminGroups, setOpenAdminGroups] = useState<Record<string, boolean>>({
    'group-gov': true,
    'group-agri': false,
    'group-coop': false,
    'group-tourism': false,
    'group-iot-sec': false,
  })

  const toggleAdminGroup = (groupId: string) => {
    setOpenAdminGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const getRoleDisplayName = () => {
    if (isSuperuser || roles.includes('admin')) return 'Administrator Sistem'
    if (roles.includes('village_officer')) return 'Petugas Kantor Desa'
    if (isFarmer && roles.includes('resident')) return 'Petani Rempah & Warga'
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

  // Penentuan Peran Aktif yang Efektif untuk Notifikasi
  const currentRoleKey: RoleKey = useMemo(() => {
    if (activeRoleKey) return activeRoleKey
    if (isAdmin) return 'admin'
    if (roles.includes('village_officer')) return 'village_officer'
    if (isFarmerGroupAdmin) return 'farmer_group_admin'
    if (isFarmer) return 'farmer'
    if (isCoopManager) return 'coop_manager'
    if (isHomestayOperator) return 'homestay_operator'
    if (isSmartTourismAdmin) return 'smart_tourism_admin'
    if (isSurveyor) return 'field_surveyor'
    if (roles.includes('tourist')) return 'tourist'
    return 'resident'
  }, [
    activeRoleKey,
    isAdmin,
    roles,
    isFarmerGroupAdmin,
    isFarmer,
    isCoopManager,
    isHomestayOperator,
    isSmartTourismAdmin,
    isSurveyor,
  ])

  const roleNotificationProfile =
    ROLE_NOTIFICATION_PROFILES[currentRoleKey] || ROLE_NOTIFICATION_PROFILES.resident

  const initialNotifications: RoleNotificationItem[] = useMemo(() => {
    return generateRoleNotifications(currentRoleKey, {
      adminPendingLettersCount,
      pendingFarmsCount,
      pendingSyncCount,
      isOnline,
      userName: currentUser?.full_name || currentUser?.username,
    })
  }, [
    currentRoleKey,
    adminPendingLettersCount,
    pendingFarmsCount,
    pendingSyncCount,
    isOnline,
    currentUser?.full_name,
    currentUser?.username,
  ])

  const [notifications, setNotifications] = useState<RoleNotificationItem[]>(initialNotifications)

  useEffect(() => {
    setNotifications((prev) => {
      const prevReadMap = new Map(prev.map((p) => [p.id, p.read]))
      return initialNotifications.map((item) => ({
        ...item,
        read: prevReadMap.has(item.id) ? Boolean(prevReadMap.get(item.id)) : item.read,
      }))
    })
  }, [initialNotifications])

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const [notificationFilter, setNotificationFilter] = useState<string>('all')

  useEffect(() => {
    setNotificationFilter('all')
  }, [currentRoleKey])

  const activeFilterDef =
    roleNotificationProfile.filterTabs.find((t) => t.key === notificationFilter) ||
    roleNotificationProfile.filterTabs[0]

  const filteredNotifications = notifications.filter((item) =>
    activeFilterDef ? activeFilterDef.matcher(item) : true
  )

  const getCategoryIcon = (category: RoleNotificationItem['category']) => {
    switch (category) {
      case 'letter':
        return <Mail size={14} className="text-blue-600" />
      case 'farm':
        return <Sprout size={14} className="text-emerald-600" />
      case 'tourism':
        return <Home size={14} className="text-amber-500" />
      case 'iot':
        return <Radio size={14} className="text-sky-600" />
      case 'coop':
        return <Scale size={14} className="text-amber-700" />
      case 'blockchain':
        return <ShieldCheck size={14} className="text-blue-600" />
      case 'system':
      default:
        return <AlertCircle size={14} className="text-rose-600" />
    }
  }

  const getCategoryBadgeStyle = (category: RoleNotificationItem['category']) => {
    switch (category) {
      case 'letter':
        return 'bg-blue-50 border-blue-200'
      case 'farm':
        return 'bg-emerald-50 border-emerald-200'
      case 'tourism':
        return 'bg-amber-50 border-amber-200'
      case 'iot':
        return 'bg-sky-50 border-sky-200'
      case 'coop':
        return 'bg-amber-50 border-amber-200'
      case 'blockchain':
        return 'bg-blue-50 border-blue-200'
      case 'system':
      default:
        return 'bg-rose-50 border-rose-200'
    }
  }

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
      id: 'faskes',
      label: 'Faskes & Darurat Banda',
      shortLabel: 'Faskes',
      icon: HeartPulse,
      badge: 'SOS',
      visible: true,
    },
    {
      id: 'letters',
      label: isOfficerOrAdmin ? 'Pelayanan Surat' : 'Permohonan Surat',
      shortLabel: 'Surat',
      icon: Mail,
      badge: isOfficerOrAdmin && adminPendingLettersCount > 0 ? adminPendingLettersCount : undefined,
      visible: !isSmartTourismAdmin,
    },
    {
      id: 'population',
      label: 'Kependudukan',
      shortLabel: 'Penduduk',
      icon: Users,
      visible: !isSmartTourismAdmin && isOfficerOrAdmin,
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
      visible: !isSmartTourismAdmin && (isFarmer || isFarmerGroupAdmin || isCoopManager || isOfficerOrAdmin),
    },
    {
      id: 'farming',
      label: isFarmerGroupAdmin ? 'Plot Kebun Poktan' : isFarmer ? 'Peta Kebun Saya' : 'Plot & Peta Kebun',
      shortLabel: 'Kebun',
      icon: MapPin,
      badge: (isFarmerGroupAdmin || isOfficerOrAdmin) && pendingFarmsCount > 0 ? pendingFarmsCount : undefined,
      visible: !isSmartTourismAdmin && (isFarmer || isFarmerGroupAdmin || isOfficerOrAdmin),
    },
    {
      id: 'koperasi',
      label: isCoopManager || isOfficerOrAdmin ? 'Kasir Koperasi Hatta' : 'Koperasi & Tabungan Warga',
      shortLabel: isCoopManager || isOfficerOrAdmin ? 'Kasir' : 'Koperasi',
      icon: Scale,
      visible: !isSmartTourismAdmin,
    },
    {
      id: 'tourism',
      label: isHomestayOperator
        ? 'Kelola Eco-Stay & Tamu'
        : isSmartTourismAdmin
        ? 'Draf Artikel Sejarah'
        : isOfficerOrAdmin
        ? 'Master Data Wisata'
        : 'Cagar Budaya & Wisata',
      shortLabel: isSmartTourismAdmin ? 'Draf Artikel' : 'Wisata',
      icon: isSmartTourismAdmin ? BookOpen : Home,
      visible: isHomestayOperator || isSmartTourismAdmin || isOfficerOrAdmin,
    },
    {
      id: 'gis',
      label: isOfficerOrAdmin ? 'Peta GIS & Spatial Studio' : 'Peta Spasial GIS',
      shortLabel: 'Peta GIS',
      icon: Layers,
      visible: !isSmartTourismAdmin,
    },
    {
      id: 'smart_planner',
      label: 'Perencana Wisata Cerdas DSS',
      shortLabel: 'Smart DSS',
      icon: Compass,
      visible: isAdmin,
    },
    {
      id: 'iot',
      label: 'Telemetri IoT Cuaca',
      shortLabel: 'IoT Cuaca',
      icon: Radio,
      visible: !isSmartTourismAdmin && (isSurveyor || isOfficerOrAdmin),
    },
    {
      id: 'survei',
      label: 'Survei Lapangan',
      shortLabel: 'Survei',
      icon: Database,
      visible: !isSmartTourismAdmin && (isSurveyor || isOfficerOrAdmin),
    },
    {
      id: 'audit',
      label: 'Jejak Audit & Verifikasi',
      shortLabel: 'Audit',
      icon: ShieldCheck,
      visible: !isSmartTourismAdmin && isOfficerOrAdmin,
    },
    {
      id: 'marketplace',
      label: 'Katalog Marketplace Rempah',
      shortLabel: 'Marketplace',
      icon: ShoppingBag,
      visible: true,
    },
  ]

  const visibleItems = sidebarNavItems.filter((item) => item.visible)

  // 4 Tab Utama Navigasi Bawah Mobile Dashboard (Beralih Cepat Sesuai Hak Akses Peran)
  const mobileBottomTabs = useMemo<SidebarItem[]>(() => {
    const dashboardItem: SidebarItem = sidebarNavItems.find((i) => i.id === 'dashboard') || {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
      visible: true,
    }

    const otherVisible = visibleItems.filter((i) => i.id !== 'dashboard' && i.id !== 'faskes')
    const primary3 = otherVisible.slice(0, 3)

    return [dashboardItem, ...primary3]
  }, [visibleItems, sidebarNavItems])

  // 5 Pilar Pengelompokan Khusus Super Administrator
  interface AdminSidebarSubItem {
    id: DashboardNavTab
    label: string
    shortLabel: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    badge?: number | string
    action?: () => void
  }

  interface AdminSidebarGroup {
    id: string
    title: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    items: AdminSidebarSubItem[]
  }

  const adminSidebarGroups: AdminSidebarGroup[] = [
    {
      id: 'group-gov',
      title: 'Tata Kelola & Layanan Darurat',
      icon: Users,
      items: [
        {
          id: 'faskes',
          label: 'Faskes & Darurat Banda',
          shortLabel: 'Faskes',
          icon: HeartPulse,
          badge: 'SOS',
        },
        {
          id: 'population',
          label: 'Verifikasi NIK & Penduduk',
          shortLabel: 'Penduduk',
          icon: Users,
        },
        {
          id: 'letters',
          label: 'Approval & Pelayanan Surat',
          shortLabel: 'Surat',
          icon: Mail,
          badge: adminPendingLettersCount > 0 ? adminPendingLettersCount : undefined,
        },
      ],
    },
    {
      id: 'group-agri',
      title: 'Pertanian & Traceability',
      icon: Sprout,
      items: [
        {
          id: 'farming',
          label: 'Plot Kebun GIS Poktan',
          shortLabel: 'Kebun',
          icon: MapPin,
          badge: pendingFarmsCount > 0 ? pendingFarmsCount : undefined,
        },
        {
          id: 'traceability',
          label: 'Panen & Batch Blockchain',
          shortLabel: 'Rempah',
          icon: Sprout,
        },
        {
          id: 'gis',
          label: 'Peta Spasial GIS 7-Layer',
          shortLabel: 'Peta GIS',
          icon: Layers,
        },
      ],
    },
    {
      id: 'group-coop',
      title: 'Keuangan & Koperasi',
      icon: Scale,
      items: [
        {
          id: 'koperasi',
          label: 'Kasir Koperasi Hatta',
          shortLabel: 'Kasir',
          icon: Scale,
        },
        {
          id: 'marketplace',
          label: 'Kelola Marketplace Rempah',
          shortLabel: 'Marketplace',
          icon: ShoppingBag,
        },
      ],
    },
    {
      id: 'group-tourism',
      title: 'Pariwisata & Budaya',
      icon: Home,
      items: [
        {
          id: 'tourism',
          label: 'Cagar Budaya & Eco-Stay',
          shortLabel: 'Cagar',
          icon: Home,
          action: () => {
            setPreferredTourismSubTab('accommodations')
            onSelectTab('tourism')
          },
        },
        {
          id: 'tourism',
          label: 'CMS Draf Artikel Sejarah',
          shortLabel: 'Artikel',
          icon: BookOpen,
          action: () => {
            setPreferredTourismSubTab('cms')
            onSelectTab('tourism')
          },
        },
        {
          id: 'smart_planner',
          label: 'Perencana Wisata Cerdas DSS',
          shortLabel: 'Smart DSS',
          icon: Compass,
        },
      ],
    },
    {
      id: 'group-iot-sec',
      title: 'IoT & Keamanan Sistem',
      icon: ShieldCheck,
      items: [
        {
          id: 'iot',
          label: 'Telemetri IoT 4 Stasiun',
          shortLabel: 'IoT Cuaca',
          icon: Radio,
        },
        {
          id: 'audit',
          label: 'Jejak Audit & Ledger EVM',
          shortLabel: 'Audit',
          icon: ShieldCheck,
        },
        {
          id: 'survei',
          label: 'Survei Lapangan & Spatial ETL',
          shortLabel: 'Survei',
          icon: Database,
        },
      ],
    },
  ]

  // Buka otomatis grup yang memuat activeTab
  useEffect(() => {
    if (!isAdmin) return
    adminSidebarGroups.forEach((g) => {
      const containsActive = g.items.some((it) => it.id === activeTab)
      if (containsActive) {
        setOpenAdminGroups((prev) => ({ ...prev, [g.id]: true }))
      }
    })
  }, [activeTab, isAdmin])

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
      desc: '177 cagar budaya, Eco-Stay, pemandu HPI & Bank Konten @neirabasudara',
      keywords: [
        'wisata',
        'cagar budaya',
        'homestay',
        'eco-stay',
        'kamar',
        'benteng',
        'belgica',
        'hatta',
        'pemandu',
        'bank konten',
        'cms',
        'literasi',
        'neirabasudara',
        'modul',
        'qc',
        'reels',
      ],
    },
    gis: {
      desc: 'Peta interaktif 7-layer spasial, kontur, dan jalur evakuasi',
      keywords: ['gis', 'peta', 'layer', 'spasial', 'kontur', 'koordinat', 'evakuasi'],
    },
    smart_planner: {
      desc: 'Asisten perencana rute wisata cerdas kepulauan Banda',
      keywords: ['smart planner', 'rute', 'itinerary', 'rekomendasi', 'perencana', 'wisata'],
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
      {
        id: 'act-community-literacy',
        title: 'Bank Konten & Literasi Komunitas (@neirabasudara)',
        subtitle: 'Arsip artikel warga, Reels 9:16, 3 modul literasi & peta sinyal 3T',
        keywords: ['bank konten', 'literasi', 'neirabasudara', 'karya warga', 'modul', 'reels', 'sop', 'sinyal'],
        icon: BookOpen,
        badge: 'Komunitas',
        action: () => {
          setPreferredTourismSubTab('community_literacy')
          onSelectTab('tourism')
        },
      },
    ]

    if (isSmartTourismAdmin) {
      quickActions.push({
        id: 'act-article-draft',
        title: 'Tulis & Draf Artikel Sejarah',
        subtitle: 'Buat draf naskah sejarah baru, edit cerita, dan publikasikan ke /sejarah',
        keywords: ['artikel', 'draf', 'sejarah', 'pokdarwis', 'tulis', 'cerita', 'seo'],
        icon: BookOpen,
        badge: 'Pokdarwis',
        action: () => {
          onSelectTab('tourism')
        },
      })
    } else if (isOfficerOrAdmin) {
      quickActions.push({
        id: 'act-cms-contents',
        title: 'CMS Master Data Wisata',
        subtitle: 'Pengaturan tarif penginapan & pemandu wisata',
        keywords: ['cms', 'wisata', 'tarif', 'homestay', 'pemandu'],
        icon: ShieldCheck,
        badge: 'CMS',
        action: () => {
          setPreferredTourismSubTab('accommodations')
          onSelectTab('tourism')
        },
      })
    }

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
        {/* Sisi Kiri: Logo Asli & Identitas Ekosistem Banda Digital */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-full bg-[#1E3A5F] border border-[#F4B75E]/40 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
            <img src={logoImg} alt="Logo Banda Digital" className="size-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0 truncate">
            <span className="font-bold text-sm tracking-tight text-white font-serif leading-tight">
              bandanaira<span className="text-[#F4B75E]">.com</span>
            </span>
            <span className="text-[10px] text-[#F4B75E] font-medium leading-none truncate max-w-[240px] mt-0.5">
              {getRoleDisplayName()}
            </span>
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
                <div className="size-11 rounded-full bg-[#1E3A5F] border border-[#F4B75E]/30 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-inner">
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

              {/* Tombol ciutkan desktop / tombol tutup mobile drawer */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#F4B75E] hover:bg-white/10 transition active:scale-90"
                  title="Tutup Menu Sidebar"
                  aria-label="Tutup Menu Sidebar"
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed(!collapsed)}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-[#F4B75E] hover:bg-white/10 transition"
                  title="Ciutkan Sidebar"
                >
                  <ChevronDown size={17} className="transition-transform duration-200" />
                </button>
              </div>
            </div>
          ) : (
            /* Mode Collapsed: Emblem di tengah */
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="mx-auto size-11 rounded-full bg-[#1E3A5F] border border-[#F4B75E]/30 flex items-center justify-center p-1.5 overflow-hidden hover:border-[#F4B75E] transition shadow-inner group relative"
              title="Perluas Sidebar"
            >
              <img
                src={logoImg}
                alt="Logo Banda Digital"
                className="size-full object-contain group-hover:scale-105 transition-transform"
              />

              {/* Tooltip Collapsed */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                bandanaira.com (Klik untuk lebarkan)
              </div>
            </button>
          )}
        </div>

        {/* --- 2.2 DAFTAR WORKSPACE UTAMA --- */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {isAdmin ? (
            /* =========================================================
               TAMPILAN KHUSUS SUPER ADMINISTRATOR (ACCORDION 5 PILAR)
            ========================================================= */
            <>
              {/* Tombol Utama: Dashboard Pusat Komando */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('dashboard')
                  setMobileSidebarOpen(false)
                }}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
                  collapsed
                    ? 'justify-center py-2.5 px-0 h-11'
                    : 'gap-3.5 px-3 py-2.5 text-left'
                } ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1E3A5F] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'dashboard' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#F4B75E] rounded-r-full shadow-xs" />
                )}
                <LayoutDashboard
                  size={19}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'dashboard' ? 'text-[#F4B75E]' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-[13px] tracking-tight">Dashboard Komando</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Dashboard Komando
                  </div>
                )}
              </button>

              {/* Tombol Utama 2: Faskes & Darurat Banda (Di Depan Workspace Sidebar) */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('faskes')
                  setMobileSidebarOpen(false)
                }}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
                  collapsed
                    ? 'justify-center py-2.5 px-0 h-11'
                    : 'gap-3.5 px-3 py-2.5 text-left'
                } ${
                  activeTab === 'faskes'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'faskes' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-rose-500 rounded-r-full shadow-xs" />
                )}
                <HeartPulse
                  size={19}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'faskes' ? 'text-rose-400' : 'text-rose-400/80 group-hover:text-rose-300'
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate text-[13px] tracking-tight">Faskes &amp; Darurat</span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[9px] shrink-0">
                      SOS
                    </span>
                  </div>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Faskes &amp; Darurat Banda
                  </div>
                )}
              </button>

              {/* Pemisah Label Kategori Pilar Komando */}
              {!collapsed && (
                <div className="pt-3 pb-1 px-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#F4B75E]/90 border-b border-[#1E3A5F]/60 mb-1">
                  <span>5 Pilar Komando</span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Super Admin</span>
                </div>
              )}

              {/* 5 Grup Accordion Pilar Komando */}
              {adminSidebarGroups.map((group) => {
                const GroupIcon = group.icon
                const isOpen = openAdminGroups[group.id] || false
                const isAnyItemActive = group.items.some((it) => it.id === activeTab)
                const groupTotalBadge = group.items.reduce(
                  (acc, it) => acc + (typeof it.badge === 'number' ? it.badge : 0),
                  0
                )

                return (
                  <div key={group.id} className="space-y-1 pt-1">
                    {/* Header Grup Dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        if (collapsed) {
                          setCollapsed(false)
                        } else {
                          toggleAdminGroup(group.id)
                        }
                      }}
                      className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all group relative ${
                        collapsed
                          ? 'justify-center py-2.5 px-0 h-11'
                          : 'gap-3 px-3 py-2 text-left'
                      } ${
                        isAnyItemActive
                          ? 'text-white bg-white/5 border border-white/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <GroupIcon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          isAnyItemActive ? 'text-[#F4B75E]' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1 text-[12px] font-bold tracking-tight">
                            {group.title}
                          </span>
                          {groupTotalBadge > 0 && (
                            <span className="size-4.5 rounded-full bg-[#F4B75E] text-[#081D35] font-black text-[9px] flex items-center justify-center shrink-0">
                              {groupTotalBadge}
                            </span>
                          )}
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                              isOpen ? 'rotate-180 text-[#F4B75E]' : ''
                            }`}
                          />
                        </>
                      )}
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {group.title}
                        </div>
                      )}
                    </button>

                    {/* Sub-Items Dropdown */}
                    {isOpen && !collapsed && (
                      <div className="ml-3 pl-2.5 border-l-2 border-[#1E3A5F] space-y-1 my-1 animate-fade-in">
                        {group.items.map((subItem, sIdx) => {
                          const SubIcon = subItem.icon
                          const isSubActive = activeTab === subItem.id

                          return (
                            <button
                              key={`${subItem.id}-${sIdx}`}
                              type="button"
                              onClick={() => {
                                if (subItem.action) {
                                  subItem.action()
                                } else {
                                  onSelectTab(subItem.id)
                                }
                                setMobileSidebarOpen(false)
                              }}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition text-left relative ${
                                isSubActive
                                  ? 'bg-[#1E3A5F] text-[#F4B75E] font-bold shadow-xs'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {isSubActive && (
                                <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 size-1.5 bg-[#F4B75E] rounded-full" />
                              )}
                              <SubIcon
                                size={15}
                                className={isSubActive ? 'text-[#F4B75E]' : 'text-slate-400'}
                              />
                              <span className="truncate flex-1 text-[11px]">
                                {subItem.label}
                              </span>
                              {subItem.badge !== undefined && (
                                <span className="px-1.5 py-0.5 rounded-full bg-[#F4B75E] text-[#081D35] font-black text-[9px] shrink-0">
                                  {subItem.badge}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          ) : (
            /* =========================================================
               TAMPILAN FLAT MINIMALIS UNTUK ROLE NON-ADMIN
            ========================================================= */
            visibleItems.map((item) => {
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
                      ? 'bg-[#1E3A5F] text-white font-bold shadow-xs'
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
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              )
            })
          )}

          {/* --- 2.3 GARIS PEMISAH TIPIS ELEGAN SESUAI PALET (#1E3A5F) & UTILITAS --- */}
          {!isSmartTourismAdmin && (
            <>
              <div className="my-3 border-t border-[#1E3A5F] mx-1" />

              {/* Help & Pusat Bantuan Workspace Item */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('help')
                  setMobileSidebarOpen(false)
                }}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
                  collapsed
                    ? 'justify-center py-2.5 px-0 h-11'
                    : 'gap-3.5 px-3 py-2.5 text-left'
                } ${
                  activeTab === 'help'
                    ? 'bg-[#1E3A5F] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Indikator Bar Vertikal Emas (#F4B75E) Aktif di Border Kiri */}
                {activeTab === 'help' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#F4B75E] rounded-r-full shadow-xs" />
                )}

                <HelpCircle
                  size={19}
                  className={`shrink-0 transition-colors ${
                    activeTab === 'help' ? 'text-[#F4B75E]' : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-[13px] tracking-tight">
                    Pusat Bantuan (Help)
                  </span>
                )}

                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Pusat Bantuan &amp; Panduan
                  </div>
                )}
              </button>
            </>
          )}
        </div>

        {/* --- 2.5 USER PROFILE CARD DI BAGIAN BAWAH PERSIS SESUAI GAMBAR --- */}
        <div className="p-3 shrink-0 relative" ref={settingsDropdownRef}>
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-[#1E3A5F]/60 hover:bg-[#0c2a4d] transition border border-[#1E3A5F]">
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
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E3A5F] border border-[#1E3A5F] text-white text-xs font-medium rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {userDisplayName} • Pengaturan
                </div>
              </button>
            </div>
          )}

          {/* DROPDOWN POPUP DARI SETTINGS GEAR / AVATAR */}
          {showSettingsDropdown && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#1E3A5F] border border-[#1E3A5F] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
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

      {/* =====================================================================
          3. AREA KONTEN UTAMA (DI KANAN SIDEBAR)
      ====================================================================== */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-24' : 'lg:ml-72'
        } pt-16 lg:pt-0`}
      >
        {/* Floating Topbar / Header Minimalis Satu Baris Bergaya Vuexy / Sneat UI */}
        <header className="sticky top-2 sm:top-3 z-30 mx-2 sm:mx-6 lg:mx-8 mt-2 sm:mt-3 mb-2 h-12 sm:h-14 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between px-3 sm:px-5">
          {/* Sisi Kiri: Search Bar Global Melebar Tanpa Border Kotak Dalam */}
          <div className="relative flex items-center flex-1 max-w-xl gap-2 mr-2 sm:mr-4" ref={searchContainerRef}>
            <Search size={16} className="text-slate-400 shrink-0 sm:w-[18px] sm:h-[18px]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari data, batch, berkas..."
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
                              ? 'bg-[#1E3A5F]/10 text-[#081D35] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#1E3A5F] text-[#F4B75E] shadow-xs'
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

            {/* b. Tombol Toggle Dark/Light Mode (Theme Switcher) dengan Micro-Interaction */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition cursor-pointer relative group flex items-center justify-center ${
                isDarkMode
                  ? 'bg-[#1E3A5F] text-[#F4B75E] hover:bg-[#1E3A5F] shadow-xs border border-[#1E3A5F]'
                  : 'text-slate-500 hover:text-[#081D35] hover:bg-slate-100'
              }`}
              title={isDarkMode ? 'Mode Gelap Aktif (Klik untuk beralih ke Mode Terang)' : 'Mode Terang Aktif (Klik untuk beralih ke Mode Gelap)'}
              aria-label="Toggle Tema Gelap/Terang"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-[#F4B75E] transition-transform duration-300 hover:rotate-90" />
              ) : (
                <Moon size={18} className="text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
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
                      <Home size={16} className="text-[#081D35]" />
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

            {/* d. Tombol Notifikasi (Ikon Lonceng) & Dropdown Pusat Pemberitahuan Ekosistem */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`relative p-2 rounded-xl transition cursor-pointer ${
                  showNotificationDropdown
                    ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                    : 'text-slate-500 hover:text-[#081D35] hover:bg-slate-100'
                }`}
                title="Pemberitahuan Ekosistem Banda Neira"
                aria-label="Pemberitahuan Ekosistem"
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1 min-w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Dropdown Popover Pusat Notifikasi Sesuai Peran */}
              {showNotificationDropdown && (
                <div className="fixed inset-x-2.5 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[26rem] max-h-[85vh] sm:max-h-[34rem] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="p-4 bg-gradient-to-r from-[#081D35] via-[#0c2a4d] to-[#081D35] text-white flex flex-col gap-2.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/10 text-[#F4B75E]">
                          <Bell size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold leading-tight">
                              Pemberitahuan Ekosistem
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase bg-white/15 text-[#F4B75E] border border-white/20">
                              {roleNotificationProfile.roleShortBadge}
                            </span>
                            {unreadNotificationsCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                                {unreadNotificationsCount} Baru
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {unreadNotificationsCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="px-2 py-1 rounded-lg text-slate-300 hover:text-[#F4B75E] hover:bg-white/10 transition cursor-pointer text-[10px] flex items-center gap-1 active:scale-95"
                            title="Tandai semua sudah dibaca"
                          >
                            <CheckCheck size={13} />
                            <span className="hidden sm:inline">Tandai Dibaca</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowNotificationDropdown(false)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer active:scale-95"
                          aria-label="Tutup notifikasi"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                      {roleNotificationProfile.roleSubtitle}
                    </p>

                    {/* Quick Perspective Selector for Admin */}
                    {isAdmin && onRoleChange && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium flex items-center gap-1 text-[10px]">
                          <UserCheck size={12} className="text-[#F4B75E]" />
                          <span>Simulasi Peran:</span>
                        </span>
                        <select
                          value={currentRoleKey}
                          onChange={(e) => onRoleChange(e.target.value as RoleKey)}
                          className="bg-[#040D1A] text-[#F4B75E] font-bold text-[11px] rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#F4B75E] cursor-pointer"
                        >
                          {(Object.keys(ROLE_NOTIFICATION_PROFILES) as RoleKey[]).map((rKey) => (
                            <option key={rKey} value={rKey} className="bg-[#081D35] text-white">
                              {ROLE_NOTIFICATION_PROFILES[rKey].roleShortBadge}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Filter Chips Sesuai Peran Aktif */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar text-[11px] shrink-0">
                    {roleNotificationProfile.filterTabs.map((tab) => {
                      const active = notificationFilter === tab.key
                      const count = tab.key === 'all'
                        ? notifications.length
                        : tab.key === 'unread'
                        ? unreadNotificationsCount
                        : notifications.filter(tab.matcher).length

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setNotificationFilter(tab.key)}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                            active
                              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/70'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            active ? 'bg-white/20 text-[#F4B75E]' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* List of Notification Items */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-10 px-4 text-center text-slate-400">
                        <CheckCheck size={32} className="mx-auto mb-2 text-emerald-500 opacity-80" />
                        <p className="text-xs font-bold text-slate-700">
                          Tidak ada notifikasi aktif untuk peran {roleNotificationProfile.roleShortBadge}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Semua antrean layanan dan tugas telah terselesaikan.
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 transition flex gap-3 relative group ${
                            item.read ? 'bg-white hover:bg-slate-50/80' : 'bg-blue-50/40 hover:bg-blue-50/60'
                          }`}
                        >
                          {/* Indicator dot */}
                          {!item.read && (
                            <span className="absolute left-1.5 top-4 size-1.5 rounded-full bg-blue-600 shrink-0" />
                          )}

                          {/* Icon Category */}
                          <div className="shrink-0 pt-0.5">
                            <div className={`p-2 rounded-xl border ${getCategoryBadgeStyle(item.category)}`}>
                              {getCategoryIcon(item.category)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                                  {item.categoryLabel}
                                </span>
                                <h5 className={`text-xs font-bold leading-snug line-clamp-1 ${item.read ? 'text-slate-700' : 'text-[#081D35]'}`}>
                                  {item.title}
                                </h5>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(item.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 p-0.5 transition cursor-pointer shrink-0"
                                title="Hapus pemberitahuan"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 flex items-center gap-1 font-medium">
                                <Clock size={10} />
                                <span>{item.timestamp}</span>
                              </span>

                              <div className="flex items-center gap-1.5">
                                {!item.read && (
                                  <button
                                    type="button"
                                    onClick={() => markNotificationAsRead(item.id)}
                                    className="text-slate-400 hover:text-blue-600 font-bold transition px-1.5 py-0.5 rounded cursor-pointer min-h-[28px] flex items-center"
                                    title="Tandai sudah dibaca"
                                  >
                                    Dibaca
                                  </button>
                                )}
                                {item.targetTab && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.targetTab) onSelectTab(item.targetTab)
                                      markNotificationAsRead(item.id)
                                      setShowNotificationDropdown(false)
                                    }}
                                    className="min-h-[28px] px-2.5 py-1 rounded-md bg-[#081D35] hover:bg-[#0c2a4d] active:scale-95 text-[#F4B75E] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                  >
                                    <span>{item.actionLabel || 'Buka'}</span>
                                    <ArrowRight size={10} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-4 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Notifikasi Peran: {roleNotificationProfile.roleShortBadge}</span>
                    </span>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer active:scale-95 min-h-[28px] px-1"
                      >
                        <Trash2 size={11} />
                        <span>Bersihkan</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Konten Ruang Kerja Dinamis (dengan safe bottom padding pb-24 untuk mobile bottom bar) */}
        <div className="flex-1 p-2 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* =====================================================================
          4. MOBILE BOTTOM APP BAR (Navigasi Bawah Dashboard untuk Beralih Lebih Cepat)
      ====================================================================== */}
      <nav
        id="dashboard-mobile-bottom-bar"
        aria-label="Navigasi Bawah Dashboard"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#081D35]/95 backdrop-blur-xl border-t border-[#1E3A5F] px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] select-none pointer-events-auto will-change-transform"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around relative">
          {/* 4 Tab Cepat Utama Berbasis Hak Akses Peran */}
          {mobileBottomTabs.map((tabItem) => {
            const TabIcon = tabItem.icon
            const isTabActive = activeTab === tabItem.id && !mobileSidebarOpen

            return (
              <motion.button
                key={tabItem.id}
                type="button"
                whileTap={{ scale: 0.86 }}
                onClick={() => {
                  if (activeTab === tabItem.id) {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  } else {
                    onSelectTab(tabItem.id)
                  }
                  setMobileSidebarOpen(false)
                }}
                aria-label={`Beralih ke ${tabItem.label}`}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
                  isTabActive ? 'text-[#F4B75E]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {/* Active Indicator Glow Animation */}
                {isTabActive && (
                  <motion.div
                    layoutId="dashboard-bottom-indicator"
                    className="absolute inset-0 bg-gradient-to-b from-[#F4B75E]/20 via-[#F4B75E]/10 to-transparent rounded-2xl -z-10 border border-[#F4B75E]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{
                    scale: isTabActive ? 1.15 : 1,
                    y: isTabActive ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="relative flex items-center justify-center"
                >
                  <TabIcon size={20} className={isTabActive ? 'text-[#F4B75E]' : 'text-slate-400'} />
                  {isTabActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#F4B75E] shadow-[0_0_8px_#F4B75E]"
                    />
                  )}
                  {tabItem.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-[#F4B75E] text-[#081D35] font-black text-[9px] flex items-center justify-center">
                      {tabItem.badge}
                    </span>
                  )}
                </motion.div>
                <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none truncate max-w-[58px]">
                  {tabItem.shortLabel || tabItem.label}
                </span>
              </motion.button>
            )
          })}

          {/* Tab 5: Menu / Semua Workspace (Membuka Sidebar Drawer Lengkap) */}
          {(() => {
            const isMenuSpecialActive = !mobileBottomTabs.some((t) => t.id === activeTab) || mobileSidebarOpen

            return (
              <motion.button
                type="button"
                whileTap={{ scale: 0.86 }}
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label={mobileSidebarOpen ? 'Tutup Menu Sidebar' : 'Buka Semua Menu Ruang Kerja'}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-colors duration-200 cursor-pointer min-h-[44px] relative ${
                  mobileSidebarOpen || isMenuSpecialActive ? 'text-[#F4B75E]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isMenuSpecialActive && (
                  <motion.div
                    layoutId="dashboard-bottom-indicator"
                    className="absolute inset-0 bg-gradient-to-b from-[#F4B75E]/20 via-[#F4B75E]/10 to-transparent rounded-2xl -z-10 border border-[#F4B75E]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{
                    scale: mobileSidebarOpen || isMenuSpecialActive ? 1.15 : 1,
                    y: mobileSidebarOpen || isMenuSpecialActive ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="relative flex items-center justify-center"
                >
                  {mobileSidebarOpen ? (
                    <X size={20} strokeWidth={2.2} />
                  ) : (
                    <LayoutGrid size={20} strokeWidth={isMenuSpecialActive ? 2.2 : 1.8} />
                  )}
                  {isMenuSpecialActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#F4B75E] shadow-[0_0_8px_#F4B75E]"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] font-sans font-medium tracking-tight mt-1 leading-none">
                  {mobileSidebarOpen ? 'Tutup' : 'Semua'}
                </span>
              </motion.button>
            )
          })()}
        </div>
      </nav>
    </div>
  )
}

export default DashboardLayout
