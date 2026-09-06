import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo/fdt-logo-square.png'
import { IconDiscord, IconMail } from '../icons/icons'
import { CONTACT_EMAIL, DISCORD_INVITE, NAV_LINKS } from '../../navLinks'
import styles from './Footer.module.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <img src={logo} alt="FDT 로고" className={styles.logoImage} />
            <p className={styles.brandName}>FeheDeveloperTeam</p>
          </div>
          <p className={styles.brandDesc}>
            디스코드 봇과 웹 대시보드를 기획부터 운영까지 직접 만들어가는 팀입니다.
          </p>
        </div>

        <nav className={styles.column} aria-label="푸터 메뉴">
          <h2 className={styles.columnTitle}>메뉴</h2>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 className={styles.columnTitle}>연락처</h2>
          <ul className={styles.contactList}>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <IconMail />
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
                <IconDiscord />
                Discord 서포터 서버
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {year} FeheDeveloperTeam. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
