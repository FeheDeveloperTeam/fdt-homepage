import { Routes, Route } from 'react-router-dom'
import BgDeco from './components/BgDeco/BgDeco'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import EasterEgg from './components/EasterEgg/EasterEgg'
import VersionWatcher from './components/VersionWatcher/VersionWatcher'
import HomePage from './pages/HomePage/HomePage'
import YoutubePage from './pages/YoutubePage/YoutubePage'
import SecretPage from './pages/SecretPage/SecretPage'
import StatusPage from './pages/StatusPage/StatusPage'
import LivePreviewPage from './pages/LivePreviewPage/LivePreviewPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import './index.css'

export default function FeheApp() {
  return (
    <div className="fehe-app">
      <BgDeco />
      <Header />
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/youtube"     element={<YoutubePage />} />
        <Route path="/secret"      element={<SecretPage />} />
        <Route path="/status"      element={<StatusPage />} />
        <Route path="/live-preview" element={<LivePreviewPage />} />
        <Route path="*"            element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <MusicPlayer />
      <EasterEgg />
      <VersionWatcher />
    </div>
  )
}
