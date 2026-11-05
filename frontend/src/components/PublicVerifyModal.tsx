import React from 'react'
import { ShieldCheck, X, MapPin, Award } from 'lucide-react'
import { PublicBatchVerification } from '../services/traceability'

interface PublicVerifyModalProps {
  data: PublicBatchVerification | null
  onClose: () => void
}

export const PublicVerifyModal: React.FC<PublicVerifyModalProps> = ({ data, onClose }) => {
  if (!data) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.4rem' }}>
              <ShieldCheck size={12} /> Sertifikat Keaslian Terverifikasi
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              Indikasi Geografis Pala Banda Neira
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Kepulauan Banda, Maluku Tengah &bull; Kode Batch: <b style={{ color: 'var(--text-main)' }}>{data.batch_code}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Card Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
              Komoditas Rempah Asli
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0' }}>
              {data.commodity}
            </h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Total Produksi: <b>{data.total_quantity_kg.toLocaleString('id-ID')} kg</b> &bull; Tanggal: {data.production_date}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.95 }}>
              <MapPin size={14} /> Asal: {data.origin_village || 'Desa Lonthoir, Banda Besar'}
            </div>
          </div>

          {data.qr_code_base64 && (
            <div style={{ background: '#ffffff', padding: '0.4rem', borderRadius: '8px', textAlign: 'center' }}>
              <img
                src={`data:image/png;base64,${data.qr_code_base64}`}
                alt="QR Code Produk"
                style={{ width: '84px', height: '84px', display: 'block' }}
              />
              <span style={{ fontSize: '0.65rem', color: '#1e3a8a', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                QR RESMI
              </span>
            </div>
          )}
        </div>

        {/* Origin Farms */}
        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            Kebun Rempah Terverifikasi
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {data.origin_farms && data.origin_farms.length > 0 ? (
              data.origin_farms.map((f, i) => (
                <span key={i} className="badge badge-blue">
                  <MapPin size={10} /> {f}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kebun Pala Tradisional Banda Besar</span>
            )}
          </div>
        </div>

        {/* Supply Chain Timeline */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={16} color="var(--primary)" /> Jejak Rantai Pasok Kriptografis (Audit Trail)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
            {data.timeline && data.timeline.length > 0 ? (
              data.timeline.map((ev, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.45rem',
                      top: '0.2rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      border: '2px solid white',
                      boxShadow: '0 0 0 2px #bfdbfe',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {ev.event_type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(ev.event_timestamp).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  {ev.location && (
                    <p style={{ fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 500, marginTop: '0.1rem' }}>
                      📍 {ev.location}
                    </p>
                  )}
                  {ev.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {ev.description}
                    </p>
                  )}
                  <code style={{ fontSize: '0.7rem', color: '#64748b', wordBreak: 'break-all', display: 'block', marginTop: '0.25rem' }}>
                    Hash: {ev.event_hash.substring(0, 24)}...
                  </code>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tahap pemrosesan terdaftar.</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Tutup Jendela Verifikasi
        </button>
      </div>
    </div>
  )
}
