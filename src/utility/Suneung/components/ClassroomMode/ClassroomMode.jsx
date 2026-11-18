import { useEffect, useRef, useState } from 'react'
import Logo from '../Logo/Logo'
import { CHEER_MESSAGES } from '../CheerSection/cheerMessages'
import { WEEKDAYS, dLabel, daysUntil, formatLongDate, kstParts, pad2, phaseOf, splitDuration } from '../../suneungDates'
import './ClassroomMode.css'

const ROTATE_MS = 12000

// 교실·독서실 화면에 띄워 두는 전체 화면 D-Day. 응원 문구가 12초마다 바뀐다.
export default function ClassroomMode({ open, onClose, exam, now }) {
  const dialogRef = useRef(null)
  const [cheer, setCheer] = useState(() => Math.floor(Math.random() * CHEER_MESSAGES.length))

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.requestFullscreen?.().catch(() => {})
    }
    if (!open && dialog.open) dialog.close()
    return undefined
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const id = setInterval(() => setCheer((i) => (i + 1) % CHEER_MESSAGES.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [open])

  const close = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    onClose()
  }

  const phase = phaseOf(exam, now)
  const days = daysUntil(exam, now)
  const parts = splitDuration(exam.startMs - now)
  const p = kstParts(now)

  return (
    <dialog
      ref={dialogRef}
      className="cm"
      aria-labelledby="cm-title"
      onClose={() => {
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
        onClose()
      }}
    >
      {open && (
        <div className="cm-inner">
          <header className="cm-top">
            <span className="cm-brand">
              <Logo size={30} /> 수능 D-Day 타이머
            </span>
            <span className="cm-clock suneung-num">
              {p.month}월 {p.day}일 ({WEEKDAYS[p.weekday]}) {pad2(p.hours)}:{pad2(p.minutes)}:{pad2(p.seconds)}
            </span>
            <button type="button" className="cm-close" onClick={close}>
              닫기 <kbd>Esc</kbd>
            </button>
          </header>

          <div className="cm-main">
            <p id="cm-title" className="cm-kicker">
              {exam.academicYear}학년도 대학수학능력시험 · {formatLongDate(exam)}
            </p>
            <p className="cm-d suneung-num">{dLabel(days)}</p>
            {phase === 'before' ? (
              <p className="cm-count suneung-num">
                {parts.days > 0 && (
                  <>
                    <b>{parts.days.toLocaleString('ko-KR')}</b>일{' '}
                  </>
                )}
                <b>{pad2(parts.hours)}</b>:<b>{pad2(parts.minutes)}</b>:<b>{pad2(parts.seconds)}</b>
              </p>
            ) : (
              <p className="cm-count">{phase === 'during' ? '시험 진행 중 · 끝까지 힘내세요!' : '수험생 여러분, 수고하셨습니다.'}</p>
            )}
          </div>

          <blockquote className="cm-cheer" key={cheer}>
            <p>{CHEER_MESSAGES[cheer]}</p>
          </blockquote>
        </div>
      )}
    </dialog>
  )
}
