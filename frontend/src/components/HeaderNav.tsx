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
          className="animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e' }}>
                Pembaruan Sistem Desa Tersedia!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '0.1rem' }}>
                Versi mutakhir aplikasi telah siap. Klik perbarui untuk mengaktifkannya secara instan tanpa kehilangan data.
              </div>
            </div>
          </div>
          <button
            onClick={updateApp}
            className="btn btn-sm btn-primary"
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              borderColor: '#92400e',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(180, 83, 9, 0.3)',
            }}
          >
            <RefreshCw size={13} /> Perbarui Sekarang
          </button>
        </div>
      )}

      {/* Main Top Header Bar */}
      <div
        className="app-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          padding: '1.1rem 1.5rem',
          marginBottom: '1rem',
          background: 'rgba(255, 255, 255, 0.88)',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Brand & Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0f2c59 0%, #1e3a8a 50%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -2px rgba(15, 44, 89, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              fontSize: '1.5rem',
              flexShrink: 0,
            }}
          >
            🌿
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Desa Digital Banda Neira
              </h1>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#1e40af',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #bfdbfe',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Maluku Tengah
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
              Sistem Pelayanan Kependudukan, Pemetaan Lahan GIS & Rantai Pasok Rempah Berbasis Blockchain
            </p>
          </div>
        </div>

        {/* Live Network, PWA Install & Offline Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Signal Indicator Pill */}
          <div
            style={{
              background: isOnline ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${isOnline ? '#a7f3d0' : '#fde68a'}`,
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#f59e0b',
                boxShadow: isOnline ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                display: 'inline-block',
                position: 'relative',
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: isOnline ? '#065f46' : '#92400e',
                letterSpacing: '-0.01em',
              }}
            >
              {isOnline ? '🟢 Sinyal Terhubung' : '🔴 Mode Kebun Offline'}
            </span>

            {pendingSyncCount > 0 && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  border: '1px solid #fcd34d',
                }}
              >
                📦 {pendingSyncCount} Antrean
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
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Mengirim...' : 'Kirim ke Server'}
            </button>
          )}

          {/* Open Offline Queue Modal */}
          <button
            onClick={onOpenQueueModal}
            className="btn btn-sm btn-secondary"
            title="Buka daftar data offline di perangkat"
          >
            <Layers size={13} /> Data HP ({pendingSyncCount})
          </button>

          {/* PWA Install Button or Status Indicator */}
          {canInstall ? (
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="btn btn-sm btn-success"
              style={{
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                fontWeight: 700,
              }}
              title="Pasang aplikasi di layar utama HP / Tablet untuk akses instan tanpa browser"
            >
              <Smartphone size={13} />
              {installing ? 'Memasang...' : '📲 Pasang di HP'}
            </button>
          ) : isInstalled ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#065f46',
                background: '#ecfdf5',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid #a7f3d0',
                boxShadow: 'var(--shadow-xs)',
              }}
              title="Aplikasi telah terpasang di perangkat Anda"
            >
              <CheckCircle2 size={13} /> Aplikasi Terpasang
            </span>
          ) : (
            <button
              onClick={() => setShowGuideModal(true)}
              className="btn btn-sm btn-secondary"
              style={{
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
              }}
              title="Petunjuk memasang aplikasi di ponsel Android / iPhone"
            >
              <Smartphone size={13} /> Pasang di HP
            </button>
          )}
        </div>
      </div>

      {/* User Session Bar */}
      {currentUser && (
        <div
          className="app-card animate-fade-in"
          style={{
            padding: '0.85rem 1.35rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem',
            background: 'linear-gradient(to right, #ffffff, #f8fafc)',
            borderLeft: '4px solid #1e3a8a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 6px rgba(30, 58, 138, 0.15)',
              }}
            >
              {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {currentUser.full_name || currentUser.username}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  (@{currentUser.username})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                {currentUser.roles.map((r) => (
                  <span key={r.id} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                    <Shield size={11} /> {getRoleLabel(r.name)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-sm btn-secondary"
            style={{
              color: 'var(--danger)',
              borderColor: '#fecaca',
              background: '#ffffff',
              fontWeight: 600,
            }}
          >
            <LogOut size={13} /> Keluar (Logout)
          </button>
        </div>
      )}

      {/* Modal: Panduan Pasang Aplikasi PWA di HP */}
      {showGuideModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="modal-content animate-fade-in"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Pasang Aplikasi di Layar HP
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    Akses instan seperti aplikasi native & bekerja di kebun tanpa sinyal internet
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
              <div style={{ background: '#f8fafc', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.45rem' }}>
                  <MoreVertical size={16} /> 1. Pengguna Android (Chrome / Edge / Samsung Internet)
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6, color: 'var(--text-main)' }}>
                  <li>Tekan ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas layar peramban.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Pasang Aplikasi"</strong>.</li>
                  <li>Tekan <strong>Install / Tambah</strong>. Ikon Desa Digital akan muncul di beranda HP Anda.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div style={{ background: '#f8fafc', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.45rem' }}>
                  <Share2 size={16} /> 2. Pengguna iPhone / iPad (Safari)
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6, color: 'var(--text-main)' }}>
                  <li>Buka website ini menggunakan browser bawaan <strong>Safari</strong>.</li>
                  <li>Tekan tombol <strong>Bagikan (Share)</strong> yang berlogo kotak panah ke atas (⎋) di bilah bawah.</li>
                  <li>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
                </ol>
              </div>

              {/* Benefits Box */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#166534' }}>
                <strong>🌟 Keunggulan Aplikasi Desa Digital:</strong>
                <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                  <li>Buka aplikasi dalam satu sentuhan langsung dari layar HP tanpa mengetik URL.</li>
                  <li>Peta GIS Kepulauan Banda tetap tampil secara offline tanpa jaringan internet.</li>
                  <li>Pencatatan data penduduk & hasil panen otomatis tersimpan aman di memori lokal HP.</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.4rem' }}
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
