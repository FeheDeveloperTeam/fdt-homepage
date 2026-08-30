# FDT Homepage 프로젝트 가이드

이 문서는 새 작업 세션에서 저장소의 구조와 결합 지점을 빠르게 파악하기 위한 기준 문서입니다. 코드 구조가 바뀌면 관련 절을 함께 갱신합니다.

## 1. 프로젝트 한눈에 보기

이 저장소는 `www.fehe.dev`에서 제공하는 여러 화면을 하나의 Vite/React SPA로 묶고, 필요한 백엔드 기능을 같은 저장소의 Node.js 핸들러로 제공합니다.

| 영역 | 역할 | 진입 코드 |
| --- | --- | --- |
| FDT 메인 | 팀·서비스·프로젝트·문의 소개 | `src/App.jsx`, `src/pages/`, `src/components/` |
| Fehe | 개인 소개, YouTube, 상태, 숨김·미리보기 화면 | `src/member/fehe/FeheApp.jsx` |
| Yukiha | 준비 중인 멤버 페이지 | `src/member/yukiha/YukihaPage.jsx` |
| Chiyumi | Discord 봇 소개, 관리자 도구, 길드 설정 | `src/DiscordBot/Chiyumi/ChiyumiApp.jsx` |
| 네트워크 테스트 | IP, 왕복 지연, 다운로드 처리량 진단 | `src/utility/NetworkTest/NetworkTestApp.jsx` |
| Minecraft 위키 | Java 문서, Bedrock 준비 페이지 | `src/wiki/Minecraft/MinecraftWikiApp.jsx` |
| API | 인증, 관리자, 길드, 네트워크 진단 | `api/` |
| 로컬·독립 서버 | API 핸들러 연결, Vite 미들웨어 또는 `dist` 제공 | `server/index.js` |

`src/main.jsx`가 `HelmetProvider`와 `BrowserRouter`를 만들고 `src/App.jsx`를 렌더링합니다. 큰 서브앱은 `lazy`/`Suspense`로 분할되며, Vercel Analytics와 Speed Insights는 앱 루트에서 수집됩니다.

## 2. 실행과 검증

Node.js 버전은 `package.json` 기준 22.x입니다.

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다. `npm run dev`는 Node의 `--env-file-if-exists=.env`로 환경 변수를 읽고 Express를 실행합니다. 개발 모드에서는 Express가 `/api`를 먼저 처리하고 Vite를 미들웨어로 연결합니다.

변경 후 기본 검증은 다음 두 명령입니다.

```bash
npm run lint
npm run build
```

별도의 테스트 스크립트는 현재 없습니다. 프로덕션 방식의 로컬 확인은 빌드 후 `npm start`를 사용합니다.

## 3. 프런트엔드 라우트

### FDT 메인과 멤버

| 경로 | 화면 |
| --- | --- |
| `/` | FDT 홈 |
| `/about` | 팀 소개 |
| `/services` | 서비스·기술 소개 |
| `/projects` | 전체 프로젝트 |
| `/projects/:category` | 카테고리별 프로젝트 |
| `/contact` | 문의 |
| `/member/yukiha` | Yukiha 준비 페이지 |
| `/member/fehe` | Fehe 홈 |
| `/member/fehe/youtube` | YouTube 콘텐츠 |
| `/member/fehe/secret` | 숨김 페이지 |
| `/member/fehe/status` | 외부 서비스 상태 확인 |
| `/member/fehe/live-preview` | 라이브 UI 미리보기 |
| `/fehe/*` | 같은 하위 경로의 `/member/fehe/*`로 리다이렉트하는 구형 URL |

### Chiyumi

기준 경로는 `/DiscordBot/Chiyumi`입니다.

| 하위 경로 | 화면 |
| --- | --- |
| `/` | 봇 소개·로그인 |
| `/servers` | 사용자가 관리할 수 있고 봇이 참가한 서버 목록 |
| `/servers/:guildId` | 서버 개요 |
| `/servers/:guildId/log` | 로그 설정 |
| `/servers/:guildId/welcome` | 입장·퇴장 설정 |
| `/servers/:guildId/ticket` | 티켓 설정 |
| `/servers/:guildId/warn` | 경고 설정·조회 |
| `/servers/:guildId/moderation` | 차단·추방 |
| `/servers/:guildId/censor` | 스팸·레이드 방어 |
| `/servers/:guildId/wordchain` | 끝말잇기 설정 |
| `/servers/:guildId/streamalert` | 방송 알림 설정 |
| `/admin` | 관리자 통계 |
| `/admin/restrict`, `/admin/unrestrict`, `/admin/check` | 이용 제한 관리 |
| `/admin/admins` | 웹 관리자 관리 |
| `/admin/sheets` | 허용된 Google Sheet 조회 |
| `/admin/coins/check`, `/admin/coins/adjust` | 코인 조회·조정 |
| `/terms`, `/privacy`, `/errors` | 약관, 개인정보 처리방침, 오류 코드 안내 |

