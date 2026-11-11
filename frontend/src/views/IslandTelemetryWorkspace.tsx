import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import {
  iotService,
  IoTStationStatus,
  IoTTelemetryItemResponse,
  IoTIslandResiliencySummary,
} from '../services/iot'

export const IslandTelemetryWorkspace: React.FC = () => {
  const [summary, setSummary] = useState<IoTIslandResiliencySummary | null>(null)
  const [stations, setStations] = useState<IoTStationStatus[]>([])
  const [history, setHistory] = useState<IoTTelemetryItemResponse[]>([])
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [pulsing, setPulsing] = useState<boolean>(false)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchTelemetryData = async () => {
    try {
      const [sumData, histData] = await Promise.all([
        iotService.getResiliencySummary(),
        iotService.getHistory(selectedStationFilter || undefined, 25),
      ])
      setSummary(sumData)
      setStations(sumData.stations || [])
      setHistory(histData)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // ignore
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
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.4)',
      }
    }
    if (tds <= 150) {
      return {
        label: 'Standar Aman Minum',
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.4)',
      }
    }
    if (tds <= 300) {
      return {
        label: 'Waspada (Backwash Membran)',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.4)',
      }
    }
    return {
      label: 'Kritis (Membran Rusak)',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
    }
  }

  const getReadinessTheme = (readiness: string) => {
    switch (readiness) {
      case 'KRITIS':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'SIAGA KRITIS' }
      case 'WASPADA':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'WASPADA OPERASIONAL' }
      default:
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'OPTIMAL & SIAP' }
    }
  }

  return (
    <div className="workspace-container animate-fade-in">
      {/* Workspace Header */}
      <div className="workspace-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem', display: 'inline-flex', gap: '0.35rem' }}>
            <Radio size={12} className="animate-pulse" /> Telemetri Mikrokontroler ESP32 &amp; Sensor Desa
          </span>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Pusat Komando Telemetri &amp; Resiliensi Pulau
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            Mandat Prof. Purwo: Pengawasan real-time kualitas air minum BWRO/SWRO (TDS sensor) &amp; bauran energi surya vs diesel PLTD.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSimulatePulse}
            disabled={pulsing}
            className="btn btn-primary"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.825rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
            }}
          >
            {pulsing ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Menembakkan Sensor...
              </>
            ) : (
              <>
                <Zap size={14} /> Tembak Pulsa Sensor (Simulasi Live)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 0.85rem',
              fontSize: '0.8rem',
              background: autoRefresh ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              borderColor: autoRefresh ? '#10b981' : 'var(--border-color)',
              color: autoRefresh ? '#34d399' : '#94a3b8',
            }}
          >
            <Activity size={14} /> Auto-Sync: {autoRefresh ? 'ON (10s)' : 'PAUSE'}
          </button>

          <button
            type="button"
            onClick={fetchTelemetryData}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Top Bento KPI: Island Resiliency Barometer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {/* Status Kesiapan Pulau */}
        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.65)', border: `1px solid ${getReadinessTheme(summary?.island_readiness_status || 'OPTIMAL').color}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: getReadinessTheme(summary?.island_readiness_status || 'OPTIMAL').color }}>
            <ShieldCheck size={14} /> Kesiapan Resiliensi Pulau
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.25rem' }}>
            {getReadinessTheme(summary?.island_readiness_status || 'OPTIMAL').label}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            {summary?.active_alerts_count ? `${summary.active_alerts_count} Peringatan Terdeteksi` : 'Seluruh Stasiun Beroperasi Normal'}
          </div>
        </div>

        {/* Total Air Terdistribusi */}
        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#06b6d4', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <Droplets size={14} /> Air Minum Konsumsi Hari Ini
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.25rem' }}>
            {summary?.total_clean_water_dispensed_today_ltr.toLocaleString() ?? '—'}{' '}
            <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600 }}>Liter RO</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Diolah dari 4 Stasiun BWRO/SWRO
          </div>
        </div>

        {/* Rata-Rata TDS Air */}
        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#10b981', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <Sliders size={14} /> Rata-Rata Kemurnian TDS
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.25rem' }}>
            {summary?.avg_island_water_tds_ppm ?? '—'}{' '}
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>PPM</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Standar WHO &lt; 100 ppm (Sangat Murni)
          </div>
        </div>

        {/* Bauran Energi Surya */}
        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <Sun size={14} /> Bauran Energi Bersih (Surya)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.25rem' }}>
            {summary?.solar_energy_ratio_pct ?? '—'}{' '}
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>% PLTS</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Cadangan Tandon Rata-Rata: {summary?.avg_tank_reserve_pct}%
          </div>
        </div>

        {/* Penghematan BBM Diesel PLTD */}
        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#a78bfa', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <Fuel size={14} /> Hemat BBM Diesel Hari Ini
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.25rem' }}>
            {summary?.estimated_diesel_fuel_saved_liters ?? '—'}{' '}
            <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>Liter Solar</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Reduksi emisi gas buang PLTD pulau
          </div>
        </div>
      </div>

      {/* Grid 4 Stasiun IoT Stasiun Pengolahan Air & Energi */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={18} style={{ color: '#06b6d4' }} /> Telemetri Real-Time 4 Stasiun Kepulauan Banda
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {stations.map((st) => {
            const tdsMeta = getTdsBadge(st.filtered_water_tds_ppm)
            return (
              <div
                key={st.station_code}
                className="card"
                style={{
                  padding: '1.25rem',
                  background: 'var(--surface-color)',
                  border: st.alert_level === 'CRITICAL' ? '1px solid #ef4444' : st.alert_level === 'WARNING' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                  position: 'relative',
                }}
              >
                {/* Station Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                      {st.station_code}
                    </span>
                    <h4 style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                      {st.station_name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{st.island_name}</span>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: st.alert_level === 'CRITICAL' ? '#ef4444' : st.alert_level === 'WARNING' ? '#f59e0b' : '#10b981',
                        boxShadow: `0 0 8px ${st.alert_level === 'CRITICAL' ? '#ef4444' : st.alert_level === 'WARNING' ? '#f59e0b' : '#10b981'}`,
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: st.alert_level === 'CRITICAL' ? '#ef4444' : st.alert_level === 'WARNING' ? '#f59e0b' : '#10b981' }}>
                      {st.alert_level}
                    </span>
                  </div>
                </div>

                {/* Alert Notification if any */}
                {st.alert_level !== 'NORMAL' && (
                  <div style={{ marginBottom: '0.85rem', padding: '0.45rem 0.65rem', background: st.alert_level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: `1px solid ${st.alert_level === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`, borderRadius: 'var(--radius-sm)', color: st.alert_level === 'CRITICAL' ? '#f87171' : '#fbbf24', fontSize: '0.72rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>{st.alert_message}</span>
                  </div>
                )}

                {/* Water Metrics Panel */}
                <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.2)', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Droplets size={12} /> Kualitas Air Bersih (RO)
                    </span>
                    <span style={{ fontSize: '0.7rem', color: tdsMeta.color, fontWeight: 700, background: tdsMeta.bg, padding: '0.1rem 0.4rem', borderRadius: '4px', border: `1px solid ${tdsMeta.border}` }}>
                      {st.filtered_water_tds_ppm.toFixed(1)} PPM
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    <span>Air Baku (Sumur): <b>{st.raw_water_tds_ppm.toFixed(0)} PPM</b></span>
                    <span>Terdistribusi: <b>{st.daily_dispensed_liters.toFixed(0)} L</b></span>
                  </div>

                  {/* Tank Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                      <span>Ketinggian Tandon:</span>
                      <b>{st.clean_tank_level_pct.toFixed(1)}%</b>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, st.clean_tank_level_pct))}%`,
                          height: '100%',
                          background: st.clean_tank_level_pct < 20 ? '#ef4444' : st.clean_tank_level_pct < 40 ? '#f59e0b' : 'linear-gradient(90deg, #06b6d4, #10b981)',
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Energy Metrics Panel */}
                <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sun size={12} /> Daya Stasiun
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#f8fafc', fontWeight: 800 }}>
                      {st.power_watt.toFixed(0)} Watt
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                    <span>Sumber: <b style={{ color: '#fbbf24' }}>{st.active_power_source}</b></span>
                    <span>Katup: <b style={{ color: st.valve_status === 'OPEN' ? '#10b981' : '#64748b' }}>{st.valve_status}</b></span>
                  </div>

                  {/* Battery Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BatteryCharging size={12} color="#10b981" /> Baterai Cadangan (SoC):
                      </span>
                      <b>{st.battery_soc_pct.toFixed(0)}%</b>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, st.battery_soc_pct))}%`,
                          height: '100%',
                          background: st.battery_soc_pct < 25 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historical Telemetry Stream Log */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Activity size={16} style={{ color: '#10b981' }} /> Log Aliran Paket Telemetri ESP32
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Pembaruan terakhir: {lastUpdated || 'Baru saja'}
            </span>
          </div>

          {/* Filter Station Code */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <select
              value={selectedStationFilter}
              onChange={(e) => setSelectedStationFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#f8fafc',
                padding: '0.4rem 0.65rem',
                fontSize: '0.78rem',
              }}
            >
              <option value="">Semua Stasiun Pulau</option>
              {stations.map((s) => (
                <option key={s.station_code} value={s.station_code}>
                  {s.station_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
            Belum ada paket log telemetri yang diterima. Klik <b>"Tembak Pulsa Sensor"</b> di atas untuk menyuntikkan data live simulator.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Waktu</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Stasiun</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>TDS Baku</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>TDS RO Minum</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Tandon</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Tegangan (V)</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Arus (A)</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Daya (W)</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Baterai</th>
                  <th style={{ padding: '0.55rem 0.6rem' }}>Status Alert</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.5rem 0.6rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', color: '#f8fafc', fontWeight: 600 }}>
                      {log.station_name}
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {log.station_code}
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', color: '#94a3b8' }}>
                      {log.raw_water_tds_ppm.toFixed(0)} ppm
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: log.filtered_water_tds_ppm <= 100 ? '#10b981' : log.filtered_water_tds_ppm <= 250 ? '#f59e0b' : '#ef4444' }}>
                      {log.filtered_water_tds_ppm.toFixed(1)} ppm
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600, color: '#38bdf8' }}>
                      {log.clean_tank_level_pct.toFixed(0)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', color: '#cbd5e1' }}>
                      {log.solar_panel_voltage_v.toFixed(1)} V
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', color: '#cbd5e1' }}>
                      {log.solar_current_a.toFixed(1)} A
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#f59e0b' }}>
                      {log.power_watt.toFixed(0)} W
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', color: '#10b981', fontWeight: 600 }}>
                      {log.battery_soc_pct.toFixed(0)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: log.alert_level === 'NORMAL' ? 'rgba(16, 185, 129, 0.15)' : log.alert_level === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: log.alert_level === 'NORMAL' ? '#34d399' : log.alert_level === 'WARNING' ? '#fbbf24' : '#f87171',
                          border: `1px solid ${log.alert_level === 'NORMAL' ? 'rgba(16, 185, 129, 0.4)' : log.alert_level === 'WARNING' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        }}
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
