import { Routes, Route } from 'react-router-dom'
import { useFavicon } from '../../hooks/useFavicon'
import grassIcon from '../../assets/images/wiki/minecraft-grass-icon.svg'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WikiHomePage from './pages/WikiHomePage/WikiHomePage'
import WikiLayout from './pages/WikiLayout/WikiLayout'
import JavaOverviewPage from './pages/JavaOverviewPage/JavaOverviewPage'
import JavaServerPage from './pages/JavaServerPage/JavaServerPage'
import JavaModsPage from './pages/JavaModsPage/JavaModsPage'
import BedrockOverviewPage from './pages/BedrockOverviewPage/BedrockOverviewPage'
import BedrockServerPage from './pages/BedrockServerPage/BedrockServerPage'
import BedrockAddonsPage from './pages/BedrockAddonsPage/BedrockAddonsPage'
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
            <Route path="/java" element={<JavaOverviewPage />} />
            <Route path="/java/server" element={<JavaServerPage />} />
            <Route path="/java/mods" element={<JavaModsPage />} />
            <Route path="/bedrock" element={<BedrockOverviewPage />} />
            <Route path="/bedrock/server" element={<BedrockServerPage />} />
            <Route path="/bedrock/addons" element={<BedrockAddonsPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
