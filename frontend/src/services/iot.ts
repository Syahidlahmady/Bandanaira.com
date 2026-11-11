export interface IoTStationStatus {
  station_code: string
  station_name: string
  island_name: string
  raw_water_tds_ppm: number
  filtered_water_tds_ppm: number
  clean_tank_level_pct: number
  daily_dispensed_liters: number
  valve_status: string
  active_power_source: string
  power_watt: number
  battery_soc_pct: number
  alert_level: 'NORMAL' | 'WARNING' | 'CRITICAL' | string
  alert_message: string | null
  last_heartbeat: string
}

export interface IoTTelemetryItemResponse {
  id: string
  station_code: string
  station_name: string
  island_name: string
  raw_water_tds_ppm: number
  filtered_water_tds_ppm: number
  clean_tank_level_pct: number
  daily_dispensed_liters: number
  valve_status: string
  active_power_source: string
  solar_panel_voltage_v: number
  solar_current_a: number
  power_watt: number
  battery_soc_pct: number
  alert_level: string
  alert_message: string | null
  created_at: string
}

export interface IoTIslandResiliencySummary {
  total_active_stations: number
  total_clean_water_dispensed_today_ltr: number
  avg_island_water_tds_ppm: number
  avg_tank_reserve_pct: number
  solar_energy_ratio_pct: number
  estimated_diesel_fuel_saved_liters: number
  active_alerts_count: number
  island_readiness_status: 'OPTIMAL' | 'WASPADA' | 'KRITIS' | string
  stations: IoTStationStatus[]
}

const getApiBase = () => {
  return typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8005/api/v1`
    : 'http://localhost:8005/api/v1'
}

export const iotService = {
  async getLatestStations(): Promise<IoTStationStatus[]> {
    const res = await fetch(`${getApiBase()}/iot/telemetri/terkini`)
    if (!res.ok) throw new Error(`Gagal memuat status telemetri stasiun: ${res.statusText}`)
    return res.json()
  },

  async getHistory(stationCode?: string, limit: number = 30): Promise<IoTTelemetryItemResponse[]> {
    const q = new URLSearchParams()
    if (stationCode) q.append('station_code', stationCode)
    q.append('limit', limit.toString())

    const res = await fetch(`${getApiBase()}/iot/telemetri/riwayat?${q.toString()}`)
    if (!res.ok) throw new Error(`Gagal memuat histori telemetri: ${res.statusText}`)
    return res.json()
  },

  async getResiliencySummary(): Promise<IoTIslandResiliencySummary> {
    const res = await fetch(`${getApiBase()}/iot/resiliency-summary`)
    if (!res.ok) throw new Error(`Gagal memuat ringkasan resiliensi pulau: ${res.statusText}`)
    return res.json()
  },

  async simulatePulse(): Promise<IoTTelemetryItemResponse[]> {
    const res = await fetch(`${getApiBase()}/iot/simulate-pulse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`Gagal memicu simulator pulsa hardware: ${res.statusText}`)
    return res.json()
  },
}
