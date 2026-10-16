import RevealItem from '../RevealItem/RevealItem'
import styles from './TeamValues.module.css'

const ITEMS = [
  {
    title: '디스코드 봇 개발',
    description: '인증, 티켓, 로그, 미니게임까지 커뮤니티 운영에 필요한 기능을 원하는 대로 맞춤 제작해요.',
    tags: ['인증', '티켓', '로그', '미니게임'],
  },
  {
    title: '유튜브 디스코드 서버 구축',
    description: '유튜버·크리에이터의 팬 커뮤니티를 위해 채널과 권한 구조 설계부터 봇 코드 작성까지 함께 도와드려요.',
    tags: ['서버 구축', '채널·권한 설계', '봇 코드 작성'],
  },
  {
    title: '웹 개발',
    description: '봇을 소개하는 웹사이트부터 봇을 관리하는 대시보드까지, 필요한 웹 서비스를 함께 만들어요.',
    tags: ['React', 'Node.js', '반응형 디자인'],
  },
  {
    title: '배포 이후에도 계속',
    description: '출시하고 끝이 아니라, Discord로 소통하며 기능 개선과 버그 대응을 이어가요.',
    tags: ['버그 대응', '기능 개선', '실시간 소통'],
  },
]

/*
  하는 일을 카드·그림·스크롤 효과 없이 글자와 가는 선만으로 보여 주는 목록.
  번호는 배지가 아니라 글자로, 태그는 알약이 아니라 가운뎃점으로 이은 문장으로 둔다.
*/
function TeamValues() {
  return (
    <section className={styles.values}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Why FDT</p>
          <h2 className={styles.headline}>우리는 이런 팀입니다</h2>
        </div>

        <ol className={styles.list}>
          {ITEMS.map((item, index) => (
            <RevealItem as="li" key={item.title} index={index} className={styles.item}>
              <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.body}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
              </div>
              <p className={styles.tags}>
                {item.tags.map((tag, i) => (
                  <span key={tag}>
                    {i > 0 && ' · '}
                    <span className={styles.tag}>{tag}</span>
                  </span>
                ))}
              </p>
            </RevealItem>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default TeamValues
