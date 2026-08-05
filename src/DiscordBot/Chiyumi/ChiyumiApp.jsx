import { Routes, Route } from 'react-router-dom'
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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="restrict" element={<AdminRestrictPage />} />
            <Route path="unrestrict" element={<AdminUnrestrictPage />} />
            <Route path="check" element={<AdminCheckPage />} />
            <Route path="admins" element={<AdminManagePage />} />
            <Route path="sheets" element={<AdminSheetPage />} />
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
