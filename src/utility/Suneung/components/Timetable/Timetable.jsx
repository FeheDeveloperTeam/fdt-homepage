import { daysUntil } from '../../suneungDates'
import './Timetable.css'

const STATE_LABEL = { past: '끝남', current: '진행 중' }

export default function Timetable({ exam, now }) {
  const isExamDay = daysUntil(exam, now) === 0

  return (
    <section className="suneung-section" aria-labelledby="tt-title">
      <div className="suneung-section-head">
        <h2 id="tt-title" className="suneung-section-title">
          시험 당일 시간표
          <small>{exam.academicYear}학년도</small>
        </h2>
        <p className="suneung-section-desc">
          {exam.timetable
            ? isExamDay
              ? '지금 진행 중인 교시를 표시합니다'
              : '시행세부계획 기준 · 한국 시간'
            : '아직 발표되지 않았습니다'}
        </p>
      </div>

      {exam.timetable ? (
        <ol className="tt-list">
          {exam.timetable.map((slot) => {
            let state = 'upcoming'
            if (isExamDay && now >= slot.endMs) state = 'past'
            else if (isExamDay && now >= slot.startMs) state = 'current'

            return (
              <li
                key={slot.id}
                className={`tt-row tt-row--${slot.kind} is-${state}`}
                aria-current={state === 'current' ? 'time' : undefined}
              >
                <span className="tt-time suneung-num">
                  {slot.kind === 'checkin' ? `${slot.start}까지` : `${slot.start}–${slot.end}`}
                </span>
                <span className="tt-main">
                  {slot.period && <span className="tt-period">{slot.period}</span>}
                  <span className="tt-name">{slot.title}</span>
                  {slot.detail && <span className="tt-detail">{slot.detail}</span>}
                </span>
                <span className="tt-side">
                  {STATE_LABEL[state] ? (
                    <span className={`tt-state tt-state--${state}`}>{STATE_LABEL[state]}</span>
                  ) : (
                    slot.minutes && <span className="tt-minutes suneung-num">{slot.minutes}분</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="tt-empty">
          <p>
            {exam.academicYear}학년도 시간표는 교육부·한국교육과정평가원 발표 전입니다. 카운트다운은 수십 년째 같은
            시각인 <strong>1교시 08:40</strong>을 기준으로 셉니다.
          </p>
        </div>
      )}
    </section>
  )
}
