import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import './index.css'

export default function NetworkTestApp() {
  return (
    <div className="nettest-app">
      <Header />
      <main className="nettest-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
