import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { auth, rtdb } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  ref, get, set, remove, onValue, onDisconnect, runTransaction
} from 'firebase/database'

const MAX = 10

function getSessionId() {
  let id = sessionStorage.getItem('visitor_sid')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('visitor_sid', id)
  }
  return id
}

/* ── 실제 게이트 로직 ── */
function GateInner({ children }) {
  const [status, setStatus] = useState('checking')
  const [activeCount, setActiveCount] = useState(0)
  const [queuePos, setQueuePos] = useState(0)
  const sid = useRef(getSessionId()).current
  const allowedRef = useRef(false)
  const cleaningUp = useRef(false)
  const rejectedRef = useRef(false)
  const myIpRef = useRef(null)
  const extraUnsubsRef = useRef([])
  const healthIntervalRef = useRef(null)
  const ipCheckPromiseRef = useRef(null)

  useEffect(() => {
    const sessionRef = ref(rtdb, `sessions/${sid}`)
    const sessionsRef = ref(rtdb, 'sessions')
    const myQueueRef = ref(rtdb, `queue/${sid}`)
    const allQueueRef = ref(rtdb, 'queue')

    function startHealthCheck() {
      if (healthIntervalRef.current) return
      healthIntervalRef.current = setInterval(async () => {
        if (!allowedRef.current || cleaningUp.current || rejectedRef.current) return
        try {
          const snap = await get(sessionRef)
          if (!snap.exists()) {
            allowedRef.current = false
            rejectedRef.current = true
            clearInterval(healthIntervalRef.current)
            setStatus('kicked')
            return
          }
          if (myIpRef.current) {
            const blockedKey = myIpRef.current.replace(/\./g, '_')
            const banSnap = await get(ref(rtdb, `sessions/app/blocked/${blockedKey}`))
            if (banSnap.exists()) {
              allowedRef.current = false
              rejectedRef.current = true
              clearInterval(healthIntervalRef.current)
              remove(sessionRef)
              setStatus('banned')
            }
          }
        } catch {}
      }, 8000)
    }

    function setupKickListener() {
      const unsub = onValue(sessionRef, snap => {
        if (!snap.exists() && allowedRef.current && !cleaningUp.current) {
          allowedRef.current = false
          rejectedRef.current = true
          setStatus('kicked')
        }
      })
      extraUnsubsRef.current.push(unsub)
    }

    function setupBanListener(ip) {
      const blockedKey = ip.replace(/\./g, '_')
      const unsub = onValue(ref(rtdb, `sessions/app/blocked/${blockedKey}`), snap => {
        if (snap.exists() && allowedRef.current && !cleaningUp.current) {
          allowedRef.current = false
          rejectedRef.current = true
          remove(sessionRef)
          setStatus('banned')
        }
      })
      extraUnsubsRef.current.push(unsub)
    }

    function buildIpCheckPromise() {
      return (async () => {
        try {
          const res = await fetch('https://api.ipify.org?format=json')
          const d = await res.json()
          myIpRef.current = d.ip
        } catch {}
        const ip = myIpRef.current
        if (ip) {
          const key = ip.replace(/\./g, '_')
          try {
            const snap = await get(ref(rtdb, `sessions/app/blocked/${key}`))
            if (snap.exists()) return 'blocked'
          } catch {}
          setupBanListener(ip)
        }
        return 'ok'
      })()
    }

    async function tryEnter() {
      if (rejectedRef.current) return
      if (!ipCheckPromiseRef.current) ipCheckPromiseRef.current = buildIpCheckPromise()
      const ipResult = await /** @type {Promise<string>} */ (ipCheckPromiseRef.current)
      if (rejectedRef.current) return
      if (ipResult === 'blocked') { setStatus('blocked'); return }

      const myIp = myIpRef.current
      let entered = false
      await runTransaction(ref(rtdb, 'sessions'), (sessions) => {
        const count = sessions
          ? Object.keys(sessions).filter(k => k !== 'app').length
          : 0
        if (count >= MAX) return sessions
        entered = true
        return { ...sessions, [sid]: { joinedAt: Date.now(), ip: myIp || '알 수 없음' } }
      })

      if (entered) {
        allowedRef.current = true
        onDisconnect(sessionRef).remove()
        remove(myQueueRef)
        setStatus('allowed')
        setupKickListener()
        startHealthCheck()
      } else {
        const qSnap = await get(myQueueRef)
        if (!qSnap.exists()) {
          await set(myQueueRef, { joinedAt: Date.now() })
          onDisconnect(myQueueRef).remove()
        }
        setStatus('waiting')
      }
    }

    tryEnter()

    const unsubSessions = onValue(sessionsRef, snap => {
      const count = snap.exists()
        ? Object.keys(snap.val()).filter(k => k !== 'app').length
        : 0
      setActiveCount(count)
      if (!allowedRef.current && !rejectedRef.current && count < MAX) tryEnter()
    })

    const unsubQueue = onValue(allQueueRef, snap => {
      if (!snap.exists()) { setQueuePos(0); return }
      const all = snap.val()
      const mine = all[sid]
      if (!mine) { setQueuePos(0); return }
      const pos = Object.values(all).filter(v => v.joinedAt < mine.joinedAt).length
      setQueuePos(pos)
    })

    return () => {
      cleaningUp.current = true
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current)
      unsubSessions()
      unsubQueue()
      extraUnsubsRef.current.forEach(fn => fn())
      if (allowedRef.current) remove(sessionRef)
      else remove(myQueueRef)
    }
  }, [sid])

  if (status === 'checking') {
    return (
      <div className="vg-overlay">
        <div className="vg-box">
          <div className="vg-spinner" />
          <p className="vg-sub">접속 확인 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'waiting') {
    return (
      <div className="vg-overlay">
        <div className="vg-box">
          <div className="vg-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="vg-title">대기 중</h1>
          <p className="vg-desc">현재 접속자가 가득 찼습니다.<br/>자리가 나면 자동으로 입장됩니다.</p>
          <div className="vg-stats">
            <div className="vg-stat">
              <span className="vg-stat-num">{queuePos}</span>
              <span className="vg-stat-label">내 앞 대기자</span>
            </div>
            <div className="vg-divider" />
            <div className="vg-stat">
              <span className="vg-stat-num">{activeCount}<span className="vg-stat-max">/{MAX}</span></span>
              <span className="vg-stat-label">현재 접속자</span>
            </div>
          </div>
          <div className="vg-bar-wrap">
            <div className="vg-bar-fill" style={{ width: `${(activeCount / MAX) * 100}%` }} />
          </div>
          <p className="vg-hint">창을 닫지 마세요. 자동으로 입장됩니다.</p>
        </div>
      </div>
    )
  }

  if (status === 'kicked') {
    return (
      <div className="vg-overlay">
        <div className="vg-box">
          <div className="vg-icon" style={{ color: '#d4880a' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <h1 className="vg-title">강제 퇴장됨</h1>
          <p className="vg-desc">관리자에 의해 세션이 종료되었습니다.<br/>페이지를 새로고침하면 다시 입장할 수 있습니다.</p>
          <button className="vg-reload-btn" onClick={() => window.location.reload()}>새로고침</button>
        </div>
      </div>
    )
  }

  if (status === 'banned') {
    return (
      <div className="vg-overlay">
        <div className="vg-box">
          <div className="vg-icon" style={{ color: '#f85149' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h1 className="vg-title">IP 차단됨</h1>
          <p className="vg-desc">관리자에 의해 이 IP 주소가 차단되었습니다.</p>
        </div>
      </div>
    )
  }

  if (status === 'blocked') {
    return (
      <div className="vg-overlay">
        <div className="vg-box">
          <div className="vg-icon" style={{ color: '#f85149' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h1 className="vg-title">접근 차단됨</h1>
          <p className="vg-desc">이 IP 주소는 관리자에 의해 차단되었습니다.</p>
        </div>
      </div>
    )
  }

  return children
}

/* ── 외부 래퍼: 관리자 여부 확인 후 분기 ── */
export default function VisitorGate({ children }) {
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setIsAdmin(!!user))
    return () => unsub()
  }, [])

  // /member/fehe/admin 경로는 무조건 통과
  if (location.pathname === '/member/fehe/admin') return children

  // Firebase Auth 확인 중 (깜빡임 방지)
  if (isAdmin === undefined) return null

  // 로그인된 관리자는 세션 등록 없이 통과
  if (isAdmin) return children

  return <GateInner>{children}</GateInner>
}
