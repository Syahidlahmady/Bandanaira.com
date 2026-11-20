import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import './Banda3DPhotoGallery.css'
import { useLanguage } from '../../context/LanguageContext'

export interface PhotoItem {
  id: string
  src: string
  alt: string
  positions: {
    xxs: { left: string; top: string; z: number }
    xs: { left: string; top: string; z: number }
    sm: { left: string; top: string; z: number }
    md: { left: string; top: string; z: number }
    lg: { left: string; top: string; z: number }
  }
}

export interface OrnamentItem {
  id: string
  src: string
  alt: string
  positions: {
    xxs: { left: string; top: string; z: number }
    xs: { left: string; top: string; z: number }
    sm: { left: string; top: string; z: number }
    md: { left: string; top: string; z: number }
    lg: { left: string; top: string; z: number }
  }
  rotation?: string
}

export const BANDA_3D_PHOTOS: PhotoItem[] = [
  {
    id: 'belgica',
    src: '/images/landmarks/belgica.jpg',
    alt: 'Benteng Belgica',
    positions: {
      xxs: { left: '-5%', top: '18%', z: -80 },
      xs: { left: '2%', top: '18%', z: -80 },
      sm: { left: '6%', top: '18%', z: -90 },
      md: { left: '8%', top: '15%', z: -110 },
      lg: { left: '10%', top: '14%', z: -120 },
    },
  },
  {
    id: 'gunung-api',
    src: '/images/landmarks/gunung-api.jpg',
    alt: 'Gunung Api Banda',
    positions: {
      xxs: { left: '66%', top: '22%', z: -160 },
      xs: { left: '68%', top: '22%', z: -160 },
      sm: { left: '68%', top: '22%', z: -160 },
      md: { left: '70%', top: '20%', z: -190 },
      lg: { left: '72%', top: '18%', z: -210 },
    },
  },
  {
    id: 'istana-mini',
    src: '/images/landmarks/istana-mini.jpg',
    alt: 'Istana Mini VOC',
    positions: {
      xxs: { left: '68%', top: '65%', z: -360 },
      xs: { left: '70%', top: '65%', z: -360 },
      sm: { left: '72%', top: '65%', z: -370 },
      md: { left: '74%', top: '63%', z: -420 },
      lg: { left: '76%', top: '62%', z: -450 },
    },
  },
  {
    id: 'lava-flow',
    src: '/images/landmarks/lava-flow.jpg',
    alt: 'Lava Flow Coral Reef',
    positions: {
      xxs: { left: '-8%', top: '62%', z: -480 },
      xs: { left: '4%', top: '62%', z: -480 },
      sm: { left: '10%', top: '62%', z: -490 },
      md: { left: '14%', top: '66%', z: -550 },
      lg: { left: '16%', top: '64%', z: -590 },
    },
  },
  {
    id: 'pulau-rhun',
    src: '/images/landmarks/pulau-rhun.jpg',
    alt: 'Pulau Rhun',
    positions: {
      xxs: { left: '-10%', top: '30%', z: -680 },
      xs: { left: '2%', top: '30%', z: -680 },
      sm: { left: '8%', top: '30%', z: -700 },
      md: { left: '8%', top: '28%', z: -760 },
      lg: { left: '6%', top: '26%', z: -820 },
    },
  },
  {
    id: 'pulau-hatta',
    src: '/images/landmarks/pulau-hatta.jpg',
    alt: 'Pulau Hatta',
    positions: {
      xxs: { left: '76%', top: '38%', z: -840 },
      xs: { left: '76%', top: '38%', z: -840 },
      sm: { left: '78%', top: '38%', z: -850 },
      md: { left: '80%', top: '36%', z: -920 },
      lg: { left: '82%', top: '34%', z: -980 },
    },
  },
  {
    id: 'kebun-pala',
    src: '/images/landmarks/kebun-pala.jpg',
    alt: 'Perkebunan Pala Kuno',
    positions: {
      xxs: { left: '60%', top: '74%', z: -980 },
      xs: { left: '62%', top: '74%', z: -980 },
      sm: { left: '64%', top: '74%', z: -1050 },
      md: { left: '65%', top: '72%', z: -1150 },
      lg: { left: '66%', top: '70%', z: -1250 },
    },
  },
  {
    id: 'nassau',
    src: '/images/landmarks/nassau.jpg',
    alt: 'Benteng Nassau',
    positions: {
      xxs: { left: '-2%', top: '20%', z: -1150 },
      xs: { left: '8%', top: '20%', z: -1150 },
      sm: { left: '16%', top: '20%', z: -1250 },
      md: { left: '18%', top: '18%', z: -1350 },
      lg: { left: '20%', top: '16%', z: -1450 },
    },
  },
  {
    id: 'bung-hatta',
    src: '/images/landmarks/bung-hatta.jpg',
    alt: 'Rumah Pengasingan Bung Hatta',
    positions: {
      xxs: { left: '72%', top: '24%', z: -1380 },
      xs: { left: '72%', top: '24%', z: -1380 },
      sm: { left: '74%', top: '24%', z: -1450 },
      md: { left: '75%', top: '22%', z: -1550 },
      lg: { left: '76%', top: '20%', z: -1680 },
    },
  },
  {
    id: 'pulau-ay',
    src: '/images/landmarks/pulau-ay.jpg',
    alt: 'Pulau Ay',
    positions: {
      xxs: { left: '-10%', top: '34%', z: -1550 },
      xs: { left: '4%', top: '34%', z: -1550 },
      sm: { left: '10%', top: '34%', z: -1650 },
      md: { left: '10%', top: '50%', z: -1750 },
      lg: { left: '8%', top: '48%', z: -1880 },
    },
  },
  {
    id: 'pelabuhan',
    src: '/images/landmarks/pelabuhan.jpg',
    alt: 'Pelabuhan Banda Neira',
    positions: {
      xxs: { left: '55%', top: '58%', z: -1800 },
      xs: { left: '56%', top: '58%', z: -1800 },
      sm: { left: '58%', top: '58%', z: -1850 },
      md: { left: '60%', top: '56%', z: -1950 },
      lg: { left: '62%', top: '54%', z: -2050 },
    },
  },
  {
    id: 'pohon-sejuta-umat',
    src: '/images/landmarks/pohon-sejuta-umat.webp',
    alt: 'Pohon Sejuta Umat & Gunung Api Banda',
    positions: {
      xxs: { left: '10%', top: '42%', z: -1950 },
      xs: { left: '12%', top: '42%', z: -1950 },
      sm: { left: '14%', top: '42%', z: -2020 },
      md: { left: '16%', top: '40%', z: -2140 },
      lg: { left: '18%', top: '38%', z: -2240 },
    },
  },
]

