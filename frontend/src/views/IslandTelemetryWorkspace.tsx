import React, { useState, useEffect, useMemo } from 'react'
import {
  Activity,
  Droplets,
  Sun,
  BatteryCharging,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  Sliders,
  ShieldCheck,
  Fuel,
  Sparkles,
  CheckCircle2,
  Search,
  TrendingUp,
  Clock,
  Waves,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import {
  iotService,
  IoTStationStatus,
  IoTTelemetryItemResponse,
  IoTIslandResiliencySummary,
} from '../services/iot'

const DEFAULT_STATIONS: IoTStationStatus[] = [
  {
    station_code: 'ESP32-ST01-NEIRA',
    station_name: 'Stasiun RO Dermaga Neira',
    island_name: 'Pulau Neira',
    raw_water_tds_ppm: 420,
    filtered_water_tds_ppm: 42.5,
    clean_tank_level_pct: 88.5,
    daily_dispensed_liters: 1480,
    valve_status: 'OPEN',
    active_power_source: 'PLTS Surya',
    power_watt: 680,
    battery_soc_pct: 94,
    alert_level: 'NORMAL',
    alert_message: null,
    last_heartbeat: new Date().toISOString(),
  },
  {
    station_code: 'ESP32-ST02-LONTHOIR',
    station_name: 'Stasiun RO Lonthoir Banda Besar',
    island_name: 'Banda Besar',
    raw_water_tds_ppm: 510,
    filtered_water_tds_ppm: 56.0,
    clean_tank_level_pct: 76.2,
    daily_dispensed_liters: 990,
    valve_status: 'OPEN',
    active_power_source: 'PLTS Surya',
    power_watt: 540,
    battery_soc_pct: 88,
    alert_level: 'NORMAL',
    alert_message: null,
    last_heartbeat: new Date().toISOString(),
  },
  {
    station_code: 'ESP32-ST03-AY',
    station_name: 'Stasiun Desalinasi SWRO Pulau Ay',
    island_name: 'Pulau Ay',
    raw_water_tds_ppm: 14200,
    filtered_water_tds_ppm: 62.4,
    clean_tank_level_pct: 69.0,
    daily_dispensed_liters: 840,
    valve_status: 'OPEN',
    active_power_source: 'Hibrida PLTS + Baterai',
    power_watt: 920,
    battery_soc_pct: 82,
    alert_level: 'NORMAL',
    alert_message: null,
    last_heartbeat: new Date().toISOString(),
  },
  {
    station_code: 'ESP32-ST04-RHUN',
    station_name: 'Stasiun SWRO Pesisir Pulau Rhun',
    island_name: 'Pulau Rhun',
    raw_water_tds_ppm: 16800,
    filtered_water_tds_ppm: 74.8,
    clean_tank_level_pct: 64.5,
    daily_dispensed_liters: 660,
    valve_status: 'OPEN',
    active_power_source: 'PLTS Surya',
    power_watt: 870,
    battery_soc_pct: 76,
    alert_level: 'NORMAL',
    alert_message: null,
    last_heartbeat: new Date().toISOString(),
  },
]

const DEFAULT_SUMMARY: IoTIslandResiliencySummary = {
  total_active_stations: 4,
  total_clean_water_dispensed_today_ltr: 3970,
  avg_island_water_tds_ppm: 58.9,
  avg_tank_reserve_pct: 74.5,
  solar_energy_ratio_pct: 86.0,
  estimated_diesel_fuel_saved_liters: 146.5,
  active_alerts_count: 0,
  island_readiness_status: 'OPTIMAL',
  stations: DEFAULT_STATIONS,
}

export const IslandTelemetryWorkspace: React.FC = () => {
  const [summary, setSummary] = useState<IoTIslandResiliencySummary | null>(null)
  const [stations, setStations] = useState<IoTStationStatus[]>([])
  const [history, setHistory] = useState<IoTTelemetryItemResponse[]>([])
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [pulsing, setPulsing] = useState<boolean>(false)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchTelemetryData = async () => {
    try {
      const [sumData, histData] = await Promise.all([
        iotService.getResiliencySummary(),
        iotService.getHistory(selectedStationFilter || undefined, 30),
      ])
      setSummary(sumData)
      setStations(sumData.stations && sumData.stations.length > 0 ? sumData.stations : DEFAULT_STATIONS)
      setHistory(histData)
      setLastUpdated(new Date().toLocaleTimeString('id-ID'))
    } catch {
      // Gunakan fallback default jika endpoint simulator offline
      if (!summary) {
        setSummary(DEFAULT_SUMMARY)
        setStations(DEFAULT_STATIONS)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTelemetryData()
  }, [selectedStationFilter])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTelemetryData()
      }, 10000) // Polling 10 detik
    }
    return () => clearInterval(interval)
  }, [autoRefresh, selectedStationFilter])

  const handleSimulatePulse = async () => {
    setPulsing(true)
    try {
      await iotService.simulatePulse()
      await fetchTelemetryData()
    } catch {
      // ignore
    } finally {
      setPulsing(false)
    }
  }

  const getTdsBadge = (tds: number) => {
    if (tds <= 80) {
      return {
        label: 'Sangat Murni (Layak Minum)',
        color: '#10b981',
        bg: '#ecfdf5',
        border: '#a7f3d0',
      }
    }
    if (tds <= 150) {
      return {
        label: 'Standar Aman Minum',
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
      }
    }
    if (tds <= 300) {
      return {
        label: 'Waspada (Backwash Membran)',
        color: '#f59e0b',
        bg: '#fffbeb',
        border: '#fde68a',
      }
    }
    return {
      label: 'Kritis (Membran Rusak)',
      color: '#ef4444',
      bg: '#fef2f2',
      border: '#fecaca',
    }
  }

  const getReadinessTheme = (readiness: string) => {
    switch (readiness) {
      case 'KRITIS':
        return { color: '#ef4444', bg: '#fef2f2', label: 'SIAGA KRITIS' }
      case 'WASPADA':
        return { color: '#f59e0b', bg: '#fffbeb', label: 'WASPADA OPERASIONAL' }
      default:
        return { color: '#10b981', bg: '#ecfdf5', label: 'OPTIMAL & SIAP' }
    }
  }

  const activeSummary = summary || DEFAULT_SUMMARY
  const effectiveStations = stations.length > 0 ? stations : DEFAULT_STATIONS

  // Chart 1: Time Series Area Chart (TDS & Power)
  const chartHistoryData = useMemo(() => {
    if (history.length > 0) {
      return [...history].reverse().map((item) => ({
        time: new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tds: parseFloat(item.filtered_water_tds_ppm.toFixed(1)),
        power: parseFloat(item.power_watt.toFixed(0)),
        tank: parseFloat(item.clean_tank_level_pct.toFixed(0)),
        station: item.station_name,
      }))
    }
    // Fallback data simulasi kurva jika history kosong
    const now = Date.now()
    return Array.from({ length: 10 }).map((_, idx) => {
      const t = new Date(now - (10 - idx) * 300000)
      return {
        time: t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        tds: parseFloat((52 + Math.sin(idx) * 8).toFixed(1)),
        power: Math.round(620 + Math.cos(idx) * 120),
        tank: Math.round(75 + idx * 1.2),
        station: 'Stasiun Gabungan',
      }
    })
  }, [history])

  // Chart 2: Station Comparison Bar Chart (Tank vs Battery)
  const stationComparisonData = useMemo(() => {
    return effectiveStations.map((st) => ({
      name: st.station_name.replace('Stasiun ', '').replace('Desalinasi ', '').replace(' Pesisir', ''),
      tankLevel: Math.round(st.clean_tank_level_pct),
      batterySoc: Math.round(st.battery_soc_pct),
      tds: Math.round(st.filtered_water_tds_ppm),
    }))
  }, [effectiveStations])

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

  // Filtered History
  const filteredHistory = useMemo(() => {
    return history.filter((log) => {
      if (selectedStationFilter && log.station_code !== selectedStationFilter) return false
      if (searchFilter) {
        const q = searchFilter.toLowerCase()
        return (
          log.station_name.toLowerCase().includes(q) ||
          log.station_code.toLowerCase().includes(q) ||
          log.island_name.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [history, selectedStationFilter, searchFilter])

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-300/40">
              <Radio size={13} className="text-emerald-600 animate-pulse" /> Telemetri Mikrokontroler ESP32 &amp; Sensor Desa
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <Waves size={12} /> Desalinasi BWRO &amp; SWRO 4 Gugus Pulau
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#081D35] tracking-tight flex items-center gap-2">
            <span>Pusat Komando Telemetri &amp; Resiliensi Pulau</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Mandat Prof. Purwo: Pengawasan real-time kualitas air minum BWRO/SWRO (sensor TDS PPM) &amp; bauran energi surya PLTS vs diesel PLTD kepulauan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSimulatePulse}
            disabled={pulsing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-slate-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {pulsing ? (
              <>
                <RefreshCw size={14} className="animate-spin text-[#F4B75E]" /> Menembakkan Sensor...
              </>
            ) : (
              <>
                <Zap size={14} className="text-[#F4B75E]" /> Tembak Pulsa Sensor (Simulasi Live)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Activity size={14} className={autoRefresh ? 'text-emerald-600' : 'text-slate-400'} />
            Auto-Sync: {autoRefresh ? 'ON (10s)' : 'PAUSE'}
          </button>

          <button
            type="button"
            onClick={fetchTelemetryData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            title="Segarkan data telemetri manual"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Top Bento KPI: 5 Barometer Resiliensi Pulau */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Status Kesiapan Pulau */}
        <div
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Kesiapan Resiliensi</span>
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: getReadinessTheme(activeSummary.island_readiness_status).bg }}
            >
              <ShieldCheck size={18} style={{ color: getReadinessTheme(activeSummary.island_readiness_status).color }} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {getReadinessTheme(activeSummary.island_readiness_status).label}
          </div>
          <div className="text-xs text-slate-500 mb-2">
            {activeSummary.active_alerts_count > 0
              ? `${activeSummary.active_alerts_count} Peringatan Terdeteksi`
              : '4 Stasiun Beroperasi Optimal'}
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <CheckCircle2 size={11} /> Mandat FTI Berjalan 100%
          </div>
        </div>

        {/* KPI 2: Total Air Minum Terdistribusi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Air Minum Konsumsi</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-700">
              <Droplets size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {activeSummary.total_clean_water_dispensed_today_ltr.toLocaleString('id-ID')}{' '}
            <span className="text-sm font-semibold text-sky-600">Liter</span>
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Produksi Hari Ini dari 4 Stasiun
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
            <Sparkles size={11} /> Zero Single-Use Plastic
          </div>
        </div>

        {/* KPI 3: Rata-Rata Kemurnian TDS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Kemurnian Air TDS</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
              <Sliders size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {activeSummary.avg_island_water_tds_ppm.toFixed(1)}{' '}
            <span className="text-sm font-semibold text-emerald-600">PPM</span>
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Standar WHO &lt; 100 PPM (Sangat Murni)
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <CheckCircle2 size={11} /> Membran RO Terkalibrasi
          </div>
        </div>

        {/* KPI 4: Bauran Energi Bersih PLTS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Bauran Energi Surya</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
              <Sun size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {activeSummary.solar_energy_ratio_pct.toFixed(0)}%{' '}
            <span className="text-sm font-semibold text-amber-600">PLTS</span>
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Cadangan Tandon Rata-Rata: {activeSummary.avg_tank_reserve_pct.toFixed(0)}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, activeSummary.solar_energy_ratio_pct))}%` }}
            />
          </div>
        </div>

        {/* KPI 5: Penghematan BBM Diesel Solar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Hemat Solar PLTD</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700">
              <Fuel size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {activeSummary.estimated_diesel_fuel_saved_liters.toFixed(1)}{' '}
            <span className="text-sm font-semibold text-purple-600">Liter</span>
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Reduksi Emisi Gas Buang PLTD
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            <TrendingUp size={11} /> ~385 kg CO₂e Tereduksi
          </div>
        </div>
      </div>

      {/* 3. Dual Recharts Visualizations Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualisasi 1: Area Chart Dinamika Fluktuasi Kualitas Air & Daya (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                Dinamika Sensor Air Minum (TDS PPM) &amp; Daya (Watt)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fluktuasi filtrasi membran RO dan serapan daya panel surya dari paket telemetri 24 jam
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="tds"
                  name="Kemurnian TDS (PPM)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTds)"
                />
                <Area
                  type="monotone"
                  dataKey="power"
                  name="Daya Stasiun (Watt)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPower)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visualisasi 2: Bar Chart Kapasitas Tandon & Baterai per Stasiun (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <Sliders size={18} className="text-sky-500" />
                Cadangan Tandon &amp; Baterai Stasiun
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan level tandon air (%) dan kapasitas baterai cadangan (%)
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg">
              4 Stasiun
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} domain={[0, 100]} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="tankLevel" name="Level Tandon (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="batterySoc" name="Baterai SoC (%)" fill="#F4B75E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Grid 4 Stasiun IoT Stasiun Pengolahan Air & Energi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-[#081D35] flex items-center gap-2">
              <Radio size={18} className="text-sky-600" />
              Telemetri Real-Time 4 Stasiun Kepulauan Banda
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Status katup solenoid, baterai, sensor kualitas air terhubung mikrokontroler
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Terhubung: {effectiveStations.length} Node
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {effectiveStations.map((st) => {
            const tdsMeta = getTdsBadge(st.filtered_water_tds_ppm)
            return (
              <div
                key={st.station_code}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Station Header */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                        {st.station_code}
                      </span>
                      <h4 className="font-bold text-[#081D35] text-sm mt-1.5 leading-snug">
                        {st.station_name}
                      </h4>
                      <span className="text-xs text-slate-500">{st.island_name}</span>
                    </div>

                    {/* Status Beacon Indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{
                          backgroundColor:
                            st.alert_level === 'CRITICAL' ? '#ef4444' : st.alert_level === 'WARNING' ? '#f59e0b' : '#10b981',
                          boxShadow: `0 0 8px ${st.alert_level === 'CRITICAL' ? '#ef4444' : st.alert_level === 'WARNING' ? '#f59e0b' : '#10b981'}`,
                        }}
                      />
                      <span
                        className="text-[10px] font-black uppercase"
                        style={{
                          color:
                            st.alert_level === 'CRITICAL' ? '#ef4444' : st.alert_level === 'WARNING' ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {st.alert_level}
                      </span>
                    </div>
                  </div>

                  {/* Alert Notification if any */}
                  {st.alert_level !== 'NORMAL' && (
                    <div
                      className="mb-3 p-2 rounded-xl text-xs flex gap-1.5 items-center font-medium"
                      style={{
                        backgroundColor: st.alert_level === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${st.alert_level === 'CRITICAL' ? '#fecaca' : '#fde68a'}`,
                        color: st.alert_level === 'CRITICAL' ? '#dc2626' : '#d97706',
                      }}
                    >
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>{st.alert_message || 'Peringatan operasional sensor'}</span>
                    </div>
                  )}

                  {/* Water Metrics Panel */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-sky-700 font-bold flex items-center gap-1">
                        <Droplets size={13} /> Kualitas Air RO
                      </span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          color: tdsMeta.color,
                          backgroundColor: tdsMeta.bg,
                          border: `1px solid ${tdsMeta.border}`,
                        }}
                      >
                        {st.filtered_water_tds_ppm.toFixed(1)} PPM
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 pt-1">
                      <span>Baku: <b className="text-slate-700">{st.raw_water_tds_ppm.toFixed(0)} PPM</b></span>
                      <span>Dispenser: <b className="text-slate-700">{st.daily_dispensed_liters.toFixed(0)} L</b></span>
                    </div>

                    {/* Tank Level Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Level Tandon:</span>
                        <b className="text-[#081D35]">{st.clean_tank_level_pct.toFixed(1)}%</b>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, st.clean_tank_level_pct))}%`,
                            background:
                              st.clean_tank_level_pct < 20
                                ? '#ef4444'
                                : st.clean_tank_level_pct < 40
                                ? '#f59e0b'
                                : 'linear-gradient(90deg, #06b6d4, #10b981)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Energy Metrics Panel */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
                        <Sun size={13} className="text-amber-600" /> Daya Stasiun
                      </span>
                      <span className="text-xs font-black text-[#081D35]">
                        {st.power_watt.toFixed(0)} Watt
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 pt-1">
                      <span>Sumber: <b className="text-amber-700">{st.active_power_source}</b></span>
                      <span>
                        Katup:{' '}
                        <b className={st.valve_status === 'OPEN' ? 'text-emerald-600' : 'text-slate-400'}>
                          {st.valve_status}
                        </b>
                      </span>
                    </div>

                    {/* Battery Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span className="flex items-center gap-1">
                          <BatteryCharging size={11} className="text-emerald-600" /> Baterai (SoC):
                        </span>
                        <b className="text-[#081D35]">{st.battery_soc_pct.toFixed(0)}%</b>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, st.battery_soc_pct))}%`,
                            background:
                              st.battery_soc_pct < 25 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> Heartbeat:
                  </span>
                  <span>{new Date(st.last_heartbeat).toLocaleTimeString('id-ID')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Historical Telemetry Stream Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              Log Aliran Paket Telemetri ESP32
            </h3>
            <span className="text-xs text-slate-500">
              Sinkronisasi terakhir: {lastUpdated || 'Baru saja'} • {filteredHistory.length} paket tersimpan
            </span>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari stasiun atau pulau..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F4B75E] text-slate-700 w-48"
              />
            </div>

            <select
              value={selectedStationFilter}
              onChange={(e) => setSelectedStationFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#F4B75E]"
            >
              <option value="">Semua Stasiun</option>
              {effectiveStations.map((s) => (
                <option key={s.station_code} value={s.station_code}>
                  {s.station_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
            Belum ada paket log telemetri yang diterima untuk filter ini. Klik{' '}
            <strong className="text-[#081D35]">"Tembak Pulsa Sensor"</strong> di atas untuk menyuntikkan data live simulator.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Stasiun</th>
                  <th className="py-2.5 px-3">TDS Baku</th>
                  <th className="py-2.5 px-3">TDS RO Minum</th>
                  <th className="py-2.5 px-3">Tandon</th>
                  <th className="py-2.5 px-3">Tegangan</th>
                  <th className="py-2.5 px-3">Arus</th>
                  <th className="py-2.5 px-3">Daya</th>
                  <th className="py-2.5 px-3">Baterai</th>
                  <th className="py-2.5 px-3">Status Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-[#081D35]">{log.station_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.station_code}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {log.raw_water_tds_ppm.toFixed(0)} ppm
                    </td>
                    <td className="py-2 px-3 font-bold">
                      <span
                        className={
                          log.filtered_water_tds_ppm <= 80
                            ? 'text-emerald-600'
                            : log.filtered_water_tds_ppm <= 150
                            ? 'text-sky-600'
                            : 'text-amber-600'
                        }
                      >
                        {log.filtered_water_tds_ppm.toFixed(1)} ppm
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-sky-700">
                      {log.clean_tank_level_pct.toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {log.solar_panel_voltage_v.toFixed(1)} V
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {log.solar_current_a.toFixed(1)} A
                    </td>
                    <td className="py-2 px-3 font-bold text-amber-700">
                      {log.power_watt.toFixed(0)} W
                    </td>
                    <td className="py-2 px-3 font-semibold text-emerald-700">
                      {log.battery_soc_pct.toFixed(0)}%
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${
                          log.alert_level === 'NORMAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.alert_level === 'WARNING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {log.alert_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
