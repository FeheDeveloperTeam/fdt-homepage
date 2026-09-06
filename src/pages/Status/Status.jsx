import { useCallback, useEffect, useRef, useState } from 'react'
import Seo from '../../components/Seo/Seo'
import { SEO_DATA } from '../../seoData'
import { fetchPublicIp, detectConnectionInfo } from '../../utility/NetworkTest/networkDiagnostics'
import LatencyChart from './LatencyChart'
import {
  HISTORY_SIZE,
  OVERALL_LABELS,
  POLL_INTERVAL_MS,
  STATE_LABELS,
  TARGETS,
  probe,
  summarize,
  worstState,
} from './statusMonitor'
import styles from './Status.module.css'

const EMPTY_HISTORY = Object.fromEntries(TARGETS.map((target) => [target.id, []]))

function formatMs(value) {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)}ms`
}

function StatusPill({ state, children }) {
  return (
    <span className={`${styles.pill} ${styles[state]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}

function Status() {
  const [history, setHistory] = useState(EMPTY_HISTORY)
  const [checkedAt, setCheckedAt] = useState(null)
  const [running, setRunning] = useState(true)
  const [connection, setConnection] = useState({ ip: null, info: detectConnectionInfo(), online: true })
  const runningRef = useRef(running)
  runningRef.current = running

  const runChecks = useCallback(async () => {
    const results = await Promise.all(TARGETS.map((target) => probe(target.path)))
    setHistory((prev) => {
      const next = {}
      TARGETS.forEach((target, index) => {
        next[target.id] = [...prev[target.id], results[index]].slice(-HISTORY_SIZE)
      })
      return next
    })
    setCheckedAt(Date.now())
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer = 0

    async function tick() {
      if (cancelled) return
      // 탭이 가려져 있으면 굳이 서버를 계속 두드리지 않는다.
      if (!document.hidden && runningRef.current) await runChecks()
      if (!cancelled) timer = setTimeout(tick, POLL_INTERVAL_MS)
    }
    tick()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [runChecks])

  useEffect(() => {
    let cancelled = false
    fetchPublicIp().then((ip) => {
      if (!cancelled) setConnection((prev) => ({ ...prev, ip }))
    })

    const sync = () => setConnection((prev) => ({ ...prev, online: navigator.onLine, info: detectConnectionInfo() }))
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      cancelled = true
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  const rows = TARGETS.map((target) => ({ target, summary: summarize(history[target.id]) }))
  const overall = worstState(rows.map((row) => row.summary.state))
  const apiHistory = history.api

  return (
    <section className={styles.status}>
      <Seo {...SEO_DATA['/status']} path="/status" />
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 0 }}>
          Status
        </p>
        <h1 className={`${styles.title} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 1 }}>
          서비스 상태
        </h1>
        <p className={`${styles.description} fdt-reveal fdt-reveal-visible`} style={{ '--reveal-i': 2 }}>
          fehe.dev의 주요 경로에 {POLL_INTERVAL_MS / 1000}초마다 요청을 보내 응답 시간을 실시간으로 보여줍니다.
          지금 보고 계신 브라우저에서 직접 측정하므로, 서버 상태뿐 아니라 현재 접속 회선의 상태도 함께 반영됩니다.
        </p>

        <div className={styles.overview}>
          <div className={styles.overviewMain}>
            <StatusPill state={overall}>{OVERALL_LABELS[overall]}</StatusPill>
            <p className={styles.checkedAt}>
              {checkedAt
                ? `마지막 확인 ${new Date(checkedAt).toLocaleTimeString('ko-KR', { hour12: false })}`
                : '첫 확인 중…'}
            </p>
          </div>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setRunning((prev) => !prev)}
            aria-pressed={running}
          >
            {running ? '자동 확인 멈추기' : '자동 확인 다시 시작'}
          </button>
        </div>

        <div className={styles.card}>
          <LatencyChart history={apiHistory} label="API 서버" />
        </div>

        <div className={styles.table} role="table" aria-label="서비스별 상태">
          <div className={`${styles.tableRow} ${styles.tableHead}`} role="row">
            <span role="columnheader">서비스</span>
            <span role="columnheader">상태</span>
            <span role="columnheader">현재</span>
            <span role="columnheader">평균</span>
            <span role="columnheader">성공률</span>
          </div>
          {rows.map(({ target, summary }) => (
            <div className={styles.tableRow} role="row" key={target.id}>
              <span className={styles.service} role="cell">
                <span className={styles.serviceName}>{target.label}</span>
                <span className={styles.servicePurpose}>{target.purpose}</span>
              </span>
              <span role="cell">
                <StatusPill state={summary.state}>{STATE_LABELS[summary.state]}</StatusPill>
              </span>
              <span className={styles.number} role="cell" data-label="현재">
                {summary.latest && !summary.latest.ok ? summary.latest.reason : formatMs(summary.latest?.ms)}
              </span>
              <span className={styles.number} role="cell" data-label="평균">{formatMs(summary.avg)}</span>
              <span className={styles.number} role="cell" data-label="성공률">
                {summary.successRate === null ? '—' : `${Math.round(summary.successRate)}%`}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>내 연결</h2>
          <dl className={styles.definitions}>
            <div>
              <dt>인터넷 연결</dt>
              <dd>{connection.online ? '온라인' : '오프라인'}</dd>
            </div>
            <div>
              <dt>접속 IP</dt>
              <dd>{connection.ip || '확인 중…'}</dd>
            </div>
            <div>
              <dt>연결 방식</dt>
              <dd>
                {connection.info.supported
                  ? connection.info.label || connection.info.effectiveType || '알 수 없음'
                  : '브라우저에서 확인 불가'}
              </dd>
            </div>
            <div>
              <dt>브라우저 추정 속도</dt>
              <dd>
                {typeof connection.info.downlinkMbps === 'number'
                  ? `${connection.info.downlinkMbps}Mbps`
                  : '브라우저에서 확인 불가'}
              </dd>
            </div>
          </dl>
          <p className={styles.note}>
            더 자세한 회선 진단이 필요하면 <a href="/utility/network-test">네트워크 테스트</a>에서
            왕복 지연과 다운로드 처리량을 측정할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Status
