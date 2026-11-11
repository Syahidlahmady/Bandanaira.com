import React, { useEffect, useState } from 'react'
import { Farm, Farmer, FarmerGroup, FarmGeoJSONFeatureCollection, FarmStatistics, farmerService } from '../services/farmers'
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
  const [checkingBoundary, setCheckingBoundary] = useState(false)
  const [boundaryCheckMsg, setBoundaryCheckMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null)

  const handleAutoGenerateAndCheckPolygon = async (lat: number, lng: number) => {
    if (!lat || !lng) {
      setBoundaryCheckMsg({ type: 'warning', text: 'Harap isi koordinat Latitude dan Longitude terlebih dahulu.' })
      return
    }
    setCheckingBoundary(true)
    setBoundaryCheckMsg(null)
    const d = 0.00045 // ~50m perimeter (~10,000 m2)
    const polyGeoJSON = {
      type: 'Polygon',
      coordinates: [
        [
          [lng - d, lat - d],
          [lng + d, lat - d],
          [lng + d, lat + d],
          [lng - d, lat + d],
          [lng - d, lat - d],
        ],
      ],
    }

    try {
      const res = await farmerService.validateBoundary({
        polygon_boundary_geojson: polyGeoJSON,
      })

      if (!res.is_valid) {
        setBoundaryCheckMsg({ type: 'error', text: `Format poligon tidak valid: ${res.message}` })
      } else if (res.has_overlap) {
        setBoundaryCheckMsg({
          type: 'warning',
          text: `⚠️ Peringatan Tumpang Tindih Batas (PostGIS): ${res.message} Harap sesuaikan titik koordinat kebun.`,
        })
      } else {
        setBoundaryCheckMsg({
          type: 'success',
          text: `✓ Batas poligon bebas tumpang tindih! Luas kalkulasi geodesik otomatis: ${res.calculated_area_sqm.toLocaleString()} m². Batas koordinat telah dipetakan ke formulir.`,
        })
        setFarmForm((prev: any) => ({
          ...prev,
          area_sqm: res.calculated_area_sqm,
          polygon_boundary_geojson: polyGeoJSON,
        }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server validasi batas'
      setBoundaryCheckMsg({ type: 'error', text: msg })
    } finally {
      setCheckingBoundary(false)
    }
  }

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
    <section className="app-card animate-fade-in" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">GIS & PostGIS Spasial</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              &bull; Wilayah Kepulauan Banda
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>
            {isFarmerOnly
              ? 'Peta Sebaran Lahan Perkebunan Rempah'
              : isFarmerGroupAdmin && !isOfficerOrAdmin
              ? 'Peta & Pengajuan Plot Kebun Kelompok Tani'
              : 'Pemetaan Spasial & Verifikasi Lahan Rempah'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isFarmerOnly
              ? 'Visualisasi titik koordinat kebun pala & cengkih Banda Neira. Mode tinjau data petani.'
              : isFarmerGroupAdmin && !isOfficerOrAdmin
              ? 'Pendaftaran plot kebun baru kelompok tani yang akan diverifikasi oleh Petugas Kantor Desa Banda Neira.'
              : 'Visualisasi titik koordinat kebun pala & cengkih Banda Neira menggunakan PostGIS dan validasi persetujuan desa.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleExportFarmsCSV}
            className="btn btn-outline-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            📥 Export CSV ({farms.length})
          </button>
          <button
            onClick={fetchFarmingData}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            🔄 Segarkan Peta
          </button>
        </div>
      </div>

      {farmStats && (
        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ borderTop: '4px solid var(--emerald-600)' }}>
            <span className="stat-label">Petani Terdaftar</span>
            <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>
              {farmStats.total_farmers}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profil pekebun aktif</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--ocean-600)' }}>
            <span className="stat-label">Kelompok Tani</span>
            <div className="stat-value" style={{ color: 'var(--ocean-600)' }}>
              {farmStats.total_farmer_groups}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Poktan terdata desa</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #7c3aed' }}>
            <span className="stat-label">Total Plot Kebun</span>
            <div className="stat-value" style={{ color: '#7c3aed' }}>
              {farmStats.total_farms}
            </div>
            <span className="badge badge-emerald" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
              ✓ {farms.filter((f) => f.verification_status === 'verified').length} Terverifikasi
            </span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #0f172a' }}>
            <span className="stat-label">Total Luas Lahan</span>
            <div className="stat-value" style={{ color: '#0f172a' }}>
              {farmStats.total_area_sqm.toLocaleString()} m²
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hasil geodesik PostGIS</span>
          </div>
        </div>
      )}

      {isOfficerOrAdmin && farms.filter((f) => f.verification_status === 'pending').length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 700 }}>
                Menunggu Verifikasi Persetujuan Kantor Desa
              </div>
              <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                Terdapat <b>{farms.filter((f) => f.verification_status === 'pending').length}</b> plot kebun yang diajukan oleh kelompok tani dan memerlukan pemeriksaan.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFarmStatusFilter('pending')}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', background: '#d97706', borderColor: '#b45309' }}
          >
            Tinjau Sekarang ↓
          </button>
        </div>
      )}

      {farmMsg && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: farmMsg.type === 'success' ? 'var(--secondary-light)' : 'var(--danger-light)',
            color: farmMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${farmMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {farmMsg.text}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <FarmMap features={farmGeoJSON.features} />
      </div>

      {/* Mode Tinjau Petani (Read-Only) */}
      {isFarmerOnly && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>ℹ️</span>
          <div style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
            <b>Mode Tinjau Petani:</b> Petani hanya dapat melihat data dan sebaran plot lahan kebun. Penambahan atau pemetaan lahan baru didaftarkan secara kolektif oleh <b>Pengurus Kelompok Tani</b> dan memerlukan persetujuan verifikasi resmi dari <b>Petugas Kantor Desa Banda Neira</b>.
          </div>
        </div>
      )}

      {/* Form Pengajuan Plot Kebun Baru (Khusus Kelompok Tani) */}
      {isFarmerGroupAdmin && !isOfficerOrAdmin && (
        <details
          style={{
            marginBottom: '1.5rem',
            background: 'rgba(248, 250, 252, 0.8)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
          open
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
            🌾 Ajukan Plot Kebun Baru (Kelompok Tani ke Kantor Desa)
          </summary>
          <div
            style={{
              marginTop: '0.75rem',
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '0.85rem',
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
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Petani Pemilik Lahan</label>
              <select
                value={farmForm.farmer_id}
                onChange={(e) => setFarmForm({ ...farmForm, farmer_id: e.target.value })}
                className="form-control"
              >
                <option value="">-- Pilih Petani Anggota Poktan --</option>
                {farmers.map((frm) => (
                  <option key={frm.id} value={frm.id}>
                    {frm.name} ({frm.farmer_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kode Plot Kebun</label>
              <input
                type="text"
                value={farmForm.farm_code}
                onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Kebun</label>
              <input
                type="text"
                placeholder="Mis. Kebun Pala Lonthoir Timur"
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Komoditas Utama</label>
              <select
                value={farmForm.primary_commodity}
                onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                className="form-control"
              >
                <option value="Pala">Pala</option>
                <option value="Cengkih">Cengkih</option>
                <option value="Kayu Manis">Kayu Manis</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Luas Lahan (m²)</label>
              <input
                type="number"
                value={farmForm.area_sqm}
                onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.latitude}
                onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.longitude}
                onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) })}
                required
                className="form-control"
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleAutoGenerateAndCheckPolygon(farmForm.latitude, farmForm.longitude)}
                disabled={checkingBoundary}
                className="btn btn-outline-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
              >
                {checkingBoundary ? '⏳ Memeriksa Batas...' : '📐 Hitung Poligon & Uji Tumpang Tindih (PostGIS)'}
              </button>
              {boundaryCheckMsg && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color:
                      boundaryCheckMsg.type === 'success'
                        ? 'var(--emerald-600)'
                        : boundaryCheckMsg.type === 'warning'
                        ? '#b45309'
                        : 'var(--rose-600)',
                  }}
                >
                  {boundaryCheckMsg.text}
                </span>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.4rem' }}
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
            background: 'rgba(248, 250, 252, 0.8)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
            ➕ Tambah / Petakan Plot Kebun Baru Langsung (Kantor Desa)
          </summary>
          <form
            onSubmit={handleCreateQuickFarmerAndFarm}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Kode Kebun</label>
              <input
                type="text"
                value={farmForm.farm_code}
                onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Kebun</label>
              <input
                type="text"
                placeholder="Mis. Kebun Pala Selamon"
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Komoditas</label>
              <select
                value={farmForm.primary_commodity}
                onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                className="form-control"
              >
                <option value="Pala">Pala</option>
                <option value="Cengkih">Cengkih</option>
                <option value="Kayu Manis">Kayu Manis</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Luas (m²)</label>
              <input
                type="number"
                value={farmForm.area_sqm}
                onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.latitude}
                onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) })}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                value={farmForm.longitude}
                onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) })}
                required
                className="form-control"
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleAutoGenerateAndCheckPolygon(farmForm.latitude, farmForm.longitude)}
                disabled={checkingBoundary}
                className="btn btn-outline-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
              >
                {checkingBoundary ? '⏳ Memeriksa Batas...' : '📐 Hitung Poligon & Uji Tumpang Tindih (PostGIS)'}
              </button>
              {boundaryCheckMsg && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color:
                      boundaryCheckMsg.type === 'success'
                        ? 'var(--emerald-600)'
                        : boundaryCheckMsg.type === 'warning'
                        ? '#b45309'
                        : 'var(--rose-600)',
                  }}
                >
                  {boundaryCheckMsg.text}
                </span>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.4rem' }}
              >
                Simpan & Sahkan di Peta
              </button>
            </div>
          </form>
        </details>
      )}

      {/* Tabel Daftar Plot Kebun & Status Verifikasi Desa */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {isOfficerOrAdmin
                ? `Daftar Plot Kebun & Verifikasi Kantor Desa (${farms.length} Plot)`
                : `Daftar Sebaran Plot Kebun Rempah (${farms.length} Plot)`}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              {isOfficerOrAdmin
                ? 'Verifikasi dan sahkan pendaftaran lahan dari kelompok tani Banda Neira.'
                : 'Informasi luasan, komoditas, dan status persetujuan lahan oleh Kantor Desa.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
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
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode & Nama Kebun</th>
                <th>Komoditas</th>
                <th>Luas (m²)</th>
                <th>Lokasi / Koordinat</th>
                <th>Status Verifikasi</th>
                {isOfficerOrAdmin && <th style={{ textAlign: 'center' }}>Tindakan Kantor Desa</th>}
              </tr>
            </thead>
            <tbody>
              {farms
                .filter((f) => !farmStatusFilter || f.verification_status === farmStatusFilter)
                .map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{f.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.farm_code}</span>
                    </td>
                    <td>
                      <span className={`badge ${f.primary_commodity.toLowerCase().includes('pala') ? 'badge-blue' : 'badge-emerald'}`}>
                        {f.primary_commodity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {f.area_sqm.toLocaleString()} m²
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {f.location_description || '-'}<br />
                      <small style={{ color: 'var(--text-muted)' }}>{f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}</small>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          f.verification_status === 'verified'
                            ? 'badge-emerald'
                            : f.verification_status === 'pending'
                            ? 'badge-amber'
                            : 'badge-rose'
                        }`}
                      >
                        {f.verification_status === 'verified'
                          ? '✓ TERVERIFIKASI'
                          : f.verification_status === 'pending'
                          ? '⏳ MENUNGGU PERSETUJUAN'
                          : '✕ DITOLAK'}
                      </span>
                    </td>
                    {isOfficerOrAdmin && (
                      <td style={{ textAlign: 'center' }}>
                        {f.verification_status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              disabled={verifyingFarmId === f.id}
                              onClick={() => handleVerifyFarm(f.id, 'verified')}
                              className="btn btn-xs btn-success"
                            >
                              {verifyingFarmId === f.id ? '...' : '✓ Setujui'}
                            </button>
                            <button
                              type="button"
                              disabled={verifyingFarmId === f.id}
                              onClick={() => handleVerifyFarm(f.id, 'rejected')}
                              className="btn btn-xs btn-danger"
                            >
                              {verifyingFarmId === f.id ? '...' : '✕ Tolak'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {f.verification_status === 'verified' ? '✓ Disahkan Desa' : 'Ditolak'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              {farms.length === 0 && (
                <tr>
                  <td colSpan={isOfficerOrAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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
