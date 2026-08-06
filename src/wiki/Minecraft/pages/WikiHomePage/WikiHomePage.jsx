import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import './WikiHomePage.css'

export default function WikiHomePage() {
  useDocumentTitle('마인크래프트 위키', '마인크래프트 위키')

  return (
    <section className="wiki-hero">
      <p className="wiki-hero-eyebrow wiki-reveal" style={{ '--reveal-i': 0 }}>
        Minecraft Wiki
      </p>
      <h1 className="wiki-hero-title wiki-reveal" style={{ '--reveal-i': 1 }}>
        마인크래프트 위키
      </h1>
      <p className="wiki-hero-desc wiki-reveal" style={{ '--reveal-i': 2 }}>
        준비 중입니다.
      </p>
    </section>
  )
}
