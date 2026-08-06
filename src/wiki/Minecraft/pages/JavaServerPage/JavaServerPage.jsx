import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

export default function JavaServerPage() {
  useDocumentTitle('자바 에디션 서버 운영', '마인크래프트 위키')

  return (
    <div>
      <span
        className="wiki-edition-badge wiki-edition-badge--java wiki-reveal"
        style={{ '--reveal-i': 0 }}
      >
        JAVA EDITION
      </span>
      <h1 className="wiki-page-title wiki-reveal" style={{ '--reveal-i': 1 }}>
        서버 운영
      </h1>
      <p className="wiki-page-desc wiki-reveal" style={{ '--reveal-i': 2 }}>
        자바 에디션은 Mojang이 공식 제공하는 서버 프로그램으로 누구나 직접 서버를 열 수
        있어요. 기본 개념과 자주 쓰는 설정을 정리했어요.
      </p>

      <section className="wiki-section">
        <h2 className="wiki-section-title">준비물</h2>
        <p className="wiki-section-body">
          서버를 실행하려면 <span className="wiki-code">Java</span>가 설치되어 있어야 해요
          (최신 버전은 Java 21 이상을 요구해요). Mojang 공식 사이트에서 실행하려는
          마인크래프트 버전에 맞는 <span className="wiki-code">server.jar</span> 파일을
          받으면 돼요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">최초 실행</h2>
        <p className="wiki-section-body">
          <span className="wiki-code">server.jar</span>를 처음 실행하면{' '}
          <span className="wiki-code">eula.txt</span> 파일이 생기는데, 안에{' '}
          <span className="wiki-code">eula=false</span>를{' '}
          <span className="wiki-code">eula=true</span>로 바꿔야 서버가 켜져요 (Mojang
          사용권 계약에 동의한다는 의미예요). 그다음부터는{' '}
          <span className="wiki-code">java -Xmx4G -Xms1G -jar server.jar nogui</span> 처럼
          실행하면 되고, <span className="wiki-code">-Xmx</span>는 서버에 할당할 최대
          메모리예요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">주요 설정 (server.properties)</h2>
        <div className="wiki-list">
          <div className="wiki-list-item">
            <strong>gamemode</strong>
            기본 게임 모드 (survival / creative / adventure)
          </div>
          <div className="wiki-list-item">
            <strong>difficulty</strong>
            난이도 (peaceful / easy / normal / hard)
          </div>
          <div className="wiki-list-item">
            <strong>max-players</strong>
            동시 접속 가능 인원 수
          </div>
          <div className="wiki-list-item">
            <strong>online-mode</strong>
            true면 정품 인증된 계정만 접속 가능, false면 인증 없이도 접속 가능(불법
            클라이언트 허용, 보안상 권장하지 않음)
          </div>
          <div className="wiki-list-item">
            <strong>level-seed</strong>
            월드 생성 시드값 (비워두면 무작위)
          </div>
          <div className="wiki-list-item">
            <strong>motd</strong>
            서버 목록에 표시되는 소개 문구
          </div>
        </div>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">외부 접속 (포트포워딩)</h2>
        <p className="wiki-section-body">
          자바 에디션 서버는 기본적으로 <span className="wiki-code">25565</span> 포트(TCP)를
          사용해요. 같은 네트워크가 아닌 외부에서 접속하려면 공유기에서 이 포트를 서버
          컴퓨터로 포트포워딩해줘야 하고, Windows를 쓴다면 방화벽에서도 해당 포트를 열어줘야
          해요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">바닐라 대신 쓸 수 있는 서버 소프트웨어</h2>
        <p className="wiki-section-body">
          공식 <span className="wiki-code">server.jar</span>(바닐라) 대신 아래 소프트웨어를
          쓰면 플러그인/모드 지원이나 성능 최적화 같은 추가 기능을 쓸 수 있어요.
        </p>
        <div className="wiki-list">
          <div className="wiki-list-item">
            <strong>Paper</strong>
            바닐라 호환 + 플러그인 지원 + 성능 최적화. 가장 널리 쓰이는 서버 소프트웨어예요.
          </div>
          <div className="wiki-list-item">
            <strong>Fabric / Forge 서버</strong>
            모드를 넣은 서버를 열고 싶을 때 사용해요. 접속하는 클라이언트도 같은 모드가
            설치되어 있어야 해요.
          </div>
        </div>
      </section>
    </div>
  )
}
