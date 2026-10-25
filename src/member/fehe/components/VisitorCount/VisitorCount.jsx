import { useEffect, useState } from 'react'
import './VisitorCount.css'

/*
  오늘의 방문자 수. Firebase Realtime Database의 visitors/daily/{YYYY-MM-DD}(한국 날짜)에 센다.

  - 같은 브라우저는 하루에 한 번만 센다(localStorage에 오늘 날짜를 기록).
  - 숫자는 실시간으로 구독해서, 다른 사람이 들어오면 바로 올라간다.
  - 보안 규칙이 막혀 있거나 네트워크가 안 되면 아무것도 그리지 않는다(빈 0을 보여 주지 않는다).
  - firebase/database는 무거워서 첫 화면을 늦추지 않도록 이 컴포넌트 안에서 나중에 불러온다.

  필요한 Realtime Database 규칙은 docs/PROJECT_GUIDE.md의 Fehe 방문자 수 항목에 있다.
*/
const SEEN_KEY = 'fehe-visit-day'

function todayInKorea() {
  // en-CA 형식이 YYYY-MM-DD라 그대로 경로 키로 쓴다
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

export default function VisitorCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    const day = todayInKorea()

    ;(async () => {
      try {
        const [{ rtdb }, { ref, onValue, runTransaction }] = await Promise.all([
          import('../../realtimeDatabase'),
          import('firebase/database'),
        ])
        if (cancelled) return
        const dayRef = ref(rtdb, `visitors/daily/${day}`)

        if (!alreadyCounted(day)) {
          await runTransaction(dayRef, (current) => (typeof current === 'number' ? current + 1 : 1))
          markCounted(day)
        }
        if (cancelled) return

        unsubscribe = onValue(
          dayRef,
          (snap) => setCount(typeof snap.val() === 'number' ? snap.val() : null),
          () => setCount(null),
        )
      } catch {
        setCount(null)
      }
    })()

    return () => {
      cancelled = true
      unsubscribe()
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
