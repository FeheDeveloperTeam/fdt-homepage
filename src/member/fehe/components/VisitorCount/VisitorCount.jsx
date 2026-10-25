import { useEffect, useState } from 'react'
import { callRpc, isSupabaseConfigured } from '../../supabase'
import './VisitorCount.css'

/*
  오늘의 방문자 수. Supabase의 fehe_daily_visitors(한국 날짜 기준)에 센다.
  테이블·함수 정의는 supabase/fehe_visitors.sql.

  - 같은 브라우저는 하루에 한 번만 센다(localStorage에 오늘 한국 날짜를 기록).
  - 페이지를 보고 있는 동안 1분마다 다시 읽어 숫자를 갱신한다(탭이 가려져 있으면 쉰다).
  - 환경 변수가 없거나 호출이 실패하면 아무것도 그리지 않는다(빈 0을 보여 주지 않는다).
*/
const SEEN_KEY = 'fehe-visit-day'
const REFRESH_MS = 60_000

function todayInKorea() {
  // en-CA 형식이 YYYY-MM-DD라 DB가 정하는 한국 날짜와 같은 문자열이 된다
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function alreadyCounted(day) {
  try {
    return localStorage.getItem(SEEN_KEY) === day
  } catch {
    return false
  }
}

function markCounted(day) {
  try {
    localStorage.setItem(SEEN_KEY, day)
  } catch {
    /* 저장이 막힌 브라우저는 새로 열 때마다 셀 수 있지만 표시는 정상 동작한다 */
  }
}

/*
  한 번 페이지를 불러온 동안 「오늘 방문 +1」 요청은 딱 한 번만 보낸다.
  컴포넌트가 다시 마운트되거나(개발 모드의 StrictMode, 페이지 이동 후 복귀) 첫 응답이 오기 전에
  또 실행돼도 같은 요청을 함께 기다리게 해서 두 번 세지 않는다.
*/
let visitRequest = null

function countVisitOnce(day) {
  if (!visitRequest) {
    visitRequest = callRpc('fehe_count_visit').then(
      (value) => {
        markCounted(day)
        return value
      },
      (error) => {
        visitRequest = null // 실패하면 다음에 다시 시도할 수 있게 비운다
        throw error
      },
    )
  }
  return visitRequest
}

export default function VisitorCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    const controller = new AbortController()
    const { signal } = controller
    let timer = 0

    async function refresh() {
      if (document.hidden) return
      try {
        const value = await callRpc('fehe_visitors_today', {}, { signal })
        if (typeof value === 'number') setCount(value)
      } catch {
        /* 다음 갱신 때 다시 시도한다 */
      }
    }

    ;(async () => {
      const day = todayInKorea()
      try {
        if (alreadyCounted(day) && !visitRequest) {
          await refresh()
        } else {
          // 중단(abort)으로 끊으면 서버에선 이미 셌는데 기록이 안 남을 수 있어 signal을 걸지 않는다
          const value = await countVisitOnce(day)
          if (!signal.aborted && typeof value === 'number') setCount(value)
        }
      } catch {
        return
      }
      if (!signal.aborted) timer = setInterval(refresh, REFRESH_MS)
    })()

    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [])

  if (count === null) return null

  return (
    <p className="visitor-count" aria-live="polite">
      <span className="visitor-count-dot" aria-hidden="true" />
      오늘 방문자 <strong>{count.toLocaleString('ko-KR')}</strong>명
    </p>
  )
}
