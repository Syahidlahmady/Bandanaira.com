import React from 'react'
import {
  CheckCircle2,
  DollarSign,
  Droplets,
  FileCheck,
  RefreshCw,
  Scale,
  Users,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Pengelola Koperasi Banda (coop_manager)
 * Operasional POS Kasir, Pembelian Komoditas Pala, Bank Sampah & Dispenser RO
 */
export const coopManagerProfile: RoleDashboardProfile = {
  key: 'coop_manager',
  name: 'Pengelola Koperasi Hatta',
  shortBadge: 'Koperasi Hatta',
  tagline: 'Kasir Komoditas, Bank Sampah Plastik & Penebusan Air Bersih RO',
  kpis: [
    { title: 'DISTRIBUSI AIR MINUM RO', value: '14.250 L', trend: '▲ Standar WHO (TDS 42 PPM)', icon: Droplets, color: '#0284C7' },
    { title: 'SETORAN SAMPAH PLASTIK', value: '1.280 Kg', trend: '▲ 1 Kg = 10 Liter Air Bersih', icon: Scale, color: '#059669' },
    { title: 'OMZET KASIR KOPERASI', value: 'Rp 48,2 Juta', trend: '▲ 14,80% transaksi bulan ini', icon: DollarSign, color: '#D97706' },
    { title: 'WARGA ANGGOTA AKTIF', value: '248 KK', trend: '▲ Menggunakan kartu air RO', icon: Users, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN AIR MINUM RO VS SAMPAH PLASTIK (RATIO)',
    series1Name: 'Distribusi Air Bersih (100 Liter)',
    series2Name: 'Sampah Plastik Terkumpul (10 Kg)',
    series1Color: '#0284C7',
    series2Color: '#059669',
    data: [
      { label: 'Des 25', v1: 75, v2: 60 },
      { label: 'Jan 26', v1: 90, v2: 78 },
      { label: 'Feb 26', v1: 85, v2: 72 },
      { label: 'Mar 26', v1: 110, v2: 95 },
      { label: 'Apr 26', v1: 125, v2: 110 },
      { label: 'Mei 26', v1: 142.5, v2: 128 },
    ],
    endPoint1: '14.250 L',
    endPoint2: '1.280 Kg',
    yDomain: [0, 160],
    yTicks: [0, 40, 80, 120, 160],
  },
  donutChart: {
    title: 'KOMPOSISI BANK SAMPAH SIRKULAR',
    subtitle: 'Inisiatif Pengurangan Plastik Prof. Purwo',
    centerLabel: 'Botol PET',
    centerValue: '54%',
    data: [
      { name: 'Botol PET Bening Bersih', percentage: '54,00%', value: 54, color: '#0284C7' },
      { name: 'Tutup Botol HDPE Keras', percentage: '24,00%', value: 24, color: '#059669' },
      { name: 'Plastik Kemasan / Kresek', percentage: '14,50%', value: 14.5, color: '#D97706' },
      { name: 'Kaleng & Kardus Kering', percentage: '7,50%', value: 7.5, color: '#64748B' },
    ],
  },
  workspace1: {
    title: '5 WARGA TERAKTIF BANK SAMPAH',
    buttonText: 'Buka Kasir Timbangan',
    targetTab: 'koperasi',
    items: [
      { id: 1, name: 'Siti Lonthoir (85 Kg Plastik)', stat: '850 Poin', percent: 95 },
      { id: 2, name: 'Ahmad Neira (64 Kg Plastik)', stat: '640 Poin', percent: 78 },
      { id: 3, name: 'Ibrahim Hatta (52 Kg Plastik)', stat: '520 Poin', percent: 64 },
      { id: 4, name: 'Nurul Syahrir (40 Kg Plastik)', stat: '400 Poin', percent: 50 },
    ],
  },
  workspace2: {
    title: 'PETA DISPENSER AIR RO & BANK SAMPAH',
    targetTab: 'gis',
    highlightText: 'Titik Instalasi: Neira, Hatta & Ay',
    subtext: '4 Stasiun Penebusan Air Mandiri',
  },
  workspace3: {
    title: 'SALDO KAS & PERPUTARAN KOPERASI',
    subtitle: 'Simpan Pinjam & Penjualan Komoditas',
    mainValue: 'Rp 48,2 Jt',
    trend: '▲ 14,8% likuiditas koperasi prima',
    badgeText: 'Sehat',
    buttonText: 'Laporan Buku Kasir',
    targetTab: 'koperasi',
    bars: [
      { label: 'Jan', value: 32 },
      { label: 'Feb', value: 36 },
      { label: 'Mar', value: 41 },
      { label: 'Apr', value: 44 },
      { label: 'Mei', value: 48.2 },
    ],
  },
  transparencyPoints: [
    { title: 'Kualitas Air Standar Laboratorium', desc: 'Sensor TDS kontinu memantau kadar mineral di bawah 50 ppm.', icon: CheckCircle2, color: '#0284C7', bgColor: 'bg-sky-100' },
    { title: 'Konversi Sampah Adil & Transparan', desc: '1 Kg plastik setara 10 Liter air minum dan 10 Eco-Poin.', icon: Scale, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Timbangan Terkalibrasi Digital', desc: 'Pencatatan kasir otomatis memotong kuota dan saldo RFID.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
    { title: 'Kemitraan Daur Ulang Pulau Jawa', desc: 'Sampah plastik dipadatkan dan dikirim berkala via kapal Pelni.', icon: FileCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_koperasi_hatta_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Pengelola Koperasi Banda (coop_manager)
 */
export const CoopManagerDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || coopManagerProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default CoopManagerDashboardView
