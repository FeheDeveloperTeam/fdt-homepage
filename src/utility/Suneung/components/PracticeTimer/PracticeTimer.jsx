import { useCallback, useEffect, useRef, useState } from 'react'
import { pad2 } from '../../suneungDates'
import { playBell, unlockBell } from '../../bell'
import './PracticeTimer.css'

// 영역별 시험 시간과 실제 수능 시작 시각(2027학년도 시간표 기준).
const SUBJECTS = [
  { id: 'kor', name: '국어', period: '1교시', minutes: 80, start: '08:40', note: '45문항' },
  { id: 'math', name: '수학', period: '2교시', minutes: 100, start: '10:30', note: '30문항' },
  { id: 'eng', name: '영어', period: '3교시', minutes: 70, start: '13:10', note: '45문항 · 듣기 포함' },
  { id: 'hist', name: '한국사', period: '4교시', minutes: 30, start: '14:50', note: '20문항' },
  { id: 'inq', name: '탐구 한 과목', period: '4교시', minutes: 30, start: '15:35', note: '과목당 20문항' },
  { id: 'lang', name: '제2외국어/한문', period: '5교시', minutes: 40, start: '17:05', note: '30문항' },
  { id: 'custom', name: '직접 설정', period: '자유', minutes: null, start: null, note: '1~300분' },
]

const WARNINGS = [10, 5]

