import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../DocPage.css'
import './ValorantDemoPage.css'

// Riot Developer Portal의 VALORANT Production 키 심사용 공개 시연 페이지.
// 심사 담당자는 디스코드 서버에 들어오거나 계정을 만들 수 없으므로, 봇이 실제로 보내는 화면을
// 같은 문구·배치로 다시 그려 보여 준다(봇 코드: Chiyumi/src/utils/valorantStats.js, statsUi.js).
// 예시 플레이어 이름은 모두 가상이다.

function DiscordButton({ children, tone = 'grey', disabled = false }) {
  return (
    <span className={`vd-btn vd-btn--${tone}${disabled ? ' is-disabled' : ''}`}>{children}</span>
  )
}

function Ephemeral() {
  return <p className="vd-ephemeral">👁 Only you can see this · 나만 볼 수 있는 메시지</p>
}

function BotHeader() {
  return (
    <div className="vd-msg-head">
      <span className="vd-avatar" aria-hidden="true">치</span>
      <span className="vd-name">치유미</span>
      <span className="vd-tag">APP</span>
    </div>
  )
}

function Caption({ children }) {
  return <p className="vd-caption">{children}</p>
}

const LIST_LINES = [
  ['✅', '승리', '13:9', '제트', '어센트', '21/14/4'],
  ['❌', '패배', '10:13', '레이즈', '바인드', '17/16/6'],
  ['✅', '승리', '13:7', '제트', '헤이븐', '19/10/3'],
  ['🏆', '1위', '', '제트', '데스매치 · 디스트릭트', '40/18/0'],
  ['✅', '승리', '13:11', '네온', '로터스', '24/17/5'],
]

const MY_TEAM = [
  ['제트', 'DemoPlayer#KR1', '21/14/4', 268, true],
  ['소바', 'Teammate1#KR1', '16/13/9', 214],
  ['오멘', 'Teammate2#KR1', '14/15/7', 189],
  ['킬조이', 'Teammate3#KR1', '12/12/5', 170],
  ['세이지', 'Teammate4#KR1', '8/14/12', 131],
]

const ENEMY_TEAM = [
  ['레이나', 'Opponent1#KR1', '20/16/3', 251],
  ['브리치', 'Opponent2#KR1', '15/16/8', 205],
  ['바이퍼', 'Opponent3#KR1', '13/17/6', 177],
  ['페이드', 'Opponent4#KR1', '11/17/9', 160],
  ['아스트라', 'Opponent5#KR1', '9/17/10', 128],
]

function ScoreLines({ rows }) {
  return (
    <div className="vd-field-value">
      {rows.map(([agent, name, kda, acs, me]) => (
        <div key={name} className={me ? 'vd-strong' : undefined}>
          {agent} {name}&nbsp;&nbsp;{kda}&nbsp;&nbsp;ACS {acs}
        </div>
      ))}
    </div>
  )
}

