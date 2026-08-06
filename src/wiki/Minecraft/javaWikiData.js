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
        sections: [
          {
            title: '기능',
            paragraphs: [
              '명령 블록은 레드스톤 신호를 받으면 안에 저장해 둔 명령어를 자동으로 실행하는 블록이에요. 커스텀 맵, 미니게임, 이벤트 연출처럼 반복적이거나 조건에 따라 실행돼야 하는 동작을 자동화할 때 핵심적으로 쓰여요.',
              '임펄스형은 신호를 받을 때 딱 한 번만 실행하고, 체인형은 다른 명령 블록 뒤에 연결해서 연쇄적으로 실행하며, 반복형은 신호가 켜져 있는 동안 매 틱마다 계속 실행해요.',
            ],
          },
          {
            title: '사용법',
            code: 'command_block',
            paragraphs: [
              '크리에이티브 인벤토리에는 없어서 /give @s command_block 명령어로만 얻을 수 있어요. op 권한이 있는 플레이어만 실행할 수 있어요.',
              '블록을 설치한 뒤 우클릭하면 편집 창이 열려요. 여기서 실행할 명령어를 입력하고, 상단에서 임펄스/체인/반복 중 어떤 방식으로 작동할지, 무조건 실행할지 이전 블록이 성공했을 때만 실행할지(조건부)를 선택할 수 있어요.',
              "레드스톤 신호 없이도 항상 활성화 상태로 둘 수 있는 '항상 활성화' 옵션도 있어서, 반복형과 함께 쓰면 매 틱마다 자동으로 명령어가 실행돼요.",
            ],
          },
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
        sections: [
          {
            title: '기능',
            paragraphs: [
              '로케이터 바는 같은 팀(또는 지정된 대상) 플레이어들이 화면 위쪽에 나침반처럼 대략적인 방향과 거리로 표시되는 기능이에요. 서로 흩어진 인원을 찾기 쉬워져서 팀 단위 미니게임이나 협동 플레이에서 유용해요.',
              '적 팀 플레이어는 표시되지 않고, 오직 같은 팀으로 지정된 플레이어만 보여요.',
            ],
          },
          {
            title: '사용법',
            paragraphs: [
              "월드를 새로 만들 때 '실험적 기능(Experiments)' 항목에서 로케이터 바를 켜면 사용할 수 있어요. 이미 생성된 월드나 서버에 나중에 추가하려면 데이터팩으로 넣어줘야 해요.",
              '/team add 명령어로 팀을 만들고 /team join <팀 이름> <플레이어>로 플레이어를 팀에 소속시키면, 같은 팀원끼리 자동으로 로케이터 바에 표시돼요.',
            ],
          },
        ],
      },
      {
        slug: 'keepinventory',
        label: '킵인벤 (keepInventory)',
        sections: [
          {
            title: '기능',
            paragraphs: [
              '킵인벤(keepInventory)은 죽어도 인벤토리와 경험치를 그대로 유지시켜주는 게임룰이에요. 기본값은 꺼짐(false)이라 원래는 사망 시 아이템이 그 자리에 드랍돼요.',
              '건축 서버나 미니게임처럼 아이템을 잃는 게 진행에 방해가 되는 환경에서 자주 켜두는 설정이에요.',
            ],
          },
          {
            title: '사용법',
            code: '/gamerule keepInventory true',
            paragraphs: [
              'op 권한이 있는 플레이어나 콘솔에서 위 명령어를 입력하면 즉시 적용돼요. 다시 끄고 싶으면 true 대신 false를 입력하면 돼요.',
              '값을 넣지 않고 /gamerule keepInventory만 입력하면 현재 설정값을 확인할 수 있어요.',
            ],
          },
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
        sections: [
          {
            title: '기능',
            paragraphs: [
              '크리에이티브 모드는 모든 아이템을 무제한으로 쓸 수 있고, 자유롭게 날 수 있으며, 배고픔이나 몹의 공격으로 피해를 입지 않는 모드예요. 블록도 우클릭 한 번에 즉시 파괴돼요.',
              '생존 요소 없이 마음껏 건축하거나 기능을 테스트할 때 주로 사용해요.',
            ],
          },
          {
            title: '사용법',
            code: '/gamemode creative',
            paragraphs: [
              '자기 자신에게 적용할 때는 플레이어 이름을 생략해도 돼요. 다른 플레이어에게 적용하려면 /gamemode creative <닉네임>처럼 이름을 뒤에 붙이고, 이 경우 op 권한이 필요해요.',
              '단축 명령어로 /gamemode c 만 입력해도 동일하게 작동해요.',
            ],
          },
        ],
      },
      {
        slug: 'survival',
        label: '서바이벌',
        sections: [
          {
            title: '기능',
            paragraphs: [
              '서바이벌 모드는 마인크래프트의 기본 플레이 방식이에요. 자원을 직접 채집하고 제작해야 하고, 배고픔과 체력을 관리해야 하며 몹의 공격이나 추락 등으로 피해를 입을 수 있어요.',
              '서버를 새로 만들면 대부분 이 모드가 기본값으로 설정돼 있어요.',
            ],
          },
          {
            title: '사용법',
            code: '/gamemode survival',
            paragraphs: [
              '다른 플레이어를 서바이벌로 되돌리고 싶을 때는 /gamemode survival <닉네임>처럼 대상을 지정하면 돼요.',
              '서버 전체의 기본 게임모드는 server.properties 파일의 gamemode 항목에서 survival로 지정할 수 있어요.',
            ],
          },
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
        sections: [
          {
            title: '기능',
            paragraphs: [
              'OP는 특정 플레이어에게 관리자(운영자) 권한을 부여하는 명령어예요. 권한을 받으면 대부분의 명령어 실행과 서버 설정 변경이 가능해져요.',
            ],
          },
          {
            title: '사용법',
            code: '/op <닉네임>',
            paragraphs: [
              '콘솔이나 이미 OP 권한이 있는 플레이어만 실행할 수 있어요. 닉네임 대신 서버 파일의 ops.json을 직접 편집해서 등록할 수도 있어요.',
              'server.properties의 op-permission-level 값(1~4)으로 OP가 실제로 사용할 수 있는 명령어 범위를 세밀하게 조정할 수 있어요.',
            ],
          },
        ],
      },
      {
        slug: 'deop',
        label: 'DEOP',
        sections: [
          {
            title: '기능',
            paragraphs: [
              'DEOP는 OP로 부여했던 관리자 권한을 다시 회수하는 명령어예요. 더 이상 관리 권한이 필요 없는 플레이어에게 사용해요.',
            ],
          },
          {
            title: '사용법',
            code: '/deop <닉네임>',
            paragraphs: [
              'OP와 마찬가지로 콘솔이나 다른 OP 플레이어만 실행할 수 있어요. ops.json 파일에서 해당 플레이어 항목을 직접 지워도 동일한 효과가 있어요.',
            ],
          },
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
