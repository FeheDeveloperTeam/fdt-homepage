import { createContext, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MAX_YEARS_AHEAD, daysUntil, getExam, kstParts, upcomingAcademicYear } from './suneungDates'

// 서브앱 전체가 같은 1초 시계를 쓰도록 SuneungApp이 제공한다({ now, clock }).
export const ClockContext = createContext({ now: Date.now(), clock: { offset: 0, synced: false, skew: null } })

export function useClock() {
  return useContext(ClockContext)
}

// 주소의 ?year=<학년도>와 지금 시각으로 보여 줄 수능을 정한다. 페이지와 따라오는 푸터가 함께 쓴다.
// 시험 당일 5교시가 끝난 뒤에도 그날 자정까지는 오늘 수능의 「수고하셨습니다」를 기본으로 보여 준다.
export function useSelectedExam(now) {
  const [params, setParams] = useSearchParams()
  const upcoming = upcomingAcademicYear(now)
  const endedToday = daysUntil(getExam(upcoming - 1), now) === 0
  const defaultYear = endedToday ? upcoming - 1 : upcoming
  const maxYear = kstParts(now).year + MAX_YEARS_AHEAD

  const requested = Number(params.get('year'))
  const selectedYear =
    Number.isInteger(requested) && requested >= defaultYear && requested <= maxYear ? requested : defaultYear

  return {
    upcoming,
    endedToday,
    defaultYear,
    maxYear,
    selectedYear,
    exam: getExam(selectedYear),
    setParams,
  }
}
