import { Link } from 'react-router-dom'
import './Header.css'

function IconPulse() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12h4l2-6 3 12 2-9 1.5 3h6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="nettest-header">
      <div className="nettest-header-left">
        <Link className="nettest-back" to="/projects">
          ← FDT
        </Link>
        <span className="nettest-header-divider" />
        <Link className="nettest-logo" to="/utility/network-test">
          <IconPulse />
          네트워크 테스트
        </Link>
      </div>
    </header>
  )
}
