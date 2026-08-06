import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import './WikiHomePage.css'

export default function WikiHomePage() {
  useDocumentTitle('마인크래프트 위키', '마인크래프트 위키')

  return (
    <section className="wiki-hero">
      <div className="wiki-hero-panel mc-panel wiki-reveal" style={{ '--reveal-i': 0 }}>
        <p className="wiki-hero-eyebrow">Minecraft Wiki</p>
        <h1 className="wiki-hero-title">마인크래프트 위키</h1>
        <p className="wiki-hero-desc">
          일반적인 마인크래프트 사용법, 모드, 명령어를 정리해둔 위키예요.
        </p>

        <Link to="/wiki/minecraft/java" className="mc-btn wiki-hero-btn">
          자바 에디션 보러가기 →
        </Link>
      </div>
    </section>
  )
}
