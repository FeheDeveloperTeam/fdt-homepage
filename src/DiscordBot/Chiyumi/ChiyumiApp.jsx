import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import './index.css'

export default function ChiyumiApp() {
  return (
    <div className="chiyumi-app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
