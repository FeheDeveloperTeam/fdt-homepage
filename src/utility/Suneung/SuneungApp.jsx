import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import './index.css'

export default function SuneungApp() {
  return (
    <div className="suneung-app">
      <Header />
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
