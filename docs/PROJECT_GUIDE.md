# FDT Homepage 프로젝트 가이드

이 문서는 새 작업 세션에서 저장소의 구조와 결합 지점을 빠르게 파악하기 위한 기준 문서입니다. 코드 구조가 바뀌면 관련 절을 함께 갱신합니다.

## 1. 프로젝트 한눈에 보기

이 저장소는 `www.fehe.dev`에서 제공하는 여러 화면을 하나의 Vite/React SPA로 묶고, 필요한 백엔드 기능을 같은 저장소의 Node.js 핸들러로 제공합니다.

| 영역 | 역할 | 진입 코드 |
| --- | --- | --- |
| FDT 메인 | 팀·서비스·프로젝트·문의 소개 | `src/App.jsx`, `src/pages/`, `src/components/` |
| Fehe | 개인 소개, YouTube, 상태, 숨김·미리보기 화면 | `src/member/fehe/FeheApp.jsx` |
| Yukiha | 자기소개, NATSUMI, 기술 스택, 개발 분야, GitHub 활동과 링크 | `src/member/yukiha/YukihaApp.jsx` |
| Chiyumi | Discord 봇 소개, 관리자 도구, 길드 설정 | `src/DiscordBot/Chiyumi/ChiyumiApp.jsx` |
| 네트워크 테스트 | IP, 왕복 지연, 다운로드 처리량 진단 | `src/utility/NetworkTest/NetworkTestApp.jsx` |
| 수능 카운트다운 | 한국 시간 기준 수능 D-day, 앞으로 10년·원하는 학년도의 수능 날짜, 시험 당일 시간표 | `src/utility/Suneung/SuneungApp.jsx` |
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
| `/status` | fehe.dev 주요 경로 응답 시간 실시간 확인 |
| `/privacy` | 사이트 전체 개인정보 처리방침(접속 기록·방문 통계·브라우저 저장소·Google AdSense 광고 쿠키 안내). FDT 푸터와 수능 타이머 푸터에서 링크 |
| `/member/yukiha` | Yukiha 자기소개·NATSUMI 프로젝트 페이지 |
| `/member/fehe` | Fehe 홈 |
| `/member/fehe/youtube` | YouTube 콘텐츠 |
| `/member/fehe/secret` | 숨김 페이지 |
| `/member/fehe/status` | 외부 서비스 상태 확인 |
| `/member/fehe/live-preview` | 라이브 UI 미리보기 |
| `/fehe/*` | 같은 하위 경로의 `/member/fehe/*`로 리다이렉트하는 구형 URL |

`/status`는 `src/pages/Status/`가 담당합니다. `statusMonitor.js`의 `TARGETS`에 정의한 세 경로(문서 `/`, 정적 파일 `/robots.txt`, API `/api/network-test?type=ping`)를 5초마다 요청해 응답 시간과 성공 여부를 최근 36개까지 모읍니다. 세 경로는 배포 상 서로 다른 계층(렌더 함수 · 정적 전송 · Node 핸들러)을 지나므로 어디가 느린지 구분할 수 있습니다. 측정은 방문자 브라우저에서 이뤄져 회선 상태가 함께 반영되며, 서버 측 가동률 통계가 아니라는 점을 화면에도 밝혀 둡니다. 탭이 가려지거나 사용자가 자동 확인을 끄면 요청을 멈춥니다.

Yukiha 페이지는 Fehe와 같이 FDT 메인 레이아웃(`MainLayout`의 공통 Header/Footer) 바깥에서 렌더링되는 분리 페이지입니다. `src/member/yukiha/YukihaApp.jsx`가 셸이 되어 자체 Header/Footer를 붙이고 `lazy`/`Suspense`로 분할됩니다. 다만 Fehe와 달리 자체 디자인 시스템을 두지 않고 FDT의 토큰(`src/styles/variables.css`)과 전역 리셋(`src/index.css`)을 그대로 쓰므로, `.fehe-app` 계열 예외 목록에는 `.yukiha-app`을 넣지 않습니다.

