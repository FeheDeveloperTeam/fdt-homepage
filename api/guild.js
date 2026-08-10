import { readSession } from './_lib/discordAuth.js'
import { requireGuildManager, listManageableGuilds } from './_lib/guildAuth.js'
import {
  fetchGuildInfo,
  fetchGuildChannels,
  fetchGuildRoles,
  fetchGuildMembers,
  fetchDiscordProfile,
  banGuildMember,
  kickGuildMember,
  sendChannelMessage,
} from './_lib/discordApi.js'
import { rateLimit } from './_lib/rateLimit.js'
import { isDiscordId } from './_lib/validate.js'
import * as guildConfig from './_lib/sftpGuildConfig.js'
import { getUserWarnings, addWarning, removeWarning, resetWarnings } from './_lib/sftpWarnings.js'
import { getGuildActivity, getAllClaims } from './_lib/sftpActivity.js'
import { getGuildOnlineHumans } from './_lib/sftpPresence.js'
import {
  getGuildAlerts,
  addAlert,
  removeAlert,
  updateAlert,
  extractChannelId,
  resolveYouTubeChannelId,
  isDuplicate,
} from './_lib/sftpStreamAlerts.js'

// 서버(길드)별 치유미 설정 대시보드 — Vercel 서버리스 함수 12개 제한 때문에
// ?resource=로 여러 리소스를 한 파일에서 다룬다 (api/admin/admins.js와 같은 패턴).
function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function badRequest(res, error) {
  sendJson(res, 400, { error })
}

async function handleGuildsList(req, res) {
  const session = readSession(req)
  if (!session) return sendJson(res, 401, { error: '로그인이 필요해요.' })
  if (!session.accessToken) return sendJson(res, 401, { error: '다시 로그인해주세요.' })
  const guilds = await listManageableGuilds(session)
  sendJson(res, 200, { guilds })
}

async function handleOverview(req, res, guildId) {
  const access = await requireGuildManager(req, res, guildId)
  if (!access) return

  try {
    const [info, activity, claims, members, onlinePresence] = await Promise.all([
      fetchGuildInfo(guildId),
      getGuildActivity(guildId, 10),
      getAllClaims(),
      fetchGuildMembers(guildId),
      getGuildOnlineHumans(guildId),
    ])
    const memberIds = members.humanIds

    const profileIds = [...new Set([...activity.topChat, ...activity.topVoice].map((e) => e.userId))]
    const profiles = await Promise.all(profileIds.map(fetchDiscordProfile))
    const profileMap = new Map(profiles.map((p) => [p.id, p]))
    const attach = (entry) => ({ ...entry, ...(profileMap.get(entry.userId) || { username: entry.userId, avatar: null }) })

    // 출석(claims.json)은 길드 구분 없이 봇 전체가 공유하는 데이터라, 이 서버
    // 멤버 목록과 교집합을 내야 "이 서버의" 출석 참여율이 된다.
    const rate = (count) => (memberIds.length ? Math.round((count / memberIds.length) * 1000) / 10 : 0)

    const chatCount = memberIds.filter((id) => activity.chatParticipantIds.has(id)).length
    const voiceCount = memberIds.filter((id) => activity.voiceParticipantIds.has(id)).length
    const attendanceStreaks = memberIds.map((id) => claims[id]?.streak).filter((s) => typeof s === 'number' && s > 0)
    const avgStreak = attendanceStreaks.length
      ? Math.round((attendanceStreaks.reduce((sum, s) => sum + s, 0) / attendanceStreaks.length) * 10) / 10
      : 0

    sendJson(res, 200, {
      guild: {
        ...info,
        humanCount: members.humanIds.length,
        botCount: members.botCount,
        onlineHumans: onlinePresence?.onlineHumans ?? null,
        onlineHumansUpdatedAt: onlinePresence?.updatedAt ?? null,
        onlineHumansHistory: onlinePresence?.history ?? [],
      },
      topChat: activity.topChat.map(attach),
      topVoice: activity.topVoice.map(attach),
      participation: {
        totalMembers: memberIds.length,
        chatCount,
        chatRate: rate(chatCount),
        voiceCount,
        voiceRate: rate(voiceCount),
        attendanceCount: attendanceStreaks.length,
        attendanceRate: rate(attendanceStreaks.length),
        avgStreak,
      },
    })
  } catch (err) {
    console.error('[guild overview]', err)
    sendJson(res, 500, { error: '통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' })
  }
}

