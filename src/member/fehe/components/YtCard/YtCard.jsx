import './YtCard.css'

export default function YtCard({ item, isLive }) {
  const videoId = item.id.videoId
  const thumb   = item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url
  const date    = new Date(item.snippet.publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const clip    = item._clip   // { start, end, startSeconds }
  let href = `https://www.youtube.com/watch?v=${videoId}`
  if (clip?.startSeconds) href += `&t=${clip.startSeconds}s`
  return (
    <a className={`yt-card${isLive ? ' yt-card--live' : ''}`} href={href} target="_blank" rel="noopener noreferrer">
      <div className="yt-thumb-wrap">
        <img className="yt-thumb" src={thumb} alt={item.snippet.title} loading="lazy" />
        {isLive && <span className="yt-live-badge">LIVE</span>}
      </div>
      <div className="yt-info">
        <p className="yt-title">{item.snippet.title}</p>
        <p className="yt-date">{isLive ? '지금 방송 중' : date}</p>
        {clip && (clip.start || clip.end) && (
          <p className="yt-clip">⏱ {clip.start}{clip.end ? ` ~ ${clip.end}` : ''}</p>
        )}
      </div>
    </a>
  )
}
