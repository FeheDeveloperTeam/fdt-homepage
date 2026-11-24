# FeheDeveloperTeam Homepage

개발·API·배포·문제 해결 문서는 [docs/README.md](docs/README.md)에서 확인합니다.

FeheDeveloperTeam(FDT)의 공식 웹사이트이자 팀에서 운영하는 여러 웹 기능을 한곳에 모은 React 프로젝트입니다. FDT 소개 페이지뿐 아니라 팀원 페이지, Discord 봇 Chiyumi의 소개·관리 화면, 네트워크 진단 도구, 수능 카운트다운, Minecraft 위키를 함께 제공합니다.

운영 주소: [https://www.fehe.dev](https://www.fehe.dev)

## 주요 구성

- FDT: 팀 소개, 서비스, 프로젝트, 문의
- 멤버: Fehe 개인 페이지와 Yukiha 자기소개·NATSUMI 프로젝트 페이지
- Chiyumi: 봇 소개, Discord 로그인, 관리자·서버별 설정 화면, 유료 서버별 봇 프로필 꾸미기(이용권은 연동된 Google Sheet에 운영자가 적음)
- 유틸리티: IP·지연 시간·다운로드 속도를 확인하는 네트워크 테스트, 한국 시간 기준 수능 D-Day 타이머(실전 타이머·교실 화면·배경화면·공부 백색소음·테마 색 설정 포함)
- 위키: Minecraft Java 문서와 Bedrock 준비 페이지

프런트엔드는 React 19, React Router 7, Vite 8(8.3.8 이상)을 사용합니다. API는 Vercel Serverless Functions로 배포하며, 로컬 개발과 독립 실행 환경에서는 Express가 같은 핸들러를 사용합니다.

## 시작하기

### 요구 사항

- Node.js 22.x
- npm

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. 공개 화면은 별도 자격 증명 없이 확인할 수 있지만 Discord 로그인, Chiyumi 관리 기능, Google Sheets 및 SFTP 연동 기능에는 해당 환경 변수가 필요합니다.

개발 서버는 이 컴퓨터(`127.0.0.1`)에서만 열립니다. 모든 네트워크(`0.0.0.0`)에 열면 외부에서 Vite 개발 서버 취약점으로 이 PC의 명령을 실행하는 공격이 실제로 들어오기 때문에, 개발 모드는 `127.0.0.1`에 묶고 Vite는 취약점이 고쳐진 8.3.8 이상을 씁니다. 같은 와이파이의 휴대폰 등으로 꼭 봐야 할 때만 `HOST=0.0.0.0`을 직접 주고, 확인이 끝나면 바로 끕니다. 개발 서버를 백그라운드로 켰다면 끌 때 `node server/index.js` 자식 프로세스까지 함께 꺼졌는지 3000번 포트로 확인합니다. 커밋 전에는 `git diff index.html`로 모르는 외부 스크립트가 끼어 있지 않은지 봅니다.

### 명령어

| 명령어 | 용도 |
| --- | --- |
| `npm run dev` | `.env`가 있으면 읽고 Express + Vite 개발 서버 실행 |
| `npm run build` | Vite 프로덕션 번들을 `dist/`에 생성 |
| `npm start` | 빌드된 `dist/`를 Express 프로덕션 모드로 제공 |
| `npm run lint` | Oxlint 정적 검사 실행 |

`npm start` 전에 `npm run build`가 필요합니다.

## 환경 변수

비밀 값은 커밋하지 마세요. 필요한 기능을 사용할 때 [`.env.example`](.env.example)을 `.env`로 복사해 값을 채우면 됩니다. `.env`와 `.env.local`은 Git에서 제외되어 있습니다.

| 기능 | 변수 |
| --- | --- |
| Discord OAuth·봇 API | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`, `SESSION_SECRET` |
| 초기 관리자 | `ADMIN_DISCORD_IDS` (쉼표로 구분, 선택 사항) |
| Cloudflare Turnstile | `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Chiyumi 데이터 SFTP | `SFTP_HOST`, `SFTP_PORT` (기본값 `22`), `SFTP_USER`, `SFTP_PASSWORD` |
| Google Sheets 읽기·쓰기(관리자 화면은 읽기, 유료 봇 프로필은 「유료이용권」·「봇프로필」 탭 쓰기) | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_SHEET_ID` |
| 로컬 서버 포트 | `PORT` (기본값 `3000`, 선택 사항) |

필요한 값과 외부 서비스 설정은 저장소 관리자에게 받아 로컬 `.env`와 Vercel 프로젝트 환경 변수에 각각 등록해야 합니다.

## 배포 구조

Vercel은 `npm run build`로 `dist/`를 생성하고 서울 리전(`icn1`)에서 API 함수를 실행합니다. 실제 `/api/**` 요청은 `api/`의 서버리스 핸들러가 처리하며, 그 밖의 경로는 `api/render.js`가 `dist/index.html`을 읽어 경로별 SEO 메타데이터를 주입한 뒤 SPA 셸을 반환합니다.

독립 실행이 필요하면 다음 순서로 실행합니다.

```bash
npm run build
npm start
```

## 개발 문서

라우트, 디렉터리 역할, API·인증·데이터 흐름, 변경 시 주의점은 [프로젝트 가이드](docs/PROJECT_GUIDE.md)에 정리되어 있습니다. 다음 세션에서 작업을 시작할 때 이 문서를 먼저 확인하세요.
