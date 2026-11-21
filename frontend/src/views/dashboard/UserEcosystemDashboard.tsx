import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  DollarSign,
  Briefcase,
  Luggage,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  FileJson,
  ExternalLink,
  MapPin,
  Compass,
  ShoppingBag,
  QrCode,
  Sparkles,
  ChevronRight,
  Database,
  Sprout,
  Mail,
  Scale,
  Home,
  Layers,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  Clock,
  Radio,
  Eye,
  Droplets,
  Activity,
  Wheat,
  BookOpen,
} from 'lucide-react'
import { NavTabType } from '../landing/BandanairaBeranda'
import { setPreferredTourismSubTab, tourismService } from '../../services/tourism'

export type DashboardNavTab = NavTabType | 'landing' | 'dashboard'

export interface UserEcosystemDashboardProps {
  currentUser: any
  onNavigate: (tab: DashboardNavTab) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  onLogout?: () => void
  isOnline?: boolean
}

export type RoleKey =
  | 'admin'
  | 'village_officer'
  | 'farmer_group_admin'
  | 'farmer'
  | 'resident'
  | 'coop_manager'
  | 'homestay_operator'
  | 'smart_tourism_admin'
  | 'field_surveyor'
  | 'tourist'

// -----------------------------------------------------------------------------
// DEFINISI DATA & KONFIGURASI DINAMIS UNTUK SETIAP ROLE PENGGUNA
// -----------------------------------------------------------------------------

const POKDARWIS_ARTICLES_OVERVIEW = [
  {
    title: 'Pulau Rhun & Barter Manhattan: Perjanjian Breda 1667 yang Mengubah Peta Dunia',
    slug: 'pulau-rhun-barter-manhattan-perjanjian-breda-1667',
    category: 'Sejarah & Diplomasi',
    island: 'Pulau Rhun',
    author: 'Pokdarwis Banda Neira',
    summary:
      'Kisah pertukaran teritori paling bersejarah antara Kerajaan Inggris dan VOC Belanda: Pulau Rhun ditukar guling dengan New Amsterdam (kini Manhattan, New York) demi memonopoli rempah pala.',
    cover: '/images/landmarks/pulau-rhun.jpg',
    readTime: '6 menit baca',
  },
  {
    title: 'Menelusuri Benteng Belgica: Mahkota Pertahanan Segi Lima di Puncak Bukit Tabaleku',
    slug: 'menelusuri-benteng-belgica-mahkota-pertahanan-tabaleku',
    category: 'Cagar Budaya & Benteng',
    island: 'Pulau Neira',
    author: 'Pokdarwis Banda Neira',
    summary:
      'Benteng bintang segi lima karya Gubernur Jenderal VOC Pieter Both tahun 1611, spot terbaik menikmati matahari terbit dengan latar kemegahan Gunung Api Banda.',
    cover: '/images/landmarks/belgica.jpg',
    readTime: '5 menit baca',
  },
  {
    title: 'Pala yang Dicari Dunia: Emas Hijau dari Kepulauan Banda Neira',
    slug: 'pala-yang-dicari-dunia-dan-jalur-rempah-nusantara',
    category: 'Jalur Rempah & Alam',
    island: 'Pulau Banda Besar',
    author: 'Pokdarwis Banda Neira',
    summary:
      'Pohon pala endemik Banda yang dahulu nilainya melampaui emas di pasar Eropa dan memicu penjelajahan samudra bangsa-bangsa dunia ke Maluku.',
    cover: '/images/landmarks/kebun-pala.jpg',
    readTime: '5 menit baca',
  },
  {
    title: 'Rumah Pengasingan Bung Hatta & Sjahrir: Laboratorium Pemikiran Kebangsaan di Ujung Timur',
    slug: 'rumah-pengasingan-bung-hatta-sjahrir-laboratorium-kebangsaan',
    category: 'Jejak Tokoh Bangsa',
    island: 'Pulau Neira',
    author: 'Pokdarwis Banda Neira',
    summary:
      'Enam tahun masa pengasingan Mohammad Hatta dan Sutan Sjahrir (1936–1942) di Neira yang diisi dengan mendidik anak-anak lokal dan merumuskan fondasi Republik.',
    cover: '/images/landmarks/bung-hatta.jpg',
    readTime: '6 menit baca',
  },
]

interface RoleDashboardProfile {
  key: RoleKey
  name: string
  shortBadge: string
  tagline: string
  kpis: [
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string },
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string },
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string },
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string }
  ]
  lineChart: {
    title: string
    series1Name: string
    series2Name: string
    series1Color: string
    series2Color: string
    data: Array<{ label: string; v1: number; v2: number }>
    endPoint1: string
    endPoint2: string
    yDomain: [number, number]
    yTicks: number[]
  }
  donutChart: {
    title: string
    subtitle: string
    centerLabel: string
    centerValue: string
    data: Array<{ name: string; percentage: string; value: number; color: string }>
  }
  workspace1: {
    title: string
    buttonText: string
    targetTab: DashboardNavTab
    items: Array<{ id: number; name: string; stat: string; percent: number }>
  }
  workspace2: {
    title: string
    targetTab: DashboardNavTab
    highlightText: string
    subtext: string
  }
  workspace3: {
    title: string
    subtitle: string
    mainValue: string
    trend: string
    badgeText: string
    buttonText: string
    targetTab: DashboardNavTab
    bars: Array<{ label: string; value: number }>
  }
  transparencyPoints: Array<{
    title: string
    desc: string
    icon: React.ComponentType<any>
    color: string
    bgColor: string
  }>
  exportFilenamePrefix: string
}

