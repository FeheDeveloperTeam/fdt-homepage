# FeheDeveloperTeam (FDT) Homepage

디스코드 봇 개발과 웹 개발을 중심으로 하는 프리랜서 개발팀 FeheDeveloperTeam(FDT)의 소개 홈페이지입니다.

## 스택

- React + Vite
- react-router-dom (클라이언트 라우팅)
- react-helmet-async (페이지별 SEO 메타 태그)
- Express (로컬 개발/운영 서버 하나로 프론트+백엔드 통합)

## 개발

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다. Express 서버가 개발 모드에서는 Vite를 미들웨어로 붙여 같은 포트에서 핫리로드까지 동작합니다.

## 빌드 / 운영 서버

```bash
npm run build
npm start
```

## 배포

Vercel 기준 정적 배포(`vercel.json` 참고)로 구성되어 있습니다.
