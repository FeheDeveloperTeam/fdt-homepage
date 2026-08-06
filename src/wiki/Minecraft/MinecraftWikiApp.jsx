import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WikiHomePage from './pages/WikiHomePage/WikiHomePage'
import WikiLayout from './pages/WikiLayout/WikiLayout'
import JavaOverviewPage from './pages/JavaOverviewPage/JavaOverviewPage'
import BedrockOverviewPage from './pages/BedrockOverviewPage/BedrockOverviewPage'
import './index.css'

export default function MinecraftWikiApp() {
  return (
    <div className="mcwiki-app">
      <Header />
      <main className="mcwiki-main">
        <Routes>
          <Route path="/" element={<WikiHomePage />} />
          <Route element={<WikiLayout />}>
            <Route path="/java" element={<JavaOverviewPage />} />
            <Route path="/bedrock" element={<BedrockOverviewPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
