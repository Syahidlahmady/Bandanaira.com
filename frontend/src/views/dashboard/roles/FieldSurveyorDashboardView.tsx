import React from 'react'
import {
  Activity,
  CheckCircle2,
  Database,
  Droplets,
  Radio,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Surveyor Geospasial & Lapangan (field_surveyor)
 * Pengumpulan Data Survei Lapangan, Verifikasi Batas Spasial & ETL GeoJSON
 */
export const fieldSurveyorProfile: RoleDashboardProfile = {
  key: 'field_surveyor',
  name: 'Surveyor Lapangan & IoT',
  shortBadge: 'Surveyor & IoT',
  tagline: 'Telemetri 4 Stasiun Sensor, Kualitas Air Minum & Pipa Survei ETL',
  kpis: [
    { title: 'STASIUN SENSOR IOT AKTIF', value: '4 / 4 Unit', trend: '▲ 100% Online LoRa/Seluler', icon: Radio, color: '#0284C7' },
    { title: 'MUTU AIR RO TERBACA', value: '42 PPM', trend: '▲ Standar Prima WHO (<100)', icon: Droplets, color: '#059669' },
    { title: 'FORM SURVEI STAGING', value: '142 Form', trend: '▲ Siap Migrasi Pipa ETL', icon: Database, color: '#D97706' },
    { title: 'BAURAN ENERGI SURYA PLTS', value: '68,20%', trend: '▲ 31,8% Generator Diesel', icon: Activity, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TELEMETRI KETINGGIAN TANDON AIR KOMUNAL (%)',
    series1Name: 'Tandon Utama Neira',
    series2Name: 'Tandon Pulau Hatta',
    series1Color: '#0284C7',
    series2Color: '#059669',
    data: [
      { label: '00:00', v1: 92, v2: 88 },
      { label: '04:00', v1: 89, v2: 86 },
      { label: '08:00', v1: 76, v2: 72 },
      { label: '12:00', v1: 68, v2: 65 },
      { label: '16:00', v1: 78, v2: 74 },
      { label: '20:00', v1: 88, v2: 84 },
    ],
    endPoint1: '88% Penuh',
    endPoint2: '84% Penuh',
    yDomain: [0, 100],
    yTicks: [0, 25, 50, 75, 100],
  },
  donutChart: {
    title: 'STATUS KESEHATAN NODE IOT',
    subtitle: 'Telemetri 4 Gugusan Pulau 3T',
    centerLabel: 'Optimal',
    centerValue: '96%',
    data: [
      { name: 'Koneksi Sinyal Kuat', percentage: '75,00%', value: 75, color: '#059669' },
      { name: 'Baterai Solar Penuh', percentage: '21,00%', value: 21, color: '#0284C7' },
      { name: 'Peringatan Pemeliharaan', percentage: '4,00%', value: 4, color: '#D97706' },
    ],
  },
  workspace1: {
    title: 'STATUS 4 NODE SENSOR TELEMETRI',
    buttonText: 'Buka Monitoring IoT Lengkap',
    targetTab: 'iot',
    items: [
      { id: 1, name: 'Stasiun 01 Neira (TDS & Level Air)', stat: 'Normal (42 PPM)', percent: 98 },
      { id: 2, name: 'Stasiun 02 Hatta (Surya & Air RO)', stat: 'Normal (44 PPM)', percent: 92 },
      { id: 3, name: 'Stasiun 03 Lonthoir (Suhu Tanah Kebun)', stat: 'Normal (27°C)', percent: 88 },
      { id: 4, name: 'Stasiun 04 Pulau Ay (Level Tandon)', stat: 'Normal (82%)', percent: 84 },
    ],
  },
  workspace2: {
    title: 'PETA SEBARAN STASIUN SENSOR & SURVEI',
    targetTab: 'gis',
    highlightText: 'Lokasi: 4 Node Pulau 3T Terhubung',
    subtext: 'Transmisi Data Real-Time',
  },
  workspace3: {
    title: 'PIPA MIGRASI ETL (NOSQL KE POSTGIS)',
    subtitle: 'Sinkronisasi Data Dinamis Lapangan',
    mainValue: '142 Row',
    trend: '▲ 100% tervalidasi skema relasional',
    badgeText: 'Valid',
    buttonText: 'Eksekusi Pipa ETL',
    targetTab: 'survei',
    bars: [
      { label: 'Jan', value: 85 },
      { label: 'Feb', value: 98 },
      { label: 'Mar', value: 115 },
      { label: 'Apr', value: 130 },
      { label: 'Mei', value: 142 },
    ],
  },
  transparencyPoints: [
    { title: 'Sensor Kalibrasi Mandiri', desc: 'Sensor TDS dan level air memiliki batas toleransi error < 2%.', icon: CheckCircle2, color: '#0284C7', bgColor: 'bg-sky-100' },
    { title: 'Tahan Cuaca & Tanpa Sinyal', desc: 'Data tersimpan di memori lokal saat jaringan seluler terputus.', icon: ShieldCheck, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Validasi JSON Schema Ketat', desc: 'Pipa ETL memeriksa tipe data sebelum masuk database PostGIS.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
    { title: 'Sistem Ketahanan Air Bersih', desc: 'Prioritas pasokan otomatis saat elevasi tandon air RO kritis.', icon: Droplets, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_telemetri_iot_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Surveyor Geospasial & Lapangan (field_surveyor)
 */
export const FieldSurveyorDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || fieldSurveyorProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default FieldSurveyorDashboardView
