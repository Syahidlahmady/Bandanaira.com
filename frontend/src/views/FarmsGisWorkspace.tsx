import React, { useEffect } from 'react'
import { Farm, Farmer, FarmerGroup, FarmGeoJSONFeatureCollection, FarmStatistics } from '../services/farmers'
import { FarmMap } from '../components/FarmMap'

interface FarmsGisWorkspaceProps {
  farmers: Farmer[]
  farmerGroups: FarmerGroup[]
  farms: Farm[]
  farmGeoJSON: FarmGeoJSONFeatureCollection
  farmStats: FarmStatistics | null
  farmMsg: { type: 'success' | 'error'; text: string } | null
  verifyingFarmId: string | null
  farmStatusFilter: string
  setFarmStatusFilter: (st: string) => void
  handleVerifyFarm: (farmId: string, status: 'verified' | 'rejected') => void
  isOfficerOrAdmin: boolean
  isFarmerGroupAdmin: boolean
  isFarmerOnly: boolean
  farmForm: {
    farmer_id: string
    farm_code: string
    name: string
    location_description: string
    latitude: number
    longitude: number
    area_sqm: number
    primary_commodity: string
  }
  setFarmForm: React.Dispatch<React.SetStateAction<any>>
  handleCreateQuickFarmerAndFarm: (e: React.FormEvent) => void
  fetchFarmingData: () => void
}

