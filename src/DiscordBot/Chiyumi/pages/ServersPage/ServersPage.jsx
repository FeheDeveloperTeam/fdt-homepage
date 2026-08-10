import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { useDiscordUser } from '../../hooks/useDiscordUser'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'
import './ServersPage.css'

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1517170922732388423&scope=bot&permissions=0'

export default function ServersPage() {
  useDocumentTitle('내 서버', 'Chiyumi')
  const { user, loading: userLoading } = useDiscordUser()

  const [guilds, setGuilds] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    callGuildApi('/api/guild?resource=guilds')
      .then((data) => setGuilds(data.guilds))
      .catch((err) => setError(err.message))
  }, [user])

  if (userLoading) return null

  if (!user) {
    return (
      <div className="servers-page">
        <p className="eyebrow">Server Dashboard</p>
        <h1 className="admin-page-title">내 서버</h1>
        <p className="admin-page-desc">
          치유미가 들어와 있는 서버에서 서버 관리 권한이 있다면, 디스코드 앱 밖에서도 설정을 바꿀 수
          있어요. 먼저 디스코드로 로그인해주세요.
        </p>
        <a className="admin-btn admin-btn--accent" href="/api/auth/discord/login">
          Discord로 로그인
        </a>
      </div>
    )
  }

  return (
    <div className="servers-page">
      <p className="eyebrow">Server Dashboard</p>
      <h1 className="admin-page-title">내 서버</h1>
      <p className="admin-page-desc">
        치유미가 들어와 있고, 서버 관리(Manage Server) 권한을 가진 서버만 여기 나와요.
      </p>

      {error && (
        <div>
          <p className="admin-status admin-status--error">{error}</p>
          {error.includes('로그인') && (
            <a className="admin-btn admin-btn--accent" href="/api/auth/discord/login" style={{ marginTop: '0.8rem', display: 'inline-block' }}>
              다시 로그인
            </a>
          )}
        </div>
      )}
      {!guilds && !error && <p className="admin-chart-empty">불러오는 중이에요…</p>}

      {guilds && guilds.length === 0 && (
        <p className="admin-chart-empty">
          관리 권한을 가진 서버 중 치유미가 들어와 있는 서버가 없어요. 아래에서 먼저 서버에 초대해보세요.
        </p>
      )}

      {guilds && (
        <div className="servers-grid">
          {guilds.map((g) => (
            <Link to={`/DiscordBot/Chiyumi/servers/${g.id}`} className="servers-card" key={g.id}>
              {g.icon ? (
                <img src={g.icon} alt="" className="servers-card-icon" />
              ) : (
                <span className="servers-card-icon servers-card-icon--fallback">{g.name.slice(0, 1)}</span>
              )}
              <div className="servers-card-body">
                <span className="servers-card-name">{g.name}</span>
                <span className="servers-card-id">{g.id}</span>
              </div>
              <span className="servers-card-arrow" aria-hidden="true">→</span>
            </Link>
          ))}

          <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="servers-card servers-card--add">
            <span className="servers-card-icon servers-card-icon--add">+</span>
            <div className="servers-card-body">
              <span className="servers-card-name">치유미 초대하기</span>
              <span className="servers-card-id">새 서버에 봇을 추가해요</span>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}
