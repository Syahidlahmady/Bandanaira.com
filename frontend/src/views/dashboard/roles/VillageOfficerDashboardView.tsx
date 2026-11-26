import React from 'react'
import {
  CheckCircle2,
  FileCheck,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Aparatur Pemerintah Desa (village_officer)
 * Administrasi & Verifikasi Surat Warga, Master Kependudukan & Validasi Lahan Adat
 */
export const villageOfficerProfile: RoleDashboardProfile = {
  key: 'village_officer',
  name: 'Petugas Kantor Desa',
  shortBadge: 'Perangkat Desa',
  tagline: 'Administrasi Kependudukan, Verifikasi Lahan & Layanan Surat Mandiri',
  kpis: [
    { title: 'WARGA DESA TERDAFTAR', value: '1.842 Jiwa', trend: '▲ 98,5% NIK Terenkripsi AES', icon: Users, color: '#2563EB' },
    { title: 'PERMOHONAN SURAT MASUK', value: '28 Berkas', trend: '▲ 5 Menunggu Tinjauan', icon: Mail, color: '#059669' },
    { title: 'PLOT LAHAN DIVERIFIKASI', value: '34 Kebun', trend: '▲ 4 Pengajuan Baru', icon: MapPin, color: '#D97706' },
    { title: 'INDEKS LAYANAN DESA', value: '96,40%', trend: '▲ Selesai < 24 Jam Kerja', icon: CheckCircle2, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN PELAYANAN SURAT WARGA (BERKAS)',
    series1Name: 'Permohonan Masuk',
    series2Name: 'Surat Diterbitkan & Selesai',
    series1Color: '#2563EB',
    series2Color: '#059669',
    data: [
      { label: 'Des 25', v1: 22, v2: 20 },
      { label: 'Jan 26', v1: 28, v2: 26 },
      { label: 'Feb 26', v1: 25, v2: 24 },
      { label: 'Mar 26', v1: 34, v2: 32 },
      { label: 'Apr 26', v1: 38, v2: 36 },
      { label: 'Mei 26', v1: 42, v2: 39 },
    ],
    endPoint1: '42 Berkas',
    endPoint2: '39 Selesai',
    yDomain: [0, 50],
    yTicks: [0, 12.5, 25, 37.5, 50],
  },
  donutChart: {
    title: 'JENIS PERMOHONAN SURAT DINAS',
    subtitle: 'Surat Berkop Resmi Pemkab Maluku Tengah',
    centerLabel: 'SKU Rempah',
    centerValue: '48%',
    data: [
      { name: 'SKU Usaha Petani Rempah', percentage: '48,00%', value: 48, color: '#059669' },
      { name: 'Keterangan Domisili Warga', percentage: '26,50%', value: 26.5, color: '#2563EB' },
      { name: 'Surat Keterangan Nelayan', percentage: '15,50%', value: 15.5, color: '#D97706' },
      { name: 'Izin Kegiatan Komunitas', percentage: '10,00%', value: 10, color: '#64748B' },
    ],
  },
  workspace1: {
    title: 'ANTREAN SURAT PERLU TINJAUAN',
    buttonText: 'Buka Meja Pelayanan Surat',
    targetTab: 'letters',
    items: [
      { id: 1, name: 'SKU KUR Pertanian (Ahmad B.)', stat: 'Menunggu', percent: 90 },
      { id: 2, name: 'Surat Domisili (Nurul S.)', stat: 'Menunggu', percent: 75 },
      { id: 3, name: 'Surat Usaha Eco-Stay (Abba)', stat: 'Menunggu', percent: 60 },
      { id: 4, name: 'Surat Nelayan Tangkap (Hasan)', stat: 'Menunggu', percent: 45 },
    ],
  },
  workspace2: {
    title: 'PETA SEBARAN KEPENDUDUKAN RT / RW',
    targetTab: 'population',
    highlightText: 'Sebaran Warga: Neira, Lonthoir & Hatta',
    subtext: 'Data Riil Demografi Terverifikasi',
  },
  workspace3: {
    title: 'KETEPATAN WAKTU LAYANAN KANTOR DESA',
    subtitle: 'Rata-rata Waktu Proses Penerbitan',
    mainValue: '96,4%',
    trend: '▲ 2,1% efisiensi birokrasi digital',
    badgeText: 'Optimal',
    buttonText: 'Lihat Master Warga & NIK',
    targetTab: 'population',
    bars: [
      { label: 'Jan', value: 88 },
      { label: 'Feb', value: 91 },
      { label: 'Mar', value: 93 },
      { label: 'Apr', value: 95 },
      { label: 'Mei', value: 96.4 },
    ],
  },
  transparencyPoints: [
    { title: 'Enkripsi NIK Standar Militer', desc: 'Data NIK dilindungi AES-256-GCM + Blind Index HMAC.', icon: ShieldCheck, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Tanda Tangan Digital Dinas', desc: 'Dokumen surat diverifikasi QR Code berkop resmi Pemkab.', icon: CheckCircle2, color: '#2563EB', bgColor: 'bg-blue-100' },
    { title: 'Sinkronisasi Dukcapil Terpadu', desc: 'Basis data warga diperbarui berkala bersama RT dan RW.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
    { title: 'Jejak Audit Seluruh Aksi', desc: 'Setiap verifikasi dan approval tercatat di log audit sistem.', icon: FileCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_administrasi_desa_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Aparatur Pemerintah Desa (village_officer)
 */
export const VillageOfficerDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || villageOfficerProfile
  return <BaseRoleDashboardView {...props} profile={profile} />
}

export default VillageOfficerDashboardView
