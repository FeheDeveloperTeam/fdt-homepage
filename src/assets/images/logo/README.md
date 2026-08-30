# FDT 로고 자산

이 디렉터리에는 FDT 화면에서 사용하는 로고와 원본 이미지가 있습니다.

| 파일 | 크기 | 현재 용도 |
| --- | --- | --- |
| `fdt-logo-square.png` | 512 × 512 | 메인 [Header](../../../components/Header/Header.jsx), [Footer](../../../components/Footer/Footer.jsx), [TeamValues](../../../components/TeamValues/TeamValues.jsx)에서 import하는 정사각형 로고 |
| `FDT_Banner_icon_original.png` | 1408 × 768 | 편집·재가공을 위한 원본 배너 이미지. 현재 소스에서 직접 import하지 않음 |

브라우저 파비콘은 이 디렉터리가 아니라 [`public/favicon.png`](../../../../public/favicon.png)에 있습니다. 공유 미리보기용 이미지는 `public/og-*.png`에 둡니다.

로고 파일을 교체하거나 이름을 바꿀 때는 위 컴포넌트의 import 경로, `index.html`의 파비콘·구조화 데이터, `src/seoData.js`와 `public/`의 OG 이미지를 함께 확인하세요.
