// 공부용 백색소음·ASMR 재생기(Web Audio).
// - 백색·핑크·브라운 노이즈는 원래 계산으로 만드는 소리라 브라우저에서 바로 만든다.
// - 빗소리·파도·장작·귀뚜라미·에어컨·시험장·시계는 실제 녹음(Freesound의 CC0 퍼블릭 도메인 녹음,
//   출처는 sounds.js)을 public/sounds/에 두고, 처음 켤 때만 내려받아 끝과 처음을 2초 겹쳐 이음매 없이 반복한다.
// 브라우저 정책상 사용자가 버튼을 누른 뒤에만 소리가 난다.

let ctx = null
let master = null
let noise = null
let masterLevel = 0.5
let analyser = null
const voices = new Map()
const samples = new Map()

// 켜고 끌 때 천천히 커지고 작아지는 시간(초)
const FADE = 1.8
// 녹음의 끝과 처음을 겹쳐 섞는 기본 길이(초). public/sounds 파일은 이만큼 더 길게 잘라 둔다.
const LOOP_FADE = 2

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = masterLevel
    // 여러 소리를 겹쳐도 찢어지지 않게 마지막에 부드럽게 눌러 준다.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -16
    limiter.knee.value = 8
    limiter.ratio.value = 6
    limiter.attack.value = 0.01
    limiter.release.value = 0.3
    master.connect(limiter).connect(ctx.destination)
    // 화면의 소리 막대가 읽는 분석기(소리에는 영향 없음)
    analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    limiter.connect(analyser)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// ── 계산으로 만드는 잡음 ──

// 8초짜리 스테레오 잡음. 끝 0.25초를 처음과 섞어서 반복 이음매에서 「틱」 소리가 나지 않게 한다.
function makeNoise(kind) {
  const rate = ctx.sampleRate
  const length = rate * 8
  const fade = Math.floor(rate * 0.25)
  const buffer = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch += 1) {
    const raw = new Float32Array(length + fade)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    let last = 0
    for (let i = 0; i < raw.length; i += 1) {
      const white = Math.random() * 2 - 1
      if (kind === 'white') {
        raw[i] = white * 0.5
      } else if (kind === 'pink') {
        // Paul Kellet의 핑크 노이즈 근사
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.969 * b2 + white * 0.153852
        b3 = 0.8665 * b3 + white * 0.3104856
        b4 = 0.55 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.016898
        raw[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      } else {
        last = (last + 0.02 * white) / 1.02
        raw[i] = last * 3.5
      }
    }
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i += 1) data[i] = raw[i]
    for (let i = 0; i < fade; i += 1) {
      const t = i / fade
      data[i] = raw[i] * t + raw[length + i] * (1 - t)
    }
  }
  return buffer
}

function filter(type, frequency, q = 0.7) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = frequency
  f.Q.value = q
  return f
}

// 잡음은 높은 쪽을 두 번 깎아 「치지직」 대신 「쏴아·웅」이 되게 한다.
const NOISES = {
  white: { cutoff: 2500, highpass: 90, gain: 1.45 },
  pink: { cutoff: 1300, highpass: 50, gain: 1.1 },
  brown: { cutoff: 420, highpass: 0, gain: 0.9 },
}

function playNoise(kind, out) {
  noise ??= {}
  noise[kind] ??= makeNoise(kind)
  const { cutoff, highpass, gain } = NOISES[kind]
  const src = ctx.createBufferSource()
  src.buffer = noise[kind]
  src.loop = true
  const hp = filter('highpass', highpass || 10)
  const lp1 = filter('lowpass', cutoff, 0.5)
  const lp2 = filter('lowpass', cutoff * 1.4, 0.5)
  const shelf = ctx.createBiquadFilter()
  shelf.type = 'highshelf'
  shelf.frequency.value = 3200
  shelf.gain.value = -9
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(hp).connect(g).connect(lp1).connect(lp2).connect(shelf).connect(out)
  src.start(ctx.currentTime, Math.random() * 7)
  return [src, hp, lp1, lp2, shelf, g]
}

// ── 실제 녹음 ──

