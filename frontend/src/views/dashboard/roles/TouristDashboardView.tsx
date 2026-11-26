import React from 'react'
import {
  CheckCircle2,
  Database,
  Droplets,
  Home,
  Luggage,
  ShieldCheck,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Wisatawan Bahari & Sejarah (tourist)
 * Katalog Cagar Budaya, Reservasi Eco-Stay, Rekomendasi Rute SAW & Status Gelombang IoT
 */
export const touristProfile: RoleDashboardProfile = {
  key: 'tourist',
  name: 'Wisatawan & Pengunjung',
  shortBadge: 'Wisatawan',
  tagline: 'Eksplorasi Cagar Budaya, Reservasi Eco-Stay & Panduan Wisata Bahari',
  kpis: [
    { title: 'DESTINASI CAGAR BUDAYA', value: '177 Situs', trend: '▲ 100% Dilengkapi Audio Guide', icon: Home, color: '#2563EB' },
    { title: 'PENGINAPAN ECO-STAY', value: '18 Mitra', trend: '▲ WhatsApp Booking Langsung', icon: Luggage, color: '#059669' },
    { title: 'KUALITAS AIR BERSIH RO', value: '42 PPM', trend: '▲ Standar Prima WHO Bebas Botol', icon: Droplets, color: '#0284C7' },
    { title: 'VERIFIKASI REMPAH ON-CHAIN', value: '100% Asli', trend: '▲ Scan QR Batch Blockchain', icon: ShieldCheck, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN KUNJUNGAN MUSIMAN BANDA NEIRA',
    series1Name: 'Kunjungan Mancanegara',
    series2Name: 'Kunjungan Domestik',
    series1Color: '#2563EB',
    series2Color: '#059669',
    data: [
      { label: 'Des 25', v1: 6.8, v2: 5.9 },
      { label: 'Jan 26', v1: 8.1, v2: 6.2 },
      { label: 'Feb 26', v1: 7.4, v2: 4.8 },
      { label: 'Mar 26', v1: 8.5, v2: 6.3 },
      { label: 'Apr 26', v1: 9.7, v2: 6.4 },
      { label: 'Mei 26', v1: 5.23, v2: 5.45 },
    ],
    endPoint1: '5,23 Jt',
    endPoint2: '5,45 Jt',
    yDomain: [0, 12],
    yTicks: [0, 3, 6, 9, 12],
  },
  donutChart: {
    title: 'DISTRIBUSI WISATAWAN MANCANEGARA',
    subtitle: 'Berdasarkan Negara Asal',
    centerLabel: 'Total',
    centerValue: '5,23 Jt',
    data: [
      { name: 'Malaysia & ASEAN', percentage: '18,45%', value: 18.45, color: '#2563EB' },
      { name: 'Australia', percentage: '13,28%', value: 13.28, color: '#0284C7' },
      { name: 'Singapura', percentage: '11,36%', value: 11.36, color: '#0EA5E9' },
      { name: 'Tiongkok', percentage: '9,87%', value: 9.87, color: '#059669' },
      { name: 'Lainnya', percentage: '47,04%', value: 47.04, color: '#173F43' },
    ],
  },
  workspace1: {
    title: 'DESTINASI WAJIB KUNJUNG BANDA',
    buttonText: 'Jelajahi Cagar Budaya',
    targetTab: 'tourism',
    items: [
      { id: 1, name: 'Benteng Belgica (Matahari Terbenam)', stat: 'Sangat Direkomendasikan', percent: 96 },
      { id: 2, name: 'Pulau Hatta (Pantai & Snorkeling)', stat: 'Terumbu Karang Prima', percent: 90 },
      { id: 3, name: 'Lava Flow (Bawah Air Vulkanik)', stat: 'Spot Terumbu Karang', percent: 84 },
      { id: 4, name: 'Rumah Pengasingan Hatta & Sjahrir', stat: 'Wisata Sejarah Kemerdekaan', percent: 75 },
    ],
  },
  workspace2: {
    title: 'PETA SPASIAL 7-LAYER JELAJAH PULAU',
    targetTab: 'gis',
    highlightText: 'Eksplorasi: Snorkeling, Cagar & Jalur Perahu',
    subtext: 'Bebas Hilang dengan Peta Offline',
  },
  workspace3: {
    title: 'KATALOG ECO-STAY TERVERIFIKASI',
    subtitle: 'Penginapan Ramah Lingkungan',
    mainValue: '18 Unit',
    trend: '▲ 100% WhatsApp Reservasi Langsung',
    badgeText: 'Pilihan',
    buttonText: 'Lihat Katalog Penginapan',
    targetTab: 'tourism',
    bars: [
      { label: 'Jan', value: 12 },
      { label: 'Feb', value: 14 },
      { label: 'Mar', value: 15 },
      { label: 'Apr', value: 17 },
      { label: 'Mei', value: 18 },
    ],
  },
  transparencyPoints: [
    { title: 'Sumber Data Terverifikasi', desc: 'Seluruh informasi destinasi resmi dari kurator cagar budaya.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Terbuka untuk Publik', desc: 'Informasi rute, peta, dan audio guide dapat diakses tanpa biaya.', icon: Database, color: '#2563EB', bgColor: 'bg-blue-100' },
    { title: 'Bebas Sampah Plastik Sekali Pakai', desc: 'Bawa tumbler isi ulang air RO di dispenser Koperasi Hatta.', icon: Droplets, color: '#0284C7', bgColor: 'bg-sky-100' },
    { title: 'Keaslian Oleh-Oleh Terjamin', desc: 'Pala & fuli dilengkapi label sertifikasi hash blockchain.', icon: ShieldCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_wisata_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Wisatawan Bahari & Sejarah (tourist)
 */
export const TouristDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || touristProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default TouristDashboardView
