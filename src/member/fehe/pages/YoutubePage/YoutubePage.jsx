import { useState, useEffect } from 'react'
import { IconYoutube } from '../../components/icons/icons'
import './YoutubePage.css'

const CHANNEL_ID = 'UCY0LBUJ0a7JCBkkQ_ux0kew'
const API_KEY    = 'AIzaSyAP2PyUsp5VYuj9KUMExwYw3YcceIegaII'
const BASE       = 'https://www.googleapis.com/youtube/v3/search'
const VIDEOS     = 'https://www.googleapis.com/youtube/v3/videos'

// 내 계정이 아닌 채널 등에 올린 영상을 수동으로 추가하는 목록.
// 라이브 탭의 '수동 등록 영상' 칸에 따로 표시됩니다.
// 1) 영상만 추가: 'https://www.youtube.com/watch?v=VIDEO_ID' 또는 'VIDEO_ID'
// 2) 구간 지정: { url: '...', start: '1:52:58', end: '3:51:11' }
//    - start 가 있으면 링크가 그 시점부터 재생됩니다.
//    - 카드에 'start ~ end' 구간이 표시됩니다.
// 제목·날짜·썸네일은 자동으로 가져옵니다.
const MANUAL_VIDEOS = [
  { url: 'https://www.youtube.com/watch?v=7Xp90vfOaAM', start: '1:52:58', end: '3:51:11' },
]

// 다양한 형태의 YouTube URL/ID에서 영상 ID만 추출
function extractVideoId(input) {
  const s = String(input).trim()
  if (!s) return null
  const m = s.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/)
  if (m) return m[1]
  if (/^[\w-]{11}$/.test(s)) return s
  return null
}

