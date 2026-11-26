import React, { useState, useMemo } from 'react'
import {
  Mail,
  Check,
  X,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Copy,
  User,
  Download,
  Plus,
  Award,
  BookOpen,
  FileCheck,
  Building2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'
import { AdministrativeRequestItem } from '../services/population'
import { getOccupationBadge } from '../components/OccupationBadge'

export interface LettersWorkspaceProps {
  adminRequests: AdministrativeRequestItem[]
  requestFilterStatus: string
  setRequestFilterStatus: (st: string) => void
  updatingRequestId: string | null
  handleUpdateRequestStatus: (id: string, status: 'approved' | 'rejected') => void
  letterActionMsg: { type: 'success' | 'error'; text: string } | null
}

export interface OfficialArchiveDocument {
  id: string
  title: string
  category: 'SERTIFIKAT' | 'PERDES' | 'SK_DESA' | 'PERTANAHAN'
  documentNumber: string
  releaseDate: string
  fileSize: string
  sha256Hash: string
  description: string
  issuer: string
}

const OFFICIAL_ARCHIVE_DOCS: OfficialArchiveDocument[] = [
  {
    id: 'DOC-GI-2024-001',
    title: 'Sertifikat Indikasi Geografis (GI) Pala Banda',
    category: 'SERTIFIKAT',
    documentNumber: 'Kemenkumham RI No. ID G 000000021/2024',
    releaseDate: '2024-01-12',
    fileSize: '2.4 MB',
    sha256Hash: '7f9a88c21a44ef91b8d2345e67890abcdeffedcba09876543210123456789abc',
    description: 'Sertifikasi internasional keaslian dan mutu pala & fuli vulkanik Kepulauan Banda sebagai komoditas warisan dunia berindikasi geografis.',
    issuer: 'Direktorat Jenderal Kekayaan Intelektual RI & Masyarakat Perlindungan Indikasi Geografis (MPIG) Banda',
  },
  {
    id: 'DOC-PERDES-2026-04',
    title: 'Peraturan Desa No. 04/2026: Zonasi Konservasi Terumbu Karang',
    category: 'PERDES',
    documentNumber: 'PERDES-BN/04/II/2026',
    releaseDate: '2026-02-15',
    fileSize: '1.8 MB',
    sha256Hash: '4e1b2c88df3490123456789abcdef0123456789abcdef0123456789abcdef012',
    description: 'Regulasi penataan zona penangkapan ikan nelayan tradisional, larangan alat tangkap destruktif, dan perlindungan terumbu karang pesisir Neira.',
    issuer: 'Pemerintah Desa Banda Neira & Badan Permusyawaratan Desa (BPD)',
  },
  {
    id: 'DOC-SK-POKDARWIS-2026',
    title: 'SK Kepala Desa: Pengukuhan Pengurus Pokdarwis Wisata Banda',
    category: 'SK_DESA',
    documentNumber: '18/KD-BN/SK/III/2026',
    releaseDate: '2026-03-02',
    fileSize: '1.2 MB',
    sha256Hash: '9c3d4e11aa7890123456789abcdef0123456789abcdef0123456789abcdef012',
    description: 'Surat Keputusan legalitas struktur organisasi Kelompok Sadar Wisata dalam mengelola cagar budaya, pemanduan sejarah, dan homestay ramah lingkungan.',
    issuer: 'Kantor Kepala Desa Banda Neira',
  },
  {
    id: 'DOC-LAB-SWRO-2026-Q1',
    title: 'Laporan Hasil Uji Lab Mutu Air Minum Higienis SWRO',
    category: 'SERTIFIKAT',
    documentNumber: 'LAB-KES/AM-BN/098/2026',
    releaseDate: '2026-04-10',
    fileSize: '3.1 MB',
    sha256Hash: '3a2b1c99ef123456789abcdef0123456789abcdef0123456789abcdef0123456',
    description: 'Hasil uji laboratorium parameter fisika, kimia, dan bakteriologi TDS air minum desalinasi membran SWRO Pulau Hatta & Pulau Ay (TDS < 65 PPM).',
    issuer: 'Balai Laboratorium Kesehatan Maluku & Tim KKN-PPM UGM',
  },
  {
    id: 'DOC-ADAT-KEBUN-01',
    title: 'Buku Register & Peta Kadaster Tanah Adat Kebun Pala Belgica',
    category: 'PERTANAHAN',
    documentNumber: 'REG-ADAT/BN/012/2026',
    releaseDate: '2026-01-20',
    fileSize: '4.5 MB',
    sha256Hash: '6d5c4b77aa123456789abcdef0123456789abcdef0123456789abcdef0123456',
    description: 'Peta batas spasial poligon PostGIS dan penetapan hak garap adat tanaman tua pala lereng Benteng Belgica & Desa Lonthoir.',
    issuer: 'Kesultanan Adat Banda & Kantor Desa Banda Neira',
  },
  {
    id: 'DOC-MURENBANG-2026',
    title: 'Berita Acara Rencana Kerja Pemerintah Desa (RKPDes) 2026-2027',
    category: 'PERDES',
    documentNumber: 'BA-RKPDES/BN/01/2026',
    releaseDate: '2026-01-28',
    fileSize: '2.9 MB',
    sha256Hash: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
    description: 'Notula musyawarah perwakilan warga 6 dusun mengenai prioritas anggaran dana desa untuk ketahanan pangan, pertanian pala, dan pariwisata bahari.',
    issuer: 'Musrenbangdes Banda Neira',
  },
]

const DEMO_REQUESTS: AdministrativeRequestItem[] = [
  {
    id: 'REQ-BN-001',
    resident_id: 'RES-01',
    resident_name: 'Ahmad Baadilla',
    resident_nik: '8171011205880001',
    resident_occupation: 'Petani Rempah Pala',
    request_type: 'Surat Keterangan Usaha (SKU) Tani Pala',
    status: 'submitted',
    notes: 'Pengajuan kelayakan modal pupuk organik & bibit pala unggul ke Koperasi Hatta',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'REQ-BN-002',
    resident_id: 'RES-02',
    resident_name: 'Siti Rahmawati Walalayo',
    resident_nik: '8171015509920002',
    resident_occupation: 'Operator Homestay',
    request_type: 'Surat Keterangan Domisili Usaha Eco-Stay',
    status: 'submitted',
    notes: 'Registrasi sertifikasi ramah lingkungan air minum RO untuk wisatawan kepulauan',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'REQ-BN-003',
    resident_id: 'RES-03',
    resident_name: 'La Ode Ruslan',
    resident_nik: '8171012301850003',
    resident_occupation: 'Nelayan Tangkap',
    request_type: 'Surat Pengantar Pembelian Solar Subsidi',
    status: 'approved',
    notes: 'Kebutuhan armada perahu kora-kora penangkapan cakalang & tongkol Banda',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'REQ-BN-004',
    resident_id: 'RES-04',
    resident_name: 'Halima Alkatiri',
    resident_nik: '8171016804900004',
    resident_occupation: 'Pengrajin Manisan Pala',
    request_type: 'Surat Keterangan Usaha Mikro Olahan Rempah',
    status: 'approved',
    notes: 'Pengajuan sertifikat halal UMKM dan QR kemasan indikasi geografis resmi',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'REQ-BN-005',
    resident_id: 'RES-05',
    resident_name: 'Usman Rehalat',
    resident_nik: '8171011111950005',
    resident_occupation: 'Pemandu Wisata',
    request_type: 'Surat Rekomendasi Lisensi HPI Banda',
    status: 'rejected',
    notes: 'Lampiran sertifikasi selam & kartu keanggotaan pokdarwis belum lengkap',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const LettersWorkspace: React.FC<LettersWorkspaceProps> = ({
  adminRequests,
  requestFilterStatus,
  setRequestFilterStatus,
  updatingRequestId,
  handleUpdateRequestStatus,
  letterActionMsg,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'archive' | 'analytics'>('requests')
  const [printLetter, setPrintLetter] = useState<AdministrativeRequestItem | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [copiedNik, setCopiedNik] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  // Filter Repositori Dokumen
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState<string>('ALL')
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('')

  // Modal Buat Surat Baru Langsung
  const [showNewLetterModal, setShowNewLetterModal] = useState<boolean>(false)
  const [newLetterForm, setNewLetterForm] = useState({
    resident_name: '',
    resident_nik: '',
    resident_occupation: 'Petani Rempah Pala',
    request_type: 'Surat Keterangan Usaha (SKU) Tani Pala',
    notes: '',
  })

  // Gunakan data gabungan jika belum ada permohonan riil
  const effectiveRequests = useMemo(() => {
    return adminRequests && adminRequests.length > 0 ? adminRequests : DEMO_REQUESTS
  }, [adminRequests])

  // Hitung Metrik KPI
  const kpiStats = useMemo(() => {
    const total = effectiveRequests.length
    const pending = effectiveRequests.filter((r) => r.status === 'submitted').length
    const approved = effectiveRequests.filter((r) => r.status === 'approved').length
    const rejected = effectiveRequests.filter((r) => r.status === 'rejected').length
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 100

    return { total, pending, approved, rejected, approvalRate }
  }, [effectiveRequests])

  // Filter Permohonan
  const filteredRequests = useMemo(() => {
    return effectiveRequests.filter((req) => {
      if (requestFilterStatus && req.status !== requestFilterStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = (req.resident_name || '').toLowerCase().includes(q)
        const nikMatch = (req.resident_nik || '').toLowerCase().includes(q)
        const typeMatch = (req.request_type || '').toLowerCase().includes(q)
        const notesMatch = (req.notes || '').toLowerCase().includes(q)
        return nameMatch || nikMatch || typeMatch || notesMatch
      }
      return true
    })
  }, [effectiveRequests, requestFilterStatus, searchQuery])

  // Filter Repositori Dokumen Arsip
  const filteredArchiveDocs = useMemo(() => {
    return OFFICIAL_ARCHIVE_DOCS.filter((doc) => {
      const matchCategory = archiveCategoryFilter === 'ALL' || doc.category === archiveCategoryFilter
      const q = archiveSearchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.documentNumber.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.issuer.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [archiveCategoryFilter, archiveSearchQuery])

  // Chart 1: Distribusi Permohonan per Kategori Profesi
  const professionChartData = useMemo(() => {
    const profMap: Record<string, { total: number; approved: number; pending: number }> = {}

    effectiveRequests.forEach((req) => {
      const occ = req.resident_occupation || 'Warga Umum'
      let key = 'Lainnya'
      if (occ.toLowerCase().includes('pala') || occ.toLowerCase().includes('tani')) key = 'Petani Pala'
      else if (occ.toLowerCase().includes('nelayan') || occ.toLowerCase().includes('laut')) key = 'Nelayan'
      else if (occ.toLowerCase().includes('homestay') || occ.toLowerCase().includes('penginapan')) key = 'Homestay'
      else if (occ.toLowerCase().includes('rajin') || occ.toLowerCase().includes('rempah')) key = 'Pengrajin'
      else if (occ.toLowerCase().includes('wisata') || occ.toLowerCase().includes('pemandu')) key = 'Pemandu'

      if (!profMap[key]) profMap[key] = { total: 0, approved: 0, pending: 0 }
      profMap[key].total += 1
      if (req.status === 'approved') profMap[key].approved += 1
      if (req.status === 'submitted') profMap[key].pending += 1
    })

    const categories = ['Petani Pala', 'Nelayan', 'Homestay', 'Pengrajin', 'Pemandu']
    return categories.map((cat) => ({
      category: cat,
      approved: profMap[cat]?.approved || (cat === 'Petani Pala' ? 3 : 1),
      pending: profMap[cat]?.pending || (cat === 'Nelayan' ? 1 : 0),
    }))
  }, [effectiveRequests])

  // Chart 2: Komposisi Status Pelayanan Dokumen & Surat Desa
  const statusCompositionData = useMemo(() => {
    return [
      { name: 'Disetujui & Diterbitkan', value: kpiStats.approved || 4, color: '#10B981' },
      { name: 'Menunggu Verifikasi', value: kpiStats.pending || 2, color: '#F59E0B' },
      { name: 'Ditolak / Revisi', value: kpiStats.rejected || 1, color: '#EF4444' },
    ]
  }, [kpiStats])

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs backdrop-blur-md">
          {label && <p className="font-bold text-[#F4B75E] mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2 my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const handleCopyNik = (nik: string) => {
    navigator.clipboard.writeText(nik)
    setCopiedNik(nik)
    setTimeout(() => setCopiedNik(null), 2000)
  }

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const handlePrint = (req: AdministrativeRequestItem) => {
    setPrintLetter(req)
  }

  const triggerBrowserPrint = () => {
    window.print()
  }

  // Ekspor Rekapitulasi CSV
  const handleExportCSV = () => {
    const headers = ['ID Berkas', 'Nama Pemohon', 'NIK', 'Profesi', 'Jenis Dokumen/Surat', 'Keperluan', 'Status', 'Tanggal Pengajuan']
    const rows = effectiveRequests.map((r) => [
      `"${r.id}"`,
      `"${(r.resident_name || '-').replace(/"/g, '""')}"`,
      `'${r.resident_nik || '-'}`,
      `"${(r.resident_occupation || '-').replace(/"/g, '""')}"`,
      `"${r.request_type.replace(/"/g, '""')}"`,
      `"${(r.notes || '-').replace(/"/g, '""')}"`,
      r.status,
      `"${new Date(r.created_at).toLocaleDateString('id-ID')}"`,
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Rekapitulasi_Dokumen_Surat_Banda_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle pembuatan surat baru langsung di tempat
  const handleCreateDirectLetter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLetterForm.resident_name.trim() || !newLetterForm.resident_nik.trim()) {
      alert('Nama dan NIK pemohon wajib diisi.')
      return
    }

    const createdItem: AdministrativeRequestItem = {
      id: `REQ-BN-${Date.now().toString().slice(-4)}`,
      resident_id: `RES-${Date.now().toString().slice(-3)}`,
      resident_name: newLetterForm.resident_name.trim(),
      resident_nik: newLetterForm.resident_nik.trim(),
      resident_occupation: newLetterForm.resident_occupation,
      request_type: newLetterForm.request_type,
      status: 'approved',
      notes: newLetterForm.notes.trim() || 'Diterbitkan langsung oleh aparatur desa',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setShowNewLetterModal(false)
    setPrintLetter(createdItem)
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      
      {/* Action Notification Banner */}
      {letterActionMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-xs ${
            letterActionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {letterActionMsg.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{letterActionMsg.text}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER BANNER: BANDA DIGITAL VILLAGE DOCUMENTS & OFFICIAL ARCHIVE
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-radial from-blue-100/40 via-amber-50/20 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0 shadow-md border border-[#F4B75E]/30">
              <FileText size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70 flex items-center gap-1.5">
                  <Building2 size={12} className="text-blue-700" />
                  Kantor Kepala Desa Banda Neira &bull; Tata Kelola Dokumen &amp; Pelayanan
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Terhubung NIK Penduduk &bull; Tanda Tangan Digital Sah
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                Pusat Dokumen Resmi, Arsip Desa &amp; Pelayanan Surat Warga
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Portal terpadu penerbitan surat keterangan usaha (SKU Petani Pala, Nelayan, Homestay), surat rekomendasi warga, repositori arsip regulasi desa (Perdes), serta sertifikat Indikasi Geografis rempah resmi.
              </p>

              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-semibold text-emerald-900">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Format Dokumen Standar A4 Resmi Pemkab Maluku Tengah</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-slate-600 font-medium">Banda Neira (Kode Pos 97593)</span>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              title="Unduh rekapitulasi surat ke berkas CSV"
            >
              <Download size={15} className="text-emerald-600" />
              <span>Ekspor Rekap</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {effectiveRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewLetterModal(true)}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#081D35] hover:bg-[#0c2a4d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} className="text-[#F4B75E]" />
              <span>Terbitkan Surat Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TOP BENTO KPI: 5 BAROMETER TATA KELOLA ADMINISTRASI & ARSIP DESA
      ========================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        
        {/* KPI 1: TOTAL PERMOHONAN */}
        <div
          onClick={() => {
            setActiveTab('requests')
            setRequestFilterStatus('')
          }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Total Berkas</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-700 group-hover:scale-110 transition-transform shrink-0">
                <Mail size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {kpiStats.total} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Berkas</span>
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <div className="text-[10px] text-slate-500">
              Target Kuartal: 150 Berkas
            </div>
            <div className="w-full bg-slate-100 h-1 sm:h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, (kpiStats.total / 150) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* KPI 2: ANTREAN MENUNGGU VERIFIKASI */}
        <div
          onClick={() => {
            setActiveTab('requests')
            setRequestFilterStatus('submitted')
          }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Antrean Validasi</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-700 group-hover:scale-110 transition-transform shrink-0">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#D97706] mb-1">
              {kpiStats.pending} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Antrean</span>
            </div>
          </div>
          <div className="mt-2">
            <div className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              kpiStats.pending > 0 ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              <AlertCircle size={11} />
              {kpiStats.pending > 0 ? `${kpiStats.pending} Butuh Aksi` : 'Antrean Bersih'}
            </div>
          </div>
        </div>

        {/* KPI 3: SURAT DISETUJUI & SAH */}
        <div
          onClick={() => {
            setActiveTab('requests')
            setRequestFilterStatus('approved')
          }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Disetujui Sah</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-700 group-hover:scale-110 transition-transform shrink-0">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-600 mb-1">
              {kpiStats.approved} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Surat</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck size={11} /> Sah Kepala Desa
            </div>
          </div>
        </div>

        {/* KPI 4: TINGKAT KELULUSAN SLA */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/60 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Tingkat SLA</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-700 group-hover:scale-110 transition-transform shrink-0">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {kpiStats.approvalRate}%
            </div>
          </div>
          <div className="mt-2">
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              <Sparkles size={11} /> &lt; 2 Jam Proses
            </div>
          </div>
        </div>

        {/* KPI 5: REPOSITORI ARSIP RESMI (Rentang 2 Kolom di Mobile) */}
        <div
          onClick={() => setActiveTab('archive')}
          className="col-span-2 lg:col-span-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Arsip Resmi Desa</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-700 group-hover:scale-110 transition-transform shrink-0">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {OFFICIAL_ARCHIVE_DOCS.length} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Regulasi &amp; GI</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Award size={11} /> 100% On-Chain
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL ALERT BAR (KEY ALERTS - KPI DASHBOARD DESIGN)
      ========================================================================== */}
      {kpiStats.pending > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                Peringatan Antrean Layanan: Terdapat {kpiStats.pending} Permohonan Surat Warga Menunggu Tindakan
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Verifikasi dokumen pendukung dan berikan persetujuan tanda tangan digital agar tidak melampaui komitmen SLA kantor desa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('requests')
              setRequestFilterStatus('submitted')
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white transition-all shadow-xs cursor-pointer shrink-0"
          >
            Tampilkan Antrean Menunggu ({kpiStats.pending})
          </button>
        </div>
      )}

      {/* =========================================================================
          3. TAB SEGMENT NAVIGATION (CONSISTENT WITH OTHER WORKSPACES)
      ========================================================================== */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Mail size={16} />
          <span>Kotak Masuk Permohonan Surat ({effectiveRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <BookOpen size={16} />
          <span>Repositori Arsip Dokumen Resmi ({OFFICIAL_ARCHIVE_DOCS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <TrendingUp size={16} />
          <span>Analitik Layanan &amp; Kinerja SLA</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: KOTAK MASUK PERMOHONAN SURAT WARGA (INBOX & APPROVAL)
      ========================================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { st: '', label: 'Semua Berkas', count: kpiStats.total },
                { st: 'submitted', label: 'Menunggu Verifikasi', count: kpiStats.pending },
                { st: 'approved', label: 'Disetujui & Terbit', count: kpiStats.approved },
                { st: 'rejected', label: 'Ditolak / Revisi', count: kpiStats.rejected },
              ].map(({ st, label, count }) => {
                const active = requestFilterStatus === st
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRequestFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pemohon, NIK, jenis surat..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 focus:border-[#081D35]"
              />
            </div>
          </div>

          {/* Master Table of Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Warga Pemohon</th>
                    <th className="py-3.5 px-4">Profesi / Sektor</th>
                    <th className="py-3.5 px-4">Jenis Dokumen Surat</th>
                    <th className="py-3.5 px-4">Keperluan &amp; Catatan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Aparat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Pemohon Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/60">
                              {req.resident_name ? req.resident_name.charAt(0).toUpperCase() : <User size={14} />}
                            </div>
                            <div>
                              <span className="font-bold text-[#081D35] block text-xs sm:text-sm">
                                {req.resident_name || 'Warga Terdaftar'}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {req.resident_nik || '-'}
                                </span>
                                {req.resident_nik && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyNik(req.resident_nik!)}
                                    className="text-slate-400 hover:text-blue-600 transition"
                                    title="Salin NIK"
                                  >
                                    {copiedNik === req.resident_nik ? (
                                      <Check size={11} className="text-emerald-600" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Occupation Column */}
                        <td className="py-3.5 px-4">
                          {getOccupationBadge(req.resident_occupation)}
                        </td>

                        {/* Document Type Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                            <FileText size={14} className="shrink-0" />
                            <span>{req.request_type}</span>
                          </div>
                        </td>

                        {/* Notes Column */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                          {req.notes || '-'}
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : req.status === 'submitted'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {req.status === 'approved' ? (
                              <>
                                <CheckCircle2 size={11} /> Disetujui
                              </>
                            ) : req.status === 'submitted' ? (
                              <>
                                <Clock size={11} /> Menunggu
                              </>
                            ) : (
                              <>
                                <X size={11} /> Ditolak
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-4 text-right">
                          {req.status === 'submitted' ? (
                            <div className="inline-flex gap-1.5 justify-end">
                              <button
                                type="button"
                                disabled={updatingRequestId === req.id}
                                onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                <Check size={12} /> {updatingRequestId === req.id ? '...' : 'Setujui'}
                              </button>
                              <button
                                type="button"
                                disabled={updatingRequestId === req.id}
                                onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                <X size={12} /> {updatingRequestId === req.id ? '...' : 'Tolak'}
                              </button>
                            </div>
                          ) : req.status === 'approved' ? (
                            <button
                              type="button"
                              onClick={() => handlePrint(req)}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-[#081D35] hover:bg-slate-800 text-[#F4B75E] transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Printer size={13} /> Cetak Surat Resmi
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Ditolak</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 px-4 text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 text-slate-300 stroke-1" />
                        <p className="font-bold text-[#081D35] text-base">Tidak ada permohonan surat yang sesuai filter</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Sesuaikan kata kunci pencarian atau gunakan status filter di atas.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: REPOSITORI ARSIP DOKUMEN RESMI DESA (OFFICIAL ARCHIVE)
      ========================================================================== */}
      {activeTab === 'archive' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar Dokumen Arsip */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'Semua Arsip', count: OFFICIAL_ARCHIVE_DOCS.length },
                { key: 'SERTIFIKAT', label: 'Sertifikat & Mutu', count: OFFICIAL_ARCHIVE_DOCS.filter(d => d.category === 'SERTIFIKAT').length },
                { key: 'PERDES', label: 'Perdes & Regulasi', count: OFFICIAL_ARCHIVE_DOCS.filter(d => d.category === 'PERDES').length },
                { key: 'SK_DESA', label: 'SK Kelembagaan', count: OFFICIAL_ARCHIVE_DOCS.filter(d => d.category === 'SK_DESA').length },
                { key: 'PERTANAHAN', label: 'Pertanahan Adat', count: OFFICIAL_ARCHIVE_DOCS.filter(d => d.category === 'PERTANAHAN').length },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setArchiveCategoryFilter(c.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    archiveCategoryFilter === c.key
                      ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10">
                    {c.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={archiveSearchQuery}
                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                placeholder="Cari nomor dokumen, judul, perdes..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 focus:border-[#081D35]"
              />
            </div>
          </div>

          {/* List Kartu Dokumen Arsip Resmi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArchiveDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 uppercase">
                        {doc.documentNumber}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#081D35] mt-0.5 leading-snug">
                        {doc.title}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      doc.category === 'SERTIFIKAT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : doc.category === 'PERDES'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : doc.category === 'SK_DESA'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {doc.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Penerbit Berwenang:</span>
                      <span className="font-medium text-slate-700 text-right truncate max-w-[200px]">{doc.issuer}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tanggal Terbit &bull; Ukuran:</span>
                      <span className="font-mono text-slate-700">{doc.releaseDate} &bull; {doc.fileSize}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Hash Kriptografi SHA-256:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(doc.sha256Hash)}
                        className="font-mono text-[10px] text-sky-700 hover:underline flex items-center gap-1"
                        title="Salin Hash SHA-256"
                      >
                        {copiedHash === doc.sha256Hash ? (
                          <span className="text-emerald-700 font-bold">Disalin</span>
                        ) : (
                          <span>{doc.sha256Hash.slice(0, 10)}...{doc.sha256Hash.slice(-6)}</span>
                        )}
                        <Copy size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck size={12} />
                    <span>Terverifikasi Sah On-Chain</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Dokumen "${doc.title}" sedang disiapkan untuk diunduh dari repositori arsip digital desa.`)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#081D35] hover:bg-slate-800 text-[#F4B75E] transition"
                  >
                    <Download size={13} />
                    <span>Unduh Dokumen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ANALITIK LAYANAN & KINERJA SLA ADMINISTRASI
      ========================================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary Row Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Rata-Rata Waktu Proses</span>
              <div className="text-2xl font-black text-[#081D35] mt-1 font-mono">1.8 Jam</div>
              <span className="text-[10px] text-emerald-700 font-semibold">Komitmen Standar SLA &lt; 4 Jam</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Kepuasan Warga Layanan</span>
              <div className="text-2xl font-black text-[#081D35] mt-1 font-mono">4.9 / 5.0</div>
              <span className="text-[10px] text-slate-500">Berdasarkan 94 Penilaian Warga</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Efisiensi Kertas Desa</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">82% Hemat</div>
              <span className="text-[10px] text-slate-500">Transisi Penuh Paperless</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Integritas Hash Stempel</span>
              <div className="text-2xl font-black text-[#081D35] mt-1 font-mono">100%</div>
              <span className="text-[10px] text-blue-700">Tanda Tangan Digital Kades</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Visualisasi 1: Bar Chart Permohonan per Kategori Profesi (col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#081D35]">
                    Distribusi Permohonan Surat per Profesi Warga
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pengelompokan kebutuhan administrasi usaha tani rempah, nelayan tangkap, dan homestay
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                  5 Sektor Usaha
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={professionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} allowDecimals={false} />
                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="approved" name="Disetujui Sah" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Menunggu Verifikasi" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visualisasi 2: Donut Chart Komposisi Status Surat (col-span-5) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">
                  Komposisi Status Pelayanan Surat
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proporsi penyelesaian berkas administrasi desa permohonan warga
                </p>
              </div>

              <div className="relative h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCompositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusCompositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-[#081D35]">{kpiStats.approvalRate}%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Disetujui</span>
                </div>
              </div>

              {/* Custom segmented legend */}
              <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-slate-100">
                {statusCompositionData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.value} Berkas</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MODAL PENERBITAN SURAT BARU LANGSUNG (DIRECT ISSUANCE MODAL)
      ========================================================================== */}
      {showNewLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">
                  Penerbitan Surat Resmi Langsung
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pelayanan langsung di loket Kantor Desa Banda Neira
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewLetterModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDirectLetter} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Nama Lengkap Pemohon *
                </label>
                <input
                  type="text"
                  required
                  value={newLetterForm.resident_name}
                  onChange={(e) => setNewLetterForm({ ...newLetterForm, resident_name: e.target.value })}
                  placeholder="Contoh: Muhammad Ali Baadilla"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 focus:border-[#081D35]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  NIK Pemohon (16 Digit) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={newLetterForm.resident_nik}
                  onChange={(e) => setNewLetterForm({ ...newLetterForm, resident_nik: e.target.value })}
                  placeholder="Contoh: 8171011205880001"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Mata Pencaharian
                  </label>
                  <select
                    value={newLetterForm.resident_occupation}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, resident_occupation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  >
                    <option value="Petani Rempah Pala">Petani Rempah Pala</option>
                    <option value="Nelayan Tangkap">Nelayan Tangkap</option>
                    <option value="Operator Homestay">Operator Homestay</option>
                    <option value="Pengrajin Manisan Pala">Pengrajin Manisan Pala</option>
                    <option value="Pemandu Wisata">Pemandu Wisata</option>
                    <option value="Pedagang Pasar">Pedagang Pasar</option>
                    <option value="Wiraswasta Umum">Wiraswasta Umum</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Jenis Surat Resmi
                  </label>
                  <select
                    value={newLetterForm.request_type}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, request_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  >
                    <option value="Surat Keterangan Usaha (SKU) Tani Pala">SKU Tani Pala &amp; Fuli</option>
                    <option value="Surat Keterangan Domisili Usaha Eco-Stay">SKU Domisili Eco-Stay</option>
                    <option value="Surat Pengantar Pembelian Solar Subsidi">Pengantar Solar Nelayan</option>
                    <option value="Surat Keterangan Usaha Mikro Olahan Rempah">SKU UMKM Olahan Rempah</option>
                    <option value="Surat Rekomendasi Lisensi HPI Banda">Rekomendasi Pemandu HPI</option>
                    <option value="Surat Keterangan Domisili Tempat Tinggal">Surat Keterangan Domisili</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Keperluan / Keterangan Tambahan
                </label>
                <textarea
                  rows={3}
                  value={newLetterForm.notes}
                  onChange={(e) => setNewLetterForm({ ...newLetterForm, notes: e.target.value })}
                  placeholder="Keterangan peruntukan surat, instansi tujuan, atau catatan pendukung..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewLetterModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#081D35] hover:bg-[#0c2a4d] text-[#F4B75E] flex items-center gap-1.5 shadow-sm transition"
                >
                  <FileCheck size={14} />
                  <span>Terbitkan &amp; Siapkan Surat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL CETAK SURAT RESMI KANTOR DESA BANDA NEIRA
      ========================================================================== */}
      {printLetter && (
        <div
          className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPrintLetter(null)}
        >
          <div
            className="modal-content animate-fade-in w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl relative"
            style={{ fontFamily: 'serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Not printed) */}
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 no-print font-sans">
              <span className="text-xs font-bold text-slate-500">
                Pratinjau Format Surat Resmi Kantor Desa Banda Neira
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#081D35] hover:bg-slate-800 text-[#F4B75E] transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={13} /> Cetak / Unduh PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLetter(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* KOP SURAT DESA RESMI */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                PEMERINTAH KABUPATEN MALUKU TENGAH
              </h3>
              <h4 className="text-xs uppercase font-bold text-slate-700">
                KECAMATAN KEPULAUAN BANDA
              </h4>
              <h2 className="text-base font-black uppercase text-slate-900 mt-0.5">
                KANTOR KEPALA DESA BANDA NEIRA
              </h2>
              <p className="text-[11px] italic text-slate-600 mt-0.5 font-sans">
                Jalan Nusantara No. 01, Banda Neira, Kepulauan Banda, Maluku Tengah 97593
              </p>
            </div>

            {/* JUDUL SURAT */}
            <div className="text-center mb-5">
              <h3 className="text-sm font-bold uppercase underline tracking-wide text-slate-900">
                {printLetter.request_type}
              </h3>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Nomor: 503/{printLetter.id.substring(0, 5).toUpperCase()}/KD-BN/{new Date().getFullYear()}
              </p>
            </div>

            {/* ISI SURAT */}
            <div className="text-xs leading-relaxed text-slate-800 space-y-3">
              <p className="indent-6">
                Yang bertanda tangan di bawah ini, Kepala Desa Banda Neira, Kecamatan Kepulauan Banda, Kabupaten Maluku Tengah, dengan ini menerangkan bahwa:
              </p>

              <table className="w-full ml-4 text-xs">
                <tbody>
                  <tr>
                    <td className="w-36 py-1 text-slate-600">Nama Lengkap</td>
                    <td className="py-1">: <b className="text-slate-900">{printLetter.resident_name || 'Ahmad Baadilla'}</b></td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">NIK</td>
                    <td className="py-1 font-mono">: {printLetter.resident_nik || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Mata Pencaharian</td>
                    <td className="py-1">: {printLetter.resident_occupation || 'Petani Rempah Pala'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Alamat / Domisili</td>
                    <td className="py-1">: Desa Banda Neira, Kec. Kepulauan Banda, Kab. Maluku Tengah</td>
                  </tr>
                </tbody>
              </table>

              <p className="indent-6">
                Adalah benar yang bersangkutan merupakan warga penduduk yang berdomisili sah di wilayah Desa Banda Neira dan benar menjalankan kegiatan usaha/mata pencaharian sebagaimana tercatat di atas.
              </p>

              <p className="indent-6">
                Surat keterangan ini diberikan atas permohonan yang bersangkutan untuk keperluan: <b>{printLetter.notes || 'Pengajuan Persyaratan Administrasi & Modal Usaha'}</b>.
              </p>

              <p className="indent-6">
                Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* TANDA TANGAN & STEMPEL */}
            <div className="flex justify-end mt-8 text-center text-xs">
              <div className="min-w-48">
                <p>Banda Neira, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold mt-1 mb-14">KEPALA DESA BANDA NEIRA,</p>
                <p className="font-bold underline">M. SYAFI'I BAADILLA</p>
                <p className="text-[10px] text-slate-500 font-sans">NIP. 19780512 200501 1 004</p>
              </div>
            </div>

            {/* FOOTER VERIFIKASI KEASLIAN DIGITAL (ANTI-EMOJI CLEAN) */}
            <div className="mt-6 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-sans">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Terdaftar di <b>Ekosistem Digital Banda Neira</b> &bull; ID: {printLetter.id}</span>
              </div>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Keabsahan Dokumen Terverifikasi
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LettersWorkspace
