// 공부용 백색소음·ASMR을 Web Audio로 합성한다. 음원 파일이 없어 저작권 걱정이 없고, 몇 시간을 틀어도 같은
// 구간이 반복되는 느낌이 적도록 불규칙한 소리(빗방울·장작·연필·귀뚜라미)는 매번 새로 만든다.
// 브라우저 정책상 사용자가 버튼을 누른 뒤에만 소리가 난다.

let ctx = null
let master = null
let noise = null
let masterLevel = 0.5
let clockOffset = 0
let analyser = null
const voices = new Map()

// 켜고 끌 때 천천히 커지고 작아지는 시간(초)
const FADE = 1.8

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = masterLevel
    // 여러 소리를 겹쳐도 찢어지지 않게 마지막에 부드럽게 눌러 준다.
    // 전체에 한 번 더: 3.2kHz 위를 낮추고 10kHz 위는 걸러 「치지직」 하는 성분이 남지 않게 한다.
    const shelf = ctx.createBiquadFilter()
    shelf.type = 'highshelf'
    shelf.frequency.value = 3200
    shelf.gain.value = -9
    const top = ctx.createBiquadFilter()
    top.type = 'lowpass'
    top.frequency.value = 10000
    top.Q.value = 0.5
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -16
    limiter.knee.value = 8
    limiter.ratio.value = 6
    limiter.attack.value = 0.01
    limiter.release.value = 0.3
    master.connect(shelf).connect(top).connect(limiter).connect(ctx.destination)
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
// 모든 소리는 「조금 떨어진 곳에서 들리는」 부드러운 소리를 목표로 한다.
// 잡음은 높은 쪽을 두 번 깎아 「치지직」 대신 「쏴아·웅」이 되게 하고,
// 짧은 소리(빗방울·장작·연필·초침)도 따로 둥글게 깎은 길(softBus)로 보낸다.

// out 앞에 낮은 쪽만 통과시키는 필터를 두 단 놓은 연결점
function softBus(out, cutoff) {
  const a = filter('lowpass', cutoff, 0.5)
  const b = filter('lowpass', cutoff * 1.4, 0.5)
  a.connect(b).connect(out)
  return [a, b]
}

