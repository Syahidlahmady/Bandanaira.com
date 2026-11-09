import React, { useState } from 'react'
import {
  RefreshCw,
  LogOut,
  Shield,
  Layers,
  Smartphone,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  MoreVertical,
} from 'lucide-react'
import { User } from '../services/auth'
import { usePWA } from '../offline/usePWA'

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
  const { canInstall, isInstalled, hasUpdate, installApp, updateApp } = usePWA()
  const [installing, setInstalling] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      const installed = await installApp()
      if (!installed) {
        // If browser couldn't launch native prompt directly, show guide modal
        setShowGuideModal(true)
      }
    } finally {
      setInstalling(false)
    }
  }

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
      {/* Service Worker Update Notification Banner */}
      {hasUpdate && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b',
            borderRadius: '10px',
            padding: '0.75rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={20} style={{ color: '#b45309', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400e' }}>
                Pembaruan Sistem Desa Tersedia!
              </div>
              <div style={{ fontSize: '0.775rem', color: '#78350f' }}>
                Versi baru telah diunduh di latar belakang. Klik tombol untuk memperbarui aplikasi seketika tanpa kehilangan data.
              </div>
            </div>
          </div>
          <button
            onClick={updateApp}
            className="btn btn-sm btn-primary"
            style={{
              background: '#d97706',
              borderColor: '#b45309',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)',
            }}
          >
            <RefreshCw size={13} /> Perbarui Sekarang
          </button>
        </div>
      )}

      {/* Top Banner with Brand and Network / PWA Status */}
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

        {/* Live Network, PWA Install & Offline Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Signal Indicator */}
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

          {/* Sync Trigger button when pending data exists */}
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

          {/* Open Offline Queue Modal */}
          <button
            onClick={onOpenQueueModal}
            className="btn btn-sm btn-secondary"
            title="Buka daftar data offline di HP"
          >
            <Layers size={13} /> Data HP ({pendingSyncCount})
          </button>

          {/* PWA Install Button or Status Indicator */}
          {canInstall ? (
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: '#ffffff',
                borderColor: '#14532d',
                fontWeight: 700,
                boxShadow: '0 2px 4px rgba(21, 128, 61, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Pasang aplikasi di layar utama HP / Tablet untuk akses instan tanpa kuota"
            >
              <Smartphone size={13} />
              {installing ? 'Memasang...' : '📲 Pasang di HP'}
            </button>
          ) : isInstalled ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#15803d',
                background: '#dcfce7',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid #86efac',
              }}
              title="Aplikasi telah terpasang di perangkat Anda"
            >
              <CheckCircle2 size={12} /> Aplikasi Terpasang
            </span>
          ) : (
            <button
              onClick={() => setShowGuideModal(true)}
              className="btn btn-sm btn-secondary"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Petunjuk memasang aplikasi di ponsel Android / iPhone"
            >
              <Smartphone size={12} /> Pasang di HP
            </button>
          )}
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

      {/* Modal: Panduan Pasang Aplikasi PWA di HP */}
      {showGuideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="app-card"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Pasang Aplikasi di Layar HP
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    Akses cepat tanpa browser & bekerja saat bertugas di kebun rempah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-sm btn-secondary"
                style={{ padding: '0.35rem', borderRadius: '50%', border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              {/* Android Guide */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.4rem' }}>
                  <MoreVertical size={16} /> 1. Pengguna Android (Google Chrome / Edge)
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <li>Tekan ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas peramban.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Pasang Aplikasi"</strong>.</li>
                  <li>Tekan <strong>Install / Tambah</strong>. Ikon Desa Digital akan muncul di layar HP Anda.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.4rem' }}>
                  <Share2 size={16} /> 2. Pengguna iPhone / iPad (Safari)
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <li>Buka website ini menggunakan peramban <strong>Safari</strong>.</li>
                  <li>Tekan tombol <strong>Bagikan (Share)</strong> yang berlogo kotak panah ke atas (⎋) di bilah bawah.</li>
                  <li>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
                </ol>
              </div>

              {/* Benefits Box */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#166534' }}>
                <strong>🌟 Manfaat PWA Desa Banda:</strong>
                <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.4 }}>
                  <li>Buka aplikasi dalam satu sentuhan langsung tanpa mengetik URL.</li>
                  <li>Peta GIS Kepulauan Banda tetap tampil meskipun tidak ada sinyal internet.</li>
                  <li>Catatan panen dan penduduk tersimpan otomatis di memori HP.</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
