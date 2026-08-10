import { useState } from 'react'
import './AdminCharts.css'

const WIDTH = 640
const HEIGHT = 150
const PADDING = { top: 10, right: 8, bottom: 20, left: 8 }

function formatTime(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 단일 시계열(온라인 인원 추이 등)을 보여주는 얇은 라인+영역 차트.
// 시리즈가 하나뿐이라 범례는 따로 없고, 제목이 그 역할을 한다.
export default function TrendLineChart({ points, unit = '', emptyText }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (!points || points.length < 2) {
    return <p className="admin-chart-empty">{emptyText}</p>
  }

  const innerW = WIDTH - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom
  const max = Math.max(...points.map((p) => p.count), 1)

  const x = (i) => PADDING.left + (i / (points.length - 1)) * innerW
  const y = (v) => PADDING.top + innerH - (v / max) * innerH
  const baseY = PADDING.top + innerH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.count)}`).join(' ')
  const areaPath = `${linePath} L ${x(points.length - 1)} ${baseY} L ${x(0)} ${baseY} Z`

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    const idx = Math.round(((relX - PADDING.left) / innerW) * (points.length - 1))
    setHoverIndex(Math.min(Math.max(idx, 0), points.length - 1))
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="admin-trend-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="admin-trend-svg"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line x1={PADDING.left} y1={baseY} x2={WIDTH - PADDING.right} y2={baseY} className="admin-trend-baseline" />
        <path d={areaPath} className="admin-trend-area" />
        <path d={linePath} className="admin-trend-line" />
        {hovered && (
          <>
            <line
              x1={x(hoverIndex)}
              y1={PADDING.top}
              x2={x(hoverIndex)}
              y2={baseY}
              className="admin-trend-crosshair"
            />
            <circle cx={x(hoverIndex)} cy={y(hovered.count)} r="4" className="admin-trend-dot" />
          </>
        )}
        <text x={PADDING.left} y={HEIGHT - 4} className="admin-trend-label">
          {formatTime(points[0].t)}
        </text>
        <text x={WIDTH - PADDING.right} y={HEIGHT - 4} textAnchor="end" className="admin-trend-label">
          {formatTime(points[points.length - 1].t)}
        </text>
      </svg>
      <div className="admin-trend-tooltip">
        <strong>
          {(hovered ?? points[points.length - 1]).count.toLocaleString()}
          {unit}
        </strong>
        <span>{formatTime((hovered ?? points[points.length - 1]).t)}</span>
      </div>
    </div>
  )
}
