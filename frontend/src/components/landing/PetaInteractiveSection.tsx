import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

const InteractiveMapWorkspace = lazy(() =>
  import('../../views/InteractiveMapWorkspace').then((m) => ({
    default: m.InteractiveMapWorkspace,
  }))
)

export interface PetaInteractiveSectionProps {
  onNavigate: (tab: any) => void
  currentUser: any
}

export const PetaInteractiveSection: React.FC<PetaInteractiveSectionProps> = ({
  onNavigate,
  currentUser,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState<boolean>(false)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setShouldLoadMap(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoadMap(true)
          observer.disconnect()
        }
      },
      { rootMargin: '350px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="peta"
      aria-labelledby="peta-heading"
      className="relative w-full py-16 px-4 sm:px-8 lg:px-16 bg-[#f7f5f0] text-slate-900 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Top Tracking Subtitle (Ala indonesia.travel) */}
        <p className="font-sans text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#0f2c59]/75 uppercase text-center mb-3">
          DISCOVER TOP DESTINATIONS AND ATTRACTIONS
        </p>

        {/* The Signature Split Divider Header: ──── Visit Banda Neira ──── */}
        <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-4 sm:gap-8 mb-8">
          <div className="flex-1 h-[1.5px] bg-[#0f2c59]/60" />
          <h2
            id="peta-heading"
            className="font-sans font-bold text-3xl sm:text-4xl lg:text-[46px] text-[#0f2c59] tracking-tight whitespace-nowrap"
          >
            Visit Banda Neira
          </h2>
          <div className="flex-1 h-[1.5px] bg-[#0f2c59]/60" />
        </div>

        {/* Peta Interaktif Spasial Langsung */}
        <div
          ref={containerRef}
          data-lenis-prevent
          className="w-full relative"
        >
          {shouldLoadMap ? (
            <Suspense
              fallback={
                <div className="w-full h-[640px] flex flex-col items-center justify-center gap-3 bg-sky-50">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0f2c59] border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-slate-600">
                    Menyiapkan Peta Spasial Banda Neira...
                  </span>
                </div>
              }
            >
              <InteractiveMapWorkspace currentUser={currentUser} />
            </Suspense>
          ) : (
            <div className="w-full h-[640px] flex flex-col items-center justify-center gap-3 bg-sky-50/50">
              <div className="w-8 h-8 rounded-full border-2 border-[#0f2c59] border-t-transparent animate-spin" />
              <span className="text-xs font-semibold text-slate-600">
                Menyiapkan Peta Spasial Banda Neira...
              </span>
            </div>
          )}
        </div>

        {/* Aksi Buka Peta Layar Penuh di Bawah */}
        <div className="w-full flex items-center justify-between pt-4 px-2">
          <p className="text-xs text-slate-500 font-sans">
            Eksplorasi spasial cagar budaya, potensi bahari, penginapan warga, dan fasilitas pulau.
          </p>

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f2c59] hover:bg-[#183e75] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <span>Buka Peta Layar Penuh</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PetaInteractiveSection
