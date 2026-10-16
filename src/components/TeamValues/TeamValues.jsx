import RevealItem from '../RevealItem/RevealItem'
import styles from './TeamValues.module.css'

// 문구는 실제로 있는 것만 쓴다 — 명령어는 치유미에 있는 것, 웹 서비스는 이 사이트에 있는 것,
// 응답 시간은 문의 페이지(src/pages/Contact)에 적힌 운영 시간과 같다.
const ITEMS = [
  {
    title: '디스코드 봇 개발',
    description: '직접 운영하는 치유미 봇에 넣은 기능들을 바탕으로, 서버에 필요한 명령어를 맞춰 만듭니다.',
    tags: ['/인증', '/티켓', '/로그', '/끝말잇기'],
  },
  {
    title: '유튜브 디스코드 서버 구축',
    description: '구독자가 모일 서버의 채널과 역할을 먼저 정리하고, 공지·방송 알림·입장 인증처럼 운영에 꼭 필요한 봇을 연결합니다.',
    tags: ['채널·역할 설계', '방송 알림', '입장 인증'],
  },
  {
    title: '웹 개발',
    description: '치유미 관리 대시보드, 네트워크 테스트, 마인크래프트 위키를 React와 Node.js로 직접 만들었습니다.',
    tags: ['React', 'Node.js', '관리 대시보드'],
  },
  {
    title: '출시 뒤에도 운영',
    description: '디스코드 서포터 서버에서 문의를 받아 버그를 고치고 기능을 다듬습니다. 평일 19시부터 24시까지 답변합니다.',
    tags: ['서포터 서버', '버그 수정', '기능 개선'],
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
          <p className={styles.eyebrow}>What We Do</p>
          <h2 className={styles.headline}>직접 만들고, 직접 운영합니다</h2>
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
