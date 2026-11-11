import React, { useEffect, useState } from 'react'
import { Harvest, ProductBatch } from '../services/traceability'
import { Farm, Farmer } from '../services/farmers'
import { QrCode, Printer, Download, ExternalLink, X } from 'lucide-react'

interface HarvestGradingWorkspaceProps {
  harvests: Harvest[]
  batches: ProductBatch[]
  selectedBatch: ProductBatch | null
  setSelectedBatch: (b: ProductBatch | null) => void
  traceMsg: { type: 'success' | 'error'; text: string } | null
  blockchainLoading: string | null
  harvestForm: {
    farm_id: string
    farmer_id: string
    harvest_code: string
    commodity: string
    harvest_date: string
    quantity_kg: number
    quality_grade: string
  }
  setHarvestForm: React.Dispatch<React.SetStateAction<any>>
  handleCreateHarvest: (e: React.FormEvent) => void
  batchForm: {
    batch_code: string
    commodity: string
    production_date: string
    harvest_id: string
    allocated_qty: number
  }
  setBatchForm: React.Dispatch<React.SetStateAction<any>>
  handleCreateBatch: (e: React.FormEvent) => void
  eventForm: {
    event_type: string
    location: string
    description: string
  }
  setEventForm: React.Dispatch<React.SetStateAction<any>>
  handleAppendEvent: (e: React.FormEvent) => void
  handleAnchorBlockchain: (batchId: string) => void
  handleVerifyBlockchain: (batchId: string) => void
  handlePublicVerify: (token: string) => void
  farms: Farm[]
  farmers: Farmer[]
  isOfficerOrAdmin: boolean
  isFarmerGroupAdmin: boolean
  isFarmer: boolean
  isFarmerOnly: boolean
  fetchTraceabilityData: () => void
}

