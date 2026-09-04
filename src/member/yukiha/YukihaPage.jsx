import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import { SEO_DATA } from '../../seoData'
import styles from './YukihaPage.module.css'

function ProfileImage({ alt, ...props }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className={styles.imageFallback} role="img" aria-label={`${alt}: 이미지 로딩 실패`}>
        {alt} — 이미지를 불러올 수 없어요.
      </span>
    )
  }

  return <img {...props} alt={alt} onError={() => setFailed(true)} />
}

// Content and image URLs mirror yukiha7777/yukiha7777 README.md.
function YukihaPage() {
  return (
    <section className={styles.page}>
      <Seo {...SEO_DATA['/member/yukiha']} path="/member/yukiha" noindex />
      <div className={styles.inner}>
        <article className={styles.profile}>
          <div className={styles.center}>
            <ProfileImage src="https://capsule-render.vercel.app/api?type=waving&height=230&color=0:FF9A3C,50:FF6B9A,100:8E75B2&text=YUKIHA%20DEV%20LAB&fontColor=FFFFFF&fontSize=44&fontAlignY=37&desc=AI%20%C2%B7%20Discord%20%C2%B7%20Game%20%C2%B7%20Mobile%20Developer&descAlignY=58&animation=fadeIn" width="100%" alt="YUKIHA DEV LAB" />
            <ProfileImage loading="lazy" src="https://avatars.githubusercontent.com/u/310349211?v=4" width="145" alt="Yukiha GitHub Avatar" />
            <h1>🦊 유키하 · YUKIHA</h1>
            <h3>Java · Python · JavaScript · Discord Bot · Gemini AI · Web · Game AI</h3>
            <p><strong>게임과 애니를 좋아하고, AI 캐릭터와 재미있는 서비스를 만드는 개발자 유키하의 GitHub 공간입니다.</strong></p>
            <br/>
            <ProfileImage loading="lazy" src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&pause=1000&center=true&vCenter=true&width=760&lines=Hello%2C+I'm+YUKIHA+%F0%9F%A6%8A;AI+Character+Developer;Discord+Bot+Developer;Java+%26+Python+Developer;Minecraft+%26+Game+AI+Builder;Building+NATSUMI+Project+%E2%9C%A8" alt="Typing SVG" />
            <br/>
            <ProfileImage loading="lazy" src="https://komarev.com/ghpvc/?username=yukiha7777&label=PROFILE+VIEWS&color=ff6b9a&style=for-the-badge" alt="Profile Views" />
            <a href="https://github.com/yukiha7777?tab=followers">
              <ProfileImage loading="lazy" src="https://img.shields.io/github/followers/yukiha7777?label=FOLLOWERS&style=for-the-badge&logo=github" alt="GitHub Followers" />
            </a>
          </div>
          <hr />
          <h2>✨ About Me</h2>
          <p>안녕! 나는 <strong>유키하(YUKIHA)</strong>야. 🦊</p>
          <p>Java와 Python을 중심으로 개발하고 있고, 단순한 프로그램보다는 <strong>캐릭터성 있는 AI, Discord 봇, 게임 연동 시스템, 모바일에서도 편하게 사용할 수 있는 서비스</strong>를 만드는 걸 좋아해.</p>
          <p>현재는 <strong>NATSUMI 프로젝트</strong>를 중심으로 AI 대화, 자동화, Discord 커뮤니티 기능, Minecraft/게임 연동 같은 여러 기능을 하나의 생태계로 연결하는 걸 목표로 개발하고 있어.</p>
          <pre><code>{"YUKIHA = Developer + Gamer + Anime Fan + AI Character Builder 🦊"}</code></pre>
          <h3>🌸 좋아하는 것</h3>
          <ul>
            <li>🎮 게임</li>
            <li>🌸 애니메이션</li>
            <li>🎵 음악</li>
            <li>🦊 여우 캐릭터</li>
            <li>🤖 AI / 자동화</li>
            <li>💻 코딩</li>
            <li>📱 모바일 친화적인 서비스 만들기</li>
          </ul>
          <hr />
          <h2>🦊 NATSUMI Project</h2>
          <p><strong>NATSUMI</strong>는 단순한 챗봇이 아니라, 사용자의 말과 상황을 이해하고 하나의 캐릭터처럼 반응하도록 만드는 <strong>AI Character Project</strong>야.</p>
          <h3>🎯 Project Goals</h3>
          <ul>
            <li>🤖 Gemini 기반 자연어 대화</li>
            <li>🎭 캐릭터 성격 / 감정 표현</li>
            <li>💬 Discord 서버 연동</li>
            <li>🛡️ 커뮤니티 관리 및 자동화</li>
            <li>🎮 Minecraft / 게임 환경 연동</li>
            <li>🌐 Web / Mobile 서비스 확장</li>
            <li>🔊 음성 / TTS 기능 확장</li>
            <li>🧠 행동 명령 자동 분류 및 실행</li>
          </ul>
          <div className={styles.center}>
            <a href="https://gourl.kr/NATSUMI-website">
              <ProfileImage loading="lazy" src="https://img.shields.io/badge/NATSUMI-WEBSITE-FF6B9A?style=for-the-badge&logo=googlechrome&logoColor=white" alt="NATSUMI Website" />
            </a>
          </div>
          <hr />
          <h2>🛠️ Tech Stack</h2>
          <h3>💻 Main Languages</h3>
          <p className={styles.badges}>
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
          </p>
          <h3>🤖 Backend / AI / Database</h3>
          <p className={styles.badges}>
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
          </p>
          <h3>🧰 Tools / Platform</h3>
          <p className={styles.badges}>
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Discord_Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Bot" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Linux_Server-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/iOS_Mobile-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS" />
            <ProfileImage loading="lazy" src="https://img.shields.io/badge/Minecraft-62B47A?style=for-the-badge&logo=minecraft&logoColor=white" alt="Minecraft" />
          </p>
          <hr />
          <h2>🚀 What I Build</h2>
          <div className={styles.buildGrid}>
            <section className={styles.buildCard}>
              <h3>💬 Discord Bot</h3>
              <ul>
                <li>Slash Command 시스템</li>
                <li>버튼 / 셀렉트 메뉴 / 모달 UI</li>
                <li>티켓 및 로그 시스템</li>
                <li>랭크 / 레벨 / 포인트</li>
                <li>서버 관리 / 보안 자동화</li>
                <li>MongoDB 연동</li>
                <li>AI 대화 기능</li>
                <li>24/7 서버 운영 구조</li>
              </ul>
            </section>
            <section className={styles.buildCard}>
              <h3>🤖 AI Character</h3>
              <ul>
                <li>Gemini 기반 자연어 처리</li>
                <li>캐릭터 성격 유지</li>
                <li>감정 기반 응답</li>
                <li>상황별 행동 분류</li>
                <li>AI 캐릭터 세계관</li>
                <li>TTS / 음성 기능 확장</li>
                <li>게임 환경 연동</li>
                <li>자동 행동 시스템</li>
              </ul>
            </section>
            <section className={styles.buildCard}>
              <h3>🌐 Web / Mobile</h3>
              <ul>
                <li>반응형 Web UI</li>
                <li>모바일 중심 UX</li>
                <li>HTML / CSS / JavaScript</li>
                <li>Flask / FastAPI Backend</li>
                <li>GitHub Pages</li>
                <li>API 연동</li>
                <li>관리 Dashboard</li>
                <li>iOS 친화 환경</li>
              </ul>
            </section>
            <section className={styles.buildCard}>
              <h3>🎮 Game / Minecraft AI</h3>
              <ul>
                <li>Minecraft Bedrock Add-on</li>
                <li>AI Companion</li>
                <li>자연어 명령 처리</li>
                <li>자동 채굴 / 농사 / 건축</li>
                <li>NPC 행동 시스템</li>
                <li>WebSocket Relay</li>
                <li>외부 AI Backend 연동</li>
                <li>모바일 환경 우선 개발</li>
              </ul>
            </section>
          </div>
          <hr />
          <h2>🧠 Current Focus</h2>
          <pre><code>{"name: YUKIHA\nfocus:\n  - NATSUMI AI Character\n  - Discord Bot\n  - Minecraft Bedrock AI\n  - Mobile Friendly Services\n  - Automation\n  - Gemini Integration\n\ngoal: \"AI가 단순히 대답하는 것을 넘어 실제로 행동하고 함께하는 시스템 만들기\""}</code></pre>
          <hr />
          <h2>📊 GitHub Stats</h2>
          <div className={styles.center}>
            <ProfileImage loading="lazy" height="170" src="https://github-readme-stats.vercel.app/api?username=yukiha7777&show_icons=true&theme=tokyonight&hide_border=true&rank_icon=github" alt="Yukiha GitHub Stats" />
            <ProfileImage loading="lazy" height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=yukiha7777&layout=compact&theme=tokyonight&hide_border=true" alt="Yukiha Top Languages" />
            <br/><br/>
            <ProfileImage loading="lazy" src="https://github-readme-streak-stats.herokuapp.com/?user=yukiha7777&theme=tokyonight&hide_border=true" alt="GitHub Streak" />
            <br/><br/>
            <ProfileImage loading="lazy" src="https://github-readme-activity-graph.vercel.app/graph?username=yukiha7777&theme=tokyo-night&hide_border=true&area=true" width="95%" alt="GitHub Activity Graph" />
          </div>
          <blockquote><p>새 계정이거나 공개 커밋이 아직 적으면 통계가 비어 보일 수 있어. 활동이 쌓이면 자동으로 채워져.</p></blockquote>
          <hr />
          <h2>🌐 Links</h2>
          <div className={styles.center}>
            <a href="https://github.com/yukiha7777">
              <ProfileImage loading="lazy" src="https://img.shields.io/badge/GitHub-yukiha7777-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
            </a>
            <a href="https://github.com/haruki7777">
              <ProfileImage loading="lazy" alt="GitHub haruki7777" src="https://img.shields.io/badge/GitHub-haruki7777-181717?style=for-the-badge&logo=github&logoColor=white" />
            </a>
            <a href="https://gourl.kr/NATSUMI-website">
              <ProfileImage loading="lazy" src="https://img.shields.io/badge/NATSUMI-WEBSITE-FF6B9A?style=for-the-badge&logo=googlechrome&logoColor=white" alt="NATSUMI Website" />
            </a>
            <a href="https://guns.lol/yukiha77">
              <ProfileImage loading="lazy" src="https://img.shields.io/badge/guns.lol-yukiha77-8E75B2?style=for-the-badge&logo=linktree&logoColor=white" alt="guns.lol" />
            </a>
          </div>
          <hr />
          <h2>💬 One Line</h2>
          <div className={styles.center}>
            <h3>🦊 게임과 애니를 좋아하고, AI 캐릭터와 코드를 함께 키워가는 개발자 <strong>유키하</strong>입니다.</h3>
            <br/>
            <p><strong>Made with Java, Python, AI, Games and a little fox spirit 🦊✨</strong></p>
            <br/><br/>
            <ProfileImage loading="lazy" src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=0:8E75B2,50:FF6B9A,100:FF9A3C" width="100%" alt="footer" />
          </div>
        </article>
        <Link to="/about" className={styles.backButton}>
          ← 팀 소개로 돌아가기
        </Link>
      </div>
    </section>
  )
}

export default YukihaPage
