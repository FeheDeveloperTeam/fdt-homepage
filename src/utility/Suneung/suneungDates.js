// 수능 날짜·시각 계산. 모든 계산은 기기 시간대와 상관없이 한국 표준시(KST, UTC+9) 기준이다.
// 한국은 서머타임이 없어 고정 오프셋으로 충분하다.

export const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 1교시 국어 시작 시각과 마지막 교시(5교시) 종료 시각. 수십 년째 같은 시각이라
// 시간표가 아직 나오지 않은 학년도도 이 시각으로 센다.
export const EXAM_START = { h: 8, m: 40 }
export const EXAM_END = { h: 17, m: 45 }

// 2027학년도 시행세부계획(2026. 7.) 기준 시간표. 영역별 문항 수·시험 시간이 전년도와 같다.
const TIMETABLE_CURRENT = [
  { id: 'checkin', kind: 'checkin', title: '시험실 입실 완료', start: '08:10', end: '08:40', detail: '이후에는 입실할 수 없습니다' },
  { id: 'p1', kind: 'exam', period: '1교시', title: '국어', start: '08:40', end: '10:00', minutes: 80, detail: '45문항' },
  { id: 'b1', kind: 'break', title: '휴식', start: '10:00', end: '10:30' },
  { id: 'p2', kind: 'exam', period: '2교시', title: '수학', start: '10:30', end: '12:10', minutes: 100, detail: '30문항' },
  { id: 'lunch', kind: 'break', title: '점심시간', start: '12:10', end: '13:10' },
  { id: 'p3', kind: 'exam', period: '3교시', title: '영어', start: '13:10', end: '14:20', minutes: 70, detail: '45문항 · 듣기 17문항은 시작부터 약 25분' },
  { id: 'b3', kind: 'break', title: '휴식', start: '14:20', end: '14:50' },
  { id: 'p4', kind: 'exam', period: '4교시', title: '한국사 · 탐구', start: '14:50', end: '16:37', minutes: 107, detail: '한국사 14:50–15:20 · 탐구 첫 과목 15:35–16:05 · 둘째 과목 16:07–16:37' },
  { id: 'b4', kind: 'break', title: '휴식', start: '16:37', end: '17:05' },
  { id: 'p5', kind: 'exam', period: '5교시', title: '제2외국어 / 한문', start: '17:05', end: '17:45', minutes: 40, detail: '30문항 · 선택한 수험생만' },
]

// 교육부가 발표한 시행일. 키는 학년도(대학 입학 연도)이고 시험은 그 전해 11월에 치른다.
// 새 발표가 나오면 여기에 한 줄 추가한다. 나머지 학년도는 estimateExamDate 규칙으로 계산한다.
const CONFIRMED = {
  2025: { date: '2024-11-14' },
  2026: { date: '2025-11-13' },
  2027: {
    date: '2026-11-19',
    scoreDate: '2026-12-11',
    timetable: TIMETABLE_CURRENT,
    note: '현행 체제로 치르는 마지막 수능',
  },
  2028: {
    date: '2027-11-18',
    scoreDate: '2027-12-10',
    note: '국어·수학·탐구 선택과목을 없앤 첫 통합형 수능',
  },
}

// 2016년 시행(2017학년도)부터 처음 계획된 시행일은 모두 11월 13~19일 사이의 목요일이었다
// (지진으로 미뤄진 2017년, 코로나19로 미뤄진 2020년도 원래 계획일은 이 범위). 이 규칙으로 예상 날짜를 낸다.
export function estimateExamDate(examYear) {
  for (let day = 13; day <= 19; day += 1) {
    if (new Date(Date.UTC(examYear, 10, day)).getUTCDay() === 4) return { month: 11, day }
  }
  return { month: 11, day: 19 }
}

// 한국 시각의 연·월·일·시·분을 실제 순간(ms)으로 바꾼다.
export function kstToMs(year, month, day, h = 0, m = 0) {
  return Date.UTC(year, month - 1, day, h, m) - KST_OFFSET_MS
}

// 순간(ms)을 한국 시각의 각 자리로 나눈다.
export function kstParts(ms) {
  const d = new Date(ms + KST_OFFSET_MS)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
    seconds: d.getUTCSeconds(),
  }
}

function hmToMs(exam, hm) {
  const [h, m] = hm.split(':').map(Number)
  return kstToMs(exam.examYear, exam.month, exam.day, h, m)
}

const cache = new Map()

