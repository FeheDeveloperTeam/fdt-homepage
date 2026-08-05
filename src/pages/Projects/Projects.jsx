import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import chiyumiPhoto from '../../assets/images/projects/chiyumi.png'
import { SEO_DATA } from '../../seoData'
import styles from './Projects.module.css'

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'discord-bot', label: '디스코드 봇' },
  { key: 'general', label: '일반 프로젝트' },
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
    description: SEO_DATA['/유틸리티/네트워크-테스트'].description,
    features: ['IP 주소 확인', '지연 시간 측정', '다운로드 속도 측정'],
    link: '/유틸리티/네트워크-테스트',
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
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              className={
                styles.categoryTab +
                (category.key === activeCategory ? ` ${styles.categoryTabActive}` : '')
              }
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </button>
          ))}
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
