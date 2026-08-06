import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import './WikiLayout.css'

const MENU = {
  java: {
    label: '자바 에디션 (PC)',
    items: [
      { label: '개요', to: '/wiki/minecraft/java', end: true },
      { label: '서버 운영', to: '/wiki/minecraft/java/server' },
      { label: '모드', to: '/wiki/minecraft/java/mods' },
    ],
  },
  bedrock: {
    label: '베드락 에디션',
    items: [
      { label: '개요', to: '/wiki/minecraft/bedrock', end: true },
      { label: '서버 운영', to: '/wiki/minecraft/bedrock/server' },
      { label: '애드온 (모드)', to: '/wiki/minecraft/bedrock/addons' },
    ],
  },
}

export default function WikiLayout() {
  const { pathname } = useLocation()
  const edition = pathname.startsWith('/wiki/minecraft/bedrock') ? 'bedrock' : 'java'
  const otherEdition = edition === 'java' ? 'bedrock' : 'java'
  const group = MENU[edition]

  return (
    <div className="mcwiki-shell">
      <aside className="mcwiki-sidebar">
        <nav className="mcwiki-nav">
          <div className="mcwiki-nav-group">
            <p className={`mcwiki-nav-label mcwiki-nav-label--${edition}`}>{group.label}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  'mcwiki-nav-link' + (isActive ? ' mcwiki-nav-link--active' : '')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <Link to={`/wiki/minecraft/${otherEdition}`} className="mcwiki-switch-edition">
          {MENU[otherEdition].label} 보기 →
        </Link>
      </aside>

      <div className="mcwiki-content">
        <Outlet />
      </div>
    </div>
  )
}
