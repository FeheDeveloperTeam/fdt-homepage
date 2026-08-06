import { Routes, Route, Navigate } from 'react-router-dom'
import { useFavicon } from '../../hooks/useFavicon'
import grassIcon from '../../assets/images/wiki/minecraft-grass-icon.svg'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WikiHomePage from './pages/WikiHomePage/WikiHomePage'
import WikiLayout from './pages/WikiLayout/WikiLayout'
import JavaIndexPage from './pages/JavaIndexPage/JavaIndexPage'
import WikiEntryPage from './pages/WikiEntryPage/WikiEntryPage'
import './index.css'

export default function MinecraftWikiApp() {
  useFavicon(grassIcon)

  return (
    <div className="mcwiki-app">
      <Header />
      <main className="mcwiki-main">
        <Routes>
          <Route path="/" element={<WikiHomePage />} />
          <Route element={<WikiLayout />}>
            <Route path="/java" element={<JavaIndexPage />} />
            <Route path="/java/:slug" element={<WikiEntryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/wiki/minecraft" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
