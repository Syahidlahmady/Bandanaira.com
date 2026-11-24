import React, { useState } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { useLanguage } from '../../context/LanguageContext'
import { BANDA_VILLAGES_SVG, BandaVillageSvgItem } from '../../data/bandaVillagesSvg'

export interface PetaInteractiveSectionProps {
  onNavigate: (tab: any) => void
  currentUser?: any
}

export const PetaInteractiveSection: React.FC<PetaInteractiveSectionProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage()
  const [selectedVillageId, setSelectedVillageId] = useState<string>('lonthoir')
  const [hoveredVillageId, setHoveredVillageId] = useState<string | null>(null)

  const selectedVillage =
    BANDA_VILLAGES_SVG.find((v) => v.id === selectedVillageId) || BANDA_VILLAGES_SVG[0]

  const activeHoveredVillage = hoveredVillageId
    ? BANDA_VILLAGES_SVG.find((v) => v.id === hoveredVillageId)
    : null

  const handleSelectVillage = (village: BandaVillageSvgItem) => {
    setSelectedVillageId(village.id)
  }

  return (
    <section
      id="peta"
      aria-labelledby="peta-heading"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#eaf4fb] via-[#f2f8fc] to-[#eaf3fa] text-slate-900 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Top Tracking Subtitle (Ala indonesia.travel) */}
        <p className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#4a6b82] uppercase text-center mb-4">
          {t.mapSection.tagline}
        </p>

        {/* The Signature Split Divider Header: ──── Visit Banda Neira ──── */}
        <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-3 sm:gap-8 mb-8 sm:mb-14 px-2">
          <div className="flex-1 h-[1.5px] bg-[#0c2340]/80 min-w-[20px]" />
          <h2
            id="peta-heading"
            className="font-serif text-2xl sm:text-5xl lg:text-[52px] text-[#0c2340] font-normal tracking-tight whitespace-normal sm:whitespace-nowrap text-center"
          >
            {t.mapSection.heading}
          </h2>
          <div className="flex-1 h-[1.5px] bg-[#0c2340]/80 min-w-[20px]" />
        </div>

        {/* Airy Atmospheric Canvas for SVG Map (Like indonesia.travel) */}
        <div className="w-full relative flex flex-col items-center">
          {/* Active Hover / Selection Tooltip Indicator */}
          <div className="mb-2 h-6 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium tracking-wide text-[#2e506d] transition-all">
              {activeHoveredVillage
                ? `${activeHoveredVillage.name} — ${activeHoveredVillage.island}`
                : `${selectedVillage.name} — ${selectedVillage.island}`}
            </span>
          </div>

          {/* Native Vector SVG Map with indonesia.travel Monochromatic Oceanic Aesthetic */}
          <div className="w-full max-w-5xl relative flex items-center justify-center px-2 py-4">
            <svg
              viewBox="0 -80 3507 2620"
              className="w-full h-auto max-h-[580px] object-contain select-none"
              preserveAspectRatio="xMidYMid meet"
              aria-label="Peta Wilayah Kepulauan Banda Neira"
            >
              {/* Ethereal Water / Shore Halo Effect */}
              <filter id="softGlow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#90b8de" floodOpacity="0.22" />
              </filter>

              {/* 1. Vector Village Paths in Cohesive Pastel Oceanic Palette */}
              <g
                fill="none"
                fillRule="evenodd"
                stroke="none"
                strokeWidth="1"
                strokeLinecap="square"
                strokeLinejoin="bevel"
                filter="url(#softGlow)"
              >
                {BANDA_VILLAGES_SVG.map((v) => {
                  const isSelected = v.id === selectedVillageId
                  const isHovered = v.id === hoveredVillageId

                  // Cohesive monochromatic styling: soft sky blue with dark navy borders
                  const fillColor = isSelected
                    ? '#7eafe0'
                    : isHovered
                    ? '#b0d3f6'
                    : '#cfe3f7'

                  const strokeColor = isSelected ? '#0c2340' : '#96b8de'
                  const strokeW = isSelected ? '4.5' : '1.8'

                  return (
                    <path
                      key={v.id}
                      d={v.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      className="transition-colors duration-200 cursor-pointer outline-none"
                      onClick={() => handleSelectVillage(v)}
                      onMouseEnter={() => setHoveredVillageId(v.id)}
                      onMouseLeave={() => setHoveredVillageId(null)}
                    />
                  )
                })}
              </g>

              {/* 2. Cartographic Floating Island Labels (Painted AFTER paths with crisp open-water clearance & halo) */}
              <g className="select-none pointer-events-none">
                {/* Gunung Api Label */}
                <text
                  x="1080"
                  y="340"
                  textAnchor="middle"
                  fill="#476d8c"
                  stroke="#eaf4fb"
                  strokeWidth="10"
                  paintOrder="stroke fill"
                  fontSize="70"
                  fontFamily="ui-serif, Georgia, Cambria, serif"
                  fontWeight="500"
                  letterSpacing="4"
                >
                  Gunung Api
                </text>

                {/* Pulau Neira Label */}
                <text
                  x="1720"
                  y="340"
                  textAnchor="middle"
                  fill="#476d8c"
                  stroke="#eaf4fb"
                  strokeWidth="10"
                  paintOrder="stroke fill"
                  fontSize="72"
                  fontFamily="ui-serif, Georgia, Cambria, serif"
                  fontWeight="500"
                  letterSpacing="5"
                >
                  Pulau Neira
                </text>

                {/* Pulau Banda Besar Label */}
                <text
                  x="2720"
                  y="340"
                  textAnchor="middle"
                  fill="#476d8c"
                  stroke="#eaf4fb"
                  strokeWidth="10"
                  paintOrder="stroke fill"
                  fontSize="76"
                  fontFamily="ui-serif, Georgia, Cambria, serif"
                  fontWeight="500"
                  letterSpacing="5"
                >
                  Pulau Banda Besar
                </text>

                {/* Lonthoir Coastal Label */}
                <text
                  x="1650"
                  y="2460"
                  textAnchor="middle"
                  fill="#587c9b"
                  stroke="#eaf4fb"
                  strokeWidth="10"
                  paintOrder="stroke fill"
                  fontSize="64"
                  fontFamily="ui-serif, Georgia, Cambria, serif"
                  fontStyle="italic"
                  letterSpacing="4"
                >
                  Lonthoir &amp; Sekitarnya
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Elegant Floating Details Bar & Navigation (Matching indonesia.travel) */}
        <div className="w-full max-w-4xl mt-6 sm:mt-10 bg-white/80 backdrop-blur-md rounded-2xl border border-[#cfe2f4] p-4 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 pr-0 sm:pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif text-lg sm:text-2xl text-[#0c2340] font-medium">
                {selectedVillage.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#e3effa] text-[#2c4e6e]">
                {selectedVillage.island}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-[55ch]">
              {selectedVillage.description}
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => onNavigate('gis')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#0c2340] hover:bg-[#183e75] text-white text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
            >
              <span>{t.mapSection.openFullMap}</span>
              <ArrowUpRightIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Clean Village Selector Pills (Single Row Horizontal Snap Rail on Mobile, Centered Wrap on Desktop) */}
        <div className="w-full max-w-4xl mt-4 sm:mt-6 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-2 -mx-2 sm:mx-0 snap-x">
          {BANDA_VILLAGES_SVG.map((v) => {
            const isSelected = v.id === selectedVillageId
            return (
              <button
                type="button"
                key={v.id}
                onClick={() => handleSelectVillage(v)}
                className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0c2340] text-white shadow-xs font-medium'
                    : 'bg-white/70 hover:bg-white text-[#2c4e6e] border border-[#cfe2f4]/80'
                }`}
              >
                {v.name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PetaInteractiveSection
