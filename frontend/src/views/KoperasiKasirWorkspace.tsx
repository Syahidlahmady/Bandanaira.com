import React, { useState, useEffect, useMemo } from 'react'
import {
  Scale,
  Recycle,
  Droplets,
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Building2,
  Activity,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
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
import {
  koperasiService,
  CitizenCoopProfileResponse,
  CoopTransactionItem,
  CoopEcosystemRecap,
  COMMODITY_OPTIONS,
  WASTE_OPTIONS,
  WATER_STATIONS,
} from '../services/koperasi'

export interface KoperasiKasirWorkspaceProps {
  currentUser?: any
}

export const KoperasiKasirWorkspace: React.FC<KoperasiKasirWorkspaceProps> = ({ currentUser }) => {
  // Ekstraksi Peran Pengguna Sebenarnya
  const roles: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isOfficerOrAdmin = isSuperuser || roles.some((r) => ['admin', 'village_officer'].includes(r))
  const isCoopManager = roles.includes('coop_manager') || roles.includes('pengelola_koperasi')
  const canOperateCashier = isOfficerOrAdmin || isCoopManager

  const [activeTab, setActiveTab] = useState<
    'komoditas' | 'sampah' | 'dispenser' | 'ledger' | 'katalog_harga' | 'riwayat_warga' | 'panduan_warga'
  >(canOperateCashier ? 'komoditas' : 'katalog_harga')

  // Citizen Search & Profile
  const [nikInput, setNikInput] = useState<string>('8171010101900001')
  const [citizenProfile, setCitizenProfile] = useState<CitizenCoopProfileResponse | null>(null)
  const [loadingCitizen, setLoadingCitizen] = useState<boolean>(false)
  const [citizenError, setCitizenError] = useState<string | null>(null)
  const [copiedNik, setCopiedNik] = useState<string | null>(null)

  // Ecosystem Recap
  const [recap, setRecap] = useState<CoopEcosystemRecap | null>(null)

  // Form State: Komoditas
  const [commodityType, setCommodityType] = useState<string>('pala_super')
  const [commodityWeight, setCommodityWeight] = useState<number>(5.0)
  const [commodityDest, setCommodityDest] = useState<'BALANCE' | 'WATER_QUOTA'>('BALANCE')
  const [commodityNotes, setCommodityNotes] = useState<string>('')
  const [submittingKomoditas, setSubmittingKomoditas] = useState<boolean>(false)

  // Form State: Bank Sampah
  const [wasteType, setWasteType] = useState<string>('botol_plastik_pet')
  const [wasteWeight, setWasteWeight] = useState<number>(2.5)
  const [wasteDest, setWasteDest] = useState<'WATER_QUOTA' | 'BALANCE'>('WATER_QUOTA')
  const [wasteNotes, setWasteNotes] = useState<string>('')
  const [submittingWaste, setSubmittingWaste] = useState<boolean>(false)

  // Form State: Dispenser Air RO
  const [dispenserStation, setDispenserStation] = useState<string>('RO-STATION-LONTHOIR-01')
  const [waterLiters, setWaterLiters] = useState<number>(10.0)
  const [dispensingActive, setDispensingActive] = useState<boolean>(false)
  const [dispenseCountdown, setDispenseCountdown] = useState<number>(0)
  const [valveStatus, setValveStatus] = useState<'CLOSED' | 'OPEN'>('CLOSED')
  const [submittingWater, setSubmittingWater] = useState<boolean>(false)

  // Notification / Transaction Success Receipt
  const [lastReceipt, setLastReceipt] = useState<CoopTransactionItem | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null)

  // Ledger List
  const [ledgerTransactions, setLedgerTransactions] = useState<CoopTransactionItem[]>([])
  const [loadingLedger, setLoadingLedger] = useState<boolean>(false)

  // Initial Data Fetch
  useEffect(() => {
    fetchRecap()
    loadLedger()
    if (nikInput) {
      handleSearchCitizen(nikInput)
    }
  }, [])

  // Timer Solenoid Valve Dispenser
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (dispensingActive && dispenseCountdown > 0) {
      timer = setTimeout(() => {
        setDispenseCountdown((prev) => prev - 1)
      }, 1000)
    } else if (dispensingActive && dispenseCountdown === 0) {
      setDispensingActive(false)
      setValveStatus('CLOSED')
    }
    return () => clearTimeout(timer)
  }, [dispensingActive, dispenseCountdown])

  const fetchRecap = async () => {
    try {
      const data = await koperasiService.getRecap()
      setRecap(data)
    } catch {
      // ignore
    }
  }

  const loadLedger = async () => {
    setLoadingLedger(true)
    try {
      const list = await koperasiService.listTransactions({ limit: 20 })
      setLedgerTransactions(list)
    } catch {
      // ignore
    } finally {
      setLoadingLedger(false)
    }
  }

  const handleSearchCitizen = async (nikToSearch: string) => {
    if (!nikToSearch || nikToSearch.trim().length !== 16) {
      setCitizenError('Masukkan 16 digit NIK warga yang valid.')
      return
    }
    setLoadingCitizen(true)
    setCitizenError(null)
    try {
      const profile = await koperasiService.getCitizenProfile(nikToSearch.trim())
      setCitizenProfile(profile)
    } catch (err: unknown) {
      setCitizenProfile(null)
      if (err instanceof Error) {
        setCitizenError(err.message)
      } else {
        setCitizenError('Data warga tidak ditemukan atau server offline.')
      }
    } finally {
      setLoadingCitizen(false)
    }
  }

  const handleCopyNik = (nik: string) => {
    navigator.clipboard.writeText(nik)
    setCopiedNik(nik)
    setTimeout(() => setCopiedNik(null), 2000)
  }

  const handleDepositKomoditas = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenProfile) {
      setActionErrorMsg('Pilih atau cari NIK warga terlebih dahulu.')
      return
    }
    setSubmittingKomoditas(true)
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    try {
      const trx = await koperasiService.depositCommodity({
        nik: citizenProfile.nik,
        commodity_type: commodityType,
        weight_kg: commodityWeight,
        destination: commodityDest,
        notes: commodityNotes || undefined,
      })
      setLastReceipt(trx)
      setActionSuccessMsg(`Setoran komoditas berhasil dicatat! Struk hash: ${trx.receipt_hash.slice(0, 14)}...`)
      handleSearchCitizen(citizenProfile.nik)
      fetchRecap()
      loadLedger()
    } catch (err: unknown) {
      if (err instanceof Error) setActionErrorMsg(err.message)
    } finally {
      setSubmittingKomoditas(false)
    }
  }

  const handleDepositWaste = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenProfile) {
      setActionErrorMsg('Pilih atau cari NIK warga terlebih dahulu.')
      return
    }
    setSubmittingWaste(true)
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    try {
      const trx = await koperasiService.depositWaste({
        nik: citizenProfile.nik,
        waste_type: wasteType,
        weight_kg: wasteWeight,
        destination: wasteDest,
        notes: wasteNotes || undefined,
      })
      setLastReceipt(trx)
      setActionSuccessMsg(`Bank Sampah: Berhasil konversi sampah jadi kuota air! Struk: ${trx.receipt_hash.slice(0, 14)}...`)
      handleSearchCitizen(citizenProfile.nik)
      fetchRecap()
      loadLedger()
    } catch (err: unknown) {
      if (err instanceof Error) setActionErrorMsg(err.message)
    } finally {
      setSubmittingWaste(false)
    }
  }

  const handleRedeemWater = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenProfile) {
      setActionErrorMsg('Pilih atau cari NIK warga terlebih dahulu.')
      return
    }
    if (citizenProfile.clean_water_quota_ltr < waterLiters) {
      setActionErrorMsg(`Kuota air tidak cukup (Sisa: ${citizenProfile.clean_water_quota_ltr} L, Permintaan: ${waterLiters} L). Silakan setor botol plastik untuk tambah kuota!`)
      return
    }

    setSubmittingWater(true)
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    try {
      const resp = await koperasiService.redeemWater({
        nik: citizenProfile.nik,
        liters_requested: waterLiters,
        station_code: dispenserStation,
      })

      setValveStatus('OPEN')
      setDispensingActive(true)
      setDispenseCountdown(resp.dispense_duration_sec)
      setActionSuccessMsg(`Dispenser Aktif! Solenoid valve terbuka mengalirkan ${resp.liters_dispensed} Liter air bersih RO.`)

      handleSearchCitizen(citizenProfile.nik)
      fetchRecap()
      loadLedger()
    } catch (err: unknown) {
      if (err instanceof Error) setActionErrorMsg(err.message)
    } finally {
      setSubmittingWater(false)
    }
  }

  const selectedCommodity = COMMODITY_OPTIONS.find((c) => c.code === commodityType) || COMMODITY_OPTIONS[0]
  const estCommodityRp = selectedCommodity.price * commodityWeight
  const estCommodityWaterLtr = Math.round((estCommodityRp / 500) * 10) / 10

  const selectedWaste = WASTE_OPTIONS.find((w) => w.code === wasteType) || WASTE_OPTIONS[0]
  const estWasteWaterLtr = Math.round(selectedWaste.waterPerKg * wasteWeight * 10) / 10
  const estWasteRp = selectedWaste.price * wasteWeight

  // Recharts Chart 1: Perputaran Komoditas & Sampah Bulanan
  const circularTrendData = useMemo(() => {
    return [
      { name: 'Pala Super', volume: 480, nilaiRp: 36000000, fill: '#059669' },
      { name: 'Fuli Merah', volume: 180, nilaiRp: 17100000, fill: '#E11D48' },
      { name: 'Cengkeh', volume: 220, nilaiRp: 13200000, fill: '#D97706' },
      { name: 'Ikan Tangkap', volume: 340, nilaiRp: 11900000, fill: '#2563EB' },
      { name: 'Bank Sampah', volume: 150, nilaiRp: 1500000, fill: '#06B6D4' },
    ]
  }, [])

  // Recharts Chart 2: Komposisi Alokasi Penukaran Kasir
  const allocationDonutData = useMemo(() => {
    return [
      { name: 'Tabungan Saldo (Rp)', value: 65, color: '#10B981', percent: '65%' },
      { name: 'Kuota Air Bersih (RO)', value: 25, color: '#06B6D4', percent: '25%' },
      { name: 'Poin Bank Sampah', value: 10, color: '#F59E0B', percent: '10%' },
    ]
  }, [])

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* =========================================================================
          1. HEADER BANNER: BANDA NEIRA CIRCULAR COOPERATIVE & CASHIER
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-radial from-emerald-100/40 via-amber-50/20 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0 shadow-md border border-[#F4B75E]/30">
              <Scale size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1.5">
                  <Building2 size={12} />
                  Koperasi Serba Usaha Hatta &bull; Ekonomi Sirkular Pulau
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Mandat Kemandirian Prof. Purwo (KKN-PPM UGM)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                {canOperateCashier
                  ? 'Kasir Koperasi Hatta, Bank Sampah & Dispenser RO'
                  : 'Buku Tabungan Koperasi & Kuota Air Bersih Warga'}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                {canOperateCashier
                  ? 'Layanan kasir penimbangan hasil bumi, penukaran 1 kg sampah botol plastik jadi 10 liter air bersih, dan kontrol dispenser otomatis Solenoid Valve.'
                  : 'Pantau saldo tabungan simpanan, jatah kuota air minum RO higienis, riwayat penyetoran bank sampah, dan harga acuan rempah desa.'}
              </p>

              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-lg text-xs font-semibold text-blue-900">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Pencatatan Struk Terenkripsi SHA-256</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-slate-600 font-medium">Buku Besar Akuntabilitas Pulau Terbuka</span>
              </div>
            </div>
          </div>

          {/* Tab Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canOperateCashier ? (
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('komoditas')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'komoditas'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale size={14} />
                  <span>Timbangan Rempah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sampah')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'sampah'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Recycle size={14} />
                  <span>Bank Sampah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dispenser')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'dispenser'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Droplets size={14} />
                  <span>Dispenser RO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ledger')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'ledger'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Buku Besar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('katalog_harga')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'katalog_harga'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale size={14} />
                  <span>Harga Acuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('riwayat_warga')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'riwayat_warga'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Riwayat Transaksi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('panduan_warga')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'panduan_warga'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Droplets size={14} />
                  <span>Stasiun RO</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. EXECUTIVE BENTO KPI METRIC CARDS (5 CARDS)
      ========================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Akun Warga Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Akun Warga Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#081D35]">{recap?.total_active_accounts ?? '—'}</span>
            <span className="text-xs font-semibold text-slate-500">Anggota</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Terhubung NIK Desa Banda</span>
          </div>
        </div>

        {/* KPI 2: Cadangan Kuota Air Bersih */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cadangan Air Minum</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Droplets size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-cyan-700">
              {recap?.total_clean_water_quota_ltr.toLocaleString('id-ID') ?? '—'}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liter RO</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-700">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span>4 Stasiun Dispenser Pulau</span>
          </div>
        </div>

        {/* KPI 3: Sampah Plastik Didaur Ulang */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sampah Terdaur Ulang</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Recycle size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">
              {recap?.total_plastic_recycled_kg ? recap.total_plastic_recycled_kg.toFixed(1) : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg Plastik</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>1 kg = 10 Liter Air Bersih</span>
          </div>
        </div>

        {/* KPI 4: Total Transaksi Kasir */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Transaksi</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{recap?.total_transactions_count ?? '—'}</span>
            <span className="text-xs font-semibold text-slate-500">Struk Sah</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Audit SHA-256 Otomatis</span>
          </div>
        </div>

        {/* KPI 5: Saldo Perputaran Simpanan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perputaran Simpanan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-[#081D35]">
              Rp {(recap?.total_coop_balance_rp || 48500000).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Likuiditas Koperasi Hatta</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DUAL ANALYTICAL CHARTS CLUSTER (RECHARTS BAR & DONUT)
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri (7 Kolom): Bar Chart Perputaran Hasil Bumi & Bank Sampah */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Volume Perputaran Komoditas &amp; Bank Sampah (kg)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Sirkulasi Ekonomi Pulau
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Setoran hasil bumi dan sampah plastik yang ditimbang di Koperasi Hatta Banda Neira.
            </p>
          </div>

          <div className="w-full h-56 sm:h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={circularTrendData} margin={{ top: 10, right: 15, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
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
                          <p className="mt-1 font-semibold">{data.volume} kg Disetor</p>
                          <p className="text-emerald-400 font-bold">
                            Estimasi Nilai: Rp {data.nilaiRp.toLocaleString('id-ID')}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {circularTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Mendukung kemandirian pangan, air bersih, dan kebersihan laut Pulau Banda Neira</span>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Donut Chart Distribusi Alokasi Penukaran */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Proporsi Alokasi Penukaran Kasir
              </h3>
            </div>
            <p className="text-xs text-slate-500">Pilihan warga dalam menukarkan komoditas &amp; sampah.</p>
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
                    data={allocationDonutData}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo</span>
                <span className="text-lg font-black text-[#081D35] leading-none mt-0.5">65%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full sm:w-auto">
              {allocationDonutData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50/70 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-[#081D35]">{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200/60 flex items-center gap-2 text-xs text-cyan-900">
            <Droplets size={16} className="text-cyan-700 shrink-0" />
            <span>25% penukaran hasil bumi langsung dikonversi warga menjadi kuota air minum RO.</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. MAIN OPERATION WORKSPACE: CITIZEN SMART CARD & CASHIER FORM
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (4 Kolom): Citizen Smart Card & NIK Lookup */}
        <div className="lg:col-span-4 space-y-4">
          {/* NIK Search Card */}
          {canOperateCashier ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Search size={14} className="text-emerald-600" />
                <span>Identifikasi NIK Warga (Kasir)</span>
              </h4>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  maxLength={16}
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="16 Digit NIK Warga..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSearchCitizen(nikInput)}
                  disabled={loadingCitizen}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {loadingCitizen ? <RefreshCw size={14} className="animate-spin" /> : 'Cari'}
                </button>
              </div>

              {/* Sample Quick NIK */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                <span className="font-semibold">Sampel:</span>
                {[
                  { label: 'Ahmad (Pala)', nik: '8171010101900001' },
                  { label: 'Fatima (Fuli)', nik: '8171010101900002' },
                  { label: 'Syahrir (Laut)', nik: '8171010101900003' },
                ].map((s) => (
                  <button
                    key={s.nik}
                    type="button"
                    onClick={() => {
                      setNikInput(s.nik)
                      handleSearchCitizen(s.nik)
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[10px] transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {citizenError && (
                <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                  {citizenError}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck size={16} />
                <span>Buku Rekening Tabungan Warga</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akun terikat otomatis pada profil NIK e-KTP Anda. Saldo simpanan dan kuota air bersih RO diakui resmi di Koperasi Hatta.
              </p>
            </div>
          )}

          {/* Citizen Digital Card */}
          {citizenProfile ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Kartu Anggota Koperasi
                  </span>
                  <h3 className="text-base font-extrabold text-[#081D35] mt-1 truncate max-w-[200px]">
                    {citizenProfile.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs text-slate-500">
                    <span>{citizenProfile.nik}</span>
                    <button
                      onClick={() => handleCopyNik(citizenProfile.nik)}
                      className="text-slate-400 hover:text-slate-600"
                      title="Salin NIK"
                    >
                      {copiedNik === citizenProfile.nik ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                <div>
                  Desa: <strong className="text-slate-800">{citizenProfile.village || 'Banda Neira'}</strong>
                </div>
                <div>
                  Profesi: <strong className="text-slate-800">{citizenProfile.occupation || 'Warga'}</strong>
                </div>
              </div>

              {/* Balances Display */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Saldo Simpanan</span>
                  <div className="text-base font-black text-emerald-700 mt-0.5">
                    Rp {citizenProfile.coop_balance_rp.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 bg-cyan-50/70 border border-cyan-200/80 rounded-xl">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase block">Kuota Air RO</span>
                  <div className="text-base font-black text-cyan-700 mt-0.5">
                    {citizenProfile.clean_water_quota_ltr.toFixed(1)} <span className="text-xs font-semibold">L</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Poin Sampah</span>
                  <strong className="text-amber-600">{citizenProfile.plastic_points} pts</strong>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Total Plastik Disetor</span>
                  <strong className="text-slate-800">{citizenProfile.total_plastic_recycled_kg.toFixed(1)} kg</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 shadow-xs">
              <Scale size={28} className="mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-700 text-xs">Belum Ada Warga Terpilih</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Masukkan 16 digit NIK warga untuk memeriksa saldo koperasi &amp; jatah kuota air minum.
              </p>
            </div>
          )}

          {/* Struk Terakhir Widget */}
          {lastReceipt && (
            <div className="bg-white rounded-2xl border border-emerald-300 p-4 shadow-xs animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Struk Transaksi Sah</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{lastReceipt.item_name}</p>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Kode: {lastReceipt.transaction_code}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 break-all bg-slate-50 p-1.5 rounded border border-slate-200">
                Hash: {lastReceipt.receipt_hash}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan (8 Kolom): Cashier & Operations Form */}
        <div className="lg:col-span-8 space-y-4">
          {/* Status Message Alerts */}
          {actionSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}
          {actionErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
          )}

          {/* TAB 1: Kasir Timbangan Komoditas */}
          {activeTab === 'komoditas' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-[#081D35] flex items-center gap-2">
                  <Scale size={18} className="text-emerald-600" />
                  <span>Kasir Timbangan Hasil Bumi &amp; Laut</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menerima setoran pala, fuli, cengkeh, dan ikan tangkapan nelayan dengan harga acuan Koperasi Hatta.
                </p>
              </div>

              <form onSubmit={handleDepositKomoditas} className="space-y-4">
                {/* Select Commodity Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Jenis Komoditas:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {COMMODITY_OPTIONS.map((item) => {
                      const isSelected = commodityType === item.code
                      return (
                        <button
                          type="button"
                          key={item.code}
                          onClick={() => setCommodityType(item.code)}
                          className={`p-3 rounded-xl text-left transition-all border flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-100 shadow-2xs'
                              : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                            <div className="text-[11px] font-extrabold text-emerald-700 mt-0.5">
                              Rp {item.price.toLocaleString('id-ID')} / kg
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Weight & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Berat Timbangan (Kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      value={commodityWeight}
                      onChange={(e) => setCommodityWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Alokasi Nilai Tukar:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCommodityDest('BALANCE')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                          commodityDest === 'BALANCE'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Tabungan Saldo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommodityDest('WATER_QUOTA')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                          commodityDest === 'WATER_QUOTA'
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Kuota Air RO</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Catatan Kasir (Opsional):
                  </label>
                  <input
                    type="text"
                    value={commodityNotes}
                    onChange={(e) => setCommodityNotes(e.target.value)}
                    placeholder="Contoh: Panen kebun Lonthoir blok timur..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Calculation Summary Box */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Total Nilai Timbangan:</span>
                    <span className="text-xl font-black text-emerald-800">
                      Rp {estCommodityRp.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {commodityDest === 'WATER_QUOTA' && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-semibold block">Konversi Air RO:</span>
                      <span className="text-xl font-black text-cyan-700">
                        + {estCommodityWaterLtr.toFixed(1)} Liter
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingKomoditas || !citizenProfile}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingKomoditas ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Memproses Timbangan...
                    </>
                  ) : (
                    <>
                      <Scale size={16} /> Catat Timbangan &amp; Terbitkan Struk Buku Besar
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Bank Sampah Plastik */}
          {activeTab === 'sampah' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-[#081D35] flex items-center gap-2">
                  <Recycle size={18} className="text-cyan-600" />
                  <span>Bank Sampah Plastik Terpadu</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandat Kemandirian Prof. Purwo: Setiap 1 kg sampah botol plastik ditukar 10 liter air minum higienis.
                </p>
              </div>

              <form onSubmit={handleDepositWaste} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Kategori Sampah Terpilah:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {WASTE_OPTIONS.map((item) => {
                      const isSelected = wasteType === item.code
                      return (
                        <button
                          type="button"
                          key={item.code}
                          onClick={() => setWasteType(item.code)}
                          className={`p-3 rounded-xl text-left transition-all border flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-cyan-50/80 border-cyan-500 ring-2 ring-cyan-100 shadow-2xs'
                              : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                            <div className="text-[11px] font-extrabold text-cyan-700 mt-0.5">
                              1 kg = {item.waterPerKg} L Air RO
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Berat Sampah Timbangan (Kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="500"
                      value={wasteWeight}
                      onChange={(e) => setWasteWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Alokasi Penukaran:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWasteDest('WATER_QUOTA')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                          wasteDest === 'WATER_QUOTA'
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Kuota Air RO</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWasteDest('BALANCE')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                          wasteDest === 'BALANCE'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Saldo Uang (Rp)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Lokasi Asal Sampah:</label>
                  <input
                    type="text"
                    value={wasteNotes}
                    onChange={(e) => setWasteNotes(e.target.value)}
                    placeholder="Contoh: Pembersihan pesisir pantai Lonthoir..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-cyan-50/70 border border-cyan-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      {wasteDest === 'WATER_QUOTA' ? 'Perolehan Air Bersih:' : 'Nilai Saldo Tabungan:'}
                    </span>
                    <span className="text-xl font-black text-cyan-800">
                      {wasteDest === 'WATER_QUOTA'
                        ? `+ ${estWasteWaterLtr.toFixed(1)} Liter Air RO`
                        : `Rp ${estWasteRp.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-semibold block">Poin Lingkungan:</span>
                    <span className="text-xl font-black text-amber-600">
                      + {Math.round(wasteWeight * 10)} Poin
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingWaste || !citizenProfile}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingWaste ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Memproses Bank Sampah...
                    </>
                  ) : (
                    <>
                      <Recycle size={16} /> Konversi Sampah Jadi Kuota Air Bersih
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Dispenser Air RO Otomatis */}
          {activeTab === 'dispenser' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#081D35] flex items-center gap-2">
                    <Droplets size={18} className="text-blue-600" />
                    <span>Dispenser Air Minum RO Otomatis</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Solenoid valve berbasis microcontroller membuka keran dan memotong kuota air NIK.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-50">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      valveStatus === 'OPEN' ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-slate-700">
                    SOLENOID: {valveStatus}
                  </span>
                </div>
              </div>

              {/* Countdown Animation Box */}
              {dispensingActive && (
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2 animate-fade-in">
                  <Droplets size={36} className="mx-auto text-blue-600 animate-bounce" />
                  <h4 className="text-sm font-extrabold text-blue-950">Air Bersih Sedang Mengalir...</h4>
                  <p className="text-xs text-blue-700">
                    Letakkan wadah atau galon di bawah nozzle dispenser stasiun.
                  </p>
                  <div className="text-2xl font-black font-mono text-blue-700">
                    00:{dispenseCountdown.toString().padStart(2, '0')} detik
                  </div>
                </div>
              )}

              <form onSubmit={handleRedeemWater} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Lokasi Stasiun Dispenser RO:
                  </label>
                  <select
                    value={dispenserStation}
                    onChange={(e) => setDispenserStation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    {WATER_STATIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Preset Volume Pengisian:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { ltr: 2.0, label: '2 Liter (Botol)' },
                      { ltr: 5.0, label: '5 Liter (Jeriken Kecil)' },
                      { ltr: 10.0, label: '10 Liter (Jeriken Sedang)' },
                      { ltr: 19.0, label: '19 Liter (Galon Standar)' },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.ltr}
                        onClick={() => setWaterLiters(preset.ltr)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          waterLiters === preset.ltr
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Volume Air (Liter):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingWater || dispensingActive || !citizenProfile}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingWater ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Mengirim Sinyal Solenoid...
                    </>
                  ) : dispensingActive ? (
                    <>
                      <Droplets size={16} /> Sedang Mengalirkan Air...
                    </>
                  ) : (
                    <>
                      <Droplets size={16} /> Buka Solenoid &amp; Tebus {waterLiters} Liter Air RO
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Buku Besar Transaksi (Ledger) */}
          {activeTab === 'ledger' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#081D35] flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" />
                    <span>Buku Besar Transaksi Kasir &amp; Bank Sampah</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Log mutasi transaksi deterministik dengan enkripsi hash SHA-256 akuntabilitas terbuka.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadLedger}
                  disabled={loadingLedger}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <RefreshCw size={12} className={loadingLedger ? 'animate-spin' : ''} />
                  <span>Segarkan</span>
                </button>
              </div>

              {ledgerTransactions.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-500">
                  <CreditCard size={28} className="mx-auto mb-2 text-slate-400 opacity-60" />
                  <p className="text-xs font-bold text-slate-800">Belum ada catatan transaksi di buku besar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">Waktu</th>
                        <th className="py-3 px-3">Kode / Tipe</th>
                        <th className="py-3 px-3">Komoditas / Item</th>
                        <th className="py-3 px-3">Kuantitas</th>
                        <th className="py-3 px-3">Nilai (Rp)</th>
                        <th className="py-3 px-3">Dampak Air</th>
                        <th className="py-3 px-3">Receipt Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {ledgerTransactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(trx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-blue-700 block">{trx.transaction_type}</span>
                            <span className="font-mono text-[10px] text-slate-400">{trx.transaction_code}</span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{trx.item_name}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {trx.weight_or_volume.toFixed(1)} {trx.transaction_type === 'REDEEM_WATER' ? 'L' : 'Kg'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">
                            {trx.monetary_value_rp > 0 ? `Rp ${trx.monetary_value_rp.toLocaleString('id-ID')}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {trx.water_quota_impact_ltr > 0 ? (
                              <span className="text-cyan-700">+{trx.water_quota_impact_ltr} L</span>
                            ) : trx.water_quota_impact_ltr < 0 ? (
                              <span className="text-rose-700">{trx.water_quota_impact_ltr} L</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-purple-700">
                            {trx.receipt_hash.slice(0, 10)}...{trx.receipt_hash.slice(-6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB WARGA 1: Katalog Harga Acuan */}
          {activeTab === 'katalog_harga' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-extrabold text-[#081D35] flex items-center gap-2">
                    <Scale size={16} className="text-emerald-600" />
                    <span>Harga Pembelian Resmi Koperasi Hatta Banda Neira</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standar acuan resmi pembelian hasil panen petani dan tangkapan nelayan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMODITY_OPTIONS.map((item) => (
                    <div
                      key={item.code}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 transition-colors"
                    >
                      <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="text-base">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-base font-black text-emerald-700 mt-2">
                        Rp {item.price.toLocaleString('id-ID')}{' '}
                        <span className="text-[11px] font-medium text-slate-400">/ Kg</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Standar mutu resmi Koperasi Hatta</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-extrabold text-[#081D35] flex items-center gap-2">
                    <Recycle size={16} className="text-cyan-600" />
                    <span>Nilai Tukar Bank Sampah Plastik Mandat UGM</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tukarkan sampah plastik bersih menjadi kuota air minum RO atau saldo tabungan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {WASTE_OPTIONS.map((item) => (
                    <div
                      key={item.code}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-cyan-300 transition-colors"
                    >
                      <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="text-base">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <div className="text-sm font-black text-cyan-700">+{item.waterPerKg} L Air RO</div>
                        <div className="text-xs font-bold text-emerald-700">
                          atau Rp {item.price.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">+5 Poin Lingkungan per kg</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB WARGA 2: Riwayat Transaksi Saya */}
          {activeTab === 'riwayat_warga' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-[#081D35] flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" />
                    <span>Riwayat Transaksi &amp; Kuota Saya</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catatan mutasi saldo dan pengambilan air minum RO pada profil Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadLedger}
                  disabled={loadingLedger}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <RefreshCw size={12} className={loadingLedger ? 'animate-spin' : ''} />
                  <span>Segarkan</span>
                </button>
              </div>

              {ledgerTransactions.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-500">
                  <CreditCard size={28} className="mx-auto mb-2 text-slate-400 opacity-60" />
                  <p className="text-xs font-bold text-slate-800">Belum ada transaksi pada profil ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Transaksi</th>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Kuantitas</th>
                        <th className="py-2.5 px-3">Nilai (Rp)</th>
                        <th className="py-2.5 px-3">Air RO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {ledgerTransactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800">{trx.transaction_type}</span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{trx.item_name}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {trx.weight_or_volume.toFixed(1)} {trx.transaction_type === 'REDEEM_WATER' ? 'L' : 'Kg'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">
                            {trx.monetary_value_rp > 0 ? `Rp ${trx.monetary_value_rp.toLocaleString('id-ID')}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {trx.water_quota_impact_ltr > 0 ? (
                              <span className="text-cyan-700">+{trx.water_quota_impact_ltr} L</span>
                            ) : trx.water_quota_impact_ltr < 0 ? (
                              <span className="text-rose-700">{trx.water_quota_impact_ltr} L</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB WARGA 3: Panduan Stasiun RO */}
          {activeTab === 'panduan_warga' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-[#081D35] flex items-center gap-2">
                  <Droplets size={16} className="text-cyan-600" />
                  <span>4 Titik Stasiun Air Minum RO &amp; Pos Penukaran Sampah</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lokasi fasilitas dispenser air minum bersih RO otomatis dan pos penimbangan di kepulauan Banda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {WATER_STATIONS.map((station) => (
                  <div
                    key={station.code}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-cyan-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-cyan-700 uppercase">
                        {station.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aktif Beroperasi
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#081D35]">{station.name}</h4>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Kapasitas: 5.000 L</span>
                      <span className="font-semibold text-emerald-700">IoT Solenoid Valve Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
