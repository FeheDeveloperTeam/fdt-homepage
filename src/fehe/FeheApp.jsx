import { Routes, Route } from 'react-router-dom'
import BgDeco from './components/BgDeco'
import Header from './components/Header'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer'
import VisitorGate from './components/VisitorGate'
import EasterEgg from './components/EasterEgg'
import VersionWatcher from './components/VersionWatcher'
import HomePage from './pages/HomePage'
import YoutubePage from './pages/YoutubePage'
import TestGatePage from './pages/TestGatePage'
import SecretPage from './pages/SecretPage'
import StatusPage from './pages/StatusPage'
import AdminPage from './pages/AdminPage'
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
