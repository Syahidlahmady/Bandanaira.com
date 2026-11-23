import React from 'react'
import {
  BookOpen,
  CheckCircle2,
  Layers,
  MapPin,
  Eye,
  ChevronRight,
  ExternalLink,
  Clock,
  Users,
  Radio,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'

export const POKDARWIS_ARTICLES_OVERVIEW = [
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

export const smartTourismProfile: RoleDashboardProfile = {
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
    title: 'DISTRIBUSI ARTIKEL SEJARAH & EDUKASI',
    subtitle: 'Kunjungan Halaman Literasi Budaya',
    mainValue: '94,8%',
    trend: '▲ 3,4% pembaca aktif',
    badgeText: 'Optimal',
    buttonText: 'Buka CMS Artikel',
    targetTab: 'tourism',
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
}

/**
 * Dashboard Khusus Peran: Redaksi & Pengurus Pokdarwis (smart_tourism_admin)
 * Fokus: Manajemen Redaksi Artikel Sejarah, Kurasi Cerita Cagar Budaya & Promosi Wisata Bahari
 */
export const SmartTourismDashboardView: React.FC<RoleViewProps> = ({
  onNavigate,
}) => {
  return (
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
            <p className="text-xl font-bold text-[#081D35] mt-0.5">4 Tulisan</p>
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
            <p className="text-xl font-bold text-[#081D35] mt-0.5">4 Kategori</p>
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
            <p className="text-xl font-bold text-[#081D35] mt-0.5">3 Pulau</p>
            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 truncate">
              P. Neira, Banda Besar, P. Rhun
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
            {POKDARWIS_ARTICLES_OVERVIEW.map((art, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex gap-3.5 items-start">
                  <img
                    src={art.cover}
                    alt={art.title}
                    className="size-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
                        {art.island}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-slate-400">• {art.readTime}</span>
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
            ))}
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
  )
}

export default SmartTourismDashboardView
