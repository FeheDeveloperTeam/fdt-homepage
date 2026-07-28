import YtCard from '../../components/YtCard/YtCard'
import LiveBanner from '../../components/LiveBanner/LiveBanner'
import '../YoutubePage/YoutubePage.css'
import './LivePreviewPage.css'

// 실제 API 호출 없이, 방송을 켰을 때 화면이 어떻게 보이는지만 확인하기 위한
// 가짜 데이터. 개발용 미리보기 전용 페이지입니다.
const PLACEHOLDER_THUMB =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23a8d8f0'/%3E%3C/svg%3E"

const MOCK_LIVE_ITEM = {
  id: { videoId: 'preview-live' },
  snippet: {
    title: '[미리보기] 실시간 방송 제목이 여기에 표시돼요',
    publishedAt: new Date().toISOString(),
    thumbnails: { medium: { url: PLACEHOLDER_THUMB } },
  },
}

const MOCK_PAST_ITEM = {
  id: { videoId: 'preview-past' },
  snippet: {
    title: '지난 라이브 영상 (비교용)',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnails: { medium: { url: PLACEHOLDER_THUMB } },
  },
}

export default function LivePreviewPage() {
  return (
    <div className="yt-page">
      <div className="live-preview-note">
        개발용 미리보기 — 실제 API를 호출하지 않고, 방송을 켰을 때
        배너/카드가 어떻게 보이는지만 확인하는 페이지입니다.
      </div>

      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg,#f87171,#e05050)' }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M15.665 1.878A2.01 2.01 0 0 0 14.252.457C13.01.1 8 .1 8 .1S2.99.1 1.748.457A2.01 2.01 0 0 0 .335 1.878C0 3.126 0 5.728 0 5.728s0 2.602.335 3.85a2.01 2.01 0 0 0 1.413 1.421C2.99 11.356 8 11.356 8 11.356s5.01 0 6.252-.357a2.01 2.01 0 0 0 1.413-1.421C16 8.33 16 5.728 16 5.728s0-2.602-.335-3.85zM6.364 8.21V3.245L10.545 5.728 6.364 8.21z" fill="white"/>
          </svg>
        </div>
        <div className="section-title">
          YouTube
          <small>페헤의 채널</small>
        </div>
      </div>

      <LiveBanner
        title={MOCK_LIVE_ITEM.snippet.title}
        href={`https://www.youtube.com/watch?v=${MOCK_LIVE_ITEM.id.videoId}`}
      />

      <p className="yt-subhead">지금 방송 중</p>
      <div className="yt-grid">
        <YtCard item={MOCK_LIVE_ITEM} isLive />
      </div>

      <p className="yt-subhead">지난 라이브 (비교용, 평상시 카드)</p>
      <div className="yt-grid">
        <YtCard item={MOCK_PAST_ITEM} />
      </div>
    </div>
  )
}
