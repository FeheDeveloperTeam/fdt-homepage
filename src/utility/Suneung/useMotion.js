import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
}

function skipAnimation() {
  return prefersReducedMotion() || (typeof document !== 'undefined' && document.hidden)
}

// [data-reveal] 요소가 화면에 들어오면 .is-revealed를 붙여 아래에서 떠오르게 한다.
// 숨김 스타일은 앱 루트에 .sn-reveal-on이 있을 때만 걸리므로, 관찰을 못 하는 환경에서도 내용은 보인다.
export function useReveal(ref) {
  useEffect(() => {
    const page = ref.current
    const app = page?.closest('.suneung-app')
    if (!page || !app || !('IntersectionObserver' in window)) return undefined

    app.classList.add('sn-reveal-on')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
    page.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      app.classList.remove('sn-reveal-on')
    }
  }, [ref])
}

// 목표 숫자까지 빠르게 움직이는 숫자(처음 보이거나 목표가 바뀔 때).
// startFrom(target)으로 처음 시작값을 정한다. 기본은 0에서 올라가기.
// 움직임 줄이기 설정이거나 탭이 가려져 있으면 바로 목표값을 보여 준다.
export function useCountUp(target, duration = 900, startFrom = () => 0) {
  const [value, setValue] = useState(() => (skipAnimation() ? target : startFrom(target)))
  const fromRef = useRef(null)
  const startRef = useRef(startFrom)

  useEffect(() => {
    const from = fromRef.current ?? startRef.current(target)
    fromRef.current = target
    if (skipAnimation() || !Number.isFinite(target) || from === target) {
      setValue(target)
      return undefined
    }

    let frame
    const startedAt = performance.now()
    const step = (time) => {
      const t = Math.min(1, (time - startedAt) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    // 탭이 가려져 프레임이 멈추면 바로 목표값으로 맞춘다.
    const onHide = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        setValue(target)
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [target, duration])

  return value
}
