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
      <div className="chiyumi-header-left">
        <Link className="chiyumi-back" to="/projects">
          ← FDT
        </Link>
        <span className="chiyumi-header-divider" />
        <Link className="chiyumi-logo" to="/DiscordBot/Chiyumi">
          <img src={chiyumiPhoto} alt="" className="chiyumi-logo-photo" />
          치유미
        </Link>
      </div>
      <div className="chiyumi-header-actions">
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
              {user.isAdmin && (
                <Link className="chiyumi-admin-btn" to="/DiscordBot/Chiyumi/admin">
                  관리자
                </Link>
              )}
              <img src={user.avatar} alt="" className="chiyumi-user-avatar" />
              <span className="chiyumi-user-name">{user.username}</span>
              <a className="chiyumi-logout" href="/api/auth/logout">
                로그아웃
              </a>
            </div>
          ) : (
            <a className="chiyumi-login-btn" href="/api/auth/discord/login">
              Discord로 로그인
            </a>
          )
        )}
      </div>
    </header>
  )
}
