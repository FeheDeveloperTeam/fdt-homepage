import './AdminCharts.css'

const WIDTH = 560
const HEIGHT = 150
const PAD_X = 8
const PAD_TOP = 12
const PAD_BOTTOM = 24

function formatShortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

export default function TrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const innerW = WIDTH - PAD_X * 2
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = PAD_X + stepX * i
    const y = PAD_TOP + innerH - (d.count / max) * innerH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_TOP + innerH} L${points[0].x},${PAD_TOP + innerH} Z`

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="admin-trend-chart">
      {total === 0 ? (
        <p className="admin-chart-empty">최근 {data.length}일간 기록된 활동이 없어요.</p>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="admin-trend-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
          {points.map((p) => (
            <circle key={p.date} cx={p.x} cy={p.y} r="2.5" fill="var(--accent-brown)" />
          ))}
          {points
            .filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
            .map((p) => (
              <text key={p.date} x={p.x} y={HEIGHT - 6} className="admin-trend-label" textAnchor="middle">
                {formatShortDate(p.date)}
              </text>
            ))}
        </svg>
      )}
    </div>
  )
}
