import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../WikiPage.css'

export default function BedrockOverviewPage() {
  useDocumentTitle('베드락 에디션', '마인크래프트 위키')

  return (
    <div>
      <span className="wiki-edition-badge wiki-edition-badge--bedrock">BEDROCK EDITION</span>
      <h1 className="wiki-page-title">베드락 에디션</h1>
      <p className="wiki-page-desc">
        모바일/콘솔/Windows에서 실행되는 베드락 에디션의 사용법과 명령어를 정리하는
        공간이에요. 왼쪽 메뉴에서 원하는 문서를 찾아보세요.
      </p>

      <div className="wiki-empty-note">
        아직 준비 중이에요. 명령어, 게임 모드, 좌표 이동 등 구체적인 문서가 곧 추가될
        예정이에요.
      </div>
    </div>
  )
}
