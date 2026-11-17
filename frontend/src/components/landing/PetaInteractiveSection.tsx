import React, { Suspense, lazy, useState } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { setPreferredTourismSubTab, TourismSubTab } from '../../services/tourism'

const InteractiveMapWorkspace = lazy(() =>
  import('../../views/InteractiveMapWorkspace').then((m) => ({
    default: m.InteractiveMapWorkspace,
  }))
)

export interface BandaIslandData {
  id: string
  name: string
  tagline: string
  description: string
  image: string
  features: string[]
  targetSubTab: TourismSubTab
  coordinatesLabel: string
  // Approximate center on 1000x600 SVG map
  center: { x: number; y: number }
  labelPos: { x: number; y: number }
  svgPath: string
}

export const BANDA_ISLANDS: BandaIslandData[] = [
  {
    id: 'neira',
    name: 'Pulau Neira',
    tagline: 'Pusat Sejarah & Cagar Budaya Kolonial',
    description:
      'Pusat denyut budaya dan pemerintahan kepulauan. Menyimpan benteng pentagon Benteng Belgica abad ke-17, Benteng Nassau, dan rumah pengasingan Bung Hatta serta Sutan Sjahrir.',
    image:
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=85',
    features: ['Benteng Belgica & Nassau', 'Museum Pengasingan Hatta', 'Pelabuhan Laut Utama'],
    targetSubTab: 'heritage',
    coordinatesLabel: '04°31′25″S 129°54′15″E',
    center: { x: 505, y: 250 },
    labelPos: { x: 505, y: 215 },
    // Curved boomerang shape north of Banda Besar
    svgPath:
      'M 470 240 C 475 225, 495 220, 520 230 C 535 235, 545 250, 535 265 C 520 275, 495 270, 480 260 C 470 252, 465 245, 470 240 Z',
  },
  {
    id: 'banda-api',
    name: 'Gunung Banda Api',
    tagline: 'Kaldera Vulkanik & Spot Laut Lava Flow',
    description:
      'Kerucut gunung api aktif megah setinggi 656 mdpl. Letusan 1988 melahirkan terumbu karang meja Lava Flow yang tumbuh dengan kecepatan biologis tercepat di dunia.',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85',
    features: ['Trekking Puncak 656 mdpl', 'Snorkeling Karang Lava Flow', 'Sunset 360 Derajat'],
    targetSubTab: 'destinations',
    coordinatesLabel: '04°31′30″S 129°52′45″E',
    center: { x: 425, y: 275 },
    labelPos: { x: 425, y: 325 },
    // Conical volcanic island shape
    svgPath:
      'M 425 240 C 445 242, 458 255, 455 275 C 452 295, 435 305, 415 302 C 395 300, 385 285, 390 268 C 395 250, 410 238, 425 240 Z',
  },
  {
    id: 'banda-besar',
    name: 'Banda Besar (Lonthoir)',
    tagline: 'Kanopi Kenari & Perkebunan Pala Pusaka',
    description:
      'Pulau terbesar berbentuk sabit yang memayungi teluk. Menjadi rumah bagi pohon kenari raksasa berumur berabad-abad, perkebunan pala tertua, dan Benteng Hollandia di puncak bukit.',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85',
    features: ['Kebun Pala Pusaka Lonthoir', 'Benteng Hollandia & Sumur Adat', 'Desa Adat Tradisional'],
    targetSubTab: 'destinations',
    coordinatesLabel: '04°34′00″S 129°55′30″E',
    center: { x: 550, y: 335 },
    labelPos: { x: 550, y: 385 },
    // Long sweeping crescent/banana shape
    svgPath:
      'M 430 325 C 470 315, 530 305, 590 315 C 650 325, 680 355, 670 375 C 660 385, 625 365, 575 350 C 515 335, 465 345, 430 355 C 418 350, 418 335, 430 325 Z',
  },
  {
    id: 'hatta',
    name: 'Pulau Hatta (Rozengain)',
    tagline: 'Tebing Laut Drop-Off & Pasir Putih Alami',
    description:
      'Pulau timur berpasir putih selembut tepung dengan tebing karang drop-off bawah laut yang jatuh ke palung dalam. Kawanan lumba-lumba liar dan penyu karang sering melintas di pesisir.',
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=85',
    features: ['Wall Diving Drop-off', 'Penyu & Lumba-lumba', 'Bungalow Eco-Stay'],
    targetSubTab: 'destinations',
    coordinatesLabel: '04°35′30″S 130°02′10″E',
    center: { x: 790, y: 395 },
    labelPos: { x: 790, y: 440 },
    // Elongated oval island southeast
    svgPath:
      'M 760 385 C 785 375, 815 385, 825 400 C 825 415, 800 425, 775 420 C 750 415, 745 395, 760 385 Z',
  },
  {
    id: 'ai',
    name: 'Pulau Ai',
    tagline: 'Laguna Karang Kristal & Benteng Revenge',
    description:
      'Pulau berpasir putih dikelilingi perairan biru jernih seperti akuarium alam. Memiliki situs sejarah Benteng Revenge VOC serta spot snorkeling berenang bersama hiu karang jinak.',
    image:
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=900&q=85',
    features: ['Benteng Revenge VOC', 'Laguna Karang Sehat', 'Snorkeling Hiu Karang'],
    targetSubTab: 'destinations',
    coordinatesLabel: '04°31′40″S 129°46′20″E',
    center: { x: 275, y: 260 },
    labelPos: { x: 275, y: 300 },
    // Rounded tear shape island west of Api
    svgPath:
      'M 255 248 C 275 238, 295 245, 300 262 C 302 278, 285 288, 265 282 C 248 275, 245 258, 255 248 Z',
  },
  {
    id: 'rhun',
    name: 'Pulau Rhun',
    tagline: 'Saksi Sejarah Penukaran Manhattan 1667',
    description:
      'Pulau legendaris yang ditukar oleh Inggris dengan pulau Manhattan New York dalam Traktat Breda 1667 karena monopoli rempah pala. Menyimpan ketenangan desa pesisir bersahaja.',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85',
    features: ['Traktat Breda 1667', 'Desa Pesisir Tenang', 'Sejarah Monopoli Rempah'],
    targetSubTab: 'heritage',
    coordinatesLabel: '04°33′25″S 129°41′00″E',
    center: { x: 145, y: 290 },
    labelPos: { x: 145, y: 325 },
    // Elongated island west of Ai
    svgPath:
      'M 125 280 C 145 272, 168 280, 172 295 C 172 305, 150 312, 132 305 C 118 298, 115 288, 125 280 Z',
  },
  {
    id: 'pisang',
    name: 'Pulau Pisang (Syahrir)',
    tagline: 'Suaka Alam Sejuk & Pesisir Alami',
    description:
      'Pulau mungil tak berpenghuni di utara Banda Besar dengan terumbu karang dangkal dan panorama perbukitan hijau tempat Sutan Sjahrir kerap berlayar dan memancing.',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85',
    features: ['Spot Berenang Alami', 'Suaka Burung Laut', 'Wisata Perahu Tradisional'],
    targetSubTab: 'destinations',
    coordinatesLabel: '04°29′50″S 129°56′10″E',
    center: { x: 595, y: 175 },
    labelPos: { x: 595, y: 155 },
    // Small elongated islet north
    svgPath:
      'M 580 170 C 595 165, 612 170, 615 178 C 615 186, 600 190, 588 186 C 576 182, 574 175, 580 170 Z',
  },
]

