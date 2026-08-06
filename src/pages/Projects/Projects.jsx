import { Link, Navigate, useParams } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import RevealItem from '../../components/RevealItem/RevealItem'
import chiyumiPhoto from '../../assets/images/projects/chiyumi.png'
import { SEO_DATA } from '../../seoData'
import styles from './Projects.module.css'

function IconBot() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V4" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 12v3M21.5 12v3" strokeLinecap="round" />
    </svg>
  )
}

function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v9.3a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V6.5Z" strokeLinejoin="round" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4.5C4 3.7 4.7 3 5.5 3H12v18H5.5c-.8 0-1.5-.7-1.5-1.5v-15Z" strokeLinejoin="round" />
      <path d="M20 4.5c0-.8-.7-1.5-1.5-1.5H12v18h6.5c.8 0 1.5-.7 1.5-1.5v-15Z" strokeLinejoin="round" />
      <path d="M12 3v18" />
    </svg>
  )
}

const CATEGORIES = [
  { key: 'discord-bot', label: '디스코드 봇', Icon: IconBot },
  { key: 'general', label: '일반 프로젝트', Icon: IconFolder },
  { key: 'wiki', label: '위키', Icon: IconBook },
]

const PROJECTS = [
  {
    category: 'discord-bot',
    name: '치유미 (Chiyumi)',
    photo: chiyumiPhoto,
    description: '서버 운영과 놀이 기능을 함께 제공하는 디스코드 봇입니다.',
    features: [
      { label: 'AI 채팅 · 기억', featured: true },
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
    dashboard: '/DiscordBot/Chiyumi',
  },
  {
    category: 'general',
    name: '네트워크 테스트',
    description: SEO_DATA['/utility/network-test'].description,
    features: ['IP 주소 확인', '지연 시간 측정', '다운로드 속도 측정'],
    link: '/utility/network-test',
  },
  {
    category: 'wiki',
    name: '마인크래프트 위키',
    description: SEO_DATA['/wiki/minecraft'].description,
    features: ['자바 에디션', '베드락 에디션'],
    link: '/wiki/minecraft',
  },
]

function Projects() {
  const { category } = useParams()
  const isValidCategory = CATEGORIES.some((c) => c.key === category)

  if (!isValidCategory) {
    return <Navigate to={`/projects/${CATEGORIES[0].key}`} replace />
  }

  const activeCategory = category
  const visibleProjects = PROJECTS.filter((project) => project.category === activeCategory)
  const seoPath = `/projects/${activeCategory}`

  return (
    <section className={styles.projects}>
      <Seo {...SEO_DATA[seoPath]} path={seoPath} />
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
          Projects
        </p>
        <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
          프로젝트
        </h1>
        <p className={`${styles.description} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
          FDT가 직접 운영하고 있는 프로젝트를 소개합니다.
        </p>

        <div
          className={`${styles.categoryTabs} fdt-reveal fdt-reveal-visible`}
          style={{ '--reveal-i': 3 }}
        >
          {CATEGORIES.map((cat) => {
            const count = PROJECTS.filter((p) => p.category === cat.key).length
            const isActive = cat.key === activeCategory
            return (
              <Link
                key={cat.key}
                to={`/projects/${cat.key}`}
                className={styles.categoryTab + (isActive ? ` ${styles.categoryTabActive}` : '')}
              >
                <cat.Icon />
                {cat.label}
                <span className={styles.categoryCount}>{count}</span>
              </Link>
            )
          })}
        </div>

        <div className={styles.list}>
          {visibleProjects.map((project, index) => (
            <RevealItem key={project.name} index={index} className={styles.card}>
              {project.photo && (
                <img
                  src={project.photo}
                  alt={`${project.name} 프로필`}
                  className={styles.photo}
                />
              )}

              <div className={styles.content}>
                <h3>{project.name}</h3>
                <p className={styles.cardDescription}>{project.description}</p>

                <div className={styles.features}>
                  {project.features.map((feature) => {
                    const label = typeof feature === 'string' ? feature : feature.label
                    const featured = typeof feature === 'object' && feature.featured
                    return (
                      <span
                        key={label}
                        className={styles.featureTag + (featured ? ` ${styles.featureTagFeatured}` : '')}
                      >
                        {label}
                      </span>
                    )
                  })}
                </div>

                <div className={styles.actions}>
                  {project.invite && (
                    <a
                      href={project.invite}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.inviteButton}
                    >
                      봇 초대하기
                    </a>
                  )}
                  {project.dashboard && (
                    <Link to={project.dashboard} className={styles.githubButton}>
                      대시보드 보기
                    </Link>
                  )}
                  {project.link && (
                    <Link to={project.link} className={styles.githubButton}>
                      바로가기
                    </Link>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.githubButton}
                    >
                      GitHub 저장소 보기
                    </a>
                  )}
                </div>
              </div>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
