import { useEffect, useRef } from 'react'
import { useAmbient } from '../../ambient/useAmbient'
import { getAnalyser } from '../../ambient/ambientEngine'
import { PRESETS, SLEEP_OPTIONS, SOUNDS, SOUND_GROUPS } from '../../ambient/sounds'
import { useClock } from '../../suneungState'
import { pad2 } from '../../suneungDates'
import { prefersReducedMotion } from '../../useMotion'
import './Ambient.css'

const ICONS = {
  white: <path d="M2 12h2l1.5-6 2 12 2-9 2 6 2-8 2 10 2-7 1.5 4H22" />,
  pink: <path d="M2 12c2 0 2.5-4 5-4s3 8 5 8 2.5-8 5-8 3 4 5 4" />,
  brown: <path d="M2 14c3 0 4-5 7.5-5S14 15 17 15s3.5-3 5-3" />,
  rain: (
    <>
      <path d="M7 15a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 6.5a3.8 3.8 0 0 1 .5 8.5H7Z" />
      <path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5" />
    </>
  ),
  waves: (
    <>
      <path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
      <path d="M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
      <path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
    </>
  ),
  fire: (
    <>
      <path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.6 3-5.4 3.5-9.5 2.6 1.7 3.6 3.6 3.8 5.3.7-.9 1.1-2 1.2-3.1 2.4 1.9 4.5 4.4 4.5 7.3 0 3.4-2.6 6-6.5 6Z" />
      <path d="M12 21c-1.6 0-2.7-1.1-2.7-2.6 0-1.6 1.4-2.4 2.2-3.9 1.7 1.2 3.2 2.3 3.2 3.9 0 1.5-1.1 2.6-2.7 2.6Z" />
    </>
  ),
  crickets: (
    <>
      <path d="M17.5 14.5A7 7 0 0 1 9.5 4a7.5 7.5 0 1 0 8 10.5Z" />
      <path d="M18 3.5v3M16.5 5h3M21 9.5v2M20 10.5h2" />
    </>
  ),
  aircon: (
    <>
      <rect x="2.5" y="4" width="19" height="8" rx="2" />
      <path d="M6 9h12M8 15.5c0 1.5-1 2-1 3.5M12 15.5v4M16 15.5c0 1.5 1 2 1 3.5" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20l1.2-4.6L15.6 5a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8 4 20Z" />
      <path d="M13.5 7l3.5 3.5M14 20h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
}

function SoundIcon({ id }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[id]}
    </svg>
  )
}

// 지금 나는 소리를 막대로 그린다. 아무것도 안 틀었을 때는 낮게 숨 쉬는 막대만 보인다.
function Visualizer({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const g = canvas.getContext('2d')
    const BARS = 40
    let frame = 0
    let data = null

    const draw = (time) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== Math.round(rect.width * dpr)) {
        canvas.width = Math.round(rect.width * dpr)
        canvas.height = Math.round(rect.height * dpr)
      }
      const w = canvas.width
      const h = canvas.height
      const color = getComputedStyle(canvas).getPropertyValue('color')
      g.clearRect(0, 0, w, h)
      g.fillStyle = color

      const analyser = active ? getAnalyser() : null
      if (analyser) {
        data ??= new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
      }
      const gap = 3 * dpr
      const barW = (w - gap * (BARS - 1)) / BARS
      for (let i = 0; i < BARS; i += 1) {
        let v
        if (analyser) {
          // 낮은 쪽이 촘촘하도록 로그 간격으로 칸을 고른다.
          const bin = Math.min(data.length - 1, Math.floor(Math.pow(data.length * 0.85, i / BARS)))
          v = data[bin] / 255
        } else {
          v = 0.08 + 0.05 * Math.sin(time / 900 + i * 0.45)
        }
        const bh = Math.max(2 * dpr, v * h)
        g.globalAlpha = analyser ? 0.35 + v * 0.65 : 0.35
        g.beginPath()
        g.roundRect(i * (barW + gap), h - bh, barW, bh, Math.min(barW / 2, 3 * dpr))
        g.fill()
      }
      g.globalAlpha = 1
      if (!prefersReducedMotion()) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [active])

  return <canvas ref={canvasRef} className="am-viz" aria-hidden="true" />
}

