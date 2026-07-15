import { useState, useEffect, useRef } from 'react'
import { auth, rtdb } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { ref, set, remove, onValue } from 'firebase/database'
import '../styles/admin.css'

function encodeIp(ip) { return ip.replace(/\./g, '_') }
function decodeIp(key) { return key.replace(/_/g, '.') }

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}

/* ── 로그인 폼 ── */
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('이메일 또는 비밀번호가 틀렸습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth">
      <div className="admin-auth-box">
        <p className="admin-auth-title">관리자 로그인</p>
        <p className="admin-auth-sub">관리자 계정으로 로그인하세요.</p>
        <form onSubmit={submit}>
          <input
            className="admin-auth-input"
            type="email"
            placeholder="이메일"
            value={email}
            autoFocus
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: '0.5rem' }}
          />
          <input
            className={`admin-auth-input${error ? ' error' : ''}`}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
          />
          {error && <p className="admin-auth-error">{error}</p>}
          <button type="submit" className="admin-auth-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AdminPage() {
  const [user, setUser] = useState(undefined)
  const [sessions, setSessions] = useState({})
  const [blocked, setBlocked] = useState({})
  const [banInput, setBanInput] = useState('')
  const [msg, setMsg] = useState('')
  const [toasts, setToasts] = useState([])
  const prevSessionsRef = useRef(null)

  function addToast(text, type) {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, text, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return

    const sessRef = ref(rtdb, 'sessions')
    const unsub = onValue(sessRef, snap => {
      const val = snap.val() || {}
      const { app: _, ...rest } = val

      // 입장/퇴장 감지
      if (prevSessionsRef.current !== null) {
        const prev = prevSessionsRef.current
        Object.entries(rest).forEach(([sid, data]) => {
          if (!prev[sid]) addToast(`입장: ${data.ip || '알 수 없음'}`, 'join')
        })
        Object.entries(prev).forEach(([sid, data]) => {
          if (!rest[sid]) addToast(`퇴장: ${data.ip || '알 수 없음'}`, 'leave')
        })
      }
      prevSessionsRef.current = rest

      setSessions(rest)
      setBlocked(val?.app?.blocked || {})
    })

    return () => unsub()
  }, [user])

  async function kickSession(sid) {
    await remove(ref(rtdb, `sessions/${sid}`))
    setMsg(`세션 ${sid.slice(0, 8)}... 강제 퇴장 완료`)
    setTimeout(() => setMsg(''), 3000)
  }

  async function banIp(ip) {
    if (!ip || ip === '알 수 없음') return
    const key = encodeIp(ip)
    await set(ref(rtdb, `sessions/app/blocked/${key}`), {
      ip,
      bannedAt: Date.now(),
    })
    setMsg(`${ip} 차단 완료`)
    setTimeout(() => setMsg(''), 3000)
  }

  async function banAndKick(sid, ip) {
    await banIp(ip)
    await kickSession(sid)
  }

  async function unbanIp(key) {
    const ip = decodeIp(key)
    await remove(ref(rtdb, `sessions/app/blocked/${key}`))
    setMsg(`${ip} 차단 해제 완료`)
    setTimeout(() => setMsg(''), 3000)
  }

  async function manualBan(e) {
    e.preventDefault()
    const ip = banInput.trim()
    if (!ip) return
    await banIp(ip)
    setBanInput('')
  }

  async function handleSignOut() {
    await signOut(auth)
  }

  // 인증 상태 확인 중
  if (user === undefined) {
    return (
      <div className="admin-auth">
        <div className="admin-auth-box">
          <p className="admin-auth-sub">확인 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginForm />

  const sessionList = Object.entries(sessions)
  const blockedList = Object.entries(blocked)

  return (
    <div className="admin-page">

      {/* 토스트 알림 */}
      <div className="admin-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast admin-toast--${t.type}`}>{t.text}</div>
        ))}
      </div>

      <div className="admin-container">

        <div className="admin-header">
          <h1 className="admin-title">관리 페이지</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {msg && <div className="admin-msg">{msg}</div>}
            <button className="admin-btn admin-btn--kick" onClick={handleSignOut}>로그아웃</button>
          </div>
        </div>

        {/* 현재 접속자 */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">현재 접속자</h2>
            <span className="admin-badge">{sessionList.length}명</span>
          </div>

          {sessionList.length === 0 ? (
            <p className="admin-empty">현재 접속자가 없습니다.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>세션 ID</th>
                    <th>IP 주소</th>
                    <th>접속 시각</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionList.map(([sid, data]) => (
                    <tr key={sid}>
                      <td className="admin-sid">{sid.slice(0, 10)}…</td>
                      <td className="admin-ip">{data.ip || '알 수 없음'}</td>
                      <td className="admin-time">{formatTime(data.joinedAt)}</td>
                      <td className="admin-actions">
                        <button
                          className="admin-btn admin-btn--kick"
                          onClick={() => kickSession(sid)}
                        >강제 퇴장</button>
                        <button
                          className="admin-btn admin-btn--ban"
                          onClick={() => banAndKick(sid, data.ip)}
                          disabled={!data.ip || data.ip === '알 수 없음'}
                        >IP 차단</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 차단된 IP */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">차단된 IP</h2>
            <span className="admin-badge admin-badge--red">{blockedList.length}개</span>
          </div>

          <form className="admin-ban-form" onSubmit={manualBan}>
            <input
              className="admin-ban-input"
              placeholder="IP 직접 입력 (예: 123.45.67.89)"
              value={banInput}
              onChange={e => setBanInput(e.target.value)}
            />
            <button type="submit" className="admin-btn admin-btn--ban">차단</button>
          </form>

          {blockedList.length === 0 ? (
            <p className="admin-empty">차단된 IP가 없습니다.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>IP 주소</th>
                    <th>차단 시각</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedList.map(([key, data]) => (
                    <tr key={key}>
                      <td className="admin-ip">{data.ip || decodeIp(key)}</td>
                      <td className="admin-time">{formatTime(data.bannedAt)}</td>
                      <td className="admin-actions">
                        <button
                          className="admin-btn admin-btn--unban"
                          onClick={() => unbanIp(key)}
                        >차단 해제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
