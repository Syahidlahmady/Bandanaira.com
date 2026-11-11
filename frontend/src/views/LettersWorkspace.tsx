import React, { useState } from 'react'
import {
  Mail,
  Check,
  X,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { AdministrativeRequestItem } from '../services/population'
import { getOccupationBadge } from '../components/OccupationBadge'

interface LettersWorkspaceProps {
  adminRequests: AdministrativeRequestItem[]
  requestFilterStatus: string
  setRequestFilterStatus: (st: string) => void
  updatingRequestId: string | null
  handleUpdateRequestStatus: (id: string, status: 'approved' | 'rejected') => void
  letterActionMsg: { type: 'success' | 'error'; text: string } | null
}

export const LettersWorkspace: React.FC<LettersWorkspaceProps> = ({
  adminRequests,
  requestFilterStatus,
  setRequestFilterStatus,
  updatingRequestId,
  handleUpdateRequestStatus,
  letterActionMsg,
}) => {
  const [printLetter, setPrintLetter] = useState<AdministrativeRequestItem | null>(null)

  const handlePrint = (req: AdministrativeRequestItem) => {
    setPrintLetter(req)
  }

  const triggerBrowserPrint = () => {
    window.print()
  }

  return (
    <section className="app-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fde68a',
            }}
          >
            <Mail size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#1e3a8a', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Kotak Masuk Pelayanan Surat Warga (Inbox Desa)
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.15rem 0 0' }}>
              Verifikasi dan terbitkan surat keterangan usaha (Petani Pala, Nelayan, Pengolah Fuli) dan surat domisili warga.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {[
            { st: '', label: 'Semua' },
            { st: 'submitted', label: 'Menunggu' },
            { st: 'approved', label: 'Disetujui' },
            { st: 'rejected', label: 'Ditolak' },
          ].map(({ st, label }) => {
            const count = st === '' ? adminRequests.length : adminRequests.filter((r) => r.status === st).length
            const active = requestFilterStatus === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setRequestFilterStatus(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: active ? '2px solid #1e40af' : '1px solid #cbd5e1',
                  background: active ? '#eff6ff' : '#ffffff',
                  color: active ? '#1e40af' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    background: active ? '#1e40af' : '#e2e8f0',
                    color: active ? '#ffffff' : '#475569',
                    borderRadius: '10px',
                    padding: '0.05rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {letterActionMsg && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            background: letterActionMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: letterActionMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${letterActionMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          {letterActionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
          {letterActionMsg.text}
        </div>
      )}

      {/* Requests Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Warga Pemohon</th>
              <th>Profesi</th>
              <th>Jenis Surat yang Diminta</th>
              <th>Keperluan / Catatan</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Tindakan Perangkat Desa</th>
            </tr>
          </thead>
          <tbody>
            {adminRequests
              .filter((req) => !requestFilterStatus || req.status === requestFilterStatus)
              .map((req) => (
                <tr key={req.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                      {req.resident_name || 'Warga Terdaftar'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {req.resident_nik || '-'}
                    </span>
                  </td>
                  <td>{getOccupationBadge(req.resident_occupation)}</td>
                  <td style={{ fontWeight: 600, color: '#1e3a8a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} color="#1e40af" />
                      {req.request_type}
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.825rem', maxWidth: '240px', lineHeight: 1.4 }}>
                    {req.notes || '-'}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        req.status === 'approved'
                          ? 'badge-green'
                          : req.status === 'submitted'
                          ? 'badge-amber'
                          : 'badge-red'
                      }`}
                    >
                      {req.status === 'approved' ? (
                        <>
                          <CheckCircle2 size={11} /> Disetujui
                        </>
                      ) : req.status === 'submitted' ? (
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
                    {req.status === 'submitted' ? (
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                          className="btn btn-sm btn-success"
                          style={{ padding: '0.25rem 0.65rem' }}
                        >
                          <Check size={12} /> {updatingRequestId === req.id ? '...' : 'Setujui'}
                        </button>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                          className="btn btn-sm btn-danger"
                          style={{ padding: '0.25rem 0.65rem' }}
                        >
                          <X size={12} /> {updatingRequestId === req.id ? '...' : 'Tolak'}
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <button
                        type="button"
                        onClick={() => handlePrint(req)}
                        className="btn btn-sm btn-primary"
                        style={{ padding: '0.25rem 0.65rem' }}
                      >
                        <Printer size={12} /> Cetak Surat
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Ditolak
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            {adminRequests.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
                  <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Belum ada permohonan surat masuk
                  </p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                    Warga dapat mengajukan permohonan SKU atau surat domisili secara mandiri melalui Portal Warga.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CETAK SURAT RESMI DESA */}
      {printLetter && (
        <div
          className="modal-backdrop"
          onClick={() => setPrintLetter(null)}
        >
          <div
            className="modal-content animate-fade-in"
            style={{
              maxWidth: '700px',
              fontFamily: 'serif',
              color: '#0f172a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Not printed) */}
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
                Pratinjau Format Surat Resmi Kantor Desa Banda Neira
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="btn btn-sm btn-primary"
                >
                  <Printer size={13} /> Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLetter(null)}
                  className="btn btn-sm btn-secondary"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* KOP SURAT DESA RESMI */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #000000', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                PEMERINTAH KABUPATEN MALUKU TENGAH
              </h3>
              <h4 style={{ margin: '0.2rem 0', fontSize: '1rem', textTransform: 'uppercase' }}>
                KECAMATAN KEPULAUAN BANDA
              </h4>
              <h2 style={{ margin: '0.2rem 0', fontSize: '1.3rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                KANTOR KEPALA DESA BANDA NEIRA
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic', color: '#334155' }}>
                Jalan Nusantara No. 01, Banda Neira, Kepulauan Banda, Maluku Tengah 97593
              </p>
            </div>

            {/* JUDUL SURAT */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, textDecoration: 'underline', fontSize: '1.15rem', textTransform: 'uppercase' }}>
                {printLetter.request_type}
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                Nomor: 503/{printLetter.id.substring(0, 5).toUpperCase()}/KD-BN/{new Date().getFullYear()}
              </p>
            </div>

            {/* ISI SURAT */}
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
              <p style={{ textIndent: '2rem', margin: '0 0 0.75rem 0' }}>
                Yang bertanda tangan di bawah ini, Kepala Desa Banda Neira, Kecamatan Kepulauan Banda, Kabupaten Maluku Tengah, dengan ini menerangkan bahwa:
              </p>

              <table style={{ width: '100%', margin: '0.5rem 0 1rem 1rem', fontSize: '0.92rem' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '160px', padding: '0.2rem 0' }}>Nama Lengkap</td>
                    <td>: <b>{printLetter.resident_name || 'Ahmad Baadilla'}</b></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0' }}>NIK</td>
                    <td>: <span style={{ fontFamily: 'monospace' }}>{printLetter.resident_nik || '-'}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0' }}>Mata Pencaharian</td>
                    <td>: {printLetter.resident_occupation || 'Petani Rempah Pala'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0' }}>Alamat / Domisili</td>
                    <td>: Desa Banda Neira, Kec. Kepulauan Banda, Kab. Maluku Tengah</td>
                  </tr>
                </tbody>
              </table>

              <p style={{ textIndent: '2rem', margin: '0 0 0.75rem 0' }}>
                Adalah benar yang bersangkutan merupakan warga penduduk yang berdomisili sah di wilayah Desa Banda Neira dan benar menjalankan kegiatan usaha/mata pencaharian sebagaimana tercatat di atas.
              </p>

              <p style={{ textIndent: '2rem', margin: '0 0 0.75rem 0' }}>
                Surat keterangan ini diberikan atas permohonan yang bersangkutan untuk keperluan: <b>{printLetter.notes || 'Pengajuan Persyaratan Administrasi & Modal Usaha'}</b>.
              </p>

              <p style={{ textIndent: '2rem', margin: '0 0 1.5rem 0' }}>
                Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* TANDA TANGAN & STEMPEL */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', textAlign: 'center' }}>
              <div style={{ minWidth: '220px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Banda Neira, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style={{ margin: '0.2rem 0 3.5rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>KEPALA DESA BANDA NEIRA,</p>
                <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline' }}>M. SYAFI'I BAADILLA</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>NIP. 19780512 200501 1 004</p>
              </div>
            </div>

            {/* FOOTER VERIFIKASI KEASLIAN DIGITAL */}
            <div
              style={{
                marginTop: '2rem',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
                fontFamily: 'sans-serif',
              }}
            >
              <div>
                <span>🛡️ Terdaftar di <b>Ekosistem Digital Banda Neira</b></span><br />
                <span>ID Dokumen: {printLetter.id}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>✓ Keabsahan Dokumen Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
