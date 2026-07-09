import { useEffect, useRef, useState } from 'react'

export function useStickyProgress({ smoothing = 0.15 } = {}) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let target = 0
    let current = 0
    let rafId = null

    const tick = () => {
      current += (target - current) * smoothing
      if (Math.abs(target - current) < 0.001) {
        current = target
        setProgress(current)
        rafId = null
        return
      }
      setProgress(current)
      rafId = requestAnimationFrame(tick)
    }

    const ensureLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick)
      }
    }

    const computeTarget = () => {
      const rect = node.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const maxUnits = Math.max(0, rect.height / viewportHeight - 1)
      target = Math.min(maxUnits, Math.max(0, -rect.top / viewportHeight))
      ensureLoop()
    }

    computeTarget()
    window.addEventListener('scroll', computeTarget, { passive: true })
    window.addEventListener('resize', computeTarget)

    return () => {
      window.removeEventListener('scroll', computeTarget)
      window.removeEventListener('resize', computeTarget)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [smoothing])

  return [ref, progress]
}