// 'H:MM:SS' 또는 'MM:SS' 형태의 시간을 초로 변환
function timeToSeconds(t) {
  if (!t) return null
  const parts = String(t).trim().split(':').map(Number)
  if (parts.some(isNaN)) return null
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

function YtCard({ item }) {
  const videoId = item.id.videoId
  const thumb   = item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url
  const date    = new Date(item.snippet.publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const clip    = item._clip   // { start, end, startSeconds }
  let href = `https://www.youtube.com/watch?v=${videoId}`
  if (clip?.startSeconds) href += `&t=${clip.startSeconds}s`
  return (
    <a className="yt-card" href={href} target="_blank" rel="noopener noreferrer">
      <img className="yt-thumb" src={thumb} alt={item.snippet.title} loading="lazy" />
      <div className="yt-info">
        <p className="yt-title">{item.snippet.title}</p>
        <p className="yt-date">{date}</p>
        {clip && (clip.start || clip.end) && (
          <p className="yt-clip">⏱ {clip.start}{clip.end ? ` ~ ${clip.end}` : ''}</p>
        )}
      </div>
    </a>
  )
}

export default function YoutubePage() {
  const [ytTab, setYtTab]             = useState('home')
  const [homeItems, setHomeItems]     = useState([])
  const [liveItems, setLiveItems]     = useState([])
  const [manualItems, setManualItems] = useState([])
  const [status, setStatus]           = useState('loading')
  const [error, setError]             = useState('')

  useEffect(() => {
    loadYoutube()
  }, [])

  // 수동 등록한 영상 ID들을 videos API로 조회해 검색 결과와 같은 형태로 변환
  async function loadManual() {
    // 문자열/객체 둘 다 허용 → { videoId, clip } 형태로 정규화
    const entries = MANUAL_VIDEOS.map(e => {
      const raw = typeof e === 'string' ? e : e.url
      const videoId = extractVideoId(raw)
      if (!videoId) return null
      const clip = (typeof e === 'object' && (e.start || e.end))
        ? { start: e.start, end: e.end, startSeconds: timeToSeconds(e.start) }
        : null
      return { videoId, clip }
    }).filter(Boolean)

    if (entries.length === 0) return []
    const ids  = entries.map(e => e.videoId)
    const res  = await fetch(`${VIDEOS}?part=snippet&id=${ids.join(',')}&key=${API_KEY}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    // videos API는 id가 문자열이라 검색 결과({ id: { videoId } }) 형태로 맞춰줌
    return (data.items || []).map(it => {
      const meta = entries.find(e => e.videoId === it.id)
      return { id: { videoId: it.id }, snippet: it.snippet, _clip: meta?.clip || null }
    })
  }

  async function loadYoutube() {
    setStatus('loading')
    try {
      const params = `channelId=${CHANNEL_ID}&type=video&order=date&maxResults=12&key=${API_KEY}`
      const [allRes, liveRes] = await Promise.all([
        fetch(`${BASE}?part=snippet&${params}`),
        fetch(`${BASE}?part=snippet&eventType=completed&${params}`),
      ])
      const [allData, liveData] = await Promise.all([allRes.json(), liveRes.json()])

      if (allData.error)  throw new Error(allData.error.message)
      if (liveData.error) throw new Error(liveData.error.message)

      const liveIds   = new Set((liveData.items || []).map(i => i.id.videoId))

      // 수동 등록 영상 불러오기 (다른 채널 영상도 가능) → 라이브 탭에 따로 표시
      const manual = await loadManual()

      setHomeItems((allData.items || []).filter(i => !liveIds.has(i.id.videoId)))
      setLiveItems(liveData.items || [])
      setManualItems(manual)
      setStatus('ok')
    } catch (e) {
      console.error('[YT]', e)
      setError(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="yt-page">
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

      <div className="yt-tabs">
        {['home', 'live'].map(tab => (
          <button
            key={tab}
            className={`yt-tab ${ytTab === tab ? 'active' : ''}`}
            onClick={() => setYtTab(tab)}
          >
            {tab === 'home' ? '홈' : '라이브'}
          </button>
        ))}
      </div>

      {/* 홈 패널 */}
      <div className={`yt-panel ${ytTab === 'home' ? 'active' : ''}`}>
        <div className="yt-grid">
          {status === 'loading' && <p className="yt-status">영상 불러오는 중...</p>}
          {status === 'error'   && (
            <p className="yt-status">
              영상을 불러올 수 없습니다.{' '}
              <a href="https://www.youtube.com/@fehe1234" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky-deep)' }}>
                채널에서 확인하세요.
              </a>
            </p>
          )}
          {status === 'ok' && homeItems.length === 0 && <p className="yt-status">업로드된 영상이 없습니다.</p>}
          {status === 'ok' && homeItems.map(item => <YtCard key={item.id.videoId} item={item} />)}
        </div>
        <a className="yt-more" href="https://www.youtube.com/@fehe1234/videos" target="_blank" rel="noopener noreferrer">
          <IconYoutube /> 전체 영상 보기
        </a>
      </div>

      {/* 라이브 패널 */}
      <div className={`yt-panel ${ytTab === 'live' ? 'active' : ''}`}>
        {status === 'loading' && <p className="yt-status">영상 불러오는 중...</p>}
        {status === 'error'   && (
          <p className="yt-status">
            영상을 불러올 수 없습니다.{' '}
            <a href="https://www.youtube.com/@fehe1234" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky-deep)' }}>
              채널에서 확인하세요.
            </a>
          </p>
        )}

        {/* 내 라이브 */}
        {status === 'ok' && (
          <>
            <p className="yt-subhead">내 라이브</p>
            <div className="yt-grid">
              {liveItems.length === 0 && <p className="yt-status">라이브 영상이 없습니다.</p>}
              {liveItems.map(item => <YtCard key={item.id.videoId} item={item} />)}
            </div>
          </>
        )}

        {/* 수동 등록 영상 (다른 채널·출연 영상 등) */}
        {status === 'ok' && manualItems.length > 0 && (
          <>
            <p className="yt-subhead">수동 등록 영상</p>
            <div className="yt-grid">
              {manualItems.map(item => <YtCard key={item.id.videoId} item={item} />)}
            </div>
          </>
        )}

        <a className="yt-more" href="https://www.youtube.com/@fehe1234/streams" target="_blank" rel="noopener noreferrer">
          <IconYoutube /> 라이브 전체 보기
        </a>
      </div>
    </div>
  )
}
