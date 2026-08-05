import Seo from '../../components/Seo/Seo'
import RevealItem from '../../components/RevealItem/RevealItem'
import { SEO_DATA } from '../../seoData'
import styles from './Contact.module.css'

function Contact() {
  return (
    <section className={styles.contact}>
      <Seo {...SEO_DATA['/contact']} path="/contact" />
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
          Contact
        </p>
        <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
          문의
        </h1>
        <p className={`${styles.description} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
          치유미 봇 관련 문의나 버그 제보, 그 외에 하고 싶은 말이 있다면
          Discord나 이메일로 편하게 연락해주세요.
        </p>

        <div className={styles.infoColumn}>
          <RevealItem index={0} className={styles.info}>
            <h3>Discord 서포터 서버</h3>
            <p>실시간으로 문의하거나 팀과 소통하고 싶다면 디스코드로 참여해주세요.</p>
            <a
              href="https://discord.gg/fKR7RbfdmF"
              target="_blank"
              rel="noreferrer"
              className={styles.discordButton}
            >
              Discord 서버 참여하기
            </a>
          </RevealItem>

          <RevealItem index={1} className={styles.info}>
            <h3>Direct Contact</h3>
            <p>이메일: help@fehe.dev</p>
            <p>운영 시간: 평일 19:00 - 24:00 (주말 제외)</p>
          </RevealItem>
        </div>
      </div>
    </section>
  )
}

export default Contact
