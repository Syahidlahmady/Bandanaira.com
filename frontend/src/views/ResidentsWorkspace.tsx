import React, { useEffect } from 'react'
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
        // only restore if current form is blank/default
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
          <h2 style={{ fontSize: '1.35rem', color: '#1e3a8a', fontWeight: 'bold' }}>
            Modul Administrasi Kependudukan Desa
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Pengelolaan profil warga, verifikasi identitas, dan audit trail mutasi data.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleExportCSV}
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
            📥 Export CSV ({residents.length})
          </button>
          <button
            onClick={() => fetchPopulationData()}
            disabled={loadingPop}
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
            {loadingPop ? 'Memuat...' : 'Segarkan Data'}
          </button>
        </div>
      </div>

      {popStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Penduduk</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '0.2rem' }}>
              {popStats.total_residents}
            </p>
          </div>
          <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <span style={{ fontSize: '0.8rem', color: '#047857' }}>Terverifikasi</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#059669', marginTop: '0.2rem' }}>
              {popStats.total_verified}
            </p>
          </div>
          <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '0.8rem', color: '#b45309' }}>Menunggu Verifikasi</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#d97706', marginTop: '0.2rem' }}>
              {popStats.total_pending}
            </p>
          </div>
          <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Gender (L / P)</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#334155', marginTop: '0.2rem' }}>
              {popStats.gender_distribution['L'] || 0} L / {popStats.gender_distribution['P'] || 0} P
            </p>
          </div>
        </div>
      )}

      <details style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#1e40af' }}>
          + Tambah Penduduk Baru (Data Sintetis Banda Neira)
        </summary>
        <form onSubmit={handleCreateResident} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>NIK (16 Digit)</label>
            <input
              type="text"
              value={popForm.nik}
              onChange={(e) => setPopForm({ ...popForm, nik: e.target.value })}
              required
              pattern="^\d{16}$"
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Nama Lengkap</label>
            <input
              type="text"
              value={popForm.full_name}
              onChange={(e) => setPopForm({ ...popForm, full_name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Jenis Kelamin</label>
            <select
              value={popForm.gender}
              onChange={(e) => setPopForm({ ...popForm, gender: e.target.value as 'L' | 'P' })}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
              Mata Pencaharian / Pekerjaan Khas Banda
            </label>
            <select
              value={popForm.occupation || 'Petani Rempah Pala'}
              onChange={(e) => setPopForm({ ...popForm, occupation: e.target.value })}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b' }}
            >
              {BANDA_OCCUPATIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <button
              type="submit"
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Simpan Penduduk
            </button>
          </div>
        </form>
      </details>

      {popMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.65rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: popMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: popMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${popMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {popMsg.text}
        </div>
      )}

      {/* Sebaran Mata Pencaharian Warga Banda Neira */}
      {popStats && popStats.top_occupations && Object.keys(popStats.top_occupations).length > 0 && (
        <div
          style={{
            background: '#f8fafc',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem' }}>🏝️</span>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>
                  Sebaran Mata Pencaharian Warga Kepulauan Banda
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                  Klik kategori pekerjaan di bawah untuk memfilter data penduduk seketika:
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
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                ✕ Hapus Filter ({selectedOccupationFilter})
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedOccupationFilter('')
                fetchPopulationData(searchQuery, '')
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: selectedOccupationFilter === '' ? '2px solid #1e40af' : '1px solid #cbd5e1',
                background: selectedOccupationFilter === '' ? '#eff6ff' : '#ffffff',
                color: selectedOccupationFilter === '' ? '#1e40af' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Semua Pekerjaan</span>
              <span
                style={{
                  background: selectedOccupationFilter === '' ? '#1e40af' : '#e2e8f0',
                  color: selectedOccupationFilter === '' ? '#ffffff' : '#475569',
                  borderRadius: '10px',
                  padding: '0.05rem 0.4rem',
                  fontSize: '0.7rem',
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
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: isSelected ? '#ecfdf5' : '#ffffff',
                    color: isSelected ? '#047857' : '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>{icon}</span>
                  <span>{occ}</span>
                  <span
                    style={{
                      background: isSelected ? '#059669' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#334155',
                      borderRadius: '10px',
                      padding: '0.05rem 0.4rem',
                      fontSize: '0.7rem',
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

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari warga berdasarkan Nama, NIK, atau Pekerjaan (contoh: pala, nelayan, cengkeh)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPopulationData()}
          style={{ flex: 1, minWidth: '240px', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
        />
        <select
          value={selectedOccupationFilter}
          onChange={(e) => {
            const val = e.target.value
            setSelectedOccupationFilter(val)
            fetchPopulationData(searchQuery, val)
          }}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', color: '#334155', fontWeight: '500' }}
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
          style={{
            background: '#1e40af',
            color: '#ffffff',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Cari
        </button>
        {(searchQuery || selectedOccupationFilter) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedOccupationFilter('')
              fetchPopulationData('', '')
            }}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.65rem' }}>NIK</th>
              <th style={{ padding: '0.65rem' }}>Nama Lengkap</th>
              <th style={{ padding: '0.65rem' }}>Gender</th>
              <th style={{ padding: '0.65rem' }}>Mata Pencaharian (Banda)</th>
              <th style={{ padding: '0.65rem' }}>Status Verifikasi</th>
              <th style={{ padding: '0.65rem' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem', fontFamily: 'monospace' }}>{r.nik}</td>
                <td style={{ padding: '0.65rem', fontWeight: '600', color: '#0f172a' }}>{r.full_name}</td>
                <td style={{ padding: '0.65rem' }}>{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                <td style={{ padding: '0.65rem' }}>{getOccupationBadge(r.occupation)}</td>
                <td style={{ padding: '0.65rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      background: r.verification_status === 'verified' ? '#ecfdf5' : r.verification_status === 'pending' ? '#fffbeb' : '#fef2f2',
                      color: r.verification_status === 'verified' ? '#047857' : r.verification_status === 'pending' ? '#b45309' : '#b91c1c',
                    }}
                  >
                    {r.verification_status === 'verified' ? '✓ TERVERIFIKASI' : r.verification_status === 'pending' ? '⏳ MENUNGGU' : '✕ DITOLAK'}
                  </span>
                </td>
                <td style={{ padding: '0.65rem' }}>
                  {r.verification_status !== 'verified' && (
                    <button
                      onClick={() => handleVerifyResident(r.id, 'verified')}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Verifikasi
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {residents.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔍</div>
                  <p style={{ fontWeight: '600', margin: 0 }}>Tidak ada data penduduk yang cocok</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Coba periksa kata kunci pencarian atau ubah filter pekerjaan yang dipilih.
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
