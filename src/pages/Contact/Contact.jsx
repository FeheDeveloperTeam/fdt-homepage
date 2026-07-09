import Seo from '../../components/Seo/Seo'
import styles from './Contact.module.css'

function Contact() {
  return (
    <section className={styles.contact}>
      <Seo
        title="프로젝트 문의"
        description="FeheDeveloperTeam(FDT)에 프로젝트를 문의하세요. Discord와 이메일로 연락하실 수 있습니다."
        path="/contact"
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Contact</p>
        <h1 className={styles.title}>프로젝트 문의</h1>
        <p className={styles.description}>
          함께하고 싶은 프로젝트가 있다면 Discord나 이메일로 편하게
          연락해주세요.
        </p>

        <div className={styles.notice}>
          현재 신규 프로젝트는 받고 있지 않습니다. 다만 문의는 언제든
          남겨주시면 확인 후 답변드리겠습니다.
        </div>

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
