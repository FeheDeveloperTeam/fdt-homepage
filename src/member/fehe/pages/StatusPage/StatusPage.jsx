import { useState, useEffect } from 'react'
import { db } from '../../firestore'
import { rtdb } from '../../realtimeDatabase'
import { doc, getDoc } from 'firebase/firestore'
import { ref, get } from 'firebase/database'
import { SITE_VERSION } from '../../version'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import './StatusPage.css'

const YT_CHANNEL_ID = 'UCY0LBUJ0a7JCBkkQ_ux0kew'
const YT_API_KEY    = 'AIzaSyAP2PyUsp5VYuj9KUMExwYw3YcceIegaII'

function StatusDot({ state }) {
  return <span className={`status-dot status-dot--${state}`} />
}

function StatusRow({ label, purpose, state, detail }) {
  const stateLabel = { ok: '정상', error: '오류', checking: '확인 중' }
  return (
    <div className="status-row">
      <div className="status-row-left">
        <StatusDot state={state} />
        <div className="status-row-label-group">
          <span className="status-row-label">{label}</span>
          {purpose && <span className="status-row-purpose">{purpose}</span>}
        </div>
      </div>
      <div className="status-row-right">
        <span className={`status-row-state status-row-state--${state}`}>
          {stateLabel[state]}
        </span>
        {detail && <span className="status-row-detail">{detail}</span>}
      </div>
    </div>
  )
}

