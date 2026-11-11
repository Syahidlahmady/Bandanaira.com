import React from 'react'
import { User } from '../services/auth'
import { CheckCircle2, Clock, Send, FileText, UserCheck } from 'lucide-react'

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
    <section className="app-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
            fontSize: '1.75rem',
          }}
        >
          🏛️
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-blue">PORTAL MANDIRI WARGA</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>&bull; Kantor Desa Banda Neira</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: '#f8fafc', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            Pelayanan Administrasi Warga Mandiri
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Akses layanan administrasi surat kependudukan, permohonan berkas SKU, dan status identitas warga desa.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
        {/* Profile Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <UserCheck size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Profil Kependudukan Anda
            </h3>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#f8fafc', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Nama Lengkap
              </span>
              <b style={{ color: '#ffffff', fontSize: '1rem' }}>{currentUser?.full_name}</b>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Email / ID Akun
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#38bdf8' }}>{currentUser?.email}</span>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Hak Akses Sistem
              </span>
              <span style={{ color: '#cbd5e1' }}>Warga Terdaftar (Resident RBAC)</span>
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span className="badge badge-emerald">
                <CheckCircle2 size={12} /> IDENTITAS TERDAFTAR RESMI DESA
              </span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <FileText size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Layanan Surat Administrasi Desa
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.85rem', lineHeight: 1.55 }}>
            Ajukan permohonan surat keterangan usaha &amp; domisili secara digital tanpa perlu antre fisik di kantor desa.
          </p>
          <ul style={{ fontSize: '0.825rem', color: '#94a3b8', paddingLeft: '1.2rem', lineHeight: '1.65', marginBottom: '1.25rem' }}>
            <li>Surat Keterangan Usaha Petani Rempah Pala &amp; Cengkeh (SKU)</li>
            <li>Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)</li>
            <li>Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah</li>
            <li>Surat Keterangan Domisili Tempat Tinggal &amp; Pengantar KTP</li>
          </ul>
          <button
            type="button"
            onClick={() => setShowLetterForm(!showLetterForm)}
            className="btn btn-success"
            style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.65rem 1.4rem', fontWeight: 800 }}
          >
            {showLetterForm ? '✕ Tutup Formulir' : '➕ Ajukan Permohonan Surat Baru'}
          </button>
        </div>
      </div>

      {/* Form Pengajuan Surat Interaktif */}
      {showLetterForm && (
        <div
          style={{
            marginTop: '1.75rem',
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '1.5rem 1.75rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
          }}
        >
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
            Formulir Pengajuan Surat Mandiri
          </h4>
          <form onSubmit={handleSubmitLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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

            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontWeight: 800 }}
              >
                <Send size={15} /> Kirim Permohonan ke Kantor Desa
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
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.85rem 1.15rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#a7f3d0',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={17} color="#34d399" />
          <span>{letterSuccessNotice}</span>
        </div>
      )}

      {/* Daftar Riwayat Permohonan Surat */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
          Riwayat Pengajuan Surat Anda ({letters.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {letters.map((letItem) => (
            <div
              key={letItem.id}
              style={{
                padding: '1.15rem 1.35rem',
                background: 'rgba(15, 23, 42, 0.65)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div>
                <b style={{ fontSize: '0.975rem', color: '#f8fafc', display: 'block' }}>{letItem.type}</b>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Keperluan: {letItem.purpose} &bull; Tanggal: {letItem.date}
                </span>
              </div>
              <span
                className={`badge ${letItem.status === 'disetujui' ? 'badge-emerald' : 'badge-amber'}`}
              >
                {letItem.status === 'disetujui' ? (
                  <>
                    <CheckCircle2 size={11} /> Disetujui (Siap Diambil)
                  </>
                ) : (
                  <>
                    <Clock size={11} /> Sedang Ditinjau Petugas
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
