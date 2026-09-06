import yukihaProfile from '../../../../assets/images/team/yukiha.png'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src={yukihaProfile} alt="유키하 프로필" className={styles.logoImage} />
          <p>유키하 (Yukiha)</p>
        </div>

        <p className={styles.copyright}>© {year} 유키하. All rights reserved.</p>
      </div>
    </footer>
  )
}