// 학년도 하나의 수능 정보를 돌려준다.
export function getExam(academicYear) {
  if (cache.has(academicYear)) return cache.get(academicYear)

  const examYear = academicYear - 1
  const confirmed = CONFIRMED[academicYear]
  let month
  let day
  if (confirmed) {
    ;[, month, day] = confirmed.date.split('-').map(Number)
  } else {
    ;({ month, day } = estimateExamDate(examYear))
  }

  const exam = {
    academicYear,
    examYear,
    month,
    day,
    weekday: new Date(Date.UTC(examYear, month - 1, day)).getUTCDay(),
    confirmed: Boolean(confirmed),
    note: confirmed?.note ?? null,
    scoreDate: confirmed?.scoreDate ?? null,
    startMs: kstToMs(examYear, month, day, EXAM_START.h, EXAM_START.m),
    endMs: kstToMs(examYear, month, day, EXAM_END.h, EXAM_END.m),
    timetable: null,
  }

  if (confirmed?.timetable) {
    exam.timetable = confirmed.timetable.map((slot) => ({
      ...slot,
      startMs: hmToMs(exam, slot.start),
      endMs: hmToMs(exam, slot.end),
    }))
  }

  cache.set(academicYear, exam)
  return exam
}

// 아직 끝나지 않은 가장 가까운 수능의 학년도. 시험 당일에는 5교시가 끝날 때까지 그 수능을 가리킨다.
export function upcomingAcademicYear(nowMs) {
  let year = kstParts(nowMs).year
  while (getExam(year).endMs <= nowMs) year += 1
  return year
}

// 지금부터 10년 뒤 해에 치르는 수능까지의 목록.
export function examsWithinYears(nowMs, years = 10) {
  const lastExamYear = kstParts(nowMs).year + years
  const list = []
  for (let year = upcomingAcademicYear(nowMs); year - 1 <= lastExamYear; year += 1) {
    list.push(getExam(year))
  }
  return list
}

// 한국 날짜로 오늘부터 시험일까지 남은 날 수(D-n의 n). 시험 당일은 0.
export function daysUntil(exam, nowMs) {
  const now = kstParts(nowMs)
  const today = Date.UTC(now.year, now.month - 1, now.day)
  const examDay = Date.UTC(exam.examYear, exam.month - 1, exam.day)
  return Math.round((examDay - today) / DAY_MS)
}

export function dLabel(days) {
  if (days === 0) return 'D-DAY'
  if (days > 0) return `D-${days.toLocaleString('ko-KR')}`
  return `D+${(-days).toLocaleString('ko-KR')}`
}

export function phaseOf(exam, nowMs) {
  if (nowMs < exam.startMs) return 'before'
  if (nowMs < exam.endMs) return 'during'
  return 'after'
}

// 시험 당일 지금 진행 중인 시간표 칸과 다음 칸.
export function currentSlot(exam, nowMs) {
  if (!exam.timetable) return { current: null, next: null }
  const current = exam.timetable.find((slot) => nowMs >= slot.startMs && nowMs < slot.endMs) ?? null
  const next = exam.timetable.find((slot) => slot.startMs > nowMs) ?? null
  return { current, next }
}

// 제때 입학한 학생 기준으로 이 수능을 고3으로 치르는 세대. 출생연도는 학년도 − 19.
// 학교 학년은 3월에 바뀌므로 1~2월은 지난 학년으로 본다.
export function cohortOf(exam, nowMs) {
  const now = kstParts(nowMs)
  const birthYear = exam.academicYear - 19
  const schoolYear = now.month >= 3 ? now.year : now.year - 1
  const grade = 12 - (exam.examYear - schoolYear)

  let gradeLabel
  if (grade >= 10 && grade <= 12) gradeLabel = `고${grade - 9}`
  else if (grade >= 7) gradeLabel = `중${grade - 6}`
  else if (grade >= 1) gradeLabel = `초${grade}`
  else if (birthYear > now.year) gradeLabel = '아직 태어나기 전'
  else gradeLabel = '초등학교 입학 전'

  return { birthYear, grade, gradeLabel, inSchool: grade >= 1 && grade <= 12 }
}

export function formatDate(exam, { withWeekday = true } = {}) {
  const base = `${exam.examYear}. ${exam.month}. ${exam.day}.`
  return withWeekday ? `${base} (${WEEKDAYS[exam.weekday]})` : base
}

export function formatLongDate(exam) {
  return `${exam.examYear}년 ${exam.month}월 ${exam.day}일 ${WEEKDAYS[exam.weekday]}요일`
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}

// 남은 시간(ms)을 일·시간·분·초로 나눈다.
export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export const MAX_YEARS_AHEAD = 100