function remainingLabel(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`
}

// 공부할 때 틀어 두는 백색소음·ASMR. 여러 소리를 함께 틀고 소리마다 크기를 따로 맞춘다.
export default function Ambient() {
  const { now } = useClock()
  const { levels, master, playing, preset, sleep, toggle, setLevel, setMaster, applyPreset, stopAll, chooseSleep } =
    useAmbient()
  const active = playing.size > 0
  const names = SOUNDS.filter((s) => playing.has(s.id)).map((s) => s.name)

  return (
    <section className="suneung-section" id="sound" aria-labelledby="am-title" data-reveal>
      <div className="suneung-section-head">
        <h2 id="am-title" className="suneung-section-title">
          공부 백색소음 · ASMR
        </h2>
        <p className="suneung-section-desc">여러 소리를 함께 틀고 크기를 따로 맞출 수 있습니다</p>
      </div>

      <div className={`am-deck${active ? ' is-active' : ''}`}>
        <div className="am-now">
          <Visualizer active={active} />
          <div className="am-now-text" aria-live="polite">
            <p className="am-now-label">{active ? '지금 듣는 소리' : '꺼져 있음'}</p>
            <p className="am-now-names">{active ? names.join(' · ') : '아래에서 소리를 누르거나 묶음을 골라 보세요'}</p>
          </div>
          <button type="button" className="sn-btn am-stop" onClick={stopAll} disabled={!active}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            모두 끄기
          </button>
        </div>

        <div className="am-controls">
          <div className="am-presets" role="group" aria-label="소리 묶음">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                className="am-chip"
                aria-pressed={preset === p.key}
                onClick={() => (preset === p.key ? stopAll() : applyPreset(p.key))}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="am-master">
            <label htmlFor="am-master">전체 크기</label>
            <input
              id="am-master"
              type="range"
              min="0"
              max="100"
              value={Math.round(master * 100)}
              onChange={(e) => setMaster(Number(e.target.value) / 100)}
            />
            <span className="suneung-num">{Math.round(master * 100)}</span>
          </div>

          <div className="am-sleep">
            <span className="am-sleep-label">끄기 타이머</span>
            <div className="am-sleep-options" role="group" aria-label="끄기 타이머">
              {SLEEP_OPTIONS.map((o) => (
                <button
                  key={o.minutes}
                  type="button"
                  className="am-chip am-chip--small"
                  aria-pressed={sleep.minutes === o.minutes}
                  onClick={() => chooseSleep(o.minutes)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {sleep.endsAt && active && (
              <span className="am-sleep-left suneung-num">{remainingLabel(sleep.endsAt - now)} 뒤 꺼짐</span>
            )}
          </div>
        </div>

        {SOUND_GROUPS.map((group) => (
          <div key={group.key} className="am-group">
            <h3 className="am-group-title">{group.label}</h3>
            <ul className="am-grid">
              {group.sounds.map((sound) => {
                const on = playing.has(sound.id)
                const level = Math.round(levels[sound.id] * 100)
                return (
                  <li key={sound.id} className={`am-card${on ? ' is-on' : ''}`}>
                    <button type="button" className="am-toggle" aria-pressed={on} onClick={() => toggle(sound.id)}>
                      <span className="am-icon">
                        <SoundIcon id={sound.id} />
                      </span>
                      <span className="am-text">
                        <span className="am-name">{sound.name}</span>
                        <span className="am-desc">{sound.desc}</span>
                      </span>
                      <span className="am-eq" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </button>
                    <div className="am-level">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={level}
                        aria-label={`${sound.name} 크기`}
                        onChange={(e) => setLevel(sound.id, Number(e.target.value) / 100)}
                      />
                      <span className="suneung-num">{level}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        <p className="am-note">
          모든 소리는 음원 파일 없이 브라우저에서 바로 만들어집니다. 다른 탭을 보고 있어도 계속 나며, 이 화면을 떠나면
          꺼집니다. 이어폰으로 들을 때는 크기를 작게 시작하세요.
        </p>
      </div>
    </section>
  )
}
