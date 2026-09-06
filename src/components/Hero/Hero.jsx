import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
            Fehe Developer Team
          </p>
          <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
            디스코드 봇부터 웹까지
            <br />
            우리 손으로 직접 기획하고 만드는 팀
          </h1>
          <p className={`${styles.subtitle} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
            유튜버·크리에이터의 디스코드 서버 구축과 디스코드 봇 코드 개발을 도와드립니다.
            필요한 기능은 기획부터 운영까지 팀이 직접 만듭니다.
          </p>

          <div className={`${styles.actions} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 3 }}>
            <Link to="/projects" className={styles.primaryButton}>
              프로젝트 보러가기
            </Link>
            <Link to="/about" className={styles.secondaryButton}>
              팀 소개 보기
            </Link>
          </div>
        </div>

        <dl className={`${styles.stats} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 4 }}>
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
