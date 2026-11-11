import React, { useEffect } from 'react'
import {
  Download,
  RefreshCw,
  Search,
  PlusCircle,
  CheckCircle2,
  X,
  Users,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { Resident, ResidentCreateInput, PopulationStatistics } from '../services/population'
import { BANDA_OCCUPATIONS, getOccupationBadge } from '../components/OccupationBadge'

interface ResidentsWorkspaceProps {
  residents: Resident[]
  popStats: PopulationStatistics | null
  loadingPop: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedOccupationFilter: string
  setSelectedOccupationFilter: (occ: string) => void
  popMsg: { type: 'success' | 'error'; text: string } | null
  popForm: ResidentCreateInput
  setPopForm: React.Dispatch<React.SetStateAction<ResidentCreateInput>>
  fetchPopulationData: (query?: string, occ?: string) => void
  handleCreateResident: (e: React.FormEvent) => void
  handleVerifyResident: (id: string, status: 'verified' | 'rejected') => void
}

export const ResidentsWorkspace: React.FC<ResidentsWorkspaceProps> = ({
  residents,
  popStats,
  loadingPop,
  searchQuery,
  setSearchQuery,
  selectedOccupationFilter,
  setSelectedOccupationFilter,
  popMsg,
  popForm,
  setPopForm,
  fetchPopulationData,
  handleCreateResident,
  handleVerifyResident,
}) => {
  // Auto-save form draft in localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('banda_draft_resident')
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed.full_name && !popForm.full_name) {
          setPopForm((prev) => ({ ...prev, ...parsed }))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (popForm.full_name) {
      try {
        localStorage.setItem('banda_draft_resident', JSON.stringify(popForm))
      } catch {
        // ignore
      }
    }
  }, [popForm])

  const handleExportCSV = () => {
    if (residents.length === 0) {
      alert('Tidak ada data penduduk untuk diekspor.')
      return
    }
    const headers = ['NIK', 'Nama Lengkap', 'Jenis Kelamin', 'Mata Pencaharian', 'Desa', 'RT', 'RW', 'Status Verifikasi', 'Tanggal Daftar']
    const rows = residents.map((r) => [
      `'${r.nik}`,
      `"${r.full_name.replace(/"/g, '""')}"`,
      r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${(r.occupation || '-').replace(/"/g, '""')}"`,
      r.village || 'Lonthoir',
      r.rt || '-',
      r.rw || '-',
      r.verification_status,
      r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data-penduduk-banda-neira-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="app-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Pemerintahan &amp; Kependudukan
            </span>
            <h2 style={{ fontSize: '1.45rem', color: '#f8fafc', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Administrasi Kependudukan Sipil Desa
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              Pengelolaan profil identitas warga, penataan profesi khas Banda, verifikasi berkas, &amp; audit mutasi data.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-sm btn-success"
            title="Unduh seluruh data kependudukan ke file CSV"
            style={{ fontWeight: 700 }}
          >
            <Download size={14} /> Ekspor CSV ({residents.length})
          </button>
          <button
            onClick={() => fetchPopulationData()}
            disabled={loadingPop}
            className="btn btn-sm btn-secondary"
            title="Muat ulang data kependudukan dari server"
          >
            <RefreshCw size={14} className={loadingPop ? 'animate-spin' : ''} />
            {loadingPop ? 'Memuat...' : 'Segarkan Data'}
          </button>
        </div>
      </div>

      {/* KPI Stats Bento Grid */}
      {popStats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div className="stat-card" style={{ borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Total Penduduk</span>
              <Users size={17} color="#38bdf8" />
            </div>
            <div className="stat-value">
              {popStats.total_residents} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>Jiwa</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Terverifikasi Sah</span>
              <ShieldCheck size={17} color="#34d399" />
            </div>
            <div className="stat-value" style={{ color: '#34d399' }}>
              {popStats.total_verified} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>Warga</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Menunggu Verifikasi</span>
              <Clock size={17} color="#fbbf24" />
            </div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>
              {popStats.total_pending} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>Berkas</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Komposisi Gender</span>
              <span style={{ fontSize: '0.85rem' }}>⚖️</span>
            </div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: '#c084fc' }}>
              {popStats.gender_distribution['L'] || 0} L &bull; {popStats.gender_distribution['P'] || 0} P
            </div>
          </div>
        </div>
      )}

      {/* Form Tambah Penduduk (Collapsible Bento Card) */}
      <details
        style={{
          marginBottom: '1.75rem',
          background: 'rgba(15, 23, 42, 0.65)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            fontWeight: 800,
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.925rem',
            letterSpacing: '0.01em',
          }}
        >
          <PlusCircle size={17} /> Form Registrasi Penduduk Baru (Pendaftaran Warga)
        </summary>
        <form
          onSubmit={handleCreateResident}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.15rem',
            marginTop: '1.25rem',
          }}
        >
          <div>
            <label className="form-label">NIK (16 Digit Wajib)</label>
            <input
              type="text"
              value={popForm.nik}
              onChange={(e) => setPopForm({ ...popForm, nik: e.target.value })}
              required
              pattern="^\d{16}$"
              className="form-control"
              placeholder="Contoh: 8171010101900001"
            />
          </div>
          <div>
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              value={popForm.full_name}
              onChange={(e) => setPopForm({ ...popForm, full_name: e.target.value })}
              required
              className="form-control"
              placeholder="Nama sesuai KTP..."
            />
          </div>
          <div>
            <label className="form-label">Jenis Kelamin</label>
            <select
              value={popForm.gender}
              onChange={(e) => setPopForm({ ...popForm, gender: e.target.value as 'L' | 'P' })}
              className="form-control"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Mata Pencaharian / Profesi Khas Banda</label>
            <select
              value={popForm.occupation || 'Petani Rempah Pala'}
              onChange={(e) => setPopForm({ ...popForm, occupation: e.target.value })}
              className="form-control"
            >
              {BANDA_OCCUPATIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
            <button
              type="submit"
              className="btn btn-success"
              style={{ fontWeight: 800, padding: '0.75rem 1.6rem' }}
            >
              <CheckCircle2 size={16} /> Simpan Data Penduduk
            </button>
          </div>
        </form>
      </details>

      {popMsg && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            background: popMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: popMsg.type === 'success' ? '#a7f3d0' : '#fca5a5',
            border: `1px solid ${popMsg.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          {popMsg.type === 'success' ? <CheckCircle2 size={17} color="#34d399" /> : <X size={17} color="#f87171" />}
          {popMsg.text}
        </div>
      )}

      {/* Sebaran Mata Pencaharian Warga Banda Neira Chips */}
      {popStats && popStats.top_occupations && Object.keys(popStats.top_occupations).length > 0 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '1.25rem 1.4rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.35rem' }}>🏝️</span>
              <div>
                <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Sebaran Mata Pencaharian Warga Kepulauan Banda
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                  Klik chip profesi di bawah untuk memfilter daftar penduduk seketika:
                </p>
              </div>
            </div>
            {selectedOccupationFilter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedOccupationFilter('')
                  fetchPopulationData(searchQuery, '')
                }}
                className="btn btn-sm btn-secondary"
                style={{
                  color: '#fca5a5',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.15)',
                }}
              >
                <X size={13} /> Hapus Filter ({selectedOccupationFilter})
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedOccupationFilter('')
                fetchPopulationData(searchQuery, '')
              }}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: selectedOccupationFilter === '' ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.12)',
                background: selectedOccupationFilter === '' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedOccupationFilter === '' ? '#38bdf8' : '#cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s',
              }}
            >
              <span>Semua Pekerjaan</span>
              <span
                style={{
                  background: selectedOccupationFilter === '' ? '#06b6d4' : 'rgba(255, 255, 255, 0.12)',
                  color: selectedOccupationFilter === '' ? '#080c14' : '#cbd5e1',
                  borderRadius: '10px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                }}
              >
                {popStats.total_residents}
              </span>
            </button>

            {Object.entries(popStats.top_occupations).map(([occ, count]) => {
              const isSelected = selectedOccupationFilter === occ
              let icon = '👤'
              if (occ.toLowerCase().includes('pala')) icon = '🌿'
              else if (occ.toLowerCase().includes('nelayan') || occ.toLowerCase().includes('laut')) icon = '🐟'
              else if (occ.toLowerCase().includes('cengkeh')) icon = '🌾'
              else if (occ.toLowerCase().includes('fuli') || occ.toLowerCase().includes('pengolah')) icon = '🌺'
              else if (occ.toLowerCase().includes('wisata')) icon = '⛵'
              else if (occ.toLowerCase().includes('desa') || occ.toLowerCase().includes('asn') || occ.toLowerCase().includes('guru')) icon = '🏛️'

              return (
                <button
                  type="button"
                  key={occ}
                  onClick={() => {
                    const next = isSelected ? '' : occ
                    setSelectedOccupationFilter(next)
                    fetchPopulationData(searchQuery, next)
                  }}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#34d399' : '#cbd5e1',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{icon}</span>
                  <span>{occ}</span>
                  <span
                    style={{
                      background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                      color: isSelected ? '#080c14' : '#cbd5e1',
                      borderRadius: '10px',
                      padding: '0.1rem 0.45rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            placeholder="Cari warga berdasarkan Nama, NIK, atau Pekerjaan (contoh: pala, nelayan, cengkeh)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPopulationData()}
            className="form-control"
            style={{ paddingLeft: '2.65rem' }}
          />
        </div>

        <select
          value={selectedOccupationFilter}
          onChange={(e) => {
            const val = e.target.value
            setSelectedOccupationFilter(val)
            fetchPopulationData(searchQuery, val)
          }}
          className="form-control"
          style={{ width: 'auto', minWidth: '220px' }}
        >
          <option value="">Semua Kategori Pekerjaan</option>
          {BANDA_OCCUPATIONS.map((occ) => (
            <option key={occ} value={occ}>
              {occ}
            </option>
          ))}
        </select>

        <button
          onClick={() => fetchPopulationData()}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <Search size={15} /> Cari
        </button>

        {(searchQuery || selectedOccupationFilter) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedOccupationFilter('')
              fetchPopulationData('', '')
            }}
            className="btn btn-secondary"
          >
            Reset
          </button>
        )}
      </div>

      {/* Residents Cyber Data Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIK Penduduk</th>
              <th>Nama Lengkap</th>
              <th>Gender</th>
              <th>Mata Pencaharian (Banda)</th>
              <th>Status Verifikasi</th>
              <th style={{ textAlign: 'center' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#38bdf8', fontWeight: 600 }}>
                  {r.nik}
                </td>
                <td style={{ fontWeight: 700, color: '#f8fafc' }}>{r.full_name}</td>
                <td style={{ color: '#cbd5e1' }}>{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                <td>{getOccupationBadge(r.occupation)}</td>
                <td>
                  <span
                    className={`badge ${
                      r.verification_status === 'verified'
                        ? 'badge-emerald'
                        : r.verification_status === 'pending'
                        ? 'badge-amber'
                        : 'badge-red'
                    }`}
                  >
                    {r.verification_status === 'verified' ? (
                      <>
                        <CheckCircle2 size={11} /> Terverifikasi
                      </>
                    ) : r.verification_status === 'pending' ? (
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
                <td style={{ textAlign: 'center' }}>
                  {r.verification_status !== 'verified' && (
                    <button
                      onClick={() => handleVerifyResident(r.id, 'verified')}
                      className="btn btn-sm btn-success"
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      title="Verifikasi keabsahan identitas warga"
                    >
                      Verifikasi
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {residents.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
                  <p style={{ fontWeight: 800, margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
                    Tidak ada data penduduk yang cocok
                  </p>
                  <p style={{ fontSize: '0.825rem', marginTop: '0.35rem', color: '#94a3b8' }}>
                    Coba periksa kata kunci pencarian atau ubah filter kategori pekerjaan yang dipilih.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
