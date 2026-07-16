import { lazy, Suspense } from 'react'
import { Route, Routes, Outlet, Navigate, useParams } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Services from './pages/Services/Services'
import Projects from './pages/Projects/Projects'
import Contact from './pages/Contact/Contact'
import NotFound from './pages/NotFound/NotFound'

const FeheApp = lazy(() => import('./member/fehe/FeheApp'))

// 예전 /fehe 경로로 들어오는 북마크/링크를 새 /member/fehe 경로로 보내준다.
function RedirectToMemberFehe() {
  const params = useParams()
  const rest = params['*']
  return <Navigate to={rest ? `/member/fehe/${rest}` : '/member/fehe'} replace />
}

function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="/member/fehe/*"
          element={
            <Suspense fallback={null}>
              <FeheApp />
            </Suspense>
          }
        />
        <Route path="/fehe/*" element={<RedirectToMemberFehe />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
