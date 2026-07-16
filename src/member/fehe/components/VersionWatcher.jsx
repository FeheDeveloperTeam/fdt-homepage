import { useEffect, useRef, useState } from 'react'
import { rtdb } from '../firebase'
import { ref, onValue } from 'firebase/database'
import '../styles/versionbanner.css'

export default function VersionWatcher() {
  const initialVersion = useRef(null)
  const [outdated, setOutdated] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const versionRef = ref(rtdb, 'app/version')

    const unsub = onValue(versionRef, snap => {
      const v = snap.val()
      if (v === null) return

      if (initialVersion.current === null) {
        initialVersion.current = v
      } else if (v !== initialVersion.current) {
        setOutdated(true)
      }
    })

    return () => unsub()
  }, [])

  function dismiss() {
    setHiding(true)
    setTimeout(() => setOutdated(false), 400)
  }

  if (!outdated) return null

  return (
    <div className={`version-banner${hiding ? ' hiding' : ''}`}>
      <span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        새 버전이 배포되었어요.
      </span>
      <button className="version-banner-reload" onClick={() => window.location.reload()}>
        새로고침
      </button>
      <button className="version-banner-close" onClick={dismiss} aria-label="닫기">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
