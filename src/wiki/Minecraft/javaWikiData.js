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
    entries: [
      {
        slug: 'command_block',
        label: '명령 블록',
        code: 'command_block',
        body: [
          '명령 블록은 레드스톤 신호를 받으면 내부에 저장된 명령어를 실행하는 블록이에요. 커스텀 맵이나 미니게임, 자동화된 이벤트를 만들 때 핵심적으로 쓰여요.',
          '크리에이티브 인벤토리에는 없고 /give 명령어로만 얻을 수 있어요. 신호를 받을 때마다 실행하는 임펄스형, 다른 명령 블록과 연결해 순서대로 실행하는 체인형, 계속 반복 실행하는 반복형 세 종류가 있어요.',
        ],
      },
    ],
  },
  {
    category: '명령어',
    subcategory: '게임룰',
    entries: [
      {
        slug: 'locator-bar',
        label: '로케이터 바',
        body: [
          '로케이터 바는 같은 팀(또는 설정된 대상) 플레이어들의 대략적인 방향과 거리를 화면 위쪽에 나침반처럼 표시해주는 기능이에요. 서로 흩어진 인원을 찾기 쉬워서 팀 단위 미니게임이나 협동 플레이에서 유용해요.',
          '팀 옵션이나 관련 설정을 통해 서버/월드 단위로 켜고 끌 수 있어요.',
        ],
      },
      {
        slug: 'keepinventory',
        label: '킵인벤 (keepInventory)',
        code: '/gamerule keepInventory true',
        body: [
          '킵인벤은 죽어도 인벤토리와 경험치를 그대로 유지시켜주는 게임룰이에요. 기본값은 false(사망 시 아이템 드랍)이고, 위 명령어로 켜면 죽어도 아이템을 잃지 않아요.',
          '건축·미니게임 서버처럼 아이템 손실이 진행에 방해되는 환경에서 자주 켜두는 설정이에요.',
        ],
      },
    ],
  },
  {
    category: '게임모드',
    entries: [
      {
        slug: 'creative',
        label: '크리에이티브',
        code: '/gamemode creative',
        body: [
          '크리에이티브 모드는 모든 아이템을 무제한으로 쓸 수 있고, 자유롭게 날 수 있고, 배고픔이나 몹의 공격으로 피해를 입지 않는 모드예요. 블록도 즉시 파괴돼요. 건축이나 테스트 용도로 많이 써요.',
        ],
      },
      {
        slug: 'survival',
        label: '서바이벌',
        code: '/gamemode survival',
        body: [
          '서바이벌 모드는 마인크래프트의 기본 플레이 방식이에요. 자원을 직접 채집·제작해야 하고, 배고픔·체력 관리가 필요하며 몹에게 피해를 입을 수 있어요.',
        ],
      },
    ],
  },
  {
    category: '서버 관리',
    entries: [
      {
        slug: 'op',
        label: 'OP',
        code: '/op <닉네임>',
        body: [
          'OP는 특정 플레이어에게 관리자(운영자) 권한을 부여하는 명령어예요. 콘솔이나 이미 OP 권한이 있는 플레이어가 실행할 수 있고, 권한을 받으면 대부분의 명령어와 서버 설정에 접근할 수 있어요.',
        ],
      },
      {
        slug: 'deop',
        label: 'DEOP',
        code: '/deop <닉네임>',
        body: [
          'DEOP는 OP로 부여했던 관리자 권한을 다시 회수하는 명령어예요. 더 이상 관리 권한이 필요 없는 플레이어에게 사용해요.',
        ],
      },
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
