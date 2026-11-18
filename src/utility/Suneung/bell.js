// 시험장 종소리를 Web Audio로 합성한다(음원 파일 없음). 브라우저 정책상 사용자가 버튼을 누른 뒤에만 소리가 난다.
let context = null

function getContext() {
  if (typeof window === 'undefined') return null
  if (!context) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    context = new AudioCtx()
  }
  if (context.state === 'suspended') context.resume().catch(() => {})
  return context
}

function tone(ctx, freq, at, duration = 1.7, volume = 0.2) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  gain.connect(ctx.destination)

  // 기본음 + 살짝 어긋난 배음으로 종 같은 울림을 만든다.
  for (const [ratio, level] of [[1, 1], [2.01, 0.28], [3.02, 0.08]]) {
    const osc = ctx.createOscillator()
    const partial = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    partial.gain.value = level
    osc.connect(partial).connect(gain)
    osc.start(at)
    osc.stop(at + duration + 0.05)
  }
}

const PATTERNS = {
  start: [[784, 0], [659, 0.5]],
  warn: [[880, 0]],
  end: [[784, 0], [659, 0.5], [523, 1.0]],
}

// 버튼 클릭 같은 사용자 동작 안에서 한 번 불러 소리를 낼 수 있게 열어 둔다.
export function unlockBell() {
  getContext()
}

export function playBell(kind) {
  const ctx = getContext()
  if (!ctx) return
  const t = ctx.currentTime + 0.03
  for (const [freq, delay] of PATTERNS[kind] ?? PATTERNS.warn) tone(ctx, freq, t + delay)
}
