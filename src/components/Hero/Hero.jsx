import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Fehe Developer Team</p>
          <h1 className={styles.title}>
            디스코드 봇부터 웹까지
            <br />
            우리 손으로 직접 기획하고 만드는 팀
          </h1>
          <p className={styles.subtitle}>
            필요하다고 생각한 디스코드 봇과 웹 서비스를 팀 내에서 직접 기획하고,
            만들고, 운영합니다.
          </p>

          <div className={styles.actions}>
            <Link to="/projects" className={styles.primaryButton}>
              프로젝트 보러가기
            </Link>
            <Link to="/about" className={styles.secondaryButton}>
              팀 소개 보기
            </Link>
          </div>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>운영 중인 봇</dt>
            <dd>치유미</dd>
          </div>
          <div className={styles.stat}>
            <dt>팀 구성</dt>
            <dd>2인</dd>
          </div>
          <div className={styles.stat}>
            <dt>결성</dt>
            <dd>2026. 06</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export default Hero
