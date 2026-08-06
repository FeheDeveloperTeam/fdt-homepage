import { Routes, Route, Navigate } from 'react-router-dom'
import { useFavicon } from '../../hooks/useFavicon'
import grassIcon from '../../assets/images/wiki/minecraft-grass-icon.svg'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WikiHomePage from './pages/WikiHomePage/WikiHomePage'
import './index.css'

export default function MinecraftWikiApp() {
  useFavicon(grassIcon)

  return (
    <div className="mcwiki-app">
      <Header />
      <main className="mcwiki-main">
        <Routes>
          <Route path="/" element={<WikiHomePage />} />
          <Route path="*" element={<Navigate to="/wiki/minecraft" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
