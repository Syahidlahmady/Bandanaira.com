import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import './Banda3DPhotoGallery.css'

export interface PhotoItem {
  id: string
  src: string
  alt: string
  title: string
  badge: string
  positions: {
    xxs: { left: string; top: string; z: number }
    xs: { left: string; top: string; z: number }
    sm: { left: string; top: string; z: number }
    md: { left: string; top: string; z: number }
    lg: { left: string; top: string; z: number }
  }
}

export const BANDA_3D_PHOTOS: PhotoItem[] = [
  {
    id: 'belgica',
    src: '/images/landmarks/belgica.jpg',
    alt: 'Benteng Belgica',
    title: 'Benteng Belgica (1611)',
    badge: 'Cagar Budaya Utama',
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
    title: 'Puncak Gunung Api (640 mdpl)',
    badge: 'Ikon Alam Bahari',
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
    title: 'Istana Mini VOC Neira',
    badge: 'Arsitektur Kolonial',
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
    title: 'Terumbu Karang Lava Flow',
    badge: 'Spot Snorkeling & Selam',
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
    title: 'Pulau Rhun (Traktat Breda 1667)',
    badge: 'Jejak Rempah Bersejarah',
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
    title: 'Tembok Karang Pulau Hatta',
    badge: 'Palung Laut Dalam',
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
    title: 'Perkebunan Pala & Pohon Kenari',
    badge: 'Warisan Agraria Banda',
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
    title: 'Benteng Nassau (1609)',
    badge: 'Benteng Tertua di Banda',
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
    title: 'Rumah Pengasingan Mohammad Hatta',
    badge: 'Memori Kebangsaan',
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
    title: 'Pulau Ay & Benteng Revenge',
    badge: 'Kebun Rempah Asri',
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
    title: 'Dermaga & Teluk Banda Neira',
    badge: 'Jalur Masuk Kepulauan',
    positions: {
      xxs: { left: '55%', top: '58%', z: -1800 },
      xs: { left: '56%', top: '58%', z: -1800 },
      sm: { left: '58%', top: '58%', z: -1850 },
      md: { left: '60%', top: '56%', z: -1950 },
      lg: { left: '62%', top: '54%', z: -2050 },
    },
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
      className="banda-3d-card absolute grid h-[140px] w-[210px] sm:h-[160px] sm:w-[250px] md:h-[200px] md:w-[310px] lg:h-[220px] lg:w-[350px] place-items-center transition-all duration-300 ease-out"
      style={{
        left: pos.left,
        top: pos.top,
        transform: `translate3d(0, 0, ${pos.z}px)`,
        willChange: 'transform, filter',
        zIndex: Math.round((pos.z + 3000) / 10),
      }}
      data-zinit={pos.z}
    >
      <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-2xl border border-white/20 bg-slate-900/60 backdrop-blur-sm group">
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Caption Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3.5 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
            {item.badge}
          </span>
          <p className="font-sans text-xs sm:text-sm font-medium text-white drop-shadow truncate">
            {item.title}
          </p>
        </div>
      </div>
    </div>
  )
})

PhotoCard.displayName = 'PhotoCard'

