import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { findJavaEntry } from '../../javaWikiData'
import '../WikiPage.css'

function renderInlineCommands(text) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code className="wiki-inline-code" key={i}>
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  )
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 권한이 없는 환경 — 버튼은 그대로 두고 무시
    }
  }

  return (
    <div className="wiki-page-code">
      <span className="wiki-page-code-icon" aria-hidden="true">
        &gt;
      </span>
      <code>{code}</code>
      <button type="button" className="wiki-page-code-copy" onClick={handleCopy}>
        {copied ? '복사됨' : '복사'}
      </button>
    </div>
  )
}

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
            {section.code && <CodeBlock code={section.code} />}
            <div className="wiki-page-body">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 20)}>{renderInlineCommands(paragraph)}</p>
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
