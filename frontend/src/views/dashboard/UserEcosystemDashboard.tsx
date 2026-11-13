import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  Mail,
  ClipboardList,
  BarChart3,
  Search,
  Bell,
  MapPin,
  Compass,
  ShoppingBag,
  ShieldCheck,
  Scale,
  Radio,
  Home,
  Layers,
  Database,
  Sprout,
  Droplets,
  ArrowUpRight,
  Sparkles,
  QrCode,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
} from 'lucide-react'
import { NavTabType } from '../landing/BandanairaBeranda'
import { VERIFIED_MARKETPLACE_PRODUCTS } from '../../components/VerifiedMarketplaceModal'

export type DashboardNavTab = NavTabType | 'landing' | 'dashboard'

export interface UserEcosystemDashboardProps {
  currentUser: any
  onNavigate: (tab: DashboardNavTab) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  onLogout?: () => void
  isOnline?: boolean
}

// Data tren throughput aktivitas 8 pekan terakhir (Layanan Desa & Komoditas Rempah)
const ECOSYSTEM_THROUGHPUT_DATA = [
  { pekan: 'Pekan 1', pengajuan: 32, terverifikasi: 28 },
  { pekan: 'Pekan 2', pengajuan: 45, terverifikasi: 38 },
  { pekan: 'Pekan 3', pengajuan: 41, terverifikasi: 40 },
  { pekan: 'Pekan 4', pengajuan: 58, terverifikasi: 52 },
  { pekan: 'Pekan 5', pengajuan: 62, terverifikasi: 59 },
  { pekan: 'Pekan 6', pengajuan: 75, terverifikasi: 68 },
  { pekan: 'Pekan 7', pengajuan: 84, terverifikasi: 79 },
  { pekan: 'Pekan 8', pengajuan: 96, terverifikasi: 91 },
]