// meta에 config까지 함께 내려준다 — GuildLayout이 처음 페이지를 열 때 필요한
// 정보를 요청 한 번으로 다 받아서, 인증 체크가 걸린 요청 여러 개가 동시에
// 나가면서 디스코드 API rate limit에 걸리는 걸 애초에 막는다.
async function handleMeta(req, res, guildId) {
  const access = await requireGuildManager(req, res, guildId)
  if (!access) return

  const [info, channels, roles, config] = await Promise.all([
    fetchGuildInfo(guildId),
    fetchGuildChannels(guildId),
    fetchGuildRoles(guildId),
    guildConfig.getGuildConfig(guildId),
  ])
  sendJson(res, 200, { guild: info, channels, roles, config })
}

async function handleConfigGet(req, res, guildId) {
  const access = await requireGuildManager(req, res, guildId)
  if (!access) return
  const config = await guildConfig.getGuildConfig(guildId)
  sendJson(res, 200, { config })
}

// body: { section, field, ...나머지 } — 섹션·필드 조합으로 어떤 setter를 부를지 정한다.
async function handleConfigPost(req, res, guildId) {
  const access = await requireGuildManager(req, res, guildId)
  if (!access) return

  const { section, field } = req.body || {}
  try {
    switch (`${section}.${field}`) {
      case 'log.channel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setLogChannel(guildId, value)
        break
      }
      case 'log.option': {
        const { key, value } = req.body
        await guildConfig.setLogOption(guildId, key, Boolean(value))
        break
      }
      case 'log.typeChannel': {
        const { key, value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setLogTypeChannel(guildId, key, value)
        break
      }
      case 'welcome.joinChannel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setJoinChannel(guildId, value)
        break
      }
      case 'welcome.leaveChannel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setLeaveChannel(guildId, value)
        break
      }
      case 'welcome.option': {
        const { key, value } = req.body
        await guildConfig.setWelcomeOption(guildId, key, Boolean(value))
        break
      }
      case 'welcome.message': {
        const { key, value } = req.body
        if (key !== 'join' && key !== 'leave') return badRequest(res, 'key는 join 또는 leave여야 해요.')
        await guildConfig.setWelcomeMessage(guildId, key, String(value ?? '').slice(0, 512))
        break
      }
      case 'ticket.channel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setTicketChannel(guildId, value)
        break
      }
      case 'ticket.message': {
        const { value } = req.body
        await guildConfig.setTicketMessage(guildId, String(value ?? '').slice(0, 512))
        break
      }
      case 'ticket.publish': {
        const current = await guildConfig.getGuildConfig(guildId)
        if (!current.ticketChannelId) return badRequest(res, '먼저 티켓 채널을 설정해주세요.')
        await sendChannelMessage(current.ticketChannelId, {
          embeds: [{ description: current.ticketMessage, color: 0xe1aa74 }],
          components: [
            {
              type: 1,
              components: [{ type: 2, style: 3, label: '티켓 생성', custom_id: 'ticket-create' }],
            },
          ],
        })
        break
      }
      case 'warn.threshold': {
        const { count, roleId, action, duration } = req.body
        if (!Number.isInteger(count) || count < 1) return badRequest(res, 'count는 1 이상의 정수여야 해요.')
        if (roleId && !isDiscordId(roleId)) return badRequest(res, '올바른 역할 ID가 아니에요.')
        await guildConfig.setWarnThreshold(guildId, count, roleId || null, action, duration ?? null)
        break
      }
      case 'warn.removeThreshold': {
        const { count } = req.body
        await guildConfig.removeWarnThreshold(guildId, count)
        break
      }
      case 'warn.maxCount': {
        const { value } = req.body
        await guildConfig.setWarnMaxCount(guildId, value === null ? null : Number(value))
        break
      }
      case 'warn.logChannel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setWarnLogChannel(guildId, value)
        break
      }
      case 'censor.spamLevel': {
        const { value } = req.body
        if (!Number.isInteger(value) || value < 1 || value > 5) return badRequest(res, 'value는 1~5 사이의 정수여야 해요.')
        await guildConfig.setSpamLevel(guildId, value)
        break
      }
      case 'censor.raidConfig': {
        const { updates } = req.body
        await guildConfig.setRaidConfig(guildId, updates || {})
        break
      }
      case 'censor.raidUnlock': {
        await guildConfig.setRaidLocked(guildId, false)
        break
      }
      case 'wordchain.channel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setWordChainChannel(guildId, value)
        break
      }
      case 'wordchain.publish': {
        const current = await guildConfig.getGuildConfig(guildId)
        if (!current.wordChainChannelId) return badRequest(res, '먼저 끝말잇기 채널을 설정해주세요.')
        await sendChannelMessage(current.wordChainChannelId, {
          embeds: [{ description: '아래 버튼을 눌러 끝말잇기 파티를 만들어보세요!', color: 0xe1aa74 }],
          components: [
            {
              type: 1,
              components: [{ type: 2, style: 3, label: '파티 만들기', custom_id: 'wordchain-create' }],
            },
          ],
        })
        break
      }
      case 'announce.channel': {
        const { value } = req.body
        if (value !== null && !isDiscordId(value)) return badRequest(res, '올바른 채널 ID가 아니에요.')
        await guildConfig.setAnnounceChannel(guildId, value)
        break
      }
      default:
        return badRequest(res, '알 수 없는 설정 항목이에요.')
    }
    const config = await guildConfig.getGuildConfig(guildId)
    sendJson(res, 200, { ok: true, config })
  } catch (err) {
    console.error('[guild config POST]', err)
    sendJson(res, 500, { error: '처리에 실패했어요. 봇 권한이나 채널 설정을 확인하고 잠시 후 다시 시도해주세요.' })
  }
}

