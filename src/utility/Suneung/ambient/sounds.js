// 화면에 보여 줄 소리 목록과 묶음(프리셋). id는 ambientEngine.js의 BUILDERS 키와 같다.
export const SOUND_GROUPS = [
  {
    key: 'noise',
    label: '기본 소음',
    sounds: [
      { id: 'white', name: '백색소음', desc: '모든 높이가 고르게 섞인 쏴아 소리. 주변 말소리를 가려 줍니다.' },
      { id: 'pink', name: '핑크 노이즈', desc: '백색소음보다 부드러운 소리. 오래 들어도 덜 피곤합니다.' },
      { id: 'brown', name: '브라운 노이즈', desc: '낮고 깊은 웅- 소리. 집중용으로 많이 찾는 소음입니다.' },
    ],
  },
  {
    key: 'nature',
    label: '자연',
    sounds: [
      { id: 'rain', name: '빗소리', desc: '쏟아지는 비와 가까이 떨어지는 빗방울' },
      { id: 'waves', name: '파도', desc: '6~11초마다 밀려왔다 빠지는 바다' },
      { id: 'fire', name: '장작 타는 소리', desc: '타닥타닥 튀는 모닥불' },
      { id: 'crickets', name: '여름밤 귀뚜라미', desc: '창밖에서 우는 귀뚜라미 두 마리' },
    ],
  },
  {
    key: 'study',
    label: '공부 공간',
    sounds: [
      { id: 'aircon', name: '독서실 에어컨', desc: '낮게 도는 바람과 작은 모터 소리' },
      { id: 'pencil', name: '시험장 필기 소리', desc: '여러 명이 사각사각 쓰고 가끔 시험지를 넘깁니다' },
      { id: 'clock', name: '시계 초침', desc: '한국 시간 정각 초에 맞춰 똑딱' },
    ],
  },
]

export const SOUNDS = SOUND_GROUPS.flatMap((g) => g.sounds)

export const PRESETS = [
  { key: 'exam', name: '실전 시험장', levels: { pencil: 0.6, clock: 0.45, aircon: 0.35 } },
  { key: 'library', name: '밤 독서실', levels: { aircon: 0.55, clock: 0.3, crickets: 0.25 } },
  { key: 'rainy', name: '비 오는 날', levels: { rain: 0.7, fire: 0.35 } },
  { key: 'sea', name: '여름 바다', levels: { waves: 0.7, crickets: 0.3 } },
  { key: 'focus', name: '깊은 집중', levels: { brown: 0.65 } },
]

export const SLEEP_OPTIONS = [
  { minutes: 0, label: '끄지 않음' },
  { minutes: 25, label: '25분' },
  { minutes: 50, label: '50분' },
  { minutes: 80, label: '80분 · 국어' },
  { minutes: 100, label: '100분 · 수학' },
]

export const DEFAULT_LEVEL = 0.6
