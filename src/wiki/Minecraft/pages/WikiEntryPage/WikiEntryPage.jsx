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
  const lines = code.split('\n')
  const [copiedIndex, setCopiedIndex] = useState(null)

  async function handleCopy(line, index) {
    try {
      await navigator.clipboard.writeText(line)
      setCopiedIndex(index)
      setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current))
      }, 1500)
    } catch {
      // 클립보드 권한이 없는 환경 — 버튼은 그대로 두고 무시
    }
  }

  return (
    <div className="wiki-page-code-group">
      {lines.map((line, index) => (
        <div className="wiki-page-code" key={index}>
          <span className="wiki-page-code-icon" aria-hidden="true">
            &gt;
          </span>
          <code>{line}</code>
          <button
            type="button"
            className="wiki-page-code-copy"
            onClick={() => handleCopy(line, index)}
          >
            {copiedIndex === index ? '복사됨' : '복사'}
          </button>
        </div>
      ))}
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
