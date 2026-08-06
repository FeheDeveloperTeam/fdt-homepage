import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

export default function BedrockServerPage() {
  useDocumentTitle('베드락 에디션 서버 운영', '마인크래프트 위키')

  return (
    <div>
      <span
        className="wiki-edition-badge wiki-edition-badge--bedrock wiki-reveal"
        style={{ '--reveal-i': 0 }}
      >
        BEDROCK EDITION
      </span>
      <h1 className="wiki-page-title wiki-reveal" style={{ '--reveal-i': 1 }}>
        서버 운영
      </h1>
      <p className="wiki-page-desc wiki-reveal" style={{ '--reveal-i': 2 }}>
        베드락 에디션은 Mojang이 제공하는 전용 서버 프로그램(BDS)으로 서버를 열어요.
        자바 에디션과 설정 방식이 비슷해 보이지만 세부적으로는 달라요.
      </p>

      <section className="wiki-section">
        <h2 className="wiki-section-title">Bedrock Dedicated Server (BDS)</h2>
        <p className="wiki-section-body">
          Minecraft 공식 사이트에서 Windows/Linux용 BDS를 내려받을 수 있어요. 압축을 풀고
          실행 파일을 실행하면 바로 서버가 켜져요 — 자바 에디션과 달리 별도 런타임 설치가
          필요 없어요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">주요 설정 (server.properties)</h2>
        <p className="wiki-section-body">
          이름은 자바 에디션과 같지만 항목은 다른 경우가 많아요.
        </p>
        <div className="wiki-list">
          <div className="wiki-list-item">
            <strong>server-port / server-portv6</strong>
            IPv4/IPv6 접속 포트 (기본 <span className="wiki-code">19132</span>, UDP —
            자바 에디션의 25565/TCP와는 다른 포트·프로토콜이에요)
          </div>
          <div className="wiki-list-item">
            <strong>gamemode</strong>
            기본 게임 모드
          </div>
          <div className="wiki-list-item">
            <strong>max-players</strong>
            동시 접속 가능 인원 수
          </div>
          <div className="wiki-list-item">
            <strong>online-mode</strong>
            Xbox Live 인증 여부 — true면 인증된 마이크로소프트 계정만 접속 가능
          </div>
          <div className="wiki-list-item">
            <strong>allow-cheats</strong>
            치트(명령어) 허용 여부
          </div>
        </div>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">권한 · 화이트리스트</h2>
        <p className="wiki-section-body">
          운영자 권한은 <span className="wiki-code">permissions.json</span> 파일에서
          플레이어의 Xbox User ID(XUID)를 등록해 부여해요. 특정 플레이어만 접속하게
          하려면 <span className="wiki-code">allowlist.json</span>(화이트리스트)을
          사용하면 돼요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">외부 접속 (포트포워딩)</h2>
        <p className="wiki-section-body">
          기본 포트인 <span className="wiki-code">19132(UDP)</span>를 공유기에서
          서버 컴퓨터로 포트포워딩해야 외부에서 접속할 수 있어요. 자바 에디션이 TCP를
          쓰는 것과 달리 베드락은 UDP를 쓴다는 점을 헷갈리지 않아야 해요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">서드파티 소프트웨어</h2>
        <p className="wiki-section-body">
          <strong className="wiki-code">PocketMine-MP</strong>처럼 플러그인을 지원하는
          비공식 서버 소프트웨어도 있어요. 공식 BDS보다 커스터마이징 폭이 넓지만, 공식
          지원 대상은 아니라는 점을 참고하세요.
        </p>
      </section>
    </div>
  )
}
