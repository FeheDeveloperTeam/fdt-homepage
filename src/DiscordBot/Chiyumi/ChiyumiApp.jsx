import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import AdminPage from './pages/AdminPage/AdminPage'
import TermsPage from './pages/TermsPage/TermsPage'
import PrivacyPage from './pages/PrivacyPage/PrivacyPage'
import ErrorsPage from './pages/ErrorsPage/ErrorsPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import './index.css'

export default function ChiyumiApp() {
  return (
    <div className="chiyumi-app">
      <Header />
      <main className="chiyumi-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/errors" element={<ErrorsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
