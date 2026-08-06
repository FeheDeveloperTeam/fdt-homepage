import { NavLink, Outlet } from 'react-router-dom'
import { JAVA_WIKI } from '../../javaWikiData'
import './WikiLayout.css'

export default function WikiLayout() {
  return (
    <div className="mcwiki-shell">
      <aside className="mcwiki-sidebar mc-panel">
        <NavLink to="/wiki/minecraft/java" end className="mcwiki-index-link">
          자바 에디션
        </NavLink>

        <nav className="mcwiki-nav">
          {JAVA_WIKI.map((group) => (
            <div className="mcwiki-nav-group" key={group.category}>
              <p className="mcwiki-nav-label">{group.category}</p>
              {group.entries.map((entry) => (
                <NavLink
                  key={entry.slug}
                  to={`/wiki/minecraft/java/${entry.slug}`}
                  className={({ isActive }) =>
                    'mcwiki-nav-link' + (isActive ? ' mcwiki-nav-link--active' : '')
                  }
                >
                  {entry.label}
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
