import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

export default function JavaModsPage() {
  useDocumentTitle('자바 에디션 모드', '마인크래프트 위키')

  return (
    <div>
      <span
        className="wiki-edition-badge wiki-edition-badge--java wiki-reveal"
        style={{ '--reveal-i': 0 }}
      >
        JAVA EDITION
      </span>
      <h1 className="wiki-page-title wiki-reveal" style={{ '--reveal-i': 1 }}>
        모드
      </h1>
      <p className="wiki-page-desc wiki-reveal" style={{ '--reveal-i': 2 }}>
        자바 에디션은 모드 생태계가 가장 큰 에디션이에요. 모드를 쓰려면 먼저 모드
        로더를 설치해야 해요.
      </p>

      <section className="wiki-section">
        <h2 className="wiki-section-title">모드 로더 종류</h2>
        <div className="wiki-list">
          <div className="wiki-list-item">
            <strong>Fabric</strong>
            가볍고 최신 마인크래프트 버전 대응이 빠른 로더예요. 성능 위주/최신 버전 모드팩에서
            많이 써요.
          </div>
          <div className="wiki-list-item">
            <strong>Forge</strong>
            가장 오래되고 지원 모드 수가 제일 많은 로더예요. 대형 모드팩 대부분이 Forge
            기반이에요.
          </div>
          <div className="wiki-list-item">
            <strong>NeoForge</strong>
            Forge에서 갈라져 나온 로더로, 최근 모드팩에서 Forge 대신 채택되는 경우가 늘고
            있어요.
          </div>
        </div>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">설치 방법 (개요)</h2>
        <p className="wiki-section-body">
          1) 원하는 로더의 설치 프로그램을 받아 실행하면 런처에 해당 로더용 버전이
          추가돼요. 2) 마인크래프트 설치 폴더의{' '}
          <span className="wiki-code">mods</span> 폴더에 내려받은 모드{' '}
          <span className="wiki-code">.jar</span> 파일을 넣어요. 3) 런처에서 방금 추가된
          로더 버전으로 실행하면 모드가 함께 로드돼요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">버전 맞추기가 제일 중요해요</h2>
        <p className="wiki-section-body">
          모드는 <strong>마인크래프트 버전</strong>과 <strong>모드 로더 버전</strong>이
          정확히 맞아야 작동해요. 예를 들어 1.20.1용 Fabric 모드를 1.21용 게임에 넣으면
          보통 실행이 안 되거나 오류가 나요. 모드 다운로드 페이지에 적힌 지원 버전을 항상
          확인하세요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">모드 배포 사이트</h2>
        <p className="wiki-section-body">
          <strong className="wiki-code">CurseForge</strong>와{' '}
          <strong className="wiki-code">Modrinth</strong>가 대표적인 모드 배포 플랫폼이에요.
          둘 다 전용 런처를 제공해서, 모드팩(여러 모드를 묶어놓은 세트)을 클릭 몇 번으로
          설치할 수도 있어요.
        </p>
      </section>
    </div>
  )
}
