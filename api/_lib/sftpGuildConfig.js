import { withSftp, readJson, writeJson } from './sftpClient.js'

// 봇 저장소의 src/utils/guildConfig.js와 데이터 스키마·기본값을 그대로 맞춘다.
// 같은 data/guildConfig.json 파일을 봇(파일시스템 직접 접근)과 웹(SFTP)이 공유하고,
// 봇 쪽은 매 호출마다 파일을 새로 읽기 때문에 여기서 쓴 값은 재시작 없이 바로 반영된다.
const REMOTE_PATH = 'data/guildConfig.json'

const DEFAULT_LOG_OPTIONS = {
  messageDelete: false,
  messageEdit: false,
  voiceJoin: false,
  voiceLeave: false,
  profanityFilter: false,
  spamFilter: false,
  warnLog: false,
  raidAlert: false,
  raidAnnounce: false,
  raidAnnounceRelease: false,
}

const DEFAULT_WELCOME_OPTIONS = {
  joinEnabled: false,
  leaveEnabled: false,
  showCreatedAt: false,
  showJoinedAt: false,
  showLeftAt: false,
  showMemberCount: false,
  showInviter: false,
}

const DEFAULT_JOIN_MESSAGE = '{유저}님이 {서버}에 입장했습니다'
const DEFAULT_LEAVE_MESSAGE = '{유저}님이 {서버}에서 퇴장했습니다'
const DEFAULT_SPAM_LEVEL = 3
const DEFAULT_RAID_CONFIG = { enabled: false, action: 'alert', alertChannelId: null, lockdown: false }
const DEFAULT_TICKET_MESSAGE = '문의사항이 있으면 아래 버튼을 눌러 티켓을 생성해주세요'
const DEFAULT_WARN_CONFIG = { logChannelId: null, maxCount: null, thresholds: [] }

async function loadGuild(client, guildId) {
  const all = await readJson(client, REMOTE_PATH)
  return all[guildId] ?? {}
}

async function patchGuild(client, guildId, updater) {
  const all = await readJson(client, REMOTE_PATH)
  const current = all[guildId] ?? {}
  all[guildId] = updater(current)
  await writeJson(client, REMOTE_PATH, all)
  return all[guildId]
}

// 설정 페이지 하나를 그릴 때 필요한 값을 한 번에 묶어서 돌려준다(기본값 채운 상태로).
export async function getGuildConfig(guildId) {
  return withSftp(async (client) => {
    const c = await loadGuild(client, guildId)
    return {
      logChannelId: c.logChannelId ?? null,
      logOptions: { ...DEFAULT_LOG_OPTIONS, ...(c.logOptions ?? {}) },
      logTypeChannels: c.logTypeChannels ?? {},
      joinChannelId: c.joinChannelId ?? c.welcomeChannelId ?? null,
      leaveChannelId: c.leaveChannelId ?? c.welcomeChannelId ?? null,
      welcomeOptions: { ...DEFAULT_WELCOME_OPTIONS, ...(c.welcomeOptions ?? {}) },
      welcomeMessages: {
        join: c.welcomeMessages?.join ?? DEFAULT_JOIN_MESSAGE,
        leave: c.welcomeMessages?.leave ?? DEFAULT_LEAVE_MESSAGE,
      },
      spamLevel: c.spamLevel ?? DEFAULT_SPAM_LEVEL,
      raidConfig: { ...DEFAULT_RAID_CONFIG, ...(c.raidConfig ?? {}) },
      raidLocked: c.raidLocked ?? false,
      ticketChannelId: c.ticketChannelId ?? null,
      ticketMessage: c.ticketMessage ?? DEFAULT_TICKET_MESSAGE,
      warnConfig: { ...DEFAULT_WARN_CONFIG, ...(c.warnConfig ?? {}) },
      wordChainChannelId: c.wordChainChannelId ?? null,
      announceChannelId: c.announceChannelId ?? null,
    }
  })
}

export async function setLogChannel(guildId, channelId) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, logChannelId: channelId })))
}

export async function setLogOption(guildId, key, enabled) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      logOptions: { ...DEFAULT_LOG_OPTIONS, ...(cur.logOptions ?? {}), [key]: enabled },
    })),
  )
}

export async function setLogTypeChannel(guildId, type, channelId) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      logTypeChannels: { ...(cur.logTypeChannels ?? {}), [type]: channelId },
    })),
  )
}

export async function setJoinChannel(guildId, channelId) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, joinChannelId: channelId })))
}

export async function setLeaveChannel(guildId, channelId) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, leaveChannelId: channelId })))
}

export async function setWelcomeOption(guildId, key, enabled) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      welcomeOptions: { ...DEFAULT_WELCOME_OPTIONS, ...(cur.welcomeOptions ?? {}), [key]: enabled },
    })),
  )
}

export async function setWelcomeMessage(guildId, type, message) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      welcomeMessages: { ...(cur.welcomeMessages ?? {}), [type]: message },
    })),
  )
}

export async function setSpamLevel(guildId, level) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, spamLevel: level })))
}

export async function setRaidConfig(guildId, updates) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      raidConfig: { ...DEFAULT_RAID_CONFIG, ...(cur.raidConfig ?? {}), ...updates },
    })),
  )
}

export async function setRaidLocked(guildId, locked) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, raidLocked: locked })))
}

export async function setTicketChannel(guildId, channelId) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, ticketChannelId: channelId })))
}

export async function setTicketMessage(guildId, message) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, ticketMessage: message })))
}

export async function setWarnThreshold(guildId, count, roleId, action, duration = null) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => {
      const warnConfig = { ...DEFAULT_WARN_CONFIG, ...(cur.warnConfig ?? {}) }
      warnConfig.thresholds = warnConfig.thresholds
        .filter((t) => t.count !== count)
        .concat([{ count, roleId: roleId ?? null, action, duration: duration ?? null }])
        .sort((a, b) => a.count - b.count)
      return { ...cur, warnConfig }
    }),
  )
}

export async function removeWarnThreshold(guildId, count) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => {
      const warnConfig = { ...DEFAULT_WARN_CONFIG, ...(cur.warnConfig ?? {}) }
      warnConfig.thresholds = warnConfig.thresholds.filter((t) => t.count !== count)
      return { ...cur, warnConfig }
    }),
  )
}

export async function setWarnMaxCount(guildId, maxCount) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      warnConfig: { ...DEFAULT_WARN_CONFIG, ...(cur.warnConfig ?? {}), maxCount: maxCount ?? null },
    })),
  )
}

export async function setWarnLogChannel(guildId, channelId) {
  return withSftp((client) =>
    patchGuild(client, guildId, (cur) => ({
      ...cur,
      warnConfig: { ...DEFAULT_WARN_CONFIG, ...(cur.warnConfig ?? {}), logChannelId: channelId ?? null },
    })),
  )
}

export async function setWordChainChannel(guildId, channelId) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, wordChainChannelId: channelId })))
}

export async function setAnnounceChannel(guildId, channelId) {
  return withSftp((client) => patchGuild(client, guildId, (cur) => ({ ...cur, announceChannelId: channelId })))
}
