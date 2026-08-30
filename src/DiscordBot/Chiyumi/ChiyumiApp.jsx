import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useFavicon } from '../../hooks/useFavicon'
import chiyumiPhoto from '../../assets/images/projects/chiyumi.png'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import ServersPage from './pages/ServersPage/ServersPage'
import TermsPage from './pages/TermsPage/TermsPage'
import PrivacyPage from './pages/PrivacyPage/PrivacyPage'
import ErrorsPage from './pages/ErrorsPage/ErrorsPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import './index.css'

const AdminLayout = lazy(() => import('./pages/AdminLayout/AdminLayout'))
const AdminOverviewPage = lazy(() => import('./pages/AdminOverviewPage/AdminOverviewPage'))
const AdminRestrictPage = lazy(() => import('./pages/AdminRestrictPage/AdminRestrictPage'))
const AdminUnrestrictPage = lazy(() => import('./pages/AdminUnrestrictPage/AdminUnrestrictPage'))
const AdminCheckPage = lazy(() => import('./pages/AdminCheckPage/AdminCheckPage'))
const AdminManagePage = lazy(() => import('./pages/AdminManagePage/AdminManagePage'))
const AdminSheetPage = lazy(() => import('./pages/AdminSheetPage/AdminSheetPage'))
const AdminCoinCheckPage = lazy(() => import('./pages/AdminCoinCheckPage/AdminCoinCheckPage'))
const AdminCoinAdjustPage = lazy(() => import('./pages/AdminCoinAdjustPage/AdminCoinAdjustPage'))
const GuildLayout = lazy(() => import('./pages/GuildLayout/GuildLayout'))
const GuildOverviewPage = lazy(() => import('./pages/GuildOverviewPage/GuildOverviewPage'))
const GuildLogPage = lazy(() => import('./pages/GuildLogPage/GuildLogPage'))
const GuildWelcomePage = lazy(() => import('./pages/GuildWelcomePage/GuildWelcomePage'))
const GuildTicketPage = lazy(() => import('./pages/GuildTicketPage/GuildTicketPage'))
const GuildWarnPage = lazy(() => import('./pages/GuildWarnPage/GuildWarnPage'))
const GuildModerationPage = lazy(() => import('./pages/GuildModerationPage/GuildModerationPage'))
const GuildCensorPage = lazy(() => import('./pages/GuildCensorPage/GuildCensorPage'))
const GuildWordchainPage = lazy(() => import('./pages/GuildWordchainPage/GuildWordchainPage'))
const GuildStreamAlertPage = lazy(() => import('./pages/GuildStreamAlertPage/GuildStreamAlertPage'))

export default function ChiyumiApp() {
  useFavicon(chiyumiPhoto)

  return (
    <div className="chiyumi-app">
      <Header />
      <main className="chiyumi-main">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="restrict" element={<AdminRestrictPage />} />
              <Route path="unrestrict" element={<AdminUnrestrictPage />} />
              <Route path="check" element={<AdminCheckPage />} />
              <Route path="admins" element={<AdminManagePage />} />
              <Route path="sheets" element={<AdminSheetPage />} />
              <Route path="coins/check" element={<AdminCoinCheckPage />} />
              <Route path="coins/adjust" element={<AdminCoinAdjustPage />} />
            </Route>
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/servers/:guildId" element={<GuildLayout />}>
              <Route index element={<GuildOverviewPage />} />
              <Route path="log" element={<GuildLogPage />} />
              <Route path="welcome" element={<GuildWelcomePage />} />
              <Route path="ticket" element={<GuildTicketPage />} />
              <Route path="warn" element={<GuildWarnPage />} />
              <Route path="moderation" element={<GuildModerationPage />} />
              <Route path="censor" element={<GuildCensorPage />} />
              <Route path="wordchain" element={<GuildWordchainPage />} />
              <Route path="streamalert" element={<GuildStreamAlertPage />} />
            </Route>
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/errors" element={<ErrorsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
