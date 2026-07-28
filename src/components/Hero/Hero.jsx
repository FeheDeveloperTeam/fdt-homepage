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
            한 팀에서 완성하는 프리랜서 개발팀
          </h1>
          <p className={styles.subtitle}>
            커스텀 디스코드 봇 개발과 웹사이트/웹 서비스 개발까지 — FDT가 처음부터
            끝까지 함께합니다.
          </p>

          <div className={styles.actions}>
            <Link to="/contact" className={styles.primaryButton}>
              프로젝트 문의하기
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
