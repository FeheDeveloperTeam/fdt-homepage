export async function callAdminApi(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '요청에 실패했어요.')
  return data
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ko-KR')
}
