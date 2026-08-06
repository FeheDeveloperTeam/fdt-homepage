import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { JAVA_WIKI } from '../../javaWikiData'
import './WikiLayout.css'

export default function WikiLayout() {
  const [collapsed, setCollapsed] = useState(() => new Set())

  function toggleGroup(category) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  return (
    <div className="mcwiki-shell">
      <aside className="mcwiki-sidebar">
        <NavLink to="/wiki/minecraft/java" end className="mcwiki-index-link">
          자바 에디션
        </NavLink>

        <nav className="mcwiki-nav">
          {JAVA_WIKI.map((group) => {
            const isOpen = !collapsed.has(group.category)
            return (
              <div className="mcwiki-nav-group" key={group.category}>
                <button
                  type="button"
                  className="mcwiki-nav-label"
                  onClick={() => toggleGroup(group.category)}
                  aria-expanded={isOpen}
                >
                  <span className={'mcwiki-nav-arrow' + (isOpen ? ' mcwiki-nav-arrow--open' : '')}>
                    ▸
                  </span>
                  {group.category}
                </button>
                {isOpen && (
                  <div className="mcwiki-nav-items">
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
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="mcwiki-content">
        <Outlet />
      </div>
    </div>
  )
}
