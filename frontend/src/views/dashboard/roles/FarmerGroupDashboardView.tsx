import React from 'react'
import {
  CheckCircle2,
  FileCheck,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
  Wheat,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Ketua Kelompok Tani / Poktan (farmer_group_admin)
 * Manajemen Blok Kebun, Rekapitulasi Anggota Poktan & Agregasi Panen
 */
export const farmerGroupProfile: RoleDashboardProfile = {
  key: 'farmer_group_admin',
  name: 'Pengurus Kelompok Tani',
  shortBadge: 'Ketua Poktan',
  tagline: 'Agregasi Panen, Pendaftaran Anggota & Pengajuan Plot Kebun',
  kpis: [
    { title: 'ANGGOTA PETANI POKTAN', value: '48 Petani', trend: '▲ 6 anggota baru terdaftar', icon: Users, color: '#2563EB' },
    { title: 'TOTAL LAHAN KELOMPOK', value: '28,40 Ha', trend: '▲ 94,8% terpetakan PostGIS', icon: MapPin, color: '#059669' },
    { title: 'AGREGAT PANEN POKTAN', value: '4,65 Ton', trend: '▲ 18,30% dibanding musim lalu', icon: Wheat, color: '#D97706' },
    { title: 'PROPOSAL PENDING DESA', value: '3 Lahan', trend: '▲ Menunggu approval desa', icon: FileCheck, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN PRODUKSI POKTAN (TON)',
    series1Name: 'Produksi Poktan Lonthoir',
    series2Name: 'Produksi Poktan Selamon',
    series1Color: '#2563EB',
    series2Color: '#059669',
    data: [
      { label: 'Des 25', v1: 2.4, v2: 1.8 },
      { label: 'Jan 26', v1: 3.1, v2: 2.2 },
      { label: 'Feb 26', v1: 2.9, v2: 2.0 },
      { label: 'Mar 26', v1: 3.8, v2: 2.8 },
      { label: 'Apr 26', v1: 4.2, v2: 3.1 },
      { label: 'Mei 26', v1: 4.65, v2: 3.45 },
    ],
    endPoint1: '4,65 Ton',
    endPoint2: '3,45 Ton',
    yDomain: [0, 6],
    yTicks: [0, 1.5, 3, 4.5, 6],
  },
  donutChart: {
    title: 'KOMPOSISI KOMODITAS POKTAN',
    subtitle: 'Pencatatan Panen Anggota Kolektif',
    centerLabel: 'Pala Banda',
    centerValue: '58%',
    data: [
      { name: 'Pala Banda Kering', percentage: '58,00%', value: 58, color: '#059669' },
      { name: 'Fuli Segar & Kering', percentage: '22,50%', value: 22.5, color: '#D97706' },
      { name: 'Cengkeh Lonthoir', percentage: '12,50%', value: 12.5, color: '#2563EB' },
      { name: 'Ikan Asap Cakalang', percentage: '7,00%', value: 7, color: '#64748B' },
    ],
  },
  workspace1: {
    title: 'PRODUKTIVITAS KEBUN PER ANGGOTA',
    buttonText: 'Kelola Proposal Plot Lahan',
    targetTab: 'farming',
    items: [
      { id: 1, name: 'Ahmad Baadilla (Lonthoir)', stat: '850 Kg', percent: 94 },
      { id: 2, name: 'Siti Nurul (Lonthoir Tengah)', stat: '680 Kg', percent: 76 },
      { id: 3, name: 'Umar Syahrir (Kebun Selamon)', stat: '540 Kg', percent: 62 },
      { id: 4, name: 'Ibrahim Hatta (Pulau Ay)', stat: '420 Kg', percent: 48 },
    ],
  },
  workspace2: {
    title: 'PETA SEBARAN BIDANG KEBUN ANGGOTA',
    targetTab: 'farming',
    highlightText: 'Klaster Lahan: Banda Besar & Rhun',
    subtext: '48 Plot Terdata GIS',
  },
  workspace3: {
    title: 'SERAPAN KONTRAK KOPERASI HATTA',
    subtitle: 'Realisasi Pembelian Hasil Panen',
    mainValue: '88,5%',
    trend: '▲ 5,4% target serapan komoditas',
    badgeText: 'Kemitraan',
    buttonText: 'Lihat Buku Kasir Koperasi',
    targetTab: 'koperasi',
    bars: [
      { label: 'Jan', value: 2.8 },
      { label: 'Feb', value: 3.4 },
      { label: 'Mar', value: 3.9 },
      { label: 'Apr', value: 4.3 },
      { label: 'Mei', value: 4.65 },
    ],
  },
  transparencyPoints: [
    { title: 'Validasi Anggota Terbuka', desc: 'Seluruh petani anggota telah melewati verifikasi NIK desa.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Algoritma Anti-Overlap', desc: 'Plot batas kebun divalidasi geodesi cincin bola PostGIS.', icon: ShieldCheck, color: '#2563EB', bgColor: 'bg-blue-100' },
    { title: 'Transparansi Harga Rempah', desc: 'Standar harga pembelian diumumkan transparan setiap pekan.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
    { title: 'Batch Kolektif On-Chain', desc: 'Pembuatan batch panen gabungan bergaransi kemurnian.', icon: FileCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_poktan_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Ketua Kelompok Tani / Poktan (farmer_group_admin)
 */
export const FarmerGroupDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || farmerGroupProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default FarmerGroupDashboardView