내용은 [yukiha7777/yukiha7777의 README](https://github.com/yukiha7777/yukiha7777)를 기준으로 소개 문구, 목록, 코드 블록, 배너·아바타·배지·통계 이미지와 링크 전체를 정적 JSX로 옮긴 화면입니다. 원본이 변경되면 `src/member/yukiha/YukihaPage.jsx`도 함께 갱신합니다. 개발 분야는 데스크톱 2열, 모바일 1열로 표시하며 스타일은 CSS Module에 한정합니다. 이미지는 원본 외부 서비스에서 불러오므로 서비스 상태에 따라 표시되지 않을 수 있습니다. 기존 `noindex` 정책과 사이트맵 제외 상태는 유지합니다.

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
| `/terms/en`, `/privacy/en` | 약관·개인정보 처리방침 영어판(`TermsPageEn.jsx`, `PrivacyPageEn.jsx`). Riot 심사 등 해외 검토용 번역이며 내용이 다르면 한국어판이 우선한다고 밝힌다. 두 언어판 위쪽의 `DocLangSwitch`로 서로 오가고, 한국어판을 고치면 영어판도 같은 내용·날짜로 함께 고친다 |
| `/valorant` | 발로란트 전적검색 시연(Riot VALORANT Production 키 심사용, 영어 위주). 심사 담당자는 디스코드에 들어올 수 없어 봇 메시지(`Chiyumi/src/utils/valorantStats.js`·`statsUi.js`)를 같은 문구·배치로 다시 그리고, 승인 후 바꿀 RSO 계정 연결 흐름을 설명한다. 예시 이름은 가상. 봇 화면이 바뀌면 함께 고친다 |

서버 대시보드(`GuildLayout`)는 사이드바·메뉴·목록·안내 문구에 관리자 대시보드와 같은 `admin-` 클래스를 빌려 씁니다. 그 스타일은 관리자 쪽 파일(`AdminLayout.css`, `AdminManagePage.css`, `components/AdminCharts/AdminCharts.css`)에 들어 있고 두 레이아웃 모두 지연 로딩되므로, `GuildLayout.jsx`와 `ServersPage.jsx`가 필요한 파일을 **직접 import**합니다(관리자 쪽 파일은 수정하지 않고 읽기만 함). 이걸 빠뜨리면 관리자 화면을 먼저 열지 않고 내 서버로 바로 들어왔을 때 사이드바 없이 메뉴가 한 줄로 붙어 나오는 등 화면이 깨집니다. 서버 대시보드 전용 모바일 보정은 `GuildLayout.css`의 `.guild-shell`에만 둡니다.

관리자 화면은 애플리케이션 권한 검사와 별도로 배포 환경의 국가 헤더가 존재할 때 한국(`KR`) 이외의 요청을 차단합니다.

### 유틸리티와 위키

| 경로 | 화면 |
| --- | --- |
| `/utility/network-test` | 네트워크 진단 |
| `/utility/suneung` | 수능 카운트다운 (`?year=<학년도>`로 볼 수능 지정, 없으면 가장 가까운 수능) |
| `/wiki/minecraft` | 위키 홈 |
| `/wiki/minecraft/java` | Java 문서 목록 |
| `/wiki/minecraft/java/:slug` | Java 문서 상세 |
| `/wiki/minecraft/bedrock` | Bedrock 준비 페이지 |

수능 카운트다운은 `src/utility/Suneung/`이 담당하는 분리 페이지(자체 Header/Footer, `.suneung-app` 스코프)이며 백엔드 없이 브라우저에서만 계산합니다.

- 날짜 데이터와 계산은 `suneungDates.js` 한 곳에 있습니다. `CONFIRMED`는 교육부가 발표한 시행일(키는 학년도, 시험은 그 전해 11월)과 성적 통지일·시간표·비고이고, 없는 학년도는 `estimateExamDate`가 「11월 13~19일 사이 목요일」 규칙(2016년 시행부터 처음 계획된 시행일이 모두 이 범위)으로 계산해 「예상」으로 표시합니다. 새 학년도 시행일이 발표되면 `CONFIRMED`에 한 줄을 추가합니다. 2026-11-18 기준 확정은 2027학년도(2026-11-19, 성적 12-11)와 2028학년도(2027-11-18, 성적 12-10, 첫 통합형)이고, 교시별 시간표는 2027학년도만 발표돼 있습니다.
- 모든 시각은 기기 시간대와 관계없이 KST(UTC+9 고정)로 계산합니다. 카운트다운 기준은 1교시 시작 08:40, 시험 당일은 마지막 교시 종료 17:45까지 진행 중으로 보고 지금 교시를 강조합니다. 종료 후에도 그날 자정까지는 「수고하셨습니다」를 기본 화면으로 둡니다.
- `useKstClock.js`의 `useClockOffset`이 `/robots.txt`에 HEAD 요청을 보내 응답 `Date` 헤더로 기기 시계 오차를 재고, 1.5초를 넘으면 그만큼 보정합니다. 실패하면 기기 시계를 씁니다.
- 화면 순서: 페이지 제목(h1 「수능 D-Day 타이머」) → 카운트다운 수험표 + 오른쪽 패널(`SidePanel`: 숫자로 보는 남은 시간·도구) → 수능 실전 타이머 → 공부 백색소음 → 시험 당일 시간표 | 10년 목록 → 수능 응원 문구 → 더 먼 수능 찾기 | 자주 묻는 질문 → 날짜 기준 안내. 1100px 이상에서는 `|`로 표시한 두 부분이 좌우 두 칸(5:7)으로, 수험표와 오른쪽 패널이 나란히 놓입니다(본문 최대 1200px). 그보다 좁으면 위아래로 쌓입니다.
- 숫자로 보는 남은 시간(`SidePanel`): 위쪽은 매초 바뀌는 실시간 카운터(남은 시간·분·초, 라벨 왼쪽·숫자 오른쪽의 한 줄씩이라 자릿수가 많아도 크게 보임), 아래쪽은 남은 날·주말·평일 세 칸입니다. 숫자가 바뀌면 카운트다운 칸과 같은 `components/RollingNumber`로 바뀐 자리만 굴러 내려오고, 0에서 올라가는 효과는 크게 바뀔 때(처음 보일 때·다른 학년도를 고를 때)만 씁니다(`useCountUp`의 `minJump`). 1씩 바뀌는 작은 변화는 같은 렌더에서 바로 반영해 굴림 숫자가 다시 마운트되지 않게 하고(그래서 남은 초는 끝자리만 굴러감), 올라가는 도중 실시간 값이 바뀌면 애니메이션을 끊지 않고 새 값으로 이어 갑니다. 같은 줄 칸은 가장 긴 숫자에 맞춰 크기를 같게 합니다(`--chars`).
- 시계와 선택 상태: `SuneungApp`이 1초 시계(`useKstClock.js`)를 한 번만 돌려 `suneungState.js`의 `ClockContext`로 내려 주고, 페이지와 푸터가 `useSelectedExam(now)`로 같은 수능(주소의 `?year=`)을 고릅니다. 헤더와 OMR 장식은 `memo`라 매초 다시 그리지 않습니다.
- 따라오는 헤더·푸터: 둘 다 `position: sticky`입니다. 서브앱 루트는 가로 넘침을 `overflow-x: clip`으로 막습니다 — `hidden`으로 바꾸면 루트가 스크롤 컨테이너가 되어 sticky가 화면에 붙지 않습니다. 푸터(`components/Footer/`)는 760px보다 넓으면 실시간 「○○학년도 수능 D-1 21:32:41」 + 저작권 바, 760px 이하에서는 앱 같은 하단 탭 바(D-Day·실전·소리·시간표·날짜·응원, `IntersectionObserver`로 지금 보는 섹션 표시, 안전 영역 여백 포함)가 되고 저작권 줄은 문서 끝 흐름으로 내려갑니다. 백색소음이 나는 동안 넓은 화면 푸터에는 「백색소음 n개 재생 중」과 정지 버튼, 탭 바의 소리 탭에는 작은 점이 보입니다.
- 모바일 전용 화면(760px 이하): 헤더는 아래로 스크롤하면 숨고 위로 올리면 나타남, 오른쪽 패널 도구는 2×2 큰 버튼, 실전 타이머 영역은 옆으로 넘기는 칩과 손가락 크기 버튼, 응원 문구 30개는 옆으로 넘기는 카드(접기 버튼 없음), 배경화면 만들기는 아래에서 올라오는 시트(600px 이하).
- 로고: OMR 답안지 마킹 칸이 시계처럼 4분의 3까지 찬 모양(`components/Logo/Logo.jsx`, 같은 그림의 `public/suneung-icon.svg`). 서브앱에 들어오면 `SuneungApp`이 탭 아이콘 링크의 `href`와 `type`(`image/svg+xml`)을 함께 바꾸고 나갈 때 되돌립니다. 공유 이미지는 `public/og-suneung.png`(1200×630, 연도 없음)이고 `SEO_DATA`의 이 경로 항목에 연결돼 있습니다.
- 수능 실전 타이머(`components/PracticeTimer/`, `#practice`): 칠판 모양. 영역(국어 80·수학 100·영어 70·한국사 30·탐구 한 과목 30·제2외국어/한문 40분, 직접 설정 1~300분)을 고르면 실제 시험 시간으로 카운트다운하고, 「실제 수능이라면 지금」 칸에 그 영역의 실제 시작 시각(2027학년도 시간표)에 지난 시간을 더한 벽시계 시각을 보여 줍니다. 시작·종료 10분 전·5분 전·종료 때 `bell.js`가 Web Audio로 합성한 종소리를 냅니다(음원 파일 없음, 버튼을 누른 뒤에만 소리 가능). 이 알림은 연습용이며 실제 수능 타종 규정을 뜻하지 않습니다. 칠판만 전체 화면으로 띄울 수 있습니다.
- 화면 설정(`theme.js`, `components/ThemeSettings/`): 헤더 오른쪽 팔레트 버튼에서 화면 밝기(기기 설정·밝게·어둡게)와 강조색 8가지(OMR 빨강·사인펜 파랑·칠판 초록·청록·보라·분홍·귤 주황·먹색)를 고릅니다. 값은 브라우저 `localStorage`의 `suneung-theme`에만 저장합니다. `SuneungApp`이 앱 루트에 `data-mode`와 `--accent-light`/`--accent-dark`를 붙이고, `styles/variables.css`가 모드에 맞는 쪽을 `--accent`로, `--accent-soft`/`--accent-line`은 `color-mix`로 만듭니다. 강조색은 밝은·어두운 바탕 모두 4.5:1 이상입니다. 새 색은 `ACCENTS`에 밝은/어두운 값 한 쌍으로 추가합니다. 교실 화면과 배경화면도 고른 강조색을 씁니다.
- 공부 백색소음·ASMR(`components/Ambient/`, `ambient/`, `#sound`): 기본 소음(백색·핑크·브라운 노이즈)은 원래 계산으로 만드는 소리라 `ambient/ambientEngine.js`가 브라우저에서 만들고(8초 스테레오 버퍼 반복, 두 단 저역 통과와 3.2kHz high-shelf -9dB로 「치지직」 성분 제거), 빗소리·파도·장작·여름밤 귀뚜라미·교실 필기 소리·선풍기 바람·시계 초침은 실제 녹음을 반복합니다. 녹음은 Freesound에 CC0(퍼블릭 도메인)로 공개된 것만 쓰고(유튜브 등 저작권이 있는 음원은 쓰지 않음), 출처는 `ambient/sounds.js`의 `credit`과 화면의 「소리 출처」에 있습니다. 파일은 `public/sounds/*.mp3`(96kbps 스테레오)로, 원본에서 갑자기 튀는 소리가 가장 적은 구간을 골라 2초 더 길게 잘라 두고 2-pass loudnorm(선형)으로 -20 LUFS에 맞췄습니다(11kHz 위는 깎고, 원본이 작아 크게 키운 장작·교실·시계는 afftdn으로 바탕 잡음을 줄임). 구간마다 크기 차이가 큰 녹음(예: 조용하다가 갑자기 커지는 교실 녹음)은 반복용으로 맞지 않아 고르지 않습니다. 브라우저는 처음 켤 때만 내려받아 끝 2초를 처음과 equal-power로 겹쳐 이음매 없이 반복하고, 매번 다른 위치부터 시작합니다. 시계는 겹치면 똑딱이 두 번 들려서 똑딱 직전의 조용한 순간에서 잘라 두고 겹치지 않습니다(`fade: 0`). 여러 소리를 함께 틀고 소리마다·전체 크기를 따로 맞추며(소리 50·전체 70 기본), 켜고 끌 때 약 2초 페이드, 묶음 5개(`PRESETS`)와 끄기 타이머(25·50·80·100분, 소리가 나는 동안만 셈)가 있습니다. 내려받는 동안 카드는 「불러오는 중」으로 보입니다. 상태는 `ambient/useAmbient.js`가 `AmbientContext`로 페이지와 푸터에 나눠 주고, 크기만 `localStorage`의 `suneung-ambient`에 저장합니다(재생 여부는 저장하지 않음). 마지막 리미터 덕분에 여러 소리를 겹쳐도 찢어지지 않고, 분석기 값으로 「지금 듣는 소리」 막대를 그립니다. 서브앱을 떠나면 모두 끕니다. 녹음을 바꿀 때는 원본 라이선스(CC0)를 소리 페이지에서 확인하고, 같은 방식으로 잘라 크기를 맞춘 뒤 헤드리스 브라우저에서 분석기로 RMS를 재서 `gain`을 다른 소리와 맞춥니다.
- 교실 화면 모드(`components/ClassroomMode/`): `<dialog>`를 전체 화면으로 띄워 큰 D-Day·남은 시간·현재 시각과 12초마다 바뀌는 응원 문구를 보여 줍니다. 테마와 상관없이 어두운 바탕입니다.
- D-Day 배경화면(`components/WallpaperMaker/`): 캔버스로 휴대폰(1080×1920)·PC(1920×1080), 밝게·어둡게(처음에는 지금 화면 밝기), 응원 문구를 골라 PNG로 저장합니다. 브라우저 안에서만 그리고 서버로 보내지 않습니다. 강조색은 화면 설정에서 고른 색을 씁니다. 그림 배치는 `drawWallpaper.js`에 있습니다.
- 애니메이션: 수험표 등장·붉은 띠 그리기·빛 지나감, D-Day 숫자가 조금 큰 수에서 줄어드는 카운트다운(0을 거치지 않게), 바뀐 숫자 자리만 굴러 내려오는 칸, 진행 막대 채우기, 섹션 스크롤 등장(`useMotion.js`의 `useReveal`, `[data-reveal]`), 1640px 이상 화면 양옆의 OMR 답안지가 차례로 마킹되는 장식(`components/OmrMargins/`)이 있습니다. 모두 `prefers-reduced-motion: reduce`에서 꺼지고, 탭이 가려져 있으면 숫자는 바로 최종값을 보여 줍니다. `data-reveal`은 React가 `className`을 바꾸지 않는 요소에만 붙입니다(바꾸면 `is-revealed`가 지워짐).
- 수능 응원 문구 30개는 `components/CheerSection/cheerMessages.js`에 있습니다. 「오늘의 응원」은 한국 날짜마다 다음 문구로 넘어가고, 이전·다음 버튼과 쪽지 목록으로 고르며 복사 버튼으로 클립보드에 담습니다. 목록은 처음 9개만 펼치고 나머지는 「모두 보기」로 엽니다(30개 모두 DOM에 있어 검색에 잡힘). 특정 D-day를 가정하지 않는 문장으로 씁니다.
- 검색 노출: 노출이 많은 검색어(수능 디데이·수능 D-Day·수능 타이머·수능 카운트다운·「2027 수능」처럼 연도가 붙은 검색어·수능 시간표·수능 응원 문구)를 제목·설명·본문 제목에 자연스럽게 넣습니다. 문장은 `suneungSeo.js` 한 곳에서 만들고, `src/seoData.js`의 이 경로 항목은 getter라 서버 렌더도 요청 시점의 가장 가까운 수능 연도로 제목·설명을 씁니다(수능이 끝나면 다음 해로 자동 전환). 화면에는 연도별 질문이 들어간 FAQ(`components/Faq/`)를 「더 먼 수능 찾기」와 나란히 두고(넓은 화면에서 `.sn-grid--paired`의 subgrid로 두 칸의 제목 줄·본문 시작선을 맞춤), 같은 내용을 `FAQPage`와 `WebApplication` 구조화 데이터(JSON-LD, Helmet)로 넣습니다. 브라우저 탭 제목은 「수능 D-1 타이머 · 2027 수능 디데이」처럼 남은 날을 보여 줍니다.
- 목록은 올해부터 10년 뒤 해까지 치르는 수능이고, 「더 먼 수능 찾기」는 학년도 또는 출생연도(학년도 − 19, 제때 입학 기준)로 올해 + 100학년도까지 고를 수 있습니다. 학년은 3월에 바뀌는 것으로 계산합니다.

Java 문서 데이터와 상세 SEO 항목은 `src/wiki/Minecraft/javaWikiData.js`와 `src/seoData.js`에서 연결됩니다.

## 4. 스타일 구조

FDT 메인은 CSS Modules를 주로 사용하고 공통 토큰은 `src/styles/variables.css`, 전역 리셋과 공통 동작은 `src/index.css`에 둡니다.

`--color-status-ok` · `--color-status-warning` · `--color-status-critical`은 상태 표시 전용입니다. 계열(series) 색으로 재사용하지 않고, 색만으로 뜻을 전달하지 않도록 항상 글자 라벨과 함께 씁니다. 어두운 표면 기준 대비 3:1 이상, 정상 시야 인접 구분 ΔE 18.2를 확인한 값입니다.

Fehe, Chiyumi, 네트워크 테스트, 수능 카운트다운, Minecraft 위키는 서로 다른 디자인 시스템입니다. 각 서브앱의 `index.css`와 `styles/variables.css`가 `.fehe-app`, `.chiyumi-app`, `.nettest-app`, `.suneung-app`, `.mcwiki-app` 루트 아래에서 `@scope`로 리셋과 토큰을 제한합니다. 서브앱 스타일을 수정할 때 이 경계를 벗어나는 전역 선택자를 추가하지 않아야 다른 영역과 충돌하지 않습니다.

반응형 변경에는 기존 미디어 쿼리와 `prefers-reduced-motion` 처리를 유지하고, 재사용 값은 해당 영역의 변수 파일에 먼저 추가합니다.

Fehe의 배경 화면은 `src/member/fehe/components/BgDeco/`가 그리는 밤의 설산입니다. 하늘 그라데이션 · 달무리 · 산맥 SVG(원경/중경/근경 3겹) · 능선 안개 · 눈보라 `canvas` · 비네트 순서로 쌓이며, 화면 전체를 덮는 고정 레이어(`z-index: 0`)라 본문은 `z-index: 1` 이상에 둡니다. 눈보라는 입자 수가 많아 DOM 대신 canvas로 그리고, 주기가 다른 사인파를 겹쳐 돌풍처럼 세기를 바꿉니다. 세로로 긴 화면에서는 `slice`가 산맥을 크게 잘라내므로 `max-aspect-ratio: 8 / 5`에서 산맥 SVG를 아래에 붙이고 높이를 폭에 맞춥니다.

`/member/fehe`에 들어오면 `src/member/fehe/components/IntroSplash/`가 인트로를 띄웁니다. 눈보라가 몰아치다(`storm`) 걷히면서 뒤로 밤의 설산이 흐릿하고 가까운 데서 제자리로 맑게 드러나고(`reveal`), 영화 첫 장면처럼 왼쪽 아래에 작은 제목(「페헤의 공간」 / 자간이 모이며 맑아지는 「FEHE」 / 「개발자 · 커뮤니티 빌더」)과 「들어가기」 버튼이 뜹니다. 자동으로 닫히지 않고 버튼을 누르면 `clear`로 바뀌어 인트로만 서서히 사라진 뒤 언마운트됩니다. 인트로의 설산은 배경(`BgDeco`)에서 꺼낸 `Scenery` 컴포넌트를 그대로 써서 페이지 배경과 같은 그림이므로, 사라지는 동안 산은 제자리에 있고 페이지가 그 위로 떠오르듯 이어집니다. 그래서 사라질 때는 크기를 바꾸지 않고 투명도만 바꾸며, 같은 산맥 SVG가 두 번 그려지므로 그라데이션 id는 `idPrefix`로 구분합니다. 제목이 놓이는 왼쪽 아래만 `.intro-shade`로 어둡게 눌러 산 위에서도 글자가 읽히게 합니다.

인트로를 띄우는 조건은 `shouldPlayIntro`가 정합니다. 첫 방문·링크·주소 입력, 그리고 메인 사이트 등 다른 페이지에서 클라이언트 라우팅으로 넘어온 경우에는 띄웁니다. 클라이언트 이동인지는 지금 위치 key가 **문서를 처음 불러올 때의 key**(`src/initialLocation.js`의 `INITIAL_LOCATION_KEY`, `main.jsx`에서 라우터보다 먼저 기록)와 다른지로 판단합니다. key가 `'default'`인지로 판단하면 안 됩니다 — React Router는 key를 `history.state`에 저장하고 새로고침해도 남겨 두므로, 링크로 들어온 페이지에서 F5를 누르면 클라이언트 이동으로 오인해 인트로가 다시 뜹니다. 문서를 새로고침한 경우에는 **강력 새로고침(Ctrl+F5, Ctrl+Shift+R)일 때만** 띄우고 일반 새로고침(F5)에서는 띄우지 않습니다. 브라우저 JS로는 둘을 구분할 수 없어서, 서버가 문서 요청 헤더(강력 새로고침은 `Pragma: no-cache`/`Cache-Control: no-cache`, 일반 새로고침은 `Cache-Control: max-age=0`)를 보고 `<meta name="fdt-reload" content="hard">`를 붙여 주고 인트로가 그 표시를 읽습니다. 판별은 `api/_lib/reloadHint.js` 한 곳에 있고 `api/render.js`, `server/index.js`(운영·개발 모드 모두)가 함께 씁니다. 표시가 붙은 응답이 캐시돼 일반 새로고침 때 재사용되지 않도록 페헤 문서에는 `Cache-Control: private, no-cache`를 붙입니다. 모바일 브라우저처럼 강력 새로고침이 없는 환경에서는 새로고침 시 인트로가 나오지 않으며, 개발자 도구의 「Disable cache」를 켜 두면 모든 새로고침이 강력 새로고침으로 취급됩니다. `prefers-reduced-motion: reduce`에서는 아예 렌더링하지 않아 곧바로 페이지가 보입니다.

접근성: 인트로는 `role="dialog"`·`aria-modal`인 대화상자이고 이름은 「페헤의 공간」, 설명은 화면에 보이지 않는 안내 문장(`#intro-hint`)입니다. 장식용 큰 글자 「FEHE」는 스크린리더가 알파벳을 하나씩 읽지 않도록 `aria-hidden`으로 감춥니다. 떠 있는 동안 뒤의 페이지 형제 요소는 모두 `inert`로 막고(지연 로딩으로 나중에 붙는 요소도 `MutationObserver`로 막음), 열리면 포커스가 대화상자로, 들어가기 버튼이 나타나면 버튼으로 옮겨집니다. 버튼은 보이는 시점에만 렌더링해 투명한 버튼이 미리 포커스·클릭되지 않게 합니다. Enter·Space는 버튼이 직접 처리하고, 버튼이 나오기 전에도 ESC로 건너뛸 수 있습니다. 닫히면 `inert`와 스크롤 잠금을 풀고 포커스를 페이지 첫 제목(`tabindex="-1"`, 테두리 없음)으로 옮깁니다.

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
| `/api/supabase-keepalive` | GET | Vercel Cron이 하루 한 번 불러 Supabase 일시정지를 막음(읽기 전용). 별도 함수가 아니라 `/api/network-test?type=supabase-keepalive`로 rewrite됨 |
| `/api/render` | GET | Vercel의 SPA HTML·SEO 렌더 진입점 |

**함수 개수 제한**: Vercel Hobby 플랜은 배포 하나에 서버리스 함수를 12개까지만 허용하고, `api/` 아래에서 `_lib/`을 뺀 `.js` 파일 하나가 함수 하나입니다. 현재 정확히 12개(`render`, `network-test`, `guild`, `auth/*` 4개, `admin/*` 5개)라서 새 파일을 추가하면 배포가 실패합니다(2026-11-06에 `api/supabase-keepalive.js`를 추가했다가 실제로 실패). 새 API는 로직을 `api/_lib/`에 두고 기존 함수에서 분기하거나, `vercel.json` rewrite로 기존 함수에 연결합니다.

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
| `data/guildConfig.json` | 길드별 기능 설정 (봇 전용 `aiChannelIds`: `/유미채널설정`으로 지정한 AI 대화 허용 채널 ID 배열, `levelUpEnabled`: `/레벨업알림설정`의 알림 켜짐 여부(없으면 `levelUpChannelId`·`levelUpMessage`가 있을 때 켜짐으로 봄). 웹은 둘 다 읽지 않지만 `patchGuild`가 기존 키를 보존하므로 덮어쓰지 않음) |
| `data/warnings.json` | 길드별 사용자 경고 |
| `data/streamAlerts.json` | 방송 알림 (봇 전용 키 `offlineChecks`: 방송 종료 확인 횟수, `uploadWaits`: 공개 대기·읽기 실패 영상 ID별 재확인 횟수. 웹 `updateAlert`는 `Object.assign`이라 보존됨. 유튜브는 라이브·업로드 모두 UC 채널 ID로 저장). 보낸 알림 기록은 봇 전용 `data/streamAlertSent.json`에 따로 두며 웹은 건드리지 않음 |
| `data/levels.json`, `data/voiceTime.json`, `data/claims.json` | 활동·출석 통계 |
| `data/presence.json` | 길드 온라인 인원 이력 |

이 파일은 Chiyumi 봇과 웹이 공유합니다. 필드명이나 중첩 구조를 바꿀 때는 봇 저장소의 읽기·쓰기 코드와 호환성을 함께 확인해야 합니다. 현재 웹 측 쓰기는 JSON 전체를 읽고 수정해 다시 올리는 방식이므로, 동시 쓰기나 스키마 마이그레이션에는 특히 주의합니다.

그 밖의 연동은 다음과 같습니다.

- Google AdSense: 게시자 ID `ca-pub-3540218323238951`(공개 값). `index.html`의 `google-adsense-account` 메타와 `adsbygoogle.js` 스크립트가 모든 페이지에 들어가고, `public/ads.txt`가 같은 ID를 선언합니다. 2026-11-18 사이트 연결을 위해 넣었고 심사 승인 전에는 광고가 나오지 않습니다. 광고 단위(배너 자리)는 승인 후 추가합니다. AdSense 정책상 `/privacy`의 광고 쿠키 안내를 유지하고, 사이트가 처리하는 정보가 바뀌면 그 페이지와 최종 수정일을 함께 고칩니다. `vercel.json`에는 스크립트를 막는 CSP가 없습니다(CSP를 추가하면 `pagead2.googlesyndication.com` 등 Google 광고 도메인을 허용해야 함).
- Riot Developer Portal: 심사 담당자가 볼 공개 시연 페이지는 `/DiscordBot/Chiyumi/valorant`. 발로란트 Production 키는 승인 후 30일 안에 RSO(Riot 계정 로그인 동의)를 붙여야 키가 유지되므로, 승인되면 fehe.dev 계정 연결 화면과 봇의 연결된 계정만 조회하는 흐름을 바로 만든다.
- Riot Developer Portal 사이트 확인: Production 키를 신청하면 Riot이 Product URL 아래 `riot.txt`(확인 코드 한 줄, 줄바꿈 없음)를 요구한다. 롤 앱(911851, Product URL `/DiscordBot/Chiyumi`)은 `public/DiscordBot/Chiyumi/riot.txt`, 발로란트 앱(911927, Product URL `/DiscordBot/Chiyumi/valorant`)은 `public/DiscordBot/Chiyumi/valorant/riot.txt`이고 둘 다 그룹 FeheDeveloperTeam이다. 정적 파일이라 `/api/render` rewrite보다 먼저 전송된다. 심사가 끝날 때까지 지우지 않는다. 페이지 경로와 같은 이름의 폴더가 `dist`에 생기므로, `server/index.js`의 `express.static`은 `redirect: false`로 두어 `/DiscordBot/Chiyumi/valorant`가 끝에 `/`를 붙인 주소로 301 되지 않게 한다.
- Discord REST API: 사용자·길드·채널·역할 조회와 관리 동작
- Google Sheets API: 서비스 계정으로 관리자용 Sheet 읽기
- Cloudflare Turnstile: Discord 로그인 전 사람 확인
- Supabase: Fehe 오늘 방문자 수와 상태 화면의 연결 확인
- YouTube Data API와 iframe API: Fehe YouTube·음악 기능
- ipify: Fehe 상태 화면의 외부 연결 확인

Fehe의 YouTube API 키는 현재 `YoutubePage.jsx`, `StatusPage.jsx`의 클라이언트 코드에 들어 있습니다. 환경 변수로 옮길 경우 Vite의 `VITE_` 변수는 최종 번들에 노출된다는 점을 전제로 키 제한과 외부 서비스 설정까지 함께 변경해야 합니다. (Fehe는 예전에 Firebase를 썼지만 2026-10에 모두 걷어냈습니다. 쓰이지 않던 새 버전 알림 배너도 함께 지웠습니다.)

Fehe 오늘 방문자 수(`src/member/fehe/components/VisitorCount/`)는 Supabase의 `fehe_daily_visitors` 테이블에 한국 날짜 기준으로 셉니다. 호출은 `src/member/fehe/supabase.js`가 라이브러리 없이 REST의 RPC로 하며, 브라우저용 공개 키(`VITE_SUPABASE_ANON_KEY`)만 씁니다. 브라우저는 테이블에 직접 접근할 수 없고(RLS, 정책 없음) 아래 두 `security definer` 함수만 부를 수 있습니다.

- `fehe_count_visit()`: 오늘 방문을 1 올리고 올린 뒤의 숫자를 돌려줌
- `fehe_visitors_today()`: 오늘 숫자만 읽음(상태 화면 확인용도 이것을 써서 확인 때문에 숫자가 오르지 않음)

날짜는 브라우저가 보내지 않고 DB가 `Asia/Seoul` 기준으로 정하므로 다른 날짜의 숫자를 바꿀 수 없고, 한 번 호출에 정확히 1만 오릅니다. 같은 브라우저는 `localStorage`의 `fehe-visit-day`로 하루 한 번만 세고, 보고 있는 동안 1분마다 다시 읽습니다. 환경 변수가 없거나 호출이 실패하면 아무것도 표시하지 않습니다. 테이블과 함수는 저장소의 `supabase/fehe_visitors.sql`을 Supabase SQL Editor에서 실행해 만듭니다(다시 실행해도 안전). 이 Supabase 프로젝트는 페헤 자기소개 전용이며, 다른 서비스(치유미 등)와 연결하지 않습니다.

일시정지 방지: Supabase 무료 플랜은 7일 동안 활동이 없으면 프로젝트를 일시정지합니다. 방문이 뜸해도 멈추지 않도록 `vercel.json`의 `crons`가 매일 18:00 UTC(한국 새벽 3시)에 `/api/supabase-keepalive`를 부르고, `vercel.json` rewrite가 이 요청을 `api/network-test.js`의 `type=supabase-keepalive` 분기로 보내고, 그 분기의 `api/_lib/supabaseKeepalive.js`가 `fehe_visitors_today()`를 한 번 호출해 실제 DB 쿼리를 일으킵니다. 읽기 전용이라 방문자 숫자는 오르지 않습니다. 같은 공개 키 환경 변수를 서버에서 읽으며, `CRON_SECRET`을 설정하면 Vercel Cron이 보내는 `Authorization: Bearer` 값이 맞을 때만 응답합니다(설정하지 않아도 동작). Vercel Hobby 플랜의 Cron은 하루 한 번까지이고 실행 시각은 그 시간대 안에서 조금 밀릴 수 있어도 7일 기준에는 충분합니다. 실행 기록은 Vercel 대시보드의 Settings → Cron Jobs와 함수 로그에서 봅니다. 이미 일시정지된 프로젝트는 이 호출로 깨어나지 않으니 Supabase 대시보드에서 직접 재개합니다. 로컬에서는 `server/index.js`에도 같은 경로가 연결돼 있어 `curl localhost:3000/api/supabase-keepalive`로 확인할 수 있습니다.

방문자 수가 보이지 않을 때: 브라우저 개발자 도구의 네트워크 탭에서 `rpc/fehe_count_visit` 응답을 봅니다. `404`에 `PGRST202`(함수 없음)나 `PGRST205`(테이블 없음)가 오면, 배포 환경 변수 `VITE_SUPABASE_URL`이 가리키는 프로젝트에 SQL이 실행되지 않은 것입니다. 그 프로젝트의 SQL Editor에서 `supabase/fehe_visitors.sql`을 실행하면 코드 변경이나 재배포 없이 바로 돌아옵니다. Supabase 프로젝트를 새로 만들거나 바꿨다면 SQL도 새 프로젝트에서 다시 실행해야 합니다. `401`이면 공개 키가 틀렸거나 프로젝트가 일시정지된 경우이고, 키를 바꾼 뒤에는 Vite 변수가 번들에 들어가므로 다시 배포해야 합니다. (2026-11-06 확인: 운영 번들이 가리키는 프로젝트에 테이블과 함수가 없어 `PGRST202`/`PGRST205`가 났고, 같은 날 SQL을 실행해 복구했습니다.)

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
| `VITE_SUPABASE_URL` | Fehe 방문자 수 | 브라우저에 포함되는 Supabase 프로젝트 URL; 없으면 방문자 수를 숨김 |
| `VITE_SUPABASE_ANON_KEY` | Fehe 방문자 수 | 브라우저용 공개 키(anon/publishable). 비밀 키(service_role)를 넣지 않음 |
| `SFTP_HOST` | Chiyumi 데이터 | SFTP 호스트 |
| `SFTP_PORT` | Chiyumi 데이터 | 포트; 없으면 22 |
| `SFTP_USER` | Chiyumi 데이터 | SFTP 사용자 |
| `SFTP_PASSWORD` | Chiyumi 데이터 | SFTP 비밀번호 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 관리자 Sheet | 서비스 계정 이메일 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | 관리자 Sheet | 줄바꿈을 `\\n`으로 저장할 수 있는 개인 키 |
| `GOOGLE_SHEET_ID` | 관리자 Sheet | 읽을 스프레드시트 ID |
| `CRON_SECRET` | Supabase 일시정지 방지(선택) | 설정하면 `/api/supabase-keepalive`가 Vercel Cron의 Bearer 값일 때만 응답 |
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

`api/render.js`는 빌드된 `index.html`을 프로세스 메모리에 캐시하고 `api/_lib/seoRender.js`를 통해 경로에 맞는 `<title>`, description, Open Graph, Twitter 메타를 치환합니다. `/member/fehe` 문서에는 추가로 `api/_lib/reloadHint.js`가 강력 새로고침 표시와 `Cache-Control: private, no-cache`를 붙입니다(Fehe 인트로 참고). 브라우저 렌더 후에는 `src/components/Seo/Seo.jsx`가 같은 `src/seoData.js`를 사용해 canonical URL과 `og:url`을 포함한 페이지 메타를 갱신합니다.

공개·색인 가능한 경로를 추가하거나 이름을 바꾸면 다음을 함께 검토합니다.

1. 해당 앱의 `<Route>`
2. 헤더·푸터 등 탐색 링크
3. `src/seoData.js`
4. `public/sitemap.xml`
5. 필요 시 `public/robots.txt`와 OG 이미지

검색 노출은 메타 태그보다 실제 화면에 적힌 문장과 제목이 좌우합니다. 그래서 「유튜브 디스코드 서버 구축」·「디스코드 봇 코드 개발」 같은 주력 키워드는 메타에만 두지 않고 홈 제목(`SEO_DATA['/'].title`), 홈 히어로 문구(`src/components/Hero/Hero.jsx`), 홈 하는 일 목록(`src/components/TeamValues/TeamValues.jsx`의 `ITEMS`), 하는 일 페이지(`src/pages/Services/Services.jsx`의 `SERVICES`)에 함께 실어 둡니다. 검색어로는 「유튜브」와 「유튜버」가 따로 쓰이므로, 서비스 이름은 「유튜브 디스코드 서버 구축」으로 두고 대상은 「유튜버·크리에이터」로 적어 두 표현이 모두 문장 안에 자연스럽게 들어가게 합니다. 이 문장을 바꾸면 `src/seoData.js`의 제목·설명, `index.html`의 정적 title·description·og·twitter·keywords·구조화 데이터(`knowsAbout`·`makesOffer`)도 서로 어긋나지 않게 같이 고칩니다 — `index.html`의 정적 기본값은 홈 기준이라 `SEO_DATA['/']`와 같은 문장을 씁니다.

검색 결과에 표시되는 **사이트 이름**은 `index.html`의 `WebSite` 구조화 데이터(`name: FeheDeveloperTeam`, `alternateName: 페헤개발팀·페헤 개발팀·FDT`)로 지정합니다. 이게 없으면 구글이 제목에서 이름을 추측하는데, 홈 제목이 서비스 문구로 시작해서 「유튜브」 같은 엉뚱한 이름이 잡힐 수 있습니다. 한글 팀 이름 검색과 연결되도록 「페헤개발팀」은 별칭뿐 아니라 팀 소개 문장, 푸터 소개 문장, 팀 소개 페이지 설명에도 적어 둡니다. 사이트 이름을 바꿀 때는 `WebSite`·`Organization` 구조화 데이터와 `og:site_name`을 함께 맞춥니다.

`SEO_DATA`에 없는 경로(관리자 화면, 하위 페이지, 404 등)는 서버 렌더링 때 홈 값이 아니라 `FALLBACK_SEO`(제목은 사이트 이름 「FeheDeveloperTeam」)를 씁니다. 홈 제목이 서비스 문구라서, 이런 경로를 공유했을 때 미리보기에 홈 문구가 뜨지 않게 하기 위해서입니다.

## 9. 변경 위치 빠른 찾기

- FDT 공통 레이아웃: `src/App.jsx`, `src/components/Header`, `src/components/Footer`
- 서비스 상태 페이지: `src/pages/Status/` (점검 대상·주기는 `statusMonitor.js`의 `TARGETS`·`POLL_INTERVAL_MS`, 응답 시간 그래프는 `LatencyChart.jsx`)
- 서브앱 진입 시 탭 아이콘 교체: `src/hooks/useFavicon.js` (치유미·Minecraft 위키에 이어 `/member/fehe`도 페헤 프로필 사진을 씁니다)
- FDT 헤더·푸터 공통 메뉴와 연락처: `src/navLinks.js` (`NAV_LINKS`·`CONTACT_EMAIL`·`DISCORD_INVITE`를 헤더, 푸터, 문의 페이지가 함께 참조하므로 한 곳만 고치면 된다)
- FDT 메인 인라인 아이콘: `src/components/icons/icons.jsx`
- FDT 메인 「직접 만들고, 직접 운영합니다」 목록: `src/components/TeamValues/` (문구는 치유미의 실제 명령어, 이 사이트에 실제로 있는 웹 서비스, 문의 페이지의 운영 시간처럼 확인 가능한 사실만 쓴다. 카드·그림·스크롤 고정 효과 없이 번호·제목·설명·다루는 것을 가는 구분선으로만 나눈 목록. 넓은 화면은 세 칸, 760px 이하는 위아래로 쌓이며 각 줄은 `RevealItem`으로 스크롤 시 나타난다)
- FDT 팀 소개 멤버 데이터: `src/pages/About/About.jsx`의 `MEMBERS` (이름·직책·역할·이메일·프로필 사진·개인 페이지 링크)
- 팀원 프로필 사진: `src/assets/images/team/` (`<이름>_original.png`은 원본, `<이름>.png`은 아바타용 400×400 정사각 크롭본. `/about` 카드에서 56px 원형 `object-fit: cover`로 표시되므로 얼굴이 중앙에 오게 크롭)
- FDT SEO 기준 데이터: `src/seoData.js`
- 홈 히어로 문구: `src/components/Hero/Hero.jsx` · 홈 하는 일 목록: `src/components/TeamValues/TeamValues.jsx`의 `ITEMS`
- 하는 일 페이지(`/services`): `src/pages/Services/Services.jsx` (섹션마다 왼쪽 칸에 이름, 오른쪽 칸에 내용을 두는 문서형 구성. `SERVICES`의 첫 항목이 주력으로 크게 놓이고 나머지는 두 칸씩, `PROCESS`는 한 줄로 이어진 선 위의 단계, `STACK_GROUPS`는 Frontend·Backend·Database 세 칸이며 기술 옆 짧은 설명은 기술 자체의 성격만 적는다)
- 검색 키워드·구조화 데이터: `index.html`의 `keywords` 메타와 `application/ld+json`
- Chiyumi 프런트 API 래퍼: `src/DiscordBot/Chiyumi/pages/adminApi.js`, `guildApi.js`
- Discord 인증·세션: `api/_lib/discordAuth.js`
- 관리자 권한: `api/_lib/adminAuth.js`, `api/_lib/admins.js`
- 길드 권한: `api/_lib/guildAuth.js`
- SFTP 접근 공통부: `api/_lib/sftpClient.js`
- 네트워크 진단 계산: `src/utility/NetworkTest/networkDiagnostics.js`
- 수능 시행일·성적 통지일·시간표: `src/utility/Suneung/suneungDates.js`의 `CONFIRMED` (화면 부품은 `components/`의 `CountdownHero`·`Timetable`·`UpcomingList`·`ExamFinder`. 디자인은 시험지·수험표의 종이색과 OMR 붉은 잉크, 어두운 모드(기기 설정 또는 화면 설정)에서는 어두운 톤, 강조색은 화면 설정에서 바꿀 수 있음)
- Minecraft Java 문서: `src/wiki/Minecraft/javaWikiData.js`
- Fehe 음악 재생 목록: `src/member/fehe/components/MusicPlayer/MusicPlayer.jsx`의 `TRACKS` (YouTube IFrame Player로 영상을 그대로 재생하므로 항목에는 영상 ID와 표시용 제목·아티스트만 둔다. **등록한 최신 순으로 정렬하므로 새 곡은 배열 맨 위에 넣고**, 목록 첫 곡이 처음 재생된다. 곡이 끝나면 다음 곡으로 넘어가고 마지막 곡 뒤에는 처음으로 돌아간다. 재생바 아래 가운데의 반복 버튼을 켜면 지금 곡만 반복한다. 칸을 넘치는 제목은 `ScrollingText`가 실제 넘치는 길이를 재서 천천히 왕복하며 끝까지 보여 주고, 마우스를 올리면 멈추며, 움직임 줄이기 설정에서는 말줄임표와 툴팁으로 대신한다. 볼륨 슬라이더는 상시 노출하지 않고, 상단 볼륨 버튼을 누르면 그 버튼 바로 위에 세로 슬라이더가 뜬다(`absolute`라 카드 높이를 밀지 않고 위로 열려 진행바를 가리지 않는다. 바깥 클릭이나 ESC로 닫힌다). 720px 이하에서는 카드가 화면을 크게 가려서 원형 버튼으로 접어 두고 눌러야 펼쳐진다 — 카드는 `hidden` 속성 대신 조건부 렌더링으로 감춘다. `.music-card`의 `display: flex`가 UA 스타일시트의 `[hidden]`을 이기기 때문이다. YouTube 플레이어 컨테이너는 카드 밖에 있어 접어도 재생이 끊기지 않는다)
- Fehe 배경 화면(설산·눈보라): `src/member/fehe/components/BgDeco/` (산맥 실루엣은 `RIDGES`의 SVG path, 눈을 뺀 풍경은 `Scenery`로 꺼내 인트로와 함께 씀)
- Fehe 첫 진입 인트로: `src/member/fehe/components/IntroSplash/` (제목 카드는 JSX의 `.intro-card`, 띄울지 여부는 `shouldPlayIntro`, 풍경이 드러나는 시각은 `REVEAL_AT`, 버튼이 나오는 시각은 `ENTER_AT`) · 강력 새로고침 판별: `api/_lib/reloadHint.js` · 처음 불러온 위치 기록: `src/initialLocation.js`
- Yukiha 분리 페이지 셸: `src/member/yukiha/YukihaApp.jsx`, `src/member/yukiha/components/` (본문은 `YukihaPage.jsx`)
- Fehe 자기소개·경력·기술 데이터: `src/member/fehe/pages/HomePage/HomePage.jsx` (경력 항목의 `note`는 본문 아래 코드 주석(`// …`)처럼 작게 붙는 안내로, 전문대학교 항목은 학교·학과 이름을 졸업 후 공개한다는 안내에 쓰고 본문에는 「컴퓨터 계열 학과」로만 적는다. `duties`는 「라벨 + 설명」 한 줄씩, `works`는 분야별로 묶은 작업 목록이다. 라함 국가근로장학생(`2025년 3월 ~ 2027년 1월`)은 `works`로 인프라·웹 서비스(진행 중인 ERP 시스템 개발 포함)·자동화 세 분야에 작업 6개를 두고, 각 작업은 `title`과 선택 항목 `org`(작업한 곳·대상)로 표시한다. 넓은 화면에서는 분야가 왼쪽 열, 540px 이하에서는 작업 위로 올라간다. `youtube`(`href`, `label`)는 카드 아래에 빨간 YouTube 바로가기 버튼을 붙이며, 2026. 11. 10부터 운영하는 AI 동물 쇼츠 채널 「물음표 동물원」(`@mureumpyo_zoo`) 항목에 쓴다)
- 배포 설정: `vercel.json`
- 페헤 3D 캐릭터 작업 파일: `3d-work/` (Blender 스크립트와 렌더, 임시 파일. `.gitignore`로 제외해 배포되지 않고, 결과물은 Google Drive에서 관리한다)

## 10. 문서 유지 체크리스트

- 의존성·Node 버전·npm 스크립트가 바뀌면 `README.md`의 시작 방법과 명령어를 갱신합니다.
- 라우트·API resource가 바뀌면 이 문서의 표와 SEO 체크리스트를 갱신합니다.
- 메뉴 구성이나 연락처(이메일·Discord 초대)가 바뀌면 `src/navLinks.js`만 고칩니다. 헤더·푸터·문의 페이지가 이 값을 함께 씁니다.
- 새 환경 변수를 추가하면 값 없이 이름과 역할만 문서화합니다.
- SFTP 파일이나 스키마가 바뀌면 공유 데이터 표와 봇 저장소 호환성을 갱신합니다.
- 로고 파일을 교체하면 `src/assets/images/logo/README.md`와 실제 import를 함께 확인합니다.
- 팀원 프로필 사진을 추가·교체하면 원본과 크롭본을 `src/assets/images/team/`에 함께 두고 `src/pages/About/About.jsx`의 import를 확인합니다.

## 11. 작업 완료 절차

모든 작업은 다음 순서를 완료해야 끝난 것으로 봅니다.

1. 변경된 코드와 실제 동작에 맞게 `README.md`, 이 가이드 및 관련 영역 문서를 최신화합니다.
2. 변경 범위에 맞는 검사와 기본 `npm run lint`, `npm run build`를 통과시킵니다.
3. 비밀 값과 생성물 등 의도하지 않은 파일이 포함되지 않았는지 Git diff를 검토합니다.
4. 변경 사항을 커밋하고 현재 브랜치에 설정된 GitHub upstream으로 push합니다.

GitHub push에 실패하면 작업이 원격에 반영됐다고 안내하지 말고, 실패 원인과 필요한 후속 조치를 명시합니다.