export const HarvestGradingWorkspace: React.FC<HarvestGradingWorkspaceProps> = ({
  harvests,
  batches,
  selectedBatch,
  setSelectedBatch,
  traceMsg,
  blockchainLoading,
  harvestForm,
  setHarvestForm,
  handleCreateHarvest,
  batchForm,
  setBatchForm,
  handleCreateBatch,
  eventForm,
  setEventForm,
  handleAppendEvent,
  handleAnchorBlockchain,
  handleVerifyBlockchain,
  handlePublicVerify,
  farms,
  isOfficerOrAdmin,
  isFarmerGroupAdmin,
  isFarmer,
  fetchTraceabilityData,
}) => {
  const [previewQrBatch, setPreviewQrBatch] = useState<ProductBatch | null>(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'

  const getBatchQrSrc = (batch: ProductBatch) => {
    if (batch.public_verification_token) {
      let origin = typeof window !== 'undefined' ? window.location.origin : ''
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        origin = origin.replace('localhost', '192.168.8.89').replace('127.0.0.1', '192.168.8.89')
      }
      const fullUrl = `${origin}/?verify=${encodeURIComponent(batch.public_verification_token)}`
      return `${apiBase}/public/verify/image/${encodeURIComponent(batch.public_verification_token)}?full_url=${encodeURIComponent(fullUrl)}`
    }
    if (batch.qr_code_base64 && batch.qr_code_base64.trim().length > 0) {
      return batch.qr_code_base64.startsWith('data:image')
        ? batch.qr_code_base64
        : `data:image/png;base64,${batch.qr_code_base64}`
    }
    return ''
  }
  // Auto-save harvest form draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem('banda_draft_harvest')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.harvest_code && !harvestForm.harvest_code) {
          setHarvestForm((prev: any) => ({ ...prev, ...parsed }))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (harvestForm.harvest_code) {
      try {
        localStorage.setItem('banda_draft_harvest', JSON.stringify(harvestForm))
      } catch {
        // ignore
      }
    }
  }, [harvestForm.harvest_code, harvestForm.quantity_kg, harvestForm.farm_id])

  const handleExportHarvestCSV = () => {
    if (harvests.length === 0) {
      alert('Tidak ada data hasil panen untuk diekspor.')
      return
    }
    const headers = ['Kode Panen', 'ID Kebun', 'Komoditas', 'Jumlah (kg)', 'Mutu/Grade', 'Tanggal Panen']
    const rows = harvests.map((h) => [
      `'${h.harvest_code}`,
      `'${h.farm_id}`,
      h.commodity,
      h.quantity_kg,
      `"${(h.quality_grade || 'Grade A').replace(/"/g, '""')}"`,
      h.harvest_date,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data-panen-rempah-banda-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="app-card animate-fade-in" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-purple" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              Indikasi Geografis & Kualitas
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              &bull; Telusur Rantai Pasok Rempah
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>
            {isFarmer && !isOfficerOrAdmin
              ? 'Catatan Hasil Panen Rempah Petani'
              : 'Pengelolaan Panen & Label QR Rempah Pala'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isFarmer && !isOfficerOrAdmin
              ? 'Catat hasil petik buah pala, fuli, atau cengkeh dari kebun Anda. Tetap bisa disimpan walau di kebun tanpa sinyal internet.'
              : 'Rekapitulasi panen dari petani, pembuatan batch kemasan berlabel QR resmi, dan kunci keaslian produk.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleExportHarvestCSV}
            className="btn btn-outline-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            📥 Export CSV ({harvests.length})
          </button>
          <button
            onClick={fetchTraceabilityData}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            🔄 Segarkan Data
          </button>
        </div>
      </div>

      {traceMsg && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: traceMsg.type === 'success' ? 'var(--secondary-light)' : 'var(--danger-light)',
            color: traceMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${traceMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {traceMsg.text}
        </div>
      )}

      {/* Grid: 1. Input Panen & 2. Buat Batch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Form Catat Panen */}
        <div style={{ background: 'rgba(248, 250, 252, 0.85)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🌱</span>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
              1. Catat Hasil Panen Petani
            </h3>
          </div>
          <form onSubmit={handleCreateHarvest} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div className="form-group">
              <label className="form-label">Kebun & Petani</label>
              <select
                value={harvestForm.farm_id}
                onChange={(e) => {
                  const f = farms.find((farm) => farm.id === e.target.value)
                  setHarvestForm({
                    ...harvestForm,
                    farm_id: e.target.value,
                    farmer_id: f?.farmer_id || harvestForm.farmer_id,
                  })
                }}
                required
                className="form-control"
              >
                <option value="">-- Pilih Kebun --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.primary_commodity})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Kode Panen</label>
                <input
                  type="text"
                  value={harvestForm.harvest_code}
                  onChange={(e) => setHarvestForm({ ...harvestForm, harvest_code: e.target.value })}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jumlah (kg)</label>
                <input
                  type="number"
                  value={harvestForm.quantity_kg}
                  onChange={(e) => setHarvestForm({ ...harvestForm, quantity_kg: Number(e.target.value) })}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 'auto', padding: '0.55rem' }}
            >
              Simpan Catatan Panen
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
              📶 <b>Bekerja Offline:</b> Catatan panen tetap tersimpan di HP walau di kebun tanpa sinyal internet, dan otomatis terkirim saat sinyal kembali.
            </p>
          </form>
        </div>

        {/* Form Buat Batch Produk - Khusus Petugas / Admin Kelompok Tani */}
        {(isOfficerOrAdmin || isFarmerGroupAdmin) && (
          <div style={{ background: 'rgba(248, 250, 252, 0.85)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📦</span>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                2. Buat Batch Kemasan & Label QR
              </h3>
            </div>
            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Asal Catatan Panen</label>
                <select
                  value={batchForm.harvest_id}
                  onChange={(e) => {
                    const h = harvests.find((item) => item.id === e.target.value)
                    setBatchForm({
                      ...batchForm,
                      harvest_id: e.target.value,
                      allocated_qty: h?.quantity_kg || batchForm.allocated_qty,
                      commodity: h?.commodity || batchForm.commodity,
                    })
                  }}
                  required
                  className="form-control"
                >
                  <option value="">-- Pilih Panen Terdaftar --</option>
                  {harvests.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.harvest_code} - {h.commodity} ({h.quantity_kg} kg)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Kode Batch</label>
                  <input
                    type="text"
                    value={batchForm.batch_code}
                    onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Alokasi (kg)</label>
                  <input
                    type="number"
                    value={batchForm.allocated_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, allocated_qty: Number(e.target.value) })}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 'auto', padding: '0.55rem', background: '#7c3aed', borderColor: '#6d28d9' }}
              >
                Terbitkan Batch & Label QR
              </button>
            </form>
          </div>
        )}
      </div>

      {/* DAFTAR RIWAYAT PANEN MASUK (Bisa dilihat Petani & Petugas) */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.75rem', fontWeight: 800 }}>
          📋 Riwayat Catatan Hasil Panen ({harvests.length} Catatan)
        </h3>
        {harvests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
            Belum ada catatan panen terdaftar. Gunakan formulir di atas untuk mencatat panen hari ini.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Panen</th>
                  <th>Kebun</th>
                  <th>Komoditas</th>
                  <th>Berat (kg)</th>
                  <th>Kualitas</th>
                  <th>Tanggal</th>
                  <th>Label QR & Aksi</th>
                </tr>
              </thead>
              <tbody>
                {harvests.map((h) => {
                  const farm = farms.find((f) => f.id === h.farm_id)
                  const matchedBatch = batches.find((b) => b.commodity.toLowerCase() === h.commodity.toLowerCase()) || batches[0]
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{h.harvest_code}</td>
                      <td>{farm ? farm.name : 'Kebun Lonthoir'}</td>
                      <td>
                        <span className={`badge ${h.commodity.toLowerCase().includes('pala') ? 'badge-blue' : 'badge-emerald'}`}>
                          {h.commodity}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{h.quantity_kg} kg</td>
                      <td>
                        <span className="badge badge-emerald">{h.quality_grade || 'Grade A Super'}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{h.harvest_date}</td>
                      <td>
                        {matchedBatch ? (
                          <button
                            type="button"
                            onClick={() => setPreviewQrBatch(matchedBatch)}
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            title={`Lihat Label QR untuk ${matchedBatch.batch_code}`}
                          >
                            <QrCode size={13} /> Label QR ({matchedBatch.batch_code})
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Belum Dibuat Batch</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Batches & Event Lifecycle Append - Terbuka untuk Petani & Petugas */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
              Daftar Batch & Label QR Resmi ({batches.length} Batch)
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Kemasan produk rempah berlabel QR dengan sertifikat keaslian dan jangkar kriptografis on-chain.
            </p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
            Belum ada batch kemasan rempah berlabel QR. {isOfficerOrAdmin || isFarmerGroupAdmin ? 'Gunakan formulir di atas untuk menerbitkan batch baru.' : 'Petugas desa / admin kelompok tani dapat menerbitkan batch resmi dari hasil panen.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {batches.map((b) => (
              <div
                key={b.id}
                style={{
                  border: selectedBatch?.id === b.id ? '2px solid var(--ocean-600)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.35rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: selectedBatch?.id === b.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Nomor Batch Kemasan
                    </span>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, margin: '0.2rem 0 0.4rem' }}>
                      {b.batch_code} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>({b.commodity} &bull; {b.total_quantity_kg} kg)</span>
                    </h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badge-blue">
                        STATUS: {b.status.toUpperCase()}
                      </span>
                      <span
                        className={`badge ${
                          b.blockchain_status === 'confirmed'
                            ? 'badge-emerald'
                            : b.blockchain_status === 'submitted'
                            ? 'badge-blue'
                            : b.blockchain_status === 'failed'
                            ? 'badge-rose'
                            : 'badge-amber'
                        }`}
                      >
                        ⛓️ EVM: {b.blockchain_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* High-scan-contrast QR Display Box */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: '#ffffff',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      <div
                        style={{ position: 'relative', cursor: 'pointer', textAlign: 'center' }}
                        onClick={() => setPreviewQrBatch(b)}
                        title="Klik untuk memperbesar / cetak stiker QR"
                      >
                        <img
                          src={getBatchQrSrc(b)}
                          alt={`QR Code ${b.batch_code}`}
                          style={{
                            width: '84px',
                            height: '84px',
                            display: 'block',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '2px',
                            right: '2px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: '#ffffff',
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            padding: '1px 0',
                          }}
                        >
                          🔍 PERBESAR
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                            LABEL RESMI
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Token: {b.public_verification_token ? `${b.public_verification_token.substring(0, 8)}...` : '-'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewQrBatch(b)}
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.73rem', padding: '0.3rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <QrCode size={13} /> Cetak Stiker
                          </button>
                          <a
                            href={getBatchQrSrc(b)}
                            download={`QR-${b.batch_code}.png`}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.73rem', padding: '0.3rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                          >
                            <Download size={13} /> Unduh PNG
                          </a>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {(isOfficerOrAdmin || isFarmerGroupAdmin) && (
                          <button
                            onClick={() => handleAnchorBlockchain(b.id)}
                            disabled={blockchainLoading === b.id}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                          >
                            {blockchainLoading === b.id ? '⏳ Menjangkar...' : '⛓️ Jangkar EVM'}
                          </button>
                        )}
                        <button
                          onClick={() => handleVerifyBlockchain(b.id)}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                        >
                          🔍 Verifikasi On-Chain
                        </button>
                      </div>
                      <button
                        onClick={() => handlePublicVerify(b.public_verification_token)}
                        className="btn btn-sm btn-success"
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', justifyContent: 'center' }}
                      >
                        QR Publik Sertifikat ↗
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event Chain Timeline */}
                <div style={{ background: 'rgba(248, 250, 252, 0.85)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>🔗</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Rantai Hash Integritas Peristiwa ({b.events.length} Peristiwa):
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {b.events.map((ev, idx) => (
                      <div
                        key={ev.id}
                        style={{
                          paddingBottom: idx < b.events.length - 1 ? '0.65rem' : '0',
                          borderBottom: idx < b.events.length - 1 ? '1px dashed var(--border-color)' : 'none',
                          fontSize: '0.825rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--ocean-600)' }}>
                            ● {ev.event_type.toUpperCase()} ({ev.location})
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {new Date(ev.event_timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-main)', margin: '0.2rem 0', fontSize: '0.825rem' }}>
                          {ev.description || '-'}
                        </p>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#7c3aed', background: 'rgba(124, 58, 237, 0.05)', padding: '0.15rem 0.45rem', borderRadius: '4px', display: 'inline-block' }}>
                          SHA-256: {ev.event_hash}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Append Event - Hanya Petugas & Admin Kelompok */}
                {(isOfficerOrAdmin || isFarmerGroupAdmin) && (
                  <form
                    onSubmit={(e) => {
                      setSelectedBatch(b)
                      handleAppendEvent(e)
                    }}
                    style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
                  >
                    <div style={{ width: '180px' }}>
                      <label className="form-label">Tambah Tahapan</label>
                      <select
                        value={eventForm.event_type}
                        onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                      >
                        <option value="drying">Pengeringan (Drying)</option>
                        <option value="sorting">Sortasi Mutu (Sorting)</option>
                        <option value="packaging">Pengemasan (Packaging)</option>
                        <option value="transfer">Distribusi (Transfer)</option>
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <label className="form-label">Catatan & Lokasi Tahapan</label>
                      <input
                        type="text"
                        placeholder="Mis. Pengeringan solar dryer Lonthoir..."
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        required
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      + Catat & Rantai Hash
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PRATINJAU & CETAK QR KEMASAN */}
      {previewQrBatch && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Label QR Kemasan Rempah
                </h3>
              </div>
              <button
                onClick={() => setPreviewQrBatch(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                INDIKASI GEOGRAFIS RESMI BANDA NEIRA
              </div>
              <img
                src={getBatchQrSrc(previewQrBatch)}
                alt={`QR Code ${previewQrBatch.batch_code}`}
                style={{ width: '220px', height: '220px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {previewQrBatch.batch_code}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {previewQrBatch.commodity} &bull; {previewQrBatch.total_quantity_kg} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ocean-600)', marginTop: '0.25rem', fontWeight: 600 }}>
                  Produksi: {previewQrBatch.production_date}
                </div>
                <p style={{ fontSize: '0.74rem', color: '#1e40af', background: '#eff6ff', padding: '0.45rem', borderRadius: '6px', margin: '0.65rem 0 0', lineHeight: 1.4, border: '1px solid #bfdbfe' }}>
                  📸 <b>Bisa Discan Langsung:</b> Arahkan kamera bawaan HP (iPhone Camera / Android Google Lens) ke QR code ini untuk membuka sertifikat keaslian secara instan tanpa login.
                </p>
                <div style={{ marginTop: '0.5rem', padding: '0.35rem 0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Token: {previewQrBatch.public_verification_token}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(previewQrBatch.public_verification_token)
                      alert('Token verifikasi berhasil disalin ke papan klip!')
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
                  >
                    Salin Token
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={getBatchQrSrc(previewQrBatch)}
                  download={`QR-${previewQrBatch.batch_code}.png`}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                >
                  <Download size={16} /> Unduh PNG
                </a>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={16} /> Cetak Stiker
                </button>
              </div>
              <button
                onClick={() => {
                  const token = previewQrBatch.public_verification_token
                  setPreviewQrBatch(null)
                  handlePublicVerify(token)
                }}
                className="btn btn-outline-primary"
                style={{ padding: '0.6rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={16} /> Buka Halaman Verifikasi Publik
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
