import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import { SEO_DATA } from '../../seoData'
import { CONTACT_EMAIL } from '../../navLinks'
import styles from './Privacy.module.css'

// fehe.dev 웹사이트 전체의 개인정보 처리방침. 치유미 봇은 별도 방침(/DiscordBot/Chiyumi/privacy)을 따른다.
// 사이트가 실제로 처리하는 정보(코드 기준)가 바뀌면 이 문서와 「최종 수정일」을 함께 고친다.
const UPDATED = '2026년 11월 18일'

function Privacy() {
  return (
    <section className={styles.privacy}>
      <Seo {...SEO_DATA['/privacy']} path="/privacy" />
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
          Privacy
        </p>
        <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
          개인정보 처리방침
        </h1>
        <p className={`${styles.lead} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
          FeheDeveloperTeam(페헤개발팀, 이하 「FDT」)이 운영하는 웹사이트 www.fehe.dev에서 어떤 정보가 어떻게
          처리되는지 안내합니다. 최종 수정일: {UPDATED}
        </p>

        <div className={styles.body}>
          <h2>1. 적용 범위</h2>
          <p>
            이 방침은 www.fehe.dev의 모든 페이지(팀 소개, 멤버 페이지, 수능 D-Day 타이머, 네트워크 테스트, 마인크래프트
            위키 등)에 적용됩니다. 디스코드 봇 치유미와 그 관리 화면에서 처리하는 정보는{' '}
            <Link to="/DiscordBot/Chiyumi/privacy">치유미 개인정보 처리방침</Link>을 따릅니다.
          </p>

          <h2>2. 직접 수집하는 정보</h2>
          <p>
            이 사이트에는 회원가입이 없으며, 방문자에게 이름·연락처 같은 개인정보를 입력받지 않습니다. 이메일로 문의하시면
            답변을 위해 보내 주신 이메일 주소와 내용만 사용합니다.
          </p>

          <h2>3. 자동으로 처리되는 정보</h2>
          <ul>
            <li>
              <strong>접속 기록</strong>: 사이트를 호스팅하는 Vercel의 운영 과정에서 IP 주소, 브라우저 정보, 요청한 주소
              등이 접속 로그로 처리될 수 있습니다.
            </li>
            <li>
              <strong>방문 통계</strong>: Vercel Web Analytics와 Speed Insights로 페이지 조회 수와 로딩 성능을 집계합니다.
              개인을 식별하기 위한 용도로 쓰지 않습니다.
            </li>
            <li>
              <strong>네트워크 테스트</strong>: 공개 IP 확인 결과는 화면에 보여 주기만 하고 저장하지 않습니다.
            </li>
            <li>
              <strong>페헤 페이지 방문자 수</strong>: 날짜별 방문 숫자만 저장하며, 누가 방문했는지는 기록하지 않습니다.
            </li>
          </ul>

          <h2>4. 브라우저 저장소와 쿠키</h2>
          <p>
            일부 화면은 기능을 위해 방문자의 브라우저에 작은 값을 저장합니다. 페헤 페이지는 같은 날 방문자 수가 중복으로
            세어지지 않도록 오늘 날짜를 브라우저 저장소에 기록합니다. 치유미 관리 화면에 Discord로 로그인하면 로그인 유지를
            위한 쿠키가 사용됩니다. 브라우저 설정에서 쿠키와 저장소를 지우거나 막을 수 있으며, 이 경우 일부 기능이 동작하지
            않을 수 있습니다.
          </p>

          <h2>5. 광고 (Google AdSense)</h2>
          <p>
            이 사이트는 Google AdSense로 광고를 게재할 수 있습니다. Google을 비롯한 제3자 공급업체는 쿠키를 사용하여
            사용자가 이 사이트나 다른 웹사이트를 이전에 방문한 기록을 바탕으로 광고를 게재합니다. Google은 광고 쿠키를
            사용하여 사용자의 이 사이트 및 다른 사이트 방문 기록에 기반한 광고를 Google과 파트너가 게재할 수 있도록 합니다.
          </p>
          <p>
            사용자는{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google 광고 설정
            </a>
            에서 맞춤 광고를 해제할 수 있으며,{' '}
            <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">
              www.aboutads.info
            </a>
            에서 제3자 공급업체의 맞춤 광고 쿠키 사용을 거부할 수 있습니다. Google이 광고에서 정보를 사용하는 방식은{' '}
            <a href="https://policies.google.com/technologies/ads?hl=ko" target="_blank" rel="noopener noreferrer">
              Google 광고 정책
            </a>
            에서 확인할 수 있습니다.
          </p>

          <h2>6. 외부 서비스</h2>
          <p>
            일부 페이지는 YouTube 동영상, Cloudflare Turnstile(로그인 전 사람 확인), Discord 로그인 등 외부 서비스를
            사용합니다. 이 서비스들은 각 제공자의 개인정보 처리방침에 따라 정보를 처리할 수 있습니다.
          </p>

          <h2>7. 문의</h2>
          <p>
            개인정보와 관련된 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>로 보내 주세요.
          </p>

          <h2>8. 변경</h2>
          <p>이 방침이 바뀌면 이 페이지에 바뀐 내용과 최종 수정일을 게시합니다.</p>
        </div>
      </div>
    </section>
  )
}

export default Privacy
