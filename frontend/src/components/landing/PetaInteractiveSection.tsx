import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { useLanguage } from '../../context/LanguageContext'

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
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState<boolean>(false)
  const [mapUnlockedOnMobile, setMapUnlockedOnMobile] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches
      : false
  )

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches)
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      { rootMargin: '100px' }
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
          {t.mapSection.tagline}
        </p>

        {/* The Signature Split Divider Header: ──── Visit Banda Neira ──── */}
        <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-2.5 sm:gap-6 mb-6 sm:mb-8 px-2">
          <div className="flex-1 h-[1.5px] bg-[#0f2c59]/60 min-w-[16px]" />
          <h2
            id="peta-heading"
            className="font-sans font-bold text-2xl sm:text-4xl lg:text-[46px] text-[#0f2c59] tracking-tight whitespace-nowrap"
          >
            {t.mapSection.heading}
          </h2>
          <div className="flex-1 h-[1.5px] bg-[#0f2c59]/60 min-w-[16px]" />
        </div>

        {/* Peta Interaktif Spasial Langsung */}
        <div
          ref={containerRef}
          data-lenis-prevent
          className="w-full relative rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Mobile Gesture Isolation Overlay (mencegah scroll layar ponsel macet terjebak di dalam kanvas peta) */}
          {isMobile && !mapUnlockedOnMobile && shouldLoadMap && (
            <div
              onClick={() => setMapUnlockedOnMobile(true)}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px] text-white p-4 cursor-pointer select-none"
            >
              <div className="px-5 py-2.5 rounded-full bg-[#0f2c59] text-white text-xs font-semibold shadow-lg border border-white/20 flex items-center gap-2">
                <span>Sentuh untuk Menggerakkan Peta</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-2 font-sans">
                Gulir layar untuk melanjutkan membaca
              </p>
            </div>
          )}

          {shouldLoadMap ? (
            <Suspense
              fallback={
                <div className="w-full h-[480px] sm:h-[600px] lg:h-[640px] flex flex-col items-center justify-center gap-3 bg-sky-50">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0f2c59] border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-slate-600">
                    {t.mapSection.loading}
                  </span>
                </div>
              }
            >
              <InteractiveMapWorkspace currentUser={currentUser} />
            </Suspense>
          ) : (
            <div className="w-full h-[480px] sm:h-[600px] lg:h-[640px] flex flex-col items-center justify-center gap-3 bg-sky-50/50">
              <div className="w-8 h-8 rounded-full border-2 border-[#0f2c59] border-t-transparent animate-spin" />
              <span className="text-xs font-semibold text-slate-600">
                {t.mapSection.loading}
              </span>
            </div>
          )}
        </div>

        {/* Aksi Buka Peta Layar Penuh di Bawah */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 px-2">
          <p className="text-xs text-slate-500 font-sans">
            {t.mapSection.description}
          </p>

          <button
            type="button"
            onClick={() => onNavigate('gis')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0f2c59] hover:bg-[#183e75] text-white text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>{t.mapSection.openFullMap}</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PetaInteractiveSection
