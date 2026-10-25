/*
  Fehe 페이지가 쓰는 Supabase 호출. 라이브러리 없이 REST의 RPC 엔드포인트를 fetch로 부른다.

  - 브라우저용 공개 키(anon/publishable)만 쓴다. 이 키는 번들에 노출돼도 되는 키이고,
    실제 권한은 Supabase 쪽 함수(security definer)와 RLS가 정한다.
  - 테이블·함수 정의는 supabase/fehe_visitors.sql에 있다.
  - 환경 변수가 없으면 isSupabaseConfigured가 false이고, 호출하는 쪽은 기능을 숨긴다.
*/
const URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || ''
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(URL && ANON_KEY)

export async function callRpc(name, args = {}, { signal } = {}) {
  if (!isSupabaseConfigured) throw new Error('Supabase 환경 변수가 설정되지 않았어요.')
  const res = await fetch(`${URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
    signal,
  })
  if (!res.ok) throw new Error(`Supabase ${name} 호출 실패 (HTTP ${res.status})`)
  return res.json()
}
