import './LiveBanner.css'

export default function LiveBanner({ title, href }) {
  return (
    <a className="live-banner" href={href} target="_blank" rel="noopener noreferrer">
      <span className="live-banner-dot" />
      <span className="live-banner-text">
        지금 실시간 방송 중{title ? <> — <strong>{title}</strong></> : null}
      </span>
      <span className="live-banner-cta">시청하러 가기 →</span>
    </a>
  )
}
