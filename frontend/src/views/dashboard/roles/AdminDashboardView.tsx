import React from 'react'
import {
  Briefcase,
  CheckCircle2,
  Database,
  DollarSign,
  FileCheck,
  LifeBuoy,
  Luggage,
  RefreshCw,
  Users,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Administrator Sistem Kepulauan (admin)
 * Pengawasan Seluruh Modul Ekosistem, Jejak Audit Blockchain, Monitoring IoT & Tata Kelola
 */
export const adminProfile: RoleDashboardProfile = {
  key: 'admin',
  name: 'Super Administrator Sistem',
  shortBadge: 'Super Admin',
  tagline: 'Tata Kelola Komando Terpadu Seluruh 11 Ruang Kerja Operasional Banda',
  kpis: [
    { title: 'WARGA DESA TERVERIFIKASI', value: '1.842 Jiwa', trend: '▲ 98,5% NIK Terenkripsi AES', icon: Users, color: '#0284C7' },
    { title: 'PERPUTARAN EKONOMI REMPAH', value: 'Rp 1,48 Miliar', trend: '▲ 14,2% Musim Panen 2026', icon: DollarSign, color: '#10B981' },
    { title: 'OKUPANSI ECO-STAY & CAGAR', value: '68,4%', trend: '▲ 177 Situs Cagar Budaya', icon: Luggage, color: '#F59E0B' },
    { title: 'LAHAN PALA & KELOMPOK TANI', value: '42 Plot Kebun', trend: '▲ 48,5 Ha Terpetakan GIS', icon: Briefcase, color: '#0284C7' },
  ],
  lineChart: {
    title: 'TREN AKTIVITAS EKOSISTEM BANDA (BULANAN)',
    series1Name: 'Transaksi Komoditas (Kuintal)',
    series2Name: 'Pelayanan Surat Warga',
    series1Color: '#0284C7',
    series2Color: '#10B981',
    data: [
      { label: 'Des 25', v1: 42, v2: 28 },
      { label: 'Jan 26', v1: 48, v2: 32 },
      { label: 'Feb 26', v1: 45, v2: 30 },
      { label: 'Mar 26', v1: 54, v2: 38 },
      { label: 'Apr 26', v1: 58, v2: 42 },
      { label: 'Mei 26', v1: 64, v2: 45 },
    ],
    endPoint1: '64 Kuintal',
    endPoint2: '45 Berkas',
    yDomain: [0, 80],
    yTicks: [0, 20, 40, 60, 80],
  },
  donutChart: {
    title: 'KOMPOSISI SEKTOR PRIORITAS BANDA NEIRA',
    subtitle: 'Berdasarkan Produktivitas 6 Dusun',
    centerLabel: 'Pala & Fuli',
    centerValue: '42%',
    data: [
      { name: 'Pala & Rempah', percentage: '42,00%', value: 42, color: '#10B981' },
      { name: 'Wisata & Eco-Stay', percentage: '28,00%', value: 28, color: '#0284C7' },
      { name: 'Perikanan Maritim', percentage: '18,00%', value: 18, color: '#F59E0B' },
      { name: 'Koperasi & Jasa', percentage: '12,00%', value: 12, color: '#0284C7' },
    ],
  },
  workspace1: {
    title: '5 SITUS CAGAR BUDAYA & WISATA UNGGULAN',
    buttonText: 'Lihat Selengkapnya',
    targetTab: 'tourism',
    items: [
      { id: 1, name: 'Benteng Belgica (Situs Warisan Dunia)', stat: '2.980 Wisatawan', percent: 92 },
      { id: 2, name: 'Pulau Hatta (Spot Bahari & Diving)', stat: '1.450 Wisatawan', percent: 68 },
      { id: 3, name: 'Lava Flow Snorkeling (Terumbu Karang)', stat: '920 Wisatawan', percent: 52 },
      { id: 4, name: 'Kebun Pala Tertua Lonthoir (1621)', stat: '780 Pengunjung', percent: 44 },
      { id: 5, name: 'Rumah Pengasingan Bung Hatta', stat: '640 Kunjungan', percent: 36 },
    ],
  },
  workspace2: {
    title: 'PETA SEBARAN SPASIAL BANDA',
    targetTab: 'gis',
    highlightText: 'Status Spasial: 7 Gugusan Pulau Terdata',
    subtext: 'PostGIS & Leaflet Terintegrasi',
  },
  workspace3: {
    title: 'KONTRIBUSI EKONOMI DESA & SIRKULARITAS',
    subtitle: 'Perputaran Kas Tani & Bank Sampah Koperasi',
    mainValue: 'Rp 48,6 Jt',
    trend: '▲ 12,4% dibanding bulan lalu',
    badgeText: 'Surplus',
    buttonText: 'Buka Audit & Rekapitulasi',
    targetTab: 'audit',
    bars: [
      { label: 'Jan', value: 32 },
      { label: 'Feb', value: 36 },
      { label: 'Mar', value: 41 },
      { label: 'Apr', value: 44 },
      { label: 'Mei', value: 48.6 },
    ],
  },
  transparencyPoints: [
    { title: 'Sumber Data Terverifikasi', desc: 'Seluruh data bersumber dari instansi pemerintah desa dan kelompok tani resmi.', icon: CheckCircle2, color: '#10B981', bgColor: 'bg-emerald-100' },
    { title: 'Terbuka untuk Publik', desc: 'Data dapat diakses secara transparan melalui portal Satu Pintu Banda.', icon: Database, color: '#0284C7', bgColor: 'bg-blue-100' },
    { title: 'Diperbarui Berkala', desc: 'Telemetri IoT 4 stasiun pulau terkalibrasi tiap 60 detik & log mutasi aktif.', icon: RefreshCw, color: '#F59E0B', bgColor: 'bg-amber-100' },
    { title: 'Akuntabel & Dapat Diaudit', desc: 'Setiap peristiwa mutasi dicatat pada ledger EVM dengan Zero-PII on-chain.', icon: FileCheck, color: '#0284C7', bgColor: 'bg-sky-100' },
  ],
  exportFilenamePrefix: 'data_master_ekosistem_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Administrator Sistem Kepulauan (admin)
 */
export const AdminDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || adminProfile

  return (
    <BaseRoleDashboardView
      {...props}
      profile={profile}
      extraSideCards={
        /* KARTU PUSAT BANTUAN & CMS HELP CENTER */
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LifeBuoy size={16} className="text-[#081D35] shrink-0" />
              <span className="text-xs font-bold text-[#081D35]">Kelola Pusat Bantuan (CMS)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              CMS Helpdesk
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Kelola artikel FAQ, formulir aduan warga, panduan SOP, dan kontak posko darurat kepulauan.
          </p>
          <button
            type="button"
            onClick={() => props.onNavigate && props.onNavigate('help')}
            className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-[#081D35] hover:bg-[#0c2a4d] text-[#F4B75E] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <LifeBuoy size={14} />
            <span>Buka Manajemen Pusat Bantuan</span>
          </button>
        </div>
      }
    />
  )
}

export default AdminDashboardView
