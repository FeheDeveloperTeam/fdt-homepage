import { Link } from 'react-router-dom'
import './Header.css'

function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5Z" strokeLinejoin="round" />
      <path d="M12.5 7.5l4 4" />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="suneung-header">
      <div className="suneung-header-inner">
        <Link className="suneung-back" to="/projects/general">
          ← FDT
        </Link>
        <span className="suneung-header-divider" aria-hidden="true" />
        <Link className="suneung-logo" to="/utility/suneung">
          <IconPencil />
          수능 카운트다운
        </Link>
        <span className="suneung-header-tz">한국 시간 KST</span>
      </div>
    </header>
  )
}
