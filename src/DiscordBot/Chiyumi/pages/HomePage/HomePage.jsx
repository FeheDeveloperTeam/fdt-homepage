import chiyumiPhoto from '../../../../assets/images/projects/chiyumi.png'
import './HomePage.css'

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1517170922732388423&scope=bot&permissions=0'
const GITHUB_URL = 'https://github.com/FeheDeveloperTeam/Chiyumi'

const COMMAND_GROUPS = [
  {
    label: '🛡️ 서버 관리',
    items: [
      { cmd: '/인증', desc: '버튼 클릭으로 인증 완료 → 지정 역할 자동 지급' },
      { cmd: '/공지', desc: '지정 채널에 임베드 공지 전송' },
      { cmd: '/로그', desc: '메시지 삭제·수정, 음성 입퇴장, 욕설·도배·레이드 알림 등 서버 활동을 채널에 기록' },
      { cmd: '/입퇴장', desc: '멤버 입·퇴장 시 커스텀 문구로 채널 알림 (입장·퇴장 채널 각각 지정 가능)' },
      { cmd: '/검열', desc: '욕설 자동 감지·삭제 / 도배 감지(1~5단계) / 레이드 감지 및 자동 대응' },
      { cmd: '/경고', desc: '경고 지급·취소·조회·초기화 및 경고 횟수별 자동 제재 설정' },
      { cmd: '/티켓', desc: '비공개 스레드 티켓 시스템 (관리자용 추가·닫기·저장·삭제)' },
      { cmd: '/방송알림', desc: '유튜브 라이브·업로드, 치지직, SOOP 방송 시작 알림 설정' },
      { cmd: '/밴 · /킥', desc: '서버에서 사용자 차단·추방' },
    ],
  },
  {
    label: '💰 경제',
    items: [
      { cmd: '/출석', desc: '하루 1회 치유미코인 + 경험치 지급' },
      { cmd: '/코인', desc: '치유미코인 잔액 조회' },
      { cmd: '/도박', desc: '슬롯머신·홀짝·숫자맞추기·블랙잭·가위바위보' },
      { cmd: '/주식', desc: '가상 주식 매수·매도·포트폴리오 조회 (주가 매일 자정 자동 변동)' },
      { cmd: '/은행', desc: '예금·출금·대출 신청·상환·파산 신청' },
    ],
  },
  {
    label: '🎮 게임 & 육성',
    items: [
      { cmd: '/끝말잇기', desc: '채널에서 파티 모집 후 스레드에서 봇과 함께 끝말잇기' },
      { cmd: '/키우기', desc: '가상 고양이 입양 — 밥·씻기·놀기, 경과 시간에 따라 성장' },
    ],
  },
  {
    label: '📊 조회 & 유틸리티',
    items: [
      { cmd: '/순위', desc: '채팅·음성 활동 기반 레벨·경험치 카드 이미지 및 서버 순위 조회' },
      { cmd: '/전적검색', desc: '리그 오브 레전드 최근 전적·라인별 매치업·티어 조회' },
      { cmd: '/문의', desc: '유저 신고·피드백·버그 신고를 모달로 접수' },
      { cmd: '/도움말', desc: '카테고리별 전체 명령어 안내' },
      { cmd: '/핑', desc: '봇 응답 속도 확인' },
    ],
  },
]

const DOCS = [
  { label: '이용약관', href: 'https://fehedeveloperteam.github.io/Chiyumi/terms.html' },
  { label: '개인정보 처리방침', href: 'https://fehedeveloperteam.github.io/Chiyumi/privacy.html' },
  { label: '오류 코드 안내', href: 'https://fehedeveloperteam.github.io/Chiyumi/errors.html' },
]

const SPARKLES = [
  { top: '10%', left: '6%', size: '1.1rem', delay: '0s' },
  { top: '18%', left: '90%', size: '0.8rem', delay: '0.8s' },
  { top: '55%', left: '3%', size: '0.7rem', delay: '1.6s' },
  { top: '70%', left: '94%', size: '1rem', delay: '2.2s' },
]

export default function HomePage() {
  return (
    <div className="chiyumi-home">
      {SPARKLES.map((s, i) => (
        <span key={i} className="sparkle" style={{ top: s.top, left: s.left, fontSize: s.size, animationDelay: s.delay }}>
          ✦
        </span>
      ))}

      <section className="hero">
        <img src={chiyumiPhoto} alt="치유미" className="hero-photo" />
        <div className="hero-text">
          <p className="eyebrow">Discord Bot</p>
          <h1 className="hero-title">치유미 (Chiyumi)</h1>
          <p className="hero-desc">
            서버 운영과 놀이 기능을 함께 제공하는 디스코드 봇이에요. 모든 명령어는
            슬래시 명령어로 제공되며, 처음 사용 시 이용약관·개인정보 처리방침 동의
            절차를 거쳐요.
          </p>
          <div className="hero-actions">
            <a href={INVITE_URL} target="_blank" rel="noreferrer" className="invite-btn">
              봇 초대하기
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="github-btn">
              GitHub 저장소 보기
            </a>
          </div>
        </div>
      </section>

      <div className="ai-card">
        <strong>🤖 AI 채팅</strong>
        <p>&quot;유미야&quot;로 시작하는 메시지를 보내면 치유미가 AI로 응답해요. 채널별로 대화 맥락을 유지해요.</p>
      </div>

      <div className="menu-heading">
        <p className="eyebrow">Menu</p>
        <h2>치유미가 할 수 있는 것들</h2>
      </div>

      <div className="groups">
        {COMMAND_GROUPS.map((group) => (
          <section key={group.label} className="group-card">
            <p className="group-label">{group.label}</p>
            <ul className="command-list">
              {group.items.map((item) => (
                <li key={item.cmd} className="command-item">
                  <span className="command-name">{item.cmd}</span>
                  <span className="command-desc">{item.desc}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="docs">
        {DOCS.map((doc) => (
          <a key={doc.href} href={doc.href} target="_blank" rel="noreferrer" className="doc-link">
            {doc.label}
          </a>
        ))}
      </div>
    </div>
  )
}
