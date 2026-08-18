import { useEffect, useRef, useState } from 'react'
import './DiscordLoginButton.css'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

// 스크립트는 한 번만 불러오면 되니 모듈 스코프에 프라미스를 캐시해둔다.
let scriptPromise = null
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.turnstile)
      script.onerror = () => reject(new Error('Turnstile 스크립트를 불러오지 못했어요.'))
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

function TurnstileModal({ onClose }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let widgetId = null
    let cancelled = false

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return
        widgetId = turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => {
            window.location.href = `/api/auth/discord/login?token=${encodeURIComponent(token)}`
          },
          'error-callback': () => setError('인증에 실패했어요. 다시 시도해주세요.'),
        })
      })
      .catch(() => setError('인증 위젯을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'))

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [])

  return (
    <div className="turnstile-backdrop" onClick={onClose}>
      <div className="turnstile-modal" onClick={(e) => e.stopPropagation()}>
        <p className="turnstile-modal-title">로그인 전에 사람인지 확인할게요</p>
        <div ref={containerRef} className="turnstile-widget" />
        {error && <p className="turnstile-modal-error">{error}</p>}
        <button type="button" className="turnstile-modal-close" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  )
}

export default function DiscordLoginButton({ className, style, children = 'Discord로 로그인' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} style={style} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && <TurnstileModal onClose={() => setOpen(false)} />}
    </>
  )
}
