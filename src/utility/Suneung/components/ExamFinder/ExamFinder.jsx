import { useId, useState } from 'react'
import { cohortOf, dLabel, daysUntil, formatDate, getExam, kstParts } from '../../suneungDates'
import './ExamFinder.css'

const MODES = [
  { key: 'year', label: '학년도로 찾기', unit: '학년도', hint: '대학에 들어가는 해. 시험은 그 전해 11월에 봅니다.' },
  { key: 'birth', label: '출생연도로 찾기', unit: '년생', hint: '제때 입학해 고3에 보는 수능을 찾습니다.' },
]

const JUMPS = [20, 30, 50]

// 10년 목록 너머의 수능을 학년도나 출생연도로 직접 골라 보는 칸.
export default function ExamFinder({ now, minYear, maxYear, listedUntil, selectedYear, onSelect }) {
  const inputId = useId()
  const hintId = useId()
  const thisYear = kstParts(now).year
  const [mode, setMode] = useState('year')
  const [value, setValue] = useState(String(listedUntil + 1))

  const current = MODES.find((m) => m.key === mode)
  const offset = mode === 'birth' ? 19 : 0
  const inputMin = minYear - offset
  const inputMax = maxYear - offset

  const parsed = /^\d{4}$/.test(value.trim()) ? Number(value.trim()) : null
  const target = parsed === null ? null : parsed + offset

  let error = null
  if (value.trim() === '') error = null
  else if (parsed === null) error = '네 자리 연도로 입력해 주세요.'
  else if (target < minYear) {
    error =
      mode === 'birth'
        ? `${parsed}년생의 수능은 이미 끝났습니다(${target - 1}년 시행). ${inputMin}년생부터 찾을 수 있습니다.`
        : `${target}학년도 수능은 이미 끝났습니다. ${minYear}학년도부터 찾을 수 있습니다.`
  } else if (target > maxYear) {
    error = `${mode === 'birth' ? `${inputMax}년생` : `${maxYear}학년도`}까지 찾을 수 있습니다.`
  }

  const exam = target !== null && !error ? getExam(target) : null

  const switchMode = (key) => {
    if (key === mode) return
    // 같은 수능을 가리키도록 입력값을 바꿔 준다.
    if (parsed !== null) setValue(String(key === 'birth' ? parsed - 19 : parsed + 19))
    setMode(key)
  }

  const step = (delta) => {
    const base = parsed ?? (mode === 'birth' ? listedUntil + 1 - 19 : listedUntil + 1)
    setValue(String(Math.min(inputMax, Math.max(inputMin, base + delta))))
  }

  return (
    <section className="suneung-section" aria-labelledby="ef-title">
      <div className="suneung-section-head">
        <h2 id="ef-title" className="suneung-section-title">
          더 먼 수능 찾기
        </h2>
        <p className="suneung-section-desc">
          10년 뒤보다 먼 수능도 {maxYear}학년도까지 볼 수 있습니다
        </p>
      </div>

      <div className="ef-panel">
        <div className="ef-modes" role="group" aria-label="찾는 방법">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={mode === m.key}
              className={`ef-mode${mode === m.key ? ' is-active' : ''}`}
              onClick={() => switchMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form
          className="ef-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (exam) onSelect(exam.academicYear)
          }}
        >
          <label className="ef-label" htmlFor={inputId}>
            {mode === 'birth' ? '출생연도' : '학년도'}
          </label>
          <div className="ef-field">
            <button type="button" className="ef-step" aria-label="1 줄이기" onClick={() => step(-1)}>
              −
            </button>
            <input
              id={inputId}
              className="ef-input suneung-num"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={value}
              aria-describedby={hintId}
              aria-invalid={error ? true : undefined}
              onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, ''))}
            />
            <span className="ef-unit">{current.unit}</span>
            <button type="button" className="ef-step" aria-label="1 늘리기" onClick={() => step(1)}>
              +
            </button>
          </div>

          {mode === 'year' && (
            <div className="ef-jumps" aria-label="빠르게 고르기">
              {JUMPS.map((years) => {
                const year = thisYear + years + 1
                if (year > maxYear) return null
                return (
                  <button key={years} type="button" className="ef-jump" onClick={() => setValue(String(year))}>
                    {years}년 뒤
                  </button>
                )
              })}
            </div>
          )}

          <p id={hintId} className={`ef-hint${error ? ' is-error' : ''}`} role={error ? 'alert' : undefined}>
            {error ?? current.hint}
          </p>

          {exam && (
            <div className="ef-result" aria-live="polite">
              <div className="ef-result-main">
                <p className="ef-result-title">
                  <strong className="suneung-num">{exam.academicYear}</strong>학년도 수능
                  <span className={`suneung-badge ${exam.confirmed ? 'suneung-badge--confirmed' : 'suneung-badge--estimated'}`}>
                    {exam.confirmed ? '확정' : '예상'}
                  </span>
                </p>
                <p className="ef-result-date suneung-num">
                  {formatDate(exam)} · <strong>{dLabel(daysUntil(exam, now))}</strong>
                </p>
                <p className="ef-result-cohort">
                  {(() => {
                    const cohort = cohortOf(exam, now)
                    return `${cohort.birthYear}년생 · ${cohort.inSchool ? `지금 ${cohort.gradeLabel}` : cohort.gradeLabel}`
                  })()}
                  {exam.academicYear <= listedUntil && ' · 위 10년 목록에도 있습니다'}
                </p>
              </div>
              <button type="submit" className="ef-go" disabled={exam.academicYear === selectedYear}>
                {exam.academicYear === selectedYear ? '카운트다운 중' : '이 수능으로 카운트다운'}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
