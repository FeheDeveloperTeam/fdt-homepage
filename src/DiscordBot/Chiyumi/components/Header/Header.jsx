import { Link } from 'react-router-dom'
import chiyumiPhoto from '../../../../assets/images/projects/chiyumi.png'
import { useDiscordUser } from '../../hooks/useDiscordUser'
import './Header.css'

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1517170922732388423&scope=bot&permissions=0'

export default function Header() {
  const { user, loading } = useDiscordUser()

  return (
    <header className="chiyumi-header">
      <Link className="chiyumi-logo" to="/DiscordBot/Chiyumi">
        <img src={chiyumiPhoto} alt="" className="chiyumi-logo-photo" />
        치유미
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
        {!loading && (
          user ? (
            <div className="chiyumi-user">
              <img src={user.avatar} alt="" className="chiyumi-user-avatar" />
              <span className="chiyumi-user-name">{user.username}</span>
              <a className="chiyumi-logout" href="/api/auth/logout">
                로그아웃
              </a>
            </div>
          ) : (
            <a className="chiyumi-login" href="/api/auth/discord/login">
              Discord로 로그인
            </a>
          )
        )}
      </div>
    </header>
  )
}
