import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { JAVA_WIKI } from '../../javaWikiData'
import '../WikiPage.css'

export default function JavaIndexPage() {
  useDocumentTitle('자바 에디션', '마인크래프트 위키')

  return (
    <div className="wiki-content-panel wiki-reveal" style={{ '--reveal-i': 0 }}>
      <span className="wiki-page-category">JAVA EDITION</span>
      <h1 className="wiki-page-title">자바 에디션</h1>
      <div className="wiki-page-body">
        <p>
          Windows/macOS/Linux에서 실행되는 자바 에디션 문서 목차예요. 왼쪽 메뉴나 아래
          목록에서 원하는 문서를 열어보세요.
        </p>
      </div>

      <div className="wiki-index-groups">
        {JAVA_WIKI.map((group) => (
          <div key={group.category}>
            <p className="wiki-index-group-title">{group.category}</p>
            <div className="wiki-index-items">
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
    </div>
  )
}
