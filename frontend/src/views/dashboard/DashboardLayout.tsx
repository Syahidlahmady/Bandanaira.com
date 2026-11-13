import React, { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Wifi,
  WifiOff,
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
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Ekstraksi peran pengguna
  const roles: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isOfficerOrAdmin = isSuperuser || roles.some((r) => ['admin', 'village_officer'].includes(r))
  const isFarmer = roles.includes('farmer') || roles.includes('petani')
  const isFarmerGroupAdmin = roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')
  const isHomestayOperator = roles.includes('homestay_operator') || roles.includes('operator_homestay')
  const isCoopManager = roles.includes('coop_manager') || roles.includes('pengelola_koperasi')
  const isSmartTourismAdmin = roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')
  const isSurveyor = roles.includes('field_surveyor') || roles.includes('surveyor')
  const isResident = roles.includes('resident') || roles.includes('warga')

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

  // Definisi Item Navigasi Sidebar berdasarkan Role
  interface SidebarItem {
    id: DashboardNavTab
    label: string
    shortLabel: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    badge?: number | string
    badgeColor?: string
    visible: boolean
  }

  const sidebarNavItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Ringkasan Dasbor',
      shortLabel: 'Dasbor',
      icon: LayoutDashboard,
      visible: true, // Semua role bisa melihat ringkasan
    },
    {
      id: 'letters',
      label: isOfficerOrAdmin ? 'Pelayanan Surat Warga' : 'Permohonan Surat Saya',
      shortLabel: 'Surat Warga',
      icon: Mail,
      badge: isOfficerOrAdmin && adminPendingLettersCount > 0 ? adminPendingLettersCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      visible: isResident || isOfficerOrAdmin,
    },
    {
      id: 'population',
      label: 'Warga & Profesi',
      shortLabel: 'Kependudukan',
      icon: Users,
      visible: isOfficerOrAdmin,
    },
    {
      id: 'traceability',
      label: isFarmer || isFarmerGroupAdmin ? 'Catatan Panen Rempah' : 'Panen & Mutu Rempah',
      shortLabel: 'Panen Rempah',
      icon: Sprout,
      visible: isFarmer || isFarmerGroupAdmin || isCoopManager || isOfficerOrAdmin,
    },
    {
      id: 'farming',
      label: isFarmerGroupAdmin ? 'Peta & Pengajuan Kebun' : isFarmer ? 'Peta Kebun Saya' : 'Peta Kebun & Poktan',
      shortLabel: 'Peta Kebun',
      icon: MapPin,
      badge: (isFarmerGroupAdmin || isOfficerOrAdmin) && pendingFarmsCount > 0 ? pendingFarmsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      visible: isFarmer || isFarmerGroupAdmin || isOfficerOrAdmin,
    },
    {
      id: 'koperasi',
      label: 'Kasir Koperasi & Bank Sampah',
      shortLabel: 'Koperasi Hatta',
      icon: Scale,
      visible: isCoopManager || isOfficerOrAdmin,
    },
    {
      id: 'tourism',
      label: isHomestayOperator ? 'Kelola Eco-Stay & Tamu' : 'Cagar Budaya & Eco-Stay',
      shortLabel: 'Eco-Stay',
      icon: Home,
      visible: isHomestayOperator || isSmartTourismAdmin || isOfficerOrAdmin,
    },
    {
      id: 'gis',
      label: 'Peta Spasial GIS 7-Layer',
      shortLabel: 'Peta GIS',
      icon: Layers,
      visible: isSmartTourismAdmin || isSurveyor || isOfficerOrAdmin,
    },
    {
      id: 'smart_planner',
      label: 'Perencana Cerdas SAW (DSS)',
      shortLabel: 'DSS SAW',
      icon: Compass,
      visible: isSmartTourismAdmin || isSurveyor || isOfficerOrAdmin,
    },
    {
      id: 'iot',
      label: 'Telemetri 4 Stasiun IoT',
      shortLabel: 'Telemetri IoT',
      icon: Radio,
      visible: isSurveyor || isCoopManager || isOfficerOrAdmin,
    },
    {
      id: 'survei',
      label: 'Form Survei & Pipa ETL',
      shortLabel: 'Survei & ETL',
      icon: Database,
      visible: isSurveyor || isOfficerOrAdmin,
    },
    {
      id: 'audit',
      label: 'Rekapitulasi & Jejak Audit',
      shortLabel: 'Jejak Audit',
      icon: ShieldCheck,
      visible: isOfficerOrAdmin,
    },
  ]

  const visibleItems = sidebarNavItems.filter((item) => item.visible)

  return (
    <div className="min-h-screen flex w-full bg-[#F7F5F0] text-[#081D35] relative">
      {/* MOBILE TOPBAR (Untuk Layar Ponsel & Tablet Kecil) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#081D35] text-white flex items-center justify-between px-4 z-40 border-b border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#F4B75E] transition"
            aria-label="Menu Sidebar"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black tracking-wider text-base text-[#F4B75E]">
              bandanaira<span className="text-white">.com</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#0F2C59] border border-[#F4B75E]/30 text-[#F4B75E] font-bold text-xs flex items-center justify-center">
            {getUserInitials()}
          </div>
        </div>
      </div>

      {/* BACKDROP MOBILE */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* =====================================================================
          SIDEBAR NAVIGASI DI SAMPING (DESKTOP & MOBILE DRAWER)
      ====================================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#081D35] text-white border-r border-[#1E3A5F] shadow-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 1. Header Sidebar: Logo & Collapse Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E3A5F]">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-9 rounded-xl bg-gradient-to-br from-[#F4B75E] to-[#D97706] text-[#081D35] flex items-center justify-center font-bold font-serif text-lg shadow-sm shrink-0">
                BN
              </div>
              <div className="flex flex-col truncate">
                <span className="font-serif font-bold text-base tracking-wide text-white">
                  bandanaira<span className="text-[#F4B75E]">.com</span>
                </span>
                <span className="text-[10px] tracking-widest text-[#F4B75E] font-mono uppercase">
                  Ruang Kerja Terpadu
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto size-9 rounded-xl bg-gradient-to-br from-[#F4B75E] to-[#D97706] text-[#081D35] flex items-center justify-center font-bold font-serif text-lg shadow-sm">
              BN
            </div>
          )}

          {/* Tombol ciutkan sidebar (hanya di desktop) */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center size-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title={collapsed ? 'Lebarkan Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* 2. Profil Singkat Pengguna Aktif */}
        <div className="p-4 border-b border-[#1E3A5F] bg-[#0F2C59]/60">
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-xl bg-[#081D35] border border-[#F4B75E]/40 text-[#F4B75E] font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
              {getUserInitials()}
              <span
                className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#081D35] ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={isOnline ? 'Online' : 'Offline'}
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.full_name || currentUser?.username || 'Warga Banda'}
                </p>
                <p className="text-[11px] text-[#F4B75E] truncate font-medium">
                  {getRoleDisplayName()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Daftar Menu Navigasi Berdasarkan Hak Akses Role */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Ruang Kerja Operasional
            </p>
          )}

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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F4B75E] to-[#E0A24A] text-[#081D35] font-bold shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#081D35]' : 'text-[#F4B75E]'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}

          {/* AKSI & MODAL EKOSISTEM */}
          {!collapsed && (
            <p className="px-3 pt-5 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Layanan &amp; Transparansi
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenMarketplace()
              setMobileSidebarOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition group"
            title={collapsed ? 'Marketplace Rempah' : undefined}
          >
            <ShoppingBag size={18} className="shrink-0 text-[#F4B75E] group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate flex-1 text-left">Marketplace Komoditas</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              onPublicVerify()
              setMobileSidebarOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition group"
            title={collapsed ? 'Verifikasi Blockchain' : undefined}
          >
            <QrCode size={18} className="shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate flex-1 text-left">Verifikasi Blockchain</span>}
          </button>

          {onOpenQueueModal && pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onOpenQueueModal()
                setMobileSidebarOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 transition group border border-amber-500/30"
              title={collapsed ? `Antrean Offline (${pendingSyncCount})` : undefined}
            >
              <Database size={18} className="shrink-0 text-amber-400" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">
                    {isSyncing ? 'Menyinkronkan...' : 'Antrean Offline'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-[#081D35]">
                    {pendingSyncCount}
                  </span>
                </>
              )}
            </button>
          )}

          {onOpenQuickSwitch && (
            <button
              type="button"
              onClick={() => {
                onOpenQuickSwitch()
                setMobileSidebarOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-sky-300 hover:bg-sky-500/15 transition group"
              title={collapsed ? 'Simulasi Ganti Role' : undefined}
            >
              <Users size={18} className="shrink-0 text-sky-400" />
              {!collapsed && <span className="truncate flex-1 text-left">Simulasi Ganti Role</span>}
            </button>
          )}
        </div>

        {/* 4. Footer Sidebar: Beranda Satu Pintu & Keluar */}
        <div className="p-3 border-t border-[#1E3A5F] space-y-1.5 bg-[#081D35]">
          <button
            type="button"
            onClick={() => {
              onOpenLanding()
              setMobileSidebarOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#F4B75E] bg-[#F4B75E]/10 hover:bg-[#F4B75E]/20 transition group"
            title={collapsed ? 'Beranda Satu Pintu' : undefined}
          >
            <Home size={18} className="shrink-0 text-[#F4B75E] group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate flex-1 text-left">🏠 Beranda Satu Pintu</span>}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-500/20 transition group"
            title={collapsed ? 'Keluar Akun' : undefined}
          >
            <LogOut size={18} className="shrink-0 text-red-400 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate flex-1 text-left">Keluar Akun</span>}
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN WORKSPACE CONTENT AREA (SEBELAH KANAN SIDEBAR)
      ====================================================================== */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-72'
        } pt-16 lg:pt-0`}
      >
        {/* Top Header Workspace Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold font-serif text-[#081D35] truncate">
              {sidebarNavItems.find((item) => item.id === activeTab)?.label || 'Ruang Kerja Terpadu'}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4B75E]/20 text-[#92540c] border border-[#F4B75E]/30">
              {getRoleDisplayName()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Online/Offline Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi size={13} className="text-emerald-600" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff size={13} className="text-amber-600" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              )}
            </div>

            {/* Tombol Beranda Publik Cepat */}
            <button
              type="button"
              onClick={onOpenLanding}
              className="text-xs font-medium text-[#081D35] hover:text-[#D97706] hover:underline flex items-center gap-1"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Lihat Beranda Publik</span>
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