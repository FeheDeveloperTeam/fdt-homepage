import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import './IntroSplash.css'

const TITLE = '페헤의 공간에 오신 것을 환영합니다'

/*
  글자를 하나씩 등장시키되 줄바꿈은 어절 사이에서만 일어나게 한다.
  span을 글자 단위로만 쪼개면 좁은 화면에서 '환영합니 / 다'처럼 잘린다.
  --i는 어절을 건너뛰며 계속 이어져 등장 순서가 유지된다.
*/
const TITLE_WORDS = (() => {
  let i = 0
  return TITLE.split(' ').map(word => ({
    word,
    chars: Array.from(word).map(ch => ({ ch, i: i++ })),
  }))
})()

// storm → reveal → clear 순서로 넘어가는 시각(ms). clear가 끝나면 언마운트한다.
const REVEAL_AT = 1200
const CLEAR_AT = 3800
const UNMOUNT_AT = 4700

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/*
  인트로 전용 눈보라. 배경(BgDeco)보다 훨씬 세게 몰아치다가
  reveal 이후 급격히 잦아들어 문구가 드러나도록 강도를 낮춘다.
*/
function useIntroBlizzard(canvasRef, phaseRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let flakes = []
    let raf = 0
    let last = performance.now()

    function seed(flake, fresh) {
      const depth = Math.random()
      flake.depth = depth
      flake.x = fresh ? -Math.random() * width * 0.4 : Math.random() * width
      flake.y = Math.random() * height
      flake.r = 0.7 + depth * 3
      flake.fall = 30 + depth * 150
      flake.sway = Math.random() * Math.PI * 2
      flake.swaySpeed = 0.8 + Math.random() * 2
      flake.swayAmp = 10 + depth * 34
      flake.alpha = 0.25 + depth * 0.7
      return flake
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = Math.min(540, Math.round((width * height) / 2700))
      if (flakes.length > target) flakes.length = target
      else while (flakes.length < target) flakes.push(seed({}, false))
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // 문구가 드러난 뒤에는 바람을 빠르게 죽여 눈보라가 걷히는 느낌을 준다.
      const settle = phaseRef.current === 'storm' ? 1 : 0.34
      const t = now / 1000
      const gust = Math.sin(t * 0.9) * 0.5 + Math.sin(t * 2.3 + 1.1) * 0.3
      const wind = (420 + gust * 260) * settle

      ctx.clearRect(0, 0, width, height)
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#f0f7ff'
      ctx.fillStyle = '#f0f7ff'

      for (const f of flakes) {
        f.sway += f.swaySpeed * dt
        const drift = wind * (0.4 + f.depth * 0.95)
        const vx = drift + Math.cos(f.sway) * f.swayAmp
        const vy = f.fall * (0.5 + settle * 0.8)

        f.x += vx * dt
        f.y += vy * dt

        if (f.x - f.r > width) {
          seed(f, true)
          continue
        }
        if (f.y - f.r > height) f.y = -f.r
        else if (f.y + f.r < 0) f.y = height + f.r

        ctx.globalAlpha = f.alpha
        const speed = Math.hypot(vx, vy)
        if (speed > 170) {
          const len = Math.min(speed * 0.06, 48)
          const nx = (vx / speed) * len
          const ny = (vy / speed) * len
          ctx.lineWidth = f.r * 1.1
          ctx.beginPath()
          ctx.moveTo(f.x, f.y)
          ctx.lineTo(f.x - nx, f.y - ny)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, phaseRef])
}

export default function IntroSplash() {
  // 페헤 공간에 들어올 때마다 재생한다. FeheApp이 새로 마운트될 때가 곧 '들어온 시점'이다.
  const [mounted, setMounted] = useState(() => !prefersReducedMotion())
  const [phase, setPhase] = useState('storm')
  const canvasRef = useRef(null)
  const phaseRef = useRef('storm')
  phaseRef.current = phase

  const dismiss = useCallback(() => {
    setPhase('clear')
    setTimeout(() => setMounted(false), 900)
  }, [])

  useEffect(() => {
    if (!mounted) return undefined

    const timers = [
      setTimeout(() => setPhase('reveal'), REVEAL_AT),
      setTimeout(() => setPhase('clear'), CLEAR_AT),
      setTimeout(() => setMounted(false), UNMOUNT_AT),
    ]

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') dismiss()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [mounted, dismiss])

  useIntroBlizzard(canvasRef, phaseRef)

  if (!mounted) return null

  return (
    <div className="intro" data-phase={phase} onClick={dismiss} role="presentation">
      <canvas className="intro-snow" ref={canvasRef} />
      <div className="intro-gust g1" />
      <div className="intro-gust g2" />
      <div className="intro-gust g3" />
      <div className="intro-flash" />
      <div className="intro-ring r1" />
      <div className="intro-ring r2" />
      <div className="intro-ring r3" />

      <div className="intro-core">
        <p className="intro-pre">Fehe&apos;s Space</p>
        <h1 className="intro-title">
          {TITLE_WORDS.map(({ word, chars }, w) => (
            <Fragment key={word + w}>
              {w > 0 && ' '}
              <span className="intro-word">
                {chars.map(({ ch, i }) => (
                  <span key={i} className="intro-char" style={{ '--i': i }}>
                    {ch}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </h1>
        <div className="intro-rule" />
        <p className="intro-sub">Developer · Creator · Community Builder</p>
      </div>

      <button type="button" className="intro-skip" onClick={dismiss}>
        건너뛰기 ESC
      </button>
    </div>
  )
}
