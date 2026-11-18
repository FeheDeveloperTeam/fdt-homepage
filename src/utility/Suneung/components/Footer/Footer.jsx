import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo/Logo'
import { dLabel, daysUntil, pad2, phaseOf, splitDuration } from '../../suneungDates'
import { useClock, useSelectedExam } from '../../suneungState'
import { prefersReducedMotion } from '../../useMotion'
import './Footer.css'

function IconTimer() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 2M9.5 2.5h5" strokeLinecap="round" />
    </svg>
  )
}

function IconList() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" strokeLinejoin="round" />
    </svg>
  )
}

const TABS = [
  { id: 'practice', label: '실전', Icon: IconTimer },
  { id: 'timetable', label: '시간표', Icon: IconList },
  { id: 'upcoming', label: '날짜', Icon: IconCalendar },
  { id: 'cheer', label: '응원', Icon: IconHeart },
]
const SPY_IDS = ['dday', ...TABS.map((t) => t.id)]

function goTo(event, id) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `${location.pathname}${location.search}#${id}`)
}

// 지금 화면 가운데쯤에 있는 섹션을 찾아 탭에 표시한다.
function useActiveSection() {
  const [active, setActive] = useState('dday')
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const id of SPY_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])
  return active
}

// 화면 아래를 따라오는 푸터. 넓은 화면에서는 실시간 D-Day 바, 모바일에서는 앱 같은 하단 탭 바가 된다.
export default function Footer() {
  const { now } = useClock()
  const { exam } = useSelectedExam(now)
  const active = useActiveSection()
  const year = new Date(now).getFullYear()

  const days = daysUntil(exam, now)
  const phase = phaseOf(exam, now)
  const parts = splitDuration(exam.startMs - now)
  const time =
    phase === 'before'
      ? `${parts.days > 0 ? `${parts.days.toLocaleString('ko-KR')}일 ` : ''}${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`
      : phase === 'during'
        ? '시험 진행 중'
        : '시험 종료'

  return (
    <>
      <p className="sf-credit-flow">
        &copy; {year} <span>수능 D-Day 타이머</span> · Developed by FeheDeveloperTeam ·{' '}
        <Link to="/privacy">개인정보 처리방침</Link>
      </p>
      <footer className="sf">
        <div className="sf-inner">
          <a className="sf-count" href="#dday" onClick={(e) => goTo(e, 'dday')}>
            <Logo size={24} className="sf-logo" />
            <span className="sf-count-label">{exam.academicYear}학년도 수능</span>
            <strong className="sf-d suneung-num">{dLabel(days)}</strong>
            <span className="sf-time suneung-num">{time}</span>
          </a>

          <nav className="sf-tabs" aria-label="페이지 안 바로가기">
            <a
              className={`sf-tab sf-tab--dday${active === 'dday' ? ' is-active' : ''}`}
              href="#dday"
              aria-current={active === 'dday' ? 'location' : undefined}
              onClick={(e) => goTo(e, 'dday')}
            >
              <span className="sf-tab-d suneung-num">{dLabel(days)}</span>
              <span className="sf-tab-label">D-Day</span>
            </a>
            {TABS.map(({ id, label, Icon }) => (
              <a
                key={id}
                className={`sf-tab${active === id ? ' is-active' : ''}`}
                href={`#${id}`}
                aria-current={active === id ? 'location' : undefined}
                onClick={(e) => goTo(e, id)}
              >
                <Icon />
                <span className="sf-tab-label">{label}</span>
              </a>
            ))}
          </nav>

          <p className="sf-credit">
            &copy; {year} <span>수능 D-Day 타이머</span> · FeheDeveloperTeam ·{' '}
            <Link to="/privacy">개인정보 처리방침</Link>
          </p>
        </div>
      </footer>
    </>
  )
}
