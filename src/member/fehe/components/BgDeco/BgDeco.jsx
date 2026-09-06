import { useEffect, useRef } from 'react'
import './BgDeco.css'

// 원경 → 근경 순서. 멀수록 밝고 흐릿하게 칠해 대기 원근을 만든다.
const RIDGES = [
  {
    id: 'far',
    d:
      'M0,616 L58,572 L104,594 L158,536 L206,568 L262,512 L304,548 L356,486 L402,522 L448,494 ' +
      'L502,438 L536,468 L560,404 L592,452 L628,428 L672,486 L716,458 L764,514 L806,482 L852,528 ' +
      'L900,496 L946,540 L998,494 L1044,528 L1082,466 L1108,432 L1146,478 L1184,452 L1230,506 ' +
      'L1276,474 L1322,522 L1370,490 L1410,530 L1440,506 L1440,900 L0,900 Z',
    stops: [
      ['0%', '#c3d6ec'],
      ['14%', '#8ba3c1'],
      ['100%', '#33465f'],
    ],
    ridge: 'rgba(235,245,255,0.5)',
  },
  {
    id: 'mid',
    d:
      'M0,712 L64,676 L118,700 L176,646 L222,678 L280,620 L322,652 L368,596 L404,560 L444,604 ' +
      'L488,578 L540,632 L588,602 L638,650 L688,618 L740,664 L790,628 L842,672 L886,624 L924,584 ' +
      'L968,628 L1016,600 L1068,652 L1118,618 L1170,666 L1222,630 L1276,674 L1330,638 L1384,680 ' +
      'L1440,650 L1440,900 L0,900 Z',
    stops: [
      ['0%', '#a8bfd8'],
      ['12%', '#62799a'],
      ['100%', '#1c2a3e'],
    ],
    ridge: 'rgba(224,238,255,0.42)',
  },
  {
    id: 'near',
    d:
      'M0,818 L74,780 L142,806 L214,748 L268,782 L340,722 L392,760 L466,714 L534,764 L606,730 ' +
      'L676,782 L748,742 L818,792 L890,748 L958,798 L1030,754 L1100,802 L1174,760 L1246,806 ' +
      'L1318,768 L1386,812 L1440,782 L1440,900 L0,900 Z',
    stops: [
      ['0%', '#7e97b3'],
      ['10%', '#35475f'],
      ['100%', '#090f18'],
    ],
    ridge: 'rgba(210,230,250,0.34)',
  },
]

function Mountains() {
  return (
    <svg
      className="bg-mountains"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {RIDGES.map(r => (
          <linearGradient key={r.id} id={`bgRidge-${r.id}`} x1="0" y1="0" x2="0" y2="1">
            {r.stops.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        ))}
      </defs>
      {RIDGES.map(r => (
        <path
          key={r.id}
          d={r.d}
          fill={`url(#bgRidge-${r.id})`}
          stroke={r.ridge}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

/*
  눈보라. 입자 수가 많아 DOM 대신 canvas로 그린다.
  depth(0~1)로 크기·속도·밝기를 함께 묶어 원근을 내고,
  바람은 주기가 다른 사인파를 겹쳐 돌풍처럼 세기가 변하게 한다.
*/
function useBlizzard(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let flakes = []
    let raf = 0
    let last = performance.now()

    function seed(flake, top) {
      const depth = Math.random()
      flake.depth = depth
      flake.x = Math.random() * width
      flake.y = top ? -Math.random() * height * 0.3 : Math.random() * height
      flake.r = 0.6 + depth * (calm ? 1.6 : 2.6)
      flake.fall = 18 + depth * (calm ? 42 : 118)
      flake.sway = Math.random() * Math.PI * 2
      flake.swaySpeed = 0.6 + Math.random() * 1.6
      flake.swayAmp = 8 + depth * 26
      flake.alpha = 0.2 + depth * 0.62
      return flake
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = calm
        ? Math.min(110, Math.round((width * height) / 13000))
        : Math.min(620, Math.round((width * height) / 2400))

      if (flakes.length > target) {
        flakes.length = target
      } else {
        while (flakes.length < target) flakes.push(seed({}, false))
      }
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // 돌풍: 주기가 다른 사인파를 겹쳐 불규칙하게 몰아치도록 한다.
      const t = now / 1000
      const gust =
        Math.sin(t * 0.21) * 0.62 + Math.sin(t * 0.67 + 1.7) * 0.28 + Math.sin(t * 0.13 + 0.4) * 0.42
      const wind = calm ? 26 : 150 + gust * 190

      ctx.clearRect(0, 0, width, height)
      ctx.lineCap = 'round'

      for (const f of flakes) {
        f.sway += f.swaySpeed * dt
        const drift = wind * (0.35 + f.depth * 0.9)
        const vx = drift + Math.cos(f.sway) * f.swayAmp
        const vy = f.fall + Math.abs(drift) * 0.12

        f.x += vx * dt
        f.y += vy * dt

        if (f.y - f.r > height) {
          seed(f, true)
          continue
        }
        if (f.x - f.r > width) f.x = -f.r
        else if (f.x + f.r < 0) f.x = width + f.r

        ctx.globalAlpha = f.alpha
        const speed = Math.hypot(vx, vy)
        if (speed > 260) {
          // 빠른 입자는 선으로 그려 몰아치는 결을 만든다.
          const len = Math.min(speed * 0.045, 26)
          const nx = (vx / speed) * len
          const ny = (vy / speed) * len
          ctx.strokeStyle = '#eaf4ff'
          ctx.lineWidth = f.r * 1.15
          ctx.beginPath()
          ctx.moveTo(f.x, f.y)
          ctx.lineTo(f.x - nx, f.y - ny)
          ctx.stroke()
        } else {
          ctx.fillStyle = '#eaf4ff'
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    function stop() {
      cancelAnimationFrame(raf)
      raf = 0
    }

    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    resize()
    start()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef])
}

export default function BgDeco() {
  const canvasRef = useRef(null)
  useBlizzard(canvasRef)

  return (
    <div className="bg-deco" aria-hidden="true">
      <div className="bg-moon" />
      <Mountains />
      <div className="bg-haze h1" />
      <div className="bg-haze h2" />
      <div className="bg-haze h3" />
      <canvas className="bg-snow" ref={canvasRef} />
      <div className="bg-vignette" />
    </div>
  )
}
