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

// 목표 숫자까지 빠르게 움직이는 숫자(처음 보이거나 목표가 크게 바뀔 때).
// startFrom(target)으로 처음 시작값을 정한다. 기본은 0에서 올라가기.
// 움직임 줄이기 설정이거나 탭이 가려져 있으면 바로 목표값을 보여 준다.
// minJump보다 작게 바뀌면(실시간으로 1씩 줄어드는 값 등) 애니메이션 없이 바로 바꾼다.
// 움직이는 동안 목표가 조금씩 바뀌면(실시간 값) 애니메이션을 끊지 않고 새 목표를 향해 그대로 이어 간다.
export function useCountUp(target, duration = 900, startFrom = () => 0, minJump = 0) {
  const [value, setValue] = useState(() => (skipAnimation() ? target : startFrom(target)))
  const [prevTarget, setPrevTarget] = useState(target)
  const [running, setRunning] = useState(false)
  const startRef = useRef(startFrom)
  const fromRef = useRef(null)
  const targetRef = useRef(target)
  const frameRef = useRef(0)

  // 작은 변화는 효과를 기다리지 않고 같은 렌더에서 바로 반영한다. 효과에서 바꾸면 한 번은 옛 값으로
  // 그려져 「아직 움직이는 중」으로 보이고, 그 사이 굴림 숫자가 통째로 다시 마운트되어 모든 자리가 한꺼번에 굴러 버린다.
  if (!Object.is(prevTarget, target)) {
    setPrevTarget(target)
    if (!running && (skipAnimation() || !Number.isFinite(target) || Math.abs(prevTarget - target) <= minJump)) {
      setValue(target)
    }
  }

  useEffect(() => {
    targetRef.current = target
    const from = fromRef.current ?? startRef.current(target)
    fromRef.current = target
    if (frameRef.current) return // 이미 움직이는 중: 다음 프레임부터 새 목표를 따라간다.
    if (skipAnimation() || !Number.isFinite(target) || Math.abs(from - target) <= minJump) {
      setValue(target)
      return
    }

    const startedAt = performance.now()
    const step = (time) => {
      const t = Math.min(1, (time - startedAt) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const to = targetRef.current
      setValue(Math.round(from + (to - from) * eased))
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        frameRef.current = 0
        setRunning(false)
      }
    }
    setRunning(true)
    frameRef.current = requestAnimationFrame(step)
  }, [target, duration, minJump])

  useEffect(() => {
    const stop = () => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    // 탭이 가려져 프레임이 멈추면 바로 목표값으로 맞춘다.
    const onHide = () => {
      if (document.hidden && frameRef.current) {
        stop()
        setValue(targetRef.current)
        setRunning(false)
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      if (frameRef.current) {
        stop()
        fromRef.current = null // 다시 붙으면(개발 모드 StrictMode 등) 처음부터 다시 움직인다.
      }
    }
  }, [])

  return value
}
