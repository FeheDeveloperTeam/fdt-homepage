import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { JAVA_WIKI } from '../../javaWikiData'
import '../WikiPage.css'
import './WikiHomePage.css'

export default function WikiHomePage() {
  useDocumentTitle('마인크래프트 위키', '마인크래프트 위키')

  return (
    <section className="wiki-landing">
      <header className="wiki-landing-header wiki-reveal" style={{ '--reveal-i': 0 }}>
        <p className="wiki-hero-eyebrow">Minecraft Wiki</p>
        <h1 className="wiki-hero-title">마인크래프트 위키</h1>
        <p className="wiki-hero-desc">
          일반적인 마인크래프트 사용법, 모드, 명령어를 정리해둔 위키예요. 아래 목록에서
          바로 문서를 열어보세요.
        </p>
      </header>

      <div className="wiki-landing-grid">
        {JAVA_WIKI.map((group, i) => (
          <div
            key={group.category}
            className="mc-panel wiki-landing-card wiki-reveal"
            style={{ '--reveal-i': i + 1 }}
          >
            <h2 className="wiki-landing-card-title">{group.category}</h2>
            <div className="wiki-landing-card-items">
              {group.entries.map((entry) => (
                <Link
                  key={entry.slug}
                  to={`/wiki/minecraft/java/${entry.slug}`}
                  className="wiki-index-item"
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
