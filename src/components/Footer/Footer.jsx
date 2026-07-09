import logo from '../../assets/images/logo/fdt-logo-square.png'
import styles from './Footer.module.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src={logo} alt="FDT 로고" className={styles.logoImage} />
          <p>FeheDeveloperTeam</p>
        </div>

        <p className={styles.copyright}>
          © {year} FeheDeveloperTeam. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