const BUILDERS = {
  white(out) {
    // 백색소음: 고른 쏴아 소리. 귀에 거슬리는 맨 위쪽은 깎는다.
    const src = loop('white')
    const hp = filter('highpass', 90)
    const [lp1, lp2] = softBus(out, 2500)
    const g = gainNode(1.45)
    src.connect(hp).connect(g).connect(lp1)
    return teardown([src, hp, g, lp1, lp2], [])
  },

  pink(out) {
    // 핑크 노이즈: 멀리서 들리는 폭포처럼 낮고 둥근 소리
    const src = loop('pink')
    const hp = filter('highpass', 50)
    const [lp1, lp2] = softBus(out, 1300)
    const g = gainNode(1.1)
    src.connect(hp).connect(g).connect(lp1)
    return teardown([src, hp, g, lp1, lp2], [])
  },

  brown(out) {
    const src = loop('brown')
    const [lp1, lp2] = softBus(out, 420)
    const g = gainNode(0.9)
    src.connect(g).connect(lp1)
    return teardown([src, g, lp1, lp2], [])
  },

  rain(out) {
    // 창밖 빗소리: 둥근 빗줄기 + 낮은 울림 + 가까이 톡톡 떨어지는 빗방울
    const wash = loop('pink')
    const hp = filter('highpass', 250)
    const [lp1, lp2] = softBus(out, 2200)
    const washGain = gainNode(0.9)
    wash.connect(hp).connect(washGain).connect(lp1)

    const rumble = loop('brown')
    const rumbleLp = filter('lowpass', 220)
    const rumbleGain = gainNode(0.4)
    rumble.connect(rumbleLp).connect(rumbleGain).connect(out)

    const [d1, d2] = softBus(out, 2600)
    const stop = scheduler((t) => {
      const big = Math.random() < 0.15
      burst(d1, t, {
        freq: big ? rand(500, 900) : rand(900, 2400),
        q: rand(0.8, 1.6),
        pan: rand(-0.8, 0.8),
        env: big
          ? [[0.005, rand(0.18, 0.3)], [0.09, 0]]
          : [[0.004, rand(0.05, 0.16)], [rand(0.04, 0.07), 0]],
      })
      return t - Math.log(1 - Math.random()) / 14
    })
    return teardown([wash, hp, lp1, lp2, washGain, rumble, rumbleLp, rumbleGain, d1, d2], [stop])
  },

  waves(out) {
    // 파도: 6~11초마다 밀려왔다 빠지는 큰 숨. 크기와 밝기를 함께 천천히 올렸다 내린다.
    const src = loop('pink')
    const lp = filter('lowpass', 300, 0.5)
    const lp2 = filter('lowpass', 1800, 0.5)
    const g = gainNode(0.15)
    src.connect(lp).connect(lp2).connect(g).connect(out)
    const bed = loop('brown')
    const bedLp = filter('lowpass', 300)
    const bedGain = gainNode(0.4)
    bed.connect(bedLp).connect(bedGain).connect(out)

    const stop = scheduler((t) => {
      const length = rand(6, 11)
      const peak = rand(0.7, 1.1)
      const rise = length * rand(0.38, 0.48)
      g.gain.setValueAtTime(0.15, t)
      g.gain.linearRampToValueAtTime(peak, t + rise)
      g.gain.linearRampToValueAtTime(0.12, t + length)
      lp.frequency.setValueAtTime(300, t)
      lp.frequency.exponentialRampToValueAtTime(rand(900, 1300), t + rise)
      lp.frequency.exponentialRampToValueAtTime(280, t + length)
      return t + length
    })
    return teardown([src, lp, lp2, g, bed, bedLp, bedGain], [stop])
  },

  fire(out) {
    // 모닥불: 낮게 타오르는 소리 + 이따금 타닥 튀는 장작(날카롭지 않게 둥글린 소리)
    const roar = loop('brown')
    const [lp1, lp2] = softBus(out, 480)
    const roarGain = gainNode(0.8)
    roar.connect(roarGain).connect(lp1)

    const [c1, c2] = softBus(out, 2400)
    const stop = scheduler((t) => {
      const cluster = Math.random() < 0.25 ? Math.floor(rand(2, 5)) : 1
      for (let i = 0; i < cluster; i += 1) {
        const at = t + i * rand(0.02, 0.07)
        const pop = Math.random() < 0.2
        burst(c1, at, {
          freq: pop ? rand(250, 600) : rand(900, 2200),
          q: pop ? 1.2 : 0.9,
          pan: rand(-0.35, 0.35),
          env: pop ? [[0.004, rand(0.3, 0.5)], [0.06, 0]] : [[0.002, rand(0.08, 0.28)], [rand(0.01, 0.025), 0]],
        })
      }
      return t - Math.log(1 - Math.random()) / 3
    })
    return teardown([roar, lp1, lp2, roarGain, c1, c2], [stop])
  },

  aircon(out) {
    // 독서실 에어컨: 낮은 바람 소리가 천천히 출렁이고, 아주 작은 모터 소리가 깔린다.
    const air = loop('brown')
    const lp = filter('lowpass', 450, 0.5)
    const airGain = gainNode(0.85)
    air.connect(lp).connect(airGain).connect(out)
    const breeze = loop('pink')
    const bp = filter('bandpass', 650, 0.5)
    const breezeLp = filter('lowpass', 1400, 0.5)
    const breezeGain = gainNode(0.18)
    breeze.connect(bp).connect(breezeLp).connect(breezeGain).connect(out)

    const lfo = ctx.createOscillator()
    const depth = gainNode(60)
    lfo.frequency.value = 0.09
    lfo.connect(depth).connect(lp.frequency)
    lfo.start()

    const hum = ctx.createOscillator()
    const humGain = gainNode(0.006)
    hum.frequency.value = 120
    hum.connect(humGain).connect(out)
    hum.start()
    return teardown([air, lp, airGain, breeze, bp, breezeLp, breezeGain, lfo, depth, hum, humGain], [])
  },

  pencil(out) {
    // 시험장 필기 소리: 세 사람이 각자 다른 자리에서 사각사각 쓰고, 가끔 시험지를 넘긴다.
    // 연필 소리는 원래 높은 소리라, 조금 떨어진 자리에서 들리는 정도로 둥글게 깎는다.
    const [p1, p2] = softBus(out, 3200)
    const writers = [
      { pan: -0.5, level: 1 },
      { pan: 0.2, level: 0.65 },
      { pan: 0.65, level: 0.45 },
    ]
    const stops = writers.map((w) => {
      let strokesLeft = 0
      return scheduler((t) => {
        if (strokesLeft <= 0) {
          strokesLeft = Math.floor(rand(3, 9))
          // 단어 사이 쉬기, 가끔은 문제를 읽느라 길게 쉰다.
          return t + (Math.random() < 0.12 ? rand(2, 5) : rand(0.3, 1.2))
        }
        strokesLeft -= 1
        const length = rand(0.06, 0.22)
        const env = [[0.02, 0]]
        // 종이 결에 걸리는 느낌을 내려고 크기를 잘게 흔든다.
        for (let dt = 0.03; dt < length; dt += 0.015) env.push([dt, rand(0.9, 1.8) * w.level])
        env.push([length + 0.03, 0])
        const f = burst(p1, t, { freq: rand(1800, 2900), q: rand(0.9, 1.4), pan: w.pan + rand(-0.05, 0.05), env })
        f.frequency.linearRampToValueAtTime(rand(1700, 3000), t + length)
        return t + length + rand(0.04, 0.14)
      })
    })
    const pages = scheduler((t) => {
      const at = t + rand(18, 40)
      const f = burst(p1, at, {
        kind: 'pink',
        freq: 600,
        q: 0.6,
        pan: rand(-0.5, 0.5),
        env: [[0.08, 0.6], [0.22, 1], [0.42, 0.35], [0.6, 0]],
      })
      f.frequency.linearRampToValueAtTime(1500, at + 0.22)
      f.frequency.linearRampToValueAtTime(800, at + 0.6)
      return at + 1
    })
    return teardown([p1, p2], [...stops, pages])
  },

  clock(out) {
    // 초침: 한국 시간의 정각 초마다 나무 탁상시계처럼 둥근 「똑」, 번갈아 조금 낮은 「딱」.
    const [k1, k2] = softBus(out, 2000)
    const stop = scheduler((t) => {
      // 오디오 시각 t를 한국 시간(서버 보정 포함)으로 바꿔 그다음 정각 초를 찾는다.
      const wallAt = Date.now() + clockOffset + (t - ctx.currentTime) * 1000
      const nextSecond = Math.ceil(wallAt / 1000) * 1000
      const at = t + (nextSecond - wallAt) / 1000
      const tock = Math.floor(nextSecond / 1000) % 2 === 1
      burst(k1, at, { freq: tock ? 1100 : 1350, q: 4, pan: 0.1, env: [[0.002, 3.2], [0.035, 0]] })
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.value = tock ? 700 : 820
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.25, at + 0.003)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06)
      osc.connect(g).connect(k1)
      osc.start(at)
      osc.stop(at + 0.08)
      return at + 0.05
    })
    return teardown([k1, k2], [stop])
  },

  crickets(out) {
    // 여름밤 귀뚜라미 두 마리(조금 떨어진 풀숲) + 아주 작은 밤바람
    const air = loop('pink')
    const lp = filter('lowpass', 450, 0.5)
    const airGain = gainNode(0.12)
    air.connect(lp).connect(airGain).connect(out)

    const bugs = [
      { pan: -0.45, pitch: 4200, level: 0.32 },
      { pan: 0.55, pitch: 4500, level: 0.21 },
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
          const s = t + i * 0.05
          g.gain.setValueAtTime(0, s)
          g.gain.linearRampToValueAtTime(bug.level, s + 0.012)
          g.gain.linearRampToValueAtTime(0, s + 0.03)
        }
        osc.connect(g).connect(p).connect(out)
        osc.start(t)
        osc.stop(t + pulses * 0.05 + 0.05)
        // 가끔 잠깐 조용해진다.
        return t + (Math.random() < 0.08 ? rand(2, 4) : rand(0.5, 0.9))
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
  }, FADE * 1600)
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
