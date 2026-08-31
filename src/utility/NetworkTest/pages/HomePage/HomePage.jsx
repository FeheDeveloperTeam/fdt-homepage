import { useCallback, useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { describeConnection, detectConnectionInfo, diagnose, fetchPublicIp, runDownloadSpeedTest, runLatencyTest } from '../../networkDiagnostics'
import SpeedGauge from '../../components/SpeedGauge/SpeedGauge'
import './HomePage.css'

const STEP_LABELS = {
  ip: '공개 IP 주소를 확인하고 있습니다…',
  latency: '테스트 서버까지 HTTP 왕복 시간을 측정하고 있습니다…',
  speed: '워밍업 후 3개 연결로 다운로드 처리량을 측정하고 있습니다…',
}

const SEVERITY_LABEL = { ok: '정상', warning: '주의', critical: '위험' }

function formatMs(value) {
  return value === null || value === undefined ? '-' : `${Math.round(value)}ms`
}

function formatTransferred(bytes) {
  if (!bytes) return '-'
  return bytes >= 1_000_000_000 ? `${(bytes / 1_000_000_000).toFixed(2)} GB` : `${(bytes / 1_000_000).toFixed(1)} MB`
}

function Stat({ label, value, hint }) {
  return (
    <div className="nettest-stat">
      <span className="nettest-stat-label">{label}</span>
      <span className="nettest-stat-value">{value}</span>
      {hint && <span className="nettest-stat-hint">{hint}</span>}
    </div>
  )
}

export default function HomePage() {
  useDocumentTitle('네트워크 테스트')

  const [status, setStatus] = useState('idle')
  const [step, setStep] = useState(null)
  const [data, setData] = useState({})
  const [diagnosis, setDiagnosis] = useState(null)
  const [liveMbps, setLiveMbps] = useState(null)
  const [error, setError] = useState(null)

  const runTest = useCallback(async () => {
    setStatus('running')
    setError(null)
    setData({})
    setDiagnosis(null)
    setLiveMbps(null)

    const online = navigator.onLine
    setData({ online })

    try {
      setStep('ip')
      const ip = await fetchPublicIp()
      setData((previous) => ({ ...previous, ip }))

      setStep('latency')
      const latency = await runLatencyTest()
      const connectionLabel = describeConnection(detectConnectionInfo(), latency)
      setData((previous) => ({ ...previous, latency, connectionLabel }))

      setStep('speed')
      let speed = null
      let speedError = false
      try {
        speed = await runDownloadSpeedTest(setLiveMbps)
      } catch {
        speedError = true
      }
      setData((previous) => ({ ...previous, speed }))
      setDiagnosis(diagnose({ online, ip, latency, speed, speedError }))
      setStatus('done')
    } catch (runError) {
      console.error('[network-test]', runError)
      setError('테스트를 진행하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setStatus('idle')
    } finally {
      setStep(null)
    }
  }, [])

  const gaugeMbps = status === 'running' && step === 'speed' ? liveMbps : data.speed?.mbps ?? null

  return (
    <section className="nettest-hero">
      <p className="nettest-eyebrow">NETWORK DIAGNOSTICS</p>
      <h1 className="nettest-title">내 연결, 이 사이트 기준으로 확인하기</h1>
      <p className="nettest-desc">
        공개 IP, 이 사이트 서버까지의 HTTP 왕복 시간, 지속 다운로드 처리량을 분리해 측정합니다.
        하나의 숫자로 단정하지 않고 측정 경로와 조건을 함께 보여드립니다.
      </p>

      <div className="nettest-method" aria-label="측정 방식 안내">
        <span>01 · 연결 워밍업</span><span>02 · HTTP 왕복 시간 8회</span><span>03 · 병렬 다운로드 10초</span>
      </div>

      <div className="nettest-gauge-wrap">
        <SpeedGauge mbps={gaugeMbps} phase={status} step={step} severity={diagnosis?.severity ?? null} />
      </div>

      {status !== 'running' && (
        <button type="button" className="nettest-start-btn" onClick={runTest}>
          {status === 'done' ? '다시 측정하기' : '네트워크 측정 시작'}
        </button>
      )}

      {status === 'running' && (
        <div className="nettest-running" aria-live="polite">
          <span className="nettest-spinner" />
          <span key={step} className="nettest-step-label">{STEP_LABELS[step] || '측정을 준비하고 있습니다…'}</span>
        </div>
      )}

      {error && <p className="nettest-error">{error}</p>}

      {status !== 'idle' && (
        <div className="nettest-results">
          {diagnosis && (
            <div className={`nettest-diagnosis nettest-diagnosis--${diagnosis.severity}`}>
              <span className="nettest-diagnosis-badge">{SEVERITY_LABEL[diagnosis.severity]}</span>
              <h2>{diagnosis.label}</h2>
              <p>{diagnosis.detail}</p>
            </div>
          )}

          <div className="nettest-grid">
            {data.online !== undefined && <Stat label="온라인 상태" value={data.online ? '온라인' : '오프라인'} />}
            {data.ip !== undefined && <Stat label="공개 IP 주소" value={data.ip || '확인 불가'} />}
            {data.latency && <Stat label="연결 방식" value={data.connectionLabel} hint="브라우저 제공 정보 또는 추정" />}
            {data.latency && <Stat label="HTTP 왕복 시간" value={formatMs(data.latency.median)} hint={`중앙값 · 평균 ${formatMs(data.latency.avg)}`} />}
            {data.latency && <Stat label="응답 변동" value={formatMs(data.latency.jitter)} hint={`요청 실패 ${data.latency.lossPercent}%`} />}
            {status === 'done' && <Stat label="다운로드 처리량" value={data.speed ? `${data.speed.mbps.toFixed(1)} Mbps` : '측정 실패'} hint={data.speed ? `${data.speed.concurrency}개 병렬 연결 · ${data.speed.seconds.toFixed(1)}초` : null} />}
            {status === 'done' && data.speed && <Stat label="전송량" value={formatTransferred(data.speed.bytes)} hint={`${data.speed.rounds}개 응답을 사용`} />}
          </div>

          {status === 'done' && (
            <div className="nettest-disclaimer">
              <strong>수치가 다른 이유</strong>
              <p>이 결과는 브라우저에서 이 사이트 서버까지 실제로 내려받은 데이터로 계산합니다. 일반 속도 측정 프로그램은 서로 다른 지역의 전용 서버, CDN, 더 많은 병렬 연결 또는 별도 프로토콜을 사용하므로 결과가 같을 필요는 없습니다.</p>
              <p>HTTP 왕복 시간도 ICMP 핑과는 다른 값입니다. 회선의 최대 속도는 여러 서비스에서 반복 측정해 비교하고, 이 화면은 현재 이 사이트 경로의 상태를 확인하는 용도로 사용해 주세요.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
