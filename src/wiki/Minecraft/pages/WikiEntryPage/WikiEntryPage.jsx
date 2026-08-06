import { Navigate, useParams } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { findJavaEntry } from '../../javaWikiData'
import '../WikiPage.css'

export default function WikiEntryPage() {
  const { slug } = useParams()
  const entry = findJavaEntry(slug)

  useDocumentTitle(entry?.label || '문서를 찾을 수 없어요', '마인크래프트 위키')

  if (!entry) {
    return <Navigate to="/wiki/minecraft/java" replace />
  }

  return (
    <div className="wiki-content-panel wiki-reveal" style={{ '--reveal-i': 0 }}>
      <span className="wiki-page-category">{entry.category}</span>
      <h1 className="wiki-page-title">{entry.label}</h1>
      {entry.code && <code className="wiki-page-code">{entry.code}</code>}

      <div className="wiki-page-body">
        {entry.body.map((paragraph) => (
          <p key={paragraph.slice(0, 20)}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}