export const UserEcosystemDashboard: React.FC<UserEcosystemDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenMarketplace,
  onPublicVerify,
  onLogout,
  isOnline = true,
}) => {
  const [quickVerifyInput, setQuickVerifyInput] = useState('')
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [showNotificationToast, setShowNotificationToast] = useState(false)

  // Role detection
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
  const isResident = roles.includes('resident') || roles.includes('warga') || (!isOfficerOrAdmin && !isFarmer && !isHomestayOperator)

  const getRoleDisplayName = () => {
    if (isSuperuser || roles.includes('admin')) return 'Administrator Sistem'
    if (roles.includes('village_officer')) return 'Perangkat Kantor Desa'
    if (isFarmer) return 'Petani Rempah Pala Banda'
    if (isFarmerGroupAdmin) return 'Ketua Kelompok Tani (Poktan)'
    if (isHomestayOperator) return 'Mitra Usaha & Pengelola Eco-Stay'
    if (isCoopManager) return 'Pengelola Koperasi Hatta'
    if (isSmartTourismAdmin) return 'Pemandu Wisata & Cagar Budaya HPI'
    if (isSurveyor) return 'Surveyor Lapangan & IoT'
    return 'Warga Masyarakat Desa'
  }

  const getUserInitials = () => {
    const name = currentUser?.full_name || currentUser?.username || 'Warga Banda'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickVerifyInput.trim()) return
    onPublicVerify(quickVerifyInput.trim())
  }

  // Kartu Statistik KPI disesuaikan dengan warna Beranda (#081D35, #0F2C59, #F4B75E)
  const STATS_CARDS = [
    {
      label: isFarmer || isFarmerGroupAdmin
        ? 'Batch Panen Aktif'
        : isCoopManager
        ? 'Distribusi Air RO (Liter)'
        : isOfficerOrAdmin
        ? 'Total Warga Terdata'
        : 'Permohonan Surat Saya',
      value: isFarmer || isFarmerGroupAdmin
        ? '12 Batch'
        : isCoopManager
        ? '14.250 L'
        : isOfficerOrAdmin
        ? '1.842 Jiwa'
        : '3 Pengajuan',
      hint: '+4 dari pekan lalu',
      icon: isFarmer || isFarmerGroupAdmin ? Sprout : isCoopManager ? Droplets : isOfficerOrAdmin ? Users : Mail,
      accentColor: '#F4B75E',
      badgeBg: 'bg-[#F4B75E]/15 text-[#92540c]',
    },
    {
      label: isFarmer || isFarmerGroupAdmin
        ? 'Luas Lahan Terpetakan'
        : isCoopManager
        ? 'Tabungan Bank Sampah'
        : isOfficerOrAdmin
        ? 'Surat Perlu Tinjauan'
        : 'Status Berkas Terverifikasi',
      value: isFarmer || isFarmerGroupAdmin
        ? '8.45 Hektar'
        : isCoopManager
        ? 'Rp 18.4 Juta'
        : isOfficerOrAdmin
        ? '5 Menunggu'
        : '2 Selesai',
      hint: '98% kelengkapan data',
      icon: isFarmer || isFarmerGroupAdmin ? MapPin : isCoopManager ? Scale : isOfficerOrAdmin ? ClipboardList : CheckCircle2,
      accentColor: '#173F43',
      badgeBg: 'bg-[#173F43]/10 text-[#173F43]',
    },
    {
      label: isFarmer || isFarmerGroupAdmin
        ? 'Sertifikat Blockchain Terbit'
        : isCoopManager
        ? 'Anggota Koperasi Aktif'
        : isOfficerOrAdmin
        ? 'Plot Kebun Terverifikasi'
        : 'Poin Resiliensi Lingkungan',
      value: isFarmer || isFarmerGroupAdmin
        ? '9 Sertifikat'
        : isCoopManager
        ? '168 Warga'
        : isOfficerOrAdmin
        ? '34 Lahan'
        : '450 Poin',
      hint: '+12% indeks transparansi',
      icon: ShieldCheck,
      accentColor: '#10B981',
      badgeBg: 'bg-emerald-50 text-emerald-800',
    },
    {
      label: isHomestayOperator
        ? 'Tingkat Okupansi Kamar'
        : isCoopManager
        ? 'TDS Sensor Mutu Air'
        : isSurveyor
        ? 'Stasiun IoT Terhubung'
        : 'Tingkat Keberhasilan Selesai',
      value: isHomestayOperator ? '82%' : isCoopManager ? '42 PPM (Aman)' : isSurveyor ? '4/4 Aktif' : '94.2%',
      hint: '+5% performa ekosistem',
      icon: BarChart3,
      accentColor: '#0284C7',
      badgeBg: 'bg-sky-50 text-sky-800',
    },
  ]

  // Proyek / Inisiatif Aktif Kepulauan
  const ACTIVE_PROJECTS = [
    {
      id: 'proj-1',
      title: 'Digitalisasi Panen Pala Super Lonthoir (Grade A)',
      category: 'Rantai Pasok Blockchain',
      status: 'Terverifikasi' as const,
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Pencatatan asal kebun, proses penjemuran matahari 5 hari, dan penerbitan QR batch EVM.',
      progress: 92,
      targetDate: '15 Nov 2026',
      leads: ['Ahmad Baadilla', 'Siti Lonthoir'],
    },
    {
      id: 'proj-2',
      title: 'Pipa Air Bersih RO & Kuota Dispenser Pulau Hatta',
      category: 'Infrastruktur Resiliensi',
      status: 'Dalam Proses' as const,
      statusColor: 'bg-amber-100 text-amber-900 border-amber-200',
      description: 'Pemasangan flow meter IoT dan sistem kartu RFID warga untuk jatah harian air minum layak.',
      progress: 68,
      targetDate: '24 Nov 2026',
      leads: ['Koperasi Hatta', 'Tim KKN UGM'],
    },
    {
      id: 'proj-3',
      title: 'Penetapan Zonasi Wisata Cagar Budaya & Jalur Snorkeling',
      category: 'Smart Tourism DSS',
      status: 'Ditinjau' as const,
      statusColor: 'bg-sky-100 text-sky-800 border-sky-200',
      description: 'Pemutakhiran skor multikriteria SAW untuk rekomendasi rute jelajah Benteng Belgica & Lava Flow.',
      progress: 85,
      targetDate: '30 Nov 2026',
      leads: ['Pemandu HPI', 'Pemdes Banda'],
    },
  ]

  // Feed Aktivitas Terkini Ekosistem
  const RECENT_ACTIVITIES = [
    {
      id: 'act-1',
      actor: 'Ahmad Baadilla',
      role: 'Petani Pala Lonthoir',
      action: 'Mendaftarkan batch panen BN-BTC-2026-001 sebanyak 150 kg pala kupas kering.',
      time: '12 menit lalu',
      badge: 'Panen Rempah',
      badgeColor: 'bg-[#F4B75E]/20 text-[#92540c]',
    },
    {
      id: 'act-2',
      actor: 'Koperasi Hatta',
      role: 'Pengelola Air RO',
      action: 'Menerbitkan laporan distribusi 1.450 liter air minum dan menukar 85 kg botol plastik warga.',
      time: '45 menit lalu',
      badge: 'Koperasi',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'act-3',
      actor: 'Nurul Syahrir',
      role: 'Warga Desa Neira',
      action: 'Mengajukan Surat Keterangan Usaha (SKU) untuk pembiayaan KUR Pertanian Rempah.',
      time: '2 jam lalu',
      badge: 'Layanan Surat',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'act-4',
      actor: 'Sensor Stasiun Neira 01',
      role: 'Telemetri IoT',
      action: 'TDS Air RO terbaca 42 PPM (Kualitas Prima), ketinggian tandon utama berada pada 88%.',
      time: '3 jam lalu',
      badge: 'Telemetri',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ]

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1360px] mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in text-[#0F2C59] bg-[#F7F5F0]">
      {/* =====================================================================
          1. HEADER BAR DASHBOARD (Sesuai 21st.dev dengan Palet Warna Banda Neira)
      ====================================================================== */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center size-12 rounded-xl bg-[#081D35] text-[#F4B75E] font-bold text-lg shadow-sm">
            {getUserInitials()}
            <span
              className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={isOnline ? 'Online' : 'Offline Mode'}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#081D35]">
                Selamat Datang, {currentUser?.full_name || currentUser?.username || 'Warga Banda'}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4B75E]/20 text-[#92540c] border border-[#F4B75E]/40">
                {getRoleDisplayName()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              Portal Komando Ekosistem Digital Terpadu Kepulauan Banda Neira
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Search bar input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari surat, batch, warga..."
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B75E] focus:border-transparent transition w-44 sm:w-56"
            />
          </div>

          {/* Notifikasi Bell */}
          <button
            type="button"
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="relative p-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F2C59] hover:bg-[#F8FAFC] hover:text-[#081D35] transition"
            title="Pemberitahuan Ekosistem"
            aria-label="Notifikasi"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#D97706]" />
          </button>

          {/* Tombol Logout Cepat bila ada */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#DC2626] border border-red-200 bg-red-50 hover:bg-red-100 transition"
            >
              Keluar
            </button>
          )}
        </div>
      </header>

      {/* Toast Notifikasi Ringkas */}
      {showNotificationToast && (
        <div className="p-4 rounded-xl bg-[#081D35] text-white flex items-center justify-between border-l-4 border-[#F4B75E] shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-[#F4B75E] shrink-0" />
            <p className="text-xs sm:text-sm">
              <strong className="text-[#F4B75E]">Info Ekosistem:</strong> Seluruh stasiun telemetri IoT dan pencatatan komoditas rempah beroperasi normal di seluruh 7 pulau.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotificationToast(false)}
            className="text-xs text-white/70 hover:text-white ml-3 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* =====================================================================
          2. KPI STATS CARDS (4 BENTO GRID CARDS GAYA 21st.dev)
      ====================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                style={{ backgroundColor: stat.accentColor }}
              />
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  {stat.label}
                </span>
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${stat.accentColor}18`, color: stat.accentColor }}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  {stat.hint}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* =====================================================================
          3. AREA CHART THROUGHPUT (21st.dev Task & Activity Throughput)
      ====================================================================== */}
      <section className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#081D35] flex items-center gap-2">
              <Activity className="size-5 text-[#F4B75E]" />
              Tren Throughput &amp; Aktivitas Layanan Ekosistem
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Perbandingan berkas permohonan warga yang masuk vs layanan &amp; batch terverifikasi (8 Pekan Terakhir)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[#173F43]">
              <span className="size-2.5 rounded-full bg-[#173F43]" />
              Pengajuan Masuk
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#D97706]">
              <span className="size-2.5 rounded-full bg-[#F4B75E]" />
              Terverifikasi &amp; Selesai
            </span>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ECOSYSTEM_THROUGHPUT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4B75E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F4B75E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#173F43" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#173F43" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="pekan" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#081D35',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #1E3A5F',
                  fontSize: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#F4B75E', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="pengajuan"
                name="Pengajuan Masuk"
                stroke="#173F43"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorPending)"
              />
              <Area
                type="monotone"
                dataKey="terverifikasi"
                name="Terverifikasi"
                stroke="#D97706"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVerified)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =====================================================================
          4. DUA KOLOM: PROJEK / INISIATIF BERJALAN & AKTIVITAS TERKINI (21st.dev)
      ====================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Inisiatif & Rantai Pasok Aktif */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <ClipboardList className="size-4 text-[#F4B75E]" />
                Inisiatif &amp; Rantai Pasok Aktif
              </h2>
              <p className="text-xs text-[#64748B]">
                Progres digitalisasi panen, sertifikasi blockchain, dan instalasi fasilitas
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4B75E]/20 text-[#92540c]">
              3 Aktif
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {ACTIVE_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] transition flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-[#081D35] truncate">
                    {proj.title}
                  </h3>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${proj.statusColor}`}>
                    {proj.status}
                  </span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {proj.description}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D97706] to-[#F4B75E]"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#081D35] shrink-0">
                    {proj.progress}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="size-3 text-[#94A3B8]" />
                    {proj.leads.join(' · ')}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="size-3 text-[#94A3B8]" />
                    Target: {proj.targetDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Aktivitas Terkini Ekosistem */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <Clock className="size-4 text-[#F4B75E]" />
                Aktivitas Terkini Ekosistem
              </h2>
              <p className="text-xs text-[#64748B]">
                Laporan interaksi riil dari warga, petani, koperasi, dan pengelola
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          <ol className="flex flex-col gap-3.5">
            {RECENT_ACTIVITIES.map((act) => (
              <li
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
              >
                <div className="size-8 rounded-full bg-[#081D35] text-[#F4B75E] font-bold text-xs flex items-center justify-center shrink-0">
                  {act.actor.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <p className="text-xs font-semibold text-[#081D35]">
                      {act.actor}
                      <span className="text-[11px] font-normal text-[#64748B] ml-1.5">
                        ({act.role})
                      </span>
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${act.badgeColor}`}>
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-1 leading-snug">
                    {act.action}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1">
                    <Clock className="size-3" />
                    {act.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =====================================================================
          5. PINTU PINTAS MODUL KHUSUS SESUAI ROLE (BENTO QUICK LAUNCHPAD)
      ====================================================================== */}
      <section className="p-6 rounded-2xl bg-[#081D35] text-white shadow-lg flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#F4B75E] flex items-center gap-2">
              <Sparkles className="size-5 text-[#F4B75E]" />
              Aksi Cepat Modul Berdasarkan Peran: {getRoleDisplayName()}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Pilih modul operasional yang diotorisasi khusus untuk peran akun Anda
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-xs font-semibold text-[#F4B75E] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Kembali ke Beranda Utama
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Untuk Warga Desa */}
          {isResident && (
            <button
              type="button"
              onClick={() => onNavigate('letters')}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
            >
              <div className="p-2.5 rounded-lg bg-[#F4B75E]/20 text-[#F4B75E] group-hover:scale-105 transition-transform">
                <Mail className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                  Permohonan Surat Mandiri
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ajukan SKU usaha pala, domisili, atau surat izin secara online.
                </p>
              </div>
            </button>
          )}

          {/* Untuk Petani Rempah & Poktan */}
          {(isFarmer || isFarmerGroupAdmin || isOfficerOrAdmin) && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('traceability')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Sprout className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                    Catatan Panen &amp; Grading Rempah
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Input kuantitas panen pala, jemur alami, dan buat batch baru.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('farming')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
              >
                <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 group-hover:scale-105 transition-transform">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                    Peta Spasial Plot Kebun
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kelola batas lahan kelompok tani dan koordinat pohon pala.
                  </p>
                </div>
              </button>
            </>
          )}

          {/* Untuk Koperasi Hatta */}
          {(isCoopManager || isOfficerOrAdmin) && (
            <button
              type="button"
              onClick={() => onNavigate('koperasi')}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
            >
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                <Scale className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                  Kasir Koperasi &amp; Bank Sampah
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Timbang plastik warga, simpan pinjam, dan kuota air bersih RO.
                </p>
              </div>
            </button>
          )}

          {/* Untuk Operator Wisata & Homestay */}
          {(isHomestayOperator || isSmartTourismAdmin || isOfficerOrAdmin) && (
            <button
              type="button"
              onClick={() => onNavigate('tourism')}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
            >
              <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                <Home className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                  Katalog Eco-Stay &amp; Reservasi
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kelola tarif kamar, amenitas 4A, dan konfirmasi pesan tamu.
                </p>
              </div>
            </button>
          )}

          {/* Untuk Perangkat Desa & Admin */}
          {isOfficerOrAdmin && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('population')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                    Data Warga &amp; Validasi NIK
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kelola kependudukan, status profesi, dan persetujuan surat.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('audit')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                    Rekapitulasi &amp; Jejak Audit
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Log keamanan sistem, ekspor CSV bulanan, dan histori aksi.
                  </p>
                </div>
              </button>
            </>
          )}

          {/* Untuk Surveyor & Telemetri IoT */}
          {(isSurveyor || isOfficerOrAdmin) && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('survei')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
              >
                <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                  <Database className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                    Pipa Survei Lapangan &amp; ETL
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Form dinamis offline, sinkronisasi NoSQL ke PostGIS relasional.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('iot')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Radio className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                    Telemetri 4 Stasiun IoT
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pantau volume tandon air, generator solar, dan suhu tanah.
                  </p>
                </div>
              </button>
            </>
          )}

          {/* Peta GIS 7-Layer Spasial */}
          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-lg bg-[#F4B75E]/20 text-[#F4B75E] group-hover:scale-105 transition-transform">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                Peta Tematik Spasial 7-Layer
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Peta Leaflet PostGIS lengkap dengan batas pulau, kebun, dan reef.
              </p>
            </div>
          </button>

          {/* DSS Smart Planner */}
          <button
            type="button"
            onClick={() => onNavigate('smart_planner')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F4B75E] transition flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white group-hover:text-[#F4B75E] transition-colors">
                Perencana Cerdas SAW (DSS)
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Kalkulasi multikriteria rute wisata dan prioritas krisis air bersih.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* =====================================================================
          6. DUA WIDGET BAWAH: RADAR VERIFIKASI BLOCKCHAIN & PRODUK MARKETPLACE
      ====================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Verifikasi Cepat Batch Blockchain */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-[#081D35] text-[#F4B75E]">
                <QrCode className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#081D35] text-base">
                  Verifikasi Keaslian Rempah Blockchain
                </h3>
                <p className="text-xs text-[#64748B]">
                  Periksa integritas hash kriptografi SHA-256 dan asal kebun pala Banda
                </p>
              </div>
            </div>
            <p className="text-xs text-[#475569] mt-2 leading-relaxed">
              Setiap hasil panen yang lolos grading mutu diikat ke ledger terdistribusi Koperasi Hatta tanpa menyimpan data PII pribadi warga.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: BN-BTC-2026-001"
              value={quickVerifyInput}
              onChange={(e) => setQuickVerifyInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B75E]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#081D35] text-[#F4B75E] hover:bg-[#0F2C59] transition shrink-0"
            >
              Verifikasi
            </button>
          </form>
        </div>

        {/* Akses Cepat Pasar Komoditas Terverifikasi */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-[#F4B75E]/20 text-[#D97706]">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#081D35] text-base">
                  Marketplace Rempah &amp; Produk Pesisir
                </h3>
                <p className="text-xs text-[#64748B]">
                  Katalog komoditas terkurasi langsung dari perkebunan dan nelayan Banda
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {VERIFIED_MARKETPLACE_PRODUCTS.slice(0, 3).map((item) => (
                <span
                  key={item.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#081D35] font-medium"
                >
                  {item.name}
                </span>
              ))}
              <span className="text-xs text-[#64748B]">+lainnya</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMarketplace}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#F4B75E] text-[#081D35] hover:bg-[#E0A24A] transition flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="size-4" />
            Buka Marketplace Komoditas Terverifikasi
          </button>
        </div>
      </section>
    </div>
  )
}

export default UserEcosystemDashboard