import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Seo from '../../../../components/Seo/Seo'
import { SEO_DATA } from '../../../../seoData'
import CountdownHero from '../../components/CountdownHero/CountdownHero'
import Timetable from '../../components/Timetable/Timetable'
import UpcomingList from '../../components/UpcomingList/UpcomingList'
import ExamFinder from '../../components/ExamFinder/ExamFinder'
import { useClockOffset, useNow } from '../../useKstClock'
import {
  MAX_YEARS_AHEAD,
  dLabel,
  daysUntil,
  examsWithinYears,
  getExam,
  kstParts,
  upcomingAcademicYear,
} from '../../suneungDates'
import './HomePage.css'

const PATH = '/utility/suneung'

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export default function HomePage() {
  const clock = useClockOffset()
  const now = useNow(clock.offset)
  const [params, setParams] = useSearchParams()
  const heroRef = useRef(null)

  // 시험 당일 5교시가 끝난 뒤에도 그날 자정까지는 오늘 수능의 「수고하셨습니다」를 기본으로 보여 준다.
  const upcoming = upcomingAcademicYear(now)
  const endedToday = daysUntil(getExam(upcoming - 1), now) === 0
  const defaultYear = endedToday ? upcoming - 1 : upcoming
  const maxYear = kstParts(now).year + MAX_YEARS_AHEAD

  const requested = Number(params.get('year'))
  const selectedYear =
    Number.isInteger(requested) && requested >= defaultYear && requested <= maxYear ? requested : defaultYear

  const exam = getExam(selectedYear)
  const exams = examsWithinYears(now)
  const listedUntil = exams[exams.length - 1].academicYear

  const select = useCallback(
    (year) => {
      setParams(year === defaultYear ? {} : { year: String(year) }, { replace: true })
      const hero = heroRef.current
      if (!hero) return
      hero.focus({ preventScroll: true })
      hero.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    },
    [defaultYear, setParams],
  )

  return (
    <div className="sn-page">
      <Seo
        title={`${dLabel(daysUntil(exam, now))} · ${exam.academicYear}학년도 수능 카운트다운`}
        description={SEO_DATA[PATH].description}
        path={PATH}
      />

      <p className="sn-eyebrow">수능 D-day · 한국 시간 기준 실시간 카운트다운</p>

      <CountdownHero
        ref={heroRef}
        exam={exam}
        now={now}
        clock={clock}
        onShowNext={endedToday && selectedYear === defaultYear ? () => select(upcoming) : null}
      />

      <Timetable exam={exam} now={now} />

      <UpcomingList exams={exams} now={now} selectedYear={selectedYear} onSelect={select} />

      <ExamFinder
        now={now}
        minYear={defaultYear}
        maxYear={maxYear}
        listedUntil={listedUntil}
        selectedYear={selectedYear}
        onSelect={select}
      />

      <section className="suneung-section sn-notes" aria-labelledby="sn-notes-title">
        <div className="suneung-section-head">
          <h2 id="sn-notes-title" className="suneung-section-title">
            날짜와 시간은 이렇게 정했습니다
          </h2>
        </div>
        <dl className="sn-notes-list">
          <div>
            <dt>
              <span className="suneung-badge suneung-badge--confirmed">확정</span>
            </dt>
            <dd>
              교육부가 발표한 시행일입니다. 2027학년도는 2026년 11월 19일, 2028학년도는 2027년 11월 18일이며 성적
              통지일도 발표된 날짜를 씁니다.
            </dd>
          </div>
          <div>
            <dt>
              <span className="suneung-badge suneung-badge--estimated">예상</span>
            </dt>
            <dd>
              아직 발표되지 않은 학년도는 계산한 날짜입니다. 2016년 시행부터 처음 계획된 수능은 모두 11월 13~19일
              사이의 목요일이었으므로 그 규칙을 따릅니다. 실제 날짜는 매년 교육부 발표로 확정되며 달라질 수 있습니다.
            </dd>
          </div>
          <div>
            <dt>시간</dt>
            <dd>
              모든 시각은 기기 시간대와 상관없이 한국 표준시(KST, UTC+9) 기준입니다. 카운트다운은 1교시 국어가
              시작하는 08:40까지, 시험 당일에는 마지막 교시가 끝나는 17:45까지 셉니다. 기기 시계가 틀려 있으면 서버
              시각으로 맞춥니다.
            </dd>
          </div>
          <div>
            <dt>응시 세대</dt>
            <dd>
              조기·유예 입학 없이 제때 입학해 고3에 시험을 보는 경우입니다(학년도 − 19 = 출생연도). 학년은 3월에
              바뀌는 것으로 계산합니다.
            </dd>
          </div>
        </dl>
        <p className="sn-sources">
          공식 안내:{' '}
          <a href="https://www.moe.go.kr" target="_blank" rel="noopener noreferrer">
            교육부
          </a>
          {' · '}
          <a href="https://www.suneung.re.kr" target="_blank" rel="noopener noreferrer">
            한국교육과정평가원 수능 누리집
          </a>
        </p>
      </section>
    </div>
  )
}
