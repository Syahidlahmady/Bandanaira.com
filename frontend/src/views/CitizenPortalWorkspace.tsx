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
    <section className="app-card animate-fade-in" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--ocean-600) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
          🏛️
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-blue">Portal Layanan Mandiri</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desa Banda Neira</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>
            Pelayanan Administrasi Warga
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Akses layanan administrasi surat kependudukan, pengajuan berkas, dan verifikasi identitas warga desa.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
        <div style={{ background: 'rgba(248, 250, 252, 0.85)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>👤</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Profil Kependudukan Anda
            </h3>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Nama Lengkap</span>
              <b>{currentUser?.full_name}</b>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Email Terdaftar</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>{currentUser?.email}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Peran Sistem</span>
              <span>Warga Terdaftar (Resident)</span>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <span className="badge badge-emerald">
                ✓ IDENTITAS TERDAFTAR DI DESA
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5, 150, 105, 0.25)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📝</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534', margin: 0 }}>
              Layanan Surat Administrasi Desa
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Ajukan permohonan surat keterangan secara digital langsung ke kantor desa tanpa perlu antre fisik.
          </p>
          <ul style={{ fontSize: '0.8rem', color: '#166534', paddingLeft: '1.2rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            <li>Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)</li>
            <li>Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)</li>
            <li>Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah</li>
            <li>Surat Domisili Tempat Tinggal & Administrasi Kependudukan</li>
          </ul>
          <button
            type="button"
            onClick={() => setShowLetterForm(!showLetterForm)}
            className="btn btn-success"
            style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.55rem 1.25rem' }}
          >
            {showLetterForm ? '✕ Tutup Formulir' : '➕ Ajukan Permohonan Surat Baru'}
          </button>
        </div>
      </div>

      {/* Form Pengajuan Surat Interaktif */}
      {showLetterForm && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(248, 250, 252, 0.9)', padding: '1.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Formulir Pengajuan Surat Mandiri
          </h4>
          <form onSubmit={handleSubmitLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Jenis Surat yang Dibutuhkan</label>
              <select
                value={letterTypeInput}
                onChange={(e) => setLetterTypeInput(e.target.value)}
                className="form-control"
              >
                <option value="Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)">Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)</option>
                <option value="Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)">Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)</option>
                <option value="Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah">Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah</option>
                <option value="Surat Keterangan Domisili Tempat Tinggal">Surat Keterangan Domisili Tempat Tinggal</option>
                <option value="Surat Pengantar Pembuatan KTP / Kartu Keluarga">Surat Pengantar Pembuatan KTP / Kartu Keluarga</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Keperluan / Catatan Tambahan</label>
              <input
                type="text"
                value={letterPurposeInput}
                onChange={(e) => setLetterPurposeInput(e.target.value)}
                placeholder="Contoh: Untuk persyaratan pengajuan KUR Pertanian di Bank Mandiri Banda..."
                required
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.4rem' }}
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
        <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: 'var(--secondary-light)', color: '#065f46', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', fontSize: '0.875rem', fontWeight: 600 }}>
          ✅ {letterSuccessNotice}
        </div>
      )}

      {/* Daftar Riwayat Permohonan Surat */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem' }}>
          Riwayat Pengajuan Surat Anda ({letters.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {letters.map((letItem) => (
            <div
              key={letItem.id}
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <b style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>{letItem.type}</b>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Keperluan: {letItem.purpose} &bull; Tanggal: {letItem.date}
                </span>
              </div>
              <span
                className={`badge ${letItem.status === 'disetujui' ? 'badge-emerald' : 'badge-amber'}`}
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
