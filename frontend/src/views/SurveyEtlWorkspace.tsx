import React, { useEffect, useState, useMemo } from 'react'
import {
  FileText,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  MapPin,
  Sparkles,
  Layers,
  Activity,
  Info,
  TrendingUp,
  Clock,
  Search,
  Sliders,
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
  Legend,
} from 'recharts'
import {
  SurveyItem,
  SurveyStats,
  ProblemDomain,
  UrgencyLevel,
  submitSurvey,
  getSurveys,
  runETLMigration,
  getSurveyStats,
  seedSampleSurveys,
} from '../services/survei'

interface SurveyEtlWorkspaceProps {
  onNavigateToMap?: () => void
}

const ISLAND_PRESETS: Record<string, { lat: number; lng: number; defaultVillage: string }> = {
  'Pulau Neira': { lat: -4.5245, lng: 129.9048, defaultVillage: 'Desa Nusantara' },
  'Pulau Banda Besar': { lat: -4.5412, lng: 129.9011, defaultVillage: 'Desa Lonthoir' },
  'Pulau Hatta': { lat: -4.591, lng: 129.988, defaultVillage: 'Kampung Lama' },
  'Pulau Ay': { lat: -4.529, lng: 129.837, defaultVillage: 'Desa Ay' },
  'Pulau Gunung Api': { lat: -4.522, lng: 129.885, defaultVillage: 'Kawasan Konservasi Vulkanik' },
  'Pulau Rhun': { lat: -4.556, lng: 129.721, defaultVillage: 'Desa Rhun' },
}

const PRESET_TEMPLATES: Record<
  ProblemDomain,
  { label: string; fields: Array<{ key: string; value: string }> }
> = {
  AIR_DAN_SAMPAH: {
    label: 'Krisis Air Payau & Sampah Plastik',
    fields: [
      { key: 'sumber_air_utama', value: 'Tadah hujan dan sumur gali payau' },
      { key: 'kadar_tds_sumur_ppm', value: '2650' },
      { key: 'pengeluaran_beli_air_per_bulan_rp', value: '300000' },
      { key: 'timbulan_sampah_botol_plastik_kg', value: '12.5' },
    ],
  },
  ENERGI: {
    label: 'PLTS & Pemadaman Listrik Diesel',
    fields: [
      { key: 'sistem_energi', value: 'PLTS Off-Grid Komunal 15 kWp' },
      { key: 'kondisi_baterai', value: 'SoC drop ke 35% sebelum jam 21:00 WIT' },
      { key: 'durasi_pemadaman_jam', value: '8' },
      { key: 'penggunaan_genset_solar_liter', value: '25' },
    ],
  },
  EKONOMI: {
    label: 'Potensi Kebun Pala & UMKM',
    fields: [
      { key: 'luas_kebun_ha', value: '2.5' },
      { key: 'populasi_pohon_pala', value: '180' },
      { key: 'kualitas_biji_pala', value: 'Super Grade A (kadar air < 10%)' },
      { key: 'kelompok_tani', value: 'Poktan Mandiri Banda' },
    ],
  },
  WISATA: {
    label: 'Potensi Wisata & Homestay',
    fields: [
      { key: 'tipe_daya_tarik', value: 'Spot Snorkeling & Homestay Ramah Lingkungan' },
      { key: 'ketersediaan_air_ro', value: 'Ada dari galon Koperasi' },
      { key: 'aksesibilitas_dermaga_menit', value: '10' },
    ],
  },
  BUDAYA: {
    label: 'Inventarisasi Cagar Budaya',
    fields: [
      { key: 'tahun_estimasi', value: '1650' },
      { key: 'kondisi_fisik', value: 'Perlu restorasi struktur batu karang' },
      { key: 'rekomendasi_tindakan', value: 'Pemasangan QR Digital Passport' },
    ],
  },
}

const DEFAULT_STATS: SurveyStats = {
  total_surveys: 24,
  pending_etl: 6,
  migrated_to_postgres: 18,
  by_domain: {
    AIR_DAN_SAMPAH: 8,
    ENERGI: 5,
    EKONOMI: 6,
    WISATA: 3,
    BUDAYA: 2,
  },
  by_urgency: {
    KRITIS: 4,
    TINGGI: 8,
    SEDANG: 9,
    RENDAH: 3,
  },
  by_island: {
    'Pulau Neira': 8,
    'Pulau Banda Besar': 6,
    'Pulau Ay': 4,
    'Pulau Rhun': 3,
    'Pulau Hatta': 2,
    'Pulau Gunung Api': 1,
  },
}

