import React from 'react'
import { CheckCircle2, AlertTriangle, X, ShieldCheck, Database, Layers } from 'lucide-react'
import { BlockchainVerification } from '../services/traceability'

interface BlockchainModalProps {
  data: BlockchainVerification | null
  onClose: () => void
}

export const BlockchainModal: React.FC<BlockchainModalProps> = ({ data, onClose }) => {
  if (!data) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span
              className={`badge ${data.is_verified ? 'badge-green' : 'badge-red'}`}
              style={{ marginBottom: '0.5rem' }}
            >
              {data.is_verified ? (
                <>
                  <CheckCircle2 size={13} /> VERIFIKASI INTEGRITAS LOLOS
                </>
              ) : (
                <>
                  <AlertTriangle size={13} /> INTEGRITAS MERAGUKAN
                </>
              )}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
              Verifikasi On-Chain Smart Contract EVM
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Kode Batch: <b style={{ color: 'var(--text-main)' }}>{data.batch_code}</b>
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

        <div
          style={{
            background: data.is_verified ? 'var(--secondary-light)' : 'var(--danger-light)',
            border: `1px solid ${data.is_verified ? '#bbf7d0' : '#fecaca'}`,
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            color: data.is_verified ? '#166534' : '#991b1b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          {data.is_verified ? (
            <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            <b style={{ display: 'block', marginBottom: '0.2rem' }}>
              {data.is_verified ? 'Bukti Kriptografis Sah & Terverifikasi' : 'Hash Tidak Cocok'}
            </b>
            <p style={{ lineHeight: 1.4 }}>{data.message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Database size={13} /> HASH BASIS DATA LOKAL (Canonical SHA-256)
            </span>
            <code style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: '#1e293b', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
              {data.latest_db_hash}
            </code>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Layers size={13} /> HASH PERMANEN DI SMART CONTRACT ON-CHAIN
            </span>
            <code style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: data.is_verified ? '#15803d' : '#dc2626', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
              {data.on_chain_hash || 'Belum dijangkarkan ke Smart Contract'}
            </code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nomor Blok EVM</span>
              <p style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                #{data.block_number || 'N/A'}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Network Chain ID</span>
              <p style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                {data.network_chain_id} (EVM Compatible)
              </p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alamat Smart Contract (SpiceRegistry)</span>
            <code style={{ fontSize: '0.75rem', color: '#1e40af', wordBreak: 'break-all', display: 'block', marginTop: '0.2rem' }}>
              {data.contract_address}
            </code>
          </div>

          {data.transaction_hash && (
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transaction Receipt Hash</span>
              <code style={{ fontSize: '0.75rem', color: '#059669', wordBreak: 'break-all', display: 'block', marginTop: '0.2rem' }}>
                {data.transaction_hash}
              </code>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.25rem' }}
        >
          Tutup Hasil Verifikasi
        </button>
      </div>
    </div>
  )
}