export default function ValorantDemoPage() {
  useDocumentTitle('VALORANT 전적검색 시연', 'Chiyumi')

  return (
    <div className="doc-page vd-page">
      <p className="eyebrow">Product demo · Riot API review</p>
      <h1 className="doc-title">Chiyumi × VALORANT match history</h1>
      <p className="doc-date">Last updated: 2026-11-23</p>
      <p className="doc-intro">
        This public page shows, step by step, how the VALORANT feature of the Chiyumi Discord bot works, for the
        Riot Games API review. Chiyumi is a Korean-language Discord bot run by FeheDeveloperTeam (fehe.dev) and is
        used in several community servers. The screens below reproduce the bot&apos;s real messages (same layout and
        Korean text, with English notes). All player names are fictional examples.
      </p>
      <p className="doc-intro">
        치유미 디스코드 봇의 발로란트 전적검색이 어떻게 동작하는지 Riot API 심사용으로 보여 주는 페이지입니다. 화면의
        플레이어 이름은 모두 예시입니다.
      </p>

      <section className="doc-section">
        <h2>Current status and plan</h2>
        <ul>
          <li>
            <strong>Today:</strong> the feature is live in Chiyumi and gets data from a third-party service (HenrikDev
            API) by Riot ID.
          </li>
          <li>
            <strong>With a VALORANT production key:</strong> we switch to the official VALORANT API and require Riot
            Sign On (RSO) opt-in. A member can only see match history for a Riot account they have linked
            themselves. Looking up other people by Riot ID is removed.
          </li>
          <li>
            RSO will be live within 30 days of approval, as the VALORANT policy requires. Until then the official key
            is not used for player stats.
          </li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>Step 1 — Run /전적검색 (stats) and pick VALORANT</h2>
        <p>
          A member types <span className="doc-code">/전적검색</span> in a server where Chiyumi is installed. The bot
          only works inside servers, not in DMs. The reply is ephemeral, so only that member sees it.
        </p>
        <div className="vd-discord">
          <BotHeader />
          <div className="vd-content">전적을 검색할 게임을 선택하세요.</div>
          <div className="vd-row">
            <DiscordButton tone="blurple">리그 오브 레전드</DiscordButton>
            <DiscordButton tone="blurple">발로란트</DiscordButton>
          </div>
          <Ephemeral />
        </div>
        <Caption>“Choose the game to look up.” → League of Legends / VALORANT buttons.</Caption>
      </section>

      <section className="doc-section">
        <h2>Step 2 — Link a Riot account with RSO (one time)</h2>
        <p>
          If the member has not linked a Riot account yet, the bot shows a link button instead of any stats. It opens
          the account-link page on fehe.dev:
        </p>
        <div className="vd-discord">
          <BotHeader />
          <div className="vd-embed" style={{ '--vd-bar': '#ff4655' }}>
            <div className="vd-embed-title">발로란트 계정 연결이 필요해요</div>
            <div className="vd-embed-desc">
              본인의 Riot 계정으로 로그인해 연결하면 내 발로란트 전적만 볼 수 있어요. 언제든 연결을 해제할 수 있어요.
            </div>
          </div>
          <div className="vd-row">
            <DiscordButton tone="link">Riot 계정 연결하기 ↗</DiscordButton>
          </div>
          <Ephemeral />
        </div>
        <Caption>
          “You need to link your VALORANT account. Sign in with your own Riot account to see only your own stats. You
          can unlink at any time.” → “Link Riot account”.
        </Caption>
        <ol className="vd-steps">
          <li>The link page signs the member in with Discord so we know which Discord account is linking.</li>
          <li>
            The member presses <strong>Sign in with Riot</strong> and is sent to Riot Sign On
            (auth.riotgames.com, scope <span className="doc-code">openid</span>).
          </li>
          <li>
            Riot redirects back to fehe.dev. Our server exchanges the code, calls ACCOUNT-V1{' '}
            <span className="doc-code">/riot/account/v1/accounts/me</span>, and stores only Discord user ID ↔ PUUID.
          </li>
          <li>The page says “Linked as gameName#tagLine”. The member goes back to Discord and runs /전적검색 again.</li>
          <li>
            Unlinking (button on the same page or in the bot) deletes the stored link immediately. After that, no data
            for that account is shown.
          </li>
        </ol>
      </section>

      <section className="doc-section">
        <h2>Step 3 — Recent matches</h2>
        <p>
          For a linked member, the bot shows their account level, current and peak rank, and their last 10 matches. A
          member can filter by mode (buttons), and the drop-down opens one match.
        </p>
        <div className="vd-discord">
          <BotHeader />
          <div className="vd-embed" style={{ '--vd-bar': '#38c0b5' }}>
            <div className="vd-embed-author">발로란트</div>
            <div className="vd-embed-title">DemoPlayer#KR1</div>
            <div className="vd-fields">
              <div className="vd-field">
                <div className="vd-field-name">계정 레벨</div>
                <div className="vd-field-value">Lv. <b>187</b></div>
              </div>
              <div className="vd-field">
                <div className="vd-field-name">현재 티어</div>
                <div className="vd-field-value">다이아몬드 2&nbsp;&nbsp;45RR</div>
              </div>
              <div className="vd-field">
                <div className="vd-field-name">최고 티어</div>
                <div className="vd-field-value">초월자 1 (e9a3)</div>
              </div>
              <div className="vd-field vd-field--full">
                <div className="vd-field-name">최근 전적 — 팀전 4판 3승 1패</div>
                <div className="vd-field-value">
                  {LIST_LINES.map(([icon, result, score, agent, map, kda], i) => (
                    <div key={i}>
                      <code className="vd-inline-code">{i + 1}</code> {icon} <b>{result}</b>
                      {score ? ` ${score}` : ''} · {agent} · {map} · {kda}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="vd-embed-footer">아래 목록에서 경기를 고르면 자세히 볼 수 있어요 · Riot Games 공식 제품이 아닙니다</div>
          </div>
          <div className="vd-row">
            <DiscordButton tone="blurple">전체</DiscordButton>
            <DiscordButton>경쟁전</DiscordButton>
            <DiscordButton>데스매치</DiscordButton>
          </div>
          <div className="vd-select">🔎 자세히 볼 경기를 고르세요 <span aria-hidden="true">⌄</span></div>
          <Ephemeral />
        </div>
        <Caption>
          Fields: account level · current rank · peak rank · recent results (win/loss and score, agent, map, K/D/A).
          Buttons: All / Competitive / Deathmatch. Drop-down: “Pick a match to see details”.
        </Caption>
      </section>

      <section className="doc-section">
        <h2>Step 4 — Match details</h2>
        <p>
          Picking a match replaces the same message with the details. Buttons move to the previous or next match,
          return to the list, or share this one match.
        </p>
        <div className="vd-discord">
          <BotHeader />
          <div className="vd-embed" style={{ '--vd-bar': '#3ba55d' }}>
            <div className="vd-embed-author">DemoPlayer#KR1</div>
            <div className="vd-embed-title">✅ 제트 - 승리 (13:9)</div>
            <div className="vd-embed-desc">경쟁전 | 어센트 | 38분 12초</div>
            <div className="vd-fields">
              <div className="vd-field vd-field--full">
                <div className="vd-field-name">내 기록</div>
                <div className="vd-field-value">
                  <div>킬/데스/어시스트: <b>21/14/4</b> (K/D 1.50)</div>
                  <div>평균 전투 점수(ACS): 268</div>
                  <div>피해량: 3712 (라운드당 169)</div>
                  <div>헤드샷 비율: 27%</div>
                </div>
              </div>
              <div className="vd-field vd-field--full">
                <div className="vd-field-name">🔵 블루팀 (내 팀) · 13라운드 승리</div>
                <ScoreLines rows={MY_TEAM} />
              </div>
              <div className="vd-field vd-field--full">
                <div className="vd-field-name">🔴 레드팀 · 9라운드</div>
                <ScoreLines rows={ENEMY_TEAM} />
              </div>
            </div>
          </div>
          <div className="vd-row">
            <DiscordButton disabled>◀ 이전 경기</DiscordButton>
            <DiscordButton tone="blurple">📋 목록으로 (1/5)</DiscordButton>
            <DiscordButton>다음 경기 ▶</DiscordButton>
            <DiscordButton tone="green">📢 채널에 공유</DiscordButton>
          </div>
          <Ephemeral />
        </div>
        <Caption>
          “My stats”: K/D/A, average combat score, damage, headshot rate, then both teams&apos; scoreboards (my team
          first). Buttons: ◀ Previous match / Back to list (1/5) / Next match ▶ / Share to channel.
        </Caption>
      </section>

      <section className="doc-section">
        <h2>Step 5 — Optional: share one match</h2>
        <p>
          Everything above is visible only to the member who asked. Only when they press <b>📢 채널에 공유</b> (share
          to channel) does the bot post that single match’s details in the channel, without mentioning anyone.
        </p>
      </section>

      <section className="doc-section">
        <h2>APIs we will use</h2>
        <ul>
          <li>RSO (OAuth 2.0 / OpenID Connect) for opt-in sign-in.</li>
          <li>ACCOUNT-V1 <span className="doc-code">accounts/me</span> with the RSO token, to get the linked PUUID and Riot ID.</li>
          <li>VAL-MATCH-V1 matchlist by PUUID and match by ID, only for linked PUUIDs (last 10 matches).</li>
          <li>VAL-CONTENT-V1 for localized agent, map and mode names.</li>
          <li>Region: KR / AP. Expected traffic is small (a few hundred lookups a day at most).</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>Data handling</h2>
        <ul>
          <li>Stored: Discord user ID ↔ Riot PUUID link only, until the member unlinks.</li>
          <li>Lookup results are kept in memory for 10 minutes so the buttons work, then discarded.</li>
          <li>No data is sold, shared with third parties, or used for rankings or leaderboards.</li>
          <li>The API key and RSO client secret are stored only on our server.</li>
          <li>
            <Link to="/DiscordBot/Chiyumi/terms/en">Terms of Service</Link> ·{' '}
            <Link to="/DiscordBot/Chiyumi/privacy/en">Privacy Policy</Link> ·{' '}
            <Link to="/DiscordBot/Chiyumi">Chiyumi home</Link> ·{' '}
            <a href="https://www.fehe.dev/contact">Contact FeheDeveloperTeam</a>
          </li>
        </ul>
      </section>

      <section className="doc-section">
        <p className="vd-legal">
          Chiyumi isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
          anyone officially involved in producing or managing Riot Games properties. Riot Games, VALORANT and all
          associated properties are trademarks or registered trademarks of Riot Games, Inc.
        </p>
      </section>
    </div>
  )
}
