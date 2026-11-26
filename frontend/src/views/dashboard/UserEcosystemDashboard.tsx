import React, { useState, useEffect } from 'react'
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Eye,
  Mail,
  Sprout,
  MapPin,
  Home,
  BookOpen,
  Layers,
  Scale,
  Sparkles,
  Search,
  ArrowRight,
  Shield,
  Activity,
  FileText,
  DollarSign,
  Compass,
  ShoppingBag,
} from 'lucide-react'
import { setPreferredTourismSubTab } from '../../services/tourism'
import {
  RoleKey,
  DashboardNavTab,
  ROLE_PROFILES,
  FarmerDashboardView,
  FarmerGroupDashboardView,
  VillageOfficerDashboardView,
  CoopManagerDashboardView,
  HomestayOperatorDashboardView,
  FieldSurveyorDashboardView,
  ResidentDashboardView,
  SmartTourismDashboardView,
  TouristDashboardView,
  AdminDashboardView,
} from './roles'

export type { DashboardNavTab, RoleKey }

export interface UserEcosystemDashboardProps {
  currentUser: any
  onNavigate: (tab: DashboardNavTab) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  onLogout?: () => void
  isOnline?: boolean
}

/**
 * Komponen Jam Real-time Terisolasi (React.memo)
 * Memastikan interval 1 detik HANYA me-render ulang badge waktu ini saja,
 * dan TIDAK memicu re-render berat pada seluruh dasbor, grafik Recharts, atau role views.
 */
export const LiveClockBadge: React.FC = React.memo(() => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jayapura',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jayapura',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
      <Clock size={15} className="text-[#F4B75E]" />
      <span className="font-semibold text-slate-700">{formattedDate}</span>
      <span className="text-slate-300">•</span>
      <span className="font-mono font-bold text-[#081D35] tabular-nums">{formattedTime} WIT</span>
    </div>
  )
})

