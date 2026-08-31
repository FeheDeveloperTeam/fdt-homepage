# 개발 시작

## 요구 사항

- Node.js 22.x
- npm
- 선택 사항: Discord, SFTP, Google Sheets 기능을 확인하기 위한 로컬 `.env`

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. Express가 `/api`를 처리하고 Vite가 나머지 SPA 화면을 제공합니다.

## 주요 명령

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Express + Vite 개발 서버 실행 |
| `npm run build` | 프로덕션 Vite 번들 생성 |
| `npm start` | 생성된 `dist/`를 Express로 제공 |
| `npm run lint` | Oxlint 정적 검사 |

변경 후에는 최소한 아래 명령을 실행합니다.

```bash
npm run lint
npm run build
```

## 코드 구조

| 위치 | 책임 |
| --- | --- |
| `src/App.jsx` | 공개 라우트와 lazy-loaded 서브앱 연결 |
| `src/pages/`, `src/components/` | FDT 메인 사이트 |
| `src/member/` | Fehe, Yukiha 멤버 페이지 |
| `src/DiscordBot/Chiyumi/` | Discord 봇 소개, 길드·관리자 UI |
| `src/utility/NetworkTest/` | HTTP 왕복 시간과 다운로드 처리량 진단 |
| `src/wiki/Minecraft/` | Minecraft 위키 |
| `api/` | Vercel Serverless Function 및 Express 공용 API 핸들러 |
| `api/_lib/` | 인증, Discord, SFTP, Sheets, 검증 공통 코드 |
| `server/index.js` | 로컬 개발/독립 서버에서 API와 Vite 또는 `dist` 연결 |

## 작성 규칙

- 공개 라우트를 추가하거나 바꾸면 `src/seoData.js`, `public/sitemap.xml`, 관련 문서를 함께 갱신합니다.
- 서브앱 CSS는 각 루트 범위(`.fehe-app`, `.chiyumi-app`, `.nettest-app`, `.mcwiki-app`) 안에 둡니다. 전역 선택자로 다른 화면에 영향을 주지 않습니다.
- API 핸들러는 Vercel과 로컬 Express에서 모두 실행됩니다. Node 전용 동작, 응답 상태·헤더, 오류 처리를 두 환경에서 확인합니다.
- SFTP JSON은 봇과 공유하는 데이터 계약입니다. 스키마 변경 전 관련 `api/_lib/sftp*.js`와 봇 호환성을 확인합니다.
- 비밀 값과 실제 `.env` 파일은 커밋·문서·로그에 넣지 않습니다. 새 환경 변수는 `.env.example`과 [배포 문서](DEPLOYMENT.md)에 추가합니다.

## 작업 완료

문서 갱신 → 검증 → 별도 최종 재점검 → 커밋 → GitHub push 순서를 따릅니다. 자세한 기준은 [WORKFLOW.md](WORKFLOW.md)를 따릅니다.
