import { useStickyProgress } from '../../hooks/useStickyProgress'
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
  browser: BrowserVisual,
  support: SupportVisual,
}

function Card({ eyebrow, title, description, tags, visual, index, stepProgress }) {
  const visibility = Math.max(0, 1 - Math.abs(stepProgress - index) * 2)
  const Visual = VISUALS[visual]

  const style = {
    opacity: visibility,
    transform: `translate(-50%, calc(-50% + ${(1 - visibility) * 24}px)) rotateX(${(1 - visibility) * -35}deg)`,
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
        style={{ height: `${(TIMELINE_LENGTH + 1) * 100}vh` }}
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
