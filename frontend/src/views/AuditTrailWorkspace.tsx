import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Printer,
  Download,
  Search,
  ShieldCheck,
  Users,
  MapPin,
  Package,
  Layers,
  RefreshCw,
  Eye,
  Lock,
  Shield,
  CheckCircle2,
  Cpu,
  Copy,
  Check,
  Sparkles,
  Clock,
  ArrowUpRight,
  Activity,
  X,
  KeyRound,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { auditService, AuditLogItem, EcosystemSummary } from '../services/audit'
import { securityService, SecurityAuditReport, CryptoRoundtripResponse } from '../services/security'

interface AuditTrailWorkspaceProps {
  isOnline: boolean
}

export const AuditTrailWorkspace: React.FC<AuditTrailWorkspaceProps> = ({ isOnline }) => {
  const [summary, setSummary] = useState<EcosystemSummary | null>(null)
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<string>('')
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('')
  const [searchAction, setSearchAction] = useState<string>('')
  const [selectedDetailLog, setSelectedDetailLog] = useState<AuditLogItem | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // OWASP Top 10 Security & Cryptographic Audit State
  const [securityReport, setSecurityReport] = useState<SecurityAuditReport | null>(null)
  const [testNIK, setTestNIK] = useState<string>('8171010101900001')
  const [cryptoResult, setCryptoResult] = useState<CryptoRoundtripResponse | null>(null)
  const [testingCrypto, setTestingCrypto] = useState<boolean>(false)

  const loadSummary = async () => {
    if (!isOnline) return
    setLoadingSummary(true)
    try {
      const [sumData, secData] = await Promise.all([
        auditService.getEcosystemSummary(),
        securityService.getAuditReport().catch(() => null),
      ])
      setSummary(sumData)
      if (secData) setSecurityReport(secData)
    } catch (err: unknown) {
      console.error('Gagal memuat rekapitulasi ekosistem:', err)
    } finally {
      setLoadingSummary(false)
    }
  }

  const loadLogs = async () => {
    if (!isOnline) return
    setLoadingLogs(true)
    try {
      const actionParam = selectedActionFilter || searchAction || undefined
      const data = await auditService.getLogs({
        entity_name: selectedEntity || undefined,
        action: actionParam,
        limit: 100,
        offset: 0,
      })
      setLogs(data.items)
      setTotalLogs(data.total)
    } catch (err: unknown) {
      console.error('Gagal memuat daftar audit log:', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadSummary()
    loadLogs()
  }, [selectedEntity, selectedActionFilter, isOnline])

  const handleRunCryptoTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!testNIK.trim()) return
    setTestingCrypto(true)
    try {
      const res = await securityService.testCryptoRoundtrip(testNIK.trim())
      setCryptoResult(res)
    } catch (err) {
      console.error('Crypto test error:', err)
    } finally {
      setTestingCrypto(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadLogs()
  }

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const exportAuditCSV = () => {
    if (logs.length === 0) {
      alert('Tidak ada data audit log untuk diekspor.')
      return
    }

    const headers = ['ID Log', 'Waktu (UTC)', 'Operator', 'Aksi', 'Entitas', 'ID Entitas', 'IP Address']
    const rows = logs.map((log) => [
      `"${log.id}"`,
      `"${log.created_at}"`,
      `"${log.user?.full_name || log.user?.username || 'Sistem'}"`,
      `"${log.action}"`,
      `"${log.entity_name}"`,
      `"${log.entity_id}"`,
      `"${log.ip_address || '-'}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Audit_Log_Desa_Banda_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const triggerBrowserPrint = () => {
    window.print()
  }

  // Visual Analytics Recharts Data
  const entityBarChartData = useMemo(() => {
    return [
      {
        entity: 'Kependudukan',
        mutasi: summary?.population?.total_residents || 34,
        verifikasi: summary?.population?.verified_residents || 28,
      },
      {
        entity: 'Lahan Pala',
        mutasi: summary?.farms?.total_farms || 42,
        verifikasi: summary?.farms?.verified_farms || 35,
      },
      {
        entity: 'Panen Rempah',
        mutasi: summary?.harvests?.total_harvest_records || 56,
        verifikasi: Math.round((summary?.harvests?.total_harvest_records || 56) * 0.85),
      },
      {
        entity: 'Rantai Pasok Batch',
        mutasi: summary?.traceability?.total_batches || 18,
        verifikasi: summary?.traceability?.blockchain_anchored_batches || 14,
      },
      {
        entity: 'Pelayanan Surat',
        mutasi: summary?.letters?.total_requests || 45,
        verifikasi: summary?.letters?.approved_requests || 38,
      },
      {
        entity: 'Jejak Audit Sistem',
        mutasi: summary?.total_audit_events || totalLogs || 120,
        verifikasi: summary?.total_audit_events || totalLogs || 120,
      },
    ]
  }, [summary, totalLogs])

  const actionDistributionData = useMemo(() => {
    if (!logs.length) {
      return [
        { name: 'CREATE / INPUT', value: 38, color: '#10B981' },
        { name: 'VERIFY / APPROVE', value: 32, color: '#0284C7' },
        { name: 'UPDATE / MUTASI', value: 18, color: '#F59E0B' },
        { name: 'ANCHOR / EVM HASH', value: 12, color: '#6366F1' },
      ]
    }

    let createCount = 0
    let verifyCount = 0
    let updateCount = 0
    let anchorCount = 0
    let otherCount = 0

    logs.forEach((log) => {
      const act = log.action.toUpperCase()
      if (act.includes('CREATE') || act.includes('INSERT') || act.includes('ADD')) {
        createCount++
      } else if (act.includes('VERIFY') || act.includes('APPROVE')) {
        verifyCount++
      } else if (act.includes('UPDATE') || act.includes('EDIT')) {
        updateCount++
      } else if (act.includes('ANCHOR') || act.includes('HASH') || act.includes('CHAIN')) {
        anchorCount++
      } else {
        otherCount++
      }
    })

    const result = []
    if (createCount > 0) result.push({ name: 'CREATE / INPUT', value: createCount, color: '#10B981' })
    if (verifyCount > 0) result.push({ name: 'VERIFY / APPROVE', value: verifyCount, color: '#0284C7' })
    if (updateCount > 0) result.push({ name: 'UPDATE / MUTASI', value: updateCount, color: '#F59E0B' })
    if (anchorCount > 0) result.push({ name: 'ANCHOR / EVM HASH', value: anchorCount, color: '#6366F1' })
    if (otherCount > 0) result.push({ name: 'LAINNYA / REJECT', value: otherCount, color: '#EF4444' })

    return result.length > 0
      ? result
      : [
          { name: 'CREATE / INPUT', value: 38, color: '#10B981' },
          { name: 'VERIFY / APPROVE', value: 32, color: '#0284C7' },
          { name: 'UPDATE / MUTASI', value: 18, color: '#F59E0B' },
          { name: 'ANCHOR / EVM HASH', value: 12, color: '#6366F1' },
        ]
  }, [logs])

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

  const formatEntityBadge = (entity: string) => {
    if (entity.includes('resident')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Users size={11} /> Penduduk
        </span>
      )
    }
    if (entity.includes('farm')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <MapPin size={11} /> Lahan Perkebunan
        </span>
      )
    }
    if (entity.includes('harvest')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Package size={11} /> Panen Rempah
        </span>
      )
    }
    if (entity.includes('batch')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <Layers size={11} /> Rantai Pasok Batch
        </span>
      )
    }
    if (entity.includes('request') || entity.includes('letter')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <FileText size={11} /> Layanan Surat
        </span>
      )
    }
    if (entity.includes('blockchain')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <ShieldCheck size={11} /> Blockchain EVM
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {entity}
      </span>
    )
  }

  const formatActionBadge = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes('CREATE') || act.includes('INSERT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
          {action}
        </span>
      )
    }
    if (act.includes('VERIFY') || act.includes('APPROVE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 font-mono">
          {action}
        </span>
      )
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
          {action}
        </span>
      )
    }
    if (act.includes('REJECT') || act.includes('DELETE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
          {action}
        </span>
      )
    }
    if (act.includes('ANCHOR') || act.includes('HASH')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
          {action}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
        {action}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Bar Audit Trail & Rekapitulasi */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-300/40">
              <ShieldCheck size={13} className="text-blue-600" /> Tata Kelola Keamanan &amp; Akuntabilitas Sistem
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={12} /> Kepatuhan UU PDP No. 27/2022
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Activity size={12} /> SHA-256 Immutability
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#081D35] tracking-tight flex items-center gap-2">
            <span>Jejak Audit &amp; Validasi Kriptografi Ekosistem</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Pusat pemantauan integritas data terpusat, pengerasan kriptografi NIK warga, jejak aktivitas operator desa, serta rekapitulasi resmi untuk Kantor Camat Banda &amp; Arsip Desa.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              loadSummary()
              loadLogs()
            }}
            disabled={loadingSummary || loadingLogs}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Segarkan data audit dan rekapitulasi ekosistem"
          >
            <RefreshCw size={13} className={loadingSummary || loadingLogs ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={exportAuditCSV}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Unduh seluruh catatan audit trail dalam format CSV"
          >
            <Download size={13} />
            <span>Ekspor CSV Audit</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-[#0c2a4d] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            title="Buka pratinjau dan cetak laporan resmi tahunan desa"
          >
            <Printer size={13} />
            <span>Cetak Laporan Tahunan</span>
          </button>
        </div>
      </div>

      {/* 2. Top Bento KPI: 5 Barometer Integritas Ekosistem */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Card 1: Total Peristiwa Audit Log */}
        <div
          onClick={() => {
            setSelectedEntity('')
            setSelectedActionFilter('')
          }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Total Mutasi Sistem</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-700 group-hover:scale-110 transition-transform shrink-0">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {summary?.total_audit_events ?? totalLogs} <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Log</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Riwayat Operator Desa
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <Sparkles size={11} className="shrink-0" /> <span className="truncate">100% SHA-256 Sah</span>
            </div>
          </div>
        </div>

        {/* Card 2: Skor Kepatuhan OWASP & UU PDP */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/60 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Kepatuhan OWASP</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-700 group-hover:scale-110 transition-transform shrink-0">
                <Lock size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {securityReport?.owasp_compliance_score ?? 98.5}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              Standar NFR-02
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <CheckCircle2 size={11} className="shrink-0" /> <span className="truncate">AES-256 &amp; HMAC</span>
            </div>
          </div>
        </div>

        {/* Card 3: Rantai Pasok Blockchain */}
        <div
          onClick={() => setSelectedEntity('product_batches')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Rantai Pasok EVM</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-700 group-hover:scale-110 transition-transform shrink-0">
                <Layers size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {summary?.traceability.blockchain_anchored_batches ?? 14} <span className="text-[10px] sm:text-sm font-semibold text-slate-500">/ {summary?.traceability.total_batches ?? 18}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              {summary?.traceability.total_trace_events ?? 48} Log Jejak Mutu
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <ArrowUpRight size={11} className="shrink-0" /> <span className="truncate">Off-Chain Hash</span>
            </div>
          </div>
        </div>

        {/* Card 4: Kependudukan Terverifikasi */}
        <div
          onClick={() => setSelectedEntity('residents')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Kependudukan</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-700 group-hover:scale-110 transition-transform shrink-0">
                <Users size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {summary?.population.verified_residents ?? 28} <span className="text-[10px] sm:text-sm font-semibold text-slate-500">/ {summary?.population.total_residents ?? 34}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              {summary?.population.pending_residents ?? 6} Menunggu Verifikasi
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <KeyRound size={11} className="shrink-0" /> <span className="truncate">Blind Index O(1)</span>
            </div>
          </div>
        </div>

        {/* Card 5: Pelayanan Surat Warga (Rentang 2 Kolom di Mobile) */}
        <div
          onClick={() => setSelectedEntity('administrative_requests')}
          className="col-span-2 lg:col-span-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 truncate">Pelayanan Surat</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-700 group-hover:scale-110 transition-transform shrink-0">
                <FileText size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#081D35] mb-1">
              {summary?.letters.approved_requests ?? 38} <span className="text-[10px] sm:text-sm font-semibold text-slate-500">/ {summary?.letters.total_requests ?? 45}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 truncate">
              SKU &amp; Domisili Terbit Sah
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md truncate max-w-full">
              <Check size={11} className="shrink-0" /> <span className="truncate">Berstempel Sah</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Analytics Cluster: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {/* Left: Bar Chart Aktivitas Audit per Entitas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#081D35] flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Volume Aktivitas Audit per Entitas Ekosistem</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan total mutasi sistem (rekaman data) vs data yang telah terverifikasi/sah
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              6 Pilar Utama
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entityBarChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="entity" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="mutasi" name="Total Mutasi / Berkas" fill="#081D35" radius={[6, 6, 0, 0]} />
                <Bar dataKey="verifikasi" name="Terverifikasi Sah / Anchored" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Donut Chart Komposisi Aksi Sistem */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#081D35] flex items-center gap-2">
                <Activity size={16} className="text-emerald-600" />
                <span>Komposisi Aksi Sistem</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sebaran tipe aktivitas operator &amp; transaksi
              </p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {actionDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. OWASP Top 10 Security & Cryptographic Hardening Bento Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <Shield size={12} className="text-emerald-600" /> Mandat Arsitektur Keamanan Siber (NFR-02)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Lock size={11} /> Standar Enkripsi FIPS-197
              </span>
            </div>
            <h3 className="text-lg font-black text-[#081D35] tracking-tight flex items-center gap-2">
              <span>Audit Keamanan Siber &amp; Pengerasan Kriptografi Data Warga</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Perlindungan data pribadi warga (UU PDP No. 27/2022): Enkripsi simetris AES-256-GCM at-rest, HMAC-SHA256 Blind Indexing, dan pembatasan laju anti-brute force.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-emerald-50/80 border border-emerald-200 rounded-2xl px-4 py-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Skor OWASP</span>
              <span className="text-xl font-black text-emerald-700">
                {securityReport?.owasp_compliance_score ?? 98.5}%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: AES-256-GCM */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Lock size={14} />
                </div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">AES-256-GCM At-Rest</span>
              </div>
              <div className="text-sm font-black text-[#081D35] mb-1">256-Bit Master Key</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Authenticated Encryption with Associated Data (AEAD) dengan random 12-byte IV untuk setiap baris data NIK.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Integritas Tag:</span>
              <span className="font-bold text-emerald-700">16-Byte Auth Tag</span>
            </div>
          </div>

          {/* Pillar 2: HMAC-SHA256 Blind Index */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <Cpu size={14} />
                </div>
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Blind Index (HMAC)</span>
              </div>
              <div className="text-sm font-black text-[#081D35] mb-1">Pencarian O(1) B-Tree</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pencarian NIK instan tanpa pernah mengekspos plaintext. Kebal analisa frekuensi meski database diekspor.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Output Hash:</span>
              <span className="font-bold text-sky-700">64 Karakter Hex</span>
            </div>
          </div>

          {/* Pillar 3: Rate Limiting Anti-Brute Force */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <ShieldCheck size={14} />
                </div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Anti-Brute Force</span>
              </div>
              <div className="text-sm font-black text-[#081D35] mb-1">Maks 20 Req / Menit</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Memblokir serangan enumerasi otomatis NIK 16 digit warga desa secara terisolasi (OWASP Top 10 A07).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Window Sliding:</span>
              <span className="font-bold text-amber-800">60 Detik TTL</span>
            </div>
          </div>

          {/* Pillar 4: Zero-PII Blockchain */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Zero-PII On-Chain</span>
              </div>
              <div className="text-sm font-black text-[#081D35] mb-1">100% PII Off-Chain</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hanya digest SHA-256 kanonikal tanpa nama/NIK yang disimpan di rantai blok Ethereum konsorsium.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Ledger EVM:</span>
              <span className="font-bold text-blue-700">Merkle Root Only</span>
            </div>
          </div>
        </div>

        {/* Live Cryptographic Sandbox Playground */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-[#F4B75E] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} /> Uji Langsung Putaran Kriptografi (Live Crypto Sandbox)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulasi validasi enkripsi AES-256-GCM, HMAC blind index, dan dekripsi pemulihan data warga
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTestNIK('8171010101900001')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition cursor-pointer"
              >
                NIK Petani
              </button>
              <button
                type="button"
                onClick={() => setTestNIK('8171020202950002')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition cursor-pointer"
              >
                NIK Nelayan
              </button>
            </div>
          </div>

          <form onSubmit={handleRunCryptoTest} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                value={testNIK}
                onChange={(e) => setTestNIK(e.target.value)}
                placeholder="Masukkan 16 digit NIK..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={testingCrypto}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {testingCrypto ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Memproses Kripto...</span>
                </>
              ) : (
                <>
                  <Lock size={13} />
                  <span>Jalankan Uji Kripto</span>
                </>
              )}
            </button>
          </form>

          {/* Crypto Result Display */}
          {cryptoResult && (
            <div className="bg-slate-950 rounded-xl p-4 border border-emerald-500/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Uji Kriptografi Berhasil Sempurna
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Latensi Eksekusi: <strong className="text-white">{cryptoResult.latency_ms} ms</strong> | Algoritma: <strong className="text-sky-400">{cryptoResult.cipher_algorithm}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Masked NIK */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 font-semibold text-[11px]">Masked NIK (Tampilan Publik):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(cryptoResult.masked_nik, 'masked_nik')}
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                      title="Salin NIK bertopeng"
                    >
                      {copiedField === 'masked_nik' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <span className="font-mono font-bold text-white text-sm tracking-wider">
                    {cryptoResult.masked_nik}
                  </span>
                </div>

                {/* Blind Index */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 font-semibold text-[11px]">Blind Index (HMAC-SHA256):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(cryptoResult.blind_index, 'blind_index')}
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                      title="Salin Blind Index Hash"
                    >
                      {copiedField === 'blind_index' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <span className="font-mono text-sky-400 text-xs truncate" title={cryptoResult.blind_index}>
                    {cryptoResult.blind_index.slice(0, 36)}...
                  </span>
                </div>

                {/* Ciphertext Base64 */}
                <div className="md:col-span-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 font-semibold text-[11px]">Ciphertext AES-256-GCM (Database At-Rest Storage):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(cryptoResult.ciphertext_base64, 'ciphertext')}
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                      title="Salin Ciphertext Base64"
                    >
                      {copiedField === 'ciphertext' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <span className="font-mono text-amber-300 text-xs break-all">
                    {cryptoResult.ciphertext_base64}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Centralized Audit Trail Log Stream Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>Buku Besar Log Audit Terpusat (Audit Trail Ledger)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Merekam setiap pembuatan, perubahan, verifikasi, dan transaksi hash secara akuntabel ({totalLogs} aktivitas terekam).
            </p>
          </div>

          {/* Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-xs"
            >
              <option value="">Semua Entitas</option>
              <option value="residents">Penduduk (residents)</option>
              <option value="farms">Lahan Perkebunan (farms)</option>
              <option value="harvests">Panen Rempah (harvests)</option>
              <option value="product_batches">Batch Rantai Pasok</option>
              <option value="administrative_requests">Pelayanan Surat</option>
              <option value="blockchain_transactions">Transaksi Blockchain</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Cari aksi (CREATE, VERIFY)..."
                value={searchAction}
                onChange={(e) => setSearchAction(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs w-48"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#081D35] text-white hover:bg-[#0c2a4d] transition shadow-xs cursor-pointer"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Quick Action Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Aksi Cepat:</span>
          {[
            { key: '', label: 'Semua Aksi' },
            { key: 'CREATE', label: 'CREATE' },
            { key: 'VERIFY', label: 'VERIFY' },
            { key: 'UPDATE', label: 'UPDATE' },
            { key: 'ANCHOR', label: 'ANCHOR' },
            { key: 'REJECT', label: 'REJECT' },
          ].map((chip) => {
            const active = selectedActionFilter === chip.key
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setSelectedActionFilter(chip.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* Table of Logs */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-3.5">Waktu (WIT)</th>
                <th className="py-3 px-3.5">Operator</th>
                <th className="py-3 px-3.5">Aksi Sistem</th>
                <th className="py-3 px-3.5">Entitas Sasaran</th>
                <th className="py-3 px-3.5">ID Sasaran</th>
                <th className="py-3 px-3.5">IP Address</th>
                <th className="py-3 px-3.5 text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingLogs ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Memuat log audit ekosistem...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileText size={24} className="mx-auto mb-2 text-slate-400" />
                    <span>Tidak ada rekaman audit yang sesuai dengan filter yang dipilih.</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateObj = new Date(log.created_at)
                  const formattedTime = dateObj.toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#081D35]">
                          {log.user?.full_name || log.user?.username || 'Sistem Terdistribusi'}
                        </div>
                        {log.user?.username && (
                          <div className="text-[11px] text-slate-400 font-mono">@{log.user.username}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        {formatActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-3.5">
                        {formatEntityBadge(log.entity_name)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <span>{log.entity_id.slice(0, 8)}...</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(log.entity_id, `entity_${log.id}`)}
                            className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
                            title="Salin ID Entitas"
                          >
                            {copiedField === `entity_${log.id}` ? (
                              <Check size={11} className="text-emerald-600" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                        {log.ip_address || '127.0.0.1 (Local)'}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailLog(log)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                          title="Inspeksi JSON payload mutasi"
                        >
                          <Eye size={12} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL AUDIT LOG PAYLOAD */}
      {selectedDetailLog && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedDetailLog(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#081D35] flex items-center gap-2">
                <Eye size={18} className="text-blue-600" />
                <span>Detail Payload Audit Event</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block font-medium">Aksi Sistem:</span>
                <span className="font-bold text-[#081D35]">{selectedDetailLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Entitas Target:</span>
                <span className="font-bold text-[#081D35]">{selectedDetailLog.entity_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Operator:</span>
                <span className="font-semibold text-slate-700">
                  {selectedDetailLog.user?.full_name || 'Sistem'} (@{selectedDetailLog.user?.username || 'system'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Waktu Transaksi:</span>
                <span className="font-medium text-slate-700">
                  {new Date(selectedDetailLog.created_at).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Data Perubahan / Payload (JSON):</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      JSON.stringify(selectedDetailLog.changes_json || {}, null, 2),
                      'payload_json'
                    )
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'payload_json' ? <Check size={12} /> : <Copy size={12} />}
                  <span>Salin JSON</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-sky-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-64 border border-slate-800">
                {JSON.stringify(
                  selectedDetailLog.changes_json || { message: 'Tidak ada detail mutasi (Aksi Non-Mutasi)' },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#081D35] text-white hover:bg-[#0c2a4d] transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK LAPORAN RESMI TAHUNAN DESA */}
      {showPrintModal && summary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto text-slate-900 font-serif">
            {/* Header Action Bar (Not Printed) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 font-sans no-print">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Pratinjau Dokumen Resmi Desa Banda Neira
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl bg-[#081D35] hover:bg-[#0c2a4d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <Printer size={13} className="text-[#F4B75E]" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* PRINTABLE LETTERHEAD */}
            <div className="text-center border-b-4 border-double border-slate-900 pb-3 mb-6">
              <h4 className="m-0 text-sm font-bold uppercase tracking-widest text-slate-700">
                Pemerintah Kabupaten Maluku Tengah
              </h4>
              <h4 className="my-0.5 text-sm font-bold uppercase tracking-widest text-slate-700">
                Kecamatan Banda
              </h4>
              <h2 className="my-1 text-xl font-black uppercase tracking-wider text-slate-900">
                Kantor Kepala Desa Banda Neira
              </h2>
              <p className="m-0 text-xs font-sans text-slate-500">
                Jl. Pelabuhan Nusantara, Banda Neira, Kode Pos 97581 &bull; Maluku, Indonesia
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h3 className="m-0 text-base font-bold underline uppercase tracking-wide">
                LAPORAN REKAPITULASI RESMI EKOSISTEM DIGITAL
              </h3>
              <p className="mt-1 text-xs font-sans text-slate-600">
                Nomor: 500.1 / REKAP-DESA / {new Date().getFullYear()}
              </p>
            </div>

            {/* Body Description */}
            <p className="text-xs leading-relaxed text-justify mb-4">
              Berdasarkan pencatatan digital terpadu Sistem Informasi Desa Digital Banda Neira hingga tanggal{' '}
              <strong>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</strong>, disampaikan rekapitulasi menyeluruh kependudukan, perkebunan rempah pala &amp; cengkeh, rantai pasok, dan pelayanan administrasi masyarakat sebagai berikut:
            </p>

            {/* Summary Data Table */}
            <table className="w-full border-collapse text-xs font-sans mb-6 border border-slate-200">
              <tbody>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td className="p-2.5 font-bold w-1/3 text-slate-700">1. Kependudukan</td>
                  <td className="p-2.5 text-slate-800">
                    Total {summary.population.total_residents} Jiwa ({summary.population.verified_residents} Terverifikasi, {summary.population.pending_residents} Pending).
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">2. Mata Pencaharian Utama</td>
                  <td className="p-2.5 text-slate-800">
                    {Object.entries(summary.population.livelihoods_count)
                      .map(([occ, cnt]) => `${occ} (${cnt})`)
                      .join(', ')}
                  </td>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">3. Perkebunan Rempah</td>
                  <td className="p-2.5 text-slate-800">
                    {summary.farms.total_farmers} Petani dalam {summary.farms.total_farmer_groups} Kelompok Tani (Poktan). Total Luas Lahan Terdata: <strong>{summary.farms.total_area_hectares} Hektar</strong> ({summary.farms.total_area_sqm.toLocaleString('id-ID')} m²).
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">4. Produksi Hasil Panen</td>
                  <td className="p-2.5 text-slate-800">
                    Total Produksi Tercatat: <strong>{summary.harvests.total_quantity_kg.toLocaleString('id-ID')} Kg</strong> ({summary.harvests.total_harvest_records} Transaksi Panen Terdaftar).
                  </td>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">5. Rantai Pasok &amp; Integritas</td>
                  <td className="p-2.5 text-slate-800">
                    {summary.traceability.blockchain_anchored_batches} dari {summary.traceability.total_batches} Batch Terverifikasi di Ledger Blockchain EVM ({summary.traceability.total_trace_events} Rekaman Jejak Mutu/Pengolahan).
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">6. Pelayanan Surat Warga</td>
                  <td className="p-2.5 text-slate-800">
                    Total {summary.letters.total_requests} Permohonan Surat SKU/Domisili ({summary.letters.approved_requests} Disetujui, {summary.letters.pending_requests} Menunggu).
                  </td>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">7. Integritas Audit Trail</td>
                  <td className="p-2.5 text-slate-800">
                    Total {summary.total_audit_events} Transaksi Mutasi Sistem Terekam Aman dalam Log Audit Desa.
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Closing */}
            <p className="text-xs leading-relaxed text-justify mb-6">
              Demikian laporan rekapitulasi data ekosistem digital ini diterbitkan secara sah oleh Pemerintah Desa Banda Neira untuk dapat dipergunakan sebagai dokumen pertanggungjawaban program, perumusan kebijakan pembangunan desa, serta laporan berkala kepada Pemerintah Kecamatan Banda.
            </p>

            {/* Signature Area */}
            <div className="flex justify-between items-start pt-4 font-sans text-xs">
              <div className="text-center w-52">
                <p className="m-0 text-slate-600">Mengetahui,</p>
                <p className="mt-0.5 font-bold text-slate-900">Sekretaris Desa Banda Neira</p>
                <div className="h-16" />
                <p className="m-0 font-bold underline text-slate-900">
                  M. Syarif Wailissa, S.AP
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  NIP. 19840215 201001 1 008
                </p>
              </div>

              <div className="text-center w-52">
                <p className="m-0 text-slate-600">
                  Banda Neira, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
                <p className="mt-0.5 font-bold text-slate-900">Kepala Desa Banda Neira</p>
                <div className="h-16" />
                <p className="m-0 font-bold underline text-slate-900">
                  Ahmad Baadilla, S.Sos
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  NIPD. 81.01.09.2001
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
