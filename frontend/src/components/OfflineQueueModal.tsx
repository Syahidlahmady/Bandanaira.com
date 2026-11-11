import React from 'react'
import { X, RefreshCw, Trash2, CheckCircle2, AlertCircle, Database, Clock } from 'lucide-react'
import { SyncQueueItem } from '../offline/syncManager'

interface OfflineQueueModalProps {
  isOpen: boolean
  queueList: SyncQueueItem[]
  isOnline: boolean
  isSyncing: boolean
  onClose: () => void
  onDelete: (id: number) => void
  onClearAll: () => void
  onSync: () => void
}

export const OfflineQueueModal: React.FC<OfflineQueueModalProps> = ({
  isOpen,
  queueList,
  isOnline,
  isSyncing,
  onClose,
  onDelete,
  onClearAll,
  onSync,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.45rem' }}>
              <Database size={13} /> Browser IndexedDB Storage
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Antrean Sinkronisasi Lapangan (PWA)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Data tersimpan di perangkat lokal saat berada di area kebun tanpa sinyal internet.
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

        {queueList.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.65)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed rgba(16, 185, 129, 0.35)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <h4 style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem', fontSize: '1.05rem' }}>
              Semua Data Tersinkronkan!
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px', margin: '0 auto' }}>
              Tidak ada data yang tertahan di memori lokal perangkat. Seluruh catatan panen &amp; administrasi telah aman di server desa.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
            {queueList.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.9rem 1rem',
                  background: item.status === 'failed' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.65)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${item.status === 'failed' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span
                      className={`badge ${
                        item.status === 'failed'
                          ? 'badge-red'
                          : item.status === 'syncing'
                          ? 'badge-blue'
                          : 'badge-amber'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                      {item.description}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                    <Clock size={12} color="#64748b" /> {new Date(item.createdAt).toLocaleString('id-ID')} &bull; Percobaan: {item.retryCount}x
                  </p>
                  {item.error && (
                    <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0.25rem 0 0' }}>
                      <AlertCircle size={12} /> {item.error}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => item.id && onDelete(item.id)}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    flexShrink: 0,
                  }}
                  title="Hapus dari antrean"
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
          {queueList.length > 0 && (
            <button
              onClick={onClearAll}
              className="btn btn-secondary"
            >
              <Trash2 size={14} /> Kosongkan Semua
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button
              onClick={onSync}
              disabled={!isOnline || isSyncing || queueList.length === 0}
              className="btn btn-primary"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Sedang Sinkronisasi...' : 'Kirim Sekarang ke Server'}
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
