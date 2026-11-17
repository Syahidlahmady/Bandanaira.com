import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import AnimatedNumber from '../ui/AnimatedNumber'
import { setPreferredTourismSubTab } from '../../services/tourism'

export interface EcosystemFeaturesSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin?: () => void
  currentUser?: any
}

export const EcosystemFeaturesSection: React.FC<EcosystemFeaturesSectionProps> = ({
  onNavigate,
}) => {
  return (
    <section
      id="infografis-wisata"
      aria-labelledby="tourism-stats-heading"
      className="relative w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#081d35] text-white overflow-hidden border-t border-white/5"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,#113a68_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#f4b75e]" />
              <p className="font-sans text-[11px] font-bold tracking-[0.25em] text-[#f4b75e] uppercase">
                INVENTARISASI DESTINASI BANDA
              </p>
            </div>

            <h2
              id="tourism-stats-heading"
              className="text-3xl sm:text-4xl lg:text-[44px] font-sans font-bold tracking-tight text-white leading-tight"
            >
              Dua Wajah Keagungan:{' '}
              <span className="font-script font-normal text-amber-200 text-4xl sm:text-5xl lg:text-6xl inline-block ml-1">
                Sejarah &amp; Bahari
              </span>
            </h2>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Berdasarkan pemetaan wilayah Kepulauan Banda, kekayaan warisan budaya kolonial dunia bersanding seimbang dengan keajaiban terumbu karang dan lanskap vulkanik laut dalam.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPreferredTourismSubTab('destinations')
                onNavigate('tourism')
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-amber-600/30 group cursor-pointer"
            >
              <span>Lihat Semua Destinasi</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* 4 Stat Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 22 Budaya & Sejarah */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-amber-300 tracking-tight">
                  <AnimatedNumber value={22} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  52% Dominan
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-amber-200 transition-colors">
                Destinasi Budaya &amp; Sejarah
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Benteng VOC Belgica, Rumah Pengasingan Bung Hatta &amp; Sutan Sjahrir, hingga perkebunan pala pusaka yang menjadi ikon rempah dunia.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200/80">
              <span>Warisan Kolonial &amp; Pahlawan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Card 2: 20 Wisata Alam & Bahari */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sky-400/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-sky-300 tracking-tight">
                  <AnimatedNumber value={20} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-400/15 text-sky-300 border border-sky-400/30 whitespace-nowrap">
                  48% Wilayah
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-sky-200 transition-colors">
                Wisata Bahari &amp; Vulkanik
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Puncak Gunung Api Banda, terumbu karang regenerasi tercepat di Lava Flow, serta pasir putih Pulau Syahrir (Pulau Pisang).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-200/80">
              <span>Terumbu Karang &amp; Atol</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
          </div>

          {/* Card 3: 42 Titik Jelajah */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-emerald-300 tracking-tight">
                  <AnimatedNumber value={42} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
                  Terpetakan
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-200 transition-colors">
                Titik Jelajah Terverifikasi
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seluruh koordinat cagar budaya, spot menyelam, dan pesisir terintegrasi langsung dalam peta spasial interaktif kepulauan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/80">
              <span>Sistem Spasial Terpadu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Card 4: 30+ Penginapan & Eco-Lodges */}
          <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-300/40 transition-all duration-300 backdrop-blur-sm group flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-[#f4b75e] tracking-tight">
                  <AnimatedNumber value={30} suffix="+" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f4b75e]/15 text-[#f4b75e] border border-[#f4b75e]/30 whitespace-nowrap">
                  Eco-Lodges
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-amber-200 transition-colors">
                Penginapan &amp; Homestay Warga
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pilihan akomodasi otentik berstandar lokal, dari mansion kolonial di Neira hingga eco-cottage pesisir di Ay, Rhun, dan Hatta.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#f4b75e]/80">
              <span>Pemberdayaan Warga Lokal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f4b75e]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EcosystemFeaturesSection