관리자 화면은 애플리케이션 권한 검사와 별도로 배포 환경의 국가 헤더가 존재할 때 한국(`KR`) 이외의 요청을 차단합니다.

### 유틸리티와 위키

| 경로 | 화면 |
| --- | --- |
| `/utility/network-test` | 네트워크 진단 |
| `/wiki/minecraft` | 위키 홈 |
| `/wiki/minecraft/java` | Java 문서 목록 |
| `/wiki/minecraft/java/:slug` | Java 문서 상세 |
| `/wiki/minecraft/bedrock` | Bedrock 준비 페이지 |

Java 문서 데이터와 상세 SEO 항목은 `src/wiki/Minecraft/javaWikiData.js`와 `src/seoData.js`에서 연결됩니다.

## 4. 스타일 구조

FDT 메인은 CSS Modules를 주로 사용하고 공통 토큰은 `src/styles/variables.css`, 전역 리셋과 공통 동작은 `src/index.css`에 둡니다.

Fehe, Chiyumi, 네트워크 테스트, Minecraft 위키는 서로 다른 디자인 시스템입니다. 각 서브앱의 `index.css`와 `styles/variables.css`가 `.fehe-app`, `.chiyumi-app`, `.nettest-app`, `.mcwiki-app` 루트 아래에서 `@scope`로 리셋과 토큰을 제한합니다. 서브앱 스타일을 수정할 때 이 경계를 벗어나는 전역 선택자를 추가하지 않아야 다른 영역과 충돌하지 않습니다.

반응형 변경에는 기존 미디어 쿼리와 `prefers-reduced-motion` 처리를 유지하고, 재사용 값은 해당 영역의 변수 파일에 먼저 추가합니다.

## 5. API와 인증

### 엔드포인트

| 엔드포인트 | 메서드 | 역할 |
| --- | --- | --- |
| `/api/auth/discord/login` | GET | Turnstile 검증 후 Discord OAuth 시작 |
| `/api/auth/discord/callback` | GET | OAuth 콜백, 세션 쿠키 발급 |
| `/api/auth/me` | GET | 현재 사용자와 관리자 여부 반환 |
| `/api/auth/logout` | GET | 세션 쿠키 제거 후 Chiyumi 홈으로 이동 |
| `/api/admin/stats` | GET | 서버·멤버·제한·코인 통계 |
| `/api/admin/admins` | GET, POST, DELETE | 웹 관리자 조회·추가·삭제 |
| `/api/admin/restrictions` | GET, POST, DELETE | 사용자 이용 제한 조회·추가·해제 |
| `/api/admin/coins` | GET, POST | 코인 잔액 조회·조정 |
| `/api/admin/sheet` | GET | 허용 목록의 Google Sheet 읽기 |
| `/api/guild` | GET, POST | `resource` 값에 따른 길드 관리 API |
| `/api/network-test` | GET | `type=ip`, `ping`, `download` 진단 응답 |
| `/api/render` | GET | Vercel의 SPA HTML·SEO 렌더 진입점 |

`/api/guild`는 Vercel 함수 수를 늘리지 않도록 여러 기능을 한 핸들러에 모읍니다. `resource`는 `guilds`, `meta`, `overview`, `config`, `warnings`, `streamalert`, `ban`, `kick` 중 하나이며, 일부 쓰기 동작은 JSON 본문의 `section`, `field` 또는 `action`으로 다시 나뉩니다.

새 서버리스 핸들러를 추가하면 Vercel의 `api/` 파일만 만들고 끝내지 말고, 로컬 개발과 `npm start`에서도 같은 동작을 하도록 `server/index.js`에 import와 Express 라우트를 추가해야 합니다.

### 인증·권한 흐름

