/*
  헤더와 푸터가 같은 메뉴를 보여줘야 하므로 여기 한 곳에서 관리한다.
  공개 라우트를 추가·변경하면 src/seoData.js와 public/sitemap.xml도 함께 검토한다.
*/
export const NAV_LINKS = [
  { to: '/', label: '홈' },
  { to: '/about', label: '팀 소개' },
  { to: '/services', label: '하는 일' },
  { to: '/projects', label: '프로젝트' },
  { to: '/contact', label: '문의' },
]

// 푸터에만 두는 링크. 헤더 메뉴는 5개로 유지한다.
export const FOOTER_LINKS = [...NAV_LINKS, { to: '/status', label: '서비스 상태' }]

export const CONTACT_EMAIL = 'help@fehe.dev'
export const DISCORD_INVITE = 'https://discord.gg/fKR7RbfdmF'
