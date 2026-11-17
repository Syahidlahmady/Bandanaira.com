import React, { useEffect, useRef, useState } from 'react'

export interface AnimatedNumberProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  formatNumber?: boolean
  className?: string
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1400,
  suffix = '',
  prefix = '',
  formatNumber = true,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    const initial = formatNumber ? value.toLocaleString('id-ID') : value.toString()
    return `${prefix}${initial}${suffix}`
  })
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      const formatted = formatNumber ? value.toLocaleString('id-ID') : value.toString()
      setDisplayValue(`${prefix}${formatted}${suffix}`)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          startAnimation()
        }
      },
      { threshold: 0.15 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [value, duration, suffix, prefix, formatNumber, hasAnimated])

  const startAnimation = () => {
    const startTime = performance.now()
    const digitCount = Math.max(1, value.toString().length)

    // Generate pseudo-random digits for initial scramble phase
    const getRandomDigits = () => {
      let result = ''
      for (let i = 0; i < digitCount; i++) {
        result += Math.floor(Math.random() * 10).toString()
      }
      return parseInt(result, 10)
    }

    const update = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)

      // Phase 1: High speed scramble for first 35% of duration
      if (progress < 0.35) {
        const randomNum = getRandomDigits()
        const formatted = formatNumber ? randomNum.toLocaleString('id-ID') : randomNum.toString()
        setDisplayValue(`${prefix}${formatted}${suffix}`)
        requestAnimationFrame(update)
        return
      }

      // Phase 2: Exponential smooth deceleration from 35% to 100%
      const easeProgress = (progress - 0.35) / 0.65
      // Exponential ease-out
      const eased = easeProgress === 1 ? 1 : 1 - Math.pow(2, -10 * easeProgress)
      const current = Math.round(value * eased)
      const formatted = formatNumber ? current.toLocaleString('id-ID') : current.toString()
      setDisplayValue(`${prefix}${formatted}${suffix}`)

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        const finalFormatted = formatNumber ? value.toLocaleString('id-ID') : value.toString()
        setDisplayValue(`${prefix}${finalFormatted}${suffix}`)
      }
    }

    requestAnimationFrame(update)
  }

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {displayValue}
    </span>
  )
}

export default AnimatedNumber
