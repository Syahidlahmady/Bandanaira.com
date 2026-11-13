import React from 'react'
import { ShieldCheck, X, MapPin, Award } from 'lucide-react'
import { PublicBatchVerification } from '../../services/traceability'

interface PublicVerifyModalProps {
  data: PublicBatchVerification | null
  onClose: () => void
}

export const PublicVerifyModal: React.FC<PublicVerifyModalProps> = ({ data, onClose }) => {
  if (!data) return null

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          background: 'linear-gradient(155deg, #081d35 0%, #0f2c59 100%)',
          border: '1px solid rgba(244, 183, 94, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.45rem' }}>
              <ShieldCheck size={13} /> Sertifikat Keaslian Terverifikasi
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Indikasi Geografis Pala <span style={{ color: '#f4b75e', fontStyle: 'italic' }}>Banda Neira</span>
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Kepulauan Banda, Maluku Tengah &bull; Kode Batch:{' '}
              <b style={{ color: '#f4b75e', fontFamily: 'var(--font-mono)' }}>{data.batch_code}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Card Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 78, 59, 0.5) 60%, rgba(8, 12, 20, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(16, 185, 129, 0.15)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.35rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', fontWeight: 700 }}>
              Komoditas Rempah Asli
            </span>
            <h4 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0.25rem 0', color: '#f8fafc' }}>
              {data.commodity}
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              Total Produksi: <b style={{ color: '#ffffff' }}>{data.total_quantity_kg.toLocaleString('id-ID')} kg</b> &bull; Tanggal: {data.production_date}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.825rem', color: '#a7f3d0' }}>
              <MapPin size={15} /> Asal: {data.origin_village || 'Desa Lonthoir, Banda Besar'}
            </div>
          </div>

          {data.qr_code_base64 && (() => {
            const qrImageSrc = data.qr_code_base64.startsWith('data:image')
              ? data.qr_code_base64
              : `data:image/png;base64,${data.qr_code_base64}`
            return (
              <div
                style={{
                  background: '#ffffff',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                <img
                  src={qrImageSrc}
                  alt="QR Code Produk"
                  style={{ width: '96px', height: '96px', display: 'block', borderRadius: '4px' }}
                />
                <span style={{ fontSize: '0.65rem', color: '#0f172a', fontWeight: 800, display: 'block', marginTop: '0.25rem', letterSpacing: '0.04em' }}>
                  QR RESMI BANDA
                </span>
                <a
                  href={qrImageSrc}
                  download={`QR-${data.batch_code}.png`}
                  style={{
                    display: 'inline-block',
                    marginTop: '0.2rem',
                    fontSize: '0.68rem',
                    color: '#059669',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Unduh QR 📥
                </a>
              </div>
            )
          })()}
        </div>

        {/* Origin Farms */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '0.9rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.45rem' }}>
            Kebun Rempah Terverifikasi
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {data.origin_farms && data.origin_farms.length > 0 ? (
              data.origin_farms.map((f, i) => (
                <span key={i} className="badge badge-blue">
                  <MapPin size={11} /> {f}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kebun Pala Tradisional Banda Besar</span>
            )}
          </div>
        </div>

        {/* Supply Chain Timeline */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Award size={17} color="#34d399" /> Jejak Rantai Pasok Kriptografis (Audit Trail)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid rgba(16, 185, 129, 0.3)' }}>
            {data.timeline && data.timeline.length > 0 ? (
              data.timeline.map((ev, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.65rem',
                      top: '0.25rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid #080c14',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                      {ev.event_type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {new Date(ev.event_timestamp).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  {ev.location && (
                    <p style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginTop: '0.15rem' }}>
                      📍 {ev.location}
                    </p>
                  )}
                  {ev.description && (
                    <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: 1.45 }}>
                      {ev.description}
                    </p>
                  )}
                  <code style={{ fontSize: '0.72rem', color: '#64748b', wordBreak: 'break-all', display: 'block', marginTop: '0.3rem', fontFamily: 'var(--font-mono)' }}>
                    Hash: {ev.event_hash.substring(0, 24)}...
                  </code>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tahap pemrosesan terdaftar.</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
        >
          Tutup Jendela Verifikasi
        </button>
      </div>
    </div>
  )
}