export const BANDA_3D_ORNAMENTS: OrnamentItem[] = [
  {
    id: 'orn-pala-1',
    src: '/images/ornaments/motif-pala.png',
    alt: 'Motif Buah Pala Banda',
    positions: {
      xxs: { left: '3%', top: '78%', z: -320 },
      xs: { left: '5%', top: '78%', z: -320 },
      sm: { left: '8%', top: '78%', z: -350 },
      md: { left: '8%', top: '76%', z: -380 },
      lg: { left: '10%', top: '75%', z: -400 },
    },
    rotation: '-rotate-12',
  },
  {
    id: 'orn-ikan-1',
    src: '/images/ornaments/motif-ikan.png',
    alt: 'Motif Ikan Laut Banda',
    positions: {
      xxs: { left: '76%', top: '20%', z: -520 },
      xs: { left: '78%', top: '20%', z: -520 },
      sm: { left: '80%', top: '20%', z: -560 },
      md: { left: '82%', top: '18%', z: -620 },
      lg: { left: '84%', top: '18%', z: -660 },
    },
    rotation: 'rotate-6',
  },
  {
    id: 'orn-pala-2',
    src: '/images/ornaments/motif-pala.png',
    alt: 'Motif Buah Pala Banda',
    positions: {
      xxs: { left: '80%', top: '64%', z: -1150 },
      xs: { left: '82%', top: '64%', z: -1150 },
      sm: { left: '84%', top: '64%', z: -1250 },
      md: { left: '86%', top: '62%', z: -1350 },
      lg: { left: '88%', top: '60%', z: -1450 },
    },
    rotation: 'rotate-12',
  },
  {
    id: 'orn-ikan-2',
    src: '/images/ornaments/motif-ikan.png',
    alt: 'Motif Ikan Laut Banda',
    positions: {
      xxs: { left: '2%', top: '24%', z: -1600 },
      xs: { left: '4%', top: '24%', z: -1600 },
      sm: { left: '8%', top: '24%', z: -1700 },
      md: { left: '10%', top: '22%', z: -1800 },
      lg: { left: '12%', top: '20%', z: -1900 },
    },
    rotation: '-rotate-6',
  },
]

