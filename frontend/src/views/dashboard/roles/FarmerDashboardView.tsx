import React from 'react'
import {
  CheckCircle2,
  DollarSign,
  FileCheck,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sprout,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Petani Rempah Mandiri (farmer)
 * Pencatatan Panen, Grading Mutu Pala & Ketertelusuran On-Chain
 */
export const farmerProfile: RoleDashboardProfile = {
  key: 'farmer',
  name: 'Petani Rempah Mandiri',
  shortBadge: 'Petani Pala',
  tagline: 'Pencatatan Panen, Grading Mutu Pala & Ketertelusuran On-Chain',
  kpis: [
    { title: 'HASIL PANEN MUSIM INI', value: '850 Kg', trend: '▲ 14,20% dibanding musim lalu', icon: Sprout, color: '#059669' },
    { title: 'ESTIMASI PENDAPATAN', value: 'Rp 68,5 Juta', trend: '▲ 8,45% harga grade super', icon: DollarSign, color: '#2563EB' },
    { title: 'LAHAN TERVERIFIKASI', value: '1,45 Ha', trend: '▲ 100% PostGIS terpetakan', icon: MapPin, color: '#D97706' },
    { title: 'BATCH BLOCKCHAIN', value: '6 Terbit', trend: '▲ SHA-256 terverifikasi', icon: ShieldCheck, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN VOLUME PANEN (KUINTAL)',
    series1Name: 'Biji Pala Kering',
    series2Name: 'Bunga Fuli Merah',
    series1Color: '#059669',
    series2Color: '#D97706',
    data: [
      { label: 'Des 25', v1: 4.2, v2: 1.1 },
      { label: 'Jan 26', v1: 5.8, v2: 1.4 },
      { label: 'Feb 26', v1: 5.1, v2: 1.2 },
      { label: 'Mar 26', v1: 6.4, v2: 1.6 },
      { label: 'Apr 26', v1: 7.2, v2: 1.9 },
      { label: 'Mei 26', v1: 8.5, v2: 2.1 },
    ],
    endPoint1: '8,50 Kwt',
    endPoint2: '2,10 Kwt',
    yDomain: [0, 10],
    yTicks: [0, 2.5, 5, 7.5, 10],
  },
  donutChart: {
    title: 'DISTRIBUSI MUTU PANEN',
    subtitle: 'Grading Hasil Sortasi Lonthoir',
    centerLabel: 'Grade A',
    centerValue: '62%',
    data: [
      { name: 'Grade A Super', percentage: '62,00%', value: 62, color: '#059669' },
      { name: 'Grade B (Utuh)', percentage: '24,50%', value: 24.5, color: '#2563EB' },
      { name: 'Grade C (Keriput)', percentage: '9,50%', value: 9.5, color: '#D97706' },
      { name: 'Afkir / Minyak', percentage: '4,00%', value: 4, color: '#64748B' },
    ],
  },
  workspace1: {
    title: 'PROGRESS PANEN PER BLOK KEBUN',
    buttonText: 'Catat Panen Baru',
    targetTab: 'traceability',
    items: [
      { id: 1, name: 'Blok 1 Lonthoir Atas', stat: '380 Kg', percent: 88 },
      { id: 2, name: 'Blok 2 Lereng Gunung Api', stat: '240 Kg', percent: 62 },
      { id: 3, name: 'Blok 3 Kebun Datar Ay', stat: '150 Kg', percent: 45 },
      { id: 4, name: 'Blok 4 Selamon Lama', stat: '80 Kg', percent: 28 },
    ],
  },
  workspace2: {
    title: 'PETA GEODESI POLIGON KEBUN SAYA',
    targetTab: 'farming',
    highlightText: 'Plot Kebun Terverifikasi: Lonthoir',
    subtext: 'Bebas Tumpang Tindih (Zero Overlap)',
  },
  workspace3: {
    title: 'SETORAN KE KOPERASI HATTA',
    subtitle: 'Akumulasi Timbangan & Mutu',
    mainValue: '94,8%',
    trend: '▲ 3,2% lolos uji kadar air',
    badgeText: 'Grade A',
    buttonText: 'Cek Buku Setoran',
    targetTab: 'koperasi',
    bars: [
      { label: 'Jan', value: 4.8 },
      { label: 'Feb', value: 5.6 },
      { label: 'Mar', value: 6.8 },
      { label: 'Apr', value: 7.5 },
      { label: 'Mei', value: 8.5 },
    ],
  },
  transparencyPoints: [
    { title: 'Kebun Terdaftar Resmi', desc: 'Koordinat batas lahan terikat sertifikat tanah desa PostGIS.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Sertifikasi Hash EVM', desc: 'Tiap lot panen mendapat SHA-256 & QR traceability permanen.', icon: ShieldCheck, color: '#2563EB', bgColor: 'bg-blue-100' },
    { title: 'Penimbangan Digital', desc: 'Timbangan kasir terintegrasi otomatis dengan Koperasi Hatta.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
    { title: 'Bebas Perantara Tengkulak', desc: 'Penjualan langsung ke marketplace komoditas terverifikasi.', icon: FileCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_panen_petani_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Petani Rempah Mandiri (farmer)
 */
export const FarmerDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || farmerProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default FarmerDashboardView
