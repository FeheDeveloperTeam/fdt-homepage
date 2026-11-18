import { Routes, Route, Navigate } from 'react-router-dom'
import { memo, useEffect, useMemo } from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import OmrMargins from './components/OmrMargins/OmrMargins'
import HomePage from './pages/HomePage/HomePage'
import { useClockOffset, useNow } from './useKstClock'
import { ClockContext } from './suneungState'
import { ThemeContext, useThemeController } from './theme'
import { AmbientContext, useAmbientController } from './ambient/useAmbient'
import './index.css'

// 1초마다 다시 그릴 필요가 없는 부분
const StaticHeader = memo(Header)
const StaticMargins = memo(OmrMargins)

export default function SuneungApp() {
  const clock = useClockOffset()
  const now = useNow(clock.offset)
  const value = useMemo(() => ({ now, clock }), [now, clock])
  const theme = useThemeController()
  const ambient = useAmbientController(clock.offset)

  // 탭 아이콘을 수능 타이머 로고(OMR 마킹 칸, SVG)로 바꾸고, 다른 화면으로 나가면 원래대로 돌린다.
  // 기본 아이콘 링크가 type="image/png"라 주소와 함께 type도 바꿔야 브라우저가 SVG로 읽는다.
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]')
    if (!link) return undefined
    const original = { href: link.href, type: link.type }
    link.type = 'image/svg+xml'
    link.href = '/suneung-icon.svg'
    return () => {
      link.type = original.type
      link.href = original.href
    }
  }, [])

  return (
    <ClockContext.Provider value={value}>
    <ThemeContext.Provider value={theme.value}>
    <AmbientContext.Provider value={ambient}>
    <div className="suneung-app" {...theme.rootProps}>
      <StaticHeader />
      <StaticMargins />
      <main className="suneung-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/utility/suneung" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </AmbientContext.Provider>
    </ThemeContext.Provider>
    </ClockContext.Provider>
  )
}
