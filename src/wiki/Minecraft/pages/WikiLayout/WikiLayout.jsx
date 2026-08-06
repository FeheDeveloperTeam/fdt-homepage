import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { JAVA_WIKI } from '../../javaWikiData'
import './WikiLayout.css'

export default function WikiLayout() {
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [query, setQuery] = useState('')

  function toggleGroup(category) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const trimmedQuery = query.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0

  const visibleGroups = useMemo(() => {
    if (!isSearching) return JAVA_WIKI
    return JAVA_WIKI.map((group) => ({
      ...group,
      entries: group.entries.filter(
        (entry) =>
          entry.label.toLowerCase().includes(trimmedQuery) ||
          entry.slug.toLowerCase().includes(trimmedQuery),
      ),
    })).filter((group) => group.entries.length > 0)
  }, [isSearching, trimmedQuery])

  return (
    <div className="mcwiki-shell">
      <aside className="mcwiki-sidebar">
        <NavLink to="/wiki/minecraft/java" end className="mcwiki-index-link">
          자바 에디션
        </NavLink>

        <div className="mcwiki-search">
          <input
            type="text"
            className="mcwiki-search-input"
            placeholder="문서 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <button
              type="button"
              className="mcwiki-search-clear"
              onClick={() => setQuery('')}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="mcwiki-nav">
          {isSearching && visibleGroups.length === 0 ? (
            <p className="mcwiki-search-empty">검색 결과가 없어요.</p>
          ) : (
            visibleGroups.map((group) => {
              const isOpen = isSearching || !collapsed.has(group.category)
              return (
                <div className="mcwiki-nav-group" key={group.category}>
                  <button
                    type="button"
                    className="mcwiki-nav-label"
                    onClick={() => toggleGroup(group.category)}
                    aria-expanded={isOpen}
                    disabled={isSearching}
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
            })
          )}
        </nav>
      </aside>

      <div className="mcwiki-content">
        <Outlet />
      </div>
    </div>
  )
}
