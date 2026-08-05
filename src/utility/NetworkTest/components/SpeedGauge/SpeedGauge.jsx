import { useMemo } from 'react'
import './SpeedGauge.css'

const GAUGE_MAX = 200
const TICKS = [0, 0.25, 0.5, 0.75, 1]
const CENTER = { x: 110, y: 108 }
const RADIUS = 88
const ARC_LENGTH = Math.PI * RADIUS

function angleForPercent(percent) {
  // 0% -> 왼쪽(-180deg 기준 0deg), 100% -> 오른쪽(180deg) — SVG 좌표계에서 바늘 회전각(도)
  return -90 + percent * 180
}

function pointOnArc(percent) {
  const angleRad = ((180 - percent * 180) * Math.PI) / 180
  return {
    x: CENTER.x + RADIUS * Math.cos(angleRad) * -1,
    y: CENTER.y - RADIUS * Math.sin(angleRad),
  }
}

export default function SpeedGauge({ mbps, phase, severity }) {
  const percent = mbps === null ? 0 : Math.min(mbps / GAUGE_MAX, 1)
  const needleAngle = angleForPercent(percent)
  const progressOffset = ARC_LENGTH * (1 - percent)

  const severityClass = severity ? `speedGauge--${severity}` : ''

  const tickMarks = useMemo(
    () =>
      TICKS.map((t) => {
        const outer = pointOnArc(t)
        const inner = {
          x: CENTER.x + (outer.x - CENTER.x) * 0.86,
          y: CENTER.y + (outer.y - CENTER.y) * 0.86,
        }
        return { key: t, outer, inner }
      }),
    [],
  )

  return (
    <div className={`speedGauge ${severityClass}`}>
      <svg viewBox="0 0 220 128" className="speedGauge-svg">
        <path
          d={`M ${CENTER.x - RADIUS} ${CENTER.y} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER.x + RADIUS} ${CENTER.y}`}
          className="speedGauge-track"
          strokeDasharray={ARC_LENGTH}
        />
        <path
          d={`M ${CENTER.x - RADIUS} ${CENTER.y} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER.x + RADIUS} ${CENTER.y}`}
          className="speedGauge-progress"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={phase === 'idle' ? ARC_LENGTH : progressOffset}
        />

        {tickMarks.map((tick) => (
          <line
            key={tick.key}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            className="speedGauge-tick"
          />
        ))}

        <g
          className={`speedGauge-needle${phase === 'searching' ? ' speedGauge-needle--searching' : ''}`}
          style={phase === 'searching' ? undefined : { transform: `rotate(${needleAngle}deg)` }}
        >
          <line x1={CENTER.x} y1={CENTER.y} x2={CENTER.x} y2={CENTER.y - RADIUS + 14} />
        </g>
        <circle cx={CENTER.x} cy={CENTER.y} r="6" className="speedGauge-pivot" />
      </svg>

      <div className="speedGauge-readout">
        <span className="speedGauge-value">
          {mbps === null ? '–' : mbps.toFixed(1)}
        </span>
        <span className="speedGauge-unit">Mbps</span>
      </div>
    </div>
  )
}
