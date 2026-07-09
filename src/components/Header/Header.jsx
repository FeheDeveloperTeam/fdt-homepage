import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../../assets/images/logo/fdt-logo-square.png'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: '/', label: '홈' },
  { to: '/about', label: '팀 소개' },
  { to: '/services', label: '서비스' },
  { to: '/projects', label: '프로젝트' },
  { to: '/contact', label: '문의' },
]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="FDT 로고" className={styles.logoImage} />
          FDT
        </Link>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : undefined
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default Header
