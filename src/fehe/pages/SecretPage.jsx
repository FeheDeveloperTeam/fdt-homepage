import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LINES = [
  { text: '2014년.', delay: 600 },
  { text: '나는 처음으로 \'페헤\'라는 이름을 가졌다.', delay: 1800 },
  { text: '', delay: 2800 },
  { text: '인터넷은 이상한 곳이다.', delay: 3200 },
  { text: '현실에서 사라지는 것들이 여기서는 남는다.', delay: 4400 },
  { text: '내가 쓴 글, 내가 만든 서버, 내가 나눈 대화들.', delay: 5800 },
  { text: '', delay: 7000 },
  { text: '나는 가끔 생각한다.', delay: 7400 },
  { text: '\'페헤\'는 나인가,', delay: 8600 },
  { text: '아니면 내가 만들어낸 또 다른 누군가인가.', delay: 9800 },
  { text: '', delay: 11000 },
  { text: '그것도 이제는 중요하지 않다.', delay: 11400 },
  { text: '어느 순간부터, 페헤가 나였고 내가 페헤였다.', delay: 12800 },
  { text: '', delay: 14200 },
  { text: '당신이 이 페이지를 찾았다는 건,', delay: 14600 },
  { text: '그냥 링크를 따라온 게 아니라는 뜻이다.', delay: 15900 },
  { text: '', delay: 17200 },
  { text: '...반가워요.', delay: 17600, accent: true },
]

function Glitch({ text }) {
  return (
    <h1 className="secret-glitch" data-text={text}>
      {text}
    </h1>
  )
}

function AccessDenied() {
  const navigate = useNavigate()
  const [count, setCount] = useState(3)

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000)
    const r = setTimeout(() => navigate('/fehe', { replace: true }), 3200)
    return () => { clearInterval(t); clearTimeout(r) }
  }, [navigate])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#06060f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1rem',
      fontFamily: "'Menlo','Monaco','Consolas',monospace", color: '#e6edf3',
    }}>
      <p style={{ color: '#f85149', fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 700 }}>
        [ ACCESS DENIED ]
      </p>
      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>
        경로는 알고 있군요.
      </p>
      <p style={{ color: '#8b949e', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.8 }}>
        하지만 이 문은 URL로 열리지 않습니다.<br />
        열쇠는 다른 곳에 있어요.
      </p>
      <p style={{ color: '#484f58', fontSize: '0.75rem', marginTop: '0.5rem' }}>
        {count}초 후 돌아갑니다...
      </p>
    </div>
  )
}

export default function SecretPage() {
  const navigate = useNavigate()
  const [authed] = useState(() => !!sessionStorage.getItem('secret_auth'))
  const [visibleCount, setVisibleCount] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [stars, setStars] = useState([])

  useEffect(() => {
    if (authed) sessionStorage.removeItem('secret_auth')
  }, [authed])

  useEffect(() => {
    if (!authed) return
    setStars(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 3 + 2,
      }))
    )
  }, [authed])

  useEffect(() => {
    if (!authed) return
    const timers = LINES.map((line, i) =>
      setTimeout(() => setVisibleCount(c => Math.max(c, i + 1)), line.delay)
    )
    const backTimer = setTimeout(() => setShowBack(true), LINES[LINES.length - 1].delay + 2000)
    return () => { timers.forEach(clearTimeout); clearTimeout(backTimer) }
  }, [authed])

  if (!authed) return <AccessDenied />

  return (
    <div className="secret-page">
      {/* 별 배경 */}
      {stars.map(s => (
        <span
          key={s.id}
          className="secret-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      <div className="secret-content">
        <Glitch text="CLASSIFIED" />
        <div className="secret-divider" />

        <div className="secret-lines">
          {LINES.slice(0, visibleCount).map((line, i) => (
            <p
              key={i}
              className={`secret-line${line.accent ? ' accent' : ''}`}
            >
              {line.text || '\u00A0'}
            </p>
          ))}
        </div>

        {showBack && (
          <div className="secret-footer">
            <span className="secret-sig">— 페헤, {new Date().getFullYear()}</span>
            <button className="secret-back" onClick={() => navigate('/fehe')}>
              ← 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
