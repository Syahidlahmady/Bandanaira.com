import React from 'react'
import { RefreshCw, LogOut, Shield, Layers } from 'lucide-react'
import { User } from '../services/auth'

interface HeaderNavProps {
  currentUser: User | null
  isOnline: boolean
  pendingSyncCount: number
  isSyncing: boolean
  onLogout: () => void
  onManualSync: () => void
  onOpenQueueModal: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  isOnline,
  pendingSyncCount,
  isSyncing,
  onLogout,
  onManualSync,
  onOpenQueueModal,
}) => {
  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Administrator Desa'
      case 'village_officer':
        return 'Petugas Kantor Desa'
      case 'farmer_group_admin':
        return 'Ketua Kelompok Tani'
      case 'farmer':
        return 'Petani Rempah Pala'
      case 'resident':
        return 'Warga Desa'
      case 'smart_tourism_admin':
        return 'Pengelola Wisata'
      default:
        return roleName
    }
  }

  return (
    <header style={{ marginBottom: '1.75rem' }}>
      {/* Top Banner with Brand and Network Pill */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 0',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #15803d 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(30, 58, 138, 0.25)',
              border: '2px solid #bfdbfe',
              fontSize: '1.4rem',
            }}
          >
            🌿
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Desa Digital Banda Neira
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Pelayanan Kependudukan & Rantai Pasok Rempah Pala &bull; Kepulauan Banda
            </p>
          </div>
        </div>

        {/* Live Network & PWA Sync Indicator Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: isOnline ? 'var(--secondary-light)' : 'var(--accent-gold-light)',
              border: `1px solid ${isOnline ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: isOnline ? '#16a34a' : '#ea580c',
                boxShadow: isOnline ? '0 0 6px #16a34a' : '0 0 6px #ea580c',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isOnline ? '#166534' : '#9a3412' }}>
              {isOnline ? '🟢 Terhubung Sinyal Desa' : '🔴 Tanpa Sinyal (Mode Kebun)'}
            </span>

            {pendingSyncCount > 0 && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid #fcd34d',
                }}
              >
                📦 {pendingSyncCount} Catatan di HP
              </span>
            )}
          </div>

          {pendingSyncCount > 0 && (
            <button
              onClick={onManualSync}
              disabled={!isOnline || isSyncing}
              className="btn btn-sm btn-primary"
              title="Kirim catatan tersimpan ke server desa"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Mengirim...' : 'Kirim ke Server'}
            </button>
          )}

          <button
            onClick={onOpenQueueModal}
            className="btn btn-sm btn-secondary"
            title="Buka daftar data offline di HP"
          >
            <Layers size={13} /> Data HP ({pendingSyncCount})
          </button>
        </div>
      </div>

      {/* User Session Bar */}
      {currentUser && (
        <div
          className="app-card"
          style={{
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1px solid #bfdbfe',
              }}
            >
              {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentUser.full_name || currentUser.username}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  (@{currentUser.username})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                {currentUser.roles.map((r) => (
                  <span key={r.id} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                    <Shield size={10} /> {getRoleLabel(r.name)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-sm btn-secondary"
            style={{ color: 'var(--danger)', borderColor: '#fecaca', background: '#ffffff', fontWeight: 600 }}
          >
            <LogOut size={13} /> Keluar (Logout)
          </button>
        </div>
      )}
    </header>
  )
}
