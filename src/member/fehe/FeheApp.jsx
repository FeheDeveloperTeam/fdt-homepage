import { Routes, Route } from 'react-router-dom'
import BgDeco from './components/BgDeco/BgDeco'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import VisitorGate from './components/VisitorGate/VisitorGate'
import EasterEgg from './components/EasterEgg/EasterEgg'
import VersionWatcher from './components/VersionWatcher/VersionWatcher'
import HomePage from './pages/HomePage/HomePage'
import YoutubePage from './pages/YoutubePage/YoutubePage'
import TestGatePage from './pages/TestGatePage/TestGatePage'
import SecretPage from './pages/SecretPage/SecretPage'
import StatusPage from './pages/StatusPage/StatusPage'
import AdminPage from './pages/AdminPage/AdminPage'
import './index.css'

export default function FeheApp() {
  return (
    <div className="fehe-app">
      <VisitorGate>
        <BgDeco />
        <Header />
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/youtube"     element={<YoutubePage />} />
          <Route path="/test-gate"   element={<TestGatePage />} />
          <Route path="/secret"      element={<SecretPage />} />
          <Route path="/status"      element={<StatusPage />} />
          <Route path="/admin"       element={<AdminPage />} />
        </Routes>
        <Footer />
        <MusicPlayer />
        <EasterEgg />
        <VersionWatcher />
      </VisitorGate>
    </div>
  )
}
