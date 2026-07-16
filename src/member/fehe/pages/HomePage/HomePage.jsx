import { useState, useEffect } from 'react'
import { IconGithub, IconYoutube, IconSteam, IconDiscord, IconInstagram } from '../../components/icons/icons'
import feheProfile from '../../../../assets/images/team/fehe.png'
import './HomePage.css'

const TMI_LIST = [
  '페헤의 첫 닉네임은 악마를 좋아해서 악마페헤 였습니다',
  '페헤는 초등학교 1학년 때 바지에 실수를 해서 안 좋은 기억이 있습니다',
  '페헤는 해킹을 할려고 보안에 대해서 공부한 적이 있습니다',
]

const TIMELINE = [
  {
    year: '2014',
    heading: '인터넷 활동 시작',
    body: '페헤라는 이름으로 인터넷 활동을 시작했습니다. 이때부터 온라인 커뮤니티와 콘텐츠 제작에 관심을 갖게 되었습니다.',
  },
  {
    year: '2020',
    heading: '디스코드 서버 활동 본격화',
    body: '본격적인 디스코드 서버 활동을 시작하며 커뮤니티를 확장했습니다. 다양한 사람들과 교류하며 개발자이자 인플루언서로서의 역량을 키워나갔습니다.',
  },
  {
    year: '2022 — 무기한',
    heading: '디스코드 서버 매니저 & 관리자',
    body: '다수의 크리에이터 디스코드 서버를 운영·관리하며 커뮤니티 빌딩 경험을 쌓아왔습니다.',
    managed: [
      { name: '약 10만 구독자 유튜버', desc: '서버 매니저', note: '서버 삭제로 활동 종료 · 비공개', active: false },
      { name: '시류', desc: '병맛·개그 크리에이터 서버 관리자', note: '비활동으로 관리 종료', active: false },
      { name: '단풍나무', desc: '오버워치 크리에이터 서버 관리자', note: '비활동으로 관리 종료', active: false },
      { name: '대타맨', desc: '게임 스토리 크리에이터 서버 관리자', note: '현재 관리 중', active: true },
    ],
  },
  {
    year: '2024. 01 — 2025. 03',
    heading: 'PC방 아르바이트',
    body: '학업과 병행하며 PC방에서 아르바이트를 하였습니다.',
    duties: [
      { label: '운영 관리', desc: '정산 업무 및 PC · 시설물 유지 관리' },
      { label: '고객 응대', desc: '고객 안내 및 불편 사항 처리' },
      { label: '음식 조리', desc: '라면 · 즉석식품을 조리하여 고객에게 제공' },
      { label: '매장 관리', desc: '상품 진열, 좌석 청소, 화장실 및 계단 청소 등 매장 환경 유지' },
    ],
  },
  {
    year: '2024. 03. 04',
    heading: '전문대학교 입학',
    body: '컴퓨터공학과에 진학하여 본격적으로 소프트웨어 개발을 공부하기 시작했습니다.',
    projects: [
      { name: 'CarScope', role: '팀장으로 개발에 임함', period: '2025년 2학기' },
      { name: 'WatchMan', role: '프론트 개발자로 임함', period: '2026년 1학기' },
    ],
  },
  {
    year: '2025 — 2027',
    heading: '키오스크 회사 국가근로장학생',
    body: '결제 단말기 및 키오스크 솔루션 전문 기업에서 IT 운영 지원 업무를 담당하고 있습니다.',
    duties: [
      { label: '원격 지원', desc: '씨트롤 · K-Remote 활용, 현장 장애 대응 및 기술 지원' },
      { label: '기기 관리', desc: '크라이저 활용, 키오스크 설정 · 유지보수 보조' },
      { label: 'VAN 결제', desc: 'VAN사 연동 결제 시스템 운영 · 설정 · 장애 처리' },
      { label: '문서 작업', desc: '엑셀을 활용한 데이터 정리 및 업무 문서 작성' },
      { label: '블로그 관리', desc: '네이버 블로그 콘텐츠 작성 및 게시물 관리' },
    ],
  },
  {
    year: '2024. 05. 16 — 무기한',
    heading: 'Hello! VRChat World! 디스코드 서버 운영',
    body: 'VRChat 비공식 친목 서버 Hello! VRChat World!를 개설하여 현재까지 운영 중입니다. VRChat 유저들이 편하게 모여 교류할 수 있는 커뮤니티를 만들어가고 있습니다.',
    discord: true,
    bot: 'HVW_Bot',
    botNote: '로컬 서버로 운영 중',
  },
]

const SKILLS = [
  {
    label: '언어',
    items: ['Python', 'JavaScript', 'TypeScript', 'PHP', 'JSP', 'HTML / CSS', 'Flutter', 'React', 'C#', 'C++', 'Java'],
    cls: 'lang',
  },
  {
    label: '프레임워크 / 라이브러리',
    items: ['Next.js', 'Spring Boot', 'discord.js', 'discord.py'],
    cls: 'framework',
  },
  {
    label: 'DB',
    items: ['MySQL', 'MariaDB', 'Firebase'],
    cls: 'db',
  },
  {
    label: '클라우드',
    items: ['AWS', 'Vercel'],
    cls: 'cloud',
  },
  {
    label: '서버',
    items: ['Node.js', 'Linux (Kali)', 'Linux (Ubuntu)'],
    cls: 'server',
  },
  {
    label: '디자인',
    items: ['Photoshop (기본)'],
    cls: 'design',
  },
  {
    label: '하드웨어',
    items: ['라즈베리파이', '아두이노'],
    cls: 'hw',
  },
  {
    label: 'IDE / 에디터',
    items: ['Visual Studio Code', 'Visual Studio', 'Eclipse', 'Python IDLE', 'Arduino IDE'],
    cls: 'ide',
  },
]

