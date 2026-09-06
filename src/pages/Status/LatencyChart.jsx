import { useEffect, useRef, useState } from 'react'
import { HISTORY_SIZE, POLL_INTERVAL_MS } from './statusMonitor'
import styles from './LatencyChart.module.css'

const PAD = { top: 14, right: 14, bottom: 24, left: 46 }
const MIN_Y_MAX = 50

function niceCeil(value) {
  const step = value <= 100 ? 25 : value <= 250 ? 50 : value <= 1000 ? 100 : 500
  return Math.max(MIN_Y_MAX, Math.ceil(value / step) * step)
}

/*
  응답 시간 단일 계열 차트. 계열이 하나뿐이라 범례 없이 제목이 계열을 가리키고,
  선은 항상 같은 색을 쓴다 — 상태색은 옆의 상태 표시에서만 쓴다.
  응답하지 않은 시점은 선을 끊고 바닥에 눈금으로 따로 표시한다.
*/
export default function LatencyChart({ history, label }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(720)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const height = 190
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom

  const maxSample = history.reduce((max, s) => (s.ok && s.ms > max ? s.ms : max), 0)
  const yMax = niceCeil(maxSample * 1.2)

  // 오른쪽 끝이 항상 '지금'이 되도록 고정 슬롯 위에 최신 표본부터 채운다.
  const slotX = (index) => PAD.left + (plotW * index) / (HISTORY_SIZE - 1)
  const offset = HISTORY_SIZE - history.length
  const yOf = (ms) => PAD.top + plotH - (Math.min(ms, yMax) / yMax) * plotH

  const points = history.map((sample, i) => ({
    ...sample,
    x: slotX(offset + i),
    y: sample.ok ? yOf(sample.ms) : null,
  }))

  // 실패 구간에서 선이 이어지지 않도록 성공 표본이 연속된 구간끼리 끊어 그린다.
  const segments = []
  let current = []
  points.forEach((point) => {
    if (point.ok) current.push(point)
    else if (current.length) { segments.push(current); current = [] }
  })
  if (current.length) segments.push(current)

  const gridValues = [0, yMax / 2, yMax]
  const spanSeconds = Math.round(((HISTORY_SIZE - 1) * POLL_INTERVAL_MS) / 1000)

  function onMove(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    let nearest = null
    points.forEach((point) => {
      const distance = Math.abs(point.x - x)
      if (distance < 18 && (!nearest || distance < Math.abs(nearest.x - x))) nearest = point
    })
    setHover(nearest)
  }

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.captionTitle}>{label} 응답 시간</span>
        <span className={styles.captionMeta}>
          {history.length < HISTORY_SIZE
            ? `표본 ${history.length} / ${HISTORY_SIZE} 수집 중 · ${POLL_INTERVAL_MS / 1000}초 간격`
            : `최근 ${spanSeconds}초 · ${POLL_INTERVAL_MS / 1000}초 간격`}
        </span>
      </figcaption>

      <div className={styles.plotWrap} ref={wrapRef}>
        <svg
          width={width}
          height={height}
          className={styles.svg}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label={`${label} 응답 시간 추이`}
        >
          <defs>
            <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridValues.map((value) => (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={yOf(value)}
                y2={yOf(value)}
                className={styles.grid}
              />
              <text x={PAD.left - 8} y={yOf(value) + 4} textAnchor="end" className={styles.axisLabel}>
                {Math.round(value)}ms
              </text>
            </g>
          ))}

          {segments.map((segment, i) => (
            <g key={i}>
              {segment.length > 1 && (
                <path
                  d={`M${segment.map((p) => `${p.x},${p.y}`).join('L')}L${segment[segment.length - 1].x},${yOf(0)}L${segment[0].x},${yOf(0)}Z`}
                  fill="url(#latencyFill)"
                />
              )}
              <path
                d={`M${segment.map((p) => `${p.x},${p.y}`).join('L')}`}
                fill="none"
                className={styles.line}
              />
            </g>
          ))}

          {points.filter((p) => !p.ok).map((point, i) => (
            <line
              key={i}
              x1={point.x}
              x2={point.x}
              y1={PAD.top}
              y2={yOf(0)}
              className={styles.failMark}
            />
          ))}

          {points.length > 0 && points[points.length - 1].ok && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" className={styles.latestDot} />
          )}

          {hover && (
            <>
              <line x1={hover.x} x2={hover.x} y1={PAD.top} y2={yOf(0)} className={styles.crosshair} />
              {hover.ok && <circle cx={hover.x} cy={hover.y} r="5" className={styles.hoverDot} />}
            </>
          )}

          <text x={PAD.left} y={height - 6} className={styles.axisLabel}>{spanSeconds}초 전</text>
          <text x={width - PAD.right} y={height - 6} textAnchor="end" className={styles.axisLabel}>지금</text>
        </svg>

        {hover && (
          <div
            className={styles.tooltip}
            style={{ left: `${hover.x}px`, transform: `translateX(${hover.x > width * 0.72 ? '-100%' : '-50%'})` }}
          >
            <span className={styles.tooltipTime}>
              {new Date(hover.at).toLocaleTimeString('ko-KR', { hour12: false })}
            </span>
            <span className={styles.tooltipValue}>
              {hover.ok ? `${Math.round(hover.ms)}ms` : hover.reason}
            </span>
          </div>
        )}
      </div>
    </figure>
  )
}
