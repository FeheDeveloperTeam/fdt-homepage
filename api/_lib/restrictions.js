import { getSupabase } from './supabase.js'

export async function getRestriction(userId) {
  const { data, error } = await getSupabase()
    .from('restrictions')
    .select('reason, restricted_by, restricted_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`이용제한 조회 실패: ${error.message}`)
  if (!data) return null
  return {
    reason: data.reason,
    restrictedBy: data.restricted_by,
    restrictedAt: data.restricted_at,
  }
}

export async function restrictUser(userId, reason, byId) {
  const { error } = await getSupabase()
    .from('restrictions')
    .upsert({
      user_id: userId,
      reason: reason || '사유 없음',
      restricted_by: byId,
      restricted_at: new Date().toISOString(),
    })
  if (error) throw new Error(`이용제한 등록 실패: ${error.message}`)
}

export async function unrestrictUser(userId) {
  const existed = Boolean(await getRestriction(userId))
  const { error } = await getSupabase().from('restrictions').delete().eq('user_id', userId)
  if (error) throw new Error(`이용제한 해제 실패: ${error.message}`)
  return existed
}
