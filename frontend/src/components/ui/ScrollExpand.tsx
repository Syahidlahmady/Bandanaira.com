import React, { useState, useCallback, useEffect, useRef } from 'react'
import './ScrollExpand.css'

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1)
  return t * t * (3 - 2 * t)
}

export interface ScrollExpandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  src?: string
  mediaType?: 'image' | 'video' | 'iframe' | 'youtube'
  youtubeId?: string
  poster?: string
  alt?: string
  title?: React.ReactNode
  scrollHint?: React.ReactNode
  startWidth?: number
  startHeight?: number
  startRadius?: number
  endRadius?: number
  mediaZoom?: number
  scrollDistance?: number
  holdDistance?: number
  smoothing?: number
  overlayScrim?: number
  useWindowScroll?: boolean
  enabled?: boolean
  onProgressChange?: (progress: number) => void
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const ScrollExpandComponent: React.FC<ScrollExpandProps> = ({
  src = '',
  mediaType = 'image',
  youtubeId = '',
  poster = '',
  alt = '',
  title = '',
  scrollHint = '',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  onProgressChange,
  children,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const scrimRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)

  const propsRef = useRef({
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    onProgressChange,
  })

  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    onProgressChange,
  }

  const applyProgress = useCallback((p: number) => {
    const frame = frameRef.current
    const media = mediaRef.current
    if (!frame || !media) return
    const c = propsRef.current

    c.onProgressChange?.(p)

    const e = smoothstep(0, 1, p)

    const w = c.startWidth + (100 - c.startWidth) * e
    const h = c.startHeight + (100 - c.startHeight) * e
    const ix = Math.max(0, (100 - w) / 2)
    const iy = Math.max(0, (100 - h) / 2)
    const r = c.startRadius + (c.endRadius - c.startRadius) * e

    if (p >= 0.999) {
      frame.style.clipPath = 'none'
    } else {
      frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`
    }

    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`

    if (titleRef.current) {
      if (p >= 0.75) {
        if (titleRef.current.style.visibility !== 'hidden') titleRef.current.style.visibility = 'hidden'
      } else {
        if (titleRef.current.style.visibility !== 'visible') titleRef.current.style.visibility = 'visible'
        const out = smoothstep(0.2, 0.7, p)
        titleRef.current.style.opacity = `${1 - out}`
        titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.05 * out})`
      }
    }

    if (hintRef.current) {
      if (p >= 0.15) {
        if (hintRef.current.style.visibility !== 'hidden') hintRef.current.style.visibility = 'hidden'
      } else {
        if (hintRef.current.style.visibility !== 'visible') hintRef.current.style.visibility = 'visible'
        const gone = smoothstep(0, 0.12, p)
        hintRef.current.style.opacity = `${1 - gone}`
        hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`
      }
    }

    if (overlayRef.current) {
      if (p <= 0.65) {
        if (overlayRef.current.style.visibility !== 'hidden') {
          overlayRef.current.style.visibility = 'hidden'
          overlayRef.current.style.pointerEvents = 'none'
        }
      } else {
        if (overlayRef.current.style.visibility !== 'visible') overlayRef.current.style.visibility = 'visible'
        const inn = smoothstep(0.7, 1, p)
        overlayRef.current.style.opacity = `${inn}`
        overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`
        overlayRef.current.style.pointerEvents = p >= 0.75 ? 'auto' : 'none'
      }
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const stage = stageRef.current
    if (!root || !track || !stage) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let scrollRaf = 0
    let lastProgress = -1
    let current = 0
    let target = 0
    let stageH = 0
    let totalTrackH = 0
    let running = false

    let trackTop = 0

    const measure = () => {
      const c = propsRef.current
      const windowH = window.innerHeight
      const clientH = root.clientHeight
      const currentStageH = c.useWindowScroll ? windowH : clientH
      if (currentStageH <= 0) return

      // BATCH ALL DOM READS FIRST (Avoid Forced Synchronous Layout / Forced Reflow)
      const rect = track.getBoundingClientRect()
      const clientW = root.clientWidth || currentStageH

      stageH = currentStageH
      trackTop = rect.top + window.scrollY
      totalTrackH = currentStageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))

      // BATCH ALL DOM WRITES AFTER
      stage.style.height = `${currentStageH}px`
      track.style.height = `${totalTrackH}px`
      stage.style.setProperty('--se-title-size', `${clamp(clientW * 0.055, 24, 76)}px`)
    }

    const readProgress = () => {
      const c = propsRef.current
      if (!c.enabled) return 1
      const span = stageH * Math.max(0.01, c.scrollDistance)
      if (c.useWindowScroll) {
        const top = trackTop - window.scrollY
        return clamp(-top / span, 0, 1)
      }
      return clamp(root.scrollTop / span, 0, 1)
    }

    const tick = () => {
      const c = propsRef.current
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing))
      current += (target - current) * k
      if (Math.abs(target - current) < 0.0004) {
        current = target
        running = false
      }
      applyProgress(current)
      raf = running ? requestAnimationFrame(tick) : 0
    }

    const kick = () => {
      if (running) return
      running = true
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      if (cRefScrollOffscreen()) return
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        const p = readProgress()
        target = p

        if (Math.abs(p - lastProgress) < 0.001) return
        lastProgress = p

        if (propsRef.current.smoothing <= 0 || reduceMotion) {
          current = target
          applyProgress(current)
          return
        }
        kick()
      })
    }

    const cRefScrollOffscreen = () => {
      if (!useWindowScroll) return false
      const sy = window.scrollY
      return sy > trackTop + totalTrackH + 400
    }

    const onResize = () => {
      measure()
      target = readProgress()
      current = target
      applyProgress(current)
    }

    const initRaf = requestAnimationFrame(() => {
      measure()
      target = readProgress()
      current = target
      applyProgress(current)
    })

    const scroller = useWindowScroll ? window : root
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(initRaf)
      if (raf) cancelAnimationFrame(raf)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [applyProgress, useWindowScroll])

  // Dynamic desktop viewport state: rigorously ensures YouTube iframe is NEVER rendered on mobile
  const [isDesktopClient, setIsDesktopClient] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
  const [iframeReady, setIframeReady] = useState<boolean>(false)
  const [isIntersecting, setIsIntersecting] = useState<boolean>(true)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsIntersecting(entries[0]?.isIntersecting ?? true)
      },
      { rootMargin: '400px 0px' }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopClient(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isDesktopClient && (mediaType === 'youtube' || mediaType === 'iframe') && Boolean(youtubeId)) {
      // Defer desktop iframe load to ensure LCP image renders with 0ms Total Blocking Time
      if ('requestIdleCallback' in window) {
        const id = (window as any).requestIdleCallback(() => setIframeReady(true), { timeout: 2000 })
        return () => (window as any).cancelIdleCallback(id)
      }
      const timer = setTimeout(() => setIframeReady(true), 1200)
      return () => clearTimeout(timer)
    } else {
      setIframeReady(false)
    }
  }, [isDesktopClient, mediaType, youtubeId])

  const isYoutube = isDesktopClient && (mediaType === 'youtube' || mediaType === 'iframe') && Boolean(youtubeId)

  const media = isYoutube ? (
    <div
      ref={mediaRef as React.RefObject<HTMLDivElement>}
      className="scroll-expand__media scroll-expand__youtube-wrap"
    >
      <img
        src={poster || src || '/banda.webp'}
        srcSet="/banda-480.webp 480w, /banda-960.webp 960w, /banda-1440.webp 1440w, /banda.webp 1920w"
        sizes="(max-width: 1024px) 100vw, 1920px"
        alt={alt}
        width={1920}
        height={1106}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        draggable={false}
      />
      {iframeReady && isIntersecting && (
        <iframe
          className="scroll-expand__youtube-iframe"
          loading="lazy"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&disablekb=1&modestbranding=1&iv_load_policy=3&showinfo=0&fs=0`}
          title="Banda Neira Aerial Video Backdrop"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
        />
      )}
    </div>
  ) : mediaType === 'video' ? (
    <video
      ref={mediaRef as React.RefObject<HTMLVideoElement>}
      className="scroll-expand__media"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
    />
  ) : (
    <img
      ref={mediaRef as React.RefObject<HTMLImageElement>}
      className="scroll-expand__media"
      src={src || poster || '/banda.webp'}
      srcSet="/banda-480.webp 480w, /banda-960.webp 960w, /banda-1440.webp 1440w, /banda.webp 1920w"
      sizes="(max-width: 1024px) 100vw, 1920px"
      alt={alt}
      width={1920}
      height={1106}
      fetchPriority="high"
      decoding="async"
      draggable={false}
    />
  )

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? '' : 'scroll-expand--scroller'} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const ScrollExpand = React.memo(ScrollExpandComponent)
export default ScrollExpand
