import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { setMasterLevel, setSoundLevel, startSound, stopAllSounds, stopSound } from './ambientEngine'
import { DEFAULT_LEVEL, PRESETS, SOUNDS } from './sounds'

// 백색소음 상태(무엇이 켜져 있는지, 소리별 크기, 전체 크기, 끄기 타이머)를 앱 전체가 함께 쓴다.
// 페이지의 백색소음 칸과 따라오는 푸터의 「재생 중」 표시가 같은 상태를 본다.
// 소리별 크기와 전체 크기만 이 브라우저에 저장하고, 재생 여부는 저장하지 않는다(자동 재생 금지 정책).

const STORAGE_KEY = 'suneung-ambient'
const SOUND_IDS = SOUNDS.map((s) => s.id)
const BY_ID = Object.fromEntries(SOUNDS.map((s) => [s.id, s]))

function loadLevels() {
  const base = { levels: Object.fromEntries(SOUND_IDS.map((id) => [id, DEFAULT_LEVEL])), master: 0.7 }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved) return base
    for (const id of SOUND_IDS) {
      const v = Number(saved.levels?.[id])
      if (Number.isFinite(v)) base.levels[id] = Math.min(1, Math.max(0, v))
    }
    const m = Number(saved.master)
    if (Number.isFinite(m)) base.master = Math.min(1, Math.max(0, m))
  } catch {
    // 저장된 값이 없거나 저장소를 못 쓰면 기본값
  }
  return base
}

export const AmbientContext = createContext(null)

export function useAmbient() {
  return useContext(AmbientContext)
}

export function useAmbientController() {
  const [saved] = useState(loadLevels)
  const [levels, setLevels] = useState(saved.levels)
  const [master, setMaster] = useState(saved.master)
  const [playing, setPlayingState] = useState(() => new Set())
  // 녹음을 내려받는 중인 소리(카드에 「불러오는 중」 표시)
  const [loading, setLoading] = useState(() => new Set())
  const [preset, setPreset] = useState(null)
  const [sleep, setSleep] = useState({ minutes: 0, endsAt: null })
  // 재생 시작·정지는 상태 갱신 함수 밖에서 한 번만 하도록 지금 상태를 ref로도 들고 있는다.
  const playingRef = useRef(playing)
  const levelsRef = useRef(levels)

  const setPlaying = useCallback((next) => {
    playingRef.current = next
    setPlayingState(next)
  }, [])

  useEffect(() => {
    levelsRef.current = levels
  }, [levels])

  useEffect(() => setMasterLevel(master), [master])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ levels, master }))
    } catch {
      // 저장 못 해도 이번 방문 동안은 유지
    }
  }, [levels, master])

  // 다른 화면으로 나가면 소리를 끈다.
  useEffect(() => () => stopAllSounds(), [])

  const stopAll = useCallback(() => {
    stopAllSounds()
    setPlaying(new Set())
    setPreset(null)
    setSleep((s) => ({ ...s, endsAt: null }))
  }, [setPlaying])

  // 재생을 시작한다. 녹음은 내려받는 동안 「불러오는 중」으로 두고, 실패하면 켜짐 표시를 되돌린다.
  const begin = useCallback(
    (id, level) => {
      setLoading((prev) => new Set(prev).add(id))
      startSound(BY_ID[id], level).then((ok) => {
        setLoading((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        if (!ok && playingRef.current.has(id)) {
          const next = new Set(playingRef.current)
          next.delete(id)
          setPlaying(next)
        }
      })
    },
    [setPlaying],
  )

  const toggle = useCallback(
    (id) => {
      const next = new Set(playingRef.current)
      if (next.has(id)) {
        stopSound(id)
        next.delete(id)
      } else {
        next.add(id)
        begin(id, levelsRef.current[id])
      }
      setPreset(null)
      setPlaying(next)
    },
    [begin, setPlaying],
  )

  const setLevel = useCallback((id, value) => {
    levelsRef.current = { ...levelsRef.current, [id]: value }
    setLevels(levelsRef.current)
    setSoundLevel(id, value)
  }, [])

  const applyPreset = useCallback(
    (key) => {
      const found = PRESETS.find((p) => p.key === key)
      if (!found) return
      for (const id of playingRef.current) if (!(id in found.levels)) stopSound(id)
      const next = new Set()
      for (const [id, level] of Object.entries(found.levels)) {
        next.add(id)
        if (playingRef.current.has(id)) setSoundLevel(id, level)
        else begin(id, level)
      }
      levelsRef.current = { ...levelsRef.current, ...found.levels }
      setLevels(levelsRef.current)
      setPlaying(next)
      setPreset(key)
    },
    [begin, setPlaying],
  )

  // 끄기 타이머는 소리가 나는 동안만 센다. 재생 중에 시간을 고르면 그때부터, 꺼져 있을 때 고르면 다음 재생부터.
  const chooseSleep = useCallback((minutes) => {
    const running = playingRef.current.size > 0
    setSleep({ minutes, endsAt: minutes && running ? Date.now() + minutes * 60000 : null })
  }, [])

  const anyPlaying = playing.size > 0
  useEffect(() => {
    if (!anyPlaying) {
      // 소리를 하나씩 다 끈 경우에도 타이머를 멈춰, 다음 재생 때 처음부터 다시 센다.
      if (sleep.endsAt) setSleep((s) => ({ ...s, endsAt: null }))
      return undefined
    }
    if (sleep.minutes && !sleep.endsAt) {
      setSleep((s) => ({ ...s, endsAt: Date.now() + s.minutes * 60000 }))
      return undefined
    }
    if (!sleep.endsAt) return undefined
    const id = setTimeout(stopAll, Math.max(0, sleep.endsAt - Date.now()))
    return () => clearTimeout(id)
  }, [anyPlaying, sleep, stopAll])

  return useMemo(
    () => ({ levels, master, playing, loading, preset, sleep, toggle, setLevel, setMaster, applyPreset, stopAll, chooseSleep }),
    [levels, master, playing, loading, preset, sleep, toggle, setLevel, applyPreset, stopAll, chooseSleep],
  )
}
