import { NavLink, Outlet, Link } from 'react-router-dom'
import { useDiscordUser } from '../../hooks/useDiscordUser'
import './AdminLayout.css'

const MENU = [
  {
    label: '개요',
    items: [{ label: '대시보드', to: '/DiscordBot/Chiyumi/admin', end: true }],
  },
  {
    label: '이용자 관리',
    items: [
      { label: '이용제한 설정', to: '/DiscordBot/Chiyumi/admin/restrict' },
      { label: '이용제한 해제', to: '/DiscordBot/Chiyumi/admin/unrestrict' },
      { label: '이용제한 확인', to: '/DiscordBot/Chiyumi/admin/check' },
    ],
  },
  {
    label: '데이터 조회',
    items: [{ label: '구글 시트', to: '/DiscordBot/Chiyumi/admin/sheets' }],
  },
  {
    label: '팀 관리',
    items: [{ label: '관리자 관리', to: '/DiscordBot/Chiyumi/admin/admins' }],
  },
]

export default function AdminLayout() {
  const { user, loading } = useDiscordUser()

  if (loading) return null

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-page admin-page--denied">
        <p className="admin-denied-title">권한이 없어요</p>
        <p className="admin-denied-desc">이 페이지는 관리자만 볼 수 있어요.</p>
        <Link to="/DiscordBot/Chiyumi" className="admin-denied-back">
          치유미 홈으로
        </Link>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-user">
          <img src={user.avatar} alt="" className="admin-sidebar-avatar" />
          <div className="admin-sidebar-user-info">
            <strong>{user.username}</strong>
            <span>관리자</span>
          </div>
        </div>

        <nav className="admin-nav">
          {MENU.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p className="admin-nav-label">{group.label}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    'admin-nav-link' + (isActive ? ' admin-nav-link--active' : '')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <Outlet context={{ user }} />
      </div>
    </div>
  )
}
