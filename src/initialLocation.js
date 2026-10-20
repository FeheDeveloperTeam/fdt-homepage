/*
  문서를 처음 불러왔을 때의 라우터 위치 key.

  React Router(BrowserRouter)는 위치마다 key를 history.state에 저장하고, 새로고침해도 이 값은 남는다.
  그래서 "지금 위치가 문서를 새로 불러온 그 위치인가"를 key가 'default'인지로 판단하면 안 된다 —
  링크로 이동한 페이지에서 F5를 누르면 key가 그대로 남아 있어 클라이언트 이동으로 오인한다.
  대신 앱이 시작될 때의 key를 기록해 두고 그 값과 같은지로 판단한다.

  라우터가 위치를 바꾸기 전에 읽어야 하므로 main.jsx에서 가장 먼저 불러온다.
*/
export const INITIAL_LOCATION_KEY =
  (typeof window !== 'undefined' && window.history.state?.key) || 'default'