function formatRemain(ms) {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`
}

// 실제 수능이라면 벽시계가 가리킬 시각(시작 시각 + 지난 시간).
function examClock(start, elapsedMs) {
  const [h, m] = start.split(':').map(Number)
  const minutes = h * 60 + m + Math.floor(elapsedMs / 60000)
  return `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`
}

function IconFullscreen() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PracticeTimer() {
  const [subjectId, setSubjectId] = useState('kor')
  const [customMinutes, setCustomMinutes] = useState('50')
  const [status, setStatus] = useState('idle')
  const [endAt, setEndAt] = useState(0)
  const [pausedRemain, setPausedRemain] = useState(null)
  const [tick, setTick] = useState(() => Date.now())
  const [soundOn, setSoundOn] = useState(true)
  const [flash, setFlash] = useState(null)
  const fired = useRef(new Set())
  const boardRef = useRef(null)
  const flashTimer = useRef(null)

  const subject = SUBJECTS.find((s) => s.id === subjectId)
  const parsedCustom = Math.min(300, Math.max(1, Number(customMinutes) || 0))
  const minutes = subject.minutes ?? parsedCustom
  const durationMs = minutes * 60000

  const remain =
    status === 'running' ? Math.max(0, endAt - tick) : status === 'done' ? 0 : pausedRemain ?? durationMs
  const elapsed = durationMs - remain
  const progress = durationMs ? remain / durationMs : 0

  const showFlash = useCallback((text, ms = 4000) => {
    clearTimeout(flashTimer.current)
    setFlash(text)
    flashTimer.current = setTimeout(() => setFlash(null), ms)
  }, [])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  // 진행 중일 때만 0.25초마다 다시 그린다.
  useEffect(() => {
    if (status !== 'running') return undefined
    const id = setInterval(() => setTick(Date.now()), 250)
    return () => clearInterval(id)
  }, [status])

  // 종료 10분·5분 전 알림과 시험 종료.
  useEffect(() => {
    if (status !== 'running') return
    if (remain <= 0) {
      setStatus('done')
      if (soundOn) playBell('end')
      showFlash('시험 종료! 펜을 내려놓으세요.', 8000)
      return
    }
    for (const min of WARNINGS) {
      if (durationMs > min * 60000 && remain <= min * 60000 && !fired.current.has(min)) {
        fired.current.add(min)
        if (soundOn) playBell('warn')
        showFlash(`종료 ${min}분 전입니다`)
      }
    }
  }, [remain, status, durationMs, soundOn, showFlash])

  const reset = useCallback(() => {
    setStatus('idle')
    setPausedRemain(null)
    setFlash(null)
    fired.current = new Set()
  }, [])

  const chooseSubject = (id) => {
    setSubjectId(id)
    reset()
  }

  const start = () => {
    unlockBell()
    const now = Date.now()
    if (status === 'idle' || status === 'done') {
      fired.current = new Set()
      setEndAt(now + durationMs)
      if (soundOn) playBell('start')
      showFlash(`${subject.name} 시작!`, 2500)
    } else {
      setEndAt(now + (pausedRemain ?? durationMs))
    }
    setTick(now)
    setPausedRemain(null)
    setStatus('running')
  }

  const pause = () => {
    setPausedRemain(Math.max(0, endAt - Date.now()))
    setStatus('paused')
  }

  const toggleFullscreen = () => {
    const board = boardRef.current
    if (!board) return
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    else board.requestFullscreen?.().catch(() => {})
  }

  const ringR = 92
  const ringC = 2 * Math.PI * ringR

  return (
    <section className="suneung-section pt" id="practice" aria-labelledby="pt-title" data-reveal>
      <div className="suneung-section-head">
        <h2 id="pt-title" className="suneung-section-title">
          수능 실전 타이머
          <small>영역별 실제 시험 시간</small>
        </h2>
        <p className="suneung-section-desc">실제 수능과 같은 시간·종소리로 모의고사를 풀어 보세요</p>
      </div>

      <div className={`pt-board is-${status}`} ref={boardRef}>
        <div className="pt-subjects" role="group" aria-label="영역 고르기">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`pt-subject${s.id === subjectId ? ' is-active' : ''}`}
              aria-pressed={s.id === subjectId}
              onClick={() => chooseSubject(s.id)}
            >
              <span className="pt-subject-period">{s.period}</span>
              <span className="pt-subject-name">{s.name}</span>
              <span className="pt-subject-min suneung-num">{s.minutes ? `${s.minutes}분` : '직접'}</span>
            </button>
          ))}
        </div>

        <div className="pt-stage">
          <div className="pt-ring-wrap">
            <svg className="pt-ring" viewBox="0 0 220 220" aria-hidden="true">
              <circle className="pt-ring-track" cx="110" cy="110" r={ringR} />
              <circle
                className="pt-ring-bar"
                cx="110"
                cy="110"
                r={ringR}
                strokeDasharray={ringC}
                strokeDashoffset={ringC * (1 - progress)}
              />
            </svg>
            <div className="pt-readout">
              <span className="pt-readout-label">
                {subject.period} {subject.name}
              </span>
              <span className="pt-time suneung-num" role="timer" aria-live="off">
                {formatRemain(remain)}
              </span>
              <span className="pt-readout-sub suneung-num">
                {status === 'idle' ? `${minutes}분 · ${subject.note}` : `지난 시간 ${Math.floor(elapsed / 60000)}분`}
              </span>
            </div>
          </div>

          <div className="pt-side">
            {subject.start ? (
              <dl className="pt-clock">
                <div>
                  <dt>실제 수능이라면 지금</dt>
                  <dd className="suneung-num">{examClock(subject.start, status === 'idle' ? 0 : elapsed)}</dd>
                </div>
                <div>
                  <dt>시작 · 종료</dt>
                  <dd className="suneung-num">
                    {subject.start} – {examClock(subject.start, durationMs)}
                  </dd>
                </div>
              </dl>
            ) : (
              <label className="pt-custom">
                <span>시험 시간(분)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  value={customMinutes}
                  disabled={status === 'running' || status === 'paused'}
                  onChange={(event) => setCustomMinutes(event.target.value.replace(/[^\d]/g, ''))}
                />
              </label>
            )}

            <div className="pt-controls">
              {status === 'running' ? (
                <button type="button" className="pt-btn pt-btn--main" onClick={pause}>
                  일시정지
                </button>
              ) : (
                <button type="button" className="pt-btn pt-btn--main" onClick={start} disabled={!minutes}>
                  {status === 'paused' ? '계속하기' : status === 'done' ? '다시 시작' : '시험 시작'}
                </button>
              )}
              <button type="button" className="pt-btn" onClick={reset} disabled={status === 'idle'}>
                처음부터
              </button>
            </div>
            <div className="pt-controls pt-controls--small">
              <button
                type="button"
                className="pt-btn pt-btn--ghost"
                aria-pressed={soundOn}
                onClick={() => {
                  unlockBell()
                  setSoundOn((v) => !v)
                }}
              >
                종소리 {soundOn ? '켬' : '끔'}
              </button>
              <button type="button" className="pt-btn pt-btn--ghost" onClick={toggleFullscreen}>
                <IconFullscreen /> 전체 화면
              </button>
            </div>
            <p className="pt-hint">시작·종료 10분 전·5분 전·종료 때 종이 울립니다.</p>
          </div>
        </div>

        <p className={`pt-flash${flash ? ' is-on' : ''}`} role="status">
          {flash ?? ''}
        </p>
      </div>
    </section>
  )
}
