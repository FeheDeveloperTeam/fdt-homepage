# Repository Notes

- 작업 전 `docs/PROJECT_GUIDE.md`에서 현재 라우트, API, 데이터 흐름을 확인한다.
- 런타임은 Node.js 22.x이며 기본 검증 명령은 `npm run lint`와 `npm run build`다.
- 새 API 핸들러는 Vercel용 `api/` 파일과 로컬·독립 실행용 `server/index.js` 라우트를 함께 연결한다.
- 공개 라우트를 바꾸면 `src/seoData.js`와 `public/sitemap.xml`을 함께 검토한다.
- 서브앱 CSS는 `.fehe-app`, `.chiyumi-app`, `.nettest-app`, `.mcwiki-app` 스코프를 유지한다.
- `data/*.json` SFTP 스키마는 Chiyumi 봇과 공유되므로 일방적으로 바꾸지 않는다.
- 비밀 값과 `.env` 내용은 문서·로그·커밋에 남기지 않고, 한글 파일은 UTF-8로 유지한다.
- 모든 작업을 마치기 전에 코드와 실제 동작을 기준으로 `README.md`, `docs/PROJECT_GUIDE.md` 등 관련 문서를 반드시 최신화한다.
- 검증과 문서 최신화가 끝나면 변경 사항을 커밋하고 현재 브랜치의 설정된 GitHub upstream으로 반드시 push한다. push할 수 없으면 완료로 간주하지 말고 원인을 보고한다.
