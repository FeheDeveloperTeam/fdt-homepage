import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

/*
  storm → reveal 까지만 자동으로 넘어가고, 그 뒤로는 사용자가 들어가기 버튼을
  누를 때까지 기다린다. 버튼을 누르면 clear로 바뀌고 화면이 걷힌 뒤 언마운트된다.
*/
const REVEAL_AT = 1200
const CLEAR_MS = 900

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/*
  인트로를 띄울지 정한다.
  - 사이트 안의 다른 페이지에서 넘어온 경우(클라이언트 라우팅): 항상 띄운다.
    React Router는 문서를 처음 불러온 위치에만 key 'default'를 주므로 이걸로 구분한다.
  - 문서를 새로 불러온 경우: 첫 방문·링크·주소 입력은 띄우고, 새로고침은 강력 새로고침일 때만 띄운다.
    둘의 구분은 JS로 할 수 없어서 서버가 요청 헤더를 보고 붙여 준 표시를 읽는다(api/_lib/reloadHint.js).
*/
function shouldPlayIntro(locationKey) {
  if (prefersReducedMotion()) return false
  if (locationKey !== 'default') return true
  const nav = performance.getEntriesByType?.('navigation')?.[0]
  if (nav?.type !== 'reload') return true
  return document.querySelector('meta[name="fdt-reload"]')?.getAttribute('content') === 'hard'
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
  const location = useLocation()
  const [mounted, setMounted] = useState(() => shouldPlayIntro(location.key))
  const [phase, setPhase] = useState('storm')
  const canvasRef = useRef(null)
  const phaseRef = useRef('storm')
  phaseRef.current = phase

  const enter = useCallback(() => {
    setPhase((prev) => (prev === 'clear' ? prev : 'clear'))
    setTimeout(() => setMounted(false), CLEAR_MS)
  }, [])

  useEffect(() => {
    if (!mounted) return undefined

    const timers = [setTimeout(() => setPhase('reveal'), REVEAL_AT)]

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // 키보드만 쓰는 경우에도 버튼을 누르지 않고 바로 들어갈 수 있게 한다.
    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') enter()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [mounted, enter])

  useIntroBlizzard(canvasRef, phaseRef)

  if (!mounted) return null

  return (
    <div className="intro" data-phase={phase}>
      <canvas className="intro-snow" ref={canvasRef} />
      <div className="intro-gust g1" />
      <div className="intro-gust g2" />
      <div className="intro-gust g3" />
      <div className="intro-aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
      </div>

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
        <p className="intro-sub">Developer · Community Builder</p>

        <button type="button" className="intro-enter" onClick={enter}>
          페헤의 공간으로 들어가기
          <span className="intro-enter-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
