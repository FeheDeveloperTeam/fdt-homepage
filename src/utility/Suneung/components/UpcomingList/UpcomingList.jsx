import { cohortOf, dLabel, daysUntil, formatDate, kstParts } from '../../suneungDates'
import './UpcomingList.css'

export default function UpcomingList({ exams, now, selectedYear, onSelect }) {
  const thisYear = kstParts(now).year

  return (
    <section className="suneung-section" id="upcoming" aria-labelledby="up-title" data-reveal>
      <div className="suneung-section-head">
        <h2 id="up-title" className="suneung-section-title">
          앞으로 10년의 수능
        </h2>
        <p className="suneung-section-desc">
          {thisYear}년부터 {thisYear + 10}년까지 {exams.length}번 · 누르면 위 카운트다운이 바뀝니다
        </p>
      </div>

      <ul className="up-list">
        {exams.map((exam) => {
          const days = daysUntil(exam, now)
          const cohort = cohortOf(exam, now)
          const selected = exam.academicYear === selectedYear

          return (
            <li key={exam.academicYear}>
              <button
                type="button"
                className={`up-row${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onSelect(exam.academicYear)}
              >
                <span className="up-year">
                  <strong className="suneung-num">{exam.academicYear}</strong>학년도
                </span>
                <span className="up-date suneung-num">
                  {formatDate(exam)}
                  <span className={`suneung-badge ${exam.confirmed ? 'suneung-badge--confirmed' : 'suneung-badge--estimated'}`}>
                    {exam.confirmed ? '확정' : '예상'}
                  </span>
                </span>
                <span className="up-cohort">
                  {cohort.birthYear}년생 · 지금 {cohort.gradeLabel}
                  {exam.note && <span className="up-note">{exam.note}</span>}
                </span>
                <span className="up-d suneung-num">{dLabel(days)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
