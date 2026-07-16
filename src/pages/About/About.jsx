import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import feheProfile from '../../assets/images/team/fehe.png'
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
  },
]

function About() {
  return (
    <section className={styles.about}>
      <Seo
        title="팀 소개"
        description="디스코드 봇 개발과 웹 개발을 함께하는 FeheDeveloperTeam(FDT) 팀원을 소개합니다."
        path="/about"
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>About Us</p>
        <h1 className={styles.title}>팀 소개</h1>
        <p className={styles.description}>
          FeheDeveloperTeam(FDT)은 디스코드 봇 개발과 웹 개발을 중심으로 활동하는
          프리랜서 개발팀입니다. 커뮤니티 운영에 필요한 디스코드 봇부터 이를
          관리하는 웹 대시보드까지, 기획부터 배포·유지보수까지 함께합니다.
        </p>

        <div className={styles.members}>
          {MEMBERS.map((member) => (
            <div key={member.name} className={styles.card}>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
