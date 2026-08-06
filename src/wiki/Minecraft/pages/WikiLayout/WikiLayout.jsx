import { NavLink, Outlet } from 'react-router-dom'
import './WikiLayout.css'

const MENU = [
  {
    label: '자바 에디션 (PC)',
    key: 'java',
    items: [{ label: '개요', to: '/wiki/minecraft/java' }],
  },
  {
    label: '베드락 에디션',
    key: 'bedrock',
    items: [{ label: '개요', to: '/wiki/minecraft/bedrock' }],
  },
]

export default function WikiLayout() {
  return (
    <div className="mcwiki-shell">
      <aside className="mcwiki-sidebar">
        <nav className="mcwiki-nav">
          {MENU.map((group) => (
            <div className="mcwiki-nav-group" key={group.key}>
              <p className={`mcwiki-nav-label mcwiki-nav-label--${group.key}`}>{group.label}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    'mcwiki-nav-link' + (isActive ? ' mcwiki-nav-link--active' : '')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="mcwiki-content">
        <Outlet />
      </div>
    </div>
  )
}
