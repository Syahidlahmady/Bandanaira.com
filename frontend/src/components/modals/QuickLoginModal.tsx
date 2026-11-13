import React, { useState } from 'react'
import {
  Zap,
  CheckCircle2,
  X,
  LogOut,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { User } from '../../services/auth'

export interface QuickLoginModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User | null
  onQuickLogin: (username: string, password: string) => Promise<void> | void
  onLogout: () => void
}

export interface DemoActorAccount {
  role: string
  name: string
  u: string
  p: string
  roleKey: string
  icon: string
  badge: string
  accentColor: string
  badgeClass: string
  desc: string
  destinationTab: string
  landingTitle: string
}

export const DEMO_ACTOR_ACCOUNTS: DemoActorAccount[] = [
  {
    role: 'Petugas Kantor Desa',
    name: 'Budi Santoso',
    u: 'petugas',
    p: 'Petugas123!',
    roleKey: 'village_officer',
    icon: '🏛️',
    badge: 'Pemerintahan',
    accentColor: '#f59e0b',
    badgeClass: 'badge-amber',
    desc: 'Verifikasi kependudukan NIK, validasi permohonan surat & rekap audit desa',
    destinationTab: 'population',
    landingTitle: '👥 Kependudukan & Layanan Desa',
  },
  {
    role: 'Pengelola Koperasi Hatta',
    name: 'Faisal Latarisa',
    u: 'pengelola_koperasi',
    p: 'Koperasi123!',
    roleKey: 'coop_manager',
    icon: '⚖️',
    badge: 'Kasir & Bank Sampah',
    accentColor: '#10b981',
    badgeClass: 'badge-emerald',
    desc: 'Timbangan kasir komoditas pala, bank sampah botol 10L, & koin air minum RO',
    destinationTab: 'koperasi',
    landingTitle: '⚖️ Koperasi & Bank Sampah',
  },
  {
    role: 'Pengelola Eco-Stay & Wisata',
    name: 'Rahmat Delfika',
    u: 'operator_homestay',
    p: 'Homestay123!',
    roleKey: 'homestay_operator',
    icon: '🏡',
    badge: 'Akomodasi & Homestay',
    accentColor: '#06b6d4',
    badgeClass: 'badge-blue',
    desc: 'Kelola kamar penginapan, fasilitas air RO, & pantau reservasi via WhatsApp',
    destinationTab: 'tourism',
    landingTitle: '🏖️ Smart Tourism & Eco-Stay',
  },
  {
    role: 'Pemandu Smart Tourism & Budaya',
    name: 'Dewi Nusantara',
    u: 'admin_wisata',
    p: 'Wisata123!',
    roleKey: 'smart_tourism_admin',
    icon: '🏖️',
    badge: '177 Cagar Budaya',
    accentColor: '#38bdf8',
    badgeClass: 'badge-cyan',
    desc: 'Katalog cagar budaya, pemutar audio guide VOC, rute cerdas SAW & GIS',
    destinationTab: 'tourism',
    landingTitle: '🏖️ Smart Tourism & Eco-Stay',
  },
  {
    role: 'Surveyor Lapangan & IoT',
    name: 'Fauzan Arisanto',
    u: 'surveyor',
    p: 'Surveyor123!',
    roleKey: 'field_surveyor',
    icon: '📋',
    badge: 'Survei & Telemetri',
    accentColor: '#8b5cf6',
    badgeClass: 'badge-purple',
    desc: 'Formulir survei NoSQL, pipa migrasi ETL PostGIS, & stasiun sensor ESP32',
    destinationTab: 'survei',
    landingTitle: '📋 Survei & ETL Hybrid',
  },
  {
    role: 'Ketua Kelompok Tani',
    name: 'Hasan Baadilla',
    u: 'ketua_kelompok',
    p: 'Ketua123!',
    roleKey: 'farmer_group_admin',
    icon: '👥',
    badge: 'Poktan Lonthoir',
    accentColor: '#c084fc',
    badgeClass: 'badge-purple',
    desc: 'Validasi petak kebun anggota & rekapitulasi panen rempah pala desa',
    destinationTab: 'farming',
    landingTitle: '🗺️ Peta Kebun & Poktan',
  },
  {
    role: 'Petani Rempah Pala',
    name: 'Ali Wailissa',
    u: 'petani',
    p: 'Petani123!',
    roleKey: 'farmer',
    icon: '👨‍🌾',
    badge: 'Pala & Cengkeh',
    accentColor: '#10b981',
    badgeClass: 'badge-emerald',
    desc: 'Catat hasil panen kebun, pantau mutu Grade AAA/B & geolokasi petak',
    destinationTab: 'traceability',
    landingTitle: '📦 Panen & Mutu Rempah',
  },
  {
    role: 'Warga Masyarakat Desa',
    name: 'Siti Rahma',
    u: 'warga',
    p: 'Warga123!',
    roleKey: 'resident',
    icon: '👤',
    badge: 'Layanan Mandiri',
    accentColor: '#38bdf8',
    badgeClass: 'badge-blue',
    desc: 'Cek kuota air minum RO, tabungan botol plastik, & permohonan surat SKU',
    destinationTab: 'koperasi',
    landingTitle: '⚖️ Koperasi & Layanan Mandiri',
  },
  {
    role: 'Administrator Sistem',
    name: 'Administrator Banda',
    u: 'admin',
    p: 'Admin123!',
    roleKey: 'admin',
    icon: '🛡️',
    badge: 'Root Access',
    accentColor: '#ec4899',
    badgeClass: 'badge-red',
    desc: 'Master suite 11 modul, audit trail OWASP, blockchain EVM & konfigurasi',
    destinationTab: 'population',
    landingTitle: '👥 Administrasi Master (11 Tab)',
  },
]

