import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useParams, Link } from 'react-router-dom'
import { useDiscordUser } from '../../hooks/useDiscordUser'
import { callGuildApi } from '../guildApi'
import './GuildLayout.css'

const MENU = [
  { label: '로그', to: 'log' },
  { label: '입퇴장', to: 'welcome' },
  { label: '티켓', to: 'ticket' },
  { label: '경고', to: 'warn' },
  { label: '모데레이션', to: 'moderation' },
  { label: '검열 · 스팸 · 레이드', to: 'censor' },
  { label: '끝말잇기', to: 'wordchain' },
  { label: '방송알림', to: 'streamalert' },
]

export default function GuildLayout() {
  const { guildId } = useParams()
  const { user, loading: userLoading } = useDiscordUser()

  const [meta, setMeta] = useState(null)
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)

  const refreshConfig = useCallback(() => {
    return callGuildApi(`/api/guild?resource=config&guildId=${guildId}`)
      .then((data) => setConfig(data.config))
      .catch((err) => setError(err.message))
  }, [guildId])

  useEffect(() => {
    if (!user) return
    setError(null)
    // meta 요청 하나에 config까지 같이 받는다 — 인증 체크가 걸린 요청을 동시에
    // 여러 개 날리면 디스코드 API rate limit에 걸릴 수 있어서 하나로 합쳤다.
    callGuildApi(`/api/guild?resource=meta&guildId=${guildId}`)
      .then((data) => {
        setMeta(data)
        setConfig(data.config)
      })
      .catch((err) => setError(err.message))
  }, [guildId, user])

  if (userLoading) return null

  if (!user) {
    return (
      <div className="admin-page admin-page--denied">
        <p className="admin-denied-title">로그인이 필요해요</p>
        <Link to="/DiscordBot/Chiyumi/servers" className="admin-denied-back">
          내 서버로 돌아가기
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page admin-page--denied">
        <p className="admin-denied-title">이 서버를 관리할 수 없어요</p>
        <p className="admin-denied-desc">{error}</p>
        <Link to="/DiscordBot/Chiyumi/servers" className="admin-denied-back">
          내 서버로 돌아가기
        </Link>
      </div>
    )
  }

  if (!meta || !config) return null

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-user">
          {meta.guild.icon ? (
            <img src={meta.guild.icon} alt="" className="admin-sidebar-avatar" />
          ) : (
            <span className="admin-sidebar-avatar guild-sidebar-fallback">{meta.guild.name.slice(0, 1)}</span>
          )}
          <div className="admin-sidebar-user-info">
            <strong>{meta.guild.name}</strong>
            <span>서버 설정</span>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-group">
            {MENU.map((item) => (
              <NavLink
                key={item.to}
                to={`/DiscordBot/Chiyumi/servers/${guildId}/${item.to}`}
                className={({ isActive }) =>
                  'admin-nav-link' + (isActive ? ' admin-nav-link--active' : '')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Link to="/DiscordBot/Chiyumi/servers" className="admin-nav-link guild-nav-back">
            ← 다른 서버
          </Link>
        </nav>
      </aside>

      <div className="admin-content">
        <Outlet
          context={{
            guildId,
            channels: meta.channels,
            roles: meta.roles,
            config,
            refreshConfig,
          }}
        />
      </div>
    </div>
  )
}