1. 로그인 버튼이 Cloudflare Turnstile 토큰을 `/api/auth/discord/login`에 전달합니다.
2. 서버가 Discord OAuth의 `identify guilds` 범위로 인증하고 사용자 정보와 access token을 JWT에 담습니다.
3. JWT는 `fdt_session`이라는 HTTP-only, SameSite=Lax 쿠키로 최대 7일 보관되며 프로덕션에서는 Secure가 적용됩니다.
4. 관리자 API는 세션 사용자 ID가 `ADMIN_DISCORD_IDS` 또는 SFTP의 웹 관리자 목록에 있는지 확인합니다.
5. 길드 API는 로그인 사용자가 Discord에서 필요한 권한을 가졌고 Chiyumi 봇이 해당 길드에 참가했는지 확인합니다. 일반 설정은 `MANAGE_GUILD`, 차단·추방은 각각 해당 Discord 권한이 필요합니다.

rate limit과 일부 Discord·통계·Sheet 캐시는 프로세스 메모리 기반입니다. 서버리스 인스턴스 전체가 공유하는 영속 제한이나 캐시로 간주하면 안 됩니다.

## 6. 데이터와 외부 서비스

Chiyumi 관리 데이터는 별도 봇 서버의 JSON 파일을 SFTP로 읽고 씁니다.

| 원격 파일 | 용도 |
| --- | --- |
| `data/webAdmins.json` | 추가 웹 관리자 |
| `data/restrictions.json` | 이용 제한 |
| `data/credits.json` | 코인 잔액 |
| `data/guildConfig.json` | 길드별 기능 설정 |
| `data/warnings.json` | 길드별 사용자 경고 |
| `data/streamAlerts.json` | 방송 알림 |
| `data/levels.json`, `data/voiceTime.json`, `data/claims.json` | 활동·출석 통계 |
| `data/presence.json` | 길드 온라인 인원 이력 |

이 파일은 Chiyumi 봇과 웹이 공유합니다. 필드명이나 중첩 구조를 바꿀 때는 봇 저장소의 읽기·쓰기 코드와 호환성을 함께 확인해야 합니다. 현재 웹 측 쓰기는 JSON 전체를 읽고 수정해 다시 올리는 방식이므로, 동시 쓰기나 스키마 마이그레이션에는 특히 주의합니다.

그 밖의 연동은 다음과 같습니다.

- Discord REST API: 사용자·길드·채널·역할 조회와 관리 동작
- Google Sheets API: 서비스 계정으로 관리자용 Sheet 읽기
- Cloudflare Turnstile: Discord 로그인 전 사람 확인
- Firebase Firestore/Realtime Database: Fehe 상태·버전 화면
- YouTube Data API와 iframe API: Fehe YouTube·음악 기능
- ipify: Fehe 상태 화면의 외부 연결 확인

Fehe의 Firebase 설정과 YouTube API 키는 현재 `src/member/fehe/firebase.js`, `YoutubePage.jsx`, `StatusPage.jsx`의 클라이언트 코드에 들어 있습니다. Firestore와 Realtime Database 인스턴스는 각각 `firestore.js`, `realtimeDatabase.js`에서 지연 로드될 수 있도록 분리되어 있습니다. 설정을 환경 변수로 옮길 경우 Vite의 `VITE_` 변수는 최종 번들에 노출된다는 점을 전제로 키 제한과 외부 서비스 설정까지 함께 변경해야 합니다.

## 7. 환경 변수 기준

아래 목록은 현재 소스 코드가 실제로 참조하는 이름을 기준으로 합니다. 값은 문서나 커밋에 기록하지 않습니다. 로컬 템플릿은 저장소 루트의 `.env.example`을 사용합니다.

| 변수 | 필수 범위 | 설명 |
| --- | --- | --- |
| `DISCORD_CLIENT_ID` | Discord 로그인 | OAuth 애플리케이션 ID |
| `DISCORD_CLIENT_SECRET` | Discord 로그인 | OAuth 클라이언트 비밀 값 |
| `DISCORD_TOKEN` | Chiyumi 관리 | 봇 REST API 토큰 |
| `SESSION_SECRET` | 로그인 세션 | JWT 서명 키 |
| `ADMIN_DISCORD_IDS` | 관리자 기능 | 쉼표로 구분한 초기 관리자 ID; 비어 있을 수 있음 |
| `VITE_TURNSTILE_SITE_KEY` | 로그인 UI | 브라우저에 포함되는 Turnstile 사이트 키 |
| `TURNSTILE_SECRET_KEY` | 로그인 API | 서버 검증용 Turnstile 비밀 키 |
| `SFTP_HOST` | Chiyumi 데이터 | SFTP 호스트 |
| `SFTP_PORT` | Chiyumi 데이터 | 포트; 없으면 22 |
| `SFTP_USER` | Chiyumi 데이터 | SFTP 사용자 |
| `SFTP_PASSWORD` | Chiyumi 데이터 | SFTP 비밀번호 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 관리자 Sheet | 서비스 계정 이메일 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | 관리자 Sheet | 줄바꿈을 `\\n`으로 저장할 수 있는 개인 키 |
| `GOOGLE_SHEET_ID` | 관리자 Sheet | 읽을 스프레드시트 ID |
| `PORT` | Express | 포트; 없으면 3000 |

