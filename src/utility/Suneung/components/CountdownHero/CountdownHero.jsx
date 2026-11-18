import { forwardRef } from 'react'
import {
  WEEKDAYS,
  cohortOf,
  currentSlot,
  dLabel,
  daysUntil,
  formatDate,
  formatLongDate,
  getExam,
  kstParts,
  pad2,
  phaseOf,
  splitDuration,
} from '../../suneungDates'
import './CountdownHero.css'

function formatYmd(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${y}. ${m}. ${d}. (${weekday})`
}

function formatNow(nowMs) {
  const p = kstParts(nowMs)
  return `${p.year}. ${p.month}. ${p.day}. (${WEEKDAYS[p.weekday]}) ${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds)}`
}

function clockNote(clock) {
  if (!clock.synced) return '기기 시계 기준'
  const seconds = Math.round(Math.abs(clock.skew) / 1000)
  if (Math.abs(clock.skew) <= 1500) return '서버 시각과 맞춰 봄'
  return `기기 시계가 ${seconds}초 ${clock.skew > 0 ? '느려' : '빨라'} 서버 시각으로 보정함`
}

// 아주 먼 수능은 일 수만으로는 감이 오지 않아 「약 몇 년 몇 개월 뒤」를 함께 보여 준다.
function roughDistance(days) {
  const months = Math.round(days / 30.44)
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `약 ${months}개월 뒤`
  return rest ? `약 ${years}년 ${rest}개월 뒤` : `약 ${years}년 뒤`
}

function Tiles({ parts, units, label }) {
  return (
    <div className="cd-tiles" role="timer" aria-live="off" aria-label={label}>
      {units.map(([key, unit]) => (
        <div className="cd-tile" key={key} style={{ '--chars': Math.max(2, parts[key].toLocaleString('ko-KR').length) }}>
          <span className="cd-tile-value suneung-num">{key === 'days' ? parts[key].toLocaleString('ko-KR') : pad2(parts[key])}</span>
          <span className="cd-tile-unit">{unit}</span>
        </div>
      ))}
    </div>
  )
}

function Progress({ value, label, caption }) {
  const pct = Math.min(100, Math.max(0, value * 100))
  return (
    <div className="cd-progress">
      <div
        className="cd-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.floor(pct)}
      >
        <span className="cd-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="cd-progress-caption">{caption}</p>
    </div>
  )
}

const CountdownHero = forwardRef(function CountdownHero({ exam, now, clock, onShowNext }, ref) {
  const phase = phaseOf(exam, now)
  const days = daysUntil(exam, now)
  const cohort = cohortOf(exam, now)
  const prev = getExam(exam.academicYear - 1)

  let status = null
  let tiles = null
  let progress = null
  let tip = null

  if (phase === 'before') {
    const parts = splitDuration(exam.startMs - now)
    tiles = (
      <Tiles
        parts={parts}
        units={parts.days === 0 ? [['hours', '시간'], ['minutes', '분'], ['seconds', '초']] : [['days', '일'], ['hours', '시간'], ['minutes', '분'], ['seconds', '초']]}
        label={`1교시 시작까지 ${parts.days}일 ${parts.hours}시간 ${parts.minutes}분 남음`}
      />
    )
    status = <p className="cd-status">1교시 시작까지</p>

    if (now >= prev.startMs) {
      const value = (now - prev.startMs) / (exam.startMs - prev.startMs)
      progress = (
        <Progress
          value={value}
          label="지난 수능부터 지난 시간"
          caption={
            <>
              지난 수능({formatDate(prev, { withWeekday: false })})부터{' '}
              <strong className="suneung-num">{(Math.floor(value * 1000) / 10).toFixed(1)}%</strong> 지났습니다
            </>
          }
        />
      )
    } else {
      progress = <p className="cd-distance">{roughDistance(days)}</p>
    }

    if (days === 1) tip = '내일이 수능입니다. 수험표와 신분증을 미리 챙기고 일찍 잠자리에 드세요.'
    if (days === 0) {
      const checkin = exam.timetable?.find((slot) => slot.kind === 'checkin')
      if (checkin && now < checkin.startMs) {
        tip = `오늘은 수능 날입니다. ${checkin.start}까지 시험실에 들어가야 합니다.`
      } else {
        tip = '입실이 끝났습니다. 08:40에 1교시 국어가 시작됩니다.'
      }
    }
  } else if (phase === 'during') {
    const { current, next } = currentSlot(exam, now)
    const until = current ? current.endMs : exam.endMs
    const parts = splitDuration(until - now)
    const isExam = current?.kind === 'exam'

    status = (
      <p className="cd-status cd-status--live">
        <span className="cd-live-dot" aria-hidden="true" />
        {current
          ? isExam
            ? `지금 ${current.period} ${current.title} · ${current.end} 종료까지`
            : `${current.title} · ${next ? `${next.period ?? ''} ${next.title} ${next.start} 시작까지` : '종료까지'}`
          : '시험 진행 중 · 예상 종료 17:45까지'}
      </p>
    )
    tiles = <Tiles parts={parts} units={[['hours', '시간'], ['minutes', '분'], ['seconds', '초']]} label={`${parts.hours}시간 ${parts.minutes}분 남음`} />
    progress = (
      <Progress
        value={(now - exam.startMs) / (exam.endMs - exam.startMs)}
        label="오늘 시험 진행률"
        caption="1교시 08:40부터 마지막 교시 17:45까지의 진행률"
      />
    )
  } else {
    status = <p className="cd-status">모든 시험이 끝났습니다</p>
    tiles = <p className="cd-finished">수험생 여러분, 수고하셨습니다.</p>
    progress = onShowNext ? (
      <button type="button" className="cd-next" onClick={onShowNext}>
        다음 수능 카운트다운 보기 →
      </button>
    ) : null
  }

  return (
    <section className="cd-hero" aria-labelledby="cd-title" ref={ref} tabIndex={-1}>
      <article className="cd-ticket">
        <header className="cd-top">
          <span className={`suneung-badge ${exam.confirmed ? 'suneung-badge--confirmed' : 'suneung-badge--estimated'}`}>
            {exam.confirmed ? '확정' : '예상'}
          </span>
          <span className="cd-source">{exam.confirmed ? '교육부 발표 시행일' : '최근 시행일 규칙으로 계산한 날짜'}</span>
          <span className="cd-serial suneung-num" aria-hidden="true">
            No. {exam.academicYear}
          </span>
        </header>

        <div className="cd-body">
          <div className="cd-ident">
            <p className="cd-kicker">{exam.academicYear}학년도</p>
            <h1 id="cd-title" className="cd-title">
              <span className="suneung-sr-only">{exam.academicYear}학년도 </span>
              대학수학능력시험
            </h1>
            <p className="cd-date">
              {formatLongDate(exam)}
              <span className="cd-date-sep" aria-hidden="true">·</span>
              <span className="cd-date-time">1교시 08:40</span>
            </p>
            <p className="cd-d suneung-num" style={{ '--d-len': dLabel(days).length }}>
              {dLabel(days)}
            </p>
          </div>

          <div className="cd-clock">
            {status}
            {tiles}
            {progress}
          </div>
        </div>

        {tip && <p className="cd-tip">{tip}</p>}

        <div className="cd-perf" aria-hidden="true" />

        <dl className="cd-facts">
          <div>
            <dt>응시 세대</dt>
            <dd>
              {cohort.birthYear}년생 · {cohort.inSchool ? `지금 ${cohort.gradeLabel}` : cohort.gradeLabel}
            </dd>
          </div>
          <div>
            <dt>성적 통지</dt>
            <dd>{exam.scoreDate ? formatYmd(exam.scoreDate) : '발표 전'}</dd>
          </div>
          <div>
            <dt>참고</dt>
            <dd>{exam.note ?? (exam.confirmed ? '—' : '교육부 발표 후 바뀔 수 있음')}</dd>
          </div>
        </dl>
      </article>

      <p className="cd-now">
        <span>현재 한국 시간</span>
        <time className="suneung-num" dateTime={new Date(now).toISOString()}>
          {formatNow(now)}
        </time>
        <span className="cd-now-note">{clockNote(clock)}</span>
      </p>
    </section>
  )
})

export default CountdownHero
