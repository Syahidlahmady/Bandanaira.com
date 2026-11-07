import React from 'react'
import { User } from '../services/auth'

interface CitizenPortalWorkspaceProps {
  currentUser: User | null
  letters: Array<{ id: number; type: string; purpose: string; date: string; status: 'menunggu' | 'disetujui' }>
  showLetterForm: boolean
  setShowLetterForm: (b: boolean) => void
  letterTypeInput: string
  setLetterTypeInput: (s: string) => void
  letterPurposeInput: string
  setLetterPurposeInput: (s: string) => void
  handleSubmitLetter: (e: React.FormEvent) => void
  letterSuccessNotice: string | null
}

export const CitizenPortalWorkspace: React.FC<CitizenPortalWorkspaceProps> = ({
  currentUser,
  letters,
  showLetterForm,
  setShowLetterForm,
  letterTypeInput,
  setLetterTypeInput,
  letterPurposeInput,
  setLetterPurposeInput,
  handleSubmitLetter,
  letterSuccessNotice,
}) => {
  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '2.5rem' }}>🏛️</div>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#1e3a8a', fontWeight: 'bold' }}>
            Portal Pelayanan Mandiri Warga Banda Neira
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Akses layanan administrasi surat kependudukan, pengajuan berkas, dan verifikasi identitas warga desa.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
            👤 Profil Kependudukan Anda
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
            <b>Nama Lengkap:</b> {currentUser?.full_name}<br />
            <b>Email Terdaftar:</b> {currentUser?.email}<br />
            <b>Peran Sistem:</b> Warga Terdaftar (Resident)<br />
            <b>Status Identitas:</b> <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ TERDAFTAR DI DESA</span>
          </p>
        </div>

        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}>
            📝 Layanan Surat Administrasi Desa
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '0.75rem' }}>
            Ajukan permohonan surat keterangan secara digital langsung ke kantor desa tanpa perlu antre fisik.
          </p>
          <ul style={{ fontSize: '0.8rem', color: '#166534', paddingLeft: '1.2rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
            <li>Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)</li>
            <li>Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)</li>
            <li>Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah</li>
            <li>Surat Domisili Tempat Tinggal & Administrasi Kependudukan</li>
          </ul>
          <button
            type="button"
            onClick={() => setShowLetterForm(!showLetterForm)}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {showLetterForm ? 'Tutup Formulir' : '+ Ajukan Permohonan Surat Baru'}
          </button>
        </div>
      </div>

      {/* Form Pengajuan Surat Interaktif */}
      {showLetterForm && (
        <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Formulir Pengajuan Surat Mandiri
          </h4>
          <form onSubmit={handleSubmitLetter} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.25rem' }}>
                Jenis Surat yang Dibutuhkan
              </label>
              <select
                value={letterTypeInput}
                onChange={(e) => setLetterTypeInput(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)">Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)</option>
                <option value="Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)">Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)</option>
                <option value="Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah">Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah</option>
                <option value="Surat Keterangan Domisili Tempat Tinggal">Surat Keterangan Domisili Tempat Tinggal</option>
                <option value="Surat Pengantar Pembuatan KTP / Kartu Keluarga">Surat Pengantar Pembuatan KTP / Kartu Keluarga</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.25rem' }}>
                Keperluan / Catatan Tambahan
              </label>
              <input
                type="text"
                value={letterPurposeInput}
                onChange={(e) => setLetterPurposeInput(e.target.value)}
                placeholder="Contoh: Untuk persyaratan pengajuan KUR di Bank..."
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: '#16a34a', borderColor: '#15803d', padding: '0.5rem 1.25rem' }}
              >
                Kirim Permohonan ke Kantor Desa
              </button>
              <button
                type="button"
                onClick={() => setShowLetterForm(false)}
                className="btn btn-secondary"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {letterSuccessNotice && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.85rem' }}>
          ✅ {letterSuccessNotice}
        </div>
      )}

      {/* Daftar Riwayat Permohonan Surat */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Riwayat Pengajuan Surat Anda ({letters.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {letters.map((letItem) => (
            <div
              key={letItem.id}
              style={{
                padding: '0.85rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <b style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{letItem.type}</b>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Keperluan: {letItem.purpose} &bull; Tanggal: {letItem.date}
                </span>
              </div>
              <span
                className={`badge ${letItem.status === 'disetujui' ? 'badge-green' : 'badge-amber'}`}
              >
                {letItem.status === 'disetujui' ? '✅ Disetujui (Siap Diambil)' : '⏳ Sedang Ditinjau Petugas'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