export const UserEcosystemDashboard: React.FC<UserEcosystemDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenMarketplace,
  onPublicVerify,
  isOnline = true,
}) => {
  const [quickVerifyInput, setQuickVerifyInput] = useState('')
  const [showModuleLaunchpad, setShowModuleLaunchpad] = useState(false)
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null)

  // Ekstraksi Peran Pengguna Sebenarnya
  const roles: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isAdmin = isSuperuser || roles.includes('admin')
  const isHomestayOperator = roles.includes('homestay_operator') || roles.includes('operator_homestay')
  const isSmartTourismAdmin = roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')
  const isOfficerOrAdmin = isAdmin || roles.includes('village_officer')
  const canAccessTourism = isAdmin || isHomestayOperator || isSmartTourismAdmin || isOfficerOrAdmin

  const detectInitialRoleKey = (): RoleKey => {
    if (isSuperuser || roles.includes('admin')) return 'admin'
    if (roles.includes('village_officer')) return 'village_officer'
    if (roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')) return 'farmer_group_admin'
    if (roles.includes('farmer') || roles.includes('petani')) return 'farmer'
    if (roles.includes('coop_manager') || roles.includes('pengelola_koperasi')) return 'coop_manager'
    if (roles.includes('homestay_operator') || roles.includes('operator_homestay')) return 'homestay_operator'
    if (roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')) return 'smart_tourism_admin'
    if (roles.includes('field_surveyor') || roles.includes('surveyor')) return 'field_surveyor'
    return 'resident'
  }

  // Daftar peran yang secara sah dimiliki oleh pengguna ini (multi-role RBAC)
  const userAllowedRoleKeys: RoleKey[] = React.useMemo(() => {
    if (isAdmin) {
      return Object.keys(ROLE_PROFILES) as RoleKey[]
    }
    const keys: RoleKey[] = []
    if (roles.includes('village_officer')) keys.push('village_officer')
    if (roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')) keys.push('farmer_group_admin')
    if (roles.includes('farmer') || roles.includes('petani')) keys.push('farmer')
    if (roles.includes('coop_manager') || roles.includes('pengelola_koperasi')) keys.push('coop_manager')
    if (roles.includes('homestay_operator') || roles.includes('operator_homestay')) keys.push('homestay_operator')
    if (roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')) keys.push('smart_tourism_admin')
    if (roles.includes('field_surveyor') || roles.includes('surveyor')) keys.push('field_surveyor')
    if (roles.includes('resident') || keys.length === 0) {
      if (!keys.includes('resident')) {
        keys.push('resident')
      }
    }
    return keys
  }, [isAdmin, roles])

  // State peran aktif: Diinisialisasi peran utama, pengguna multi-role dapat beralih antar peran sah miliknya
  const [selectedRoleKey, setSelectedRoleKey] = useState<RoleKey>(detectInitialRoleKey)

  useEffect(() => {
    setSelectedRoleKey(detectInitialRoleKey())
  }, [currentUser])

  // Peran aktif yang efektif: pastikan aman dan terbatas pada peran sah pengguna
  const activeRoleKey: RoleKey = userAllowedRoleKeys.includes(selectedRoleKey)
    ? selectedRoleKey
    : detectInitialRoleKey()
  const profile = ROLE_PROFILES[activeRoleKey] || ROLE_PROFILES.resident

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPublicVerify(quickVerifyInput.trim() || 'BN-BTC-2026-001')
  }

  // Fungsi Ekspor Data Terbuka Fungsional (CSV, JSON, XLSX, API)
  const handleExportData = (format: 'csv' | 'json' | 'xlsx' | 'api') => {
    if (format === 'api') {
      window.open('/docs', '_blank')
      return
    }

    const exportPayload = {
      ekosistem: 'Banda Digital Ecosystem',
      peran_aktif: profile.name,
      tanggal_ekspor: new Date().toISOString(),
      kpi_summary: profile.kpis.map((k) => ({ metrik: k.title, nilai: k.value, tren: k.trend })),
      ringkasan_workspace: profile.workspace1.items,
      tren_grafik: profile.lineChart.data,
      komposisi_donut: profile.donutChart.data,
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profile.exportFilenamePrefix}_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const rows = [
        ['No', 'Metrik KPI', 'Nilai', 'Tren Pertumbuhan'],
        ...profile.kpis.map((k, i) => [i + 1, k.title, k.value, k.trend]),
        [],
        ['No', 'Aktivitas Workspace', 'Pencapaian', 'Persentase'],
        ...profile.workspace1.items.map((it, i) => [i + 1, it.name, it.stat, `${it.percent}%`]),
      ]
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
      const encodedUri = encodeURI(csvContent)
      const a = document.createElement('a')
      a.href = encodedUri
      a.download = `${profile.exportFilenamePrefix}_${Date.now()}.${format === 'xlsx' ? 'csv' : 'csv'}`
      a.click()
    }

    setDownloadSuccessNotice(`Berkas ${format.toUpperCase()} (${profile.shortBadge}) berhasil diunduh.`)
    setTimeout(() => setDownloadSuccessNotice(null), 4000)
  }

  // Router Seleksi Komponen Dashboard Berdasarkan Role Aktif
  const renderRoleDashboard = () => {
    const roleProps = {
      currentUser,
      profile,
      onNavigate,
      onOpenMarketplace,
      onPublicVerify,
      handleExportData,
      quickVerifyInput,
      setQuickVerifyInput,
      handleVerifySubmit,
      showModuleLaunchpad,
      setShowModuleLaunchpad,
      isOnline,
    }

    switch (activeRoleKey) {
      case 'farmer':
        return <FarmerDashboardView {...roleProps} />
      case 'farmer_group_admin':
        return <FarmerGroupDashboardView {...roleProps} />
      case 'village_officer':
        return <VillageOfficerDashboardView {...roleProps} />
      case 'coop_manager':
        return <CoopManagerDashboardView {...roleProps} />
      case 'homestay_operator':
        return <HomestayOperatorDashboardView {...roleProps} />
      case 'field_surveyor':
        return <FieldSurveyorDashboardView {...roleProps} />
      case 'resident':
        return <ResidentDashboardView {...roleProps} />
      case 'smart_tourism_admin':
        return <SmartTourismDashboardView {...roleProps} />
      case 'tourist':
        return <TouristDashboardView {...roleProps} />
      case 'admin':
        return <AdminDashboardView {...roleProps} />
      default:
        return <ResidentDashboardView {...roleProps} />
    }
  }

  const userDisplayName = currentUser?.full_name || currentUser?.username || 'Pengguna Ekosistem'

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto py-1 px-1 sm:px-2 text-[#081D35]">
      {/* =====================================================================
          1. EXECUTIVE COMMAND HEADER: SELAMAT DATANG & BAROMETER RESMI
      ====================================================================== */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#081D35]/10 text-[#081D35] border border-[#081D35]/20">
              <Sparkles size={12} className="text-[#F4B75E]" />
              <span>Pusat Komando Tata Kelola Ekosistem Digital Banda Neira</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isOnline ? '4 Stasiun IoT Aktif' : 'Mode Offline PWA'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Shield size={11} />
              <span>UU PDP No. 27/2022</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#081D35] tracking-tight">
            Selamat Datang, {userDisplayName}! 👋
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            Platform terpadu pemantauan 6 dusun kepulauan, rantai pasok rempah pala terverifikasi blockchain EVM, administrasi kependudukan desa, dan sirkularitas air bersih RO.
          </p>
        </div>

        {/* Right Info Cluster: Live Clock & Quick Launchers */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <LiveClockBadge />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowModuleLaunchpad(!showModuleLaunchpad)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-[#0c2a4d] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Compass size={14} />
              <span>{showModuleLaunchpad ? 'Tutup Modul' : '🚀 Peluncur Modul'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenMarketplace}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <DollarSign size={14} className="text-emerald-600" />
              <span>Pasar Rempah</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. TOP 5 HEADLINE BENTO KPI: BAROMETER EKOSISTEM KEPULAUAN
          (Sesuai kpi-dashboard-design/SKILL.md: 4-6 headline KPIs eksekutif)
      ====================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Kependudukan & NIK Sah */}
        <div
          onClick={() => onNavigate('population')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Kependudukan</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#081D35] mb-1">
              1.842 <span className="text-xs font-bold text-slate-500">Jiwa</span>
            </div>
            <div className="text-xs text-slate-500">
              Terverifikasi 6 Dusun Desa
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              AES-256 + Blind Index
            </span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-blue-600 transition" />
          </div>
        </div>

        {/* Card 2: Lahan Perkebunan Rempah */}
        <div
          onClick={() => onNavigate('farming')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Perkebunan Rempah</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 group-hover:scale-110 transition-transform">
                <Sprout size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#081D35] mb-1">
              42 <span className="text-xs font-bold text-slate-500">Plot</span>
            </div>
            <div className="text-xs text-slate-500">
              48.5 Hektar Lahan Adat Poktan
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Kadastral PostGIS
            </span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-emerald-600 transition" />
          </div>
        </div>

        {/* Card 3: Produksi Panen & Rantai Pasok EVM */}
        <div
          onClick={() => onNavigate('traceability')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-purple-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Panen &amp; Pasok</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700 group-hover:scale-110 transition-transform">
                <Layers size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#081D35] mb-1">
              15.4 <span className="text-xs font-bold text-slate-500">Ton</span>
            </div>
            <div className="text-xs text-slate-500">
              Pala &amp; Fuli Grade A Super
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              14 Batch On-Chain
            </span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-purple-600 transition" />
          </div>
        </div>

        {/* Card 4: Koperasi Kasir & Air RO */}
        <div
          onClick={() => onNavigate('koperasi')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Koperasi Hatta</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 group-hover:scale-110 transition-transform">
                <Scale size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#081D35] mb-1">
              Rp 48.6 <span className="text-xs font-bold text-slate-500">Jt</span>
            </div>
            <div className="text-xs text-slate-500">
              1.250 L Air Minum Bersih RO
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              Sirkular Bank Sampah
            </span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-amber-600 transition" />
          </div>
        </div>

        {/* Card 5: Kesiapan IoT 4 Stasiun & Surat */}
        <div
          onClick={() => onNavigate('iot')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">IoT &amp; Resiliensi</span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-700 group-hover:scale-110 transition-transform">
                <Radio size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#081D35] mb-1">
              4 / 4 <span className="text-xs font-bold text-slate-500">Stasiun</span>
            </div>
            <div className="text-xs text-slate-500">
              38 PPM Kemurnian (Standar WHO)
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              100% SLA Pelayanan
            </span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-sky-600 transition" />
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. ZERO-TRUST PUBLIC VERIFICATION & QUICK COMMAND BAR
      ====================================================================== */}
      <div className="bg-gradient-to-r from-[#081D35] to-[#0f2c59] text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#F4B75E]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Verifikasi Integritas Data &amp; Sertifikat Terbuka
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Periksa keabsahan surat resmi desa, sertifikat mutu batch pala, atau blind index NIK secara instan.
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Masukkan NIK, Kode Batch, atau Hash EVM..."
              value={quickVerifyInput}
              onChange={(e) => setQuickVerifyInput(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F4B75E] transition"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4B75E] text-[#081D35] hover:bg-[#e5a84f] transition shadow-xs cursor-pointer shrink-0"
          >
            Verifikasi
          </button>
        </form>
      </div>

      {/* =====================================================================
          4. PEMILIH PERSPEKTIF ROLE (ADMINISTRATOR & PENGGUNA MULTI-ROLE)
      ====================================================================== */}
      {userAllowedRoleKeys.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Eye size={14} className="text-[#0284C7]" />
              <span>
                {isAdmin
                  ? 'Kontrol Perspektif Peran Pengguna (Role Simulation Switcher):'
                  : 'Peralihan Peran & Ruang Kerja Aktif:'}
              </span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              {isAdmin
                ? 'Simulasi perspektif 10 aktor ekosistem Banda'
                : `Anda memiliki ${userAllowedRoleKeys.length} peran aktif dalam ekosistem digital`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {userAllowedRoleKeys.map((rKey) => {
              const p = ROLE_PROFILES[rKey]
              const isSelected = activeRoleKey === rKey
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setSelectedRoleKey(rKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <span>{p.shortBadge}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Notice Berhasil Unduh Data Terbuka */}
      {downloadSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{downloadSuccessNotice}</span>
        </div>
      )}

      {/* =====================================================================
          5. DRAWER / BENTO FAST-LAUNCHPAD RUANG KERJA (11 MODUL OPERASIONAL)
      ====================================================================== */}
      {showModuleLaunchpad && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#081D35] flex items-center gap-2">
                <Compass size={16} className="text-[#F4B75E]" />
                <span>Peluncur Cepat Seluruh 11 Ruang Kerja Operasional Banda Neira</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih modul kerja yang ingin Anda buka langsung sesuai kebutuhan tugas
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModuleLaunchpad(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              Tutup ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Kependudukan */}
            <button
              type="button"
              onClick={() => {
                onNavigate('population')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-left transition cursor-pointer group"
            >
              <Users size={18} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Kependudukan</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Master NIK warga desa</p>
            </button>

            {/* 2. Pelayanan Surat */}
            <button
              type="button"
              onClick={() => {
                onNavigate('letters')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-left transition cursor-pointer group"
            >
              <Mail size={18} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Pelayanan Surat</p>
              <p className="text-[11px] text-slate-500 mt-0.5">SKU &amp; domisili warga</p>
            </button>

            {/* 3. Plot Kebun GIS */}
            <button
              type="button"
              onClick={() => {
                onNavigate('farming')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition cursor-pointer group"
            >
              <MapPin size={18} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Plot Kebun GIS</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Batas kadastral poktan</p>
            </button>

            {/* 4. Panen Rempah */}
            <button
              type="button"
              onClick={() => {
                onNavigate('traceability')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition cursor-pointer group"
            >
              <Sprout size={18} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Panen Rempah</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Grading mutu &amp; batch</p>
            </button>

            {/* 5. Kasir Koperasi */}
            <button
              type="button"
              onClick={() => {
                onNavigate('koperasi')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 text-left transition cursor-pointer group"
            >
              <Scale size={18} className="text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Kasir Koperasi</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Air RO &amp; bank sampah</p>
            </button>

            {/* 6. Peta Spasial GIS 7-Layer */}
            <button
              type="button"
              onClick={() => {
                onNavigate('gis')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 text-left transition cursor-pointer group"
            >
              <Layers size={18} className="text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Peta Spasial GIS</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Studio peta kepulauan</p>
            </button>

            {/* 7. Cagar Budaya & Eco-Stay (Hanya Operator Homestay, Admin Wisata, atau Petugas/Admin) */}
            {canAccessTourism && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('tourism')
                  setShowModuleLaunchpad(false)
                }}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 text-left transition cursor-pointer group"
              >
                <Home size={18} className="text-[#F4B75E] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-[#081D35]">Wisata &amp; Eco-Stay</p>
                <p className="text-[11px] text-slate-500 mt-0.5">177 Situs &amp; akomodasi</p>
              </button>
            )}

            {/* 8. DSS SAW Smart Planner (Hanya untuk Administrator) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('smart_planner')
                  setShowModuleLaunchpad(false)
                }}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition cursor-pointer group"
              >
                <Activity size={18} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-[#081D35]">Smart Planner SAW</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Kalkulator DSS cerdas</p>
              </button>
            )}

            {/* 9. Telemetri IoT 4 Stasiun */}
            <button
              type="button"
              onClick={() => {
                onNavigate('iot')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 text-left transition cursor-pointer group"
            >
              <Radio size={18} className="text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Telemetri IoT</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cuaca &amp; kualitas air RO</p>
            </button>

            {/* 10. Jejak Audit & Kripto */}
            <button
              type="button"
              onClick={() => {
                onNavigate('audit')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left transition cursor-pointer group"
            >
              <ShieldCheck size={18} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Jejak Audit EVM</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Validasi SHA-256 mutasi</p>
            </button>

            {/* 11. Survei Lapangan & Pipa ETL */}
            <button
              type="button"
              onClick={() => {
                onNavigate('survei')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 text-left transition cursor-pointer group"
            >
              <FileText size={18} className="text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Survei Lapangan</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pipa ETL NoSQL-PostGIS</p>
            </button>

            {/* 12. Redaksi Pokdarwis CMS */}
            <button
              type="button"
              onClick={() => {
                setPreferredTourismSubTab('cms')
                onNavigate('tourism')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 text-left transition cursor-pointer group"
            >
              <BookOpen size={18} className="text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Arsip Sejarah CMS</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Literasi &amp; narasi budaya</p>
            </button>

            {/* 13. Kelola Marketplace Rempah & Komoditas */}
            <button
              type="button"
              onClick={() => {
                onNavigate('marketplace')
                setShowModuleLaunchpad(false)
              }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 text-left transition cursor-pointer group"
            >
              <ShoppingBag size={18} className="text-[#F4B75E] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#081D35]">Kelola Marketplace</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Katalog &amp; pesanan</p>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. RENDER DASHBOARD MODULAR PER ROLE AKTIF
      ====================================================================== */}
      <div className="w-full">
        {renderRoleDashboard()}
      </div>

      {/* =====================================================================
          7. FOOTER BANNER LANSKAP HISTORIS BANDA NEIRA
          (Gunung Api Banda, Benteng Belgica, Pohon Pala & Perahu Kora-Kora)
      ====================================================================== */}
      {activeRoleKey !== 'smart_tourism_admin' && (
        <footer className="relative w-full mt-2 rounded-2xl overflow-hidden border border-slate-200/80 bg-gradient-to-t from-[#081D35] via-[#0F2C59] to-[#1E3A5F] text-white">
          <div className="relative h-28 sm:h-36 w-full flex items-end justify-between px-6 pt-4 pointer-events-none select-none overflow-hidden">
            {/* Siluet Lanskap Alam & Cagar Budaya */}
            <svg
              viewBox="0 0 1200 160"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full opacity-35 text-[#F4B75E]"
            >
              {/* Siluet Gunung Api Banda di Latar Tengah */}
              <path d="M 400 160 L 580 30 Q 600 20 620 30 L 800 160 Z" fill="currentColor" opacity="0.3" />
              <circle cx="600" cy="18" r="8" fill="currentColor" opacity="0.15" />
              <circle cx="615" cy="10" r="12" fill="currentColor" opacity="0.1" />

              {/* Benteng Belgica di Kiri */}
              <polygon points="120,160 120,95 160,80 200,95 200,160" fill="currentColor" opacity="0.45" />
              <polygon points="150,80 160,65 170,80" fill="currentColor" opacity="0.5" />
              <rect x="70" y="120" width="70" height="40" fill="currentColor" opacity="0.35" />
              <rect x="180" y="120" width="70" height="40" fill="currentColor" opacity="0.35" />

              {/* Deretan Pohon Pala & Kelapa */}
              <path d="M 280 160 Q 285 110 300 90 Q 315 110 320 160 Z" fill="currentColor" opacity="0.3" />
              <path d="M 320 160 Q 325 105 340 85 Q 355 105 360 160 Z" fill="currentColor" opacity="0.25" />
              <path d="M 850 160 Q 860 100 880 80 Q 900 100 910 160 Z" fill="currentColor" opacity="0.3" />
              <path d="M 910 160 Q 920 105 940 85 Q 960 105 970 160 Z" fill="currentColor" opacity="0.25" />

              {/* Perahu Kora-Kora Banda di Kanan */}
              <path
                d="M 1000 145 C 1030 140, 1100 140, 1140 145 C 1110 152, 1040 152, 1000 145 Z"
                fill="currentColor"
                opacity="0.6"
              />
              <line x1="1070" y1="145" x2="1070" y2="105" stroke="currentColor" strokeWidth="2" opacity="0.6" />
              <polygon points="1070,105 1095,120 1070,135" fill="currentColor" opacity="0.5" />

              {/* Gelombang Laut Banda */}
              <path
                d="M 0 155 Q 300 148 600 155 Q 900 162 1200 155 L 1200 160 L 0 160 Z"
                fill="#081D35"
                opacity="0.9"
              />
            </svg>

            {/* Teks Identitas Lanskap Banda Neira */}
            <div className="relative z-10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between w-full text-xs">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wider text-base text-[#F4B75E]">
                  Kepulauan Banda Neira
                </span>
                <span className="text-slate-300 hidden md:inline">
                  • Titik Nol Jalur Rempah Dunia &amp; Cagar Budaya Maritim
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 sm:mt-0 font-medium">
                Benteng Belgica • Gunung Api Banda • Perahu Tradisional Kora-Kora
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default UserEcosystemDashboard
