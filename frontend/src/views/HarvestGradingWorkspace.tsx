import React, { useEffect, useState, useMemo } from 'react'
import {
  QrCode,
  Printer,
  Download,
  ExternalLink,
  X,
  PlusCircle,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Layers,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Box,
  Link2,
  Search,
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
import { Harvest, ProductBatch } from '../services/traceability'
import { Farm, Farmer } from '../services/farmers'

interface HarvestGradingWorkspaceProps {
  harvests: Harvest[]
  batches: ProductBatch[]
  selectedBatch: ProductBatch | null
  setSelectedBatch: (b: ProductBatch | null) => void
  traceMsg: { type: 'success' | 'error'; text: string } | null
  blockchainLoading: string | null
  harvestForm: {
    farm_id: string
    farmer_id: string
    harvest_code: string
    commodity: string
    harvest_date: string
    quantity_kg: number
    quality_grade: string
  }
  setHarvestForm: React.Dispatch<React.SetStateAction<any>>
  handleCreateHarvest: (e: React.FormEvent) => void
  batchForm: {
    batch_code: string
    commodity: string
    production_date: string
    harvest_id: string
    allocated_qty: number
  }
  setBatchForm: React.Dispatch<React.SetStateAction<any>>
  handleCreateBatch: (e: React.FormEvent) => void
  eventForm: {
    event_type: string
    location: string
    description: string
  }
  setEventForm: React.Dispatch<React.SetStateAction<any>>
  handleAppendEvent: (e: React.FormEvent) => void
  handleAnchorBlockchain: (batchId: string) => void
  handleVerifyBlockchain: (batchId: string) => void
  handlePublicVerify: (token: string) => void
  farms: Farm[]
  farmers: Farmer[]
  isOfficerOrAdmin: boolean
  isFarmerGroupAdmin: boolean
  isFarmer: boolean
  isFarmerOnly: boolean
  fetchTraceabilityData: () => void
}

export const HarvestGradingWorkspace: React.FC<HarvestGradingWorkspaceProps> = ({
  harvests,
  batches,
  selectedBatch,
  setSelectedBatch,
  traceMsg,
  blockchainLoading,
  harvestForm,
  setHarvestForm,
  handleCreateHarvest,
  batchForm,
  setBatchForm,
  handleCreateBatch,
  eventForm,
  setEventForm,
  handleAppendEvent,
  handleAnchorBlockchain,
  handleVerifyBlockchain,
  handlePublicVerify,
  farms,
  isOfficerOrAdmin,
  isFarmerGroupAdmin,
  isFarmer,
  isFarmerOnly,
  fetchTraceabilityData,
}) => {
  // UI States
  const [activeFormTab, setActiveFormTab] = useState<'harvest' | 'batch' | null>(null)
  const [previewQrBatch, setPreviewQrBatch] = useState<ProductBatch | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [harvestSearch, setHarvestSearch] = useState('')
  const [commodityFilter, setCommodityFilter] = useState('all')

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'

  const getBatchQrSrc = (batch: ProductBatch) => {
    if (batch.public_verification_token) {
      let origin = typeof window !== 'undefined' ? window.location.origin : ''
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        origin = origin.replace('localhost', '192.168.8.89').replace('127.0.0.1', '192.168.8.89')
      }
      const fullUrl = `${origin}/?verify=${encodeURIComponent(batch.public_verification_token)}`
      return `${apiBase}/public/verify/image/${encodeURIComponent(batch.public_verification_token)}?full_url=${encodeURIComponent(fullUrl)}`
    }
    if (batch.qr_code_base64 && batch.qr_code_base64.trim().length > 0) {
      return batch.qr_code_base64.startsWith('data:image')
        ? batch.qr_code_base64
        : `data:image/png;base64,${batch.qr_code_base64}`
    }
    return ''
  }

  // Auto-save harvest form draft in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('banda_draft_harvest')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.harvest_code && !harvestForm.harvest_code) {
          setHarvestForm((prev: any) => ({ ...prev, ...parsed }))
        }
      }
    } catch {
      // ignore draft error
    }
  }, [])

  useEffect(() => {
    if (harvestForm.harvest_code) {
      try {
        localStorage.setItem('banda_draft_harvest', JSON.stringify(harvestForm))
      } catch {
        // ignore draft error
      }
    }
  }, [harvestForm.harvest_code, harvestForm.quantity_kg, harvestForm.farm_id, setHarvestForm])

  // Copy helper
  const handleCopyText = (text: string, type: 'token' | 'hash') => {
    navigator.clipboard.writeText(text)
    if (type === 'token') {
      setCopiedToken(text)
      setTimeout(() => setCopiedToken(null), 2000)
    } else {
      setCopiedHash(text)
      setTimeout(() => setCopiedHash(null), 2000)
    }
  }

  // Export CSV Handler
  const handleExportHarvestCSV = () => {
    if (harvests.length === 0) {
      alert('Tidak ada data hasil panen untuk diekspor.')
      return
    }
    const headers = ['Kode Panen', 'ID Kebun', 'Komoditas', 'Jumlah (kg)', 'Mutu/Grade', 'Tanggal Panen']
    const rows = harvests.map((h) => [
      `'${h.harvest_code}`,
      `'${h.farm_id}`,
      h.commodity,
      h.quantity_kg,
      `"${(h.quality_grade || 'Grade A Super').replace(/"/g, '""')}"`,
      h.harvest_date,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data-panen-rempah-banda-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculations for KPIs
  const totalHarvestKg = useMemo(() => {
    return harvests.reduce((acc, h) => acc + (Number(h.quantity_kg) || 0), 0)
  }, [harvests])

  const confirmedBatchesCount = useMemo(() => {
    return batches.filter((b) => b.blockchain_status === 'confirmed').length
  }, [batches])

  const onChainRate = batches.length > 0 ? ((confirmedBatchesCount / batches.length) * 100).toFixed(1) : '0'

  const gradeACount = useMemo(() => {
    return harvests.filter((h) => (h.quality_grade || '').toLowerCase().includes('a')).length
  }, [harvests])
  const gradeAPercent = harvests.length > 0 ? Math.round((gradeACount / harvests.length) * 100) : 85

  const uniqueFarmsCount = useMemo(() => {
    return new Set(harvests.map((h) => h.farm_id)).size || farms.length
  }, [harvests, farms])

  // Chart Data 1: Volume Panen per Komoditas (Recharts BarChart)
  const commodityVolumeData = useMemo(() => {
    const map: Record<string, number> = {}
    harvests.forEach((h) => {
      const comm = h.commodity || 'Pala Banda'
      map[comm] = (map[comm] || 0) + (Number(h.quantity_kg) || 0)
    })
    if (Object.keys(map).length === 0) {
      return [
        { name: 'Pala Bulat Grade A', volume: 1250, fill: '#059669' },
        { name: 'Fuli Merah Murni', volume: 420, fill: '#E11D48' },
        { name: 'Pala Standar Grade B', volume: 680, fill: '#D97706' },
        { name: 'Cengkeh Banda', volume: 310, fill: '#2563EB' },
      ]
    }
    return Object.entries(map).map(([name, volume], idx) => ({
      name,
      volume,
      fill: idx % 4 === 0 ? '#059669' : idx % 4 === 1 ? '#E11D48' : idx % 4 === 2 ? '#D97706' : '#2563EB',
    }))
  }, [harvests])

  // Chart Data 2: Komposisi Mutu & Kualitas (Recharts Donut)
  const qualityDonutData = useMemo(() => {
    const counts: Record<string, number> = {}
    harvests.forEach((h) => {
      const g = h.quality_grade || 'Grade A Super'
      counts[g] = (counts[g] || 0) + 1
    })
    if (Object.keys(counts).length === 0) {
      return [
        { name: 'Grade A Super', value: 65, color: '#10B981', percent: '65%' },
        { name: 'Fuli Merah Asli', value: 20, color: '#E11D48', percent: '20%' },
        { name: 'Grade B Standar', value: 15, color: '#F59E0B', percent: '15%' },
      ]
    }
    const total = harvests.length || 1
    const colors = ['#10B981', '#E11D48', '#F59E0B', '#2563EB', '#0284C7']
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
      percent: `${Math.round((value / total) * 100)}%`,
    }))
  }, [harvests])

  // Filtered Harvests
  const filteredHarvests = useMemo(() => {
    return harvests.filter((h) => {
      // Commodity filter
      if (commodityFilter !== 'all' && !h.commodity.toLowerCase().includes(commodityFilter.toLowerCase())) {
        return false
      }
      // Search
      if (harvestSearch.trim()) {
        const query = harvestSearch.toLowerCase()
        const farm = farms.find((f) => f.id === h.farm_id)
        const farmName = farm?.name.toLowerCase() || ''
        const code = h.harvest_code.toLowerCase()
        const comm = h.commodity.toLowerCase()
        return code.includes(query) || farmName.includes(query) || comm.includes(query)
      }
      return true
    })
  }, [harvests, commodityFilter, harvestSearch, farms])

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* =========================================================================
          1. HEADER BANNER: AGRARIAN SPICE TRACEABILITY & GEOGRAPHICAL INDICATION
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-radial from-emerald-100/40 via-amber-50/20 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0 shadow-md border border-[#F4B75E]/30">
              <Sprout size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                  Indikasi Geografis &amp; Sertifikasi Mutu
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Pala &amp; Fuli Banda Neira (Off-Chain Data &bull; EVM On-Chain Proof)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                {(isFarmerOnly || (isFarmer && !isOfficerOrAdmin))
                  ? 'Catatan Hasil Panen Rempah Petani'
                  : 'Manajemen Panen, Mutu & Pelabelan QR Rempah'}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                {(isFarmerOnly || (isFarmer && !isOfficerOrAdmin))
                  ? 'Pencatatan hasil petik pala, fuli merah, dan cengkeh mandiri dari perkebunan Anda. Sistem otomatis menyimpan di memori perangkat saat di kebun tanpa sinyal.'
                  : 'Tata kelola mutu rempah, verifikasi alokasi panen kelompok tani, pelabelan batch QR berstandar internasional, serta penjangkaran hash kriptografis ke blockchain.'}
              </p>

              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-semibold text-emerald-900">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Pencatatan Offline-First Aktif</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-slate-600 font-medium">Bekerja di area kebun tanpa sinyal internet</span>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveFormTab((prev) => (prev === 'harvest' ? null : 'harvest'))}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-[#081D35] hover:bg-[#0c2a4d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle size={16} className="text-[#F4B75E]" />
              <span>{activeFormTab === 'harvest' ? 'Tutup Form' : 'Catat Panen'}</span>
            </button>

            {(isOfficerOrAdmin || isFarmerGroupAdmin) && (
              <button
                onClick={() => setActiveFormTab((prev) => (prev === 'batch' ? null : 'batch'))}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <QrCode size={16} className="text-white" />
                <span>{activeFormTab === 'batch' ? 'Tutup Form' : 'Buat Batch QR'}</span>
              </button>
            )}

            <button
              onClick={handleExportHarvestCSV}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              title="Unduh seluruh rekapitulasi data panen ke file CSV"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Ekspor CSV</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {harvests.length}
              </span>
            </button>

            <button
              onClick={fetchTraceabilityData}
              className="inline-flex items-center justify-center min-h-[44px] px-3.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              title="Segarkan data panen & batch dari server"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pop Alert Message Banner */}
      {traceMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border shadow-xs animate-fade-in ${
            traceMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {traceMsg.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{traceMsg.text}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. EXECUTIVE KPI CARDS CLUSTER (5 BENTO METRIC CARDS)
      ========================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* KPI 1: Total Tonase Panen */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Total Panen</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Sprout size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-[#081D35]">{totalHarvestKg.toLocaleString('id-ID')}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">kg ({((totalHarvestKg / 1000).toFixed(1))} T)</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[9px] sm:text-[11px] font-semibold text-emerald-700 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{harvests.length} Catatan Petik</span>
          </div>
        </div>

        {/* KPI 2: Batch Kemasan Berlabel QR */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Batch Label QR</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <QrCode size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-blue-700">{batches.length}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Batch</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[9px] sm:text-[11px] font-semibold text-slate-600 truncate">
            <span className="text-blue-700 font-bold">100%</span>
            <span className="truncate">token verifikasi publik</span>
          </div>
        </div>

        {/* KPI 3: Integritas Blockchain EVM */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Jangkar EVM</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Link2 size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-blue-700">{confirmedBatchesCount}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Terkonfirmasi</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-blue-900">
            <span>{onChainRate}% Terjangkar</span>
            <span className="text-[9px] text-slate-400 font-mono">Sepolia</span>
          </div>
        </div>

        {/* KPI 4: Mutu Grade A Super & Fuli */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Kualitas Grade A</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-amber-600">{gradeAPercent}%</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Mutu Unggul</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 overflow-hidden flex">
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${gradeAPercent}%` }}
              />
              <div
                className="bg-slate-300 h-full transition-all duration-500"
                style={{ width: `${100 - gradeAPercent}%` }}
              />
            </div>
            <span className="text-[8px] sm:text-[10px] text-slate-500 font-semibold block mt-1 truncate">
              Standar Ekspor Organik
            </span>
          </div>
        </div>

        {/* KPI 5: Cakupan Kebun Rempah (Rentang 2 Kolom di Mobile) */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Kebun Rempah</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Layers size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-[#081D35]">{uniqueFarmsCount}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Lahan Aktif</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[9px] sm:text-[11px] font-semibold text-slate-600 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
            <span className="truncate">Lonthoir, Selamon &amp; Hatta</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DUAL ANALYTICAL CHARTS CLUSTER (RECHARTS BAR & DONUT)
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-stretch">
        {/* Kolom Kiri (7 Kolom): Bar Chart Distribusi Volume Komoditas */}
        <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Distribusi Volume Panen per Komoditas (kg)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Pala &amp; Fuli Merah
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Perbandingan total tonase panen yang dipetik dan disetorkan petani berdasarkan jenis rempah.
            </p>
          </div>

          <div className="w-full h-56 sm:h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commodityVolumeData} margin={{ top: 10, right: 15, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  textAnchor="end"
                  angle={-10}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#081D35] text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
                          <p className="font-bold text-[#F4B75E]">{data.name}</p>
                          <p className="mt-1 font-semibold">{data.volume.toLocaleString('id-ID')} kg</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Sertifikasi Indikasi Geografis Banda</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {commodityVolumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Pala Banda dan Fuli Merah dilindungi Hak Kekayaan Intelektual Indikasi Geografis (IG) Resmi</span>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Donut Chart Komposisi Mutu & Kualitas */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Komposisi Mutu &amp; Kualitas Sortasi
              </h3>
            </div>
            <p className="text-xs text-slate-500">Standarisasi grade pala dan fuli sesuai uji fisik.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
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
                    data={qualityDonutData}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {qualityDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Grade A</span>
                <span className="text-lg font-black text-[#081D35] leading-none mt-0.5">{gradeAPercent}%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full sm:w-auto">
              {qualityDonutData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50/70 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-[#081D35]">{item.value}</span>
                    <span className="text-[10px] text-slate-400 font-medium w-8 text-right">{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/60 flex items-center gap-2 text-xs text-sky-900">
            <Link2 size={16} className="text-sky-700 shrink-0" />
            <span>Tiap batch mengikat identitas petani &amp; poligon kebun ke ledger smart contract EVM.</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. COLLAPSIBLE FORMS CLUSTER (INPUT PANEN & PEMBUATAN BATCH)
      ========================================================================== */}
      {activeFormTab === 'harvest' && (
        <div className="bg-white rounded-2xl border-2 border-emerald-400 shadow-md p-6 animate-fade-in relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sprout size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">Formulir Pencatatan Hasil Panen Rempah</h3>
                <p className="text-xs text-slate-500">
                  Catat hasil panen dari pohon pala, fuli, atau cengkeh. Data akan tersimpan offline jika tidak ada jaringan.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveFormTab(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateHarvest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Field Kebun */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kebun Rempah &amp; Petani</label>
                <select
                  value={harvestForm.farm_id}
                  onChange={(e) => {
                    const f = farms.find((farm) => farm.id === e.target.value)
                    setHarvestForm({
                      ...harvestForm,
                      farm_id: e.target.value,
                      farmer_id: f?.farmer_id || harvestForm.farmer_id,
                    })
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                >
                  <option value="">-- Pilih Kebun Rempah --</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.primary_commodity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Kode Panen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Panen Unik</label>
                <input
                  type="text"
                  value={harvestForm.harvest_code}
                  onChange={(e) => setHarvestForm({ ...harvestForm, harvest_code: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="Contoh: HNV-2026-001"
                />
              </div>

              {/* Field Komoditas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Komoditas Rempah</label>
                <select
                  value={harvestForm.commodity || 'Pala Banda (Myristica fragrans)'}
                  onChange={(e) => setHarvestForm({ ...harvestForm, commodity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="Pala Banda (Myristica fragrans)">Pala Banda (Myristica fragrans)</option>
                  <option value="Fuli Merah Banda">Fuli Merah Banda (Mace)</option>
                  <option value="Cengkeh Banda Asli">Cengkeh Banda Asli</option>
                  <option value="Daging Buah Manisan Pala">Daging Buah Manisan Pala</option>
                </select>
              </div>

              {/* Field Berat (kg) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Berat Panen Bersih (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={harvestForm.quantity_kg || ''}
                  onChange={(e) => setHarvestForm({ ...harvestForm, quantity_kg: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="Contoh: 150.5"
                />
              </div>

              {/* Field Mutu / Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kualitas / Grade Sortasi Awal</label>
                <select
                  value={harvestForm.quality_grade || 'Grade A Super (Pala Bulat)'}
                  onChange={(e) => setHarvestForm({ ...harvestForm, quality_grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="Grade A Super (Pala Bulat)">Grade A Super (Pala Bulat)</option>
                  <option value="Grade A Fuli Merah">Grade A Fuli Merah</option>
                  <option value="Grade B (Pala Keriput)">Grade B (Pala Keriput)</option>
                  <option value="Grade C (Pala Pecah / Biji Tua)">Grade C (Pala Pecah / Biji Tua)</option>
                </select>
              </div>

              {/* Field Tanggal Panen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Petik</label>
                <input
                  type="date"
                  value={harvestForm.harvest_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Draft isian tersimpan otomatis di perangkat lokal aparatur / petani.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFormTab(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simpan Catatan Panen
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeFormTab === 'batch' && (isOfficerOrAdmin || isFarmerGroupAdmin) && (
        <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-md p-6 animate-fade-in relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Box size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">Formulir Penerbitan Batch Kemasan &amp; Label QR</h3>
                <p className="text-xs text-slate-500">
                  Alokasikan hasil panen ke dalam batch kemasan resmi, terbitkan token verifikasi QR, dan persiapkan jangkar on-chain.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveFormTab(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Asal Panen */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Asal Catatan Panen Terdaftar</label>
                <select
                  value={batchForm.harvest_id}
                  onChange={(e) => {
                    const h = harvests.find((item) => item.id === e.target.value)
                    setBatchForm({
                      ...batchForm,
                      harvest_id: e.target.value,
                      allocated_qty: h?.quantity_kg || batchForm.allocated_qty,
                      commodity: h?.commodity || batchForm.commodity,
                    })
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="">-- Pilih Panen Terdaftar --</option>
                  {harvests.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.harvest_code} &bull; {h.commodity} ({h.quantity_kg} kg &bull; {h.quality_grade || 'Grade A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Kode Batch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Batch Kemasan</label>
                <input
                  type="text"
                  value={batchForm.batch_code}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  placeholder="Contoh: BND-PL-2026-B1"
                />
              </div>

              {/* Alokasi kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alokasi Berat (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={batchForm.allocated_qty || ''}
                  onChange={(e) => setBatchForm({ ...batchForm, allocated_qty: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-blue-700 font-semibold">
                Setiap batch yang diterbitkan otomatis memperoleh kode QR resolusi tinggi &amp; token audit publik.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFormTab(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Terbitkan Batch &amp; Buat Label QR
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          5. DAFTAR RIWAYAT CATATAN PANEN MASUK (TABLE WITH SEARCH & FILTER)
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#081D35]">Riwayat Catatan Hasil Panen Rempah</h3>
              <span className="text-xs text-slate-500 font-medium">({filteredHarvests.length} dari {harvests.length} Catatan)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh setoran panen petani pala dan fuli terverifikasi di Kepulauan Banda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode/kebun..."
                value={harvestSearch}
                onChange={(e) => setHarvestSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:border-emerald-500 outline-none w-40 sm:w-48"
              />
            </div>

            {/* Quick Commodity Filter */}
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none"
            >
              <option value="all">Semua Komoditas</option>
              <option value="pala">Pala</option>
              <option value="fuli">Fuli</option>
              <option value="cengkeh">Cengkeh</option>
            </select>
          </div>
        </div>

        {filteredHarvests.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Sprout size={22} />
            </div>
            <p className="font-bold text-slate-800 text-sm">Belum ada catatan panen terdaftar</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Gunakan tombol "Catat Panen Baru" di atas untuk menambahkan hasil panen kebun hari ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode Panen</th>
                  <th className="py-3.5 px-4">Kebun &amp; Lokasi</th>
                  <th className="py-3.5 px-4">Komoditas Rempah</th>
                  <th className="py-3.5 px-4">Berat Bersih</th>
                  <th className="py-3.5 px-4">Mutu / Grade</th>
                  <th className="py-3.5 px-4">Tanggal Petik</th>
                  <th className="py-3.5 px-4 text-center">Batch QR &amp; Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredHarvests.map((h) => {
                  const farm = farms.find((f) => f.id === h.farm_id)
                  const matchedBatch =
                    batches.find((b) => b.commodity.toLowerCase() === h.commodity.toLowerCase()) || batches[0]

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                          {h.harvest_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#081D35]">{farm ? farm.name : 'Kebun Lonthoir'}</span>
                        <span className="block text-[11px] text-slate-400">
                          {farm?.location_description || 'Kepulauan Banda'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            h.commodity.toLowerCase().includes('fuli')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : h.commodity.toLowerCase().includes('cengkeh')
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {h.commodity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#081D35] text-sm">{h.quantity_kg}</span>
                        <span className="text-slate-500 ml-1">kg</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>{h.quality_grade || 'Grade A Super'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {h.harvest_date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {matchedBatch ? (
                          <button
                            type="button"
                            onClick={() => setPreviewQrBatch(matchedBatch)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-colors cursor-pointer"
                          >
                            <QrCode size={13} className="text-blue-600" />
                            <span>{matchedBatch.batch_code}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Belum Di-Batch</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. ACTIVE BATCHES & EVENT LIFECYCLE APPEND (BLOCKCHAIN READY CARDS)
      ========================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#081D35]">
              Daftar Batch Kemasan Resmi &amp; Rantai Hash Blockchain ({batches.length} Batch)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap kemasan dilengkapi sertifikat keaslian digital, stempel QR publik, dan jangkar kriptografis on-chain.
            </p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Box size={22} />
            </div>
            <p className="font-bold text-slate-800 text-sm">Belum ada batch kemasan berlabel QR</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Petugas desa atau admin kelompok tani dapat menerbitkan batch kemasan dari hasil panen yang terdaftar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {batches.map((b) => {
              const isSelected = selectedBatch?.id === b.id
              const isConfirmed = b.blockchain_status === 'confirmed'
              const isSubmitted = b.blockchain_status === 'submitted'
              const isFailed = b.blockchain_status === 'failed'

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                    isSelected ? 'border-blue-400 ring-2 ring-blue-100 shadow-sm' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar Card */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Batch Kemasan Resmi
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isSubmitted
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isFailed
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Link2 size={11} />
                          <span>EVM: {b.blockchain_status.toUpperCase()}</span>
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-[#081D35] flex items-center gap-2">
                        <span>{b.batch_code}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          ({b.commodity} &bull; {b.total_quantity_kg} kg)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tanggal Produksi / Pengemasan: <strong className="text-slate-700">{b.production_date}</strong>
                      </p>
                    </div>

                    {/* QR Code Mini Card & Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div
                          onClick={() => setPreviewQrBatch(b)}
                          className="relative cursor-pointer group shrink-0"
                          title="Klik untuk memperbesar atau mencetak stiker QR"
                        >
                          <img
                            src={getBatchQrSrc(b)}
                            alt={`QR ${b.batch_code}`}
                            className="w-16 h-16 rounded-lg border border-slate-300 bg-white object-contain"
                          />
                          <div className="absolute inset-0 bg-slate-900/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                            Perbesar
                          </div>
                        </div>

                        <div className="text-xs space-y-1">
                          <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[120px]">
                            {b.public_verification_token ? `${b.public_verification_token.substring(0, 10)}...` : '-'}
                          </span>
                          <button
                            onClick={() => setPreviewQrBatch(b)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer transition-colors"
                          >
                            <QrCode size={13} />
                            <span>Cetak Stiker</span>
                          </button>
                        </div>
                      </div>

                      {/* Blockchain Operations Buttons */}
                      <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 w-full sm:w-auto">
                        <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
                          {(isOfficerOrAdmin || isFarmerGroupAdmin) && (
                            <button
                              onClick={() => handleAnchorBlockchain(b.id)}
                              disabled={blockchainLoading === b.id}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[40px]"
                            >
                              <Link2 size={13} className="shrink-0" />
                              <span className="truncate">{blockchainLoading === b.id ? 'Menjangkar...' : 'Jangkar EVM'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleVerifyBlockchain(b.id)}
                            className="px-3 py-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center min-h-[40px] active:scale-98"
                          >
                            Verifikasi On-Chain
                          </button>
                        </div>
                        <button
                          onClick={() => handlePublicVerify(b.public_verification_token)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] w-full"
                        >
                          <span>Sertifikat Publik QR</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Event Chain Timeline */}
                  <div className="mt-4 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Layers size={14} className="text-[#0284C7]" />
                        <span>Rantai Jejak Audit Peristiwa Mutu ({b.events.length} Tahapan)</span>
                      </span>
                      <span className="text-[11px] text-slate-400 italic">
                        Setiap peristiwa memiliki hash SHA-256 anti-manipulasi
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {b.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                              <strong className="text-[#081D35] uppercase font-bold tracking-wide">
                                {ev.event_type}
                              </strong>
                              {ev.location && (
                                <span className="text-slate-500 font-medium">({ev.location})</span>
                              )}
                              <span className="text-slate-400 text-[10px]">
                                {new Date(ev.event_timestamp).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] pl-4">{ev.description || '-'}</p>
                          </div>

                          <div className="flex items-center gap-2 pl-4 md:pl-0 shrink-0">
                            <div className="font-mono text-[10px] text-blue-800 bg-blue-100/70 px-2 py-1 rounded border border-blue-200 flex items-center gap-1">
                              <span>SHA-256: {ev.event_hash.substring(0, 16)}...</span>
                              <button
                                onClick={() => handleCopyText(ev.event_hash, 'hash')}
                                className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors p-0.5 rounded hover:bg-blue-200/50"
                                title="Salin hash lengkap"
                              >
                                {copiedHash === ev.event_hash ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Tambah Tahapan Mutu (Hanya Petugas / Admin Poktan) */}
                  {(isOfficerOrAdmin || isFarmerGroupAdmin) && (
                    <form
                      onSubmit={(e) => {
                        setSelectedBatch(b)
                        handleAppendEvent(e)
                      }}
                      className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-end gap-3"
                    >
                      <div className="w-48">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Tambah Tahapan Mutu
                        </label>
                        <select
                          value={eventForm.event_type}
                          onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                        >
                          <option value="drying">Pengeringan (Drying)</option>
                          <option value="sorting">Sortasi Mutu (Sorting)</option>
                          <option value="packaging">Pengemasan (Packaging)</option>
                          <option value="transfer">Distribusi (Transfer)</option>
                        </select>
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Catatan &amp; Lokasi Tahapan
                        </label>
                        <input
                          type="text"
                          placeholder="Mis. Solar dryer Lonthoir, kadar air < 10%..."
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          required
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                      >
                        + Catat Tahapan &amp; Hash
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          7. MODAL PRATINJAU & CETAK STIKER LABEL QR KEMASAN REMPAH
      ========================================================================== */}
      {previewQrBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in text-center">
            {/* Modal Header */}
            <div className="bg-[#081D35] text-white p-5 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4B75E] border border-white/20">
                    <QrCode size={20} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-[#F4B75E]">
                      Sertifikasi Rempah Banda
                    </span>
                    <h4 className="text-sm font-extrabold tracking-tight">Label QR Kemasan Produk</h4>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewQrBatch(null)}
                  className="text-white/70 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="text-[10px] font-bold text-blue-900 tracking-wider uppercase mb-3">
                  Indikasi Geografis Resmi Kepulauan Banda
                </div>

                <img
                  src={getBatchQrSrc(previewQrBatch)}
                  alt={`QR Code ${previewQrBatch.batch_code}`}
                  className="w-48 h-48 mx-auto rounded-xl border border-slate-300 p-1 bg-white object-contain"
                />

                <div className="mt-4">
                  <div className="font-mono text-base font-extrabold text-[#081D35]">
                    {previewQrBatch.batch_code}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {previewQrBatch.commodity} &bull; {previewQrBatch.total_quantity_kg} kg
                  </p>
                  <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Tanggal Produksi: {previewQrBatch.production_date}
                  </span>
                </div>

                <div className="mt-3 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-900 text-left">
                  📸 <strong>Bisa Discan Langsung:</strong> Arahkan kamera ponsel (Google Lens / iPhone Camera) untuk
                  membuka sertifikat keaslian produk secara instan tanpa login.
                </div>

                {/* Token Box */}
                <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 truncate text-[11px] max-w-[200px]">
                    Token: {previewQrBatch.public_verification_token}
                  </span>
                  <button
                    onClick={() => handleCopyText(previewQrBatch.public_verification_token, 'token')}
                    className="text-blue-700 hover:text-blue-900 font-sans text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedToken === previewQrBatch.public_verification_token ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>Salin</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getBatchQrSrc(previewQrBatch)}
                    download={`QR-${previewQrBatch.batch_code}.png`}
                    className="py-2.5 px-3 bg-[#081D35] hover:bg-[#0c2a4d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={14} /> Unduh PNG
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={14} /> Cetak Stiker
                  </button>
                </div>

                <button
                  onClick={() => {
                    const token = previewQrBatch.public_verification_token
                    setPreviewQrBatch(null)
                    handlePublicVerify(token)
                  }}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink size={14} /> Buka Halaman Verifikasi Publik
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
