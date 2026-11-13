import React from 'react'

export interface BandaUnifiedFooterProps {
  onNavigateTab?: (tab: any) => void
  onOpenRegister?: () => void
  onOpenLogin?: () => void
  onOpenQuickLogin?: () => void
}

export const BandaUnifiedFooter: React.FC<BandaUnifiedFooterProps> = ({
  onNavigateTab,
  onOpenRegister,
  onOpenLogin,
  onOpenQuickLogin,
}) => {
  return (
    <footer className="w-full bg-[#081D35] text-white pt-16 pb-8 px-6 sm:px-12 lg:px-20 border-t border-white/10 mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          {/* Brand & Description */}
          <div className="flex flex-col gap-4 max-w-[380px]">
            <div className="inline-flex items-center gap-2.5">
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
              <span className="font-serif text-2xl font-medium tracking-tight text-white">
                bandanaira.com
              </span>
            </div>
            <p className="text-xs text-[#c1ced8] leading-relaxed">
              Banda Smart Tourism &amp; Island Ecosystem. Menghubungkan perjalanan, warisan 177 cagar budaya,
              dan kehidupan lestari masyarakat di Kepulauan Banda.
            </p>
            <div className="text-[11px] text-[#f4b75e] flex items-center gap-1.5 font-mono">
              <span>⌖</span>
              <span>Kepulauan Banda, Maluku Tengah, Indonesia</span>
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 max-w-[680px]">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Jelajahi Banda
              </h4>
              <nav className="flex flex-col gap-2 text-xs text-[#c1ced8]">
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('landing')} className="text-left hover:text-white transition-colors">
                  Beranda Utama
                </button>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('gis')} className="text-left hover:text-white transition-colors">
                  Peta Spasial Vektor
                </button>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('smart_planner')} className="text-left hover:text-white transition-colors">
                  Kalkulator SAW Wisata
                </button>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('tourism')} className="text-left hover:text-white transition-colors">
                  Direktori Eco-Stay
                </button>
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Ekosistem Pulau
              </h4>
              <nav className="flex flex-col gap-2 text-xs text-[#c1ced8]">
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('koperasi')} className="text-left hover:text-white transition-colors">
                  Koperasi Hatta &amp; Air RO
                </button>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('traceability')} className="text-left hover:text-white transition-colors">
                  Rantai Pasok Pala &amp; Fuli
                </button>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('farming')} className="text-left hover:text-white transition-colors">
                  Pemetaan Kebun Poktan
                </button>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('letters')} className="text-left hover:text-white transition-colors">
                  Layanan Surat Warga
                </button>
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Akses Akun
              </h4>
              <nav className="flex flex-col gap-2 text-xs text-[#c1ced8]">
                {onOpenRegister && (
                  <button type="button" onClick={onOpenRegister} className="text-left hover:text-white transition-colors font-medium text-amber-300">
                    Daftar Akun Baru
                  </button>
                )}
                {onOpenLogin && (
                  <button type="button" onClick={onOpenLogin} className="text-left hover:text-white transition-colors">
                    Masuk / Login
                  </button>
                )}
                {onOpenQuickLogin && (
                  <button type="button" onClick={onOpenQuickLogin} className="text-left hover:text-white transition-colors">
                    ⚡ Simulasi Peran (Operator)
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#c1ced8]">
          <p>© 2026 bandanaira.com. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="font-serif italic text-amber-400 text-sm">
            Dari Banda, untuk dunia.
          </p>
          <div className="flex items-center gap-4">
            <span>Kabupaten Maluku Tengah</span>
            <span>·</span>
            <span>Provinsi Maluku</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default BandaUnifiedFooter
