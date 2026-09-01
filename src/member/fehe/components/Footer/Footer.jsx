import { SITE_VERSION } from '../../version'
import './Footer.css'

export default function Footer() {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} <span>페헤 (Fehe)</span>. All rights reserved.</p>
      <a className="footer-email" href="mailto:gkrcjf1019@naver.com" aria-label="페헤에게 이메일 보내기">
        gkrcjf1019@naver.com
      </a>
      <p className="footer-ghost">모든 문에는 열쇠가 있다.</p>
      <p className="footer-version">{SITE_VERSION}</p>
    </footer>
  )
}