`NODE_ENV`는 npm 스크립트가 관리합니다. 로컬 `.env`에 다른 이름이 있더라도 실제 사용 여부는 소스의 `process.env`와 `import.meta.env` 참조를 기준으로 확인합니다.

## 8. 빌드, 배포, SEO

`vercel.json`의 주요 동작은 다음과 같습니다.

- 프레임워크: Vite
- 빌드 결과: `dist/`
- 함수 리전: `icn1`
- `api/render.js`에 `dist/**` 포함
- 기본 보안 헤더 설정
- 실제 API 파일을 제외한 모든 경로를 `/api/render`로 rewrite

`api/render.js`는 빌드된 `index.html`을 프로세스 메모리에 캐시하고 `api/_lib/seoRender.js`를 통해 경로에 맞는 `<title>`, description, Open Graph, Twitter 메타를 치환합니다. 브라우저 렌더 후에는 `src/components/Seo/Seo.jsx`가 같은 `src/seoData.js`를 사용해 canonical URL과 `og:url`을 포함한 페이지 메타를 갱신합니다.

공개·색인 가능한 경로를 추가하거나 이름을 바꾸면 다음을 함께 검토합니다.

1. 해당 앱의 `<Route>`
2. 헤더·푸터 등 탐색 링크
3. `src/seoData.js`
4. `public/sitemap.xml`
5. 필요 시 `public/robots.txt`와 OG 이미지

## 9. 변경 위치 빠른 찾기

- FDT 공통 레이아웃: `src/App.jsx`, `src/components/Header`, `src/components/Footer`
- FDT SEO 기준 데이터: `src/seoData.js`
- Chiyumi 프런트 API 래퍼: `src/DiscordBot/Chiyumi/pages/adminApi.js`, `guildApi.js`
- Discord 인증·세션: `api/_lib/discordAuth.js`
- 관리자 권한: `api/_lib/adminAuth.js`, `api/_lib/admins.js`
- 길드 권한: `api/_lib/guildAuth.js`
- SFTP 접근 공통부: `api/_lib/sftpClient.js`
- 네트워크 진단 계산: `src/utility/NetworkTest/networkDiagnostics.js`
- Minecraft Java 문서: `src/wiki/Minecraft/javaWikiData.js`
- 배포 설정: `vercel.json`

## 10. 문서 유지 체크리스트

- 의존성·Node 버전·npm 스크립트가 바뀌면 `README.md`의 시작 방법과 명령어를 갱신합니다.
- 라우트·API resource가 바뀌면 이 문서의 표와 SEO 체크리스트를 갱신합니다.
- 새 환경 변수를 추가하면 값 없이 이름과 역할만 문서화합니다.
- SFTP 파일이나 스키마가 바뀌면 공유 데이터 표와 봇 저장소 호환성을 갱신합니다.
- 로고 파일을 교체하면 `src/assets/images/logo/README.md`와 실제 import를 함께 확인합니다.

## 11. 작업 완료 절차

모든 작업은 다음 순서를 완료해야 끝난 것으로 봅니다.

1. 변경된 코드와 실제 동작에 맞게 `README.md`, 이 가이드 및 관련 영역 문서를 최신화합니다.
2. 변경 범위에 맞는 검사와 기본 `npm run lint`, `npm run build`를 통과시킵니다.
3. 비밀 값과 생성물 등 의도하지 않은 파일이 포함되지 않았는지 Git diff를 검토합니다.
4. 변경 사항을 커밋하고 현재 브랜치에 설정된 GitHub upstream으로 push합니다.

GitHub push에 실패하면 작업이 원격에 반영됐다고 안내하지 말고, 실패 원인과 필요한 후속 조치를 명시합니다.
