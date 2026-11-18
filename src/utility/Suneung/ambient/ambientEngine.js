// 공부용 백색소음·ASMR을 Web Audio로 합성한다. 음원 파일이 없어 저작권 걱정이 없고, 몇 시간을 틀어도 같은
// 구간이 반복되는 느낌이 적도록 불규칙한 소리(빗방울·장작·연필·귀뚜라미)는 매번 새로 만든다.
// 브라우저 정책상 사용자가 버튼을 누른 뒤에만 소리가 난다.

let ctx = null
let master = null
let noise = null
let masterLevel = 0.8
let clockOffset = 0
let analyser = null
const voices = new Map()

const FADE = 0.6

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
    limiter.threshold.value = -10
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
    noise = { white: makeNoise('white'), pink: makeNoise('pink'), brown: makeNoise('brown') }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

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

function loop(kind) {
  const src = ctx.createBufferSource()
  src.buffer = noise[kind]
  src.loop = true
  src.start(ctx.currentTime, Math.random() * 7)
  return src
}

function filter(type, frequency, q = 0.7) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = frequency
  f.Q.value = q
  return f
}

function gainNode(value) {
  const g = ctx.createGain()
  g.gain.value = value
  return g
}

function panner(value) {
  if (!ctx.createStereoPanner) return gainNode(1)
  const p = ctx.createStereoPanner()
  p.pan.value = value
  return p
}

const rand = (min, max) => min + Math.random() * (max - min)

// 짧은 잡음 한 번(빗방울·장작 튀는 소리·연필 획 등). env: [[시각(초), 크기], ...]
function burst(out, at, { kind = 'white', type = 'bandpass', freq = 3000, q = 1, pan = 0, env }) {
  const src = ctx.createBufferSource()
  src.buffer = noise[kind]
  const f = filter(type, freq, q)
  const g = ctx.createGain()
  const p = panner(pan)
  g.gain.setValueAtTime(0, at)
  for (const [dt, level] of env) g.gain.linearRampToValueAtTime(level, at + dt)
  const end = env[env.length - 1][0]
  src.connect(f).connect(g).connect(p).connect(out)
  src.start(at, Math.random() * 7, end + 0.05)
  return f
}

// 앞으로 1.5초 안에 날 소리를 미리 예약한다. 백그라운드 탭에서도 오디오가 나는 동안은 타이머가 크게 늦어지지 않는다.
function scheduler(schedule) {
  let next = ctx.currentTime + 0.1
  const tick = () => {
    if (next < ctx.currentTime) next = ctx.currentTime + 0.05
    while (next < ctx.currentTime + 1.5) next = schedule(next)
  }
  tick()
  const id = setInterval(tick, 250)
  return () => clearInterval(id)
}

function teardown(nodes, stops) {
  return () => {
    for (const stop of stops) stop()
    for (const node of nodes) {
      try {
        node.stop?.()
      } catch {
        // 이미 멈춘 노드
      }
      node.disconnect()
    }
  }
}

// ── 소리 하나하나 ──
// 각 함수는 out(GainNode)에 소리를 연결하고, 멈출 때 부를 함수를 돌려준다.

