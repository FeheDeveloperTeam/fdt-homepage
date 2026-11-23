import { Link } from 'react-router-dom'

// 약관·개인정보 처리방침 위쪽의 「한국어 · English」 전환 링크
export default function DocLangSwitch({ current, koPath, enPath }) {
  return (
    <nav className="doc-lang" aria-label="Language">
      {current === 'ko' ? <span aria-current="page">한국어</span> : <Link to={koPath} lang="ko">한국어</Link>}
      <span aria-hidden="true">·</span>
      {current === 'en' ? <span aria-current="page">English</span> : <Link to={enPath} lang="en">English</Link>}
    </nav>
  )
}