type BreakpointKey = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

interface PhotoCardProps {
  item: PhotoItem
  breakpoint: BreakpointKey
  registerElement: (el: HTMLDivElement | null) => void
}

const PhotoCard = memo(({ item, breakpoint, registerElement }: PhotoCardProps) => {
  const pos = item.positions[breakpoint] || item.positions.lg

  return (
    <div
      ref={registerElement}
      className="banda-3d-card absolute grid h-[140px] w-[210px] sm:h-[160px] sm:w-[250px] md:h-[200px] md:w-[310px] lg:h-[220px] lg:w-[350px] place-items-center"
      style={{
        left: pos.left,
        top: pos.top,
        transform: `translate3d(0, 0, ${pos.z}px)`,
        willChange: 'transform',
        zIndex: Math.round((pos.z + 3000) / 10),
      }}
      data-zinit={pos.z}
    >
      <div className="relative w-full h-full overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.65)] rounded-2xl border border-white/25 bg-slate-900/40 group">
        <img
          src={item.src}
          alt={item.alt}
          width={350}
          height={220}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  )
})

PhotoCard.displayName = 'PhotoCard'

interface OrnamentCardProps {
  item: OrnamentItem
  breakpoint: BreakpointKey
  registerElement: (el: HTMLDivElement | null) => void
}

