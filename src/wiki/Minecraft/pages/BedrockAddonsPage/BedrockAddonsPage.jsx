import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

export default function BedrockAddonsPage() {
  useDocumentTitle('베드락 에디션 애드온(모드)', '마인크래프트 위키')

  return (
    <div>
      <span
        className="wiki-edition-badge wiki-edition-badge--bedrock wiki-reveal"
        style={{ '--reveal-i': 0 }}
      >
        BEDROCK EDITION
      </span>
      <h1 className="wiki-page-title wiki-reveal" style={{ '--reveal-i': 1 }}>
        애드온 (모드)
      </h1>
      <p className="wiki-page-desc wiki-reveal" style={{ '--reveal-i': 2 }}>
        베드락 에디션에는 자바 에디션 같은 전통적인 "모드"가 없어요. 대신{' '}
        <strong>애드온(Add-On)</strong>이라는 공식 시스템으로 콘텐츠를 추가해요.
      </p>

      <section className="wiki-section">
        <h2 className="wiki-section-title">비헤이비어 팩 · 리소스 팩</h2>
        <p className="wiki-section-body">
          애드온은 크게 두 종류로 나뉘어요. <strong>비헤이비어 팩</strong>은 몹 행동,
          아이템, 크래프팅 레시피 같은 게임 동작을 바꾸고, <strong>리소스 팩</strong>은
          텍스처·모델·사운드 같은 외형을 바꿔요. 대부분의 애드온은 이 둘을 함께 묶어서
          배포해요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">설치 방법</h2>
        <p className="wiki-section-body">
          <span className="wiki-code">.mcaddon</span> 또는{' '}
          <span className="wiki-code">.mcpack</span> 파일을 실행하면 마인크래프트 앱이 자동
          인식해서 가져와요. 설치만으로는 바로 적용되지 않고, 적용하려는{' '}
          <strong>월드의 설정에서 비헤이비어 팩/리소스 팩을 직접 활성화</strong>해야 해요.
        </p>
      </section>

      <section className="wiki-section">
        <h2 className="wiki-section-title">자바 에디션 모드와의 차이</h2>
        <div className="wiki-list">
          <div className="wiki-list-item">
            <strong>공식 시스템</strong>
            애드온은 Mojang이 공식으로 지원하는 기능이라 마켓플레이스를 통해 스토어에서
            직접 구매/다운로드할 수 있어요.
          </div>
          <div className="wiki-list-item">
            <strong>범위의 한계</strong>
            자바 에디션 모드처럼 게임 엔진 자체를 깊게 바꾸는 건 불가능해요. 정해진 API
            범위 안에서만 몹/아이템/UI 등을 커스터마이징할 수 있어요.
          </div>
        </div>
      </section>
    </div>
  )
}
