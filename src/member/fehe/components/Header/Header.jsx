import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconHome, IconYoutube, IconStatus, IconGithub, IconSteam, IconInstagram } from '../icons/icons'
import './Header.css'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const relPath = location.pathname.replace(/^\/member\/fehe\/?/, '')
  const activePage = relPath === '' ? 'home' : relPath.split('/')[0]

  function switchPage(path) {
    navigate(path)
    setDrawerOpen(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <header>
        <button className="header-logo" onClick={() => switchPage('/member/fehe')}>
          페헤<span>/ Fehe</span>
        </button>
        <button
          className={`hamburger ${drawerOpen ? 'open' : ''}`}
          aria-label="메뉴"
          onClick={() => setDrawerOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </header>

      <div className={`overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />

      <nav className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <p className="drawer-label">메뉴</p>
        <button
          className={`drawer-btn ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => switchPage('/member/fehe')}
        >
          <IconHome /> 홈
        </button>
        <button
          className={`drawer-btn ${activePage === 'youtube' ? 'active' : ''}`}
          onClick={() => switchPage('/member/fehe/youtube')}
        >
          <IconYoutube /> YouTube 영상
        </button>
<button
          className={`drawer-btn ${activePage === 'status' ? 'active' : ''}`}
          onClick={() => switchPage('/member/fehe/status')}
        >
          <IconStatus /> 서버 상태
        </button>

        <div className="drawer-divider" />
        <p className="drawer-label">외부 링크</p>

        <a
          className="drawer-btn yt-btn"
          href="https://www.youtube.com/@fehe1234"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
        >
          <IconYoutube /> 유튜브 채널
        </a>
        <a
          className="drawer-btn gh-btn"
          href="https://github.com/Fehe1234"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
        >
          <IconGithub /> GitHub
        </a>
        <a
          className="drawer-btn"
          href="https://steamcommunity.com/profiles/76561199008770006/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
          style={{ color: '#1b6fa8' }}
        >
          <IconSteam /> Steam
        </a>
        <a
          className="drawer-btn"
          href="https://www.instagram.com/fehe_developer/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
          style={{ color: '#e1306c' }}
        >
          <IconInstagram /> Instagram
        </a>
      </nav>
    </>
  )
}
