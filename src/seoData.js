export const SITE_NAME = 'FeheDeveloperTeam'
export const SITE_URL = 'https://www.fehe.dev'

export const SEO_DATA = {
  '/': {
    title: 'FeheDeveloperTeam',
    description: '디스코드 봇 개발과 웹 개발을 중심으로, 직접 기획한 프로젝트를 만들어가는 개발팀 FDT입니다.',
  },
  '/about': {
    title: '팀 소개',
    description: '디스코드 봇과 웹 서비스를 직접 기획하고 만드는 FeheDeveloperTeam(FDT) 팀원을 소개합니다.',
  },
  '/services': {
    title: '하는 일 & 기술 스택',
    description: '디스코드 봇 개발, 봇 대시보드, 웹사이트 제작까지 FDT가 직접 만드는 것들과 기술 스택을 소개합니다.',
  },
  '/projects': {
    title: '프로젝트',
    description: 'FDT가 직접 운영하는 디스코드 봇 치유미(Chiyumi)를 소개합니다.',
  },
  '/projects/discord-bot': {
    title: '디스코드 봇 프로젝트',
    description: 'FDT가 직접 운영하는 디스코드 봇 치유미(Chiyumi)를 소개합니다.',
  },
  '/projects/general': {
    title: '일반 프로젝트',
    description: 'FDT가 직접 만든 웹 유틸리티 등 일반 프로젝트를 소개합니다.',
  },
  '/contact': {
    title: '문의',
    description: 'FeheDeveloperTeam(FDT)에 문의하거나 커뮤니티에 참여해보세요. Discord와 이메일로 연락하실 수 있습니다.',
  },
  '/member/fehe': {
    title: '페헤',
    description: 'FeheDeveloperTeam(FDT) 팀장 페헤의 자기소개 페이지입니다.',
    image: `${SITE_URL}/og-fehe.png`,
    imageWidth: 400,
    imageHeight: 400,
    imageAlt: '페헤 프로필 사진',
  },
  '/member/yukiha': {
    title: '유키하',
    description: '유키하의 자기소개 페이지는 아직 준비 중입니다.',
  },
  '/DiscordBot/Chiyumi': {
    title: '치유미 봇 초대',
    description: '서버 관리부터 AI 채팅·기억 기능, 날씨·자연재해 조회, 경제·게임까지 — 다양한 기능을 갖춘 디스코드 봇 치유미를 초대하고 명령어를 살펴보세요.',
    image: `${SITE_URL}/og-chiyumi.png`,
    imageWidth: 400,
    imageHeight: 400,
    imageAlt: '치유미 프로필 사진',
  },
  '/DiscordBot/Chiyumi/terms': {
    title: '이용약관',
    description: '치유미 봇의 이용약관입니다.',
  },
  '/DiscordBot/Chiyumi/privacy': {
    title: '개인정보 처리방침',
    description: '치유미 봇의 개인정보 처리방침입니다.',
  },
  '/DiscordBot/Chiyumi/errors': {
    title: '오류 코드 안내',
    description: '치유미 봇 사용 중 표시되는 오류 코드의 의미를 안내합니다.',
  },
  '/utility/network-test': {
    title: '네트워크 테스트',
    description: 'IP 주소, 지연 시간, 다운로드 속도를 측정해 내 인터넷 연결 상태를 진단합니다.',
  },
  '/wiki/minecraft': {
    title: '마인크래프트 위키',
    description: '마인크래프트 자바/베드락 에디션의 일반적인 사용법과 명령어를 정리합니다.',
  },
  '/wiki/minecraft/java': {
    title: '자바 에디션',
    description: '마인크래프트 자바 에디션(PC)의 사용법과 명령어를 정리합니다.',
  },
  '/wiki/minecraft/bedrock': {
    title: '베드락 에디션',
    description: '마인크래프트 베드락 에디션의 사용법과 명령어를 정리합니다.',
  },
}

export function getFullTitle(title) {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
}
