# API 안내

모든 API는 `/api` 아래에 있습니다. 응답은 JSON이며, 인증이 필요한 API는 Discord 세션 쿠키를 사용합니다. UI에서 사용하는 내부 API이므로 외부 공개 SDK 계약으로 간주하지 않습니다.

## 인증

| 경로 | 메서드 | 설명 |
| --- | --- | --- |
| `/api/auth/discord/login` | GET | Turnstile 검증 후 Discord OAuth 시작 |
| `/api/auth/discord/callback` | GET | OAuth 콜백, 세션 쿠키 발급 |
| `/api/auth/me` | GET | 현재 사용자와 관리자 여부 반환 |
| `/api/auth/logout` | GET | 세션 쿠키를 제거하고 Chiyumi 홈으로 이동 |

`/api/auth/me`은 `{ user: null | { id, username, ..., isAdmin } }` 형태를 반환하며 access token은 브라우저에 반환하지 않습니다.

## 네트워크 테스트

| 경로 | 메서드 | 쿼리 | 설명 |
| --- | --- | --- | --- |
| `/api/network-test` | GET | `type=ip` | 공개 IP 확인 |
| `/api/network-test` | GET | `type=ping` | 이 서버까지의 HTTP 왕복 시간 표본 |
| `/api/network-test` | GET | `type=download&bytes=<n>` | 무작위 바이트 다운로드 |

다운로드 응답은 캐시되지 않으며 크기는 서버에서 제한됩니다. CDN 환경 변수가 설정된 프로덕션 화면은 이 API 대신 Cloudflare 정적 에셋을 사용합니다.

## 관리자 API

아래 API는 모두 Discord 관리자 세션이 필요합니다.

| 경로 | 메서드 | 주요 입력 | 용도 |
| --- | --- | --- | --- |
| `/api/admin/stats` | GET | - | 봇·길드·코인 요약 |
| `/api/admin/admins` | GET/POST/DELETE | `userId` | 관리자 목록 및 관리 |
| `/api/admin/coins` | GET/POST | `userId`, `delta` | 코인 잔액 조회·조정 |
| `/api/admin/restrictions` | GET/POST/DELETE | `userId`, `reason` | 이용 제한 조회·관리 |
| `/api/admin/sheet` | GET | `name` | 허용된 Google Sheets 읽기 |

## 길드 API

`/api/guild`는 `resource`와 `guildId`로 동작을 구분하며 길드 관리 권한을 확인합니다. 분당 60회 제한이 적용됩니다.

| `resource` | 메서드 | 용도 |
| --- | --- | --- |
| `guilds` | GET | 로그인 사용자가 관리할 수 있는 길드 목록 |
| `meta`, `overview` | GET | 길드 설정 화면의 초기 정보와 통계 |
| `config` | GET/POST | 로그, 환영, 티켓, 경고, 검열 등 길드 설정 |
| `warnings` | GET/POST | 사용자 경고 조회·추가·삭제·초기화 |
| `streamalert` | GET/POST | 방송 알림 조회·등록·수정·삭제 |
| `ban`, `kick` | POST | 길드 구성원 제재 |

요청 본문과 허용 값은 `api/guild.js`가 최종 기준입니다. 새 resource를 추가할 때는 권한 검사, 입력 검증, 오류 응답, UI 호출부를 함께 추가합니다.