export default function StatusPage() {
  useDocumentTitle('서버 상태', 'Fehe')
  const [firestore, setFirestore] = useState({ state: 'checking', ms: null })
  const [rtdbStatus, setRtdbStatus] = useState({ state: 'checking', ms: null })
  const [ipApi, setIpApi] = useState({ state: 'checking', ip: null })
  const [ytApi, setYtApi] = useState({ state: 'checking', ms: null, detail: null })
  const [checkedAt, setCheckedAt] = useState(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [ua, setUa] = useState({ browser: '', os: '' })

  useEffect(() => {
    // User Agent 파싱
    const u = navigator.userAgent
    let browser = '알 수 없음'
    if (u.includes('Edg/'))          browser = 'Microsoft Edge'
    else if (u.includes('OPR/'))     browser = 'Opera'
    else if (u.includes('Chrome/'))  browser = 'Chrome'
    else if (u.includes('Firefox/')) browser = 'Firefox'
    else if (u.includes('Safari/'))  browser = 'Safari'

    let os = '알 수 없음'
    if (u.includes('Windows NT'))                       os = 'Windows'
    else if (u.includes('Mac OS X'))                    os = 'macOS'
    else if (u.includes('Android'))                     os = 'Android'
    else if (u.includes('iPhone') || u.includes('iPad')) os = 'iOS'
    else if (u.includes('Linux'))                       os = 'Linux'
    setUa({ browser, os })

    async function runChecks() {
      setFirestore(p => ({ ...p, state: 'checking' }))
      setRtdbStatus(p => ({ ...p, state: 'checking' }))
      setIpApi(p => ({ ...p, state: 'checking' }))
      setYtApi(p => ({ ...p, state: 'checking' }))

      // 병렬 실행
      await Promise.all([
        (async () => {
          const t = Date.now()
          try {
            await getDoc(doc(db, 'config', 'admin'))
            setFirestore({ state: 'ok', ms: Date.now() - t })
          } catch {
            setFirestore({ state: 'error', ms: null })
          }
        })(),
        (async () => {
          const t = Date.now()
          try {
            await get(ref(rtdb, 'app/version'))
            setRtdbStatus({ state: 'ok', ms: Date.now() - t })
          } catch {
            setRtdbStatus({ state: 'error', ms: null })
          }
        })(),
        (async () => {
          const t = Date.now()
          try {
            const r = await fetch('https://api.ipify.org?format=json')
            const data = await r.json()
            setIpApi({ state: 'ok', ip: data.ip, ms: Date.now() - t })
          } catch {
            setIpApi(p => ({ ...p, state: 'error', ms: null }))
          }
        })(),
        (async () => {
          const t = Date.now()
          try {
            const r = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`
            )
            const data = await r.json()
            if (data.error) throw new Error(data.error.message)
            const title = data.items?.[0]?.snippet?.title ?? null
            setYtApi({ state: 'ok', ms: Date.now() - t, detail: title })
          } catch (e) {
            setYtApi({ state: 'error', ms: null, detail: e.message })
          }
        })(),
      ])

      setCheckedAt(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }))
      setSecondsAgo(0)
    }

    runChecks()
    const pingInterval = setInterval(runChecks, 10000)
    const tickInterval = setInterval(() => setSecondsAgo(s => s + 1), 1000)
    return () => { clearInterval(pingInterval); clearInterval(tickInterval) }
  }, [])

  const allOk = firestore.state === 'ok' && rtdbStatus.state === 'ok' && ipApi.state === 'ok' && ytApi.state === 'ok'
  const hasError = firestore.state === 'error' || rtdbStatus.state === 'error' || ytApi.state === 'error'

  return (
    <div className="status-page">
      <div className="status-container">

        {/* 헤더 */}
        <div className="status-header">
          <div className={`status-badge ${hasError ? 'status-badge--error' : allOk ? 'status-badge--ok' : 'status-badge--checking'}`}>
            <StatusDot state={hasError ? 'error' : allOk ? 'ok' : 'checking'} />
            {hasError ? '일부 시스템에 문제가 있습니다' : allOk ? '모든 시스템 정상 작동 중' : '상태 확인 중...'}
          </div>
          <h1 className="status-title">시스템 상태</h1>
          {checkedAt && (
            <p className="status-checked">
              마지막 확인: {checkedAt}
              {secondsAgo > 0 && ` (${secondsAgo}초 전)`}
            </p>
          )}
        </div>

        {/* 서비스 상태 */}
        <div className="status-card">
          <p className="status-card-title">서비스</p>
          <StatusRow
            label="Firebase Firestore"
            purpose="설정 데이터 연결 확인"
            state={firestore.state}
            detail={firestore.ms != null ? `${firestore.ms}ms` : null}
          />
          <StatusRow
            label="Firebase Realtime DB"
            purpose="버전 알림 배너용 실시간 데이터"
            state={rtdbStatus.state}
            detail={rtdbStatus.ms != null ? `${rtdbStatus.ms}ms` : null}
          />
          <StatusRow
            label="외부 IP API"
            purpose="ipify.org · 접속 IP 조회"
            state={ipApi.state}
            detail={ipApi.ms != null ? `${ipApi.ms}ms` : null}
          />
          <StatusRow
            label="YouTube Data API v3"
            purpose="유튜브 채널 정보 조회"
            state={ytApi.state}
            detail={
              ytApi.state === 'ok' && ytApi.ms != null
                ? `${ytApi.ms}ms${ytApi.detail ? ` · ${ytApi.detail}` : ''}`
                : ytApi.state === 'error' && ytApi.detail
                ? ytApi.detail
                : null
            }
          />
        </div>

        {/* 현재 접속 정보 */}
        <div className="status-card">
          <p className="status-card-title">내 접속 정보</p>
          <div className="status-info-grid">
            <div className="status-info-item">
              <span className="status-info-label">IP 주소</span>
              <span className="status-info-value">{ipApi.ip ?? '—'}</span>
            </div>
            <div className="status-info-item">
              <span className="status-info-label">브라우저</span>
              <span className="status-info-value">{ua.browser || '—'}</span>
            </div>
            <div className="status-info-item">
              <span className="status-info-label">운영체제</span>
              <span className="status-info-value">{ua.os || '—'}</span>
            </div>
          </div>
        </div>

        {/* 사이트 정보 */}
        <div className="status-card">
          <p className="status-card-title">사이트 정보</p>
          <div className="status-info-grid">
            <div className="status-info-item">
              <span className="status-info-label">사이트 버전</span>
              <span className="status-info-value">{SITE_VERSION}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
