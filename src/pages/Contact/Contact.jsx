import Seo from '../../components/Seo/Seo'
import styles from './Contact.module.css'

function Contact() {
  return (
    <section className={styles.contact}>
      <Seo
        title="문의"
        description="FeheDeveloperTeam(FDT)에 문의하거나 커뮤니티에 참여해보세요. Discord와 이메일로 연락하실 수 있습니다."
        path="/contact"
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Contact</p>
        <h1 className={styles.title}>문의</h1>
        <p className={styles.description}>
          치유미 봇 관련 문의나 버그 제보, 그 외에 하고 싶은 말이 있다면
          Discord나 이메일로 편하게 연락해주세요.
        </p>

        <div className={styles.infoColumn}>
          <div className={styles.info}>
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
          </div>

          <div className={styles.info}>
            <h3>Direct Contact</h3>
            <p>이메일: help@fehe.dev</p>
            <p>운영 시간: 평일 10:00 - 19:00 (주말 제외)</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
