import { SITE_VERSION } from '../version'

export default function Footer() {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} <span>페헤 (Fehe)</span>. All rights reserved.</p>
      <p className="footer-ghost">모든 문에는 열쇠가 있다.</p>
      <p className="footer-version">{SITE_VERSION}</p>
    </footer>
  )
}