export const QuickLoginModal: React.FC<QuickLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onQuickLogin,
  onLogout,
}) => {
  const [switchingUser, setSwitchingUser] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')

  if (!isOpen) return null

  const handleSelectAccount = async (acc: DemoActorAccount) => {
    setSwitchingUser(acc.u)
    try {
      await onQuickLogin(acc.u, acc.p)
      onClose()
    } finally {
      setSwitchingUser(null)
    }
  }

  const handleSwitchToGuest = () => {
    onLogout()
    onClose()
  }

  const filteredAccounts = filterRole === 'all'
    ? DEMO_ACTOR_ACCOUNTS
    : filterRole === 'gov'
    ? DEMO_ACTOR_ACCOUNTS.filter((a) => ['village_officer', 'admin'].includes(a.roleKey))
    : filterRole === 'economy'
    ? DEMO_ACTOR_ACCOUNTS.filter((a) => ['coop_manager', 'resident', 'farmer', 'farmer_group_admin'].includes(a.roleKey))
    : filterRole === 'tourism'
    ? DEMO_ACTOR_ACCOUNTS.filter((a) => ['homestay_operator', 'smart_tourism_admin'].includes(a.roleKey))
    : DEMO_ACTOR_ACCOUNTS.filter((a) => ['field_surveyor'].includes(a.roleKey))

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={onClose}
      style={{
        zIndex: 99999,
        background: 'rgba(4, 8, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '940px',
          maxHeight: '92vh',
          background: 'linear-gradient(155deg, #081d35 0%, #0f2c59 100%)',
          border: '1px solid rgba(244, 183, 94, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 28px 56px -12px rgba(4, 12, 24, 0.85), 0 0 42px rgba(244, 183, 94, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(244, 183, 94, 0.18)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(6, 21, 39, 0.82)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(217, 119, 6, 0.2)',
                border: '1px solid rgba(244, 183, 94, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f4b75e',
                boxShadow: '0 0 18px rgba(244, 183, 94, 0.25)',
              }}
            >
              <Zap size={22} fill="#f4b75e" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 className="font-serif" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: '#ffffff' }}>
                  Quick Login &amp; Simulator Multi-Aktor Banda Neira
                </h3>
                <span
                  style={{
                    background: 'rgba(217, 119, 6, 0.2)',
                    border: '1px solid rgba(244, 183, 94, 0.45)',
                    color: '#f4b75e',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  9 AKTOR READY
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                Ganti peran dalam 1-klik untuk menguji hak akses RBAC, alur kerja, dan tata kelola Ekosistem Banda Neira.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Session Bar & Filter Bar */}
        <div
          style={{
            padding: '0.9rem 1.5rem',
            background: 'rgba(11, 17, 32, 0.7)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Current Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Status Saat Ini:
            </span>
            {currentUser ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '999px',
                  padding: '0.25rem 0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                  {currentUser.full_name || currentUser.username}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  (@{currentUser.username})
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(148, 163, 184, 0.12)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '999px',
                  padding: '0.25rem 0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#94a3b8',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#cbd5e1' }}>
                  Mode Tamu (Guest Explorer / Belum Login)
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions (Guest & Category Filters) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {[
                { id: 'all', label: 'Semua (9)' },
                { id: 'gov', label: '🏛️ Desa' },
                { id: 'economy', label: '⚖️ Koperasi & Tani' },
                { id: 'tourism', label: '🏖️ Wisata' },
                { id: 'survey', label: '📋 Survei' },
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFilterRole(f.id)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '7px',
                    border: 'none',
                    cursor: 'pointer',
                    background: filterRole === f.id ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    color: filterRole === f.id ? '#34d399' : '#94a3b8',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={handleSwitchToGuest}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title="Keluar dari akun dan uji tampilan pengunjung publik"
              >
                <LogOut size={13} />
                <span>Mode Tamu</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Cards Grid */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredAccounts.map((acc) => {
            const isActive = currentUser?.username === acc.u
            const isSwitching = switchingUser === acc.u

            return (
              <div
                key={acc.u}
                onClick={() => !isSwitching && handleSelectAccount(acc)}
                style={{
                  background: isActive
                    ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'rgba(15, 23, 42, 0.65)',
                  border: isActive
                    ? '2px solid #10b981'
                    : `1px solid rgba(255, 255, 255, 0.08)`,
                  borderRadius: '16px',
                  padding: '1.1rem',
                  cursor: isSwitching ? 'wait' : 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isActive
                    ? '0 0 20px rgba(16, 185, 129, 0.25)'
                    : '0 4px 12px rgba(0, 0, 0, 0.25)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = acc.accentColor
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px ${acc.accentColor}33`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)'
                  }
                }}
              >
                {/* Active Indicator Stamp */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.85rem',
                      right: '0.85rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <CheckCircle2 size={11} /> AKTIF
                  </div>
                )}

                {/* Top Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${acc.accentColor}22 0%, rgba(15, 23, 42, 0.8) 100%)`,
                        border: `1px solid ${acc.accentColor}55`,
                        fontSize: '1.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {acc.icon}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <span
                        className={`badge ${acc.badgeClass}`}
                        style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', marginBottom: '0.2rem', display: 'inline-block' }}
                      >
                        {acc.badge}
                      </span>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: '#f8fafc',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {acc.name}
                      </h4>
                    </div>
                  </div>

                  {/* Role Title */}
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: acc.accentColor, marginBottom: '0.45rem' }}>
                    {acc.role}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      margin: '0 0 0.85rem',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      lineHeight: 1.45,
                      minHeight: '2.9rem',
                    }}
                  >
                    {acc.desc}
                  </p>
                </div>

                {/* Bottom Section: Destination & Action Button */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.65rem',
                      fontSize: '0.7rem',
                      color: '#64748b',
                    }}
                  >
                    <span>Mendarat di:</span>
                    <span style={{ color: '#cbd5e1', fontWeight: 700 }}>
                      {acc.landingTitle}
                    </span>
                  </div>

                  {/* Credentials pill & CTA Button */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        padding: '0.35rem 0.55rem',
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#94a3b8',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={`Username: ${acc.u} | Password: ${acc.p}`}
                    >
                      🔑 {acc.u}
                    </div>

                    <button
                      type="button"
                      disabled={isSwitching}
                      style={{
                        background: isActive
                          ? 'rgba(16, 185, 129, 0.25)'
                          : `linear-gradient(135deg, ${acc.accentColor} 0%, ${acc.accentColor}dd 100%)`,
                        border: 'none',
                        color: isActive ? '#34d399' : '#080c14',
                        padding: '0.38rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSwitching ? (
                        'Memuat...'
                      ) : isActive ? (
                        'Aktif'
                      ) : (
                        <>
                          <span>Masuk</span>
                          <ArrowRight size={12} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Footer Tip */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: 'rgba(11, 17, 32, 0.9)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>
              <b>Tips Pengujian:</b> Tombol simulator menginjeksikan JWT Bearer token asli dan mengatur navigasi sesuai peran secara deterministik.
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#10b981' }}>
            Banda Neira BST-NIRANA 2026
          </span>
        </div>
      </div>
    </div>
  )
}
