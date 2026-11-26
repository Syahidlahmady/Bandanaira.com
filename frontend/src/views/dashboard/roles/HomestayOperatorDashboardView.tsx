import React from 'react'
import {
  CheckCircle2,
  DollarSign,
  FileCheck,
  Luggage,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Operator Homestay & Eco-Stay (homestay_operator)
 * Tingkat Okupansi Kamar, Manajemen Reservasi WhatsApp & Pelestarian Cagar Budaya
 */
export const homestayOperatorProfile: RoleDashboardProfile = {
  key: 'homestay_operator',
  name: 'Mitra Pengelola Eco-Stay',
  shortBadge: 'Eco-Stay',
  tagline: 'Katalog Penginapan, Kalender Kamar & Reservasi Langsung WhatsApp',
  kpis: [
    { title: 'TINGKAT OKUPANSI KAMAR', value: '74,50%', trend: '▲ 12,30% dibanding bln lalu', icon: Luggage, color: '#2563EB' },
    { title: 'RESERVASI WHATSAPP MASUK', value: '38 Tamu', trend: '▲ 100% Direct Booking', icon: Mail, color: '#059669' },
    { title: 'PENDAPATAN SEWA KAMAR', value: 'Rp 22,8 Juta', trend: '▲ Rata-rata 3 malam inap', icon: DollarSign, color: '#D97706' },
    { title: 'SKOR ULASAN & ECO-BADGE', value: '4.92 / 5.0', trend: '▲ Tersertifikasi Eco-Stay', icon: ShieldCheck, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN MALAM HUNIAN KAMAR (ROOM NIGHTS)',
    series1Name: 'Wisatawan Mancanegara',
    series2Name: 'Wisatawan Nusantara',
    series1Color: '#2563EB',
    series2Color: '#059669',
    data: [
      { label: 'Des 25', v1: 24, v2: 18 },
      { label: 'Jan 26', v1: 32, v2: 22 },
      { label: 'Feb 26', v1: 28, v2: 19 },
      { label: 'Mar 26', v1: 38, v2: 26 },
      { label: 'Apr 26', v1: 44, v2: 30 },
      { label: 'Mei 26', v1: 48, v2: 36 },
    ],
    endPoint1: '48 Kamar',
    endPoint2: '36 Kamar',
    yDomain: [0, 60],
    yTicks: [0, 15, 30, 45, 60],
  },
  donutChart: {
    title: 'PROPORSI ASAL PENGUNJUNG HOMESTAY',
    subtitle: 'Distribusi Tamu Menginap 2026',
    centerLabel: 'Domestik',
    centerValue: '54%',
    data: [
      { name: 'Wisatawan Nusantara', percentage: '54,00%', value: 54, color: '#059669' },
      { name: 'Eropa (Belanda & Prancis)', percentage: '26,50%', value: 26.5, color: '#2563EB' },
      { name: 'Australia & Pasifik', percentage: '12,50%', value: 12.5, color: '#D97706' },
      { name: 'Asia (Jepang & China)', percentage: '7,00%', value: 7, color: '#64748B' },
    ],
  },
  workspace1: {
    title: 'KETERSEDIAAN KAMAR AKTIF',
    buttonText: 'Atur Tarif & Status Kamar',
    targetTab: 'tourism',
    items: [
      { id: 1, name: 'Kamar Superior AC (Sea View)', stat: 'Terisi (4/4)', percent: 100 },
      { id: 2, name: 'Bungalow Kayu Tradisional', stat: 'Tersedia (1/3)', percent: 66 },
      { id: 3, name: 'Kamar Standard Kipas Angin', stat: 'Tersedia (2/4)', percent: 50 },
      { id: 4, name: 'Family Suite Lonthoir', stat: 'Terisi (1/1)', percent: 100 },
    ],
  },
  workspace2: {
    title: 'PETA ZONA WISATA SEKITAR PENGINAPAN',
    targetTab: 'gis',
    highlightText: 'Akses: 5 Menit ke Benteng Belgica',
    subtext: 'Titik Strategis Pusat Kota Neira',
  },
  workspace3: {
    title: 'ESTIMASI RETRIBUSI & OMZET WISATA',
    subtitle: 'Kontribusi ke Kas Komunitas',
    mainValue: 'Rp 22,8 Jt',
    trend: '▲ 15,4% kenaikan pendapatan',
    badgeText: 'Optimal',
    buttonText: 'Buka Katalog Eco-Stay',
    targetTab: 'tourism',
    bars: [
      { label: 'Jan', value: 14 },
      { label: 'Feb', value: 16 },
      { label: 'Mar', value: 19 },
      { label: 'Apr', value: 21 },
      { label: 'Mei', value: 22.8 },
    ],
  },
  transparencyPoints: [
    { title: 'Amenitas 4A Terverifikasi', desc: 'Penginapan dilengkapi air RO, energi surya, dan pemilahan sampah.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Tarif Transparan Tanpa Mark-up', desc: 'Harga kamar resmi tanpa komisi perantara OTA berlebihan.', icon: ShieldCheck, color: '#2563EB', bgColor: 'bg-blue-100' },
    { title: 'Reservasi WhatsApp Langsung', desc: 'Tamu langsung terhubung ke nomor pemilik tanpa perantara.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
    { title: 'Standardisasi Hospitality Lokal', desc: 'Bimbingan pelayanan ramah berbasis adat sopan santun Banda.', icon: FileCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_ecostay_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Operator Homestay & Eco-Stay (homestay_operator)
 */
export const HomestayOperatorDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || homestayOperatorProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default HomestayOperatorDashboardView
