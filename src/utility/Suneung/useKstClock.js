import { useEffect, useState } from 'react'

// 기기 시계가 몇 초씩 틀려 있어도 카운트다운이 맞도록, 이 사이트 서버 응답의 Date 헤더로
// 오차를 한 번 잰다. Date 헤더는 초 단위라 오차가 1.5초를 넘을 때만 보정한다.
async function measureOffset() {
  const sentAt = Date.now()
  const response = await fetch(`/robots.txt?clock=${sentAt}`, { method: 'HEAD', cache: 'no-store' })
  const receivedAt = Date.now()
  const header = response.headers.get('date')
  if (!header) return null
  const serverMs = Date.parse(header)
  if (Number.isNaN(serverMs)) return null
  // Date 헤더는 초를 내림하므로 0.5초를 더해 가운데 값으로 본다.
  return serverMs + 500 - (sentAt + receivedAt) / 2
}

export function useClockOffset() {
  const [state, setState] = useState({ offset: 0, synced: false, skew: null })

  useEffect(() => {
    let cancelled = false
    measureOffset()
      .then((skew) => {
        if (cancelled || skew === null) return
        setState({ offset: Math.abs(skew) > 1500 ? skew : 0, synced: true, skew })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

// 매초 경계에 맞춰 현재 순간(ms)을 갱신한다. 탭이 다시 보이면 바로 다시 맞춘다.
export function useNow(offset = 0) {
  const [now, setNow] = useState(() => Date.now() + offset)

  useEffect(() => {
    let timer
    const tick = () => {
      const value = Date.now() + offset
      setNow(value)
      timer = setTimeout(tick, 1000 - (value % 1000) + 8)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer)
        tick()
      }
    }
    tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [offset])

  return now
}
