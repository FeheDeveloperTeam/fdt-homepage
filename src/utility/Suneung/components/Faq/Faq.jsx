import './Faq.css'

// 수능 날짜·시간·성적 통지 등 자주 묻는 질문. 같은 내용이 FAQPage 구조화 데이터로도 들어간다.
export default function Faq({ items }) {
  return (
    <section className="suneung-section" id="faq" aria-labelledby="faq-title" data-reveal>
      <div className="suneung-section-head">
        <h2 id="faq-title" className="suneung-section-title">
          수능 날짜·시간 자주 묻는 질문
        </h2>
        <p className="suneung-section-desc">날짜·시작 시각·과목별 시간·성적 발표를 한곳에 모았습니다</p>
      </div>
      <div className="faq-list">
        {items.map((item, index) => (
          <details key={item.q} className="faq-item" open={index < 2}>
            <summary className="faq-q">
              <span className="faq-mark" aria-hidden="true">Q</span>
              <span>{item.q}</span>
            </summary>
            <p className="faq-a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
