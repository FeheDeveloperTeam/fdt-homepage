import { useState, useEffect, useRef, useCallback } from 'react'
import { useMediaQuery } from '../../../../hooks/useMediaQuery'
import './MusicPlayer.css'

/*
  재생 목록. YouTube IFrame Player로 영상을 그대로 재생하므로 여기에는
  영상 ID와 표시용 제목·아티스트만 둔다.

  등록한 최신 순으로 정렬한다 — 새로 추가하는 곡은 항상 배열 맨 위에 넣는다.
  목록 첫 곡이 처음 재생되는 곡이다.
*/
const TRACKS = [
  { id: 'aRiVUVNUhIs', title: 'なんもねえ', artist: '忘れらんねえよ' },
  { id: '075raB27CW8', title: 'ray (超かぐや姫！ Version)', artist: 'Ray' },
]
const DEFAULT_VOL = 40

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  )
}
function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1.5"/>
      <rect x="14" y="4" width="4" height="16" rx="1.5"/>
    </svg>
  )
}
function IconPrev() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 6h2v12H7z"/>
      <path d="M19 6v12l-9-6z"/>
    </svg>
  )
}
function IconNext() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 6h2v12h-2z"/>
      <path d="M5 6v12l9-6z"/>
    </svg>
  )
}
function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="12" x2="15" y2="12"/>
      <line x1="4" y1="17" x2="15" y2="17"/>
      <circle cx="19" cy="16" r="2.4" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function IconVolumeHigh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  )
}
function IconVolumeLow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  )
}
function IconVolumeMute() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  )
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const [listOpen, setListOpen] = useState(false)
  const [volOpen, setVolOpen] = useState(false)
  // 모바일에서는 카드가 화면을 크게 가려서 기본으로 접어 두고, 눌러야 펼쳐진다.
  const isMobile = useMediaQuery('(max-width: 720px)')
  const [expanded, setExpanded] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(DEFAULT_VOL)
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const timerRef = useRef(null)
  const cancelPendingDestroyRef = useRef(null)
  // 곡이 끝났을 때 다음 곡으로 넘기는 처리. YT 콜백이 오래된 state를 붙잡지 않도록
  // ref에 최신 함수를 담아 두고, 플레이어 초기화 효과는 다시 실행되지 않게 한다.
  const advanceRef = useRef(null)

  useEffect(() => {
    setExpanded(!isMobile)
    if (isMobile) setListOpen(false)
  }, [isMobile])

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p) return
      setCurrent(p.getCurrentTime?.() ?? 0)
      setDuration(p.getDuration?.() ?? 0)
    }, 500)
  }, [])

  useEffect(() => {
    cancelPendingDestroyRef.current?.()
    const destroyState = { cancelled: false }
    cancelPendingDestroyRef.current = () => {
      destroyState.cancelled = true
    }
    let ownedPlayer = playerRef.current

    function initPlayer() {
      if (ownedPlayer || !containerRef.current) return

      ownedPlayer = new window.YT.Player(containerRef.current, {
        videoId: TRACKS[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
        },
        events: {
          onReady(e) {
            e.target.setVolume(DEFAULT_VOL)
            e.target.stopVideo()
            setReady(true)
            setPlaying(false)
          },
          onStateChange(e) {
            const isPlaying = e.data === window.YT.PlayerState.PLAYING
            setPlaying(isPlaying)
            if (isPlaying) startTimer()
            else clearInterval(timerRef.current)
            // 곡이 끝나면 다음 곡으로 넘어가고, 마지막 곡이면 처음으로 돌아간다
            if (e.data === window.YT.PlayerState.ENDED) advanceRef.current?.()
          },
        },
      })
      playerRef.current = ownedPlayer
    }

    const previousReady = window.onYouTubeIframeAPIReady
    const handleReady = () => {
      previousReady?.()
      initPlayer()
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      window.onYouTubeIframeAPIReady = handleReady
    }

    return () => {
      if (window.onYouTubeIframeAPIReady === handleReady) {
        window.onYouTubeIframeAPIReady = previousReady ?? null
      }
      clearInterval(timerRef.current)

      setTimeout(() => {
        // React StrictMode immediately re-runs effects in development. In that
        // case the live player belongs to the new run and must not be destroyed.
        if (destroyState.cancelled) return
        ownedPlayer?.destroy?.()
      }, 0)
    }
  }, [startTimer])

  const goTo = useCallback((next, autoplay = true) => {
    const target = ((next % TRACKS.length) + TRACKS.length) % TRACKS.length
    setIndex(target)
    setCurrent(0)
    setDuration(0)
    const p = playerRef.current
    if (!p?.loadVideoById) return
    if (autoplay) p.loadVideoById(TRACKS[target].id)
    else p.cueVideoById(TRACKS[target].id)
  }, [])

  advanceRef.current = () => goTo(index + 1)

  function toggle() {
    if (!ready || !playerRef.current) return
    if (playing) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  function seek(e) {
    if (!ready || !playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    playerRef.current.seekTo(ratio * duration, true)
  }

  function handleVolume(e) {
    const v = Number(e.target.value)
    setVolume(v)
    if (!playerRef.current) return
    if (v === 0) {
      playerRef.current.mute()
    } else {
      playerRef.current.unMute()
      playerRef.current.setVolume(v)
    }
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0
  const track = TRACKS[index]

  function VolumeIcon() {
    if (volume === 0) return <IconVolumeMute />
    if (volume < 50) return <IconVolumeLow />
    return <IconVolumeHigh />
  }

  const discIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  return (
    <div className="music-player">
      {/* 플레이어 인스턴스는 접혀 있어도 살아 있어야 재생이 끊기지 않는다 */}
      <div ref={containerRef} style={{ display: 'none' }} />

      {!expanded && (
        <button
          type="button"
          className={`music-mini${playing ? ' playing' : ''}`}
          onClick={() => setExpanded(true)}
          title="음악 플레이어 열기"
          aria-label="음악 플레이어 열기"
        >
          <span className={`music-mini-disc${playing ? ' spin' : ''}`}>{discIcon}</span>
        </button>
      )}

      {expanded && (
      <div className="music-card">

        {/* 상단: 디스크 아이콘 + 곡 정보 + 목록 열기 */}
        <div className="music-top">
          <div className={`music-disc${playing ? ' spin' : ''}`}>{discIcon}</div>
          <div className="music-text">
            <span className="music-title">{track.title}</span>
            <span className="music-artist">{track.artist}</span>
          </div>
          <button
            type="button"
            className={`music-list-toggle${volOpen ? ' open' : ''}`}
            onClick={() => setVolOpen((prev) => !prev)}
            aria-expanded={volOpen}
            title={volOpen ? '볼륨 닫기' : '볼륨 조절'}
          >
            <VolumeIcon />
          </button>
          <button
            type="button"
            className={`music-list-toggle${listOpen ? ' open' : ''}`}
            onClick={() => setListOpen((prev) => !prev)}
            aria-expanded={listOpen}
            title={listOpen ? '재생 목록 닫기' : '재생 목록 열기'}
          >
            <IconList />
          </button>
          {isMobile && (
            <button
              type="button"
              className="music-list-toggle"
              onClick={() => setExpanded(false)}
              title="플레이어 접기"
              aria-label="플레이어 접기"
            >
              <IconChevronDown />
            </button>
          )}
        </div>

        {/* 재생바 */}
        <div className="music-progress-wrap" onClick={seek}>
          <div className="music-progress-bg">
            <div className="music-progress-fill" style={{ width: `${progress}%` }} />
            <div className="music-progress-thumb" style={{ left: `${progress}%` }} />
          </div>
          <div className="music-time">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* 이전 / 재생 / 다음 */}
        <div className="music-transport">
          <button type="button" className="music-step" onClick={() => goTo(index - 1)} title="이전 곡">
            <IconPrev />
          </button>
          <button
            type="button"
            className={`music-toggle${playing ? ' playing' : ''}`}
            onClick={toggle}
            title={playing ? '일시정지' : '재생'}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>
          <button type="button" className="music-step" onClick={() => goTo(index + 1)} title="다음 곡">
            <IconNext />
          </button>
        </div>

        {volOpen && (
          <div className="music-volume">
            <input
              className="music-vol-slider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolume}
              aria-label="볼륨"
            />
            <span className="music-vol-num">{volume}</span>
          </div>
        )}

        {listOpen && (
          <ul className="music-list">
            {TRACKS.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`music-list-item${i === index ? ' current' : ''}`}
                  onClick={() => goTo(i)}
                  aria-current={i === index}
                >
                  <span className="music-list-num">{i === index && playing ? '▶' : i + 1}</span>
                  <span className="music-list-text">
                    <span className="music-list-title">{t.title}</span>
                    <span className="music-list-artist">{t.artist}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>
      )}
    </div>
  )
}