export const FarmsGisWorkspace: React.FC<FarmsGisWorkspaceProps> = ({
  farmers,
  farms,
  farmGeoJSON,
  farmStats,
  farmMsg,
  verifyingFarmId,
  farmStatusFilter,
  setFarmStatusFilter,
  handleVerifyFarm,
  isOfficerOrAdmin,
  isFarmerGroupAdmin,
  isFarmerOnly,
  farmForm,
  setFarmForm,
  handleCreateQuickFarmerAndFarm,
  fetchFarmingData,
}) => {
  // Auto-save farm form draft in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('banda_draft_farm')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name && !farmForm.name) {
          setFarmForm((prev: any) => ({ ...prev, ...parsed }))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (farmForm.name) {
      try {
        localStorage.setItem('banda_draft_farm', JSON.stringify(farmForm))
      } catch {
        // ignore
      }
    }
  }, [farmForm.name, farmForm.area_sqm, farmForm.latitude, farmForm.longitude])

  const handleExportFarmsCSV = () => {
    if (farms.length === 0) {
      alert('Tidak ada data plot kebun untuk diekspor.')
      return
    }
    const headers = ['Kode Kebun', 'Nama Kebun', 'Komoditas', 'Luas (m2)', 'Lokasi', 'Latitude', 'Longitude', 'Status Verifikasi']
    const rows = farms.map((f) => [
      `'${f.farm_code}`,
      `"${f.name.replace(/"/g, '""')}"`,
      f.primary_commodity,
      f.area_sqm,
      `"${(f.location_description || '-').replace(/"/g, '""')}"`,
      f.latitude,
      f.longitude,
      f.verification_status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data-lahan-kebun-banda-${new Date().toISOString().split('T')[0]}.csv`)
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
          <h2 style={{ fontSize: '1.35rem', color: '#065f46', fontWeight: 'bold' }}>
            {isFarmerOnly
              ? 'Peta Sebaran Lahan Perkebunan Rempah'
              : isFarmerGroupAdmin && !isOfficerOrAdmin
              ? 'Peta & Pengajuan Plot Kebun Kelompok Tani'
              : 'Pemetaan Spasial & Verifikasi Lahan Rempah'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {isFarmerOnly
              ? 'Visualisasi titik koordinat kebun pala & cengkih Banda Neira. Mode tinjau data petani.'
              : isFarmerGroupAdmin && !isOfficerOrAdmin
              ? 'Pendaftaran plot kebun baru kelompok tani yang akan diverifikasi oleh Petugas Kantor Desa Banda Neira.'
              : 'Visualisasi titik koordinat kebun pala & cengkih Banda Neira menggunakan PostGIS dan validasi persetujuan desa.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleExportFarmsCSV}
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
            📥 Export CSV ({farms.length})
          </button>
          <button
            onClick={fetchFarmingData}
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
            Segarkan Peta
          </button>
        </div>
      </div>

      {farmStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Petani Terdaftar</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#047857', marginTop: '0.2rem' }}>
              {farmStats.total_farmers}
            </p>
          </div>
          <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Kelompok Tani</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '0.2rem' }}>
              {farmStats.total_farmer_groups}
            </p>
          </div>
          <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Plot Kebun</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#7c3aed', marginTop: '0.2rem' }}>
              {farmStats.total_farms}
            </p>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              ✓ {farms.filter((f) => f.verification_status === 'verified').length} Terverifikasi
            </span>
          </div>
          <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Luas Lahan</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.2rem' }}>
              {farmStats.total_area_sqm.toLocaleString()} m²
            </p>
          </div>
        </div>
      )}

      {isOfficerOrAdmin && farms.filter((f) => f.verification_status === 'pending').length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
            <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: '600' }}>
              Terdapat {farms.filter((f) => f.verification_status === 'pending').length} plot kebun yang diajukan oleh kelompok tani dan menunggu persetujuan Kantor Desa.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFarmStatusFilter('pending')}
            style={{
              background: '#b45309',
              color: '#ffffff',
              border: 'none',
              padding: '0.25rem 0.6rem',
              borderRadius: '5px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Tinjau Sekarang ↓
          </button>
        </div>
      )}

      {farmMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.65rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: farmMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: farmMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${farmMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {farmMsg.text}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <FarmMap features={farmGeoJSON.features} />
      </div>

      {/* Mode Tinjau Petani (Read-Only) */}
      {isFarmerOnly && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
          <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
            <b>Mode Tinjau Petani:</b> Petani hanya dapat melihat data dan sebaran plot lahan kebun. Penambahan atau pemetaan lahan baru didaftarkan secara kolektif oleh <b>Pengurus Kelompok Tani</b> dan memerlukan persetujuan verifikasi resmi dari <b>Petugas Kantor Desa Banda Neira</b>.
          </div>
        </div>
      )}

      {/* Form Pengajuan Plot Kebun Baru (Khusus Kelompok Tani) */}
      {isFarmerGroupAdmin && !isOfficerOrAdmin && (
        <details
          style={{
            marginBottom: '1.5rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
          }}
          open
        >
          <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#047857' }}>
            + Ajukan Plot Kebun Baru (Kelompok Tani ke Kantor Desa)
          </summary>
          <div
            style={{
              marginTop: '0.6rem',
              marginBottom: '0.75rem',
              padding: '0.6rem 0.85rem',
              background: '#fffbeb',
              borderRadius: '6px',
              border: '1px solid #fde68a',
              fontSize: '0.8rem',
              color: '#b45309',
              lineHeight: 1.5,
            }}
          >
            🌾 <b>Alur Pengajuan Poktan:</b> Lahan yang didaftarkan kelompok tani akan berstatus <b>⏳ Menunggu Persetujuan</b> dan langsung diteruskan ke Petugas Kantor Desa Banda Neira untuk verifikasi sebelum disahkan.
          </div>
          <form
            onSubmit={handleCreateQuickFarmerAndFarm}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Petani Pemilik Lahan</label>
              <select
                value={farmForm.farmer_id}
                onChange={(e) => setFarmForm({ ...farmForm, farmer_id: e.target.value })}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- Pilih Petani Anggota Poktan --</option>
                {farmers.map((frm) => (
                  <option key={frm.id} value={frm.id}>
                    {frm.name} ({frm.farmer_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Plot Kebun</label>
              <input
                type="text"
                value={farmForm.farm_code}
                onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Nama Kebun</label>
              <input
                type="text"
                placeholder="Mis. Kebun Pala Lonthoir Timur"
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Komoditas Utama</label>
              <select
                value={farmForm.primary_commodity}
                onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="Pala">Pala</option>
                <option value="Cengkih">Cengkih</option>
                <option value="Kayu Manis">Kayu Manis</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Luas Lahan (m²)</label>
              <input
                type="number"
                value={farmForm.area_sqm}
                onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.latitude}
                onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.longitude}
                onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Kirim Pengajuan Plot ke Kantor Desa
              </button>
            </div>
          </form>
        </details>
      )}

      {/* Form Tambah Kebun Langsung (Khusus Petugas Kantor Desa & Admin) */}
      {isOfficerOrAdmin && (
        <details
          style={{
            marginBottom: '1.5rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#047857' }}>
            + Tambah / Petakan Plot Kebun Baru Langsung (Kantor Desa)
          </summary>
          <form
            onSubmit={handleCreateQuickFarmerAndFarm}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              marginTop: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Kebun</label>
              <input
                type="text"
                value={farmForm.farm_code}
                onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Nama Kebun</label>
              <input
                type="text"
                placeholder="Mis. Kebun Pala Selamon"
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Komoditas</label>
              <select
                value={farmForm.primary_commodity}
                onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="Pala">Pala</option>
                <option value="Cengkih">Cengkih</option>
                <option value="Kayu Manis">Kayu Manis</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Luas (m²)</label>
              <input
                type="number"
                value={farmForm.area_sqm}
                onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.latitude}
                onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.longitude}
                onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Simpan & Sahkan di Peta
              </button>
            </div>
          </form>
        </details>
      )}

      {/* Tabel Daftar Plot Kebun & Status Verifikasi Desa */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              {isOfficerOrAdmin
                ? `Daftar Plot Kebun & Verifikasi Kantor Desa (${farms.length} Plot)`
                : `Daftar Sebaran Plot Kebun Rempah (${farms.length} Plot)`}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              {isOfficerOrAdmin
                ? 'Verifikasi dan sahkan pendaftaran lahan dari kelompok tani Banda Neira.'
                : 'Informasi luasan, komoditas, dan status persetujuan lahan oleh Kantor Desa.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['', 'pending', 'verified'].map((st) => {
              const label = st === '' ? 'Semua' : st === 'pending' ? 'Menunggu Persetujuan' : 'Disetujui'
              const count = st === '' ? farms.length : farms.filter((f) => f.verification_status === st).length
              const active = farmStatusFilter === st
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFarmStatusFilter(st)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: active ? '2px solid #047857' : '1px solid #cbd5e1',
                    background: active ? '#047857' : '#f8fafc',
                    color: active ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                  }}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.65rem' }}>Kode & Nama Kebun</th>
                <th style={{ padding: '0.65rem' }}>Komoditas</th>
                <th style={{ padding: '0.65rem' }}>Luas (m²)</th>
                <th style={{ padding: '0.65rem' }}>Lokasi / Koordinat</th>
                <th style={{ padding: '0.65rem' }}>Status Verifikasi</th>
                {isOfficerOrAdmin && <th style={{ padding: '0.65rem', textAlign: 'center' }}>Tindakan Kantor Desa</th>}
              </tr>
            </thead>
            <tbody>
              {farms
                .filter((f) => !farmStatusFilter || f.verification_status === farmStatusFilter)
                .map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <td style={{ padding: '0.65rem' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>{f.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{f.farm_code}</span>
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      <span className={`badge ${f.primary_commodity.toLowerCase().includes('pala') ? 'badge-blue' : 'badge-green'}`}>
                        {f.primary_commodity}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem', fontWeight: '600' }}>
                      {f.area_sqm.toLocaleString()} m²
                    </td>
                    <td style={{ padding: '0.65rem', fontSize: '0.8rem', color: '#475569' }}>
                      {f.location_description || '-'}<br />
                      <small style={{ color: '#94a3b8' }}>{f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}</small>
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background:
                            f.verification_status === 'verified'
                              ? '#ecfdf5'
                              : f.verification_status === 'pending'
                              ? '#fffbeb'
                              : '#fef2f2',
                          color:
                            f.verification_status === 'verified'
                              ? '#047857'
                              : f.verification_status === 'pending'
                              ? '#b45309'
                              : '#b91c1c',
                        }}
                      >
                        {f.verification_status === 'verified'
                          ? '✓ TERVERIFIKASI'
                          : f.verification_status === 'pending'
                          ? '⏳ MENUNGGU PERSETUJUAN'
                          : '✕ DITOLAK'}
                      </span>
                    </td>
                    {isOfficerOrAdmin && (
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                        {f.verification_status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              disabled={verifyingFarmId === f.id}
                              onClick={() => handleVerifyFarm(f.id, 'verified')}
                              style={{
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '5px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              {verifyingFarmId === f.id ? '...' : '✓ Setujui'}
                            </button>
                            <button
                              type="button"
                              disabled={verifyingFarmId === f.id}
                              onClick={() => handleVerifyFarm(f.id, 'rejected')}
                              style={{
                                background: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '5px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              {verifyingFarmId === f.id ? '...' : '✕ Tolak'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {f.verification_status === 'verified' ? '✓ Disahkan Desa' : 'Ditolak'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              {farms.length === 0 && (
                <tr>
                  <td colSpan={isOfficerOrAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                    Belum ada plot kebun terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
