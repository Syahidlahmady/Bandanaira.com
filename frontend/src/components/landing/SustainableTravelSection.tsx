import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import AnimatedNumber from '../ui/AnimatedNumber'

export interface SustainableTravelSectionProps {
  onNavigate?: (tab: any) => void
  onOpenLogin?: () => void
  currentUser?: any
}

export const SustainableTravelSection: React.FC<SustainableTravelSectionProps> = ({
  onNavigate,
  onOpenLogin,
  currentUser,
}) => {
  return (
    <section
      id="penduduk-fasilitas"
      aria-labelledby="island-demographics-heading"
      className="relative w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#07192f] text-white overflow-hidden border-t border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#0f3560_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#f4b75e]" />
              <p className="font-sans text-[11px] font-bold tracking-[0.25em] text-[#f4b75e] uppercase">
                DEMOGRAFI &amp; VITALITAS KEPULAUAN
              </p>
            </div>

            <h2
              id="island-demographics-heading"
              className="text-3xl sm:text-4xl lg:text-[44px] font-sans font-bold tracking-tight text-white leading-tight"
            >
              Bukan Sekadar Destinasi:{' '}
              <span className="font-script font-normal text-amber-200 text-4xl sm:text-5xl lg:text-6xl inline-block ml-1">
                Ruang Hidup Kepulauan
              </span>
            </h2>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Kepulauan Banda adalah rumah bagi masyarakat adat yang berdaulat, petani pala pusaka, dan nelayan tradisional yang mendiami gugusan atol vulkanik di Laut Banda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigate && onOpenLogin && (
              <button
                type="button"
                onClick={() => (currentUser ? onNavigate('dashboard') : onOpenLogin())}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-amber-600/30 group cursor-pointer"
              >
                <span>Masuk Portal Warga</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Stat Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 7 Pulau Berpenghuni */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-amber-300 tracking-tight">
                  <AnimatedNumber value={7} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  Gugusan Aktif
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-amber-200 transition-colors">
                Pulau Berpenghuni Aktif
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pulau Neira, Banda Besar (Lonthoir), Pulau Ay, Pulau Rhun, Pulau Hatta, Pulau Syahrir (Pisang), dan gugusan atol nelayan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200/80">
              <span>Bentang Geografis Kepulauan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Card 2: 11 Desa / Negeri Administratif */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sky-400/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-sky-300 tracking-tight">
                  <AnimatedNumber value={11} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-400/15 text-sky-300 border border-sky-400/30 whitespace-nowrap">
                  Negeri Adat
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-sky-200 transition-colors">
                Desa &amp; Negeri Kepulauan
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mencakup Negeri Nusantara, Dwiwarna, Tanah Rata, Lonthoir, Selamon, Waer, Kumbir, hingga desa mandiri di Pulau Rhun dan Ay.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-200/80">
              <span>Pemerintahan Desa Mandiri</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
          </div>

          {/* Card 3: 21.000+ Jiwa Penduduk */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-emerald-300 tracking-tight">
                  <AnimatedNumber value={21000} suffix="+" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
                  Warga Pulau
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-200 transition-colors">
                Jiwa Penduduk Terdata
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Masyarakat kepulauan yang hidup berdampingan dengan laut dalam, menjaga kelestarian tradisi Sasi adat dan perkebunan pala pusaka.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/80">
              <span>Harmoni Komunitas Lokal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Card 4: 1 Ekosistem Digital Terpadu */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#f4b75e]/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-[#f4b75e] tracking-tight">
                  <AnimatedNumber value={1} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f4b75e]/15 text-[#f4b75e] border border-[#f4b75e]/30 whitespace-nowrap">
                  Terintegrasi
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-amber-200 transition-colors">
                Ekosistem Digital Kepulauan
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mengintegrasikan administrasi kependudukan, pemantauan energi surya dan air bersih RO desa, serta sertifikasi rantai pasok pala.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#f4b75e]/80">
              <span>Kemandirian Pulau Terluar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f4b75e]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SustainableTravelSection
