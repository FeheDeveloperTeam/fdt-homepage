// 수능 카운트다운의 검색용 문장. 서버 렌더(api/_lib/seoRender.js → src/seoData.js)와 화면의 FAQ가
// 같은 문장을 쓰도록 여기 한 곳에서 만든다. 연도는 요청 시점의 가장 가까운 수능으로 자동으로 바뀐다.
// 노출이 많은 검색어(수능 디데이, 수능 D-Day, 수능 타이머, 수능 카운트다운, 2027 수능, 수능 시간표,
// 수능 응원 문구)를 제목·설명·본문 제목에 자연스러운 문장으로 넣는다.
import { formatLongDate, getExam, upcomingAcademicYear } from './suneungDates.js'

export const SUNEUNG_PATH = '/utility/suneung'

export function suneungSeo(nowMs = Date.now()) {
  const exam = getExam(upcomingAcademicYear(nowMs))
  const year = exam.academicYear
  return {
    title: `수능 D-Day 타이머 · ${year} 수능 디데이 카운트다운`,
    description:
      `${year}학년도 수능(${exam.examYear}년 ${exam.month}월 ${exam.day}일)까지 남은 시간을 한국 시간 기준으로 ` +
      '초 단위까지 세는 수능 디데이 타이머입니다. 수능 시간표, 앞으로 10년의 수능 날짜, 수능 응원 문구 30개를 함께 볼 수 있습니다.',
  }
}

function dateSentence(exam) {
  return exam.confirmed
    ? `${exam.academicYear}학년도 대학수학능력시험은 ${formatLongDate(exam)}에 치러집니다. 교육부가 발표한 날짜입니다.`
    : `${exam.academicYear}학년도 대학수학능력시험은 ${formatLongDate(exam)}로 예상됩니다. 아직 교육부 발표 전이라 최근 시행일 규칙으로 계산한 날짜입니다.`
}

function formatYmdLong(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일`
}

// 자주 묻는 질문. 화면에 그대로 보이고 FAQPage 구조화 데이터로도 쓴다.
export function suneungFaq(nowMs = Date.now()) {
  const exam = getExam(upcomingAcademicYear(nowMs))
  const next = getExam(exam.academicYear + 1)

  return [
    {
      q: `${exam.academicYear} 수능 날짜는 언제인가요?`,
      a: dateSentence(exam),
    },
    {
      q: `${next.academicYear} 수능은 언제인가요?`,
      a: dateSentence(next),
    },
    {
      q: '수능은 몇 시에 시작하고 몇 시에 끝나나요?',
      a: '오전 8시 10분까지 시험실에 들어가야 하고, 1교시 국어가 8시 40분에 시작합니다. 4교시 한국사·탐구는 16시 37분에, 제2외국어/한문을 선택한 수험생의 5교시는 17시 45분에 끝납니다.',
    },
    {
      q: '수능 성적은 언제 나오나요?',
      a: exam.scoreDate
        ? `${exam.academicYear}학년도 수능 성적은 ${formatYmdLong(exam.scoreDate)}에 수험생에게 통지됩니다.`
        : '수능 성적은 보통 시험 뒤 3~4주 무렵 통지되며, 정확한 날짜는 교육부 시행계획에서 발표됩니다.',
    },
    {
      q: '수능 D-Day는 어떻게 계산하나요?',
      a: '한국 날짜 기준으로 오늘부터 시험일까지 남은 날 수가 D-Day 숫자이고, 시험 당일이 D-DAY입니다. 수능 타이머는 1교시가 시작하는 오전 8시 40분까지 남은 시간을 초 단위로 셉니다.',
    },
    {
      q: '수능 날 꼭 챙겨야 할 것은 무엇인가요?',
      a: '수험표와 신분증은 반드시 챙겨야 합니다. 휴대전화·스마트워치 같은 전자기기는 시험실에 가지고 들어갈 수 없으므로 집에 두고 가거나 1교시 시작 전에 제출해야 합니다.',
    },
  ]
}
