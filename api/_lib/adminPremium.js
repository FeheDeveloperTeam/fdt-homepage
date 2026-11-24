// 개발자 관리자 화면의 「유료 이용권」 — 서버별 봇 프로필 이용권을 영구 또는 기간제로 주고, 연장·해지한다.
// Vercel 함수 12개 제한 때문에 새 파일을 늘리지 않고 api/admin/coins.js가 ?resource=premium일 때 이 핸들러로 넘긴다.
// 권한 확인(requireAdmin)은 coins.js가 먼저 한다.
import { discordApi } from './discordApi.js'
import { isDiscordId } from './validate.js'
import {
  PERMANENT_TEXT,
  getProfileRecord,
  listSubscriptions,
  todayKst,
  upsertProfileRecord,
  writeSubscription,
} from './premiumSheets.js'
import { resetBotProfile } from './botProfile.js'

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const YMD = /^\d{4}-\d{2}-\d{2}$/

// 「1개월 뒤」는 다음 달 같은 날까지다. 다음 달에 그 날이 없으면(1/31 → 2월) 그 달 마지막 날로 맞춘다.
export function addMonths(ymd, months) {
  const [y, m, d] = ymd.split('-').map(Number)
  const lastDay = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, lastDay))).toISOString().slice(0, 10)
}

function yesterdayKst() {
  return new Date(Date.now() + 9 * 3600_000 - 86_400_000).toISOString().slice(0, 10)
}

async function fetchBotGuilds() {
  const guilds = await discordApi('/users/@me/guilds?limit=200')
  return guilds
    .map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64` : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

async function buildState() {
  const [passes, guilds] = await Promise.all([listSubscriptions(), fetchBotGuilds()])
  const names = new Map(guilds.map((g) => [g.id, g]))
  return {
    today: todayKst(),
    guilds,
    passes: passes
      .map(({ rowNumbers: _rowNumbers, ...pass }) => ({
        ...pass,
        name: names.get(pass.guildId)?.name || pass.name || '(봇이 없는 서버)',
        icon: names.get(pass.guildId)?.icon || null,
        botPresent: names.has(pass.guildId),
      }))
      // 이용 중 → 영구 먼저 → 만료 가까운 순, 끝난 이용권은 아래로
      .sort((a, b) => Number(b.active) - Number(a.active) || Number(b.permanent) - Number(a.permanent) || String(a.endDate).localeCompare(String(b.endDate))),
  }
}

function stamp(memo, text) {
  const line = `${text} (${todayKst()})`
  const joined = memo ? `${memo} / ${line}` : line
  // 연장·해지 기록이 계속 쌓이므로 최근 내용 위주로 400자까지만 남긴다.
  return joined.length > 400 ? `…${joined.slice(-399)}` : joined
}

async function grant(body, adminName) {
  const { guildId, type, months, endDate, memo } = body
  if (!isDiscordId(guildId)) return { status: 400, error: '서버를 골라주세요.' }

  const guilds = await fetchBotGuilds()
  const guild = guilds.find((g) => g.id === guildId)
  const current = (await listSubscriptions()).find((p) => p.guildId === guildId)
  const today = todayKst()
  const note = memo != null && String(memo).trim() ? String(memo).trim().slice(0, 200) : current?.memo || ''

  if (type === 'permanent') {
    await writeSubscription(guildId, {
      name: guild?.name || current?.name,
      startDate: current?.active && current.startDate ? current.startDate : today,
      endValue: PERMANENT_TEXT,
      memo: stamp(note, `영구 지급 · ${adminName}`),
    })
    return null
  }

  if (type !== 'period') return { status: 400, error: '이용권 종류는 영구 또는 기간제여야 해요.' }

  let end
  if (endDate) {
    if (!YMD.test(endDate) || endDate < today) return { status: 400, error: '만료일은 오늘 이후 날짜여야 해요.' }
    end = endDate
  } else {
    const n = Number(months)
    if (!Number.isInteger(n) || n < 1 || n > 36) return { status: 400, error: '기간은 1~36개월로 골라주세요.' }
    // 이미 이용 중인 기간제면 남은 기간 뒤로 이어 붙이고, 영구·만료·처음이면 오늘부터 센다.
    const base = current?.active && !current.permanent && current.endDate >= today ? current.endDate : today
    end = addMonths(base, n)
  }

  await writeSubscription(guildId, {
    name: guild?.name || current?.name,
    startDate: current?.active && current.startDate ? current.startDate : today,
    endValue: end,
    memo: stamp(note, `기간제 ${endDate ? `만료일 ${end}로 설정` : `${months}개월`} · ${adminName}`),
  })
  return null
}

// 해지: 만료일을 어제로 바꾸고, 커스텀 프로필이 적용 중이면 바로 기본으로 되돌린다(봇의 30분 주기 확인을 기다리지 않음).
async function revoke(body, adminName, adminId) {
  const { guildId } = body
  const current = (await listSubscriptions()).find((p) => p.guildId === guildId)
  if (!current) return { status: 404, error: '이 서버의 이용권을 찾지 못했어요.' }

  await writeSubscription(guildId, {
    name: current.name,
    startDate: current.startDate,
    endValue: yesterdayKst(),
    memo: stamp(current.memo, `해지 · ${adminName}`),
  })

  const record = await getProfileRecord(guildId)
  if (record?.status === '적용중') {
    const result = await resetBotProfile(guildId, record.bio)
    if (result.ok) {
      await upsertProfileRecord(guildId, current.name, { nick: '', bio: '', avatar: '', banner: '', status: '만료로 해제' }, adminId)
    } else {
      // 봇이 서버에 없거나 권한이 없으면 봇의 주기 확인이 다시 시도한다.
      console.error('[admin premium] 해지 후 프로필 되돌리기 실패', guildId, result.error)
    }
  }
  return null
}

export async function handleAdminPremium(req, res, admin) {
  try {
    if (req.method === 'GET') return sendJson(res, 200, await buildState())
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' })

    const body = req.body || {}
    const adminName = admin?.global_name || admin?.username || '관리자'
    let failure
    if (body.action === 'grant') failure = await grant(body, adminName)
    else if (body.action === 'revoke') failure = await revoke(body, adminName, admin?.id || '')
    else failure = { status: 400, error: 'action은 grant 또는 revoke여야 해요.' }

    if (failure) return sendJson(res, failure.status, { error: failure.error })
    sendJson(res, 200, await buildState())
  } catch (err) {
    console.error('[admin premium]', err)
    sendJson(res, 500, { error: '유료 이용권 처리에 실패했어요. 잠시 후 다시 시도해주세요.' })
  }
}

