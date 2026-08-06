import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

export default function BedrockIndexPage() {
  useDocumentTitle('베드락 에디션', '마인크래프트 위키')

  return (
    <div className="wiki-standalone">
      <div className="wiki-content-panel wiki-reveal" style={{ '--reveal-i': 0 }}>
        <span className="wiki-page-category">BEDROCK EDITION</span>
        <h1 className="wiki-page-title">베드락 에디션</h1>
        <div className="wiki-page-body">
          <p>준비 중입니다.</p>
        </div>
        <Link
          to="/wiki/minecraft"
          className="mc-btn"
          style={{ marginTop: '1.4rem', display: 'inline-block' }}
        >
          ← 에디션 다시 고르기
        </Link>
      </div>
    </div>
  )
}
