import React, { useEffect, useState, useMemo } from 'react'
import {
  RefreshCw,
  Search,
  PlusCircle,
  CheckCircle2,
  X,
  Users,
  ShieldCheck,
  Clock,
  UserCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Printer,
  Sparkles,
  AlertCircle,
  ChevronUp,
  FileSpreadsheet,
  QrCode,
  Home,
  CheckCheck,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import { Resident, ResidentCreateInput, PopulationStatistics, populationService } from '../services/population'
import { User } from '../services/auth'
import { BANDA_OCCUPATIONS, getOccupationBadge } from '../components/OccupationBadge'

interface ResidentsWorkspaceProps {
  currentUser?: User | null
  residents: Resident[]
  popStats: PopulationStatistics | null
  loadingPop: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedOccupationFilter: string
  setSelectedOccupationFilter: (occ: string) => void
  popMsg: { type: 'success' | 'error'; text: string } | null
  popForm: ResidentCreateInput
  setPopForm: React.Dispatch<React.SetStateAction<ResidentCreateInput>>
  fetchPopulationData: (query?: string, occ?: string) => void
  handleCreateResident: (e: React.FormEvent) => void
  handleVerifyResident: (id: string, status: 'verified' | 'rejected') => void
  credentialReceipt?: {
    nik: string
    full_name: string
    username: string
    access_pin: string
    village: string
  } | null
  setCredentialReceipt?: (val: {
    nik: string
    full_name: string
    username: string
    access_pin: string
    village: string
  } | null) => void
}

export const ResidentsWorkspace: React.FC<ResidentsWorkspaceProps> = ({
  currentUser,
  residents,
  popStats,
  loadingPop,
  searchQuery,
  setSearchQuery,
  selectedOccupationFilter,
  setSelectedOccupationFilter,
  popMsg,
  popForm,
  setPopForm,
  fetchPopulationData,
  handleCreateResident,
  handleVerifyResident,
  credentialReceipt,
  setCredentialReceipt,
}) => {
  // UI States
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all')
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [copiedNik, setCopiedNik] = useState<string | null>(null)

  // Resident Account & PIN Credential States
  const [localReceipt, setLocalReceipt] = useState<{
    nik: string
    full_name: string
    username: string
    access_pin: string
    village: string
  } | null>(null)
  const activeReceipt = credentialReceipt !== undefined ? credentialReceipt : localReceipt
  const setActiveReceipt = setCredentialReceipt || setLocalReceipt

  const [showFormPin, setShowFormPin] = useState(false)
  const [resetPinTarget, setResetPinTarget] = useState<Resident | null>(null)
  const [resetPinValue, setResetPinValue] = useState('')
  const [showResetPinValue, setShowResetPinValue] = useState(true)
  const [loadingResetPin, setLoadingResetPin] = useState(false)
  const [resetPinError, setResetPinError] = useState<string | null>(null)
  const [copiedReceipt, setCopiedReceipt] = useState(false)
  const [showReceiptPin, setShowReceiptPin] = useState(false)

  // Sync village with currentUser.village for village officers
  useEffect(() => {
    if (currentUser?.village && popForm.village !== currentUser.village) {
      setPopForm((prev) => ({ ...prev, village: currentUser.village || prev.village || 'Lonthoir' }))
    }
  }, [currentUser?.village, setPopForm, popForm.village])

  // Auto-save form draft in localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('banda_draft_resident')
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed.full_name && !popForm.full_name) {
          setPopForm((prev) => ({ ...prev, ...parsed }))
        }
      }
    } catch {
      // ignore draft error
    }
  }, [])

  useEffect(() => {
    if (popForm.full_name || popForm.nik) {
      try {
        localStorage.setItem('banda_draft_resident', JSON.stringify(popForm))
      } catch {
        // ignore draft error
      }
    }
  }, [popForm])

  // Copy NIK to clipboard helper
  const handleCopyNik = (nik: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard.writeText(nik)
    setCopiedNik(nik)
    setTimeout(() => setCopiedNik(null), 2000)
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    if (residents.length === 0) {
      alert('Tidak ada data penduduk untuk diekspor.')
      return
    }
    const headers = [
      'NIK',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Mata Pencaharian',
      'Desa',
      'RT',
      'RW',
      'Status Verifikasi',
      'Tanggal Daftar',
    ]
    const rows = residents.map((r) => [
      `'${r.nik}`,
      `"${r.full_name.replace(/"/g, '""')}"`,
      r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${(r.occupation || '-').replace(/"/g, '""')}"`,
      r.village || 'Lonthoir',
      r.rt || '-',
      r.rw || '-',
      r.verification_status,
      r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data-penduduk-banda-neira-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Client-side filtering for statusFilter & local quick search
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      // Status filter
      if (statusFilter !== 'all' && r.verification_status !== statusFilter) {
        return false
      }
      return true
    })
  }, [residents, statusFilter])

  // Calculation for Top Occupations Chart Data
  const occupationChartData = useMemo(() => {
    if (popStats?.top_occupations && Object.keys(popStats.top_occupations).length > 0) {
      return Object.entries(popStats.top_occupations)
        .slice(0, 6)
        .map(([name, count]) => ({
          name: name.replace('Tradisional', '').replace('Rempah ', ''),
          fullName: name,
          count,
        }))
    }
    // Fallback based on current residents list
    const counts: Record<string, number> = {}
    residents.forEach((r) => {
      const occ = r.occupation || 'Lainnya'
      counts[occ] = (counts[occ] || 0) + 1
    })
    return Object.entries(counts)
      .slice(0, 6)
      .map(([name, count]) => ({
        name: name.replace('Tradisional', '').replace('Rempah ', ''),
        fullName: name,
        count,
      }))
  }, [popStats, residents])

  // Donut Chart Data for Verification Status
  const verificationDonutData = useMemo(() => {
    const total = popStats?.total_residents || residents.length || 1
    const verified = popStats?.total_verified ?? residents.filter((r) => r.verification_status === 'verified').length
    const pending = popStats?.total_pending ?? residents.filter((r) => r.verification_status === 'pending').length
    const rejected = popStats?.total_rejected ?? residents.filter((r) => r.verification_status === 'rejected').length

    return [
      { name: 'Terverifikasi Sah', value: verified, color: '#10B981', percent: ((verified / total) * 100).toFixed(1) },
      { name: 'Menunggu Verifikasi', value: pending, color: '#F59E0B', percent: ((pending / total) * 100).toFixed(1) },
      { name: 'Ditolak / Perlu Revisi', value: rejected, color: '#EF4444', percent: ((rejected / total) * 100).toFixed(1) },
    ]
  }, [popStats, residents])

  const totalVerifiedCount = popStats?.total_verified ?? residents.filter((r) => r.verification_status === 'verified').length
  const totalPendingCount = popStats?.total_pending ?? residents.filter((r) => r.verification_status === 'pending').length
  const totalCount = popStats?.total_residents ?? residents.length
  const verifiedPercentage = totalCount > 0 ? ((totalVerifiedCount / totalCount) * 100).toFixed(1) : '0'

  const genderL = popStats?.gender_distribution?.['L'] ?? residents.filter((r) => r.gender === 'L').length
  const genderP = popStats?.gender_distribution?.['P'] ?? residents.filter((r) => r.gender === 'P').length
  const totalGender = (genderL + genderP) || 1
  const genderLPercent = Math.round((genderL / totalGender) * 100)
  const genderPPercent = 100 - genderLPercent

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* =========================================================================
          1. CIVIC AUTHORITY HEADER BANNER (WARM HERITAGE & DEEP OCEAN NAVY)
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-radial from-amber-100/40 via-blue-50/20 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0 shadow-md border border-[#F4B75E]/30">
              <Users size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
                  Pemerintahan Desa & Kependudukan
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Basis Data Terverifikasi Dukcapil
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                Administrasi Kependudukan Sipil Desa
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Manajemen identitas warga, penataan klaster mata pencaharian khas Banda Neira, verifikasi berkas e-KTP,
                serta pemantauan demografi kepulauan terpadu.
              </p>

              {currentUser?.village && (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-lg text-xs font-semibold text-blue-900">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span>Yurisdiksi Tugas: Desa {currentUser.village}</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-slate-600 font-medium">Filter Wilayah Otomatis Aktif</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#081D35] hover:bg-[#0F2C59] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              {showForm ? (
                <>
                  <ChevronUp size={16} /> Tutup Formulir
                </>
              ) : (
                <>
                  <PlusCircle size={16} className="text-[#F4B75E]" /> Daftarkan Warga Baru
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-colors"
              title="Unduh data dalam format CSV resmi"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Ekspor CSV</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {residents.length}
              </span>
            </button>

            <button
              onClick={() => fetchPopulationData(searchQuery, selectedOccupationFilter)}
              disabled={loadingPop}
              className="inline-flex items-center justify-center w-10 h-10 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200/90 shadow-2xs transition-colors disabled:opacity-50"
              title="Muat ulang data dari server"
            >
              <RefreshCw size={16} className={loadingPop ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Pop Message Banner (Feedback Alert) */}
      {popMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border shadow-xs animate-fade-in ${
            popMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {popMsg.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{popMsg.text}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. EXECUTIVE KPI CARDS CLUSTER (5 METRIC BENTO CARDS)
      ========================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Penduduk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Penduduk</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#081D35]">{totalCount.toLocaleString('id-ID')}</span>
            <span className="text-xs font-semibold text-slate-500">Jiwa</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>100% Terdaftar di Database Desa</span>
          </div>
        </div>

        {/* KPI 2: Terverifikasi Sah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terverifikasi Sah</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalVerifiedCount.toLocaleString('id-ID')}</span>
            <span className="text-xs font-semibold text-slate-500">Warga</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="text-emerald-700 font-bold">{verifiedPercentage}%</span>
            <span>cakupan identitas sah</span>
          </div>
        </div>

        {/* KPI 3: Menunggu Verifikasi */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'pending' ? 'all' : 'pending'))}
          className={`bg-white rounded-2xl p-5 border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20'
              : 'border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Verifikasi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{totalPendingCount.toLocaleString('id-ID')}</span>
            <span className="text-xs font-semibold text-slate-500">Berkas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-amber-800">
            <span>Perlu Validasi NIK</span>
            <span className="underline text-[10px]">Klik saring</span>
          </div>
        </div>

        {/* KPI 4: Komposisi Gender */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rasio Gender</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-indigo-900">{genderL} L</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-base font-bold text-rose-700">{genderP} P</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full transition-all duration-500"
                style={{ width: `${genderLPercent}%` }}
                title={`Laki-laki: ${genderLPercent}%`}
              />
              <div
                className="bg-rose-400 h-full transition-all duration-500"
                style={{ width: `${genderPPercent}%` }}
                title={`Perempuan: ${genderPPercent}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
              <span>{genderLPercent}% Pria</span>
              <span>{genderPPercent}% Wanita</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Dusun & Profesi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Klaster Profesi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#081D35]">
              {Object.keys(popStats?.top_occupations || {}).length || 6}
            </span>
            <span className="text-xs font-semibold text-slate-500">Kategori</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Didominasi Petani & Nelayan</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DUAL ANALYTICAL CHARTS CLUSTER (RECHARTS BAR & DONUT)
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri (7 Kolom): Bar Chart Sebaran Mata Pencaharian */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Distribusi Mata Pencaharian Warga Banda Neira
                </h3>
              </div>
              {selectedOccupationFilter && (
                <button
                  onClick={() => {
                    setSelectedOccupationFilter('')
                    fetchPopulationData(searchQuery, '')
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200"
                >
                  Reset ({selectedOccupationFilter})
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Perbandingan jumlah warga berdasarkan 6 mata pencaharian tradisional utama di Kepulauan Banda.
            </p>
          </div>

          <div className="w-full h-56 sm:h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={occupationChartData}
                margin={{ top: 10, right: 15, left: -20, bottom: 20 }}
                onClick={(e: any) => {
                  const active = e?.activePayload
                  if (active && active.length > 0) {
                    const occFullName = active[0].payload.fullName
                    setSelectedOccupationFilter(occFullName)
                    fetchPopulationData(searchQuery, occFullName)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#081D35] text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
                          <p className="font-bold text-[#F4B75E]">{data.fullName}</p>
                          <p className="mt-1 font-semibold">{data.count} Warga Terdata</p>
                          <p className="text-[10px] text-slate-300 mt-0.5 italic">Klik batang untuk memfilter tabel</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#059669" maxBarSize={45}>
                  {occupationChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        selectedOccupationFilter === entry.fullName
                          ? '#F4B75E'
                          : index % 2 === 0
                          ? '#059669'
                          : '#2563EB'
                      }
                      className="cursor-pointer transition-all hover:opacity-85"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Klik pada salah satu batang grafik untuk langsung menyaring daftar tabel warga di bawah</span>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Donut Chart Status Validasi Identitas */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Status Verifikasi e-KTP Desa
              </h3>
            </div>
            <p className="text-xs text-slate-500">Integritas dokumen kependudukan warga kepulauan.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
            {/* Donut Container with Center Label */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#081D35',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={verificationDonutData}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {verificationDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sah</span>
                <span className="text-lg font-black text-[#081D35] leading-none mt-0.5">{verifiedPercentage}%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
              {verificationDonutData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const st = idx === 0 ? 'verified' : idx === 1 ? 'pending' : 'rejected'
                    setStatusFilter((prev) => (prev === st ? 'all' : (st as any)))
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    statusFilter === (idx === 0 ? 'verified' : idx === 1 ? 'pending' : 'rejected')
                      ? 'bg-slate-50 border-slate-400 font-bold'
                      : 'border-slate-100 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-[#081D35]">{item.value}</span>
                    <span className="text-[10px] text-slate-400 font-medium w-9 text-right">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>NIK terenkripsi standar AES-256 dan terverifikasi secara kanonikal.</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. FORM PENDAFTARAN WARGA BARU (ELEGANT SLIDE-DOWN DRAWER)
      ========================================================================== */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-6 animate-fade-in relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">Formulir Registrasi Penduduk Baru</h3>
                <p className="text-xs text-slate-500">
                  Daftarkan warga ke dalam basis data kependudukan desa dengan format NIK resmi 16 digit.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateResident} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Field NIK */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">NIK (16 Digit Wajib e-KTP)</label>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      popForm.nik?.length === 16
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {popForm.nik?.length || 0}/16 Digit
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={popForm.nik}
                  onChange={(e) => setPopForm({ ...popForm, nik: e.target.value.replace(/\D/g, '') })}
                  required
                  pattern="^\d{16}$"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  placeholder="Contoh: 8171010101900001"
                />
              </div>

              {/* Field Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={popForm.full_name}
                  onChange={(e) => setPopForm({ ...popForm, full_name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  placeholder="Nama sesuai KTP..."
                />
              </div>

              {/* Field Jenis Kelamin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPopForm({ ...popForm, gender: 'L' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      popForm.gender === 'L'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Laki-laki (L)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopForm({ ...popForm, gender: 'P' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      popForm.gender === 'P'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Perempuan (P)</span>
                  </button>
                </div>
              </div>

              {/* Field Mata Pencaharian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Pencaharian Khas Banda</label>
                <select
                  value={popForm.occupation || 'Petani Rempah Pala'}
                  onChange={(e) => setPopForm({ ...popForm, occupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                >
                  {BANDA_OCCUPATIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Desa Domisili */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Desa Domisili</label>
                <input
                  type="text"
                  value={currentUser?.village || popForm.village || 'Lonthoir'}
                  readOnly={Boolean(currentUser?.village)}
                  onChange={(e) => setPopForm({ ...popForm, village: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-slate-800 outline-none transition-all ${
                    currentUser?.village
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-semibold'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-400'
                  }`}
                  placeholder="Contoh: Lonthoir, Selamon, Neira..."
                />
              </div>

              {/* Field RT & RW */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">RT</label>
                  <input
                    type="text"
                    value={popForm.rt || ''}
                    onChange={(e) => setPopForm({ ...popForm, rt: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-amber-400 outline-none"
                    placeholder="01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">RW / Dusun</label>
                  <input
                    type="text"
                    value={popForm.rw || ''}
                    onChange={(e) => setPopForm({ ...popForm, rw: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-amber-400 outline-none"
                    placeholder="02"
                  />
                </div>
              </div>

              {/* Field PIN / Kata Sandi Akun Mandiri Warga */}
              <div className="md:col-span-2 lg:col-span-3 p-4 bg-gradient-to-r from-amber-50/90 to-amber-50/40 border border-amber-200/80 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
                      <KeyRound size={15} />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-[#081D35]">
                        PIN / Kata Sandi Akses Warga
                      </label>
                      <span className="text-[10px] text-slate-500 ml-2 font-normal">
                        (Opsional • Minimal 6 karakter / digit angka)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const autoPin = Math.floor(100000 + Math.random() * 900000).toString()
                      setPopForm({ ...popForm, access_pin: autoPin })
                      setShowFormPin(true)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles size={13} className="text-amber-700" />
                    <span>Generate PIN Otomatis</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showFormPin ? 'text' : 'password'}
                    value={popForm.access_pin || ''}
                    onChange={(e) => setPopForm({ ...popForm, access_pin: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all placeholder:font-sans placeholder:font-normal"
                    placeholder="Contoh: 240589 (Biarkan kosong jika ingin sistem membuat PIN 6 digit otomatis)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPin(!showFormPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showFormPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  >
                    {showFormPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                  <span>
                    Akun warga otomatis dibuat dengan <b>Username = NIK</b>. Warga dapat login langsung untuk permohonan surat & cek saldo air RO.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 italic">
                * Draft isian tersimpan otomatis pada browser lokal aparatur desa.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingPop}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <CheckCheck size={16} /> Simpan Data Warga
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          5. QUICK OCCUPATION CHIPS & FILTER BAR
      ========================================================================== */}
      {popStats?.top_occupations && Object.keys(popStats.top_occupations).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-base">🏝️</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Filter Cepat Profesi Khas Banda
              </span>
            </div>
            {selectedOccupationFilter && (
              <button
                onClick={() => {
                  setSelectedOccupationFilter('')
                  fetchPopulationData(searchQuery, '')
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1"
              >
                <X size={12} /> Hapus Saringan ({selectedOccupationFilter})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedOccupationFilter('')
                fetchPopulationData(searchQuery, '')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedOccupationFilter === ''
                  ? 'bg-[#081D35] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Semua Profesi</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedOccupationFilter === '' ? 'bg-[#F4B75E] text-[#081D35]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {totalCount}
              </span>
            </button>

            {Object.entries(popStats.top_occupations).map(([occ, count]) => {
              const isSelected = selectedOccupationFilter === occ
              let icon = '👤'
              if (occ.toLowerCase().includes('pala')) icon = '🌿'
              else if (occ.toLowerCase().includes('nelayan') || occ.toLowerCase().includes('laut')) icon = '🐟'
              else if (occ.toLowerCase().includes('cengkeh')) icon = '🌾'
              else if (occ.toLowerCase().includes('fuli') || occ.toLowerCase().includes('pengolah')) icon = '🌺'
              else if (occ.toLowerCase().includes('homestay') || occ.toLowerCase().includes('penginapan')) icon = '🏡'
              else if (occ.toLowerCase().includes('cinderamata') || occ.toLowerCase().includes('kerajinan')) icon = '🎁'
              else if (occ.toLowerCase().includes('wisata') || occ.toLowerCase().includes('pemandu') || occ.toLowerCase().includes('guide')) icon = '⛵'
              else if (occ.toLowerCase().includes('desa') || occ.toLowerCase().includes('asn') || occ.toLowerCase().includes('guru')) icon = '🏛️'

              return (
                <button
                  key={occ}
                  onClick={() => {
                    const next = isSelected ? '' : occ
                    setSelectedOccupationFilter(next)
                    fetchPopulationData(searchQuery, next)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{occ}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          6. SEARCH & STATUS FILTER TOOLBAR
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1 w-full">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari warga berdasarkan Nama, NIK, Dusun, atau Profesi (Tekan Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPopulationData(searchQuery, selectedOccupationFilter)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                fetchPopulationData('', selectedOccupationFilter)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter Segmented Button */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'verified'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Terverifikasi</span>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Clock size={13} />
            <span>Menunggu</span>
          </button>
        </div>

        {/* Search Action Button */}
        <button
          onClick={() => fetchPopulationData(searchQuery, selectedOccupationFilter)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 w-full md:w-auto"
        >
          Cari Data
        </button>
      </div>

      {/* =========================================================================
          7. MASTER DATA TABLE (HIGH-CRAFT BENTO TABLE)
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-[#081D35]">Daftar Registrasi Penduduk Desa</h3>
            <span className="text-xs text-slate-500 font-medium">
              (Menampilkan {filteredResidents.length} dari {residents.length} warga)
            </span>
          </div>
          {statusFilter !== 'all' && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Filter Status: <strong className="capitalize">{statusFilter}</strong>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Lengkap &amp; Dusun</th>
                <th className="py-3.5 px-4">NIK (KTP Warga)</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Mata Pencaharian</th>
                <th className="py-3.5 px-4">Status Validasi</th>
                <th className="py-3.5 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredResidents.map((r) => {
                const isVerified = r.verification_status === 'verified'
                const isPending = r.verification_status === 'pending'

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedResident(r)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                  >
                    {/* Nama & Dusun */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-[#081D35] group-hover:text-[#F4B75E] transition-colors">
                          {r.full_name?.charAt(0)?.toUpperCase() || 'W'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {r.full_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Home size={11} />
                            <span>Desa {r.village || 'Lonthoir'}</span>
                            {r.rt && <span>• RT {r.rt}</span>}
                            {r.rw && <span>/ RW {r.rw}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* NIK (Monospace with copy button) */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <span>{r.nik}</span>
                        <button
                          onClick={(e) => handleCopyNik(r.nik, e)}
                          title="Salin NIK"
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {copiedNik === r.nik ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          r.gender === 'L' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>

                    {/* Mata Pencaharian */}
                    <td className="py-3.5 px-4">{getOccupationBadge(r.occupation)}</td>

                    {/* Status Verifikasi */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-600" /> Terverifikasi
                          </>
                        ) : isPending ? (
                          <>
                            <Clock size={12} className="text-amber-600" /> Menunggu
                          </>
                        ) : (
                          <>
                            <X size={12} className="text-rose-600" /> Ditolak
                          </>
                        )}
                      </span>
                    </td>

                    {/* Tindakan */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isPending && (
                          <button
                            onClick={() => handleVerifyResident(r.id, 'verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                            title="Verifikasi keabsahan identitas warga"
                          >
                            Verifikasi
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setResetPinTarget(r)
                            setResetPinValue(Math.floor(100000 + Math.random() * 900000).toString())
                            setShowResetPinValue(true)
                            setResetPinError(null)
                          }}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-amber-200"
                          title="Atur ulang PIN akun mandiri warga"
                        >
                          <KeyRound size={12} className="text-amber-700" />
                          <span className="hidden xl:inline">Reset PIN</span>
                        </button>
                        <button
                          onClick={() => setSelectedResident(r)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat KTP Digital Warga"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {/* Empty State */}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 px-4 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Search size={22} />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">Tidak ada data penduduk yang cocok</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Coba periksa kata kunci pencarian atau bersihkan filter status dan profesi yang sedang aktif.
                    </p>
                    {(searchQuery || selectedOccupationFilter || statusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedOccupationFilter('')
                          setStatusFilter('all')
                          fetchPopulationData('', '')
                        }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Bersihkan Semua Filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          8. MODAL KARTU IDENTITAS DIGITAL (KTP DIGITAL DESA BANDA NEIRA)
      ========================================================================== */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#081D35] text-white p-5 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4B75E] border border-white/20">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider uppercase font-bold text-[#F4B75E]">
                      Kabupaten Maluku Tengah
                    </span>
                    <h4 className="text-sm font-extrabold tracking-tight">KTP Digital Warga Kepulauan Banda</h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResident(null)}
                  className="text-white/70 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Identitas Card */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-16 h-16 rounded-2xl bg-[#0F2C59] text-white font-black text-2xl flex items-center justify-center shrink-0 border-2 border-[#F4B75E]">
                  {selectedResident.full_name?.charAt(0) || 'W'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-[#081D35] truncate">{selectedResident.full_name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedResident.nik}
                    </span>
                    <button
                      onClick={() => handleCopyNik(selectedResident.nik)}
                      className="text-slate-400 hover:text-slate-600"
                      title="Salin NIK"
                    >
                      {copiedNik === selectedResident.nik ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                  <div className="mt-2">{getOccupationBadge(selectedResident.occupation)}</div>
                </div>
              </div>

              {/* Data Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Jenis Kelamin</span>
                  <span className="font-bold text-slate-800">
                    {selectedResident.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Status Verifikasi</span>
                  <span
                    className={`font-bold capitalize ${
                      selectedResident.verification_status === 'verified'
                        ? 'text-emerald-600'
                        : selectedResident.verification_status === 'pending'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {selectedResident.verification_status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Desa Domisili</span>
                  <span className="font-bold text-slate-800">Desa {selectedResident.village || 'Lonthoir'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Rukun Tetangga / RW</span>
                  <span className="font-bold text-slate-800">
                    RT {selectedResident.rt || '-'} / RW {selectedResident.rw || '-'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                <span>Identitas ini tercatat sah di pangkalan data kependudukan desa Banda Digital Ecosystem.</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                <Printer size={14} /> Cetak Lembar Warga
              </button>

              <div className="flex items-center gap-2">
                {selectedResident.verification_status !== 'verified' && (
                  <button
                    onClick={() => {
                      handleVerifyResident(selectedResident.id, 'verified')
                      setSelectedResident(null)
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Verifikasi Sah
                  </button>
                )}
                <button
                  onClick={() => setSelectedResident(null)}
                  className="px-4 py-2 bg-[#081D35] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. MODAL ATUR ULANG (RESET) PIN AKUN WARGA
      ========================================================================== */}
      {resetPinTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/30">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight">Atur Ulang PIN Akun Warga</h4>
                    <p className="text-[11px] text-amber-100">Kredensial Akses Mandiri Penduduk Desa</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetPinTarget(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Nama Warga:</span>
                  <span className="font-extrabold text-slate-900">{resetPinTarget.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">NIK (Username):</span>
                  <span className="font-mono font-bold text-blue-700">{resetPinTarget.nik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Desa:</span>
                  <span className="font-semibold text-slate-800">Desa {resetPinTarget.village || 'Lonthoir'}</span>
                </div>
              </div>

              {resetPinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{resetPinError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-slate-800">PIN Baru Warga</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetPinValue(Math.floor(100000 + Math.random() * 900000).toString())
                      setShowResetPinValue(true)
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles size={11} /> Generate Acak
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPinValue ? 'text' : 'password'}
                    value={resetPinValue}
                    onChange={(e) => setResetPinValue(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                    placeholder="Minimal 6 karakter / digit angka"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPinValue(!showResetPinValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showResetPinValue ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Setelah direset, PIN lama tidak berlaku lagi dan warga dapat langsung login menggunakan PIN baru ini.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetPinTarget(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loadingResetPin || !resetPinValue || resetPinValue.length < 6}
                onClick={async () => {
                  try {
                    setLoadingResetPin(true)
                    setResetPinError(null)
                    const res = await populationService.resetResidentPin(resetPinTarget.id, resetPinValue)
                    setActiveReceipt({
                      nik: res.nik,
                      full_name: res.full_name,
                      username: res.username,
                      access_pin: res.access_pin,
                      village: resetPinTarget.village || 'Lonthoir',
                    })
                    setResetPinTarget(null)
                  } catch (err: unknown) {
                    if (err instanceof Error) {
                      setResetPinError(err.message)
                    } else {
                      setResetPinError('Gagal mengatur ulang PIN')
                    }
                  } finally {
                    setLoadingResetPin(false)
                  }
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {loadingResetPin ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCheck size={14} /> Simpan PIN Baru
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. MODAL KARTU KREDENSIAL / SLIP TANDA AKSES PORTAL WARGA
      ========================================================================== */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
            {/* Header Kredensial */}
            <div className="bg-[#081D35] text-white p-5 border-b border-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F4B75E] border border-amber-500/40 flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#F4B75E] block">
                      Pemerintah Desa Kepulauan Banda
                    </span>
                    <h4 className="text-sm font-extrabold tracking-tight">Kredensial Akses Layanan Mandiri Warga</h4>
                  </div>
                </div>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="text-white/70 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body: Card Identitas Akses */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Akun portal mandiri warga aktif! Kredensial ini dapat diberikan kepada warga untuk masuk ke sistem.
                </span>
              </div>

              {/* Box Kredensial Formal */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-amber-50/30 border-2 border-amber-200/80 space-y-3.5 relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                  <QrCode size={110} />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Nama Warga
                  </span>
                  <span className="text-base font-extrabold text-[#081D35]">{activeReceipt.full_name}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Username / NIK Login
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-blue-700">
                        {activeReceipt.nik}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeReceipt.nik)
                          setCopiedReceipt(true)
                          setTimeout(() => setCopiedReceipt(false), 2000)
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Salin NIK"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase text-amber-700 font-bold block">
                        PIN Akses Warga
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReceiptPin(!showReceiptPin)}
                        className="text-slate-400 hover:text-slate-700 text-[10px] font-bold"
                      >
                        {showReceiptPin ? 'Tutup' : 'Lihat'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-amber-900 tracking-wider">
                        {showReceiptPin ? activeReceipt.access_pin : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeReceipt.access_pin)
                          setCopiedReceipt(true)
                          setTimeout(() => setCopiedReceipt(false), 2000)
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Salin PIN"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                  <span>Desa Domisili: <b>Desa {activeReceipt.village || 'Lonthoir'}</b></span>
                  <span className="text-emerald-700 font-bold">Status: Akun Aktif</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>• Warga dapat masuk melalui tombol <b>"Masuk"</b> pada beranda atau portal layanan.</p>
                <p>• PIN dapat diganti secara mandiri oleh warga melalui menu Keamanan Akun di Dasbor Warga.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const clipText = `KREDENSIAL LAYANAN MANDIRI WARGA DESA BANDA NEIRA\n` +
                    `Nama: ${activeReceipt.full_name}\n` +
                    `NIK (Username): ${activeReceipt.nik}\n` +
                    `PIN Akses: ${activeReceipt.access_pin}\n` +
                    `Desa: Desa ${activeReceipt.village || 'Lonthoir'}\n` +
                    `Status: Aktif\n` +
                    `Website: https://bandanaira.com`
                  navigator.clipboard.writeText(clipText)
                  setCopiedReceipt(true)
                  setTimeout(() => setCopiedReceipt(false), 2500)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedReceipt ? (
                  <>
                    <Check size={14} className="text-emerald-600" /> Tersalin ke Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Salin Slip Lengkap
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <Printer size={14} /> Cetak Slip
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="px-5 py-2 bg-[#081D35] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
