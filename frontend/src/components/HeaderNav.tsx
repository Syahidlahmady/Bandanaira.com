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
  MapPin,
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
    <header style={{ marginBottom: '2rem' }}>
      {/* Service Worker Update Notification Banner */}
      {hasUpdate && (
        <div
          className="animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.12) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}
            >
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#fbbf24' }}>
                Pembaruan Sistem Tersedia!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
                Versi mutakhir aplikasi telah siap. Klik perbarui untuk mengaktifkannya secara instan tanpa kehilangan data offline.
              </div>
            </div>
          </div>
          <button
            onClick={updateApp}
            className="btn btn-sm btn-warning"
            style={{ fontWeight: 800 }}
          >
            <RefreshCw size={14} /> Perbarui Sekarang
          </button>
        </div>
      )}

      {/* Main Top Cyber HUD Bar */}
      <div
        className="app-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          padding: '1.2rem 1.6rem',
          marginBottom: '1rem',
          background: 'rgba(15, 23, 42, 0.78)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand & Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)',
              color: '#042f2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              fontSize: '1.6rem',
              flexShrink: 0,
            }}
          >
            🌿
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  margin: 0,
                  background: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 50%, #67e8f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Banda Digital Ecosystem
              </h1>
              <span
                className="badge badge-emerald"
                style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}
              >
                Kepulauan Banda
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} color="#34d399" /> 4°31′S 129°54′E
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.2)' }}>&bull;</span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                EVM Blockchain Traceability & GIS
              </span>
            </div>
          </div>
        </div>

        {/* Live Network, PWA Install & Offline Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Signal Indicator Pill */}
          <div
            style={{
              background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.14)',
              border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.4)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              boxShadow: isOnline ? '0 0 16px rgba(16, 185, 129, 0.15)' : '0 0 16px rgba(244, 63, 94, 0.2)',
            }}
          >
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#f43f5e',
                boxShadow: isOnline ? '0 0 10px #10b981' : '0 0 10px #f43f5e',
                display: 'inline-block',
                animation: 'pulse-ring 2s infinite',
              }}
            />
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: isOnline ? '#34d399' : '#fb7185',
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {isOnline ? 'ONLINE & SYNCED' : 'OFFLINE KEBUN'}
            </span>

            {pendingSyncCount > 0 && (
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                📦 {pendingSyncCount}
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
              {isSyncing ? 'Mengirim...' : 'Kirim Antrean'}
            </button>
          )}

          {/* Open Offline Queue Modal */}
          <button
            onClick={onOpenQueueModal}
            className="btn btn-sm btn-secondary"
            title="Buka daftar data offline di perangkat"
          >
            <Layers size={13} /> Antrean ({pendingSyncCount})
          </button>

          {/* PWA Install Button or Status Indicator */}
          {canInstall ? (
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="btn btn-sm btn-primary"
              style={{
                boxShadow: '0 0 18px rgba(16, 185, 129, 0.45)',
                fontWeight: 800,
              }}
              title="Pasang aplikasi di layar utama HP / Tablet untuk akses instan tanpa browser"
            >
              <Smartphone size={13} />
              {installing ? 'Memasang...' : '📲 Pasang di HP'}
            </button>
          ) : isInstalled ? (
            <span
              className="badge badge-emerald"
              style={{ padding: '0.4rem 0.8rem' }}
              title="Aplikasi telah terpasang di perangkat Anda"
            >
              <CheckCircle2 size={13} /> Terpasang di HP
            </span>
          ) : (
            <button
              onClick={() => setShowGuideModal(true)}
              className="btn btn-sm btn-secondary"
              style={{
                fontSize: '0.775rem',
                color: '#94a3b8',
              }}
              title="Petunjuk memasang aplikasi di ponsel Android / iPhone"
            >
              <Smartphone size={13} /> Pasang di HP
            </button>
          )}
        </div>
      </div>

      {/* Cyber User Session HUD Bar */}
      {currentUser && (
        <div
          className="app-card animate-fade-in"
          style={{
            padding: '0.9rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.75) 100%)',
            borderLeft: '4px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.05rem',
                border: '2px solid rgba(52, 211, 153, 0.4)',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.975rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  {currentUser.full_name || currentUser.username}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  (@{currentUser.username})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {currentUser.roles.map((r) => (
                  <span key={r.id} className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                    <Shield size={11} /> {getRoleLabel(r.name)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-sm btn-danger"
            style={{
              padding: '0.45rem 0.95rem',
              fontWeight: 700,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    Pasang Aplikasi di Layar HP
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                    Akses instan seperti aplikasi native & bekerja di kebun tanpa sinyal internet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="btn btn-sm btn-secondary"
                style={{ padding: '0.4rem', borderRadius: '50%', border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              {/* Android Guide */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.5rem' }}>
                  <MoreVertical size={16} /> 1. Pengguna Android (Chrome / Edge / Samsung Internet)
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6, color: '#cbd5e1' }}>
                  <li>Tekan ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas layar peramban.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Pasang Aplikasi"</strong>.</li>
                  <li>Tekan <strong>Install / Tambah</strong>. Ikon Desa Digital akan muncul di beranda HP Anda.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.5rem' }}>
                  <Share2 size={16} /> 2. Pengguna iPhone / iPad (Safari)
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6, color: '#cbd5e1' }}>
                  <li>Buka website ini menggunakan browser bawaan <strong>Safari</strong>.</li>
                  <li>Tekan tombol <strong>Bagikan (Share)</strong> yang berlogo kotak panah ke atas (⎋) di bilah bawah.</li>
                  <li>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
                </ol>
              </div>

              {/* Benefits Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#6ee7b7' }}>
                <strong style={{ color: '#34d399' }}>🌟 Keunggulan Aplikasi Desa Digital:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.55 }}>
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
                style={{ padding: '0.6rem 1.5rem' }}
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
