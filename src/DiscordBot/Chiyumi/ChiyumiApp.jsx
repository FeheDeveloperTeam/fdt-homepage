import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import AdminPage from './pages/AdminPage/AdminPage'
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
