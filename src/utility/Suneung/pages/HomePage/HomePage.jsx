import { useCallback, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Seo from '../../../../components/Seo/Seo'
import { SEO_DATA, SITE_URL } from '../../../../seoData'
import CountdownHero from '../../components/CountdownHero/CountdownHero'
import Timetable from '../../components/Timetable/Timetable'
import UpcomingList from '../../components/UpcomingList/UpcomingList'
import ExamFinder from '../../components/ExamFinder/ExamFinder'
import CheerSection from '../../components/CheerSection/CheerSection'
import Faq from '../../components/Faq/Faq'
import SidePanel from '../../components/SidePanel/SidePanel'
import PracticeTimer from '../../components/PracticeTimer/PracticeTimer'
import ClassroomMode from '../../components/ClassroomMode/ClassroomMode'
import WallpaperMaker from '../../components/WallpaperMaker/WallpaperMaker'
import { prefersReducedMotion, useReveal } from '../../useMotion'
import { SUNEUNG_PATH, suneungFaq } from '../../suneungSeo'
import { useClock, useSelectedExam } from '../../suneungState'
import { dLabel, daysUntil, examsWithinYears, getExam } from '../../suneungDates'
import './HomePage.css'

const PATH = SUNEUNG_PATH

export default function HomePage() {
  const { now, clock } = useClock()
  const { upcoming, endedToday, defaultYear, maxYear, selectedYear, exam, setParams } = useSelectedExam(now)
  const heroRef = useRef(null)
  const pageRef = useRef(null)
  const [dialog, setDialog] = useState(null)
  useReveal(pageRef)

  const exams = examsWithinYears(now)
  const listedUntil = exams[exams.length - 1].academicYear

  // FAQ와 구조화 데이터는 가장 가까운 수능이 바뀔 때만 다시 만든다.
  const faq = useMemo(() => suneungFaq(getExam(upcoming).startMs - 1), [upcoming])
  const structuredData = useMemo(
    () =>
      JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: '수능 D-Day 타이머',
          alternateName: ['수능 디데이', '수능 카운트다운', '수능 타이머'],
          url: `${SITE_URL}${PATH}`,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          inLanguage: 'ko-KR',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
          publisher: { '@type': 'Organization', name: 'FeheDeveloperTeam', url: SITE_URL },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      ]),
    [faq],
  )

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
    <div className="sn-page" ref={pageRef}>
      <Seo
        title={`수능 ${dLabel(daysUntil(exam, now))} 타이머 · ${exam.academicYear} 수능 디데이`}
        description={SEO_DATA[PATH].description}
        path={PATH}
      />
      <Helmet>
        <script type="application/ld+json">{structuredData}</script>
      </Helmet>

      <header className="sn-head" data-reveal>
        <h1 className="sn-title">수능 D-Day 타이머</h1>
        <p className="sn-lead">
          {exam.academicYear}학년도 수능 디데이를 한국 시간 기준으로 초 단위까지 셉니다
        </p>
      </header>

      <div className="sn-top" id="dday">
        <CountdownHero
          ref={heroRef}
          exam={exam}
          now={now}
          clock={clock}
          onShowNext={endedToday && selectedYear === defaultYear ? () => select(upcoming) : null}
        />
        <SidePanel
          exam={exam}
          now={now}
          onOpenClassroom={() => setDialog('classroom')}
          onOpenWallpaper={() => setDialog('wallpaper')}
        />
      </div>

      <PracticeTimer />

      <div className="sn-grid">
        <Timetable exam={exam} now={now} />
        <UpcomingList exams={exams} now={now} selectedYear={selectedYear} onSelect={select} />
      </div>

      <CheerSection now={now} />

      <div className="sn-grid sn-grid--paired">
        <ExamFinder
          now={now}
          minYear={defaultYear}
          maxYear={maxYear}
          listedUntil={listedUntil}
          selectedYear={selectedYear}
          onSelect={select}
        />
        <Faq items={faq} />
      </div>

      <section className="suneung-section sn-notes" aria-labelledby="sn-notes-title" data-reveal>
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

      <ClassroomMode open={dialog === 'classroom'} onClose={() => setDialog(null)} exam={exam} now={now} />
      <WallpaperMaker open={dialog === 'wallpaper'} onClose={() => setDialog(null)} exam={exam} now={now} />
    </div>
  )
}
