import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// 화면 설정(밝기 모드 + 강조색). 고른 값은 이 브라우저에만 저장된다.
// 강조색은 밝은 테마용(light)·어두운 테마용(dark) 두 값을 두고, 둘 다 바탕 대비 4.5:1 이상으로 골랐다.
// 앱 루트에 --accent-light / --accent-dark로 넣으면 styles/variables.css가 모드에 맞는 쪽을 --accent로 쓴다.
export const ACCENTS = [
  { key: 'red', label: 'OMR 빨강', light: '#c2334b', dark: '#ff7a8a' },
  { key: 'blue', label: '사인펜 파랑', light: '#2458b8', dark: '#7fb0ff' },
  { key: 'green', label: '칠판 초록', light: '#1f7a55', dark: '#5fd3a0' },
  { key: 'teal', label: '청록', light: '#11717a', dark: '#5ed1d8' },
  { key: 'violet', label: '보라', light: '#6a45c2', dark: '#b69cff' },
  { key: 'pink', label: '분홍', light: '#b8326f', dark: '#ff8cc0' },
  { key: 'orange', label: '귤 주황', light: '#b0520c', dark: '#ffa25e' },
  { key: 'ink', label: '먹색', light: '#2d2b28', dark: '#e6e2d8' },
]

export const MODES = [
  { key: 'auto', label: '기기 설정' },
  { key: 'light', label: '밝게' },
  { key: 'dark', label: '어둡게' },
]

const STORAGE_KEY = 'suneung-theme'
const DEFAULT = { mode: 'auto', accent: 'red' }

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return {
      mode: MODES.some((m) => m.key === saved?.mode) ? saved.mode : DEFAULT.mode,
      accent: ACCENTS.some((a) => a.key === saved?.accent) ? saved.accent : DEFAULT.accent,
    }
  } catch {
    return DEFAULT
  }
}

function useSystemDark() {
  const query = '(prefers-color-scheme: dark)'
  const [dark, setDark] = useState(() => typeof window !== 'undefined' && (window.matchMedia?.(query).matches ?? false))
  useEffect(() => {
    const media = window.matchMedia?.(query)
    if (!media) return undefined
    const onChange = () => setDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return dark
}

export const ThemeContext = createContext({
  mode: DEFAULT.mode,
  accent: ACCENTS[0],
  dark: false,
  setMode: () => {},
  setAccent: () => {},
  reset: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

// SuneungApp이 한 번 부르고 결과를 ThemeContext로 내려 준다. rootProps는 앱 루트 요소에 그대로 붙인다.
export function useThemeController() {
  const [settings, setSettings] = useState(load)
  const systemDark = useSystemDark()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // 저장소를 못 쓰는 환경(사생활 보호 창 등)에서는 이번 방문 동안만 유지한다.
    }
  }, [settings])

  const setMode = useCallback((mode) => setSettings((s) => ({ ...s, mode })), [])
  const setAccent = useCallback((accent) => setSettings((s) => ({ ...s, accent })), [])
  const reset = useCallback(() => setSettings(DEFAULT), [])

  const accent = ACCENTS.find((a) => a.key === settings.accent) ?? ACCENTS[0]
  const dark = settings.mode === 'dark' || (settings.mode === 'auto' && systemDark)

  const value = useMemo(
    () => ({ mode: settings.mode, accent, dark, setMode, setAccent, reset }),
    [settings.mode, accent, dark, setMode, setAccent, reset],
  )

  const rootProps = useMemo(
    () => ({
      'data-mode': settings.mode,
      style: { '--accent-light': accent.light, '--accent-dark': accent.dark },
    }),
    [settings.mode, accent],
  )

  return { value, rootProps }
}
