import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import chiyumiPhoto from '../../assets/images/projects/chiyumi.png'
import { SEO_DATA } from '../../seoData'
import styles from './Projects.module.css'

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

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

const CATEGORIES = [
  { key: 'all', label: '전체', Icon: IconGrid },
  { key: 'discord-bot', label: '디스코드 봇', Icon: IconBot },
  { key: 'general', label: '일반 프로젝트', Icon: IconFolder },
]

const PROJECTS = [
  {
    category: 'discord-bot',
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
    dashboard: '/DiscordBot/Chiyumi',
  },
  {
    category: 'general',
    name: '네트워크 테스트',
    description: SEO_DATA['/utility/network-test'].description,
    features: ['IP 주소 확인', '지연 시간 측정', '다운로드 속도 측정'],
    link: '/utility/network-test',
  },
]

function Projects() {
  const [activeCategory, setActiveCategory] = useState('all')

  const visibleProjects = PROJECTS.filter(
    (project) => activeCategory === 'all' || project.category === activeCategory,
  )

  return (
    <section className={styles.projects}>
      <Seo {...SEO_DATA['/projects']} path="/projects" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Projects</p>
        <h1 className={styles.title}>프로젝트</h1>
        <p className={styles.description}>
          FDT가 직접 운영하고 있는 프로젝트를 소개합니다.
        </p>

        <div className={styles.categoryTabs}>
          {CATEGORIES.map((category) => {
            const count =
              category.key === 'all'
                ? PROJECTS.length
                : PROJECTS.filter((p) => p.category === category.key).length
            const isActive = category.key === activeCategory
            return (
              <button
                key={category.key}
                type="button"
                className={styles.categoryTab + (isActive ? ` ${styles.categoryTabActive}` : '')}
                onClick={() => setActiveCategory(category.key)}
              >
                <category.Icon />
                {category.label}
                <span className={styles.categoryCount}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.list}>
          {visibleProjects.map((project) => (
            <div key={project.name} className={styles.card}>
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
                  {project.features.map((feature) => (
                    <span key={feature} className={styles.featureTag}>
                      {feature}
                    </span>
                  ))}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
