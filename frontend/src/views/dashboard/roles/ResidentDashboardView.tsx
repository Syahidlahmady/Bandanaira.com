import React from 'react'
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
  CheckCircle2,
  ChevronRight,
  Compass,
  Droplets,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  FileText,
  Mail,
  QrCode,
  Scale,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'

/**
 * Profil Data Konfigurasi: Warga Desa Kepulauan (resident)
 * Layanan Surat Mandiri, Kuota Air Bersih RO Harian, Tabungan Sampah & Transparansi Bansos
 */
export const residentProfile: RoleDashboardProfile = {
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
  }

/**
 * Tampilan Dasbor Mandiri: Warga Desa Kepulauan (resident)
 */
export const ResidentDashboardView: React.FC<RoleViewProps> = ({
  profile: propProfile,
  onNavigate,
  onOpenMarketplace,
  handleExportData,
  quickVerifyInput,
  setQuickVerifyInput,
  handleVerifySubmit,
  showModuleLaunchpad,
  setShowModuleLaunchpad,
}) => {
  const profile = propProfile || residentProfile

  return (
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
            BARIS 2: 2 GRAFIK ANALITIK UTAMA (MULTI-LINE & DONUT KHUSUS ROLE)
        ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* KIRI (~60%): MULTI-LINE CHART ANALITIK ROLE */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {profile.lineChart.title}
              </h3>
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

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[11px] text-slate-500 font-medium">{profile.donutChart.centerLabel}</span>
                  <span className="text-base font-black text-[#081D35] leading-tight">
                    {profile.donutChart.centerValue}
                  </span>
                </div>
              </div>

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

            <div
              onClick={() => onNavigate(profile.workspace2.targetTab)}
              className="my-3 relative w-full h-40 bg-gradient-to-br from-sky-50 via-slate-50 to-amber-50/30 rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between overflow-hidden cursor-pointer group"
              title="Klik untuk membuka Peta GIS Interaktif"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 400 240" className="w-full h-full max-h-36">
                  <path
                    d="M 120 170 Q 210 210 290 150 Q 250 140 180 150 Z"
                    fill="#0F2C59"
                    stroke="#081D35"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="205" cy="115" rx="22" ry="14" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
                  <circle cx="170" cy="105" r="16" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
                  <ellipse cx="320" cy="190" rx="15" ry="9" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
                  <ellipse cx="90" cy="95" rx="14" ry="8" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" />
                  <ellipse cx="50" cy="85" rx="12" ry="7" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />

                  <text x="205" y="118" fontSize="8" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                    Neira
                  </text>
                  <text x="170" y="108" fontSize="7" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                    Volcano
                  </text>
                </svg>
              </div>

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
        {/* KARTU ATAS: TRANSPARANSI DATA */}
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

        {/* KARTU BAWAH: UNDUH DATA TERBUKA */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-black text-[#081D35] tracking-wider uppercase">
              UNDUH DATA TERBUKA
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Akses dan ekspor data komoditas &amp; layanan untuk penelitian dan analisis.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleExportData && handleExportData('csv')}
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
              onClick={() => handleExportData && handleExportData('xlsx')}
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
              onClick={() => handleExportData && handleExportData('json')}
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
              onClick={() => handleExportData && handleExportData('api')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 hover:border-purple-600 hover:bg-purple-50/50 transition group cursor-pointer shadow-2xs"
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
          onClick={() => setShowModuleLaunchpad((prev: boolean) => !prev)}
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
  )
}

export default ResidentDashboardView