const BUILDERS = {
  white(out) {
    const src = loop('white')
    const lp = filter('lowpass', 9000)
    const g = gainNode(0.5)
    src.connect(lp).connect(g).connect(out)
    return teardown([src, lp, g], [])
  },

  pink(out) {
    const src = loop('pink')
    const g = gainNode(0.6)
    src.connect(g).connect(out)
    return teardown([src, g], [])
  },

  brown(out) {
    const src = loop('brown')
    const lp = filter('lowpass', 900)
    const g = gainNode(0.65)
    src.connect(lp).connect(g).connect(out)
    return teardown([src, lp, g], [])
  },

  rain(out) {
    // 멀리서 쏟아지는 빗소리 + 낮은 울림 + 가까이 떨어지는 빗방울
    const wash = loop('pink')
    const hp = filter('highpass', 600)
    const lp = filter('lowpass', 7500)
    const washGain = gainNode(0.65)
    wash.connect(hp).connect(lp).connect(washGain).connect(out)

    const rumble = loop('brown')
    const rumbleLp = filter('lowpass', 260)
    const rumbleGain = gainNode(0.35)
    rumble.connect(rumbleLp).connect(rumbleGain).connect(out)

    const stop = scheduler((t) => {
      const big = Math.random() < 0.12
      burst(out, t, {
        freq: big ? rand(900, 1800) : rand(2200, 6500),
        q: rand(1.2, 3.5),
        pan: rand(-0.9, 0.9),
        env: big
          ? [[0.003, rand(0.25, 0.45)], [0.05, 0]]
          : [[0.002, rand(0.06, 0.22)], [rand(0.012, 0.03), 0]],
      })
      return t - Math.log(1 - Math.random()) / 22
    })
    return teardown([wash, hp, lp, washGain, rumble, rumbleLp, rumbleGain], [stop])
  },

  waves(out) {
    // 파도가 밀려왔다 빠지는 큰 숨: 소리 크기와 밝기를 6~11초마다 함께 올렸다 내린다.
    const src = loop('pink')
    const lp = filter('lowpass', 500)
    const g = gainNode(0.1)
    src.connect(lp).connect(g).connect(out)
    const bed = loop('brown')
    const bedLp = filter('lowpass', 350)
    const bedGain = gainNode(0.3)
    bed.connect(bedLp).connect(bedGain).connect(out)

    const stop = scheduler((t) => {
      const length = rand(6, 11)
      const peak = rand(0.55, 0.95)
      const rise = length * rand(0.35, 0.45)
      g.gain.setValueAtTime(0.1, t)
      g.gain.linearRampToValueAtTime(peak, t + rise)
      g.gain.linearRampToValueAtTime(0.08, t + length)
      lp.frequency.setValueAtTime(450, t)
      lp.frequency.exponentialRampToValueAtTime(rand(1800, 2800), t + rise)
      lp.frequency.exponentialRampToValueAtTime(420, t + length)
      return t + length
    })
    return teardown([src, lp, g, bed, bedLp, bedGain], [stop])
  },

  fire(out) {
    // 낮게 타오르는 소리 + 불규칙하게 튀는 장작
    const roar = loop('brown')
    const lp = filter('lowpass', 700)
    const roarGain = gainNode(0.55)
    roar.connect(lp).connect(roarGain).connect(out)
    const hiss = loop('pink')
    const hissHp = filter('highpass', 2500)
    const hissGain = gainNode(0.05)
    hiss.connect(hissHp).connect(hissGain).connect(out)

    const stop = scheduler((t) => {
      const cluster = Math.random() < 0.25 ? Math.floor(rand(2, 6)) : 1
      for (let i = 0; i < cluster; i += 1) {
        const at = t + i * rand(0.015, 0.06)
        const pop = Math.random() < 0.15
        burst(out, at, {
          freq: pop ? rand(500, 1200) : rand(1500, 5000),
          q: pop ? 1.5 : 0.8,
          pan: rand(-0.4, 0.4),
          env: pop ? [[0.002, rand(0.35, 0.6)], [0.035, 0]] : [[0.001, rand(0.12, 0.5)], [rand(0.003, 0.012), 0]],
        })
      }
      return t - Math.log(1 - Math.random()) / 3.5
    })
    return teardown([roar, lp, roarGain, hiss, hissHp, hissGain], [stop])
  },

  aircon(out) {
    // 독서실 에어컨: 낮은 바람 소리 + 아주 작은 모터 웅웅 + 바람 세기가 천천히 출렁임
    const air = loop('brown')
    const lp = filter('lowpass', 520)
    const airGain = gainNode(0.6)
    air.connect(lp).connect(airGain).connect(out)
    const breeze = loop('pink')
    const bp = filter('bandpass', 1100, 0.5)
    const breezeGain = gainNode(0.12)
    breeze.connect(bp).connect(breezeGain).connect(out)

    const lfo = ctx.createOscillator()
    const depth = gainNode(70)
    lfo.frequency.value = 0.11
    lfo.connect(depth).connect(lp.frequency)
    lfo.start()

    const hum = []
    for (const [freq, level] of [[120, 0.012], [240, 0.005]]) {
      const osc = ctx.createOscillator()
      const g = gainNode(level)
      osc.frequency.value = freq
      osc.connect(g).connect(out)
      osc.start()
      hum.push(osc, g)
    }
    return teardown([air, lp, airGain, breeze, bp, breezeGain, lfo, depth, ...hum], [])
  },

  pencil(out) {
    // 시험장 필기 소리: 세 사람이 각자 다른 자리에서 사각사각 쓰고, 가끔 시험지를 넘긴다.
    const writers = [
      { pan: -0.55, level: 1 },
      { pan: 0.25, level: 0.6 },
      { pan: 0.7, level: 0.4 },
    ]
    const stops = writers.map((w) => {
      let strokesLeft = 0
      return scheduler((t) => {
        if (strokesLeft <= 0) {
          strokesLeft = Math.floor(rand(3, 9))
          // 단어 사이 쉬기, 가끔은 문제를 읽느라 길게 쉰다.
          return t + (Math.random() < 0.12 ? rand(2, 5) : rand(0.25, 1.1))
        }
        strokesLeft -= 1
        const length = rand(0.05, 0.22)
        const env = [[0.01, 0]]
        // 종이 결에 걸리는 느낌을 내려고 크기를 잘게 흔든다.
        for (let dt = 0.012; dt < length; dt += 0.012) env.push([dt, rand(0.35, 0.85) * w.level])
        env.push([length + 0.015, 0])
        const f = burst(out, t, { freq: rand(3200, 5600), q: rand(1, 1.8), pan: w.pan + rand(-0.05, 0.05), env })
        f.frequency.linearRampToValueAtTime(rand(3000, 6000), t + length)
        return t + length + rand(0.03, 0.12)
      })
    })
    const pages = scheduler((t) => {
      const at = t + rand(18, 40)
      const pan = rand(-0.6, 0.6)
      const f = burst(out, at, {
        kind: 'pink',
        freq: 900,
        q: 0.6,
        pan,
        env: [[0.05, 0.25], [0.18, 0.45], [0.38, 0.15], [0.5, 0]],
      })
      f.frequency.linearRampToValueAtTime(2600, at + 0.2)
      f.frequency.linearRampToValueAtTime(1200, at + 0.5)
      return at + 1
    })
    return teardown([], [...stops, pages])
  },

  clock(out) {
    // 초침: 한국 시간의 정각 초마다 「똑」, 번갈아 조금 낮은 「딱」.
    const stop = scheduler((t) => {
      // 오디오 시각 t를 한국 시간(서버 보정 포함)으로 바꿔 그다음 정각 초를 찾는다.
      const wallAt = Date.now() + clockOffset + (t - ctx.currentTime) * 1000
      const nextSecond = Math.ceil(wallAt / 1000) * 1000
      const at = t + (nextSecond - wallAt) / 1000
      const tock = Math.floor(nextSecond / 1000) % 2 === 1
      burst(out, at, { freq: tock ? 2300 : 2900, q: 3, pan: 0.15, env: [[0.0015, 2.4], [0.025, 0]] })
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.value = tock ? 1400 : 1750
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.2, at + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04)
      osc.connect(g).connect(out)
      osc.start(at)
      osc.stop(at + 0.06)
      return at + 0.05
    })
    return teardown([], [stop])
  },

  crickets(out) {
    // 여름밤 귀뚜라미 두 마리 + 아주 작은 밤바람
    const air = loop('pink')
    const lp = filter('lowpass', 500)
    const airGain = gainNode(0.08)
    air.connect(lp).connect(airGain).connect(out)

    const bugs = [
      { pan: -0.5, pitch: 4400, level: 0.2 },
      { pan: 0.6, pitch: 4750, level: 0.13 },
    ]
    const stops = bugs.map((bug) =>
      scheduler((t) => {
        const pulses = Math.floor(rand(3, 5))
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const p = panner(bug.pan)
        osc.frequency.value = bug.pitch + rand(-40, 40)
        g.gain.setValueAtTime(0, t)
        for (let i = 0; i < pulses; i += 1) {
          const s = t + i * 0.045
          g.gain.setValueAtTime(0, s)
          g.gain.linearRampToValueAtTime(bug.level, s + 0.006)
          g.gain.linearRampToValueAtTime(0, s + 0.022)
        }
        osc.connect(g).connect(p).connect(out)
        osc.start(t)
        osc.stop(t + pulses * 0.045 + 0.05)
        // 가끔 잠깐 조용해진다.
        return t + (Math.random() < 0.08 ? rand(2, 4) : rand(0.45, 0.85))
      }),
    )
    return teardown([air, lp, airGain], stops)
  },
}

