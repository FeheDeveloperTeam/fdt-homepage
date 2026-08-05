import { useCallback, useState } from 'react'
import Seo from '../../components/Seo/Seo'
import { SEO_DATA } from '../../seoData'
import {
  detectConnectionInfo,
  diagnose,
  estimateConnectionType,
  fetchPublicIp,
  runDownloadSpeedTest,
  runLatencyTest,
} from './networkDiagnostics'
import styles from './NetworkTest.module.css'

const SEO_PATH = '/유틸리티/네트워크-테스트'

const STEP_LABELS = {
  ip: 'IP 주소 확인 중...',
  latency: '지연 시간 측정 중...',
  speed: '다운로드 속도 측정 중...',
}

const SEVERITY_LABEL = { ok: '정상', warning: '주의', critical: '위험' }

function formatMs(value) {
  return value === null || value === undefined ? '-' : `${Math.round(value)}ms`
}

function NetworkTest() {
  const [status, setStatus] = useState('idle')
  const [step, setStep] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const runTest = useCallback(async () => {
    setStatus('running')
    setError(null)
    setResult(null)

    const online = navigator.onLine
    const connectionInfo = detectConnectionInfo()

    try {
      setStep('ip')
      const ip = await fetchPublicIp()

      setStep('latency')
      const latency = await runLatencyTest()

      setStep('speed')
      let speed = null
      let speedError = false
      try {
        speed = await runDownloadSpeedTest()
      } catch {
        speedError = true
      }

      const diagnosis = diagnose({ online, ip, latency, speed, speedError })
      const estimatedType = connectionInfo.label ? null : estimateConnectionType(latency)

      setResult({ ip, online, connectionInfo, estimatedType, latency, speed, diagnosis })
      setStatus('done')
    } catch (err) {
      console.error('[network-test]', err)
      setError('테스트를 진행하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setStatus('idle')
    } finally {
      setStep(null)
    }
  }, [])

  return (
    <section className={styles.networkTest}>
      <Seo {...SEO_DATA[SEO_PATH]} path={SEO_PATH} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Utilities</p>
        <h1 className={styles.title}>네트워크 테스트</h1>
        <p className={styles.description}>
          지금 이 기기의 인터넷 연결 상태를 확인합니다. IP 주소, 지연 시간, 다운로드 속도를 측정하고
          문제가 있다면 예상되는 원인을 알려드립니다.
        </p>

        {status !== 'running' && (
          <button type="button" className={styles.startButton} onClick={runTest}>
            {status === 'done' ? '다시 테스트' : '테스트 시작'}
          </button>
        )}

        {status === 'running' && (
          <div className={styles.runningBox}>
            <span className={styles.spinner} />
            <span>{STEP_LABELS[step] || '준비 중...'}</span>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {status === 'done' && result && (
          <div className={styles.results}>
            <div className={`${styles.diagnosisCard} ${styles[result.diagnosis.severity]}`}>
              <span className={styles.diagnosisBadge}>
                {SEVERITY_LABEL[result.diagnosis.severity]}
              </span>
              <h2>{result.diagnosis.label}</h2>
              <p>{result.diagnosis.detail}</p>
            </div>

            <div className={styles.grid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>IP 주소</span>
                <span className={styles.statValue}>{result.ip || '확인 불가'}</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>온라인 상태</span>
                <span className={styles.statValue}>{result.online ? '온라인' : '오프라인'}</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>연결 방식</span>
                <span className={styles.statValue}>
                  {result.connectionInfo.label || result.estimatedType || '확인 불가'}
                </span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>평균 지연 시간</span>
                <span className={styles.statValue}>{formatMs(result.latency.avg)}</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>지터 (변동폭)</span>
                <span className={styles.statValue}>{formatMs(result.latency.jitter)}</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>패킷 손실률</span>
                <span className={styles.statValue}>{result.latency.lossPercent}%</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>다운로드 속도</span>
                <span className={styles.statValue}>
                  {result.speed ? `${result.speed.mbps.toFixed(1)} Mbps` : '측정 실패'}
                </span>
              </div>
            </div>

            <p className={styles.disclaimer}>
              연결 방식(유선/무선) 감지는 브라우저가 제공하는 정보를 기반으로 하며, 일부
              브라우저(Safari, Firefox 등)에서는 지원되지 않아 지연 시간 패턴 기반의 추정값으로
              대체됩니다. 모든 측정값은 참고용이며 실제 회선 상태와 다를 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default NetworkTest