export interface PetaInteractiveSectionProps {
  onNavigate: (tab: any) => void
  currentUser: any
}

export const PetaInteractiveSection: React.FC<PetaInteractiveSectionProps> = ({
  onNavigate,
  currentUser,
}) => {
  const [activeIsland, setActiveIsland] = useState<BandaIslandData | null>(BANDA_ISLANDS[0])
  const [viewMode, setViewMode] = useState<'archipelago' | 'gis'>('archipelago')

  const openIslandDestinations = (island: BandaIslandData) => {
    setPreferredTourismSubTab(island.targetSubTab)
    onNavigate('tourism')
  }

  return (
    <section
      id="peta"
      aria-labelledby="peta-heading"
      className="relative w-full py-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f0f6fa] via-[#e8f1f8] to-[#f4f7f9] text-slate-900 overflow-hidden"
    >
      {/* Subtle sea ripples / bathymetry texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#b2cde0_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Top Tracking Subtitle (Ala indonesia.travel) */}
        <p className="font-sans text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#0f2c59]/75 uppercase text-center mb-3">
          DISCOVER TOP DESTINATIONS AND ATTRACTIONS
        </p>

        {/* The Signature Split Divider Header: ──── Visit Banda Neira ──── */}
        <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-4 sm:gap-8 mb-6">
          <div className="flex-1 h-[1.5px] bg-[#0f2c59]/70" />
          <h2
            id="peta-heading"
            className="font-sans font-bold text-3xl sm:text-4xl lg:text-[46px] text-[#0f2c59] tracking-tight whitespace-nowrap"
          >
            Visit Banda Neira
          </h2>
          <div className="flex-1 h-[1.5px] bg-[#0f2c59]/70" />
        </div>

        {/* View Mode Switcher Pills (Archipelago Map vs Full Spatial GIS) */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setViewMode('archipelago')}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              viewMode === 'archipelago'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
            }`}
          >
            Peta Gugusan Kepulauan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('gis')}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              viewMode === 'gis'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
            }`}
          >
            Layer Spasial GIS Lengkap
          </button>
        </div>

        {/* MAIN DISPLAY AREA: NO HEAVY CANVAS BOX */}
        {viewMode === 'archipelago' ? (
          <div className="relative w-full min-h-[560px] lg:min-h-[640px] flex items-center justify-center">
            {/* Seamless SVG Archipelago Map (Edge-to-edge ocean feeling) */}
            <div className="w-full h-full relative flex items-center justify-center">
              <svg
                viewBox="0 0 960 540"
                className="w-full h-auto max-h-[620px] select-none"
                style={{ filter: 'drop-shadow(0 15px 25px rgba(15, 44, 89, 0.08))' }}
              >
                <defs>
                  {/* Oceanic water gradient */}
                  <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dcecf7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#cde2f2" stopOpacity="0.6" />
                  </linearGradient>

                  {/* Island gradient */}
                  <linearGradient id="islandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#b9d6ea" />
                    <stop offset="100%" stopColor="#9ec4de" />
                  </linearGradient>

                  {/* Active Island gradient */}
                  <linearGradient id="islandActiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#306b99" />
                    <stop offset="100%" stopColor="#18476f" />
                  </linearGradient>
                </defs>

                {/* Subtle bathymetric depth contours */}
                <path
                  d="M 50 300 Q 250 200 450 220 T 850 350"
                  fill="none"
                  stroke="#9ec4de"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.4"
                />
                <path
                  d="M 100 380 Q 350 320 550 360 T 900 450"
                  fill="none"
                  stroke="#9ec4de"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.3"
                />

                {/* Island Paths & Interactions */}
                {BANDA_ISLANDS.map((island) => {
                  const isSelected = activeIsland?.id === island.id

                  return (
                    <g key={island.id} className="cursor-pointer">
                      {/* Selection Glow / Radar Ring */}
                      {isSelected && (
                        <circle
                          cx={island.center.x}
                          cy={island.center.y}
                          r="45"
                          fill="none"
                          stroke="#0f2c59"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="animate-spin"
                          style={{
                            transformOrigin: `${island.center.x}px ${island.center.y}px`,
                            animationDuration: '18s',
                          }}
                          opacity="0.6"
                        />
                      )}

                      {/* Island Landmass */}
                      <path
                        d={island.svgPath}
                        fill={isSelected ? 'url(#islandActiveGrad)' : 'url(#islandGrad)'}
                        stroke={isSelected ? '#0f2c59' : '#6f9ec0'}
                        strokeWidth={isSelected ? '2.5' : '1.2'}
                        onClick={() => setActiveIsland(island)}
                        className="transition-all duration-300 hover:fill-[#2d6490] hover:stroke-[#0f2c59]"
                      />

                      {/* Island Text Label (Exact style of indonesia.travel map) */}
                      <text
                        x={island.labelPos.x}
                        y={island.labelPos.y}
                        textAnchor="middle"
                        onClick={() => setActiveIsland(island)}
                        className={`font-sans text-[12px] sm:text-[13px] font-semibold tracking-wide transition-colors ${
                          isSelected
                            ? 'fill-[#0f2c59] font-bold'
                            : 'fill-slate-700 hover:fill-[#0f2c59]'
                        }`}
                      >
                        {island.name}
                      </text>
                    </g>
                  )
                })}

                {/* Elegant Nautical Compass Rose in the corner */}
                <g transform="translate(80, 80)" opacity="0.45" pointerEvents="none">
                  <circle cx="0" cy="0" r="28" fill="none" stroke="#0f2c59" strokeWidth="1" />
                  <path d="M 0 -24 L 5 -5 L 24 0 L 5 5 L 0 24 L -5 5 L -24 0 L -5 -5 Z" fill="#0f2c59" />
                  <text x="0" y="-30" textAnchor="middle" className="font-mono text-[9px] font-bold fill-[#0f2c59]">
                    U
                  </text>
                </g>
              </svg>
            </div>

            {/* Right-Side Destination Showcase Card (Ala indonesia.travel Screenshot 1) */}
            {activeIsland && (
              <div className="absolute right-0 top-4 bottom-4 w-full sm:w-[360px] lg:w-[400px] z-20 flex flex-col justify-center pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col transition-all duration-300">
                  {/* Card Header Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={activeIsland.image}
                      alt={activeIsland.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => setActiveIsland(null)}
                      aria-label="Tutup Detail Pulau"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                    <div className="absolute bottom-2 left-3">
                      <span className="font-mono text-[10px] text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
                        {activeIsland.coordinatesLabel}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-sans font-bold text-2xl text-[#0f2c59] leading-tight mb-1">
                        {activeIsland.name}
                      </h3>
                      <p className="font-sans text-xs font-semibold text-amber-600 mb-3">
                        {activeIsland.tagline}
                      </p>
                      <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                        {activeIsland.description}
                      </p>

                      {/* Feature Points */}
                      <div className="flex flex-col gap-1.5 mb-5 border-t border-slate-100 pt-3">
                        {activeIsland.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0f2c59]" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action button (Outline pill style like 'Learn more') */}
                    <button
                      type="button"
                      onClick={() => openIslandDestinations(activeIsland)}
                      className="w-full py-3 px-5 rounded-xl border border-[#0f2c59] hover:bg-[#0f2c59] text-[#0f2c59] hover:text-white font-sans text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>Jelajahi Wisata {activeIsland.name}</span>
                      <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Mode 2: Full Spatial GIS View (Rendered directly, NO bounding box) */
          <div className="w-full min-h-[640px] rounded-3xl overflow-hidden shadow-lg border border-slate-300/80 bg-white relative">
            <Suspense
              fallback={
                <div className="w-full h-[640px] flex flex-col items-center justify-center gap-3 bg-sky-50">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0f2c59] border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-slate-600">
                    Memuat Layer Spasial GIS Banda Neira...
                  </span>
                </div>
              }
            >
              <InteractiveMapWorkspace currentUser={currentUser} />
            </Suspense>
          </div>
        )}

        {/* Bottom Quick Island Selectors (Helpful for mobile or fast selection) */}
        <div className="w-full flex items-center justify-center flex-wrap gap-2 pt-6">
          <span className="text-xs text-slate-500 font-medium mr-2">Pilih Pulau:</span>
          {BANDA_ISLANDS.map((isl) => (
            <button
              key={isl.id}
              type="button"
              onClick={() => {
                setActiveIsland(isl)
                setViewMode('archipelago')
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeIsland?.id === isl.id && viewMode === 'archipelago'
                  ? 'bg-[#0f2c59] text-white'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {isl.name}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f2c59] hover:text-amber-600 transition-colors"
          >
            <span>Buka Layar Penuh GIS</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PetaInteractiveSection
