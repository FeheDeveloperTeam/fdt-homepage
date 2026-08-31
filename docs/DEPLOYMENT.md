# 배포와 환경 변수

## 기본 배포 구조

- 프런트엔드: Vite 빌드 결과 `dist/`
- API: Vercel Serverless Functions (`api/`)
- 프로덕션 리전: 서울 `icn1`
- HTML 렌더링: `api/render.js`가 SPA 경로의 SEO 메타데이터를 주입
- 네트워크 테스트 다운로드: 선택적으로 Cloudflare Workers Static Assets CDN

Vercel 설정은 `vercel.json`이 기준입니다. GitHub `main` push가 연결된 Vercel 프로젝트에 자동 배포되며, 환경 변수 변경 뒤에는 재배포가 필요합니다.

## 환경 변수

값 이름과 빈 예시는 `.env.example`이 기준입니다. 절대로 실제 값을 Git에 올리지 않습니다.

| 변수 | 필요한 기능 |
| --- | --- |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`, `SESSION_SECRET` | Discord OAuth 및 봇 API |
| `ADMIN_DISCORD_IDS` | 초기 루트 관리자 ID 목록 |
| `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile |
| `SFTP_HOST`, `SFTP_PORT`, `SFTP_USER`, `SFTP_PASSWORD` | Chiyumi 공유 데이터 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_SHEET_ID` | 관리자 Google Sheets 읽기 |
| `VITE_NETWORK_TEST_CDN_ORIGIN` | 네트워크 테스트용 Cloudflare CDN 원본 |
| `PORT` | 로컬 Express 포트, 기본값 3000 |

`VITE_` 접두사의 값은 브라우저 번들에 포함됩니다. 비밀 값을 넣지 않습니다.

## Cloudflare CDN 배포

네트워크 테스트는 Vercel Function의 응답 크기와 단일 경로 병목을 피하기 위해 Cloudflare의 25MiB 정적 테스트 에셋을 선택적으로 사용합니다.

```bash
cd cloudflare/network-test-cdn
npm run deploy
```

명령이 출력한 `https://<worker>.<subdomain>.workers.dev` 주소를 Vercel Production 환경 변수 `VITE_NETWORK_TEST_CDN_ORIGIN`으로 설정한 뒤 Vercel을 재배포합니다. 자세한 구성과 데이터 사용량 제한은 [CDN README](../cloudflare/network-test-cdn/README.md)를 따릅니다.

## 배포 전 확인

```bash
npm run lint
npm run build
```

그 후 변경 diff, 환경 변수 누락, 공개 라우트 SEO·sitemap, API 권한 검사, 외부 서비스 영향 여부를 별도로 재점검합니다.
