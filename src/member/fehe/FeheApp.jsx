import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import BgDeco from './components/BgDeco/BgDeco'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import HomePage from './pages/HomePage/HomePage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import './index.css'

const EasterEgg = lazy(() => import('./components/EasterEgg/EasterEgg'))
const VersionWatcher = lazy(() => import('./components/VersionWatcher/VersionWatcher'))
const YoutubePage = lazy(() => import('./pages/YoutubePage/YoutubePage'))
const SecretPage = lazy(() => import('./pages/SecretPage/SecretPage'))
const StatusPage = lazy(() => import('./pages/StatusPage/StatusPage'))
const LivePreviewPage = lazy(() => import('./pages/LivePreviewPage/LivePreviewPage'))

export default function FeheApp() {
  return (
    <div className="fehe-app">
      <BgDeco />
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/youtube" element={<YoutubePage />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/live-preview" element={<LivePreviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <MusicPlayer />
      <Suspense fallback={null}>
        <EasterEgg />
      </Suspense>
      <Suspense fallback={null}>
        <VersionWatcher />
      </Suspense>
    </div>
  )
}
