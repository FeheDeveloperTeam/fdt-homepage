import { useEffect, useId, useRef, useState } from 'react'
import { ACCENTS, MODES, useTheme } from '../../theme'
import './ThemeSettings.css'

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.9-.8 1.9-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8h2.1a4.2 4.2 0 0 0 4.2-4.2C21 6.9 17 3.5 12 3.5Z"
        strokeLinejoin="round"
      />
      <circle cx="7.6" cy="11.4" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="7.6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ModeIcon({ mode }) {
  if (mode === 'light') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M8.5 20h7M12 16.5V20" strokeLinecap="round" />
    </svg>
  )
}

// 헤더 오른쪽의 「화면 설정」 버튼과 팝오버. 밝기 모드와 강조색을 고른다.
export default function ThemeSettings() {
  const { mode, accent, setMode, setAccent, reset } = useTheme()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="ts" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`ts-button${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="화면 설정"
        title="화면 설정"
        onClick={() => setOpen((v) => !v)}
      >
        <IconPalette />
        <span className="ts-button-dot" aria-hidden="true" />
      </button>

      <div id={panelId} className="ts-panel" role="dialog" aria-label="화면 설정" hidden={!open}>
        <p className="ts-label">화면 밝기</p>
        <div className="ts-modes" role="group" aria-label="화면 밝기">
          {MODES.map((m) => (
            <button key={m.key} type="button" className="ts-mode" aria-pressed={mode === m.key} onClick={() => setMode(m.key)}>
              <ModeIcon mode={m.key} />
              {m.label}
            </button>
          ))}
        </div>

        <p className="ts-label">
          강조색 <span className="ts-current">{accent.label}</span>
        </p>
        <div className="ts-swatches" role="group" aria-label="강조색">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              className="ts-swatch"
              style={{ '--sw-light': a.light, '--sw-dark': a.dark }}
              aria-pressed={accent.key === a.key}
              aria-label={a.label}
              title={a.label}
              onClick={() => setAccent(a.key)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        <div className="ts-preview" aria-hidden="true">
          <span className="ts-preview-d suneung-num">D-DAY</span>
          <span className="ts-preview-bar">
            <span />
          </span>
        </div>

        <p className="ts-note">
          고른 설정은 이 브라우저에만 저장됩니다.{' '}
          <button type="button" className="ts-reset" onClick={reset}>
            처음 설정으로
          </button>
        </p>
      </div>
    </div>
  )
}
