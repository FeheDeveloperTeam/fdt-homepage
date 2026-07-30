import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="chiyumi-footer">
      <p>&copy; {year} <span>치유미 (Chiyumi)</span> · Developed by FeheDeveloperTeam</p>
      <Link className="chiyumi-footer-link" to="/projects">
        FDT의 다른 프로젝트도 보러가기 →
      </Link>
    </footer>
  )
}
