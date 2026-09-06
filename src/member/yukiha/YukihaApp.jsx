import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import YukihaPage from './YukihaPage'
import './index.css'

export default function YukihaApp() {
  return (
    <div className="yukiha-app">
      <Header />
      <main>
        <YukihaPage />
      </main>
      <Footer />
    </div>
  )
}
