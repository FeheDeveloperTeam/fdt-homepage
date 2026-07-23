import Seo from '../../components/Seo/Seo'
import styles from './Services.module.css'

const SERVICES = [
  {
    title: '디스코드 봇 개발',
    description:
      '커스텀 명령어, 자동화, 관리/모더레이션 봇까지 서버 목적에 맞는 디스코드 봇을 제작합니다.',
  },
  {
    title: '봇 대시보드 개발',
    description:
      '디스코드 봇 설정과 데이터를 웹에서 관리할 수 있는 대시보드를 함께 구축합니다.',
  },
  {
    title: '웹사이트/웹 서비스 개발',
    description: 'React 기반 웹사이트, 랜딩 페이지, 웹 서비스를 기획부터 배포까지 개발합니다.',
  },
  {
    title: '유지보수/운영',
    description: '출시 이후 기능 개선, 버그 대응, 봇/서버 운영까지 지속적으로 지원합니다.',
  },
]

const PROCESS = [
  { title: '문의', description: 'Discord나 이메일로 프로젝트 내용을 편하게 전달해주세요.' },
  { title: '기획 · 견적', description: '요구사항을 정리하고 일정과 범위를 함께 조율합니다.' },
  { title: '개발', description: '실시간으로 소통하며 기능을 빠르게 구현해 나갑니다.' },
  { title: '배포 · 유지보수', description: '출시 후에도 기능 개선과 대응을 계속 이어갑니다.' },
]

const STACK_GROUPS = [
  { label: 'Frontend', items: ['React'] },
  { label: 'Backend', items: ['Discord.js', 'Node.js', 'Express'] },
  { label: 'Database', items: ['MongoDB', 'PostgreSQL'] },
]

function Services() {
  return (
    <section className={styles.services}>
      <Seo
        title="서비스 & 기술 스택"
        description="디스코드 봇 개발, 봇 대시보드, 웹사이트 제작까지 FDT의 서비스와 기술 스택을 소개합니다."
        path="/services"
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Services</p>
        <h1 className={styles.title}>서비스 & 기술 스택</h1>
        <p className={styles.description}>
          FDT는 디스코드 봇 개발과 웹 개발을 중심으로, 프로젝트 목적에 맞는
          기술을 선택해 빠르고 안정적으로 결과물을 만듭니다.
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

          <div className={styles.processGrid}>
            {PROCESS.map((step, index) => (
              <div key={step.title} className={styles.processStep}>
                <span className={styles.processIndex}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < PROCESS.length - 1 && <span className={styles.processArrow}>→</span>}
              </div>
            ))}
          </div>
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
