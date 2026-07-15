import { lazy, Suspense } from 'react'
import { Route, Routes, Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Services from './pages/Services/Services'
import Projects from './pages/Projects/Projects'
import Contact from './pages/Contact/Contact'

const FeheApp = lazy(() => import('./fehe/FeheApp'))

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
        </Route>
        <Route
          path="/fehe/*"
          element={
            <Suspense fallback={null}>
              <FeheApp />
            </Suspense>
          }
        />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