export const Banda3DPhotoGallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const elementsRef = useRef<HTMLDivElement[]>([])
  const titleRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastScrollYRef = useRef<number>(0)
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>('lg')

  // Register card elements for 3D coordinate manipulation
  const registerCard = useCallback((el: HTMLDivElement | null) => {
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

  // Scroll effect driving 3D Z-flythrough and Depth-of-Field Blur
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        if (!sectionRef.current) return
        const scrollY = window.scrollY
        if (Math.abs(scrollY - lastScrollYRef.current) < 0.5) return
        lastScrollYRef.current = scrollY

        const rect = sectionRef.current.getBoundingClientRect()
        const sectionTop = rect.top + scrollY
        const isMobile = window.innerWidth < 1024

        // Active scroll range within the sticky zone
        const travelPadding = isMobile ? 250 : 200
        const activeStart = sectionTop - travelPadding
        const totalHeight = sectionRef.current.offsetHeight
        const activeEnd = sectionTop + totalHeight - (isMobile ? 1000 : 900)

        const isActive = scrollY >= activeStart && scrollY <= activeEnd
        const progressDist = Math.max(0, scrollY - activeStart)
        const speedMultiplier = isMobile ? 1.6 : 1.2

        // Animate photo cards
        for (const el of elementsRef.current) {
          if (!el) continue
          const initialZ = Number(el.dataset.zinit || 0)
          let currentZ = initialZ

          if (isActive) {
            currentZ = initialZ + speedMultiplier * progressDist
          } else if (scrollY > activeEnd) {
            currentZ = initialZ + speedMultiplier * (activeEnd - activeStart)
          }

          currentZ = Math.round(currentZ * 100) / 100

          // Apply 3D translate
          el.style.transform = `translate3d(0, 0, ${currentZ}px)`

          // Dynamic depth-of-field blur & opacity
          if (currentZ < -400) {
            el.style.filter = 'blur(8px)'
            el.style.opacity = '0.5'
          } else if (currentZ < -200) {
            const b = Math.min((Math.abs(currentZ) / 400) * 4, 4)
            el.style.filter = `blur(${b.toFixed(1)}px)`
            el.style.opacity = '0.75'
          } else if (currentZ < 0) {
            const b = Math.min((Math.abs(currentZ) / 200) * 2, 2)
            el.style.filter = `blur(${b.toFixed(1)}px)`
            el.style.opacity = '0.95'
          } else {
            el.style.filter = 'blur(0px)'
            // Fade out gracefully as it flies past camera
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

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="galeri-neira"
      aria-label="Kompilasi Galeri Foto Banda Neira"
      className="relative z-10 w-full bg-[#0b1118]"
    >
      {/* Scroll track with generous height for smooth 3D perspective flythrough */}
      <div className="relative z-10 h-[2600px] w-full lg:h-[3500px]">
        {/* Sticky viewport stage with true 3D perspective */}
        <div
          className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
          style={{ perspective: 600 }}
        >
          {/* Subtle atmosphere background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1118] via-[#0d1622] to-[#121c29] pointer-events-none" />

          {/* Render all 3D floating photo cards */}
          {BANDA_3D_PHOTOS.map((item) => (
            <PhotoCard
              key={item.id}
              item={item}
              breakpoint={breakpoint}
              registerElement={registerCard}
            />
          ))}

          {/* Central Hero Plate (Disolves gracefully as user scrolls) */}
          <div
            ref={titleRef}
            data-zinit="50"
            data-no-blur="true"
            className="absolute left-1/2 top-1/2 z-30 flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2 w-full max-w-[92vw] sm:max-w-lg px-4 pointer-events-auto transition-opacity duration-300"
            style={{
              transform: 'translate(-50%, -50%) translate3d(0, 0, 50px)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Elegant Glassmorphic Card Frame */}
            <div className="relative flex flex-col items-center gap-3 px-6 sm:px-10 py-7 sm:py-9 rounded-3xl bg-slate-950/80 border-2 border-amber-400/30 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Top Subtitle */}
              <span className="font-mono text-xs sm:text-sm tracking-[0.24em] text-amber-300 uppercase">
                Jelajahi Pesona
              </span>

              {/* Main Script Headline */}
              <h2 className="text-3xl sm:text-5xl font-serif italic text-white tracking-tight leading-tight">
                Banda Neira
              </h2>

              {/* Narrative Caption */}
              <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-sm mt-1 leading-relaxed">
                Kompilasi benteng rempah abad ke-17, terumbu karang palung laut, dan memori kemanusiaan Kepulauan Banda.
              </p>

              {/* Scroll down prompt */}
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-300 text-[11px] font-mono tracking-widest uppercase">
                <span>Scroll to explore</span>
                <svg
                  className="w-3.5 h-3.5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banda3DPhotoGallery
