import { Link } from 'react-router-dom'
import './Header.css'

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1517170922732388423&scope=bot&permissions=0'

export default function Header() {
  return (
    <header className="chiyumi-header">
      <Link className="chiyumi-logo" to="/DiscordBot/Chiyumi">
        🐾 <span>치유미</span>
      </Link>
      <div className="chiyumi-header-actions">
        <Link className="chiyumi-back" to="/projects">
          FDT로 돌아가기
        </Link>
        <a
          className="chiyumi-invite-btn"
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          초대하기
        </a>
      </div>
    </header>
  )
}