async function handleWarnings(req, res, guildId) {
  const access = await requireGuildManager(req, res, guildId)
  if (!access) return

  const userId = req.query?.userId
  if (!isDiscordId(userId)) return badRequest(res, '올바른 디스코드 ID가 아니에요.')

  try {
    if (req.method === 'GET') {
      const warnings = await getUserWarnings(guildId, userId)
      return sendJson(res, 200, { warnings })
    }

    if (req.method === 'POST') {
      const { action, reason, amount } = req.body || {}
      let warnings
      if (action === 'add') warnings = await addWarning(guildId, userId, reason || '이유 없음', access.user.id)
      else if (action === 'remove') warnings = await removeWarning(guildId, userId, Number(amount) || 1)
      else if (action === 'reset') { await resetWarnings(guildId, userId); warnings = { count: 0, history: [] } }
      else return badRequest(res, 'action은 add · remove · reset 중 하나여야 해요.')
      return sendJson(res, 200, { ok: true, warnings })
    }

    sendJson(res, 405, { error: 'Method Not Allowed' })
  } catch (err) {
    console.error('[guild warnings]', err)
    sendJson(res, 500, { error: '경고 처리에 실패했어요. 잠시 후 다시 시도해주세요.' })
  }
}

async function handleStreamAlert(req, res, guildId) {
  const access = await requireGuildManager(req, res, guildId)
  if (!access) return

  try {
    if (req.method === 'GET') {
      const alerts = await getGuildAlerts(guildId)
      return sendJson(res, 200, { alerts })
    }

    if (req.method === 'POST') {
      const { action } = req.body || {}

      if (action === 'add') {
        const { platform, channelLink, channelName, notifChannelId, customText, mention } = req.body
        if (!['youtube', 'youtube_upload', 'chzzk', 'soop'].includes(platform)) return badRequest(res, '지원하지 않는 플랫폼이에요.')
        if (!isDiscordId(notifChannelId)) return badRequest(res, '올바른 알림 채널 ID가 아니에요.')
        if (!channelName || !String(channelName).trim()) return badRequest(res, '채널 이름을 입력해주세요.')

        let channelId = extractChannelId(platform, String(channelLink || ''))
        if (!channelId) return badRequest(res, '채널 링크에서 채널 정보를 찾지 못했어요.')
        if (platform.startsWith('youtube')) {
          const resolved = await resolveYouTubeChannelId(channelId)
          if (!resolved) return badRequest(res, '유튜브 채널을 찾지 못했어요.')
          channelId = resolved
        }

        if (await isDuplicate(guildId, platform, channelId)) return badRequest(res, '이미 등록된 채널이에요.')

        const alert = await addAlert(guildId, {
          platform,
          channelId,
          channelName: String(channelName).trim().slice(0, 100),
          channelLink: String(channelLink || ''),
          notifChannelId,
          customText: customText ? String(customText).slice(0, 512) : null,
          mention: ['none', 'everyone', 'here'].includes(mention) ? mention : 'none',
        })
        return sendJson(res, 200, { ok: true, alert })
      }

      if (action === 'remove') {
        const { alertId } = req.body
        const removed = await removeAlert(guildId, alertId)
        return sendJson(res, 200, { ok: removed })
      }

      if (action === 'update') {
        const { alertId, updates } = req.body
        const allowed = ['channelName', 'notifChannelId', 'customText', 'mention']
        const safeUpdates = Object.fromEntries(
          Object.entries(updates || {}).filter(([k]) => allowed.includes(k)),
        )
        if (safeUpdates.notifChannelId && !isDiscordId(safeUpdates.notifChannelId)) {
          return badRequest(res, '올바른 알림 채널 ID가 아니에요.')
        }
        const ok = await updateAlert(guildId, alertId, safeUpdates)
        return sendJson(res, 200, { ok })
      }

      return badRequest(res, 'action은 add · remove · update 중 하나여야 해요.')
    }

    sendJson(res, 405, { error: 'Method Not Allowed' })
  } catch (err) {
    console.error('[guild streamalert]', err)
    sendJson(res, 500, { error: '방송알림 처리에 실패했어요. 잠시 후 다시 시도해주세요.' })
  }
}

