import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import './WikiHomePage.css'

const EDITIONS = [
  {
    key: 'java',
    label: '자바 에디션 (PC)',
    desc: 'Windows/macOS/Linux에서 실행되는 오리지널 에디션이에요.',
    to: '/wiki/minecraft/java',
  },
  {
    key: 'bedrock',
    label: '베드락 에디션',
    desc: '모바일/콘솔/Windows에서 실행되는 크로스플랫폼 에디션이에요.',
    to: '/wiki/minecraft/bedrock',
  },
]

export default function WikiHomePage() {
  useDocumentTitle('마인크래프트 위키', '마인크래프트 위키')

  return (
    <section className="wiki-landing">
      <div className="wiki-landing-header wiki-reveal" style={{ '--reveal-i': 0 }}>
        <p className="wiki-hero-eyebrow">Minecraft Wiki</p>
        <h1 className="wiki-hero-title">마인크래프트 위키</h1>
        <p className="wiki-hero-desc">
          일반적인 마인크래프트 사용법, 모드, 명령어를 정리해둔 위키예요. 에디션을
          선택해서 문서를 확인해보세요.
        </p>
      </div>

      <div className="wiki-edition-grid">
        {EDITIONS.map((edition, i) => (
          <Link
            key={edition.key}
            to={edition.to}
            className={`mc-panel wiki-edition-card wiki-edition-card--${edition.key} wiki-reveal`}
            style={{ '--reveal-i': i + 1 }}
          >
            <span className="wiki-edition-card-label">{edition.label}</span>
            <span className="wiki-edition-card-desc">{edition.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
