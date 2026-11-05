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
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>
              <Database size={12} /> Browser IndexedDB Storage
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
              Antrean Sinkronisasi Lapangan (PWA)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Data tersimpan di perangkat lokal saat berada di area kebun tanpa sinyal internet.
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

        {queueList.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Semua Data Tersinkronkan!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Tidak ada data yang tertahan di memori lokal perangkat. Seluruh catatan telah aman di server desa.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
            {queueList.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.85rem',
                  background: item.status === 'failed' ? 'var(--danger-light)' : '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${item.status === 'failed' ? '#fecaca' : 'var(--border-color)'}`,
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
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.description}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} /> {new Date(item.createdAt).toLocaleString('id-ID')} &bull; Percobaan: {item.retryCount}x
                  </p>
                  {item.error && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertCircle size={12} /> {item.error}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => item.id && onDelete(item.id)}
                  className="btn btn-sm"
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
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
