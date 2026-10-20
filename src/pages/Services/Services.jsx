import Seo from '../../components/Seo/Seo'
import RevealItem from '../../components/RevealItem/RevealItem'
import { SEO_DATA } from '../../seoData'
import styles from './Services.module.css'

// 맨 앞 항목이 주력 서비스로 크게 놓이고, 나머지는 아래에 두 칸씩 놓인다.
const SERVICES = [
  {
    title: '유튜브 디스코드 서버 구축',
    description:
      '유튜버·크리에이터의 팬 커뮤니티를 위해 채널과 권한 구조를 설계하고, 서버 개설부터 봇 연동까지 도와드립니다.',
  },
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
    title: '웹사이트·웹 서비스 개발',
    description: 'React 기반으로 팀과 프로젝트를 소개하는 웹사이트, 웹 서비스를 기획부터 배포까지 직접 만듭니다.',
  },
  {
    title: '유지보수·운영',
    description: '출시 이후에도 기능 개선, 버그 대응, 봇 운영까지 팀이 계속 챙깁니다.',
  },
]

const PROCESS = [
  { title: '아이디어', description: '팀 내에서 필요하다고 느끼는 기능이나 프로젝트를 자유롭게 제안합니다.' },
  { title: '기획', description: '실제로 만들 가치가 있는지 논의하고 범위를 정합니다.' },
  { title: '개발', description: '실시간으로 소통하며 기능을 빠르게 구현해 나갑니다.' },
  { title: '운영', description: '출시 후에도 기능 개선과 대응을 팀이 직접 계속 이어갑니다.' },
]

// 기술 옆의 짧은 설명은 기술 자체의 성격만 적는다(어디에 쓰는지 지어내지 않는다).
const STACK_GROUPS = [
  {
    label: 'Frontend',
    items: [{ name: 'React', note: '웹 화면' }],
  },
  {
    label: 'Backend',
    items: [
      { name: 'discord.js', note: 'JavaScript' },
      { name: 'discord.py', note: 'Python' },
    ],
  },
  {
    label: 'Database',
    items: [
      { name: 'MariaDB', note: '관계형 데이터베이스' },
      { name: 'Supabase', note: 'PostgreSQL 기반 백엔드 서비스' },
    ],
  },
]

/*
  섹션마다 왼쪽 칸에 이름을, 오른쪽 칸에 내용을 두는 문서형 구성.
  상자 없이 가는 선과 여백만으로 나눈다. 좁은 화면에서는 이름이 내용 위로 올라간다.
*/
function Section({ index, title, children }) {
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <span className={styles.blockIndex}>{index}</span>
        <h2 className={styles.blockTitle}>{title}</h2>
      </div>
      <div className={styles.blockBody}>{children}</div>
    </section>
  )
}

function Services() {
  const [featured, ...others] = SERVICES

  return (
    <div className={styles.services}>
      <Seo {...SEO_DATA['/services']} path="/services" />
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
            What We Build
          </p>
          <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
            하는 일 & 기술 스택
          </h1>
          <p className={`${styles.description} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
            FDT는 유튜버·크리에이터를 위한 유튜브 디스코드 서버 구축과 디스코드 봇 코드 개발을
            도와드리고, 팀에 필요하다고 판단한 프로젝트도 직접 기획해 만듭니다.
          </p>
        </header>

        <Section index="01" title="하는 일">
          <RevealItem className={styles.featured}>
            <p className={styles.featuredKicker}>주력</p>
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
            <p className={styles.featuredText}>{featured.description}</p>
          </RevealItem>

          <ul className={styles.serviceGrid}>
            {others.map((service, index) => (
              <RevealItem as="li" key={service.title} index={index} className={styles.service}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceText}>{service.description}</p>
              </RevealItem>
            ))}
          </ul>
        </Section>

        <Section index="02" title="진행 방식">
          <ol className={styles.steps}>
            {PROCESS.map((step, index) => (
              <RevealItem as="li" key={step.title} index={index} className={styles.step}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.description}</p>
              </RevealItem>
            ))}
          </ol>
        </Section>

        <Section index="03" title="기술 스택">
          <div className={styles.stack}>
            {STACK_GROUPS.map((group, index) => (
              <RevealItem key={group.label} index={index} className={styles.stackGroup}>
                <h3 className={styles.stackLabel}>{group.label}</h3>
                <ul className={styles.stackList}>
                  {group.items.map((tech) => (
                    <li key={tech.name} className={styles.tech}>
                      <span className={styles.techName}>{tech.name}</span>
                      <span className={styles.techNote}>{tech.note}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

export default Services
