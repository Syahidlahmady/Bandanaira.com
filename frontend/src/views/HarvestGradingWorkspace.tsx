import React, { useEffect } from 'react'
import { Harvest, ProductBatch } from '../services/traceability'
import { Farm, Farmer } from '../services/farmers'

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
  isFarmer,
  fetchTraceabilityData,
}) => {
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
    <section
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#6d28d9', fontWeight: 'bold' }}>
            {isFarmer && !isOfficerOrAdmin
              ? 'Catatan Hasil Panen Rempah Petani'
              : 'Pengelolaan Panen & Label QR Rempah Pala'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {isFarmer && !isOfficerOrAdmin
              ? 'Catat hasil petik buah pala, fuli, atau cengkeh dari kebun Anda. Tetap bisa disimpan walau di kebun tanpa sinyal internet.'
              : 'Rekapitulasi panen dari petani, pembuatan batch kemasan berlabel QR resmi, dan kunci keaslian produk.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleExportHarvestCSV}
            style={{
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            📥 Export CSV ({harvests.length})
          </button>
          <button
            onClick={fetchTraceabilityData}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Segarkan Data
          </button>
        </div>
      </div>

      {traceMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.65rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: traceMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: traceMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${traceMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {traceMsg.text}
        </div>
      )}

      {/* Grid: 1. Input Panen & 2. Buat Batch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Form Catat Panen */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
            1. Catat Hasil Panen Petani
          </h3>
          <form onSubmit={handleCreateHarvest} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kebun & Petani</label>
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
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- Pilih Kebun --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.primary_commodity})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Panen</label>
                <input
                  type="text"
                  value={harvestForm.harvest_code}
                  onChange={(e) => setHarvestForm({ ...harvestForm, harvest_code: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Jumlah (kg)</label>
                <input
                  type="number"
                  value={harvestForm.quantity_kg}
                  onChange={(e) => setHarvestForm({ ...harvestForm, quantity_kg: Number(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '6px',
                fontWeight: '600',
                marginTop: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Simpan Catatan Panen
            </button>
            <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.4rem', lineHeight: 1.4 }}>
              📶 Bekerja Offline: Catatan panen tetap tersimpan di HP walau di kebun tanpa sinyal internet, dan otomatis terkirim saat sinyal kembali.
            </p>
          </form>
        </div>

        {/* Form Buat Batch Produk - Khusus Petugas / Admin */}
        {isOfficerOrAdmin && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
              2. Buat Batch Kemasan & Label QR
            </h3>
            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Asal Catatan Panen</label>
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
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Pilih Panen Terdaftar --</option>
                  {harvests.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.harvest_code} - {h.commodity} ({h.quantity_kg} kg)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Batch</label>
                  <input
                    type="text"
                    value={batchForm.batch_code}
                    onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Alokasi (kg)</label>
                  <input
                    type="number"
                    value={batchForm.allocated_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, allocated_qty: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                style={{
                  background: '#6d28d9',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Terbitkan Batch & Label QR
              </button>
            </form>
          </div>
        )}
      </div>

      {/* DAFTAR RIWAYAT PANEN MASUK (Bisa dilihat Petani & Petugas) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
          📋 Riwayat Catatan Hasil Panen ({harvests.length} Catatan)
        </h3>
        {harvests.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', border: '1px solid #e2e8f0' }}>
            Belum ada catatan panen terdaftar. Gunakan formulir di atas untuk mencatat panen hari ini.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Kode Panen</th>
                  <th>Kebun</th>
                  <th>Komoditas</th>
                  <th>Berat (kg)</th>
                  <th>Kualitas</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {harvests.map((h) => {
                  const farm = farms.find((f) => f.id === h.farm_id)
                  return (
                    <tr key={h.id}>
                      <td><b>{h.harvest_code}</b></td>
                      <td>{farm ? farm.name : 'Kebun Lonthoir'}</td>
                      <td><span className="badge badge-green">{h.commodity}</span></td>
                      <td><b>{h.quantity_kg} kg</b></td>
                      <td>{h.quality_grade || 'Grade A'}</td>
                      <td>{h.harvest_date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Batches & Event Lifecycle Append - Khusus Petugas / Admin */}
      {isOfficerOrAdmin && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
            Daftar Batch & Label QR Resmi ({batches.length} Batch)
          </h3>
          {batches.map((b) => (
            <div
              key={b.id}
              style={{
                border: selectedBatch?.id === b.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1rem',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nomor Batch:</span>
                  <h4 style={{ fontSize: '1.2rem', color: '#1e3a8a', fontWeight: 'bold' }}>
                    {b.batch_code} ({b.commodity} - {b.total_quantity_kg} kg)
                  </h4>
                  <span
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: '#dbeafe',
                      color: '#1e40af',
                      display: 'inline-block',
                      marginTop: '0.25rem',
                    }}
                  >
                    STATUS: {b.status.toUpperCase()}
                  </span>
                  <span
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      marginLeft: '0.4rem',
                      background:
                        b.blockchain_status === 'confirmed'
                          ? '#d1fae5'
                          : b.blockchain_status === 'submitted'
                          ? '#dbeafe'
                          : b.blockchain_status === 'failed'
                          ? '#fee2e2'
                          : '#fef3c7',
                      color:
                        b.blockchain_status === 'confirmed'
                          ? '#065f46'
                          : b.blockchain_status === 'submitted'
                          ? '#1e40af'
                          : b.blockchain_status === 'failed'
                          ? '#991b1b'
                          : '#92400e',
                      display: 'inline-block',
                      marginTop: '0.25rem',
                    }}
                  >
                    ⛓️ BLOCKCHAIN: {b.blockchain_status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {b.qr_code_base64 && (
                    <img
                      src={b.qr_code_base64}
                      alt="QR Code"
                      style={{ width: '70px', height: '70px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  )}
                  <button
                    onClick={() => handleAnchorBlockchain(b.id)}
                    disabled={blockchainLoading === b.id}
                    style={{
                      background: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: blockchainLoading === b.id ? 'not-allowed' : 'pointer',
                      opacity: blockchainLoading === b.id ? 0.7 : 1,
                    }}
                  >
                    {blockchainLoading === b.id ? 'Menjangkar...' : '⛓️ Jangkar EVM'}
                  </button>
                  <button
                    onClick={() => handleVerifyBlockchain(b.id)}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🔍 Verifikasi On-Chain
                  </button>
                  <button
                    onClick={() => handlePublicVerify(b.public_verification_token)}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    QR Publik ↗
                  </button>
                </div>
              </div>

              {/* Event Chain Timeline */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                  Rantai Hash Integritas Peristiwa ({b.events.length} Peristiwa):
                </p>
                {b.events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: idx < b.events.length - 1 ? '1px dashed #cbd5e1' : 'none',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e40af', fontWeight: '600' }}>
                      <span>● {ev.event_type.toUpperCase()} ({ev.location})</span>
                      <span style={{ color: '#64748b', fontWeight: 'normal' }}>
                        {new Date(ev.event_timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p style={{ color: '#475569', marginTop: '0.1rem' }}>{ev.description || '-'}</p>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6d28d9', marginTop: '0.2rem' }}>
                      Hash SHA-256: {ev.event_hash}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Append Event */}
              <form
                onSubmit={(e) => {
                  setSelectedBatch(b)
                  handleAppendEvent(e)
                }}
                style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Tambah Tahapan</label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="drying">Pengeringan (Drying)</option>
                    <option value="sorting">Sortasi Mutu (Sorting)</option>
                    <option value="packaging">Pengemasan (Packaging)</option>
                    <option value="transfer">Distribusi (Transfer)</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Catatan / Lokasi</label>
                  <input
                    type="text"
                    placeholder="Mis. Pengeringan solar dryer Lonthoir"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#4338ca',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  + Catat & Rantai Hash
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
