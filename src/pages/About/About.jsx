import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import RevealItem from '../../components/RevealItem/RevealItem'
import feheProfile from '../../assets/images/team/fehe.png'
import { SEO_DATA } from '../../seoData'
import styles from './About.module.css'

const MEMBERS = [
  {
    name: '페헤',
    position: '팀장',
    role: '총괄',
    email: 'fehe@fehe.dev',
    photo: feheProfile,
    profileUrl: '/member/fehe',
  },
  {
    name: '유키하',
    position: '팀원',
    role: '아이디어 제공 및 개발 피드백',
    email: 'yukiha@fehe.dev',
    profileUrl: '/member/yukiha',
  },
]

function About() {
  return (
    <section className={styles.about}>
      <Seo {...SEO_DATA['/about']} path="/about" />
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
          About Us
        </p>
        <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
          팀 소개
        </h1>
        <p className={`${styles.description} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
          FeheDeveloperTeam(FDT)은 디스코드 봇 개발과 웹 개발을 중심으로 활동하는
          팀입니다. 커뮤니티 운영에 필요하다고 생각한 디스코드 봇과 이를 관리하는
          웹 대시보드를, 기획부터 운영까지 직접 만들어갑니다.
        </p>

        <div className={styles.members}>
          {MEMBERS.map((member, i) => (
            <RevealItem key={member.name} index={i} className={styles.card}>
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={`${member.name} 프로필`}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatar}>{member.name[0]}</div>
              )}
              <h3>
                {member.name}
                <span className={styles.position}>{member.position}</span>
              </h3>
              <p className={styles.role}>{member.role}</p>
              <a href={`mailto:${member.email}`} className={styles.email}>
                {member.email}
              </a>
              {member.profileUrl && (
                <Link to={member.profileUrl} className={styles.profileButton}>
                  자기소개 보러가기
                </Link>
              )}
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
