# 문제 해결

## 로컬에서 API가 동작하지 않음

- `npm run dev`를 사용했는지 확인합니다. Vite 단독 실행은 `api/` 핸들러를 제공하지 않습니다.
- 필요한 기능의 환경 변수를 `.env`에 넣고 서버를 재시작합니다.
- `PORT`가 다른 프로세스와 충돌하면 다른 포트로 지정합니다.

## Discord 로그인 또는 관리자 화면 오류

- Discord OAuth Redirect URI가 실제 배포 주소와 일치하는지 확인합니다.
- `SESSION_SECRET`, Discord Client ID/Secret, Bot Token이 Vercel과 로컬에 모두 설정됐는지 확인합니다.
- 관리자 접근은 `ADMIN_DISCORD_IDS` 또는 저장된 관리자 목록에 해당 Discord ID가 있어야 합니다.

## Chiyumi 데이터 저장 오류

- SFTP 접속 정보와 원격 파일 권한을 확인합니다.
- SFTP JSON 파일의 스키마를 임의로 변경하지 않았는지 확인합니다.
- Google Sheets 오류는 서비스 계정이 대상 시트에 읽기 권한을 받았는지 확인합니다.

## 네트워크 테스트 값이 Fast 등과 다름

- HTTP 왕복 시간은 ICMP ping과 다릅니다.
- Fast와 같은 서비스는 지역 CDN과 동적 병렬 연결로 회선의 최대 추정치를 계산합니다. 이 사이트는 Cloudflare CDN을 설정한 경우에도 동일 서비스와 서버·경로가 다르므로 값이 완전히 같을 수 없습니다.
- `VITE_NETWORK_TEST_CDN_ORIGIN`이 비어 있으면 Vercel API 경로로 측정하므로 더 낮게 나올 수 있습니다.
- CDN 주소를 바꾸거나 추가했다면 Vercel 재배포가 필요합니다.

## Vercel 배포 후 변경이 보이지 않음

- 배포가 성공했는지 Vercel Deployment 로그를 확인합니다.
- `VITE_` 환경 변수 변경 후 새 배포가 만들어졌는지 확인합니다.
- 정적 에셋과 브라우저 캐시를 무시하고 새로고침한 뒤 다시 확인합니다.
