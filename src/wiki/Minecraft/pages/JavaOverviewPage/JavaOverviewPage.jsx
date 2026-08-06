import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

const PAGES = [
  { label: '서버 운영', desc: '내 서버를 여는 방법과 주요 설정', to: '/wiki/minecraft/java/server' },
  { label: '모드', desc: '모드 로더 종류와 설치 방법', to: '/wiki/minecraft/java/mods' },
]

export default function JavaOverviewPage() {
  useDocumentTitle('자바 에디션', '마인크래프트 위키')

  return (
    <div>
      <span
        className="wiki-edition-badge wiki-edition-badge--java wiki-reveal"
        style={{ '--reveal-i': 0 }}
      >
        JAVA EDITION
      </span>
      <h1 className="wiki-page-title wiki-reveal" style={{ '--reveal-i': 1 }}>
        자바 에디션 (PC)
      </h1>
      <p className="wiki-page-desc wiki-reveal" style={{ '--reveal-i': 2 }}>
        Windows/macOS/Linux에서 실행되는 자바 에디션의 사용법과 명령어를 정리하는
        공간이에요. 왼쪽 메뉴에서 원하는 문서를 찾아보세요.
      </p>

      <div className="wiki-list" style={{ marginTop: '2rem' }}>
        {PAGES.map((page, i) => (
          <Link
            key={page.to}
            to={page.to}
            className="wiki-list-item wiki-reveal"
            style={{ '--reveal-i': i + 3 }}
          >
            <strong>{page.label}</strong>
            {page.desc}
          </Link>
        ))}
      </div>
    </div>
  )
}
