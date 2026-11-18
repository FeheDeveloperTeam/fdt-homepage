import { useEffect, useRef, useState } from 'react'
import { kstParts, pad2 } from '../../suneungDates'
import { CHEER_MESSAGES } from './cheerMessages'
import './CheerSection.css'

const COLLAPSED_COUNT = 8
const TOTAL = CHEER_MESSAGES.length

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

export default function CheerSection({ now }) {
  // 「오늘의 응원」은 한국 날짜가 바뀔 때마다 다음 문구로 넘어간다.
  const p = kstParts(now)
  const todayIndex = Math.floor(Date.UTC(p.year, p.month - 1, p.day) / 86400000) % TOTAL

  const [picked, setPicked] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [copyState, setCopyState] = useState(null)
  const featureRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const index = picked ?? todayIndex
  const message = CHEER_MESSAGES[index]
  const isToday = picked === null || picked === todayIndex

  const move = (delta) => {
    setPicked((index + delta + TOTAL) % TOTAL)
    setCopyState(null)
  }

  const pick = (i) => {
    setPicked(i)
    setCopyState(null)
    const card = featureRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    if (rect.top < 70 || rect.bottom > window.innerHeight) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }
  }

  const copy = async () => {
    clearTimeout(timerRef.current)
    try {
      await navigator.clipboard.writeText(message)
      setCopyState({ index, ok: true })
    } catch {
      setCopyState({ index, ok: false })
    }
    timerRef.current = setTimeout(() => setCopyState(null), 2200)
  }

  const copied = copyState?.index === index ? copyState : null

  return (
    <section className="suneung-section" id="cheer" aria-labelledby="ch-title" data-reveal>
      <div className="suneung-section-head">
        <h2 id="ch-title" className="suneung-section-title">
          수능 응원 문구
          <small>{TOTAL}개</small>
        </h2>
        <p className="suneung-section-desc">마음에 드는 문구를 골라 복사해 수험생에게 보내 보세요</p>
      </div>

      <figure className="ch-feature" ref={featureRef}>
        <figcaption className="ch-feature-label">
          {isToday ? '오늘의 응원' : '고른 응원'}
          <span className="suneung-num">
            {pad2(index + 1)} / {TOTAL}
          </span>
        </figcaption>
        <blockquote className="ch-quote" aria-live="polite">
          <p>{message}</p>
        </blockquote>
        <div className="ch-actions">
          <div className="ch-nav">
            <button type="button" className="ch-btn" onClick={() => move(-1)} aria-label="이전 응원 문구">
              ‹ 이전
            </button>
            <button type="button" className="ch-btn" onClick={() => move(1)} aria-label="다음 응원 문구">
              다음 ›
            </button>
          </div>
          <button type="button" className="ch-btn ch-btn--copy" onClick={copy}>
            <IconCopy />
            {copied ? (copied.ok ? '복사했습니다' : '복사하지 못했습니다') : '문구 복사하기'}
          </button>
        </div>
        <p className="suneung-sr-only" role="status">
          {copied ? (copied.ok ? '응원 문구를 복사했습니다.' : '응원 문구를 복사하지 못했습니다.') : ''}
        </p>
      </figure>

      <ol className={`ch-grid${expanded ? ' is-expanded' : ''}`} id="ch-grid">
        {CHEER_MESSAGES.map((text, i) => (
          <li key={text} className={i >= COLLAPSED_COUNT ? 'ch-more' : undefined}>
            <button
              type="button"
              className={`ch-note${i === index ? ' is-active' : ''}`}
              aria-pressed={i === index}
              onClick={() => pick(i)}
            >
              <span className="ch-no suneung-num" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <span className="ch-text">{text}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="ch-toggle-row">
        <button
          type="button"
          className="ch-toggle"
          aria-expanded={expanded}
          aria-controls="ch-grid"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? '접기' : `응원 문구 ${TOTAL}개 모두 보기`}
        </button>
      </div>
    </section>
  )
}