const OrnamentCard = memo(({ item, breakpoint, registerElement }: OrnamentCardProps) => {
  const pos = item.positions[breakpoint] || item.positions.lg

  return (
    <div
      ref={registerElement}
      className={`absolute grid w-[80px] h-[80px] sm:w-[105px] sm:h-[105px] md:w-[135px] md:h-[135px] place-items-center pointer-events-none opacity-80 ${item.rotation || ''}`}
      style={{
        left: pos.left,
        top: pos.top,
        transform: `translate3d(0, 0, ${pos.z}px)`,
        willChange: 'transform',
        zIndex: Math.round((pos.z + 3000) / 10),
      }}
      data-zinit={pos.z}
    >
      <img
        src={item.src}
        alt={item.alt}
        className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
})

OrnamentCard.displayName = 'OrnamentCard'

export const Banda3DPhotoGallery: React.FC = () => {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const elementsRef = useRef<HTMLDivElement[]>([])
  const titleRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastScrollYRef = useRef<number>(0)
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>('lg')

  // Register card and ornament elements for 3D coordinate manipulation
  const registerElement = useCallback((el: HTMLDivElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el)
    }
  }, [])

  // Responsive breakpoint tracking
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1024) setBreakpoint('lg')
      else if (w >= 768) setBreakpoint('md')
      else if (w >= 640) setBreakpoint('sm')
      else if (w >= 480) setBreakpoint('xs')
      else setBreakpoint('xxs')
    }

    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = breakpoint !== 'lg'

  // Scroll effect driving 3D Z-flythrough and Depth-of-Field Blur (Reflow-free)
  const cachedBoundsRef = useRef({ activeStart: 0, activeEnd: 0, speedMultiplier: 1.2, isMobileDevice: false })

  useEffect(() => {
    if (isMobile) return

    const measureBounds = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const sectionTop = rect.top + scrollY
      const travelPadding = 200
      const activeStart = sectionTop - travelPadding
      const totalHeight = sectionRef.current.offsetHeight
      const activeEnd = sectionTop + totalHeight - 900
      const speedMultiplier = 1.2
      cachedBoundsRef.current = { activeStart, activeEnd, speedMultiplier, isMobileDevice: false }
    }

    measureBounds()
    window.addEventListener('resize', measureBounds, { passive: true })
    return () => window.removeEventListener('resize', measureBounds)
  }, [isMobile])

  useEffect(() => {
    if (isMobile) return

    const section = sectionRef.current
    if (!section) return

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        if (!sectionRef.current) return
        const scrollY = window.scrollY
        if (Math.abs(scrollY - lastScrollYRef.current) < 0.5) return
        lastScrollYRef.current = scrollY

        const { activeStart, activeEnd, speedMultiplier } = cachedBoundsRef.current

        // Fast bail-out when offscreen
        if (scrollY < activeStart - 500 || scrollY > activeEnd + 500) {
          if (section.style.visibility !== 'hidden') section.style.visibility = 'hidden'
          return
        }
        if (section.style.visibility !== 'visible') section.style.visibility = 'visible'

        const isActive = scrollY >= activeStart && scrollY <= activeEnd
        const progressDist = Math.max(0, scrollY - activeStart)

        // Animate photo cards & floating ornaments
        for (const el of elementsRef.current) {
          if (!el) continue
          const initialZ = Number(el.dataset.zinit || 0)
          let currentZ = initialZ

          if (isActive) {
            currentZ = initialZ + speedMultiplier * progressDist
          } else if (scrollY > activeEnd) {
            currentZ = initialZ + speedMultiplier * (activeEnd - activeStart)
          }

          currentZ = Math.round(currentZ * 10) / 10

          // Viewport depth culling: hide elements past the viewer or far in distance to reduce GPU draw calls
          const isOutOfView = currentZ > 560 || currentZ < -2600
          if (isOutOfView) {
            if (el.style.display !== 'none') el.style.display = 'none'
            continue
          } else {
            if (el.style.display !== '') el.style.display = ''
          }

          // Apply 3D translate (GPU composite property)
          el.style.transform = `translate3d(0, 0, ${currentZ}px)`

          // Opacity calculations (GPU composite property)
          if (currentZ < -400) {
            el.style.opacity = '0.45'
          } else if (currentZ < -200) {
            el.style.opacity = '0.75'
          } else if (currentZ < 0) {
            el.style.opacity = '0.95'
          } else {
            if (currentZ > 420) {
              const fade = Math.max(0, 1 - (currentZ - 420) / 160)
              el.style.opacity = `${fade.toFixed(2)}`
            } else {
              el.style.opacity = '1'
            }
          }
        }

        // Animate central hero title plate
        if (titleRef.current) {
          const initialTitleZ = 50
          let titleZ = initialTitleZ
          let titleOpacity = 1

          if (isActive) {
            titleZ = initialTitleZ + speedMultiplier * 0.7 * progressDist
            // Title dissolves smoothly as gallery items fly past
            titleOpacity = Math.max(0, 1 - progressDist / 600)
          } else if (scrollY > activeEnd) {
            titleOpacity = 0
          }

          titleRef.current.style.transform = `translate(-50%, -50%) translate3d(0, 0, ${titleZ}px)`
          titleRef.current.style.opacity = `${titleOpacity.toFixed(2)}`
          titleRef.current.style.pointerEvents = titleOpacity > 0.3 ? 'auto' : 'none'
        }
      })
    }

    // Viewport-gated scroll listening: only attach scroll listener when section is near viewport
    let isAttached = false
    const attach = () => {
      if (!isAttached) {
        window.addEventListener('scroll', onScroll, { passive: true })
        isAttached = true
        onScroll()
      }
    }
    const detach = () => {
      if (isAttached) {
        window.removeEventListener('scroll', onScroll)
        isAttached = false
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          attach()
        } else {
          detach()
        }
      },
      { rootMargin: '400px 0px' }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
      detach()
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <section
        id="galeri-neira"
        aria-label="Kompilasi Galeri Foto Banda Neira"
        className="relative z-10 w-full bg-[#081d35] py-12 px-4 sm:px-6 overflow-hidden"
      >
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[#081d35] bg-[radial-gradient(circle_at_50%_25%,#113a68_0%,#0c2b4e_50%,#081d35_90%)] pointer-events-none" />

        {/* Cultural Header Plate */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto mb-8 px-2">
          <div className="relative flex flex-col items-center gap-2 px-6 py-6 rounded-3xl bg-[#081d35]/90 border border-amber-400/30 backdrop-blur-md shadow-2xl w-full">
            {/* Nutmeg Ornament Top-Left */}
            <img
              src="/images/ornaments/motif-pala.png"
              alt="Motif Buah Pala"
              width={64}
              height={64}
              className="absolute -top-7 -left-5 w-14 h-14 object-contain -rotate-12 drop-shadow-md pointer-events-none"
              loading="lazy"
            />

            {/* Fish Ornament Bottom-Right */}
            <img
              src="/images/ornaments/motif-ikan.png"
              alt="Motif Ikan Banda"
              width={72}
              height={48}
              className="absolute -bottom-6 -right-6 w-16 h-12 object-contain rotate-6 drop-shadow-md pointer-events-none"
              loading="lazy"
            />

            <span className="font-sans text-[11px] font-bold tracking-[0.22em] text-amber-300 uppercase">
              {t.gallery.tagline}
            </span>

            <h2 className="text-3xl sm:text-4xl font-script font-normal text-white tracking-wide leading-tight drop-shadow-md">
              {t.gallery.title}
            </h2>

            <p className="text-xs text-white/80 font-sans max-w-sm mt-1">
              Pusaka sejarah kolonial dan panorama bahari otentik Kepulauan Banda.
            </p>
          </div>
        </div>

        {/* Horizontal Touch Snap Rail */}
        <div className="relative z-20 w-full max-w-6xl mx-auto">
          <div
            className="flex gap-3.5 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {BANDA_3D_PHOTOS.map((item, index) => (
              <div
                key={item.id}
                className="group relative shrink-0 snap-center w-[260px] sm:w-[290px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 bg-slate-900/60 shadow-xl transition-transform active:scale-[0.98]"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  width={300}
                  height={225}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Bottom Vignette with Landmark Name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5 pointer-events-none">
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-amber-300 uppercase">
                    Pusaka #{index + 1}
                  </span>
                  <span className="text-sm font-sans font-bold text-white tracking-tight drop-shadow">
                    {item.alt}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Swipe Guidance Hint */}
          <div className="flex items-center justify-between px-2 pt-2 text-[11px] font-sans text-amber-200/70">
            <span>Geser untuk menjelajahi 12 pusaka & panorama</span>
            <span className="text-white/60">12 Destinasi</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="galeri-neira"
      aria-label="Kompilasi Galeri Foto Banda Neira"
      className="relative z-10 w-full bg-[#081d35]"
    >
      {/* Scroll track with generous height on desktop and mobile-optimized height */}
      <div className="relative z-10 h-[1350px] w-full lg:h-[3500px]">
        {/* Sticky viewport stage with true 3D perspective */}
        <div
          className="sticky top-0 h-[100dvh] min-h-[100dvh] w-full overflow-hidden flex items-center justify-center"
          style={{ perspective: 600 }}
        >
          {/* Luminous oceanic navy radial glow (Biru Dongker Laut Banda) */}
          <div className="absolute inset-0 bg-[#081d35] bg-[radial-gradient(circle_at_50%_40%,#113a68_0%,#0c2b4e_50%,#081d35_90%)] pointer-events-none" />

          {/* Render all 3D floating photo cards (Clean, pure images) */}
          {BANDA_3D_PHOTOS.map((item) => (
            <PhotoCard
              key={item.id}
              item={item}
              breakpoint={breakpoint}
              registerElement={registerElement}
            />
          ))}

          {/* Render floating cultural motifs in 3D perspective space */}
          {BANDA_3D_ORNAMENTS.map((item) => (
            <OrnamentCard
              key={item.id}
              item={item}
              breakpoint={breakpoint}
              registerElement={registerElement}
            />
          ))}

          {/* Central Hero Plate with Corner Ornaments */}
          <div
            ref={titleRef}
            data-zinit="50"
            data-no-blur="true"
            className="absolute left-1/2 top-1/2 z-30 flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2 w-full max-w-[92vw] sm:max-w-md px-4 pointer-events-auto transition-opacity duration-300"
            style={{
              transform: 'translate(-50%, -50%) translate3d(0, 0, 50px)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Elegant Cultural Card with Corner Ornaments */}
            <div className="relative flex flex-col items-center gap-3 px-8 sm:px-12 py-8 sm:py-10 rounded-3xl bg-[#081d35]/92 border-2 border-amber-400/35 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.7)]">
              {/* Corner Nutmeg Ornament Top-Left */}
              <img
                src="/images/ornaments/motif-pala.png"
                alt="Motif Buah Pala"
                className="absolute -top-10 -left-8 sm:-top-12 sm:-left-10 w-20 h-20 sm:w-24 sm:h-24 object-contain -rotate-12 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] pointer-events-none"
              />

              {/* Corner Fish Ornament Bottom-Right */}
              <img
                src="/images/ornaments/motif-ikan.png"
                alt="Motif Ikan Banda"
                className="absolute -bottom-8 -right-10 sm:-bottom-10 sm:-right-12 w-24 h-16 sm:w-28 sm:h-20 object-contain rotate-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] pointer-events-none"
              />

              {/* Top Subtitle in Nexa Sans */}
              <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.24em] text-amber-300 uppercase">
                {t.gallery.tagline}
              </span>

              {/* Main Headline in Intro Script */}
              <h2 className="text-4xl sm:text-6xl font-script font-normal text-white tracking-wide leading-tight drop-shadow-lg">
                {t.gallery.title}
              </h2>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banda3DPhotoGallery