export const SOUND_IDS = Object.keys(BUILDERS)

// 슬라이더 값(0~1)을 귀에 자연스럽게 들리는 크기로 바꾼다.
const curve = (level) => level * level

export function startSound(id, level) {
  const audio = getContext()
  if (!audio || !BUILDERS[id]) return false
  if (voices.has(id)) {
    setSoundLevel(id, level)
    return true
  }
  const out = audio.createGain()
  out.gain.value = 0
  out.connect(master)
  out.gain.setTargetAtTime(curve(level), audio.currentTime, FADE / 3)
  voices.set(id, { out, stop: BUILDERS[id](out) })
  return true
}

export function stopSound(id) {
  const voice = voices.get(id)
  if (!voice) return
  voices.delete(id)
  voice.out.gain.setTargetAtTime(0, ctx.currentTime, FADE / 3)
  setTimeout(() => {
    voice.stop()
    voice.out.disconnect()
  }, FADE * 1000 + 100)
}

export function setSoundLevel(id, level) {
  const voice = voices.get(id)
  if (voice) voice.out.gain.setTargetAtTime(curve(level), ctx.currentTime, 0.05)
}

export function setMasterLevel(level) {
  masterLevel = curve(level)
  if (master) master.gain.setTargetAtTime(masterLevel, ctx.currentTime, 0.05)
}

export function stopAllSounds() {
  for (const id of [...voices.keys()]) stopSound(id)
}

export function setAmbientClockOffset(offset) {
  clockOffset = offset
}

// 지금 나는 소리의 주파수별 크기. 아직 소리를 한 번도 틀지 않았으면 null.
export function getAnalyser() {
  return analyser
}

export function playingCount() {
  return voices.size
}
