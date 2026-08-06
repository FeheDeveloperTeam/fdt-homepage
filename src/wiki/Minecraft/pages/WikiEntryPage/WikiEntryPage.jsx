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

      {entry.sections ? (
        entry.sections.map((section) => (
          <section className="wiki-page-section" key={section.title}>
            <h2 className="wiki-page-section-title">{section.title}</h2>
            {section.code && (
              <div className="wiki-page-code">
                <span className="wiki-page-code-icon" aria-hidden="true">
                  &gt;
                </span>
                <code>{section.code}</code>
              </div>
            )}
            <div className="wiki-page-body">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 20)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="wiki-page-body">
          {entry.body.map((paragraph) => (
            <p key={paragraph.slice(0, 20)}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  )
}