const ROLE_PROFILES: Record<RoleKey, RoleDashboardProfile> = {
  // 1. PETANI REMPAH PALA BANDA
  farmer: {
    key: 'farmer',
    name: 'Petani Rempah Mandiri',
    shortBadge: 'Petani Pala',
    tagline: 'Pencatatan Panen, Grading Mutu Pala & Ketertelusuran On-Chain',
    kpis: [
      { title: 'HASIL PANEN MUSIM INI', value: '850 Kg', trend: '▲ 14,20% dibanding musim lalu', icon: Sprout, color: '#059669' },
      { title: 'ESTIMASI PENDAPATAN', value: 'Rp 68,5 Juta', trend: '▲ 8,45% harga grade super', icon: DollarSign, color: '#2563EB' },
      { title: 'LAHAN TERVERIFIKASI', value: '1,45 Ha', trend: '▲ 100% PostGIS terpetakan', icon: MapPin, color: '#D97706' },
      { title: 'BATCH BLOCKCHAIN', value: '6 Terbit', trend: '▲ SHA-256 terverifikasi', icon: ShieldCheck, color: '#7C3AED' },
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
      { title: 'Bebas Perantara Tengkulak', desc: 'Penjualan langsung ke marketplace komoditas terverifikasi.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_panen_petani_bandanaira',
  },

  // 2. KETUA KELOMPOK TANI (POKTAN)
  farmer_group_admin: {
    key: 'farmer_group_admin',
    name: 'Pengurus Kelompok Tani',
    shortBadge: 'Ketua Poktan',
    tagline: 'Agregasi Panen, Pendaftaran Anggota & Pengajuan Plot Kebun',
    kpis: [
      { title: 'ANGGOTA PETANI POKTAN', value: '48 Petani', trend: '▲ 6 anggota baru terdaftar', icon: Users, color: '#2563EB' },
      { title: 'TOTAL LAHAN KELOMPOK', value: '28,40 Ha', trend: '▲ 94,8% terpetakan PostGIS', icon: MapPin, color: '#059669' },
      { title: 'AGREGAT PANEN POKTAN', value: '4,65 Ton', trend: '▲ 18,30% dibanding musim lalu', icon: Wheat, color: '#D97706' },
      { title: 'PROPOSAL PENDING DESA', value: '3 Lahan', trend: '▲ Menunggu approval desa', icon: FileCheck, color: '#7C3AED' },
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
      { title: 'Batch Kolektif On-Chain', desc: 'Pembuatan batch panen gabungan bergaransi kemurnian.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_poktan_bandanaira',
  },

  // 3. PERANGKAT KANTOR DESA BANDA NEIRA
  village_officer: {
    key: 'village_officer',
    name: 'Petugas Kantor Desa',
    shortBadge: 'Perangkat Desa',
    tagline: 'Administrasi Kependudukan, Verifikasi Lahan & Layanan Surat Mandiri',
    kpis: [
      { title: 'WARGA DESA TERDAFTAR', value: '1.842 Jiwa', trend: '▲ 98,5% NIK Terenkripsi AES', icon: Users, color: '#2563EB' },
      { title: 'PERMOHONAN SURAT MASUK', value: '28 Berkas', trend: '▲ 5 Menunggu Tinjauan', icon: Mail, color: '#059669' },
      { title: 'PLOT LAHAN DIVERIFIKASI', value: '34 Kebun', trend: '▲ 4 Pengajuan Baru', icon: MapPin, color: '#D97706' },
      { title: 'INDEKS LAYANAN DESA', value: '96,40%', trend: '▲ Selesai < 24 Jam Kerja', icon: CheckCircle2, color: '#7C3AED' },
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
      { title: 'Jejak Audit Seluruh Aksi', desc: 'Setiap verifikasi dan approval tercatat di log audit sistem.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_administrasi_desa_bandanaira',
  },

  // 4. PENGELOLA KOPERASI HATTA & BANK SAMPAH
  coop_manager: {
    key: 'coop_manager',
    name: 'Pengelola Koperasi Hatta',
    shortBadge: 'Koperasi Hatta',
    tagline: 'Kasir Komoditas, Bank Sampah Plastik & Penebusan Air Bersih RO',
    kpis: [
      { title: 'DISTRIBUSI AIR MINUM RO', value: '14.250 L', trend: '▲ Standar WHO (TDS 42 PPM)', icon: Droplets, color: '#0284C7' },
      { title: 'SETORAN SAMPAH PLASTIK', value: '1.280 Kg', trend: '▲ 1 Kg = 10 Liter Air Bersih', icon: Scale, color: '#059669' },
      { title: 'OMZET KASIR KOPERASI', value: 'Rp 48,2 Juta', trend: '▲ 14,80% transaksi bulan ini', icon: DollarSign, color: '#D97706' },
      { title: 'WARGA ANGGOTA AKTIF', value: '248 KK', trend: '▲ Menggunakan kartu air RO', icon: Users, color: '#7C3AED' },
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
      { title: 'Kemitraan Daur Ulang Pulau Jawa', desc: 'Sampah plastik dipadatkan dan dikirim berkala via kapal Pelni.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_koperasi_hatta_bandanaira',
  },

  // 5. MITRA USAHA & OPERATOR ECO-STAY
  homestay_operator: {
    key: 'homestay_operator',
    name: 'Mitra Pengelola Eco-Stay',
    shortBadge: 'Eco-Stay',
    tagline: 'Katalog Penginapan, Kalender Kamar & Reservasi Langsung WhatsApp',
    kpis: [
      { title: 'TINGKAT OKUPANSI KAMAR', value: '74,50%', trend: '▲ 12,30% dibanding bln lalu', icon: Luggage, color: '#2563EB' },
      { title: 'RESERVASI WHATSAPP MASUK', value: '38 Tamu', trend: '▲ 100% Direct Booking', icon: Mail, color: '#059669' },
      { title: 'PENDAPATAN SEWA KAMAR', value: 'Rp 22,8 Juta', trend: '▲ Rata-rata 3 malam inap', icon: DollarSign, color: '#D97706' },
      { title: 'SKOR ULASAN & ECO-BADGE', value: '4.92 / 5.0', trend: '▲ Tersertifikasi Eco-Stay', icon: ShieldCheck, color: '#7C3AED' },
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
      { title: 'Standardisasi Hospitality Lokal', desc: 'Bimbingan pelayanan ramah berbasis adat sopan santun Banda.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_ecostay_bandanaira',
  },

  // 6. SURVEYOR LAPANGAN & OPERATOR IOT TELEMETRI
  field_surveyor: {
    key: 'field_surveyor',
    name: 'Surveyor Lapangan & IoT',
    shortBadge: 'Surveyor & IoT',
    tagline: 'Telemetri 4 Stasiun Sensor, Kualitas Air Minum & Pipa Survei ETL',
    kpis: [
      { title: 'STASIUN SENSOR IOT AKTIF', value: '4 / 4 Unit', trend: '▲ 100% Online LoRa/Seluler', icon: Radio, color: '#0284C7' },
      { title: 'MUTU AIR RO TERBACA', value: '42 PPM', trend: '▲ Standar Prima WHO (<100)', icon: Droplets, color: '#059669' },
      { title: 'FORM SURVEI STAGING', value: '142 Form', trend: '▲ Siap Migrasi Pipa ETL', icon: Database, color: '#D97706' },
      { title: 'BAURAN ENERGI SURYA PLTS', value: '68,20%', trend: '▲ 31,8% Generator Diesel', icon: Activity, color: '#7C3AED' },
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
      { title: 'Algoritma Resiliensi Krisis Air', desc: 'DSS SAW Mode 2 memprioritaskan pasokan jika tandon kritis.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_telemetri_iot_bandanaira',
  },

  // 7. WARGA MASYARAKAT DESA BANDA NEIRA
  resident: {
    key: 'resident',
    name: 'Warga Masyarakat Desa',
    shortBadge: 'Warga Banda',
    tagline: 'Layanan Surat Dinas Mandiri, Saldo Air Minum & Poin Bank Sampah',
    kpis: [
      { title: 'STATUS PERMOHONAN SURAT', value: '3 Pengajuan', trend: '▲ 2 Selesai, 1 Diproses', icon: Mail, color: '#2563EB' },
      { title: 'SALDO KUOTA AIR MINUM RO', value: '85 Liter', trend: '▲ Cukup untuk 1 pekan', icon: Droplets, color: '#0284C7' },
      { title: 'POIN LINGKUNGAN SAMPAH', value: '450 Poin', trend: '▲ Ditukar dari 45 kg botol', icon: Scale, color: '#059669' },
      { title: 'STATUS NIK KEPENDUDUKAN', value: 'Aktif Sah', trend: '▲ Terverifikasi Desa Neira', icon: ShieldCheck, color: '#7C3AED' },
    ],
    lineChart: {
      title: 'RIWAYAT PENGAMBILAN AIR BERSIH RO (LITER/PEKAN)',
      series1Name: 'Jatah Air Minum RO Diambil',
      series2Name: 'Bonus Air dari Bank Sampah',
      series1Color: '#0284C7',
      series2Color: '#059669',
      data: [
        { label: 'Pekan 1', v1: 25, v2: 10 },
        { label: 'Pekan 2', v1: 30, v2: 15 },
        { label: 'Pekan 3', v1: 28, v2: 12 },
        { label: 'Pekan 4', v1: 35, v2: 20 },
        { label: 'Pekan 5', v1: 40, v2: 25 },
        { label: 'Pekan 6', v1: 45, v2: 30 },
      ],
      endPoint1: '45 Liter',
      endPoint2: '30 Liter',
      yDomain: [0, 50],
      yTicks: [0, 12.5, 25, 37.5, 50],
    },
    donutChart: {
      title: 'PENGGUNAAN KUOTA AIR RO KELUARGA',
      subtitle: 'Dispenser Otomatis Koperasi Hatta',
      centerLabel: 'Air Minum',
      centerValue: '68%',
      data: [
        { name: 'Kebutuhan Minum Sehari-hari', percentage: '68,00%', value: 68, color: '#0284C7' },
        { name: 'Memasak & Seduhan Rempah', percentage: '22,00%', value: 22, color: '#059669' },
        { name: 'Cadangan Darurat', percentage: '10,00%', value: 10, color: '#D97706' },
      ],
    },
    workspace1: {
      title: 'STATUS BERKAS SURAT SAYA',
      buttonText: 'Ajukan Surat Mandiri Baru',
      targetTab: 'letters',
      items: [
        { id: 1, name: 'Surat Keterangan Usaha (SKU KUR)', stat: 'Disetujui', percent: 100 },
        { id: 2, name: 'Surat Keterangan Domisili', stat: 'Sedang Diproses', percent: 65 },
        { id: 3, name: 'Permohonan Kuota Air Tambahan', stat: 'Disetujui', percent: 100 },
      ],
    },
    workspace2: {
      title: 'PETA DISPENSER AIR RO TERDEKAT',
      targetTab: 'gis',
      highlightText: 'Titik Terdekat: Pos Koperasi Neira (250m)',
      subtext: 'Buka 24 Jam dengan Kartu RFID',
    },
    workspace3: {
      title: 'TABUNGAN POIN BANK SAMPAH SAYA',
      subtitle: 'Penebusan Sembako & Kuota Air',
      mainValue: '450 Poin',
      trend: '▲ Setara Rp 45.000,- saldo belanja',
      badgeText: 'Eco-Hero',
      buttonText: 'Cek Saldo Koperasi',
      targetTab: 'koperasi',
      bars: [
        { label: 'Jan', value: 120 },
        { label: 'Feb', value: 180 },
        { label: 'Mar', value: 260 },
        { label: 'Apr', value: 350 },
        { label: 'Mei', value: 450 },
      ],
    },
    transparencyPoints: [
      { title: 'Layanan Surat Tanpa Pungli', desc: 'Seluruh penerbitan surat dinas resmi tidak dipungut biaya.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
      { title: 'Hak Air Bersih Universal', desc: 'Setiap warga berhak atas air minum RO layak uji standar WHO.', icon: Droplets, color: '#0284C7', bgColor: 'bg-sky-100' },
      { title: 'Keamanan Data Pribadi NIK', desc: 'Nomor NIK dan berkas identitas Anda dienkripsi aman di server.', icon: ShieldCheck, color: '#2563EB', bgColor: 'bg-blue-100' },
      { title: 'Poin Daur Ulang Riil', desc: 'Poin dapat ditukarkan beras, minyak goreng, atau pulsa.', icon: Scale, color: '#D97706', bgColor: 'bg-amber-100' },
    ],
    exportFilenamePrefix: 'data_layanan_warga_bandanaira',
  },

  // 8. DINAS WISATA & PEMANDU CAGAR BUDAYA (SMART TOURISM ADMIN)
  smart_tourism_admin: {
    key: 'smart_tourism_admin',
    name: 'Pokdarwis & Pengelola Artikel Sejarah',
    shortBadge: 'Pokdarwis CMS',
    tagline: 'Draf & Publikasi Artikel Sejarah Banda Neira untuk Penguatan SEO & Budaya',
    kpis: [
      { title: 'TOTAL NASKAH & DRAF', value: '4 Artikel', trend: 'Terbit di /sejarah & Beranda', icon: BookOpen, color: '#2563EB' },
      { title: 'STATUS PUBLIKASI', value: '100% Aktif', trend: 'Dapat diakses publik & pembaca', icon: CheckCircle2, color: '#059669' },
      { title: 'ESTIMASI WAKTU BACA', value: '18 Menit', trend: 'Total durasi baca arsip', icon: Clock, color: '#D97706' },
      { title: 'PEMBACA & PENGUNJUNG', value: '14.280 Sesi', trend: 'Trafik organik SEO Google', icon: Users, color: '#7C3AED' },
    ],
    lineChart: {
      title: 'TREN KUNJUNGAN WISATAWAN BANDA NEIRA (RIBU)',
      series1Name: 'Wisatawan Mancanegara',
      series2Name: 'Wisatawan Nusantara',
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
      endPoint1: '5,23 Ribu',
      endPoint2: '5,45 Ribu',
      yDomain: [0, 12],
      yTicks: [0, 3, 6, 9, 12],
    },
    donutChart: {
      title: 'ASAL KEBANGSAAN WISATAWAN ASING',
      subtitle: 'Kunjungan Cagar Budaya & Bahari',
      centerLabel: 'Total',
      centerValue: '5,23 Jt',
      data: [
        { name: 'Belanda & Eropa', percentage: '32,45%', value: 32.45, color: '#2563EB' },
        { name: 'Australia & NZ', percentage: '24,28%', value: 24.28, color: '#0284C7' },
        { name: 'Prancis & Jerman', percentage: '18,36%', value: 18.36, color: '#059669' },
        { name: 'Asia (Jepang/China)', percentage: '14,87%', value: 14.87, color: '#D97706' },
        { name: 'Lainnya', percentage: '10,04%', value: 10.04, color: '#64748B' },
      ],
    },
    workspace1: {
      title: 'TOP 5 CAGAR BUDAYA TERPOPULER',
      buttonText: 'Buka Direktori 177 Cagar Budaya',
      targetTab: 'tourism',
      items: [
        { id: 1, name: 'Benteng Belgica (P. Neira)', stat: '2.980 Wisatawan', percent: 92 },
        { id: 2, name: 'Benteng Nassau & Istana Mini', stat: '1.820 Wisatawan', percent: 68 },
        { id: 3, name: 'Rumah Pengasingan Bung Hatta', stat: '1.450 Wisatawan', percent: 56 },
        { id: 4, name: 'Perigi Rante & Rumah Budaya', stat: '980 Wisatawan', percent: 42 },
      ],
    },
    workspace2: {
      title: 'PETA SPASIAL 7-LAYER CAGAR BUDAYA',
      targetTab: 'gis',
      highlightText: 'Sebaran: 7 Gugusan Pulau Bersejarah',
      subtext: 'Titik Nol Jalur Rempah Dunia',
    },
    workspace3: {
      title: 'EVALUASI REKOMENDASI CERDAS SAW',
      subtitle: 'Indeks Kepuasan Rute Wisatawan',
      mainValue: '94,8%',
      trend: '▲ 3,4% akurasi multikriteria',
      badgeText: 'Optimal',
      buttonText: 'Buka Perencana SAW',
      targetTab: 'smart_planner',
      bars: [
        { label: 'Jan', value: 86 },
        { label: 'Feb', value: 89 },
        { label: 'Mar', value: 91 },
        { label: 'Apr', value: 93 },
        { label: 'Mei', value: 94.8 },
      ],
    },
    transparencyPoints: [
      { title: 'Narasi Sejarah Terakreditasi', desc: 'Disusun bersama kurator cagar budaya & tetua adat Banda.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
      { title: 'Audio Guide Terbuka untuk Publik', desc: 'Dapat dinikmati gratis oleh wisatawan mancanegara & domestik.', icon: Radio, color: '#2563EB', bgColor: 'bg-blue-100' },
      { title: 'Pemandu Berlisensi Resmi HPI', desc: 'Direktori mencantumkan nomor registrasi lisensi profesi resmi.', icon: ShieldCheck, color: '#D97706', bgColor: 'bg-amber-100' },
      { title: 'Zonasi Cagar Budaya & Konservasi', desc: 'Terintegrasi peta zonasi perlindungan karang dan benteng.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_cagar_budaya_bandanaira',
  },

  // 9. WISATAWAN & PENGUNJUNG
  tourist: {
    key: 'tourist',
    name: 'Wisatawan & Pengunjung',
    shortBadge: 'Wisatawan',
    tagline: 'Eksplorasi Cagar Budaya, Reservasi Eco-Stay & Perencana Cerdas SAW',
    kpis: [
      { title: 'DESTINASI CAGAR BUDAYA', value: '177 Situs', trend: '▲ 100% Dilengkapi Audio Guide', icon: Home, color: '#2563EB' },
      { title: 'PENGINAPAN ECO-STAY', value: '18 Mitra', trend: '▲ WhatsApp Booking Langsung', icon: Luggage, color: '#059669' },
      { title: 'KUALITAS AIR BERSIH RO', value: '42 PPM', trend: '▲ Standar Prima WHO Bebas Botol', icon: Droplets, color: '#0284C7' },
      { title: 'VERIFIKASI REMPAH ON-CHAIN', value: '100% Asli', trend: '▲ Scan QR Batch Blockchain', icon: ShieldCheck, color: '#7C3AED' },
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
      buttonText: 'Rencanakan Rute dengan SAW',
      targetTab: 'smart_planner',
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
      { title: 'Keaslian Oleh-Oleh Terjamin', desc: 'Pala & fuli dilengkapi label sertifikasi hash blockchain.', icon: ShieldCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_wisata_bandanaira',
  },

  // 10. SUPER ADMINISTRATOR SISTEM
  admin: {
    key: 'admin',
    name: 'Super Administrator Sistem',
    shortBadge: 'Super Admin',
    tagline: 'Tata Kelola Komando Terpadu Seluruh 11 Ruang Kerja Operasional Banda',
    kpis: [
      { title: 'TOTAL KUNJUNGAN EKOSISTEM', value: '10,68 Juta', trend: '▲ 15,27% dibanding Apr 2024', icon: Users, color: '#2563EB' },
      { title: 'PERPUTARAN EKONOMI REMPAH', value: 'Rp 16,91 Triliun', trend: '▲ 12,34% dibanding Apr 2024', icon: DollarSign, color: '#059669' },
      { title: 'TINGKAT OKUPANSI HOTEL/ECO-STAY', value: '56,22%', trend: '▲ 4,18% dibanding Apr 2024', icon: Luggage, color: '#D97706' },
      { title: 'TOTAL TENAGA KERJA / MITRA', value: '13,43 Juta', trend: '▲ 3,65% dibanding Apr 2024', icon: Briefcase, color: '#7C3AED' },
    ],
    lineChart: {
      title: 'KUNJUNGAN WISATAWAN & PENGGUNA EKOSISTEM (JUTA)',
      series1Name: 'Wisatawan Mancanegara',
      series2Name: 'Wisatawan Nusantara',
      series1Color: '#2563EB',
      series2Color: '#059669',
      data: [
        { label: 'Des 2023', v1: 6.8, v2: 5.9 },
        { label: 'Jan 2024', v1: 8.1, v2: 6.2 },
        { label: 'Feb 2024', v1: 7.4, v2: 4.8 },
        { label: 'Mar 2024', v1: 8.5, v2: 6.3 },
        { label: 'Apr 2024', v1: 9.7, v2: 6.4 },
        { label: 'Mei 2024', v1: 5.23, v2: 5.45 },
      ],
      endPoint1: '5,23 Jt',
      endPoint2: '5,45 Jt',
      yDomain: [0, 12],
      yTicks: [0, 3, 6, 9, 12],
    },
    donutChart: {
      title: 'KUNJUNGAN WISATAWAN MANCANEGARA',
      subtitle: 'Berdasarkan Kebangsaan Asal',
      centerLabel: 'Total',
      centerValue: '5,23 Jt',
      data: [
        { name: 'Malaysia', percentage: '18,45%', value: 18.45, color: '#2563EB' },
        { name: 'Australia', percentage: '13,28%', value: 13.28, color: '#0284C7' },
        { name: 'Singapura', percentage: '11,36%', value: 11.36, color: '#0EA5E9' },
        { name: 'Tiongkok', percentage: '9,87%', value: 9.87, color: '#059669' },
        { name: 'Lainnya', percentage: '47,04%', value: 47.04, color: '#173F43' },
      ],
    },
    workspace1: {
      title: '10 DESTINASI TERPOPULER BANDA',
      buttonText: 'Lihat Selengkapnya',
      targetTab: 'tourism',
      items: [
        { id: 1, name: 'Benteng Belgica', stat: '2,98 Juta', percent: 92 },
        { id: 2, name: 'Pulau Hatta', stat: '1,23 Juta', percent: 64 },
        { id: 3, name: 'Lava Flow Snorkeling', stat: '862 Ribu', percent: 45 },
        { id: 4, name: 'Pulau Rhun', stat: '682 Ribu', percent: 36 },
        { id: 5, name: 'Rumah Pengasingan Bung Hatta', stat: '512 Ribu', percent: 28 },
      ],
    },
    workspace2: {
      title: 'PETA SEBARAN KUNJUNGAN & SPASIAL',
      targetTab: 'gis',
      highlightText: 'Status Spasial: 7 Gugusan Pulau Terdata',
      subtext: 'PostGIS & Leaflet Terintegrasi',
    },
    workspace3: {
      title: 'KONTRIBUSI EKONOMI PARIWISATA',
      subtitle: 'Terhadap PDB Nasional / PDRB Desa',
      mainValue: '4,41%',
      trend: '▲ 0,28% dibanding Apr 2024',
      badgeText: 'Surplus',
      buttonText: 'Buka Audit & Rekapitulasi',
      targetTab: 'audit',
      bars: [
        { label: 'Jan', value: 3.1 },
        { label: 'Feb', value: 3.4 },
        { label: 'Mar', value: 3.8 },
        { label: 'Apr', value: 4.1 },
        { label: 'Mei', value: 4.41 },
      ],
    },
    transparencyPoints: [
      { title: 'Sumber Data Terverifikasi', desc: 'Seluruh data bersumber dari instansi pemerintah yang berwenang.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
      { title: 'Terbuka untuk Publik', desc: 'Data dapat diakses secara terbuka melalui portal Satu Pintu.', icon: Database, color: '#2563EB', bgColor: 'bg-blue-100' },
      { title: 'Diperbarui Berkala', desc: 'Data diperbarui setiap bulan & telemetri IoT 4 stasiun pulau.', icon: RefreshCw, color: '#D97706', bgColor: 'bg-amber-100' },
      { title: 'Akuntabel & Dapat Diaudit', desc: 'Setiap data dapat ditelusuri dan diaudit sesuai ketentuan blockchain.', icon: FileCheck, color: '#7C3AED', bgColor: 'bg-purple-100' },
    ],
    exportFilenamePrefix: 'data_master_ekosistem_bandanaira',
  },
}

export const UserEcosystemDashboard: React.FC<UserEcosystemDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenMarketplace,
  onPublicVerify,
  isOnline = true,
}) => {
  const [quickVerifyInput, setQuickVerifyInput] = useState('')
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [showModuleLaunchpad, setShowModuleLaunchpad] = useState(false)
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null)

  // Ekstraksi Peran Pengguna Sebenarnya
  const roles: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isAdmin = isSuperuser || roles.includes('admin')
  const isOfficerOrAdmin = isAdmin || roles.includes('village_officer')
  const isFarmer = roles.includes('farmer') || roles.includes('petani')
  const isFarmerGroupAdmin = roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')
  const isCoopManager = roles.includes('coop_manager') || roles.includes('pengelola_koperasi')
  const isSurveyor = roles.includes('field_surveyor') || roles.includes('surveyor')

  const detectInitialRoleKey = (): RoleKey => {
    if (isSuperuser || roles.includes('admin')) return 'admin'
    if (roles.includes('village_officer')) return 'village_officer'
    if (roles.includes('farmer_group_admin') || roles.includes('ketua_kelompok')) return 'farmer_group_admin'
    if (roles.includes('farmer') || roles.includes('petani')) return 'farmer'
    if (roles.includes('coop_manager') || roles.includes('pengelola_koperasi')) return 'coop_manager'
    if (roles.includes('homestay_operator') || roles.includes('operator_homestay')) return 'homestay_operator'
    if (roles.includes('smart_tourism_admin') || roles.includes('admin_wisata')) return 'smart_tourism_admin'
    if (roles.includes('field_surveyor') || roles.includes('surveyor')) return 'field_surveyor'
    return 'resident'
  }

  // State peran aktif: Jika Admin, dapat berganti pratinjau seluruh role. Jika Non-Admin, dikunci sesuai perannya!
  const [selectedRoleKey, setSelectedRoleKey] = useState<RoleKey>(detectInitialRoleKey)

  // Peran aktif yang efektif: jika bukan Admin, SELALU gunakan role asli pengguna (tidak bisa bypass ke admin)
  const activeRoleKey: RoleKey = isAdmin ? selectedRoleKey : detectInitialRoleKey()
  const profile = ROLE_PROFILES[activeRoleKey] || ROLE_PROFILES.resident

  // Waktu Real-Time Sinkron WIT (Waktu Indonesia Timur / UTC+9)
  const [currentDateTime, setCurrentDateTime] = useState<Date>(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jayapura',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jayapura',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Real-time synchronization for Pokdarwis History Articles
  const [pokdarwisArticles, setPokdarwisArticles] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('pokdarwis_articles_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return POKDARWIS_ARTICLES_OVERVIEW
  })

  useEffect(() => {
    if (activeRoleKey !== 'smart_tourism_admin') return

    const loadTourismArticles = async () => {
      try {
        const data = await tourismService.listCommunityContents({ content_type: 'ARTICLE' })
        if (Array.isArray(data) && data.length > 0) {
          setPokdarwisArticles(data)
          try {
            localStorage.setItem('pokdarwis_articles_cache', JSON.stringify(data))
          } catch {
            // ignore
          }
        }
      } catch {
        // fallback already loaded from cache or default
      }
    }

    loadTourismArticles()

    const handleArticlesSync = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setPokdarwisArticles(e.detail)
      } else {
        try {
          const cached = localStorage.getItem('pokdarwis_articles_cache')
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed)) setPokdarwisArticles(parsed)
          }
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('banda_articles_updated', handleArticlesSync)
    window.addEventListener('storage', handleArticlesSync)
    return () => {
      window.removeEventListener('banda_articles_updated', handleArticlesSync)
      window.removeEventListener('storage', handleArticlesSync)
    }
  }, [activeRoleKey])

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickVerifyInput.trim()) return
    onPublicVerify(quickVerifyInput.trim())
  }

  // Fungsi Ekspor Data Terbuka Fungsional (CSV, JSON, XLSX, API)
  const handleExportData = (format: 'csv' | 'json' | 'xlsx' | 'api') => {
    if (format === 'api') {
      window.open('/docs', '_blank')
      return
    }

    const exportPayload = {
      ekosistem: 'Banda Digital Ecosystem',
      peran_aktif: profile.name,
      tanggal_ekspor: new Date().toISOString(),
      kpi_summary: profile.kpis.map((k) => ({ metrik: k.title, nilai: k.value, tren: k.trend })),
      ringkasan_workspace: profile.workspace1.items,
      tren_grafik: profile.lineChart.data,
      komposisi_donut: profile.donutChart.data,
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profile.exportFilenamePrefix}_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const rows = [
        ['No', 'Metrik KPI', 'Nilai', 'Tren Pertumbuhan'],
        ...profile.kpis.map((k, i) => [i + 1, k.title, k.value, k.trend]),
        [],
        ['No', 'Aktivitas Workspace', 'Pencapaian', 'Persentase'],
        ...profile.workspace1.items.map((it, i) => [i + 1, it.name, it.stat, `${it.percent}%`]),
      ]
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
      const encodedUri = encodeURI(csvContent)
      const a = document.createElement('a')
      a.href = encodedUri
      a.download = `${profile.exportFilenamePrefix}_${Date.now()}.${format === 'xlsx' ? 'csv' : 'csv'}`
      a.click()
    }

    setDownloadSuccessNotice(`Berkas ${format.toUpperCase()} (${profile.shortBadge}) berhasil diunduh.`)
    setTimeout(() => setDownloadSuccessNotice(null), 4000)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto py-2 px-1 sm:px-3 lg:px-4 text-[#081D35]">
      {/* =====================================================================
          HEADER ATAS: TAGLINE, WAKTU REAL-TIME, PENCARIAN & PROFIL
      ====================================================================== */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97706]">
            <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {activeRoleKey === 'smart_tourism_admin'
              ? 'Kelompok Sadar Wisata (Pokdarwis)'
              : `Ruang Kerja: ${profile.name}`}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-serif text-[#081D35] tracking-tight mt-0.5">
            {activeRoleKey === 'smart_tourism_admin'
              ? 'Ruang Redaksi & Manajemen Artikel Sejarah'
              : profile.tagline}
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          {/* Tanggal & Waktu Real-Time Sinkron WIT */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-medium text-slate-600 shadow-xs">
            <Clock size={14} className="text-[#D97706]" />
            <span>{formattedDate}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono tabular-nums font-bold text-[#081D35]">{formattedTime} WIT</span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          PEMILIH PERSPEKTIF ROLE (ROLE PREVIEW SWITCHER BAR)
          Khusus untuk Administrator Sistem guna memantau dan mengontrol tampilan seluruh 10 role
      ====================================================================== */}
      {isAdmin && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Eye size={13} className="text-[#D97706]" />
            Kontrol Perspektif Role:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Object.keys(ROLE_PROFILES) as RoleKey[]).map((rKey) => {
              const p = ROLE_PROFILES[rKey]
              const isSelected = activeRoleKey === rKey
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setSelectedRoleKey(rKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#081D35] text-[#F4B75E] font-bold shadow-xs border border-[#1E3A5F]'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {p.shortBadge}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Toast Notifikasi Ringkas */}
      {showNotificationToast && (
        <div className="p-4 rounded-xl bg-[#081D35] text-white flex items-center justify-between border-l-4 border-[#F4B75E] shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-[#F4B75E] shrink-0" />
            <p className="text-xs sm:text-sm">
              <strong className="text-[#F4B75E]">Info Ekosistem ({profile.shortBadge}):</strong> Modul kerja, telemetri IoT 4 stasiun, dan pencatatan komoditas beroperasi optimal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotificationToast(false)}
            className="text-xs text-white/70 hover:text-white underline ml-3 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Notice Berhasil Unduh Data Terbuka */}
      {downloadSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{downloadSuccessNotice}</span>
        </div>
      )}

      {/* =====================================================================
          TATA LETAK UTAMA: GRID 3 BAGIAN (AREA KIRI-TENGAH + PANEL KANAN)
      ====================================================================== */}
      {activeRoleKey === 'smart_tourism_admin' ? (
        <div className="flex flex-col gap-6">
          {/* 4 Ringkasan Realistis & Bersih */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
              <div className="size-12 rounded-xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0">
                <BookOpen size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Naskah Terbit
                </span>
                <p className="text-xl font-bold text-[#081D35] mt-0.5">{pokdarwisArticles.length} Tulisan</p>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5 truncate">
                  Tayang di /sejarah &amp; beranda
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
              <div className="size-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Status Pembaca
                </span>
                <p className="text-xl font-bold text-[#081D35] mt-0.5">Terbuka Publik</p>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5 truncate">
                  Bebas diakses tanpa akun
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
              <div className="size-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Layers size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Topik Bahasan
                </span>
                <p className="text-xl font-bold text-[#081D35] mt-0.5">
                  {new Set(pokdarwisArticles.map((a: any) => a.priority_category || a.category)).size} Kategori
                </p>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 truncate">
                  Diplomasi, Benteng, Rempah, Tokoh
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
              <div className="size-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Sebaran Cerita
                </span>
                <p className="text-xl font-bold text-[#081D35] mt-0.5">
                  {new Set(pokdarwisArticles.map((a: any) => a.island_name || a.island)).size} Pulau
                </p>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 truncate">
                  {Array.from(new Set(pokdarwisArticles.map((a: any) => a.island_name || a.island))).slice(0, 3).join(', ') || 'Kepulauan Banda'}
                </span>
              </div>
            </div>
          </div>

          {/* Area Utama: Kolom Kiri 8 col + Kolom Kanan 4 col */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Daftar Naskah Sejarah */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#081D35]">
                    Daftar Naskah Sejarah Banda Neira
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Naskah cerita sejarah yang dikurasi oleh Pokdarwis untuk penguatan literasi dan pariwisata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('tourism')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#081D35] text-[#F4B75E] hover:bg-[#0F2C59] text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  <BookOpen size={14} />
                  <span>Tulis Artikel di CMS</span>
                </button>
              </div>

              <div className="space-y-3">
                {pokdarwisArticles.map((art: any, idx: number) => {
                  const cover = art.media_url || art.cover || '/images/landmarks/belgica.jpg'
                  const island = art.island_name || art.island || 'Pulau Neira'
                  const category = art.priority_category || art.category || 'SEJARAH'
                  const readTime = art.readTime || '5 menit baca'
                  return (
                    <div
                      key={art.id || art.slug || idx}
                      className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-3.5 items-start">
                        <img
                          src={cover}
                          alt={art.title}
                          className="size-16 rounded-xl object-cover shrink-0 border border-slate-200"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
                              {island}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {category}
                            </span>
                            <span className="text-[10px] text-slate-400">• {readTime}</span>
                          </div>
                          <h3 className="text-sm font-bold text-[#081D35] leading-snug line-clamp-1">
                            {art.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => onNavigate('tourism')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        >
                          Sunting Naskah
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('sejarah')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081D35] hover:bg-[#0F2C59] text-xs font-semibold text-white transition cursor-pointer"
                        >
                          <Eye size={12} className="text-[#F4B75E]" />
                          <span>Lihat di Web</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Kolom Kanan: Aksi & Pedoman Penulisan */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Kartu Aksi Cepat */}
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#081D35] border-b border-slate-100 pb-2">
                  Pintasan Kerja Redaksi
                </h3>

                <button
                  type="button"
                  onClick={() => onNavigate('tourism')}
                  className="w-full p-3 rounded-xl bg-[#081D35] text-white hover:bg-[#0F2C59] transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#F4B75E]">Buka CMS Artikel Sejarah</p>
                    <p className="text-[11px] text-slate-300">Tambah draf &amp; perbarui publikasi</p>
                  </div>
                  <ChevronRight size={16} className="text-[#F4B75E] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('sejarah')}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#081D35]">Halaman Pembaca (/sejarah)</p>
                    <p className="text-[11px] text-slate-500">Pratinjau tampilan publik dan pembaca</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-[#081D35] transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#081D35]">Linimasa Sejarah di Beranda</p>
                    <p className="text-[11px] text-slate-500">Cek integrasi cerita di halaman utama</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Kartu Pedoman Penulisan Narasi Pokdarwis */}
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <h3 className="font-serif text-sm font-bold text-[#081D35]">
                    Pedoman Narasi Pokdarwis
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">1. Verifikasi Sumber &amp; Tutur Adat</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Rujuk tuturan para tetua adat lokal, arsip cagar budaya Banda, dan literatur sejarah terpercaya.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">2. Gaya Cerita yang Santun &amp; Mengalir</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Gunakan bahasa yang lugas dan mengalir agar mudah dinikmati wisatawan maupun generasi muda.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">3. Dokumentasi Visual Otentik</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sertakan dokumentasi foto asli benteng, kebun pala, atau rumah bersejarah untuk memperkuat cerita.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ===================================================================
            KOLOM KIRI-TENGAH (AREA UTAMA ~75% LEBAR -> xl:col-span-9)
        ==================================================================== */}
        <div className="xl:col-span-9 flex flex-col gap-6">
          {/* -----------------------------------------------------------------
              BARIS 1: 4 KARTU KPI UTAMA (HORIZONTAL SUMMARY CARDS KHUSUS ROLE)
          ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.kpis.map((kpi, idx) => {
              const Icon = kpi.icon
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition"
                >
                  <div
                    className="size-13 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: kpi.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                      {kpi.title}
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-[#081D35] tracking-tight leading-tight mt-0.5">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1 truncate">
                      <span>▲</span>
                      <span className="truncate">{kpi.trend}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* -----------------------------------------------------------------
              BARIS 2: 2 GRAFIK ANALITIK UTAMA (60% MULTI-LINE & 40% DONUT KHUSUS ROLE)
          ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* KIRI (~60%): MULTI-LINE CHART ANALITIK ROLE */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {profile.lineChart.title}
                </h3>
                {/* Legenda Grafik di Atas */}
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5" style={{ color: profile.lineChart.series1Color }}>
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: profile.lineChart.series1Color }} />
                    <span className="truncate max-w-[130px]">{profile.lineChart.series1Name}</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: profile.lineChart.series2Color }}>
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: profile.lineChart.series2Color }} />
                    <span className="truncate max-w-[130px]">{profile.lineChart.series2Name}</span>
                  </div>
                </div>
              </div>

              {/* Kanvas Grafik Garis */}
              <div className="w-full h-56 sm:h-64 pt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profile.lineChart.data} margin={{ top: 15, right: 35, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis
                      domain={profile.lineChart.yDomain}
                      ticks={profile.lineChart.yTicks}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#081D35',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #1E3A5F',
                        fontSize: '11px',
                        padding: '8px 12px',
                      }}
                      labelStyle={{ color: '#F4B75E', fontWeight: 'bold' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v1"
                      name={profile.lineChart.series1Name}
                      stroke={profile.lineChart.series1Color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: profile.lineChart.series1Color }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v2"
                      name={profile.lineChart.series2Name}
                      stroke={profile.lineChart.series2Color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: profile.lineChart.series2Color }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Indikator Angka Titik Akhir */}
                <div className="absolute right-2 top-8 text-right hidden sm:block pointer-events-none">
                  <span className="text-[11px] font-bold block" style={{ color: profile.lineChart.series1Color }}>
                    {profile.lineChart.endPoint1}
                  </span>
                  <span className="text-[11px] font-bold block mt-4" style={{ color: profile.lineChart.series2Color }}>
                    {profile.lineChart.endPoint2}
                  </span>
                </div>
              </div>
            </div>

            {/* KANAN (~40%): DONUT CHART KOMPOSISI ROLE */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                  {profile.donutChart.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile.donutChart.subtitle}</p>
              </div>

              <div className="flex items-center justify-between gap-3 flex-1">
                {/* Donut Chart Lingkaran */}
                <div className="relative size-44 sm:size-48 shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#081D35',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '11px',
                        }}
                      />
                      <Pie
                        data={profile.donutChart.data}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {profile.donutChart.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Angka Total di Tengah Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[11px] text-slate-500 font-medium">{profile.donutChart.centerLabel}</span>
                    <span className="text-base font-black text-[#081D35] leading-tight">
                      {profile.donutChart.centerValue}
                    </span>
                  </div>
                </div>

                {/* Daftar Persentase di Samping Kanan */}
                <div className="flex flex-col gap-2 flex-1 min-w-0 pr-1">
                  {profile.donutChart.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 font-medium truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-[#081D35] shrink-0">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              BARIS 3: 3 KARTU RINGKASAN LINTAS WORKSPACE SESUAI PERAN PENGGUNA
          ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KARTU 1: PROGRESS BAR WORKSPACE TERKAIT */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 truncate">
                  {profile.workspace1.title}
                </h3>
                <div className="flex flex-col gap-3">
                  {profile.workspace1.items.map((it) => (
                    <div key={it.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 font-semibold truncate">
                          {it.id}. {it.name}
                        </span>
                        <span className="text-slate-500 font-bold text-[11px] shrink-0">
                          {it.stat}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] transition-all duration-500"
                          style={{ width: `${it.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(profile.workspace1.targetTab)}
                className="mt-4 w-full py-2 px-3 rounded-xl border border-[#CBD5E1] text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#081D35] transition text-center shadow-2xs cursor-pointer"
              >
                {profile.workspace1.buttonText}
              </button>
            </div>

            {/* KARTU 2: PETA SEBARAN SPASIAL BANDA */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                  {profile.workspace2.title}
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate(profile.workspace2.targetTab)}
                  className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Buka Peta</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              {/* Visualisasi Peta Spasial Kepulauan Banda */}
              <div
                onClick={() => onNavigate(profile.workspace2.targetTab)}
                className="my-3 relative w-full h-40 bg-gradient-to-br from-sky-50 via-slate-50 to-amber-50/30 rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between overflow-hidden cursor-pointer group"
                title="Klik untuk membuka Peta GIS Interaktif"
              >
                {/* Visual Siluet Pulau-Pulau Banda */}
                <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 400 240" className="w-full h-full max-h-36">
                    {/* Pulau Banda Besar (Lonthoir - Melengkung) */}
                    <path
                      d="M 120 170 Q 210 210 290 150 Q 250 140 180 150 Z"
                      fill="#0F2C59"
                      stroke="#081D35"
                      strokeWidth="1.5"
                    />
                    {/* Pulau Neira (Pusat) */}
                    <ellipse cx="205" cy="115" rx="22" ry="14" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
                    {/* Gunung Api Banda */}
                    <circle cx="170" cy="105" r="16" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
                    {/* Pulau Hatta */}
                    <ellipse cx="320" cy="190" rx="15" ry="9" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
                    {/* Pulau Ay */}
                    <ellipse cx="90" cy="95" rx="14" ry="8" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" />
                    {/* Pulau Rhun */}
                    <ellipse cx="50" cy="85" rx="12" ry="7" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />

                    {/* Label Pin Utama */}
                    <text x="205" y="118" fontSize="8" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                      Neira
                    </text>
                    <text x="170" y="108" fontSize="7" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                      Volcano
                    </text>
                  </svg>
                </div>

                {/* Legenda Intensitas Warna Sebaran (Tinggi - Rendah) */}
                <div className="relative z-10 self-end flex flex-col items-end gap-1 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Tinggi</span>
                  <div className="w-2.5 h-16 rounded-full bg-gradient-to-b from-[#081D35] via-[#2563EB] to-slate-200" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Rendah</span>
                </div>

                <div className="relative z-10 text-[10px] text-slate-600 bg-white/85 px-2 py-0.5 rounded backdrop-blur-xs self-start font-medium">
                  📍 {profile.workspace2.highlightText}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{profile.workspace2.subtext}</span>
                <span className="font-bold text-[#081D35] shrink-0">GIS Terintegrasi</span>
              </div>
            </div>

            {/* KARTU 3: KONTRIBUSI OPERASIONAL & EKONOMI */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                  {profile.workspace3.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile.workspace3.subtitle}</p>

                <div className="flex items-end justify-between gap-2 mt-4">
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-[#081D35] tracking-tight block">
                      {profile.workspace3.mainValue}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
                      <span>▲</span>
                      <span className="truncate">{profile.workspace3.trend}</span>
                    </div>
                  </div>

                  {/* Mini Vertical Bar Chart */}
                  <div className="w-28 h-18 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profile.workspace3.bars} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate(profile.workspace3.targetTab)}
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{profile.workspace3.buttonText}</span>
                  <ChevronRight size={13} />
                </button>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {profile.workspace3.badgeText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            KOLOM KANAN (PANEL UTILITAS & AKSI CEPAT ~25% LEBAR -> xl:col-span-3)
        ==================================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* KARTU ATAS: TRANSPARANSI DATA / SISTEM KHUSUS DOMAIN ROLE */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="size-9 rounded-xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#081D35] tracking-wider uppercase">
                  TRANSPARANSI DATA
                </h3>
                <span className="text-[10px] text-slate-500">Integritas Domain {profile.shortBadge}</span>
              </div>
            </div>

            {/* 4 Poin Vertikal Transparansi Role */}
            <div className="flex flex-col gap-3.5">
              {profile.transparencyPoints.map((pt, i) => {
                const Icon = pt.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pt.bgColor}`}
                      style={{ color: pt.color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#081D35]">{pt.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{pt.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* KARTU BAWAH: UNDUH DATA TERBUKA ROLE */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
            <div>
              <h3 className="text-xs font-black text-[#081D35] tracking-wider uppercase">
                UNDUH DATA TERBUKA
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Akses dan ekspor data komoditas &amp; layanan untuk penelitian dan analisis.
              </p>
            </div>

            {/* 4 Tombol Ekspor Cepat: CSV, XLSX, JSON, API */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleExportData('csv')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/50 transition group cursor-pointer shadow-2xs"
                title="Unduh Format CSV"
              >
                <FileText size={18} className="text-slate-600 group-hover:text-[#2563EB] transition-colors" />
                <span className="text-[10px] font-black tracking-wider text-slate-700 group-hover:text-[#2563EB] mt-1">
                  CSV
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExportData('xlsx')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition group cursor-pointer shadow-2xs"
                title="Unduh Format Excel XLSX"
              >
                <FileSpreadsheet size={18} className="text-slate-600 group-hover:text-emerald-600 transition-colors" />
                <span className="text-[10px] font-black tracking-wider text-slate-700 group-hover:text-emerald-600 mt-1">
                  XLSX
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExportData('json')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 transition group cursor-pointer shadow-2xs"
                title="Unduh Format JSON"
              >
                <FileJson size={18} className="text-slate-600 group-hover:text-amber-600 transition-colors" />
                <span className="text-[10px] font-black tracking-wider text-slate-700 group-hover:text-amber-600 mt-1">
                  JSON
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExportData('api')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 transition group cursor-pointer shadow-2xs"
                title="Buka Dokumentasi REST API Swagger"
              >
                <ExternalLink size={18} className="text-slate-600 group-hover:text-purple-600 transition-colors" />
                <span className="text-[10px] font-black tracking-wider text-slate-700 group-hover:text-purple-600 mt-1">
                  API
                </span>
              </button>
            </div>
          </div>

          {/* KARTU PENDUKUNG: RADAR VERIFIKASI HASH BLOCKCHAIN */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-[#081D35]" />
              <span className="text-xs font-bold text-[#081D35]">Verifikasi Batch Blockchain</span>
            </div>
            <form onSubmit={handleVerifySubmit} className="flex gap-1.5">
              <input
                type="text"
                placeholder="BN-BTC-2026-001"
                value={quickVerifyInput}
                onChange={(e) => setQuickVerifyInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#F4B75E]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-[#0F2C59] transition cursor-pointer"
              >
                Cek
              </button>
            </form>
          </div>

          {/* TOMBOL PINTAS MARKETPLACE KOMODITAS */}
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="w-full py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-xs font-bold text-[#92540c] flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
          >
            <ShoppingBag size={15} className="text-[#D97706]" />
            <span>Buka Marketplace Komoditas</span>
          </button>

          {/* PINTASAN LAUNCHPAD RUANG KERJA TERPADU */}
          <button
            type="button"
            onClick={() => setShowModuleLaunchpad(!showModuleLaunchpad)}
            className="w-full py-2.5 px-3 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-[#081D35] flex items-center justify-between transition shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Compass size={15} className="text-[#D97706]" />
              Peluncur Ruang Kerja ({profile.shortBadge})
            </span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${showModuleLaunchpad ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </div>
      )}

      {/* =====================================================================
          DRAWER / EXPANDABLE PELUNCUR RUANG KERJA SESUAI ROLE PENGGUNA
      ====================================================================== */}
      {showModuleLaunchpad && activeRoleKey !== 'smart_tourism_admin' && (
        <section className="p-5 rounded-2xl bg-[#081D35] text-white shadow-lg flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#F4B75E]">
                Ruang Kerja Operasional Terpadu: {profile.name}
              </h3>
              <p className="text-xs text-slate-300">Pilih modul kerja yang ingin Anda buka langsung</p>
            </div>
            <button
              type="button"
              onClick={() => setShowModuleLaunchpad(false)}
              className="text-xs text-white/70 hover:text-white underline cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('letters')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
            >
              <Mail size={16} className="text-[#F4B75E] mb-1" />
              <p className="text-xs font-bold text-white">
                {isOfficerOrAdmin ? 'Pelayanan Surat' : 'Surat Warga'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isOfficerOrAdmin ? 'Verifikasi & TTE' : 'Ajukan SKU / domisili'}
              </p>
            </button>

            {(isFarmer || isFarmerGroupAdmin || isCoopManager || isOfficerOrAdmin) && (
              <button
                type="button"
                onClick={() => onNavigate('traceability')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
              >
                <Sprout size={16} className="text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Panen Rempah</p>
                <p className="text-[10px] text-slate-400">Grading &amp; batch</p>
              </button>
            )}

            {(isFarmer || isFarmerGroupAdmin || isOfficerOrAdmin) && (
              <button
                type="button"
                onClick={() => onNavigate('farming')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
              >
                <MapPin size={16} className="text-teal-400 mb-1" />
                <p className="text-xs font-bold text-white">Peta Kebun</p>
                <p className="text-[10px] text-slate-400">Plot batas poktan</p>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('tourism')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
            >
              <Home size={16} className="text-[#F4B75E] mb-1" />
              <p className="text-xs font-bold text-white">Cagar &amp; Eco-Stay</p>
              <p className="text-[10px] text-slate-400">Penginapan &amp; budaya</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPreferredTourismSubTab('accommodations')
                onNavigate('tourism')
              }}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
            >
              <BookOpen size={16} className="text-[#F4B75E] mb-1" />
              <p className="text-xs font-bold text-white">
                {isOfficerOrAdmin ? 'Katalog Wisata' : 'Destinasi Wisata'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isOfficerOrAdmin ? 'Kelola data wisata' : 'Jelajahi pulau'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gis')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
            >
              <Layers size={16} className="text-sky-400 mb-1" />
              <p className="text-xs font-bold text-white">Peta Spasial GIS</p>
              <p className="text-[10px] text-slate-400">7 Layer tematik</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('koperasi')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
            >
              <Scale size={16} className="text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-white">
                {isCoopManager || isOfficerOrAdmin ? 'Kasir Koperasi' : 'Koperasi Warga'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isCoopManager || isOfficerOrAdmin ? 'Bank sampah & air RO' : 'Saldo & kuota air'}
              </p>
            </button>

            {(isOfficerOrAdmin || isSurveyor) && (
              <button
                type="button"
                onClick={() => onNavigate('iot')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
              >
                <Radio size={16} className="text-amber-400 mb-1" />
                <p className="text-xs font-bold text-white">IoT Cuaca</p>
                <p className="text-[10px] text-slate-400">Telemetri 4 stasiun</p>
              </button>
            )}

            {isOfficerOrAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('population')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
                >
                  <Users size={16} className="text-blue-400 mb-1" />
                  <p className="text-xs font-bold text-white">Kependudukan</p>
                  <p className="text-[10px] text-slate-400">Master NIK warga</p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('audit')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer"
                >
                  <ShieldCheck size={16} className="text-indigo-400 mb-1" />
                  <p className="text-xs font-bold text-white">Jejak Audit</p>
                  <p className="text-[10px] text-slate-400">Audit blockchain</p>
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          SENTUHAN VISUAL BAWAH: FOOTER BANNER LANSKAP BANDA NEIRA
          (Gunung Api Banda, Benteng Belgica, Pohon Pala & Perahu Kora-Kora)
      ====================================================================== */}
      {activeRoleKey !== 'smart_tourism_admin' && (
        <footer className="relative w-full mt-4 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-gradient-to-t from-[#081D35] via-[#0F2C59] to-[#1E3A5F] text-white">
          {/* Siluet Vektor Lanskap Tradisional Banda Neira */}
          <div className="relative h-28 sm:h-36 w-full flex items-end justify-between px-6 pt-4 pointer-events-none select-none overflow-hidden">
            {/* Siluet Lanskap Alam & Cagar Budaya */}
            <svg
              viewBox="0 0 1200 160"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full opacity-35 text-[#F4B75E]"
            >
              {/* Siluet Gunung Api Banda di Latar Tengah */}
              <path d="M 400 160 L 580 30 Q 600 20 620 30 L 800 160 Z" fill="currentColor" opacity="0.3" />
              {/* Kepulan Asap Halus Gunung Api */}
              <circle cx="600" cy="18" r="8" fill="currentColor" opacity="0.15" />
              <circle cx="615" cy="10" r="12" fill="currentColor" opacity="0.1" />

              {/* Benteng Belgica (Menara Segi Lima Ikonik di Kiri) */}
              <polygon points="120,160 120,95 160,80 200,95 200,160" fill="currentColor" opacity="0.45" />
              <polygon points="150,80 160,65 170,80" fill="currentColor" opacity="0.5" />
              <rect x="70" y="120" width="70" height="40" fill="currentColor" opacity="0.35" />
              <rect x="180" y="120" width="70" height="40" fill="currentColor" opacity="0.35" />

              {/* Deretan Pohon Pala & Kelapa Pesisir */}
              <path d="M 280 160 Q 285 110 300 90 Q 315 110 320 160 Z" fill="currentColor" opacity="0.3" />
              <path d="M 320 160 Q 325 105 340 85 Q 355 105 360 160 Z" fill="currentColor" opacity="0.25" />
              <path d="M 850 160 Q 860 100 880 80 Q 900 100 910 160 Z" fill="currentColor" opacity="0.3" />
              <path d="M 910 160 Q 920 105 940 85 Q 960 105 970 160 Z" fill="currentColor" opacity="0.25" />

              {/* Perahu Tradisional Kora-Kora Banda di Lautan Kanan */}
              <path
                d="M 1000 145 C 1030 140, 1100 140, 1140 145 C 1110 152, 1040 152, 1000 145 Z"
                fill="currentColor"
                opacity="0.6"
              />
              {/* Tiang Layar & Bendera Kora-Kora */}
              <line x1="1070" y1="145" x2="1070" y2="105" stroke="currentColor" strokeWidth="2" opacity="0.6" />
              <polygon points="1070,105 1095,120 1070,135" fill="currentColor" opacity="0.5" />
              {/* Dayung Kora-kora */}
              <line x1="1020" y1="148" x2="1010" y2="158" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="1040" y1="148" x2="1030" y2="158" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="1060" y1="148" x2="1050" y2="158" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="1080" y1="148" x2="1070" y2="158" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="1100" y1="148" x2="1090" y2="158" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />

              {/* Gelombang Lautan Banda */}
              <path
                d="M 0 155 Q 300 148 600 155 Q 900 162 1200 155 L 1200 160 L 0 160 Z"
                fill="#081D35"
                opacity="0.9"
              />
            </svg>

            {/* Teks Identitas Lanskap Banda Neira */}
            <div className="relative z-10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between w-full text-xs">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wider text-base text-[#F4B75E]">
                  Kepulauan Banda Neira
                </span>
                <span className="text-slate-300 hidden md:inline">
                  • Titik Nol Jalur Rempah Dunia &amp; Cagar Budaya Maritim
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 sm:mt-0 font-medium">
                Benteng Belgica • Gunung Api Banda • Perahu Kora-Kora
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default UserEcosystemDashboard
