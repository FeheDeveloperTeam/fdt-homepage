import { Link } from 'react-router-dom'
import Logo from '../Logo/Logo'
import './Header.css'

const SECTIONS = [
  { href: '#practice', label: '실전 타이머' },
  { href: '#timetable', label: '시간표' },
  { href: '#upcoming', label: '수능 날짜' },
  { href: '#cheer', label: '응원 문구' },
]

export default function Header() {
  return (
    <header className="suneung-header">
      <div className="suneung-header-inner">
        <Link className="suneung-back" to="/projects/general">
          ← FDT
        </Link>
        <span className="suneung-header-divider" aria-hidden="true" />
        <Link className="suneung-logo" to="/utility/suneung">
          <Logo size={26} className="suneung-logo-mark" />
          <span>
            수능 <b>D-Day</b> 타이머
          </span>
        </Link>
        <nav className="suneung-header-nav" aria-label="페이지 안 바로가기">
          {SECTIONS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <span className="suneung-header-tz">KST</span>
      </div>
    </header>
  )
}
