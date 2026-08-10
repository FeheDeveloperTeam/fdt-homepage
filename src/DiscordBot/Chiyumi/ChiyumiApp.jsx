import { Routes, Route } from 'react-router-dom'
import { useFavicon } from '../../hooks/useFavicon'
import chiyumiPhoto from '../../assets/images/projects/chiyumi.png'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import AdminLayout from './pages/AdminLayout/AdminLayout'
import AdminOverviewPage from './pages/AdminOverviewPage/AdminOverviewPage'
import AdminRestrictPage from './pages/AdminRestrictPage/AdminRestrictPage'
import AdminUnrestrictPage from './pages/AdminUnrestrictPage/AdminUnrestrictPage'
import AdminCheckPage from './pages/AdminCheckPage/AdminCheckPage'
import AdminManagePage from './pages/AdminManagePage/AdminManagePage'
import AdminSheetPage from './pages/AdminSheetPage/AdminSheetPage'
import AdminCoinCheckPage from './pages/AdminCoinCheckPage/AdminCoinCheckPage'
import AdminCoinAdjustPage from './pages/AdminCoinAdjustPage/AdminCoinAdjustPage'
import ServersPage from './pages/ServersPage/ServersPage'
import GuildLayout from './pages/GuildLayout/GuildLayout'
import GuildOverviewPage from './pages/GuildOverviewPage/GuildOverviewPage'
import GuildLogPage from './pages/GuildLogPage/GuildLogPage'
import GuildWelcomePage from './pages/GuildWelcomePage/GuildWelcomePage'
import GuildTicketPage from './pages/GuildTicketPage/GuildTicketPage'
import GuildWarnPage from './pages/GuildWarnPage/GuildWarnPage'
import GuildModerationPage from './pages/GuildModerationPage/GuildModerationPage'
import GuildCensorPage from './pages/GuildCensorPage/GuildCensorPage'
import GuildWordchainPage from './pages/GuildWordchainPage/GuildWordchainPage'
import GuildStreamAlertPage from './pages/GuildStreamAlertPage/GuildStreamAlertPage'
import TermsPage from './pages/TermsPage/TermsPage'
import PrivacyPage from './pages/PrivacyPage/PrivacyPage'
import ErrorsPage from './pages/ErrorsPage/ErrorsPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import './index.css'

export default function ChiyumiApp() {
  useFavicon(chiyumiPhoto)

  return (
    <div className="chiyumi-app">
      <Header />
      <main className="chiyumi-main">
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
      </main>
      <Footer />
    </div>
  )
}
