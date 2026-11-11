import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { auditService, AuditLogItem, EcosystemSummary } from '../services/audit'

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
  const [searchAction, setSearchAction] = useState<string>('')
  const [selectedDetailLog, setSelectedDetailLog] = useState<AuditLogItem | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  const loadSummary = async () => {
    if (!isOnline) return
    setLoadingSummary(true)
    try {
      const data = await auditService.getEcosystemSummary()
      setSummary(data)
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
      const data = await auditService.getLogs({
        entity_name: selectedEntity || undefined,
        action: searchAction || undefined,
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
  }, [selectedEntity, isOnline])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadLogs()
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

  const formatEntityBadge = (entity: string) => {
    if (entity.includes('resident')) {
      return <span className="badge badge-blue"><Users size={11} /> Penduduk</span>
    }
    if (entity.includes('farm')) {
      return <span className="badge badge-green"><MapPin size={11} /> Lahan Perkebunan</span>
    }
    if (entity.includes('harvest')) {
      return <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}><Package size={11} /> Panen</span>
    }
    if (entity.includes('batch')) {
      return <span className="badge badge-purple"><Layers size={11} /> Rantai Pasok Batch</span>
    }
    if (entity.includes('request')) {
      return <span className="badge badge-gold"><FileText size={11} /> Layanan Surat</span>
    }
    if (entity.includes('blockchain')) {
      return <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}><ShieldCheck size={11} /> Blockchain</span>
    }
    return <span className="badge badge-secondary">{entity}</span>
  }

  const formatActionColor = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes('CREATE')) return '#15803d'
    if (act.includes('VERIFY') || act.includes('APPROVE')) return '#0369a1'
    if (act.includes('UPDATE')) return '#b45309'
    if (act.includes('REJECT') || act.includes('DELETE')) return '#b91c1c'
    if (act.includes('ANCHOR')) return '#4338ca'
    return '#475569'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner with Print Laporan Action */}
      <div
        className="app-card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          borderLeft: '4px solid #1e3a8a',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e3a8a' }}>
            🏛️ Rekapitulasi Ekosistem & Audit Trail Terpusat
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0' }}>
            Pusat pemantauan integritas data, jejak aktivitas operator desa, serta rekapitulasi resmi untuk Kantor Camat & Arsip Desa.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              loadSummary()
              loadLogs()
            }}
            disabled={loadingSummary || loadingLogs}
            className="btn btn-sm btn-secondary"
            title="Muat ulang data rekapitulasi dan audit trail"
          >
            <RefreshCw size={13} className={loadingSummary || loadingLogs ? 'animate-spin' : ''} /> Segarkan
          </button>

          <button
            onClick={exportAuditCSV}
            className="btn btn-sm btn-secondary"
            title="Unduh seluruh catatan audit trail dalam format CSV"
          >
            <Download size={13} /> Ekspor CSV Audit
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="btn btn-sm btn-primary"
            style={{
              background: '#1e3a8a',
              borderColor: '#1e40af',
              boxShadow: '0 2px 4px rgba(30, 58, 138, 0.25)',
            }}
          >
            <Printer size={13} /> Cetak Laporan Tahunan Desa
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: Kependudukan */}
          <div className="stat-card" style={{ borderTop: '3px solid #1e40af' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">👥 Kependudukan</span>
              <span className="badge badge-blue">{summary.population.verified_residents} Terverifikasi</span>
            </div>
            <div className="stat-value">{summary.population.total_residents} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Jiwa</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              {summary.population.pending_residents} berkas pending verifikasi
            </div>
          </div>

          {/* Card 2: Lahan & Kelompok Tani */}
          <div className="stat-card" style={{ borderTop: '3px solid #15803d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">🗺️ Perkebunan Rempah</span>
              <span className="badge badge-green">{summary.farms.total_farmer_groups} Poktan</span>
            </div>
            <div className="stat-value">{summary.farms.total_area_hectares} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Ha</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              {summary.farms.total_farms} plot kebun ({summary.farms.verified_farms} terverifikasi)
            </div>
          </div>

          {/* Card 3: Hasil Panen */}
          <div className="stat-card" style={{ borderTop: '3px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">📦 Volume Panen</span>
              <span className="badge badge-gold">{summary.harvests.total_harvest_records} Catatan</span>
            </div>
            <div className="stat-value">{summary.harvests.total_quantity_kg.toLocaleString('id-ID')} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Kg</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              Komoditas unggulan Pala & Cengkeh
            </div>
          </div>

          {/* Card 4: Blockchain & Batch */}
          <div className="stat-card" style={{ borderTop: '3px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">⛓️ Rantai Pasok Blockchain</span>
              <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>EVM Hash</span>
            </div>
            <div className="stat-value">{summary.traceability.blockchain_anchored_batches} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/ {summary.traceability.total_batches} Batch</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              {summary.traceability.total_trace_events} riwayat proses terverifikasi
            </div>
          </div>

          {/* Card 5: Pelayanan Surat */}
          <div className="stat-card" style={{ borderTop: '3px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">📬 Pelayanan Surat</span>
              <span className="badge badge-green">{summary.letters.approved_requests} Disetujui</span>
            </div>
            <div className="stat-value">{summary.letters.total_requests} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Permohonan</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              {summary.letters.pending_requests} menunggu persetujuan petugas
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Stream Section */}
      <div className="app-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              📋 Riwayat Log Audit Terpusat (Audit Trail)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Merekam setiap pembuatan, perubahan, verifikasi, dan transaksi hash secara akuntabel ({totalLogs} aktivitas tercatat).
            </p>
          </div>

          {/* Filter Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: '0.825rem', padding: '0.35rem 0.75rem' }}
            >
              <option value="">Semua Entitas</option>
              <option value="residents">Penduduk (residents)</option>
              <option value="farms">Lahan Perkebunan (farms)</option>
              <option value="harvests">Panen Rempah (harvests)</option>
              <option value="product_batches">Batch Rantai Pasok</option>
              <option value="administrative_requests">Pelayanan Surat</option>
              <option value="blockchain_transactions">Transaksi Blockchain</option>
            </select>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Cari aksi (contoh: CREATE, VERIFY)..."
                value={searchAction}
                onChange={(e) => setSearchAction(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.825rem', padding: '0.35rem 0.75rem 0.35rem 2rem', width: '220px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <button type="submit" className="btn btn-sm btn-secondary">
              Filter
            </button>
          </form>
        </div>

        {/* Logs Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '0.825rem' }}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Waktu (WIT)</th>
                <th>Operator</th>
                <th>Aksi Sistem</th>
                <th>Entitas</th>
                <th>ID Sasaran</th>
                <th>IP Address</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    <RefreshCw size={18} className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Memuat log audit...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Tidak ada catatan audit yang cocok dengan filter yang dipilih.
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
                    <React.Fragment key={log.id}>
                      <tr>
                        <td style={{ color: '#475569', fontWeight: 500 }}>{formattedTime}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                            {log.user?.full_name || log.user?.username || 'Sistem / Publik'}
                          </div>
                          {log.user?.username && (
                            <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>@{log.user.username}</div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: formatActionColor(log.action),
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              background: 'rgba(255, 255, 255, 0.06)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td>{formatEntityBadge(log.entity_name)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                          {log.entity_id.slice(0, 8)}...
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{log.ip_address || 'Internal/Local'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDetailLog(log)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem' }}
                            title="Lihat payload perubahan data"
                          >
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setSelectedDetailLog(null)}
        >
          <div
            className="app-card"
            style={{
              maxWidth: '620px',
              width: '100%',
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.15)',
              borderRadius: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                🔍 Detail Payload Audit Event
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="btn btn-sm btn-secondary"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <div><strong>Aksi:</strong> <span style={{ color: formatActionColor(selectedDetailLog.action), fontWeight: 700 }}>{selectedDetailLog.action}</span></div>
              <div><strong>Entitas:</strong> {selectedDetailLog.entity_name} (ID: <code>{selectedDetailLog.entity_id}</code>)</div>
              <div><strong>Operator:</strong> {selectedDetailLog.user?.full_name} (@{selectedDetailLog.user?.username || 'unknown'})</div>
              <div><strong>Waktu:</strong> {new Date(selectedDetailLog.created_at).toLocaleString('id-ID')}</div>
            </div>

            <div>
              <strong style={{ fontSize: '0.85rem' }}>Data Perubahan / Payload (JSON):</strong>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  maxHeight: '260px',
                  marginTop: '0.5rem',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(selectedDetailLog.changes_json || { message: 'Tidak ada detail perubahan (Non-mutation action)' }, null, 2)}
              </pre>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="btn btn-primary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK LAPORAN RESMI TAHUNAN DESA */}
      {showPrintModal && summary && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '750px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto',
              fontFamily: 'serif',
              color: '#0f172a',
            }}
          >
            {/* Header Action Bar (Not Printed) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.75rem',
                fontFamily: 'sans-serif',
              }}
              className="no-print"
            >
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Pratinjau Laporan Resmi Rekapitulasi Tahunan Ekosistem Desa
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  style={{
                    background: '#1e40af',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🖨️ Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* PRINTABLE LETTERHEAD */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pemerintah Kabupaten Maluku Tengah
              </h4>
              <h4 style={{ margin: '0.15rem 0', fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Kecamatan Banda
              </h4>
              <h2 style={{ margin: '0.2rem 0', fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Kantor Kepala Desa Banda Neira
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'sans-serif', color: '#334155' }}>
                Jl. Pelabuhan Nusantara, Banda Neira, Kode Pos 97581 &bull; Maluku, Indonesia
              </p>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', textDecoration: 'underline' }}>
                LAPORAN REKAPITULASI RESMI EKOSISTEM DIGITAL
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                Nomor: 500.1 / REKAP-DESA / {new Date().getFullYear()}
              </p>
            </div>

            {/* Body Description */}
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, textAlign: 'justify', marginBottom: '1.25rem' }}>
              Berdasarkan pencatatan digital terpadu Sistem Informasi Desa Digital Banda Neira hingga tanggal{' '}
              <strong>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</strong>, disampaikan rekapitulasi menyeluruh kependudukan, perkebunan rempah pala & cengkeh, rantai pasok, dan pelayanan administrasi masyarakat sebagai berikut:
            </p>

            {/* Summary Data Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', fontFamily: 'sans-serif', marginBottom: '1.5rem' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold', width: '35%' }}>1. Kependudukan</td>
                  <td style={{ padding: '0.5rem' }}>
                    Total {summary.population.total_residents} Jiwa ({summary.population.verified_residents} Terverifikasi, {summary.population.pending_residents} Pending).
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>2. Mata Pencaharian Utama</td>
                  <td style={{ padding: '0.5rem' }}>
                    {Object.entries(summary.population.livelihoods_count)
                      .map(([occ, cnt]) => `${occ} (${cnt})`)
                      .join(', ')}
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>3. Perkebunan Rempah</td>
                  <td style={{ padding: '0.5rem' }}>
                    {summary.farms.total_farmers} Petani dalam {summary.farms.total_farmer_groups} Kelompok Tani (Poktan). Total Luas Lahan Terdata: <strong>{summary.farms.total_area_hectares} Hektar</strong> ({summary.farms.total_area_sqm.toLocaleString('id-ID')} m²).
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>4. Produksi Hasil Panen</td>
                  <td style={{ padding: '0.5rem' }}>
                    Total Produksi Tercatat: <strong>{summary.harvests.total_quantity_kg.toLocaleString('id-ID')} Kg</strong> ({summary.harvests.total_harvest_records} Transaksi Panen Terdaftar).
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>5. Rantai Pasok & Integritas</td>
                  <td style={{ padding: '0.5rem' }}>
                    {summary.traceability.blockchain_anchored_batches} dari {summary.traceability.total_batches} Batch Terverifikasi di Ledger Blockchain EVM ({summary.traceability.total_trace_events} Rekaman Jejak Mutu/Pengolahan).
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>6. Pelayanan Surat Warga</td>
                  <td style={{ padding: '0.5rem' }}>
                    Total {summary.letters.total_requests} Permohonan Surat SKU/Domisili ({summary.letters.approved_requests} Disetujui, {summary.letters.pending_requests} Menunggu).
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>7. Integritas Audit Trail</td>
                  <td style={{ padding: '0.5rem' }}>
                    Total {summary.total_audit_events} Transaksi Mutasi Sistem Terekam Aman dalam Log Audit Desa.
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Closing */}
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, textAlign: 'justify', marginBottom: '2rem' }}>
              Demikian laporan rekapitulasi data ekosistem digital ini diterbitkan secara sah oleh Pemerintah Desa Banda Neira untuk dapat dipergunakan sebagai dokumen pertanggungjawaban program, perumusan kebijakan pembangunan desa, serta laporan berkala kepada Pemerintah Kecamatan Banda.
            </p>

            {/* Signature Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', pageBreakInside: 'avoid' }}>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <p style={{ margin: 0, fontSize: '0.825rem' }}>Mengetahui,</p>
                <p style={{ margin: '0.15rem 0 0', fontWeight: 'bold', fontSize: '0.85rem' }}>Sekretaris Desa Banda Neira</p>
                <div style={{ height: '65px' }} />
                <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>
                  M. Syarif Wailissa, S.AP
                </p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#475569' }}>
                  NIP. 19840215 201001 1 008
                </p>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <p style={{ margin: 0, fontSize: '0.825rem' }}>
                  Banda Neira, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
                <p style={{ margin: '0.15rem 0 0', fontWeight: 'bold', fontSize: '0.85rem' }}>Kepala Desa Banda Neira</p>
                <div style={{ height: '65px' }} />
                <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>
                  Ahmad Baadilla, S.Sos
                </p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#475569' }}>
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
