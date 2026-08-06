import { Link } from 'react-router-dom'
import './Header.css'

// 실제 마인크래프트/모장 로고는 상표라 그대로 쓸 수 없어서, 픽셀 블록
// 느낌만 살린 자체 제작 "잔디 블록" 아이콘으로 대신한다.
function GrassBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="26" height="26" shapeRendering="crispEdges">
      <rect x="0" y="0" width="16" height="6" fill="#7bc652" />
      <rect x="0" y="6" width="16" height="10" fill="#8a5a34" />
      <rect x="0" y="6" width="16" height="2" fill="#5c8f3c" />
      <rect x="2" y="1" width="2" height="2" fill="#68b046" />
      <rect x="7" y="0" width="2" height="2" fill="#8fd066" />
      <rect x="12" y="1" width="2" height="2" fill="#68b046" />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="mcwiki-header">
      <div className="mcwiki-header-left">
        <Link className="mcwiki-back" to="/projects">
          ← FDT
        </Link>
        <span className="mcwiki-header-divider" />
        <Link className="mcwiki-logo" to="/wiki/minecraft">
          <GrassBlockIcon />
          마인크래프트 위키
        </Link>
      </div>
    </header>
  )
}
