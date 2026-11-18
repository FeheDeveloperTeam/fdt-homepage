// 화면에 보여 줄 소리 목록과 묶음(프리셋).
// kind: 'noise'는 브라우저에서 계산으로 만들고(ambientEngine.js의 NOISES), 'sample'은 public/sounds/의 실제 녹음을 반복한다.
// 녹음은 Freesound에 CC0(퍼블릭 도메인)로 공개된 것만 쓴다. 바꿀 때는 credit도 함께 고친다.
// fade: 반복 이음매를 겹쳐 섞는 길이(초). 시계처럼 겹치면 소리가 두 번 들리는 녹음은 0(똑딱 사이에서 잘라 둠).
// gain: 녹음끼리·잡음과 크기를 맞추는 배율(헤드리스 브라우저에서 RMS를 재서 정함).
const freesound = (id, user, title) => ({ url: `https://freesound.org/people/${user}/sounds/${id}/`, author: user, title })

export const SOUND_GROUPS = [
  {
    key: 'noise',
    label: '기본 소음',
    sounds: [
      { id: 'white', kind: 'noise', name: '백색소음', desc: '고르게 섞인 부드러운 쏴아 소리. 주변 말소리를 가려 줍니다.' },
      { id: 'pink', kind: 'noise', name: '핑크 노이즈', desc: '멀리서 들리는 폭포처럼 낮고 둥근 소리' },
      { id: 'brown', kind: 'noise', name: '브라운 노이즈', desc: '낮고 깊은 웅- 소리. 집중용으로 많이 찾는 소음입니다.' },
    ],
  },
  {
    key: 'nature',
    label: '자연',
    sounds: [
      {
        id: 'rain',
        kind: 'sample',
        src: '/sounds/rain.mp3',
        gain: 2.5,
        name: '빗소리',
        desc: '방 안에서 듣는 창문 너머 빗소리',
        credit: freesound(81819, 'silencyo', 'Rain on Window, Reverberant room'),
      },
      {
        id: 'waves',
        kind: 'sample',
        src: '/sounds/waves.mp3',
        gain: 1.1,
        name: '파도',
        desc: '모래사장에 잔잔하게 밀려오는 파도',
        credit: freesound(223254, 'Sandermotions', 'harlingen beach small waves'),
      },
      {
        id: 'fire',
        kind: 'sample',
        src: '/sounds/fire.mp3',
        gain: 1.45,
        name: '장작 타는 소리',
        desc: '벽난로에서 타닥타닥 타는 장작',
        credit: freesound(81801, 'silencyo', 'Fire in Fireplace, Close Up'),
      },
      {
        id: 'crickets',
        kind: 'sample',
        src: '/sounds/crickets.mp3',
        gain: 2,
        name: '여름밤 귀뚜라미',
        desc: '창밖 풀숲에서 우는 귀뚜라미',
        credit: freesound(530299, 'Sandermotions', 'Night time crickets'),
      },
    ],
  },
  {
    key: 'study',
    label: '공부 공간',
    sounds: [
      {
        id: 'exam',
        kind: 'sample',
        src: '/sounds/exam.mp3',
        gain: 1.6,
        name: '교실 필기 소리',
        desc: '학생들이 사각사각 필기하고 종이를 넘기는 교실',
        credit: freesound(450727, 'kyles', 'classroom students writing active +turning pages'),
      },
      {
        id: 'fan',
        kind: 'sample',
        src: '/sounds/fan.mp3',
        gain: 1.4,
        name: '선풍기 바람',
        desc: '방 안에서 낮게 도는 선풍기',
        credit: freesound(579681, 'RishkaBee', 'cheap_fan'),
      },
      {
        id: 'clock',
        kind: 'sample',
        src: '/sounds/clock.mp3',
        gain: 0.8,
        fade: 0,
        name: '시계 초침',
        desc: '조용한 방의 벽시계 똑딱 소리',
        credit: freesound(434841, 'giddster', 'Kitchen Wall Clock Ticking 2'),
      },
    ],
  },
]

export const SOUNDS = SOUND_GROUPS.flatMap((g) => g.sounds)

export const PRESETS = [
  { key: 'exam', name: '실전 시험장', levels: { exam: 0.7, clock: 0.35 } },
  { key: 'library', name: '밤 독서실', levels: { fan: 0.5, clock: 0.3, crickets: 0.3 } },
  { key: 'rainy', name: '비 오는 날', levels: { rain: 0.7, fire: 0.4 } },
  { key: 'sea', name: '여름 바다', levels: { waves: 0.7, crickets: 0.25 } },
  { key: 'focus', name: '깊은 집중', levels: { brown: 0.65 } },
]

export const SLEEP_OPTIONS = [
  { minutes: 0, label: '끄지 않음' },
  { minutes: 25, label: '25분' },
  { minutes: 50, label: '50분' },
  { minutes: 80, label: '80분 · 국어' },
  { minutes: 100, label: '100분 · 수학' },
]

export const DEFAULT_LEVEL = 0.5
