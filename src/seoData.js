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
  '/contact': {
    title: '문의',
    description: 'FeheDeveloperTeam(FDT)에 문의하거나 커뮤니티에 참여해보세요. Discord와 이메일로 연락하실 수 있습니다.',
  },
  '/member/yukiha': {
    title: '유키하',
    description: '유키하의 자기소개 페이지는 아직 준비 중입니다.',
  },
}

export function getFullTitle(title) {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
}
