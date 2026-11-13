import React, { useState } from 'react'

export interface BandaUnifiedNavbarProps {
  currentUser?: any
  activeTab?: string
  onNavigateTab: (tab: any) => void
  onOpenLogin?: () => void
  onOpenRegister?: () => void
  onOpenMarketplace?: () => void
  onLogout?: () => void
  isOnline?: boolean
}

export const BandaUnifiedNavbar: React.FC<BandaUnifiedNavbarProps> = ({
  currentUser,
  activeTab = 'landing',
  onNavigateTab,
  onOpenLogin,
  onOpenRegister,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Roles
  const roles: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isOfficerOrAdmin = isSuperuser || roles.some((r) => ['admin', 'village_officer'].includes(r))

  const navLinks = [
    { label: 'Beranda', id: 'landing', isHash: false },
    { label: 'Peta Spasial', id: 'gis', isHash: false },
    { label: 'Wisata (SAW)', id: 'smart_planner', isHash: false },
    { label: 'Eco-Stay', id: 'tourism', isHash: false },
    { label: 'Koperasi & UMKM', id: 'koperasi', isHash: false },
    { label: 'Layanan Warga', id: isOfficerOrAdmin ? 'population' : 'letters', isHash: false },
  ]

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-[#081d35]/90 backdrop-blur-md border-b border-white/10 text-white transition-all">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigateTab(currentUser ? 'dashboard' : 'landing')}
          className="inline-flex items-center gap-2.5 text-left focus:outline-none"
        >
          {/* Nutmeg Gold Logo */}
          <svg
            className="w-5 h-6 shrink-0"
            viewBox="0 0 21 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10.5 2C6.5 6 4 10.5 4 14.5C4 18.09 6.91 21 10.5 21C14.09 21 17 18.09 17 14.5C17 10.5 14.5 6 10.5 2Z"
              stroke="#F4B75E"
              strokeWidth="1.6"
              fill="rgba(244, 183, 94, 0.18)"
            />
            <path
              d="M10.5 7.5C8.8 10 8 12.2 8 14.2C8 15.86 9.12 17.2 10.5 17.2C11.88 17.2 13 15.86 13 14.2C13 12.2 12.2 10 10.5 7.5Z"
              fill="#F4B75E"
            />
            <path
              d="M2 23.5C4.5 22 7.2 22 10.5 23.5C13.8 25 16.5 25 19 23.5"
              stroke="#F4B75E"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-serif text-lg sm:text-xl font-medium tracking-tight text-white hover:text-amber-300 transition-colors">
            bandanaira.com
          </span>
        </button>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs">
          {currentUser && (
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className={`font-semibold transition-colors pb-0.5 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-amber-400 border-amber-400'
                  : 'text-[#c1ced8] border-transparent hover:text-white'
              }`}
            >
              📊 Dasbor Ekosistem
            </button>
          )}

          {navLinks.map((link) => {
            const isActive = activeTab === link.id
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigateTab(link.id)}
                className={`font-medium transition-colors pb-0.5 border-b-2 ${
                  isActive
                    ? 'text-amber-400 border-amber-400 font-semibold'
                    : 'text-[#c1ced8] border-transparent hover:text-white'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Right User State & Actions */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{currentUser.full_name || currentUser.username}</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 text-xs font-semibold transition-colors"
                  title="Keluar dari Akun"
                >
                  Keluar
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenRegister && (
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Daftar
                </button>
              )}
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Masuk / Login
                </button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center text-sm"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden pt-4 pb-2 border-t border-white/10 mt-3 flex flex-col gap-2">
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                onNavigateTab('dashboard')
                setMobileOpen(false)
              }}
              className="text-left py-1 text-sm font-bold text-amber-400"
            >
              📊 Dasbor Ekosistem Saya
            </button>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                onNavigateTab(link.id)
                setMobileOpen(false)
              }}
              className={`text-left py-1 text-sm ${
                activeTab === link.id ? 'text-amber-300 font-semibold' : 'text-[#c1ced8]'
              }`}
            >
              {link.label}
            </button>
          ))}

          {!currentUser && onOpenRegister && (
            <button
              type="button"
              onClick={() => {
                onOpenRegister()
                setMobileOpen(false)
              }}
              className="mt-2 py-2 text-center rounded-lg bg-amber-600 text-white text-xs font-bold"
            >
              Daftar Akun Baru
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default BandaUnifiedNavbar
