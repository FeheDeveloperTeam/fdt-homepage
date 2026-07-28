import Seo from '../../components/Seo/Seo'
import { SEO_DATA } from '../../seoData'
import styles from './Services.module.css'

const SERVICES = [
  {
    title: '디스코드 봇 개발',
    description:
      '인증, 티켓, 로그, 미니게임 등 커뮤니티 운영에 필요하다고 판단한 기능을 담아 봇을 직접 만듭니다.',
  },
  {
    title: '봇 대시보드 개발',
    description:
      '직접 운영하는 봇의 설정과 데이터를 웹에서 관리할 수 있는 대시보드를 만듭니다.',
  },
  {
    title: '웹사이트/웹 서비스 개발',
    description: 'React 기반으로 팀과 프로젝트를 소개하는 웹사이트, 웹 서비스를 기획부터 배포까지 직접 만듭니다.',
  },
  {
    title: '유지보수/운영',
    description: '출시 이후에도 기능 개선, 버그 대응, 봇 운영까지 팀이 계속 챙깁니다.',
  },
]

const PROCESS = [
  { title: '아이디어', description: '팀 내에서 필요하다고 느끼는 기능이나 프로젝트를 자유롭게 제안합니다.' },
  { title: '기획', description: '실제로 만들 가치가 있는지 논의하고 범위를 정합니다.' },
  { title: '개발', description: '실시간으로 소통하며 기능을 빠르게 구현해 나갑니다.' },
  { title: '운영', description: '출시 후에도 기능 개선과 대응을 팀이 직접 계속 이어갑니다.' },
]

const STACK_GROUPS = [
  { label: 'Frontend', items: ['React'] },
  { label: 'Backend', items: ['Discord.js', 'Node.js', 'Express'] },
  { label: 'Database', items: ['MongoDB', 'PostgreSQL'] },
]

function Services() {
  return (
    <section className={styles.services}>
      <Seo {...SEO_DATA['/services']} path="/services" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>What We Build</p>
        <h1 className={styles.title}>하는 일 & 기술 스택</h1>
        <p className={styles.description}>
          FDT는 디스코드 봇 개발과 웹 개발을 중심으로, 팀에 필요하다고 판단한
          프로젝트를 직접 기획하고 만듭니다.
        </p>

        <div className={styles.grid}>
          {SERVICES.map((service, index) => (
            <div key={service.title} className={styles.card}>
              <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.processSection}>
          <p className={styles.subEyebrow}>How We Work</p>
          <h2 className={styles.subTitle}>진행 프로세스</h2>

          <ol className={styles.processList}>
            {PROCESS.map((step, index) => (
              <li key={step.title} className={styles.processStep}>
                <span className={styles.processIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.stackSection}>
          <p className={styles.subEyebrow}>Tech Stack</p>
          <div className={styles.stackGroups}>
            {STACK_GROUPS.map((group) => (
              <div key={group.label} className={styles.stackGroup}>
                <span className={styles.stackLabel}>{group.label}</span>
                <div className={styles.stackItems}>
                  {group.items.map((tech) => (
                    <span key={tech} className={styles.stackItem}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
