import { useCallback, useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import {
  checkGatewayAccess,
  describeConnection,
  detectConnectionInfo,
  diagnose,
  fetchPublicIp,
  runDownloadSpeedTest,
  runLatencyTest,
} from '../../networkDiagnostics'
import SpeedGauge from '../../components/SpeedGauge/SpeedGauge'
import './HomePage.css'

const STEP_LABELS = {
  ip: 'IP 주소 확인 중...',
  latency: '지연 시간 측정 중...',
  gateway: '공유기 접근 확인 중... (브라우저 권한 요청이 뜰 수 있어요)',
  speed: '다운로드 속도 측정 중... (몇 초간 여러 번 측정해서 값을 정착시켜요)',
}

const SEVERITY_LABEL = { ok: '정상', warning: '주의', critical: '위험' }

function formatMs(value) {
  return value === null || value === undefined ? '-' : `${Math.round(value)}ms`
}

function Stat({ label, value }) {
  return (
    <div className="nettest-stat">
      <span className="nettest-stat-label">{label}</span>
      <span className="nettest-stat-value">{value}</span>
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
      setData((prev) => ({ ...prev, ip }))

      setStep('latency')
      const latency = await runLatencyTest()
      const connectionLabel = describeConnection(detectConnectionInfo(), latency)
      setData((prev) => ({ ...prev, latency, connectionLabel }))

      setStep('gateway')
      const gateway = await checkGatewayAccess()
      setData((prev) => ({ ...prev, gateway }))

      setStep('speed')
      let speed = null
      let speedError = false
      try {
        speed = await runDownloadSpeedTest((sample) => setLiveMbps(sample))
      } catch {
        speedError = true
      }
      setData((prev) => ({ ...prev, speed }))

      setDiagnosis(diagnose({ online, ip, latency, speed, speedError }))
      setStatus('done')
    } catch (err) {
      console.error('[network-test]', err)
      setError('테스트를 진행하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setStatus('idle')
    } finally {
      setStep(null)
    }
  }, [])

  const gaugeMbps =
    status === 'running' && step === 'speed'
      ? liveMbps
      : data.speed?.mbps ?? null

  return (
    <section className="nettest-hero">
      <p className="nettest-eyebrow">Utilities</p>
      <h1 className="nettest-title">네트워크 테스트</h1>
      <p className="nettest-desc">
        지금 이 기기의 인터넷 연결 상태를 확인합니다. IP 주소, 지연 시간, 다운로드 속도를 측정하고
        문제가 있다면 예상되는 원인을 알려드립니다.
      </p>

      <p className="nettest-permission-notice">
        테스트 중 브라우저가 "로컬 네트워크 기기에 접근" 권한을 요청할 수 있어요. 이 권한은
        오직 공유기의 응답 속도(ms)를 측정하는 용도로만 사용되고, 그 외의 어떤 정보도 수집하거나
        서버로 전송하지 않아요. 허용하지 않아도 나머지 측정 항목은 정상적으로 진행돼요.
      </p>

      <div className="nettest-gauge-wrap">
        <SpeedGauge mbps={gaugeMbps} phase={status} step={step} severity={diagnosis?.severity ?? null} />
      </div>

      {status !== 'running' && (
        <button type="button" className="nettest-start-btn" onClick={runTest}>
          {status === 'done' ? '다시 테스트' : '테스트 시작'}
        </button>
      )}

      {status === 'running' && (
        <div className="nettest-running">
          <span className="nettest-spinner" />
          <span key={step} className="nettest-step-label">
            {STEP_LABELS[step] || '준비 중...'}
          </span>
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
            {data.online !== undefined && (
              <Stat label="온라인 상태" value={data.online ? '온라인' : '오프라인'} />
            )}
            {data.ip !== undefined && <Stat label="IP 주소" value={data.ip || '확인 불가'} />}

            {data.latency && (
              <>
                <Stat label="연결 방식" value={data.connectionLabel} />
                <Stat label="평균 지연 시간" value={formatMs(data.latency.avg)} />
                <Stat label="지터 (변동폭)" value={formatMs(data.latency.jitter)} />
                <Stat label="패킷 손실률" value={`${data.latency.lossPercent}%`} />
              </>
            )}

            {data.gateway && (
              <Stat
                label="공유기 접근 (실험적)"
                value={
                  !data.gateway.supported
                    ? '지원 안 함'
                    : data.gateway.reachable
                      ? `${data.gateway.ip} · ${data.gateway.ms}ms`
                      : '확인 불가'
                }
              />
            )}

            {status === 'done' && (
              <Stat
                label="다운로드 속도"
                value={data.speed ? `${data.speed.mbps.toFixed(1)} Mbps` : '측정 실패'}
              />
            )}
          </div>

          {status === 'done' && (
            <p className="nettest-disclaimer">
              다운로드 속도는 이 사이트가 사용하는 서버를 기준으로 측정되며, Netflix(fast.com)나
              Ookla처럼 지역별로 분산된 대형 CDN을 쓰는 서비스와는 측정 경로가 달라 수치가 더
              낮게 나올 수 있습니다. 연결 방식(유선/무선) 감지는 브라우저가 제공하는 정보를
              기반으로 하며, 일부 브라우저(Safari, Firefox 등)에서는 지원되지 않아 지연 시간
              패턴 기반의 추정값으로 대체됩니다. 공유기 접근 확인은 Chrome의 로컬 네트워크 접근
              권한을 이용한 실험적 기능으로, 흔히 쓰이는 공유기 기본 IP 몇 개만 시도하기 때문에
              실제로 접근 가능해도 확인되지 않을 수 있습니다. 모든 측정값은 참고용이며 실제
              회선 상태와 다를 수 있습니다.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
