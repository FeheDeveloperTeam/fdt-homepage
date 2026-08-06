import { Link } from 'react-router-dom'
import grassIcon from '../../../../assets/images/wiki/minecraft-grass-icon.svg'
import './Header.css'

export default function Header() {
  return (
    <header className="mcwiki-header">
      <div className="mcwiki-header-left">
        <Link className="mcwiki-back" to="/projects">
          ← FDT
        </Link>
        <span className="mcwiki-header-divider" />
        <Link className="mcwiki-logo" to="/wiki/minecraft">
          <img src={grassIcon} alt="" className="mcwiki-logo-icon" />
          마인크래프트 위키
        </Link>
      </div>
    </header>
  )
}
