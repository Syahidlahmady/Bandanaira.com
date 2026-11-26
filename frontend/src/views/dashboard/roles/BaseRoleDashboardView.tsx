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
  ChevronRight,
  Compass,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  FileText,
  QrCode,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import { RoleViewProps } from './types'

export interface BaseRoleDashboardViewProps extends RoleViewProps {
  extraSideCards?: React.ReactNode
  extraSideButtons?: React.ReactNode
  extraModals?: React.ReactNode
  extraMainContent?: React.ReactNode
}

/**
 * Komponen Dasbor Peran Terpadu Berstandar Mobile-First & Desktop Responsif
 * Menerapkan prinsip .agents/skills/mobile-design/SKILL.md & mobile-responsiveness:
 * - 2-Kolom mobile grid untuk kartu KPI (tidak menumpuk vertikal 1-kolom memanjang)
 * - Donut chart flex-col di mobile (donut di atas, legend 2-kolom rapi di bawah)
 * - Touch targets interaktif minimal 44x44px untuk kenyamanan jempol
 * - Responsive margins pada LineChart dan BarChart tanpa teks terpotong
 */
export const BaseRoleDashboardView: React.FC<BaseRoleDashboardViewProps> = ({
  profile,
  onNavigate,
  onOpenMarketplace,
  handleExportData,
  quickVerifyInput,
  setQuickVerifyInput,
  handleVerifySubmit,
  showModuleLaunchpad,
  setShowModuleLaunchpad,
  extraSideCards,
  extraSideButtons,
  extraModals,
  extraMainContent,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* ===================================================================
            KOLOM KIRI-TENGAH (AREA UTAMA ~75% LEBAR -> xl:col-span-9)
        ==================================================================== */}
        <div className="xl:col-span-9 flex flex-col gap-4 sm:gap-6">
          {/* -----------------------------------------------------------------
              BARIS 1: 4 KARTU KPI UTAMA (2-KOLOM MOBILE, 4-KOLOM DESKTOP)
          ------------------------------------------------------------------ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {profile.kpis.map((kpi, idx) => {
              const Icon = kpi.icon
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition overflow-hidden"
                >
                  <div
                    className="size-9 sm:size-12 rounded-lg sm:rounded-full text-white flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: kpi.color }}
                  >
                    <Icon className="size-4.5 sm:size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                      {kpi.title}
                    </span>
                    <p className="text-base sm:text-2xl font-black text-[#081D35] tracking-tight leading-tight mt-0.5 truncate">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 mt-0.5 sm:mt-1 truncate">
                      <span>▲</span>
                      <span className="truncate">{kpi.trend}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* -----------------------------------------------------------------
              BARIS 2: 2 GRAFIK ANALITIK UTAMA (MULTI-LINE & DONUT RESPONSIF)
          ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5">
            {/* KIRI (~60%): MULTI-LINE CHART ANALITIK ROLE */}
            <div className="lg:col-span-7 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {profile.lineChart.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5" style={{ color: profile.lineChart.series1Color }}>
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: profile.lineChart.series1Color }} />
                    <span className="truncate max-w-[140px] text-[11px] sm:text-xs">{profile.lineChart.series1Name}</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: profile.lineChart.series2Color }}>
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: profile.lineChart.series2Color }} />
                    <span className="truncate max-w-[140px] text-[11px] sm:text-xs">{profile.lineChart.series2Name}</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-48 sm:h-64 pt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profile.lineChart.data} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                    />
                    <YAxis
                      domain={profile.lineChart.yDomain}
                      ticks={profile.lineChart.yTicks}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      width={30}
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
                      dot={{ r: 2.5, fill: profile.lineChart.series1Color }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v2"
                      name={profile.lineChart.series2Name}
                      stroke={profile.lineChart.series2Color}
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: profile.lineChart.series2Color }}
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

            {/* KANAN (~40%): DONUT CHART KOMPOSISI ROLE (RESPONSIF MOBILE DENGAN LEGENDA 2-KOLOM) */}
            <div className="lg:col-span-5 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                  {profile.donutChart.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile.donutChart.subtitle}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 flex-1 pt-1 sm:pt-0">
                <div className="relative size-40 sm:size-48 shrink-0 flex items-center justify-center mx-auto sm:mx-0">
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
                        innerRadius={46}
                        outerRadius={68}
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
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[85px]">
                      {profile.donutChart.centerLabel}
                    </span>
                    <span className="text-sm sm:text-base font-black text-[#081D35] leading-tight">
                      {profile.donutChart.centerValue}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full flex-1 min-w-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {profile.donutChart.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 font-medium truncate text-[11px] sm:text-xs">{item.name}</span>
                      </div>
                      <span className="font-bold text-[#081D35] shrink-0 text-[11px] sm:text-xs">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              BARIS 3: 3 KARTU RINGKASAN LINTAS WORKSPACE SESUAI PERAN PENGGUNA
          ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
            {/* KARTU 1: PROGRESS BAR WORKSPACE TERKAIT */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 sm:mb-3 truncate">
                  {profile.workspace1.title}
                </h3>
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  {profile.workspace1.items.map((it) => (
                    <div key={it.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 font-semibold truncate text-[11px] sm:text-xs">
                          {it.id}. {it.name}
                        </span>
                        <span className="text-slate-500 font-bold text-[10px] sm:text-[11px] shrink-0 ml-1">
                          {it.stat}
                        </span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-100 overflow-hidden">
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
                className="mt-3 sm:mt-4 w-full min-h-[44px] py-2 px-3 rounded-xl border border-[#CBD5E1] text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#081D35] transition flex items-center justify-center shadow-2xs cursor-pointer"
              >
                {profile.workspace1.buttonText}
              </button>
            </div>

            {/* KARTU 2: PETA SEBARAN SPASIAL BANDA */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                  {profile.workspace2.title}
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate(profile.workspace2.targetTab)}
                  className="min-h-[36px] text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer px-1"
                >
                  <span>Buka Peta</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div
                onClick={() => onNavigate(profile.workspace2.targetTab)}
                className="my-2.5 sm:my-3 relative w-full h-36 sm:h-40 bg-gradient-to-br from-sky-50 via-slate-50 to-amber-50/30 rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between overflow-hidden cursor-pointer group"
                title="Klik untuk membuka Peta GIS Interaktif"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 400 240" className="w-full h-full max-h-36">
                    <path
                      d="M 120 170 Q 210 210 290 150 Q 250 140 180 150 Z"
                      fill="#081D35"
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
                  <div className="w-2.5 h-14 rounded-full bg-gradient-to-b from-[#081D35] via-[#2563EB] to-slate-200" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Rendah</span>
                </div>

                <div className="relative z-10 text-[10px] text-slate-600 bg-white/85 px-2 py-0.5 rounded backdrop-blur-xs self-start font-medium">
                  📍 {profile.workspace2.highlightText}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{profile.workspace2.subtext}</span>
                <span className="font-bold text-[#081D35] shrink-0 ml-1">GIS Terintegrasi</span>
              </div>
            </div>

            {/* KARTU 3: KONTRIBUSI OPERASIONAL & EKONOMI */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                  {profile.workspace3.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile.workspace3.subtitle}</p>

                <div className="flex items-end justify-between gap-2 mt-3 sm:mt-4">
                  <div>
                    <span className="text-2xl sm:text-4xl font-black text-[#081D35] tracking-tight block truncate">
                      {profile.workspace3.mainValue}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-600 mt-1">
                      <span>▲</span>
                      <span className="truncate">{profile.workspace3.trend}</span>
                    </div>
                  </div>

                  <div className="w-24 sm:w-28 h-16 sm:h-18 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profile.workspace3.bars} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between min-h-[44px]">
                <button
                  type="button"
                  onClick={() => onNavigate(profile.workspace3.targetTab)}
                  className="min-h-[44px] text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{profile.workspace3.buttonText}</span>
                  <ChevronRight size={13} />
                </button>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                  {profile.workspace3.badgeText}
                </span>
              </div>
            </div>
          </div>

          {extraMainContent}
        </div>

        {/* ===================================================================
            KOLOM KANAN (PANEL UTILITAS & AKSI CEPAT ~25% LEBAR -> xl:col-span-3)
        ==================================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-3.5 sm:gap-6">
          {/* KARTU ATAS: TRANSPARANSI DATA */}
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 pb-2.5 sm:pb-3 border-b border-slate-100">
              <div className="size-8 sm:size-9 rounded-xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#081D35] tracking-wider uppercase">
                  TRANSPARANSI DATA
                </h3>
                <span className="text-[10px] text-slate-500">Integritas Domain {profile.shortBadge}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {profile.transparencyPoints.map((pt, i) => {
                const Icon = pt.icon
                return (
                  <div key={i} className="flex items-start gap-2.5 sm:gap-3">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pt.bgColor}`}
                      style={{ color: pt.color }}
                    >
                      <Icon size={13} />
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
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-2.5 sm:gap-3">
            <div>
              <h3 className="text-xs font-black text-[#081D35] tracking-wider uppercase">
                UNDUH DATA TERBUKA
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 sm:mt-1 leading-snug">
                Akses dan ekspor data komoditas &amp; layanan untuk penelitian dan analisis.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleExportData && handleExportData('csv')}
                className="min-h-[48px] flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/50 transition group cursor-pointer shadow-2xs"
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
                className="min-h-[48px] flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition group cursor-pointer shadow-2xs"
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
                className="min-h-[48px] flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 transition group cursor-pointer shadow-2xs"
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
                className="min-h-[48px] flex flex-col items-center justify-center p-2 rounded-xl border border-sky-200 hover:border-sky-600 hover:bg-sky-50/50 transition group cursor-pointer shadow-2xs"
                title="Buka Dokumentasi REST API Swagger"
              >
                <ExternalLink size={18} className="text-slate-600 group-hover:text-sky-600 transition-colors" />
                <span className="text-[10px] font-black tracking-wider text-slate-700 group-hover:text-sky-600 mt-1">
                  API
                </span>
              </button>
            </div>
          </div>

          {/* KARTU PENDUKUNG: RADAR VERIFIKASI HASH BLOCKCHAIN */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-[#081D35] shrink-0" />
              <span className="text-xs font-bold text-[#081D35]">Verifikasi Batch Blockchain</span>
            </div>
            <form onSubmit={handleVerifySubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="BN-BTC-2026-001"
                value={quickVerifyInput}
                onChange={(e) => setQuickVerifyInput(e.target.value)}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#F4B75E]"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-[#0c2a4d] transition cursor-pointer shrink-0 flex items-center justify-center"
              >
                Cek
              </button>
            </form>
          </div>

          {/* TOMBOL PINTAS MARKETPLACE KOMODITAS */}
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-xs font-bold text-[#92540c] flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
          >
            <ShoppingBag size={15} className="text-[#D97706] shrink-0" />
            <span>Buka Marketplace Komoditas</span>
          </button>

          {/* KARTU / TOMBOL EKSTRA SPESIFIK ROLE (JIKA ADA) */}
          {extraSideButtons}
          {extraSideCards}

          {/* PINTASAN LAUNCHPAD RUANG KERJA TERPADU */}
          <button
            type="button"
            onClick={() => setShowModuleLaunchpad((prev: boolean) => !prev)}
            className="w-full min-h-[44px] py-2.5 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-[#081D35] flex items-center justify-between transition shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
              <Compass size={15} className="text-[#D97706] shrink-0" />
              <span className="truncate">Peluncur Ruang Kerja ({profile.shortBadge})</span>
            </span>
            <ChevronRight
              size={14}
              className={`shrink-0 transition-transform duration-200 ${showModuleLaunchpad ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* MODAL EKSTRA SPESIFIK ROLE (MISAL GANTI PIN MANDIRI WARGA) */}
      {extraModals}
    </>
  )
}

export default BaseRoleDashboardView