// 끝 fadeSeconds초를 처음과 같은 힘으로 겹쳐(equal-power) 섞어, 반복될 때 이음매가 들리지 않는 버퍼를 만든다.
// 0이면 그대로 반복한다(시계처럼 소리 사이의 조용한 순간에서 미리 잘라 둔 녹음).
function makeLoop(decoded, fadeSeconds) {
  if (!fadeSeconds) return decoded
  const rate = decoded.sampleRate
  const fade = Math.floor(rate * fadeSeconds)
  const length = decoded.length - fade
  const buffer = ctx.createBuffer(decoded.numberOfChannels, length, rate)
  for (let ch = 0; ch < decoded.numberOfChannels; ch += 1) {
    const raw = decoded.getChannelData(ch)
    const data = buffer.getChannelData(ch)
    data.set(raw.subarray(0, length))
    for (let i = 0; i < fade; i += 1) {
      const t = (i / fade) * (Math.PI / 2)
      data[i] = raw[i] * Math.sin(t) + raw[length + i] * Math.cos(t)
    }
  }
  return buffer
}

function loadSample(url, fadeSeconds) {
  if (!samples.has(url)) {
    const promise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.arrayBuffer()
      })
      .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
      .then((decoded) => makeLoop(decoded, fadeSeconds))
    // 실패하면 다음에 다시 받도록 지운다.
    promise.catch(() => samples.delete(url))
    samples.set(url, promise)
  }
  return samples.get(url)
}

function playSample(buffer, out, gain) {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(g).connect(out)
  // 매번 다른 곳부터 시작해 같은 녹음이라도 덜 반복되는 느낌을 준다.
  src.start(ctx.currentTime, Math.random() * buffer.duration)
  return [src, g]
}

// ── 바깥에서 쓰는 함수 ──

// 슬라이더 값(0~1)을 귀에 자연스럽게 들리는 크기로 바꾼다.
const curve = (level) => level * level

function stopNodes(nodes) {
  for (const node of nodes) {
    try {
      node.stop?.()
    } catch {
      // 이미 멈춘 노드
    }
    node.disconnect()
  }
}

// sound: sounds.js의 항목({ id, kind: 'noise' | 'sample', src, gain }).
// 녹음은 내려받는 동안 기다렸다가 재생한다. 그사이 끄면 재생하지 않는다. 성공하면 true.
export async function startSound(sound, level) {
  const audio = getContext()
  if (!audio) return false
  if (voices.has(sound.id)) {
    setSoundLevel(sound.id, level)
    return true
  }
  const out = audio.createGain()
  out.gain.value = 0
  out.connect(master)
  const voice = { out, nodes: [], level }
  voices.set(sound.id, voice)

  try {
    if (sound.kind === 'noise') {
      voice.nodes = playNoise(sound.id, out)
    } else {
      const buffer = await loadSample(sound.src, sound.fade ?? LOOP_FADE)
      if (voices.get(sound.id) !== voice) return false
      voice.nodes = playSample(buffer, out, sound.gain ?? 1)
    }
  } catch {
    if (voices.get(sound.id) === voice) voices.delete(sound.id)
    out.disconnect()
    return false
  }
  out.gain.setTargetAtTime(curve(voice.level), audio.currentTime, FADE / 3)
  return true
}

export function stopSound(id) {
  const voice = voices.get(id)
  if (!voice) return
  voices.delete(id)
  voice.out.gain.cancelScheduledValues(ctx.currentTime)
  voice.out.gain.setTargetAtTime(0, ctx.currentTime, FADE / 3)
  setTimeout(() => {
    stopNodes(voice.nodes)
    voice.out.disconnect()
  }, FADE * 1600)
}

export function setSoundLevel(id, level) {
  const voice = voices.get(id)
  if (!voice) return
  voice.level = level
  // 아직 내려받는 중이면 재생을 시작할 때 이 크기를 쓴다.
  if (voice.nodes.length) voice.out.gain.setTargetAtTime(curve(level), ctx.currentTime, 0.05)
}

export function setMasterLevel(level) {
  masterLevel = curve(level)
  if (master) master.gain.setTargetAtTime(masterLevel, ctx.currentTime, 0.05)
}

export function stopAllSounds() {
  for (const id of [...voices.keys()]) stopSound(id)
}

// 지금 나는 소리의 주파수별 크기. 아직 소리를 한 번도 틀지 않았으면 null.
export function getAnalyser() {
  return analyser
}