export default function HomePage() {
  const [tmiIdx, setTmiIdx] = useState(0)
  const [tmiVisible, setTmiVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setTmiVisible(false)
      setTimeout(() => {
        setTmiIdx(i => (i + 1) % TMI_LIST.length)
        setTmiVisible(true)
      }, 350)
    }, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bubble">
          <img
            className="hero-avatar"
            src={feheProfile}
            alt="페헤 프로필"
          />
          <p className="hero-label">Hello! I&apos;m</p>
          <h1 className="hero-name">페헤</h1>
          <p className="hero-sub">Developer &nbsp;·&nbsp; Creator &nbsp;·&nbsp; Community Builder</p>
          <div className="hero-badges">
            <span className="badge">개발자</span>
            <span className="badge">인플루언서</span>
            <span className="badge">커뮤니티</span>
          </div>
          <div className="hero-links">
            <a className="hero-link gh" href="https://github.com/Fehe1234" target="_blank" rel="noopener noreferrer">
              <IconGithub /> GitHub
            </a>
            <a className="hero-link yt" href="https://www.youtube.com/@fehe1234" target="_blank" rel="noopener noreferrer">
              <IconYoutube /> YouTube
            </a>
            <a className="hero-link steam" href="https://steamcommunity.com/profiles/76561199008770006/" target="_blank" rel="noopener noreferrer">
              <IconSteam /> Steam
            </a>
            <a className="hero-link insta" href="https://www.instagram.com/fehe_developer/" target="_blank" rel="noopener noreferrer">
              <IconInstagram /> Instagram
            </a>
          </div>
        </div>

        <div className="scroll-hint">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          scroll
        </div>
      </section>

      {/* ── Timeline ── */}
      <main className="section">
        <div className="section-header">
          <div className="section-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="section-title">
            History
            <small>페헤의 활동 기록</small>
          </div>
        </div>

        <div className="timeline">
          {TIMELINE.map((item, i) => (
            <div className="timeline-card" key={i}>
              <div className="card-top">
                <span className="timeline-year">{item.year}</span>
              </div>
              <h2 className="timeline-heading">{item.heading}</h2>
              {item.body && <p className="timeline-body">{item.body}</p>}
              {item.extra && <div className="timeline-body">{item.extra}</div>}
              {item.managed && item.managed.map((m, mi) => (
                <p key={mi} className="timeline-body" style={{ marginTop: mi === 0 ? '0.6rem' : '0.3rem', paddingTop: mi === 0 ? '0.6rem' : 0, borderTop: mi === 0 ? '1px solid var(--border)' : 'none', fontSize: '0.82rem', textDecoration: m.active ? 'none' : 'line-through' }}>
                  <strong style={{ color: m.active ? 'var(--sky-deep)' : 'var(--text-muted)' }}>{m.name}</strong>
                  {' '}&mdash; {m.desc}{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({m.note})</span>
                </p>
              ))}
              {item.duties && item.duties.map((d, di) => (
                <p key={di} className="timeline-body" style={{ marginTop: di === 0 ? '0.6rem' : '0.3rem', paddingTop: di === 0 ? '0.6rem' : 0, borderTop: di === 0 ? '1px solid var(--border)' : 'none', fontSize: '0.82rem' }}>
                  <strong style={{ color: 'var(--sky-deep)' }}>{d.label}</strong>
                  &nbsp; {d.desc}
                </p>
              ))}
              {item.projects && item.projects.map((proj, pi) => (
                <p key={pi} className="timeline-body" style={{ marginTop: pi === 0 ? '0.6rem' : '0.3rem', paddingTop: pi === 0 ? '0.6rem' : 0, borderTop: pi === 0 ? '1px solid var(--border)' : 'none', fontSize: '0.82rem' }}>
                  <strong style={{ color: 'var(--sky-deep)' }}>프로젝트</strong>
                  &nbsp; {proj.name} — {proj.role}{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({proj.period})</span>
                </p>
              ))}
              {(item.discord || item.bot) && (
                <div className="timeline-badge-row">
                  {item.discord && (
                    <a className="timeline-link" href="https://discord.gg/6K2CT7fUZA" target="_blank" rel="noopener noreferrer">
                      <IconDiscord /> Discord 서버 참가
                    </a>
                  )}
                  {item.bot && (
                    <p className="timeline-bot">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      단독봇 운영 중 — <strong>{item.bot}</strong>
                      {item.botNote && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {item.botNote}</span>}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* ── Skills ── */}
      <section className="skills-section">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <div className="section-icon" style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div className="section-title">
            기술 스택
            <small>사용 가능한 언어 및 도구</small>
          </div>
        </div>

        {SKILLS.map((cat, i) => (
          <div className="skill-card" key={i}>
            <p className="skill-cat-label">{cat.label}</p>
            <div className="skill-badges">
              {cat.items.map((item, j) =>
                <span className={`skill-badge ${cat.cls}`} key={j}>{item}</span>
              )}
            </div>
          </div>
        ))}

        <div className="skill-card cert-card">
          <p className="skill-cat-label">자격증</p>
          <div className="skill-badges">
            <span className="cert-empty">취득한 자격증이 없습니다.</span>
          </div>
        </div>

        <div className="tmi-bar">
          <span className="tmi-label">TMI</span>
          <div className="tmi-text-wrap">
            <span className={`tmi-text${tmiVisible ? '' : ' tmi-text--hidden'}`}>{TMI_LIST[tmiIdx]}</span>
          </div>
        </div>
      </section>
    </>
  )
}