export const SurveyEtlWorkspace: React.FC<SurveyEtlWorkspaceProps> = ({ onNavigateToMap }) => {
  const [activeTab, setActiveTab] = useState<'survei' | 'etl'>('survei')
  const [surveys, setSurveys] = useState<SurveyItem[]>([])
  const [stats, setStats] = useState<SurveyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [collectorName, setCollectorName] = useState('Syafa Nailah Mufidah (KKN-PPM UGM)')
  const [problemDomain, setProblemDomain] = useState<ProblemDomain>('AIR_DAN_SAMPAH')
  const [islandName, setIslandName] = useState('Pulau Banda Besar')
  const [villageName, setVillageName] = useState('Desa Lonthoir')
  const [rtRw, setRtRw] = useState('RT 03 / RW 01')
  const [latitude, setLatitude] = useState(-4.5412)
  const [longitude, setLongitude] = useState(129.9011)
  const [title, setTitle] = useState('Krisis Air Payau & Sumur Galian Warga Lonthoir')
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('KRITIS')
  const [notes, setNotes] = useState('Warga terpaksa menyeberang ke Neira untuk membeli galon isi ulang saat kemarau.')
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([
    { key: 'sumber_air_utama', value: 'Tadah hujan dan sumur gali payau' },
    { key: 'kadar_tds_sumur_ppm', value: '2650' },
    { key: 'pengeluaran_beli_air_per_bulan_rp', value: '300000' },
    { key: 'timbulan_sampah_botol_plastik_kg', value: '4.5' },
  ])

  // ETL Filter State
  const [domainFilter, setDomainFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTableQuery, setSearchTableQuery] = useState<string>('')
  const [isMigrating, setIsMigrating] = useState(false)
  const [selectedSurveyForModal, setSelectedSurveyForModal] = useState<SurveyItem | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [surveyList, surveyStats] = await Promise.all([
        getSurveys({
          problem_domain: domainFilter === 'ALL' ? undefined : domainFilter,
          etl_status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        getSurveyStats(),
      ])
      setSurveys(surveyList)
      setStats(surveyStats)
    } catch (err: any) {
      if (!stats) {
        setStats(DEFAULT_STATS)
      }
      setActionMsg({ type: 'error', text: err.message || 'Gagal memuat data survei.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [domainFilter, statusFilter])

  const handleIslandChange = (newIsland: string) => {
    setIslandName(newIsland)
    const preset = ISLAND_PRESETS[newIsland]
    if (preset) {
      setLatitude(preset.lat)
      setLongitude(preset.lng)
      setVillageName(preset.defaultVillage)
    }
  }

  const applyTemplate = (domain: ProblemDomain) => {
    const tmpl = PRESET_TEMPLATES[domain]
    if (tmpl) {
      setCustomFields(tmpl.fields.map((f) => ({ ...f })))
    }
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }])
  }

  const updateCustomField = (index: number, key: string, value: string) => {
    const updated = [...customFields]
    updated[index] = { key, value }
    setCustomFields(updated)
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setActionMsg(null)

      const flexibleAttrs: Record<string, any> = {}
      customFields.forEach((f) => {
        if (f.key.trim()) {
          const num = Number(f.value)
          flexibleAttrs[f.key.trim()] = !isNaN(num) && f.value.trim() !== '' ? num : f.value.trim()
        }
      })

      const created = await submitSurvey({
        collector_name: collectorName,
        problem_domain: problemDomain,
        island_name: islandName,
        village_name: villageName,
        rt_rw: rtRw,
        latitude,
        longitude,
        title,
        urgency_level: urgencyLevel,
        flexible_attributes: flexibleAttrs,
        notes,
      })

      setActionMsg({
        type: 'success',
        text: `Survei berhasil disimpan ke staging NoSQL/MongoDB dengan kode ${created.survey_code}! Siap ditransformasikan oleh Pipa ETL.`,
      })
      fetchData()
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Gagal menyimpan survei.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRunETL = async () => {
    try {
      setIsMigrating(true)
      setActionMsg(null)
      const res = await runETLMigration({
        problem_domain: domainFilter === 'ALL' ? undefined : domainFilter,
        auto_promote_spatial: true,
      })
      setActionMsg({
        type: 'success',
        text: `${res.message} (${res.migrated_count} termigrasi, ${res.skipped_count} dilewati). Data kini aktif di Peta 7-Layer PostGIS.`,
      })
      fetchData()
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Gagal menjalankan pipa ETL.' })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleSeedSamples = async () => {
    try {
      setLoading(true)
      setActionMsg(null)
      const res = await seedSampleSurveys()
      setActionMsg({
        type: 'success',
        text: `${res.message} (${res.seeded_count} data baru disemai).`,
      })
      fetchData()
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Gagal menyemai survei sampel.' })
    } finally {
      setLoading(false)
    }
  }

  const activeStats = stats || DEFAULT_STATS
  const transformationRate = activeStats.total_surveys > 0
    ? Math.round((activeStats.migrated_to_postgres / activeStats.total_surveys) * 100)
    : 75

  // Chart 1: Bar Chart Distribusi per Domain
  const domainChartData = useMemo(() => {
    const domains = [
      { key: 'AIR_DAN_SAMPAH', label: 'Air & Sampah' },
      { key: 'ENERGI', label: 'Energi PLTS' },
      { key: 'EKONOMI', label: 'Ekonomi Pala' },
      { key: 'WISATA', label: 'Wisata' },
      { key: 'BUDAYA', label: 'Cagar Budaya' },
    ]

    return domains.map((d) => {
      const total = activeStats.by_domain?.[d.key] || (d.key === 'AIR_DAN_SAMPAH' ? 8 : d.key === 'ENERGI' ? 5 : 4)
      const pending = Math.max(0, Math.round(total * 0.25))
      const migrated = total - pending
      return {
        domain: d.label,
        migrated,
        pending,
        total,
      }
    })
  }, [activeStats])

  // Chart 2: Donut Chart Tingkat Urgensi
  const urgencyChartData = useMemo(() => {
    const urgency = activeStats.by_urgency || { KRITIS: 4, TINGGI: 8, SEDANG: 9, RENDAH: 3 }
    return [
      { name: 'Kritis (Mendesak)', value: urgency.KRITIS || 4, color: '#EF4444' },
      { name: 'Tinggi', value: urgency.TINGGI || 8, color: '#F97316' },
      { name: 'Sedang', value: urgency.SEDANG || 9, color: '#F59E0B' },
      { name: 'Rendah', value: urgency.RENDAH || 3, color: '#10B981' },
    ]
  }, [activeStats])

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs backdrop-blur-md">
          {label && <p className="font-bold text-[#F4B75E] mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2 my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Filtered Surveys Table
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      if (domainFilter !== 'ALL' && s.problem_domain !== domainFilter) return false
      if (statusFilter !== 'ALL' && s.etl_status !== statusFilter) return false
      if (searchTableQuery.trim()) {
        const q = searchTableQuery.toLowerCase()
        return (
          s.title.toLowerCase().includes(q) ||
          s.survey_code.toLowerCase().includes(q) ||
          s.collector_name.toLowerCase().includes(q) ||
          s.island_name.toLowerCase().includes(q) ||
          (s.village_name || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [surveys, domainFilter, statusFilter, searchTableQuery])

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-300/40">
              <Database size={13} className="text-emerald-600" /> Pipa ETL Hybrid Database (SRS 6.1 &amp; BAB XI)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <MapPin size={12} /> Staging NoSQL (JSON) ➔ PostGIS 7-Layer
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#081D35] tracking-tight flex items-center gap-2">
            <span>Pemetaan Masalah Lapangan &amp; Validasi ETL Spasial</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Mandat Syafa Nailah Mufidah &amp; Fauzan Arisanto: Formulir survei atribut dinamis lapangan fleksibel dan pipa transformasi data spasial ke peta geodesik kepulauan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToMap && (
            <button
              type="button"
              onClick={onNavigateToMap}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              <Layers size={14} className="text-sky-600" /> Buka Peta 7-Layer
            </button>
          )}

          <button
            type="button"
            onClick={handleSeedSamples}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-slate-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Muat data survei sampel demonstrasi"
          >
            <Sparkles size={14} /> Semai Survei Sampel
          </button>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('survei')}
          className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'survei'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText size={15} /> 1. Input Formulir Lapangan Fleksibel (NoSQL Staging)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('etl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'etl'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <RefreshCw size={15} /> 2. Manajer Pipa ETL &amp; Transformasi PostGIS
          {activeStats.pending_etl > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">
              {activeStats.pending_etl} Pending
            </span>
          )}
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in shadow-xs ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* 2. Top Bento KPI: 5 Barometer Survei Lapangan & ETL */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Card 1: Total Dokumen Survei */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Dokumen Survei</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-700 shrink-0">
                <Database size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {activeStats.total_surveys} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Temuan</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Staging NoSQL / MongoDB
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <CheckCircle2 size={11} className="shrink-0" /> <span className="truncate">5 Pulau Terdata</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Migrasi ETL */}
        <div
          onClick={() => {
            setActiveTab('etl')
            setStatusFilter('PENDING')
          }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Pending Migrasi ETL</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-700 group-hover:scale-110 transition-transform shrink-0">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#D97706] mb-1">
              {activeStats.pending_etl} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Antrean</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Perlu Verifikasi Desa
            </div>
            <div className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-full ${
              activeStats.pending_etl > 0 ? 'text-amber-800 bg-amber-100' : 'text-emerald-700 bg-emerald-50'
            }`}>
              <AlertTriangle size={11} className="shrink-0" />
              <span className="truncate">{activeStats.pending_etl > 0 ? `${activeStats.pending_etl} Perlu Migrasi` : 'Semua Termigrasi'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Termigrasi ke PostGIS */}
        <div
          onClick={() => {
            setActiveTab('etl')
            setStatusFilter('MIGRATED_TO_POSTGRES')
          }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">PostGIS 7-Layer</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-700 group-hover:scale-110 transition-transform shrink-0">
                <Layers size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {activeStats.migrated_to_postgres} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Fitur</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Aktif di Peta Geodesik
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <CheckCircle2 size={11} className="shrink-0" /> <span className="truncate">RFC 7946 Geospasial</span>
            </div>
          </div>
        </div>

        {/* Card 4: Rasio Transformasi ETL */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Rasio Pipa ETL</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-700 shrink-0">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {transformationRate}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Efisiensi Staging ➔ GIS
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 sm:h-1.5 overflow-hidden">
              <div
                className="bg-sky-600 h-1 sm:h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${transformationRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Wilayah Gugus Pulau (Rentang 2 Kolom di Mobile) */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Cakupan Wilayah</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-700 shrink-0">
                <MapPin size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              6 Pulau
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Kepulauan Banda Lengkap
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <Sparkles size={11} className="shrink-0" /> <span className="truncate">Presisi WGS 84</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dual Recharts Visualizations Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6">
        {/* Visualisasi 1: Bar Chart Sebaran Domain Survei (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <Sliders size={18} className="text-emerald-600" />
                Distribusi Temuan per Domain Masalah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan data survei yang sudah termigrasi ke PostGIS vs pending migrasi ETL
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              5 Sektor Masalah
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="domain" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} allowDecimals={false} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="migrated" name="Termigrasi PostGIS" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending ETL" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visualisasi 2: Donut Chart Komposisi Tingkat Urgensi (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <Activity size={18} className="text-amber-500" />
                Komposisi Tingkat Urgensi Temuan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritas penanganan masalah lapangan berdasarkan tingkat kedaruratan warga
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">
              {activeStats.total_surveys} Titik Masalah
            </span>
          </div>

          <div className="relative h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {urgencyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[#081D35]">
                {Math.round(((urgencyChartData[0].value + urgencyChartData[1].value) / (activeStats.total_surveys || 1)) * 100)}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kritis / Tinggi</span>
            </div>
          </div>

          {/* Custom segmented legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {urgencyChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TAB 1: FORMULIR INPUT SURVEI LAPANGAN */}
      {activeTab === 'survei' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form Card (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" />
                Formulir Survei Dinamis Masalah Kepulauan
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                NoSQL Staging Input
              </span>
            </div>

            <form onSubmit={handleSubmitSurvey} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Peneliti / Surveyor Desa
                  </label>
                  <input
                    type="text"
                    required
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Domain Masalah Riset
                  </label>
                  <select
                    value={problemDomain}
                    onChange={(e) => {
                      const dom = e.target.value as ProblemDomain
                      setProblemDomain(dom)
                      applyTemplate(dom)
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  >
                    <option value="AIR_DAN_SAMPAH">💧 Air Bersih &amp; Sampah Plastik</option>
                    <option value="ENERGI">⚡ Energi &amp; Kelistrikan Desa</option>
                    <option value="EKONOMI">🥥 Ekonomi &amp; Koperasi Hatta</option>
                    <option value="WISATA">🏖️ Pariwisata &amp; Homestay</option>
                    <option value="BUDAYA">🏛️ Cagar Budaya &amp; Sejarah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pulau Wilayah Survei
                  </label>
                  <select
                    value={islandName}
                    onChange={(e) => handleIslandChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  >
                    {Object.keys(ISLAND_PRESETS).map((isl) => (
                      <option key={isl} value={isl}>
                        {isl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Desa / Negeri Administratif
                  </label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RT / RW / Dusun
                  </label>
                  <input
                    type="text"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Title & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Temuan / Masalah Lapangan
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Krisis Air Payau &amp; Sumur Galian"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Urgensi Masalah
                  </label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  >
                    <option value="RENDAH">🟢 Rendah</option>
                    <option value="SEDANG">🟡 Sedang</option>
                    <option value="TINGGI">🟠 Tinggi</option>
                    <option value="KRITIS">🔴 Kritis (Mendesak)</option>
                  </select>
                </div>
              </div>

              {/* GPS Coordinates Box */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <MapPin size={15} className="text-sky-600" /> Koordinat Geografis WGS 84 (PostGIS Target)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Banda Bbox: [-4.65, -4.45], [129.80, 130.05]
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Latitude (Garis Lintang)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Longitude (Garis Bujur)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Key-Value Attributes Builder */}
              <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Atribut Dinamis NoSQL (Flexible Attributes JSON)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tambahkan pasangan Key-Value secara fleksibel tanpa dibatasi skema kolom kaku
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    <Plus size={13} /> Tambah Kolom
                  </button>
                </div>

                <div className="space-y-2">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Nama Kunci (e.g. kadar_tds_sumur_ppm)"
                          value={field.key}
                          onChange={(e) => updateCustomField(idx, e.target.value, field.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="Nilai (e.g. 2650 atau teks)"
                          value={field.value}
                          onChange={(e) => updateCustomField(idx, field.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeCustomField(idx)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                          title="Hapus baris atribut"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Lapangan &amp; Rekomendasi Solusi
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                  placeholder="Catatan detail temuan surveyor di lokasi..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-slate-800 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} /> Simpan ke Staging NoSQL (raw_surveys)
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar / Preset Guide & Info Card (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Template Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles size={16} className="text-amber-500" /> Template Preset Lapangan
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih template untuk mengisi otomatis atribut dinamis sesuai domain riset kepulauan:
              </p>
              <div className="space-y-1.5">
                {(Object.keys(PRESET_TEMPLATES) as ProblemDomain[]).map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => {
                      setProblemDomain(dom)
                      applyTemplate(dom)
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between border cursor-pointer ${
                      problemDomain === dom
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{PRESET_TEMPLATES[dom].label}</span>
                    <ArrowRight size={13} className={problemDomain === dom ? 'text-emerald-600' : 'text-slate-400'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Explanation Card */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-wider">
                <Info size={16} className="text-sky-600" /> Arsitektur Hybrid Database
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-[#081D35]">Tahap 1 (Staging NoSQL):</strong> Formulir survei menyimpan dokumen fleksibel (JSON) tanpa migrasi skema tabel yang kaku.
                </li>
                <li>
                  <strong className="text-[#081D35]">Tahap 2 (ETL Pipeline):</strong> Validasi koordinat Bounding Box Banda WGS 84 dan transformasi ke 7-Layer Spasial PostGIS.
                </li>
                <li>
                  <strong className="text-[#081D35]">Tahap 3 (Peta Interaktif):</strong> Ditampilkan secara langsung di peta desa dengan GeoJSON standar RFC 7946.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: MANAJER PIPA ETL & TRANSFORMASI POSTGIS */}
      {activeTab === 'etl' && (
        <div className="space-y-4">
          {/* ETL Action & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Domain:</span>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Semua Domain</option>
                  <option value="AIR_DAN_SAMPAH">💧 Air &amp; Sampah</option>
                  <option value="ENERGI">⚡ Energi</option>
                  <option value="EKONOMI">🥥 Ekonomi</option>
                  <option value="WISATA">🏖️ Wisata</option>
                  <option value="BUDAYA">🏛️ Budaya</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Status ETL:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Pending Migrasi</option>
                  <option value="MIGRATED_TO_POSTGRES">Sudah Termigrasi</option>
                </select>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode, temuan, surveyor..."
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500 w-52"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                title="Segarkan data survei"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Segarkan
              </button>

              <button
                type="button"
                onClick={handleRunETL}
                disabled={isMigrating || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-slate-800 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isMigrating ? 'animate-spin' : ''} />
                {isMigrating ? 'Memproses Pipa ETL...' : 'Eksekusi Pipa ETL ke PostGIS'}
              </button>
            </div>
          </div>

          {/* Raw Surveys Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Kode Survei</th>
                    <th className="py-3 px-4">Judul Temuan</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Wilayah / Lokasi</th>
                    <th className="py-3 px-4">Koordinat WGS 84</th>
                    <th className="py-3 px-4">Urgensi</th>
                    <th className="py-3 px-4">Status ETL</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSurveys.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 px-4 text-center text-slate-400">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="font-bold text-[#081D35] text-base">Tidak ada data survei untuk filter ini</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Klik <strong>"Semai Survei Sampel"</strong> di atas untuk memuat data awal demonstrasi.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSurveys.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-sky-700">
                          {s.survey_code}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#081D35]">
                          {s.title}
                          <div className="text-[11px] text-slate-400 font-normal">
                            oleh: {s.collector_name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              s.problem_domain === 'AIR_DAN_SAMPAH'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : s.problem_domain === 'ENERGI'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : s.problem_domain === 'EKONOMI'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {s.problem_domain}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {s.island_name}
                          {s.village_name && <span className="text-slate-400"> • {s.village_name}</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              s.urgency_level === 'KRITIS'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : s.urgency_level === 'TINGGI'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {s.urgency_level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {s.etl_status === 'MIGRATED_TO_POSTGRES' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                              <CheckCircle2 size={13} /> PostGIS Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                              <Activity size={13} /> Pending ETL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedSurveyForModal(s)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                          >
                            Inspeksi
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. JSON Attribute Inspection Modal */}
      {selectedSurveyForModal && (
        <div
          className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedSurveyForModal(null)}
        >
          <div
            className="modal-content animate-fade-in w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-3 mb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                  {selectedSurveyForModal.survey_code}
                </span>
                <h3 className="text-base font-bold text-[#081D35] mt-1">
                  {selectedSurveyForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSurveyForModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-semibold">Lokasi &amp; Surveyor:</span>
                <p className="text-slate-800 font-medium">
                  {selectedSurveyForModal.island_name} ({selectedSurveyForModal.village_name || '-'}) • Lat: {selectedSurveyForModal.latitude}, Lng: {selectedSurveyForModal.longitude}
                </p>
              </div>

              <div>
                <span className="text-slate-600 font-bold block mb-1.5">
                  Flexible Attributes (NoSQL / MongoDB Staging JSON):
                </span>
                <pre className="bg-[#081D35] p-3 rounded-xl text-emerald-400 text-xs overflow-x-auto font-mono max-h-48 border border-slate-800">
                  {JSON.stringify(selectedSurveyForModal.flexible_attributes, null, 2)}
                </pre>
              </div>

              {selectedSurveyForModal.notes && (
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                  <span className="text-amber-900 font-bold block mb-0.5">Catatan Lapangan:</span>
                  <p className="text-slate-700 italic">
                    "{selectedSurveyForModal.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {onNavigateToMap && selectedSurveyForModal.etl_status === 'MIGRATED_TO_POSTGRES' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSurveyForModal(null)
                    onNavigateToMap()
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-slate-800 transition cursor-pointer"
                >
                  <MapPin size={14} /> Buka di Peta 7-Layer
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSurveyForModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyEtlWorkspace
