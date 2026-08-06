// 자바 에디션 위키 콘텐츠 — 카테고리별 문서 목록. 사이드바와 문서 페이지가
// 이 데이터 하나를 같이 참조한다 (문서 하나 추가할 때 파일을 새로 안 만들어도 됨).
const PLACEHOLDER_BODY = ['내용 준비중입니다.']

export const JAVA_WIKI = [
  {
    category: '모드팩',
    entries: [{ slug: 'cobblemon', label: '코블몬 (1.21.1)', body: PLACEHOLDER_BODY }],
  },
  {
    category: '서버 소프트웨어',
    entries: [
      { slug: 'paper', label: 'Paper', body: PLACEHOLDER_BODY },
      { slug: 'forge', label: 'Forge', body: PLACEHOLDER_BODY },
      { slug: 'fabric', label: 'Fabric', body: PLACEHOLDER_BODY },
      { slug: 'neoforge', label: 'NeoForge', body: PLACEHOLDER_BODY },
    ],
  },
  {
    category: '버전',
    entries: [
      { slug: 'alpha', label: '알파', body: PLACEHOLDER_BODY },
      { slug: 'beta', label: '베타', body: PLACEHOLDER_BODY },
      { slug: 'release', label: '릴리즈', body: PLACEHOLDER_BODY },
      { slug: 'snapshot', label: '스냅샷', body: PLACEHOLDER_BODY },
    ],
  },
  {
    category: '아이템',
    entries: [{ slug: 'command_block', label: '명령 블록', body: PLACEHOLDER_BODY }],
  },
  {
    category: '명령어',
    subcategory: '게임룰',
    entries: [
      { slug: 'locator-bar', label: '로케이터 바', body: PLACEHOLDER_BODY },
      { slug: 'keepinventory', label: '킵인벤 (keepInventory)', body: PLACEHOLDER_BODY },
    ],
  },
  {
    category: '게임모드',
    entries: [
      { slug: 'creative', label: '크리에이티브', body: PLACEHOLDER_BODY },
      { slug: 'survival', label: '서바이벌', body: PLACEHOLDER_BODY },
    ],
  },
  {
    category: '서버 관리',
    entries: [
      { slug: 'op', label: 'OP', body: PLACEHOLDER_BODY },
      { slug: 'deop', label: 'DEOP', body: PLACEHOLDER_BODY },
    ],
  },
]

export function findJavaEntry(slug) {
  for (const group of JAVA_WIKI) {
    const entry = group.entries.find((e) => e.slug === slug)
    if (entry) return { ...entry, category: group.category }
  }
  return null
}
