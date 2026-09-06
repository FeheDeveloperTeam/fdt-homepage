import { useStickyProgress } from '../../hooks/useStickyProgress'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import logo from '../../assets/images/logo/fdt-logo-square.png'
import styles from './TeamValues.module.css'

const PANELS = [
  {
    eyebrow: 'Discord Bot',
    title: '디스코드 봇 개발',
    description:
      '인증, 티켓, 로그, 미니게임까지 — 커뮤니티 운영에 필요한 기능을 원하는 대로 맞춤 제작해요.',
    tags: ['인증', '티켓', '로그', '미니게임'],
    visual: 'bot',
  },
  {
    eyebrow: 'For Creators',
    title: '유튜버 디스코드 서버 구축',
    description:
      '유튜버·크리에이터의 커뮤니티를 위해 채널과 권한 구조 설계부터 봇 코드 작성까지 함께 도와드려요.',
    tags: ['서버 구축', '채널·권한 설계', '봇 코드 작성'],
    visual: 'community',
  },
  {
    eyebrow: 'Web Development',
    title: '웹 개발',
    description:
      '봇을 소개하는 웹사이트부터 봇을 관리하는 대시보드까지, 필요한 웹 서비스를 함께 만들어요.',
    tags: ['React', 'Node.js', '반응형 디자인'],
    visual: 'browser',
  },
  {
    eyebrow: 'Maintenance',
    title: '배포 이후에도 계속',
    description:
      '출시하고 끝이 아니라, Discord로 소통하며 기능 개선과 버그 대응을 이어가요.',
    tags: ['버그 대응', '기능 개선', '실시간 소통'],
    visual: 'support',
  },
]

function BotVisual() {
  return (
    <div className={styles.visualBox}>
      <div className={styles.discordMock}>
        <div className={styles.discordSidebar}>
          <span className={styles.discordServerIcon} />
          <span className={`${styles.discordServerIcon} ${styles.discordServerIconActive}`} />
          <span className={styles.discordServerIcon} />
        </div>
        <div className={styles.discordMain}>
          <div className={styles.discordHeader}># 일반</div>
          <div className={styles.discordMessage}>
            <span className={styles.discordAvatar} />
            <div className={styles.discordBubble}>
              <div className={styles.discordLine} style={{ width: '75%' }} />
              <div className={styles.discordLine} style={{ width: '45%' }} />
            </div>
          </div>
          <span className={styles.discordCommand}>/인증</span>
        </div>
      </div>
    </div>
  )
}

/* 크리에이터 서버를 채널 목록과 멤버 수로 표현한 목업 */
function CommunityVisual() {
  return (
    <div className={styles.visualBox}>
      <div className={styles.communityMock}>
        <div className={styles.communityTop}>
          <span className={styles.communityCrest} />
          <div className={styles.communityTitleLines}>
            <span className={styles.communityLine} style={{ width: '68%' }} />
            <span className={styles.communityLine} style={{ width: '40%' }} />
          </div>
        </div>
        <ul className={styles.communityChannels}>
          <li># 공지</li>
          <li># 잡담</li>
          <li># 팬아트</li>
        </ul>
        <div className={styles.communityMembers}>
          <span className={styles.communityAvatars}>
            <i /><i /><i /><i />
          </span>
          <span className={styles.communityCount}>커뮤니티 멤버</span>
        </div>
      </div>
    </div>
  )
}

function BrowserVisual() {
  return (
    <div className={styles.visualBox}>
      <div className={styles.browserMock}>
        <div className={styles.browserBar}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.browserBody}>
          <div className={styles.browserLine} style={{ width: '60%' }} />
          <div className={styles.browserLine} style={{ width: '85%' }} />
          <div className={styles.browserBlock} />
        </div>
      </div>
    </div>
  )
}

function SupportVisual() {
  return (
    <div className={styles.visualBox}>
      <div className={styles.supportVisual}>
        <span className={styles.pulseRing} />
        <span className={`${styles.pulseRing} ${styles.pulseRingDelay}`} />
        <img src={logo} alt="FDT" className={styles.supportLogo} />
      </div>
    </div>
  )
}

const VISUALS = {
  bot: BotVisual,
  community: CommunityVisual,
  browser: BrowserVisual,
  support: SupportVisual,
}

function Card({ eyebrow, title, description, tags, visual, index, stepProgress }) {
  // 1.7배(2 미만)로 falloff를 줘서 카드 사이 전환 중간 지점에서
  // 두 카드가 동시에 0이 되는 사각지대가 생기지 않게 한다.
  const visibility = Math.max(0, 1 - Math.abs(stepProgress - index) * 1.7)
  const Visual = VISUALS[visual]

  // 모바일은 주소창이 들쭉날쭉해서 실제 기기 스크롤과 계산된 진행률이
  // 살짝 어긋날 때가 있는데, 그때 rotateX 3D 효과가 걸려 있으면 카드
  // 안의 목업이 세로로 눌린 것처럼 보인다. 좁은 화면에서는 회전 없이
  // 페이드 + 위로 살짝 뜨는 정도로만 처리해서 그 문제를 피한다.
  const isNarrow = useMediaQuery('(max-width: 720px)')
  const rotateX = isNarrow ? 0 : (1 - visibility) * -35

  const style = {
    opacity: visibility,
    transform: `translate(-50%, calc(-50% + ${(1 - visibility) * 24}px)) rotateX(${rotateX}deg)`,
    zIndex: Math.round(visibility * 100),
  }

  return (
    <div className={styles.panel} style={style}>
      <div className={styles.panelText}>
        <span className={styles.panelIndex}>0{index + 1}</span>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h3 className={styles.panelTitle}>{title}</h3>
        <p className={styles.panelDescription}>{description}</p>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Visual />
    </div>
  )
}

// 카드가 완전히 보일 때마다 다음 카드로 넘어가기 전에
// 스크롤을 더 해야 하는 정지 구간을 둔다.
const PAUSE_UNITS = 0.6
const TIMELINE_LENGTH = (PANELS.length - 1) * 1 + PANELS.length * PAUSE_UNITS

function getStepProgress(units) {
  let cursor = 0

  for (let i = 0; i < PANELS.length; i++) {
    if (units <= cursor + PAUSE_UNITS) return i
    cursor += PAUSE_UNITS

    if (i < PANELS.length - 1) {
      if (units <= cursor + 1) return i + (units - cursor)
      cursor += 1
    }
  }

  return PANELS.length - 1
}

function TeamValues() {
  const [ref, units] = useStickyProgress()
  const stepProgress = getStepProgress(units)

  return (
    <section className={styles.values}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Why FDT</p>
        <h2 className={styles.headline}>우리는 이런 팀입니다</h2>
      </div>

      <div
        ref={ref}
        className={styles.stepWrapper}
        style={{ height: `${(TIMELINE_LENGTH + 1) * 100}dvh` }}
      >
        <div className={styles.stickyStage}>
          {PANELS.map((panel, index) => (
            <Card key={panel.title} index={index} stepProgress={stepProgress} {...panel} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamValues
