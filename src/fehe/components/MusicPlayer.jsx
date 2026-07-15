import { useState, useEffect, useRef, useCallback } from 'react'

const VIDEO_ID = '075raB27CW8'
const SONG_TITLE = 'ray (超かぐや姫！ Version)'
const SONG_ARTIST = 'Ray'
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
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(DEFAULT_VOL)
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

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
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => initPlayer()
    return () => {
      window.onYouTubeIframeAPIReady = null
      clearInterval(timerRef.current)
    }
  }, [])

  function initPlayer() {
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: VIDEO_ID,
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
          // 곡이 끝나면 처음부터 다시 재생
          if (e.data === window.YT.PlayerState.ENDED) {
            e.target.seekTo(0)
            e.target.playVideo()
          }
        },
      },
    })
  }

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

  function VolumeIcon() {
    if (volume === 0) return <IconVolumeMute />
    if (volume < 50) return <IconVolumeLow />
    return <IconVolumeHigh />
  }

  return (
    <div className="music-player">
      <div ref={containerRef} style={{ display: 'none' }} />
      <div className="music-card">

        {/* 상단: 디스크 아이콘 + 곡 정보 + 재생버튼 */}
        <div className="music-top">
          <div className={`music-disc${playing ? ' spin' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div className="music-text">
            <span className="music-title">{SONG_TITLE}</span>
            <span className="music-artist">{SONG_ARTIST}</span>
          </div>
          <button
            className={`music-toggle${playing ? ' playing' : ''}`}
            onClick={toggle}
            title={playing ? '일시정지' : '재생'}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>
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

        {/* 볼륨 */}
        <div className="music-volume">
          <span className="music-vol-icon"><VolumeIcon /></span>
          <input
            className="music-vol-slider"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolume}
          />
          <span className="music-vol-num">{volume}</span>
        </div>

      </div>
    </div>
  )
}
