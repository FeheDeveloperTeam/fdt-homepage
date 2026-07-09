import Seo from '../../components/Seo/Seo'
import chiyumiPhoto from '../../assets/images/projects/chiyumi.png'
import styles from './Projects.module.css'

const PROJECTS = [
  {
    name: '치유미 (Chiyumi)',
    photo: chiyumiPhoto,
    description: '서버 운영과 놀이 기능을 함께 제공하는 디스코드 봇입니다.',
    features: [
      '인증 · 티켓 · 로그 · 검열',
      '출석 · 코인 · 도박 미니게임',
      '고양이 키우기',
      '채팅/음성 순위',
      '롤 전적검색',
      '끝말잇기 파티 게임',
    ],
    github: 'https://github.com/FeheDeveloperTeam/Chiyumi',
    invite:
      'https://discord.com/oauth2/authorize?client_id=1517170922732388423&scope=bot&permissions=0',
  },
]

function Projects() {
  return (
    <section className={styles.projects}>
      <Seo
        title="프로젝트"
        description="FDT가 직접 운영하는 디스코드 봇 치유미(Chiyumi)를 소개합니다."
        path="/projects"
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Projects</p>
        <h1 className={styles.title}>프로젝트</h1>
        <p className={styles.description}>
          FDT가 직접 운영하고 있는 디스코드 봇을 소개합니다.
        </p>

        <div className={styles.list}>
          {PROJECTS.map((project) => (
            <div key={project.name} className={styles.card}>
              <img
                src={project.photo}
                alt={`${project.name} 프로필`}
                className={styles.photo}
              />

              <div className={styles.content}>
                <h3>{project.name}</h3>
                <p className={styles.cardDescription}>{project.description}</p>

                <div className={styles.features}>
                  {project.features.map((feature) => (
                    <span key={feature} className={styles.featureTag}>
                      {feature}
                    </span>
                  ))}
                </div>

                <div className={styles.actions}>
                  <a
                    href={project.invite}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.inviteButton}
                  >
                    봇 초대하기
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.githubButton}
                  >
                    GitHub 저장소 보기
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
