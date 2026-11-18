import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import OmrMargins from './components/OmrMargins/OmrMargins'
import HomePage from './pages/HomePage/HomePage'
import './index.css'

export default function SuneungApp() {
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
    <div className="suneung-app">
      <Header />
      <OmrMargins />
      <main className="suneung-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/utility/suneung" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
