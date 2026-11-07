import React, { useState } from 'react'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '2rem', background: '#eff6ff', padding: '0.5rem', borderRadius: '10px' }}>📬</div>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#1e3a8a', fontWeight: 'bold', margin: 0 }}>
              Kotak Masuk Pelayanan Surat Warga (Inbox Desa)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Verifikasi dan terbitkan surat keterangan usaha (Petani Pala, Nelayan, Pengolah Fuli) dan surat domisili.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['', 'submitted', 'approved', 'rejected'].map((st) => {
            const label = st === '' ? 'Semua' : st === 'submitted' ? 'Menunggu' : st === 'approved' ? 'Disetujui' : 'Ditolak'
            const count = st === '' ? adminRequests.length : adminRequests.filter((r) => r.status === st).length
            const active = requestFilterStatus === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setRequestFilterStatus(st)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: active ? '1px solid #1e40af' : '1px solid #cbd5e1',
                  background: active ? '#1e40af' : '#f8fafc',
                  color: active ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {letterActionMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.65rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: letterActionMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: letterActionMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${letterActionMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {letterActionMsg.text}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.65rem' }}>Warga Pemohon</th>
              <th style={{ padding: '0.65rem' }}>Profesi</th>
              <th style={{ padding: '0.65rem' }}>Jenis Surat yang Diminta</th>
              <th style={{ padding: '0.65rem' }}>Keperluan / Catatan</th>
              <th style={{ padding: '0.65rem' }}>Status</th>
              <th style={{ padding: '0.65rem', textAlign: 'center' }}>Tindakan Perangkat Desa</th>
            </tr>
          </thead>
          <tbody>
            {adminRequests
              .filter((req) => !requestFilterStatus || req.status === requestFilterStatus)
              .map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <td style={{ padding: '0.65rem' }}>
                    <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>
                      {req.resident_name || 'Warga Terdaftar'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {req.resident_nik || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem' }}>
                    {getOccupationBadge(req.resident_occupation)}
                  </td>
                  <td style={{ padding: '0.65rem', fontWeight: '500', color: '#1e3a8a' }}>
                    {req.request_type}
                  </td>
                  <td style={{ padding: '0.65rem', color: '#475569', fontSize: '0.8rem', maxWidth: '240px' }}>
                    {req.notes || '-'}
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
                          req.status === 'approved'
                            ? '#ecfdf5'
                            : req.status === 'submitted'
                            ? '#fffbeb'
                            : '#fef2f2',
                        color:
                          req.status === 'approved'
                            ? '#047857'
                            : req.status === 'submitted'
                            ? '#b45309'
                            : '#b91c1c',
                      }}
                    >
                      {req.status === 'approved'
                        ? '✓ DISETUJUI'
                        : req.status === 'submitted'
                        ? '⏳ MENUNGGU'
                        : '✕ DITOLAK'}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                    {req.status === 'submitted' ? (
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
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
                          {updatingRequestId === req.id ? '...' : '✓ Setujui'}
                        </button>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
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
                          {updatingRequestId === req.id ? '...' : '✕ Tolak'}
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handlePrint(req)}
                          style={{
                            background: '#1e40af',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '5px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          🖨️ Cetak Surat
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Ditolak
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            {adminRequests.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                  Belum ada permohonan surat dari warga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CETAK SURAT RESMI DESA */}
      {printLetter && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
              fontFamily: 'serif',
              color: '#0f172a',
            }}
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
                  style={{
                    background: '#1e40af',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🖨️ Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLetter(null)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* KOP SURAT DESA RESMI */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #000000', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                PEMERINTAH KABUPATEN MALUKU TENGAH
              </h3>
              <h4 style={{ margin: '0.2rem 0', fontSize: '1.05rem', textTransform: 'uppercase' }}>
                KECAMATAN KEPULAUAN BANDA
              </h4>
              <h2 style={{ margin: '0.2rem 0', fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
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
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
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
