import { useEffect, useRef, useState } from 'react'
import { CHEER_MESSAGES } from '../CheerSection/cheerMessages'
import { kstParts } from '../../suneungDates'
import { FORMATS, drawWallpaper } from './drawWallpaper'
import './WallpaperMaker.css'

const THEME_LABELS = { light: '밝게', dark: '어둡게' }

// 오늘의 D-Day와 응원 문구를 넣은 배경화면 이미지를 만들어 저장한다. 서버에 아무것도 보내지 않는다.
export default function WallpaperMaker({ open, onClose, exam, now }) {
  const dialogRef = useRef(null)
  const canvasRef = useRef(null)
  const [format, setFormat] = useState('phone')
  const [theme, setTheme] = useState('light')
  const [cheer, setCheer] = useState(() => {
    const p = kstParts(Date.now())
    return Math.floor(Date.UTC(p.year, p.month - 1, p.day) / 86400000) % CHEER_MESSAGES.length
  })

  // 날짜가 바뀔 때만 다시 그리면 되므로 한국 날짜를 키로 쓴다.
  const p = kstParts(now)
  const dayKey = `${p.year}-${p.month}-${p.day}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open || !canvasRef.current) return
    drawWallpaper(canvasRef.current, { exam, now: Date.now(), format, theme, message: CHEER_MESSAGES[cheer] })
  }, [open, exam, format, theme, cheer, dayKey])

  const save = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `suneung-dday-${exam.academicYear}-${format}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  return (
    <dialog ref={dialogRef} className="wm" aria-labelledby="wm-title" onClose={onClose}>
      {open && (
        <div className="wm-inner">
          <header className="wm-head">
            <h2 id="wm-title">D-Day 배경화면 만들기</h2>
            <button type="button" className="wm-x" onClick={onClose} aria-label="닫기">
              ×
            </button>
          </header>

          <div className="wm-body">
            <div className={`wm-preview wm-preview--${format}`}>
              <canvas ref={canvasRef} role="img" aria-label={`${exam.academicYear}학년도 수능 D-Day 배경화면 미리보기`} />
            </div>

            <div className="wm-options">
              <fieldset className="wm-field">
                <legend>크기</legend>
                <div className="wm-seg">
                  {Object.entries(FORMATS).map(([key, f]) => (
                    <button key={key} type="button" aria-pressed={format === key} onClick={() => setFormat(key)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="wm-field">
                <legend>색</legend>
                <div className="wm-seg">
                  {Object.entries(THEME_LABELS).map(([key, label]) => (
                    <button key={key} type="button" aria-pressed={theme === key} onClick={() => setTheme(key)}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="wm-field">
                <legend>응원 문구</legend>
                <p className="wm-cheer">{CHEER_MESSAGES[cheer]}</p>
                <button
                  type="button"
                  className="sn-btn"
                  onClick={() => setCheer((i) => (i + 1) % CHEER_MESSAGES.length)}
                >
                  다른 문구로 바꾸기
                </button>
              </fieldset>
              <button type="button" className="sn-btn sn-btn--primary wm-save" onClick={save}>
                이미지 저장하기
              </button>
              <p className="wm-note">D-Day 숫자는 저장한 날 기준입니다. 날마다 새로 저장하면 숫자가 줄어듭니다.</p>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
