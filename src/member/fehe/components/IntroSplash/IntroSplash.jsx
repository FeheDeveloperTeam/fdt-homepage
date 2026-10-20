import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { INITIAL_LOCATION_KEY } from '../../../../initialLocation'
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
// 들어가기 버튼은 문구가 다 맺힌 뒤에 나타난다. 보이기 전에는 아예 렌더링하지 않아
// 투명한 버튼이 포커스되거나 눌리는 일이 없게 한다.
const ENTER_AT = REVEAL_AT + 1250
const CLEAR_MS = 900

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/*
  인트로를 띄울지 정한다.
  - 사이트 안의 다른 페이지에서 넘어온 경우(클라이언트 라우팅): 항상 띄운다.
    지금 위치 key가 문서를 처음 불러올 때의 key와 다르면 클라이언트 이동이다(src/initialLocation.js).
  - 문서를 새로 불러온 경우: 첫 방문·링크·주소 입력은 띄우고, 새로고침은 강력 새로고침일 때만 띄운다.
    둘의 구분은 JS로 할 수 없어서 서버가 요청 헤더를 보고 붙여 준 표시를 읽는다(api/_lib/reloadHint.js).
*/
function shouldPlayIntro(locationKey) {
  if (prefersReducedMotion()) return false
  if (locationKey !== INITIAL_LOCATION_KEY) return true
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
  const [canEnter, setCanEnter] = useState(false)
  const dialogRef = useRef(null)
  const enterRef = useRef(null)
  const canvasRef = useRef(null)
  const phaseRef = useRef('storm')
  phaseRef.current = phase

  const enter = useCallback(() => {
    setPhase((prev) => (prev === 'clear' ? prev : 'clear'))
    setTimeout(() => setMounted(false), CLEAR_MS)
  }, [])

  useEffect(() => {
    if (!mounted) return undefined

    const timers = [
      setTimeout(() => setPhase('reveal'), REVEAL_AT),
      setTimeout(() => setCanEnter(true), ENTER_AT),
    ]

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // 인트로가 떠 있는 동안 뒤의 페이지는 키보드·스크린리더가 닿지 않게 inert로 막는다.
    // 나중에 지연 로딩으로 붙는 형제 요소도 놓치지 않도록 추가되는 요소를 지켜본다.
    const dialog = dialogRef.current
    const parent = dialog?.parentElement
    const inerted = new Set()
    const blockSiblings = () => {
      if (!parent) return
      for (const el of parent.children) {
        if (el !== dialog && !el.hasAttribute('inert')) {
          el.setAttribute('inert', '')
          inerted.add(el)
        }
      }
    }
    blockSiblings()
    const observer = parent ? new MutationObserver(blockSiblings) : null
    observer?.observe(parent, { childList: true })

    // 포커스를 인트로 안으로 옮겨 스크린리더가 대화상자를 바로 읽게 한다.
    dialog?.focus({ preventScroll: true })

    // 버튼이 나타나기 전에도 건너뛸 수 있게 ESC만 받는다. Enter·Space는 버튼이 직접 처리한다.
    function onKey(e) {
      if (e.key === 'Escape') enter()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
      observer?.disconnect()
      inerted.forEach((el) => el.removeAttribute('inert'))
      document.body.style.overflow = prevOverflow

      // 닫히면 포커스를 페이지 첫 제목으로 보내 키보드·스크린리더 사용자가 이어서 읽게 한다.
      const heading = parent?.querySelector('h1')
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
        heading.focus({ preventScroll: true })
      }
    }
  }, [mounted, enter])

  // 버튼이 나타나면 바로 포커스를 준다. Enter·Space로 곧장 들어갈 수 있다.
  useEffect(() => {
    if (canEnter) enterRef.current?.focus({ preventScroll: true })
  }, [canEnter])

  useIntroBlizzard(canvasRef, phaseRef)

  if (!mounted) return null

  return (
    <div
      ref={dialogRef}
      className="intro"
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      aria-describedby="intro-hint"
      tabIndex={-1}
    >
      <canvas className="intro-snow" ref={canvasRef} aria-hidden="true" />
      <div className="intro-gust g1" aria-hidden="true" />
      <div className="intro-gust g2" aria-hidden="true" />
      <div className="intro-gust g3" aria-hidden="true" />
      <div className="intro-aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
      </div>

      <div className="intro-core">
        <p className="intro-pre" aria-hidden="true">Fehe&apos;s Space</p>
        {/* 글자마다 나뉜 span은 스크린리더가 한 글자씩 끊어 읽을 수 있어 숨기고, 문장은 따로 읽힌다 */}
        <h1 id="intro-title" className="intro-title">
          <span className="intro-sr-only">{TITLE}</span>
          <span aria-hidden="true">
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
          </span>
        </h1>
        <div className="intro-rule" aria-hidden="true" />
        <p className="intro-sub">Developer · Community Builder</p>
        <p id="intro-hint" className="intro-sr-only">
          들어가기 버튼을 누르면 페헤의 자기소개 페이지로 들어갑니다. ESC 키로 바로 건너뛸 수도 있습니다.
        </p>

        {canEnter && (
          <button ref={enterRef} type="button" className="intro-enter" onClick={enter}>
            페헤의 공간으로 들어가기
            <span className="intro-enter-arrow" aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  )
}
