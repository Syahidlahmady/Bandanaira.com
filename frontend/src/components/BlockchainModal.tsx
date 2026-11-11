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
      <div className="modal-content" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span
              className={`badge ${data.is_verified ? 'badge-emerald' : 'badge-red'}`}
              style={{ marginBottom: '0.45rem' }}
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Verifikasi On-Chain Smart Contract EVM
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Kode Batch: <b style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{data.batch_code}</b>
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

        <div
          style={{
            background: data.is_verified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${data.is_verified ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            boxShadow: data.is_verified ? '0 0 15px rgba(16, 185, 129, 0.1)' : '0 0 15px rgba(239, 68, 68, 0.1)',
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            color: data.is_verified ? '#a7f3d0' : '#fca5a5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          {data.is_verified ? (
            <ShieldCheck size={22} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            <b style={{ display: 'block', marginBottom: '0.25rem', color: '#f8fafc' }}>
              {data.is_verified ? 'Bukti Kriptografis Sah & Terverifikasi' : 'Hash Tidak Cocok'}
            </b>
            <p style={{ lineHeight: 1.45, margin: 0, fontSize: '0.825rem' }}>{data.message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.04em' }}>
              <Database size={13} color="#38bdf8" /> HASH BASIS DATA LOKAL (Canonical SHA-256)
            </span>
            <code style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: '#38bdf8', fontWeight: 600, marginTop: '0.3rem', display: 'block', fontFamily: 'var(--font-mono)' }}>
              {data.latest_db_hash}
            </code>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.04em' }}>
              <Layers size={13} color="#34d399" /> HASH PERMANEN DI SMART CONTRACT ON-CHAIN
            </span>
            <code style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: data.is_verified ? '#34d399' : '#f87171', fontWeight: 600, marginTop: '0.3rem', display: 'block', fontFamily: 'var(--font-mono)' }}>
              {data.on_chain_hash || 'Belum dijangkarkan ke Smart Contract'}
            </code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nomor Blok EVM</span>
              <p style={{ fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem', margin: 0, fontFamily: 'var(--font-mono)' }}>
                #{data.block_number || 'N/A'}
              </p>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Network Chain ID</span>
              <p style={{ fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem', margin: 0, fontFamily: 'var(--font-mono)' }}>
                {data.network_chain_id} (EVM)
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.04em' }}>Alamat Smart Contract (SpiceRegistry)</span>
            <code style={{ fontSize: '0.75rem', color: '#fbbf24', wordBreak: 'break-all', display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
              {data.contract_address}
            </code>
          </div>

          {data.transaction_hash && (
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.04em' }}>Transaction Receipt Hash</span>
              <code style={{ fontSize: '0.75rem', color: '#34d399', wordBreak: 'break-all', display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                {data.transaction_hash}
              </code>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', fontWeight: 800 }}
        >
          Tutup Hasil Verifikasi
        </button>
      </div>
    </div>
  )
}
