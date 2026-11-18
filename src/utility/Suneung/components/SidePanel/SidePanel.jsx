import { useEffect, useMemo, useRef, useState } from 'react'
import { daysUntil, kstParts, phaseOf } from '../../suneungDates'
import { useCountUp } from '../../useMotion'
import './SidePanel.css'

const DAY_MS = 86400000

// 오늘 다음 날부터 시험 전날까지 남은 주말(토요일 수)과 평일 수.
function countDays(todayUtc, examUtc) {
  let weekends = 0
  let weekdays = 0
  for (let t = todayUtc + DAY_MS; t < examUtc; t += DAY_MS) {
    const w = new Date(t).getUTCDay()
    if (w === 6) weekends += 1
    else if (w !== 0) weekdays += 1
  }
  return { weekends, weekdays }
}

function Stat({ value, unit, label }) {
  const shown = useCountUp(value, 1100)
  return (
    <div className="sp-stat">
      <dt>{label}</dt>
      <dd>
        <span className="suneung-num">{shown.toLocaleString('ko-KR')}</span>
        <small>{unit}</small>
      </dd>
    </div>
  )
}

function IconScreen() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10 18h4" strokeLinecap="round" />
    </svg>
  )
}

function IconTimer() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 2M9.5 2.5h5" strokeLinecap="round" />
    </svg>
  )
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" strokeLinecap="round" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" strokeLinecap="round" />
    </svg>
  )
}

export default function SidePanel({ exam, now, onOpenClassroom, onOpenWallpaper }) {
  const phase = phaseOf(exam, now)
  const p = kstParts(now)
  const todayUtc = Date.UTC(p.year, p.month - 1, p.day)
  const examUtc = Date.UTC(exam.examYear, exam.month - 1, exam.day)
  const { weekends, weekdays } = useMemo(() => countDays(todayUtc, examUtc), [todayUtc, examUtc])
  const remainMs = Math.max(0, exam.startMs - now)

  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="sp" aria-label="남은 시간과 도구" data-reveal>
      <section className="sp-card sp-card--stats" aria-labelledby="sp-stats-title">
        <h2 id="sp-stats-title" className="sp-title">
          숫자로 보는 남은 시간
        </h2>
        {phase === 'before' ? (
          <dl className="sp-stats">
            <Stat label="남은 시간" value={Math.floor(remainMs / 3600000)} unit="시간" />
            <Stat label="남은 분" value={Math.floor(remainMs / 60000)} unit="분" />
            <Stat label="남은 주말" value={weekends} unit="번" />
            <Stat label="남은 평일" value={weekdays} unit="일" />
          </dl>
        ) : (
          <p className="sp-today">{phase === 'during' ? '지금 시험이 진행 중입니다. 끝까지 힘내세요!' : '오늘 시험이 모두 끝났습니다.'}</p>
        )}
        {phase === 'before' && daysUntil(exam, now) > 0 && (
          <p className="sp-note">오늘은 빼고, 시험 전날까지 센 주말과 평일입니다.</p>
        )}
      </section>

      <section className="sp-card" aria-labelledby="sp-tools-title">
        <h2 id="sp-tools-title" className="sp-title">
          이 타이머로 할 수 있는 것
        </h2>
        <ul className="sp-tools">
          <li>
            <button type="button" className="sp-tool" onClick={onOpenClassroom}>
              <span className="sp-tool-icon"><IconScreen /></span>
              <span className="sp-tool-text">
                <strong>교실 화면으로 띄우기</strong>
                <small>전체 화면 D-Day · 교실·독서실용</small>
              </span>
            </button>
          </li>
          <li>
            <button type="button" className="sp-tool" onClick={onOpenWallpaper}>
              <span className="sp-tool-icon"><IconImage /></span>
              <span className="sp-tool-text">
                <strong>D-Day 배경화면 만들기</strong>
                <small>휴대폰·PC 크기 이미지로 저장</small>
              </span>
            </button>
          </li>
          <li>
            <a className="sp-tool" href="#practice">
              <span className="sp-tool-icon"><IconTimer /></span>
              <span className="sp-tool-text">
                <strong>수능 실전 타이머</strong>
                <small>영역별 실제 시험 시간 · 종소리</small>
              </span>
            </a>
          </li>
          <li>
            <button type="button" className="sp-tool" onClick={copyLink}>
              <span className="sp-tool-icon"><IconLink /></span>
              <span className="sp-tool-text">
                <strong>{copied ? '링크를 복사했습니다' : '링크 복사해 공유하기'}</strong>
                <small>친구·가족에게 D-Day 보내기</small>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </aside>
  )
}
