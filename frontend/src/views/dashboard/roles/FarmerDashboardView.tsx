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
  DollarSign,
  ExternalLink,
  FileCheck,
  FileJson,
  FileSpreadsheet,
  FileText,
  MapPin,
  QrCode,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sprout,
} from 'lucide-react'
import { RoleDashboardProfile, RoleViewProps } from './types'

/**
 * Profil Data Konfigurasi: Petani Rempah Mandiri (farmer)
 * Pencatatan Panen, Grading Mutu Pala & Ketertelusuran On-Chain
 */
export const farmerProfile: RoleDashboardProfile = {
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
  }

/**
 * Tampilan Dasbor Mandiri: Petani Rempah Mandiri (farmer)
 */
export const FarmerDashboardView: React.FC<RoleViewProps> = ({
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
  const profile = propProfile || farmerProfile

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

export default FarmerDashboardView
