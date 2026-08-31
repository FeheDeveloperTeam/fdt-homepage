# 무료 CDN 속도 측정 에셋

이 작은 Cloudflare Workers Static Assets 프로젝트는 네트워크 테스트의 다운로드 파일을 사용자와 가까운 Cloudflare 엣지에서 제공합니다. Vercel Serverless Function의 4.5MB 응답 제한과 단일 서버 경로 병목을 피하기 위한 보조 경로입니다.

## 최초 배포

1. Cloudflare 계정의 무료 Workers 플랜으로 로그인합니다.
2. 이 폴더에서 `npm run deploy`를 실행합니다. 처음 실행하면 Wrangler가 로그인을 안내합니다.
3. 배포 결과의 `https://<worker-name>.<subdomain>.workers.dev` 주소를 Vercel 환경 변수 `VITE_NETWORK_TEST_CDN_ORIGIN`에 입력합니다.
4. Vercel을 재배포합니다.

클라이언트는 CDN이 설정되면 25MiB의 무작위 바이너리 파일을 사용합니다. 워밍업은 전송량이 없는 `HEAD` 요청으로 수행하고, 본 측정은 최대 12회 응답으로 제한해 불필요한 데이터 사용을 막습니다. 파일 내용은 매 배포 때 새로 생성되고 저장소에는 커밋되지 않습니다.

Cloudflare의 정적 에셋 요청은 무료·무제한이지만, Workers 무료 플랜과 서비스 정책은 변경될 수 있으므로 사용량이 커지면 Cloudflare 대시보드에서 현재 한도를 확인합니다.
