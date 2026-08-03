import { getSupabase } from './supabase.js'

export async function listDbAdmins() {
  const { data, error } = await getSupabase()
    .from('admins')
    .select('user_id, added_by, added_at')
    .order('added_at', { ascending: true })
  if (error) throw new Error(`관리자 목록 조회 실패: ${error.message}`)
  return (data || []).map((row) => ({
    userId: row.user_id,
    addedBy: row.added_by,
    addedAt: row.added_at,
  }))
}

export async function addAdmin(userId, byId) {
  const { error } = await getSupabase()
    .from('admins')
    .upsert({ user_id: userId, added_by: byId, added_at: new Date().toISOString() })
  if (error) throw new Error(`관리자 추가 실패: ${error.message}`)
}

export async function removeAdmin(userId) {
  const { error } = await getSupabase().from('admins').delete().eq('user_id', userId)
  if (error) throw new Error(`관리자 제거 실패: ${error.message}`)
}