async function handleModeration(req, res, guildId, kind) {
  const bit = kind === 'ban' ? 'BAN_MEMBERS' : 'KICK_MEMBERS'
  const access = await requireGuildManager(req, res, guildId, bit)
  if (!access) return

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' })

  const { userId, reason } = req.body || {}
  if (!isDiscordId(userId)) return badRequest(res, '올바른 디스코드 ID가 아니에요.')

  try {
    if (kind === 'ban') await banGuildMember(guildId, userId, reason)
    else await kickGuildMember(guildId, userId, reason)
    sendJson(res, 200, { ok: true })
  } catch (err) {
    console.error(`[guild ${kind}]`, err)
    sendJson(res, 502, { error: `디스코드 ${kind === 'ban' ? '차단' : '추방'}에 실패했어요. 봇 권한과 역할 순서를 확인해주세요.` })
  }
}

export default async function handler(req, res) {
  if (!rateLimit(req, res, 'guild-api', { windowMs: 60_000, max: 60 })) return

  const resource = req.query?.resource
  const guildId = req.query?.guildId

  try {
    if (resource === 'guilds') return await handleGuildsList(req, res)
    if (resource === 'meta') return await handleMeta(req, res, guildId)
    if (resource === 'overview') return await handleOverview(req, res, guildId)
    if (resource === 'config') {
      if (req.method === 'GET') return await handleConfigGet(req, res, guildId)
      if (req.method === 'POST') return await handleConfigPost(req, res, guildId)
      return sendJson(res, 405, { error: 'Method Not Allowed' })
    }
    if (resource === 'warnings') return await handleWarnings(req, res, guildId)
    if (resource === 'streamalert') return await handleStreamAlert(req, res, guildId)
    if (resource === 'ban') return await handleModeration(req, res, guildId, 'ban')
    if (resource === 'kick') return await handleModeration(req, res, guildId, 'kick')

    badRequest(res, 'resource 파라미터가 올바르지 않아요.')
  } catch (err) {
    console.error('[api/guild]', err)
    sendJson(res, 500, { error: '요청 처리에 실패했어요. 잠시 후 다시 시도해주세요.' })
  }
}
