import { JWT } from 'google-auth-library'

// 유료 서비스(서버별 봇 프로필 커스텀) 데이터는 운영 중인 구글 시트(GOOGLE_SHEET_ID)에 둔다.
// 치유미 봇(src/utils/premium.js)도 같은 탭·컬럼을 읽고 쓰므로, 탭 이름이나 컬럼 순서를 바꿀 때는 두 쪽을 함께 고친다.
//
//  「유료이용권」 탭 — 운영자가 시트에서 직접 적는다(결제 수단이 붙기 전까지).
//      서버ID | 서버이름 | 상품 | 시작일 | 만료일 | 메모
//      상품이 비어 있거나 「봇프로필」이면 이 기능의 이용권이다. 만료일 당일(KST)까지 쓸 수 있고,
//      만료일 칸에 「영구」라고 적으면 기간 없는 이용권이다. 같은 서버에 행이 여러 개면 영구 > 가장 늦은 만료일 순으로 쓴다.
//      개발자 관리자 화면(/DiscordBot/Chiyumi/admin/premium)에서 주면 서버당 한 줄로 정리해 적는다.
//  「봇프로필」 탭 — fehe.dev 설정 화면이 적용할 때마다 적고, 봇이 만료 해제 결과를 적는다.
//      서버ID | 서버이름 | 별명 | 소개글 | 프로필 사진 | 배너 | 상태 | 마지막 변경자ID | 마지막 변경 일시
//      상태: 적용중 · 기본으로 되돌림 · 만료로 해제
// 봇의 15분 주기 시트 백업(syncDataToSheets)은 자기 탭만 덮어쓰므로 이 두 탭은 건드리지 않는다.

export const SUBSCRIPTION_TAB = '유료이용권'
export const PROFILE_TAB = '봇프로필'
export const SUBSCRIPTION_HEADER = ['서버ID', '서버이름', '상품', '시작일', '만료일', '메모']
export const PROFILE_HEADER = ['서버ID', '서버이름', '별명', '소개글', '프로필 사진', '배너', '상태', '마지막 변경자ID', '마지막 변경 일시']
export const PRODUCT_NAME = '봇프로필'

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

// 관리자 화면용 googleSheets.js는 읽기 전용 권한이라, 쓰기가 필요한 이 기능은 따로 만든다.
let authClient = null
function getAuthClient() {
  if (!authClient) {
    authClient = new JWT({
      email: requireEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: requireEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  }
  return authClient
}

async function sheetsRequest(path, options = {}) {
  const { token } = await getAuthClient().getAccessToken()
  const res = await fetch(`${SHEETS_API_BASE}/${requireEnv('GOOGLE_SHEET_ID')}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`구글 시트 요청 실패 (${path.split('?')[0]}): ${res.status} ${text}`.trim())
  }
  return res.json()
}

const rangeOf = (title, a1) => encodeURIComponent(`'${title}'!${a1}`)

// 탭이 없으면 만들고 첫 줄에 머리글을 적는다. 운영자가 처음 시트를 열었을 때 어디에 무엇을 적을지 보이게 한다.
async function ensureTab(title, header) {
  const meta = await sheetsRequest('?fields=sheets.properties(title,sheetId)')
  const exists = meta.sheets.some((s) => s.properties.title === title)
  if (!exists) {
    const created = await sheetsRequest(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
    })
    // 서버ID(18~19자리)를 숫자로 적으면 시트가 지수 표기로 바꿔 끝자리를 잃는다. A열을 처음부터 「일반 텍스트」로 둔다.
    const sheetId = created.replies?.[0]?.addSheet?.properties?.sheetId
    if (sheetId != null) {
      await sheetsRequest(':batchUpdate', {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            repeatCell: {
              range: { sheetId, startColumnIndex: 0, endColumnIndex: 1 },
              cell: { userEnteredFormat: { numberFormat: { type: 'TEXT' } } },
              fields: 'userEnteredFormat.numberFormat',
            },
          }],
        }),
      })
    }
  }
  const first = await sheetsRequest(`/values/${rangeOf(title, 'A1:Z1')}`)
  if (!first.values?.[0]?.length) {
    await sheetsRequest(`/values/${rangeOf(title, 'A1')}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values: [header] }),
    })
  }
}

// 탭 확인은 함수 인스턴스마다 한 번만 한다(시트 API 분당 요청 한도를 아끼려고).
const ensuredTabs = new Set()

async function readTab(title, header) {
  if (!ensuredTabs.has(title)) {
    await ensureTab(title, header)
    ensuredTabs.add(title)
  }
  const data = await sheetsRequest(`/values/${rangeOf(title, 'A1:Z5000')}`)
  return (data.values || []).slice(1)
}

// 「2026-12-24」, 「2026. 12. 24」, 「2026/12/24」 모두 받는다(시트 셀 서식에 따라 표시가 달라서).
export function parseSheetDate(value) {
  const m = String(value || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)
  if (!m) return null
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
}

export function todayKst() {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)
}

export function daysBetween(fromYmd, toYmd) {
  return Math.round((Date.parse(`${toYmd}T00:00:00Z`) - Date.parse(`${fromYmd}T00:00:00Z`)) / 86_400_000)
}

// 만료일 칸에 「영구」(또는 무기한·permanent)라고 적으면 기간 없는 이용권이다.
export const PERMANENT_TEXT = '영구'
export const isPermanentText = (value) => /^\s*(영구|무기한|permanent)\s*$/i.test(String(value || ''))

const NO_SUBSCRIPTION = { active: false, permanent: false, startDate: null, endDate: null, daysLeft: null }

// 이용권 행을 서버별로 묶는다. 영구가 하나라도 있으면 영구, 아니면 가장 늦은 만료일을 쓴다.
// rows는 머리글을 뺀 행 목록이고, rowNumbers는 시트의 실제 줄 번호(머리글이 1번)다.
function summarize(rows) {
  const today = todayKst()
  const byGuild = new Map()
  rows.forEach((row, i) => {
    const guildId = String(row[0] || '').trim()
    const product = String(row[2] || '').trim()
    if (!guildId || (product && product !== PRODUCT_NAME)) return
    const entry = byGuild.get(guildId) ?? { guildId, name: '', memo: '', rowNumbers: [], best: null }
    entry.rowNumbers.push(i + 2)
    if (!entry.name && row[1]) entry.name = String(row[1])
    if (row[5]) entry.memo = String(row[5])
    byGuild.set(guildId, entry)

    const startDate = parseSheetDate(row[3])
    if (startDate && startDate > today) return
    const permanent = isPermanentText(row[4])
    const endDate = permanent ? null : parseSheetDate(row[4])
    if (!permanent && !endDate) return
    const best = entry.best
    if (!best || permanent || (!best.permanent && endDate > best.endDate)) {
      if (!best?.permanent) entry.best = { permanent, startDate, endDate }
    }
  })

  const result = new Map()
  for (const [guildId, entry] of byGuild) {
    const best = entry.best
    let subscription = NO_SUBSCRIPTION
    if (best?.permanent) {
      subscription = { active: true, permanent: true, startDate: best.startDate, endDate: null, daysLeft: null }
    } else if (best) {
      const daysLeft = daysBetween(today, best.endDate)
      subscription = { active: daysLeft >= 0, permanent: false, startDate: best.startDate, endDate: best.endDate, daysLeft }
    }
    result.set(guildId, { ...subscription, guildId, name: entry.name, memo: entry.memo, rowNumbers: entry.rowNumbers })
  }
  return result
}

export async function getSubscription(guildId) {
  const all = summarize(await readTab(SUBSCRIPTION_TAB, SUBSCRIPTION_HEADER))
  const found = all.get(guildId)
  if (!found) return NO_SUBSCRIPTION
  const { active, permanent, startDate, endDate, daysLeft } = found
  return { active, permanent, startDate, endDate, daysLeft }
}

// 개발자 관리자 화면용: 서버별 이용권 요약 목록
export async function listSubscriptions() {
  return [...summarize(await readTab(SUBSCRIPTION_TAB, SUBSCRIPTION_HEADER)).values()]
}

async function getTabSheetId(title) {
  const meta = await sheetsRequest('?fields=sheets.properties(title,sheetId)')
  return meta.sheets.find((s) => s.properties.title === title)?.properties.sheetId
}

// 한 서버의 이용권을 한 줄로 정리해 적는다. 같은 서버의 다른 줄(예전에 손으로 추가한 연장 줄 등)은 지운다.
export async function writeSubscription(guildId, { name, startDate, endValue, memo }) {
  const all = summarize(await readTab(SUBSCRIPTION_TAB, SUBSCRIPTION_HEADER))
  const rowNumbers = all.get(guildId)?.rowNumbers ?? []
  const values = [[guildId, name || '', PRODUCT_NAME, startDate || '', endValue, memo || '']]

  if (rowNumbers.length > 0) {
    const [first, ...extra] = rowNumbers
    await sheetsRequest(`/values/${rangeOf(SUBSCRIPTION_TAB, `A${first}:F${first}`)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    })
    if (extra.length > 0) {
      const sheetId = await getTabSheetId(SUBSCRIPTION_TAB)
      // 아래 줄부터 지워야 위쪽 줄 번호가 밀리지 않는다.
      const requests = [...extra].sort((a, b) => b - a).map((n) => ({
        deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: n - 1, endIndex: n } },
      }))
      await sheetsRequest(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests }) })
    }
  } else {
    await sheetsRequest(`/values/${rangeOf(SUBSCRIPTION_TAB, 'A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      body: JSON.stringify({ values }),
    })
  }
}

function rowToProfile(row) {
  return {
    nick: row[2] || '',
    bio: row[3] || '',
    avatar: row[4] || '',
    banner: row[5] || '',
    status: row[6] || '',
    updatedBy: row[7] || '',
    updatedAt: row[8] || '',
  }
}

export async function getProfileRecord(guildId) {
  const rows = await readTab(PROFILE_TAB, PROFILE_HEADER)
  const row = rows.find((r) => String(r[0] || '').trim() === guildId)
  return row ? rowToProfile(row) : null
}

function nowKstText() {
  return new Date(Date.now() + 9 * 3600_000).toISOString().replace('T', ' ').slice(0, 19)
}

// 서버 한 줄을 고치거나(있으면) 새로 붙인다. patch에 없는 칸은 그대로 둔다.
export async function upsertProfileRecord(guildId, guildName, patch, userId) {
  const rows = await readTab(PROFILE_TAB, PROFILE_HEADER)
  const index = rows.findIndex((r) => String(r[0] || '').trim() === guildId)
  const current = index >= 0 ? rowToProfile(rows[index]) : rowToProfile([])
  const next = { ...current, ...patch }
  const values = [[guildId, guildName || '', next.nick, next.bio, next.avatar, next.banner, next.status, userId, nowKstText()]]

  if (index >= 0) {
    const rowNumber = index + 2 // 머리글 1줄 + 0부터 센 번호
    await sheetsRequest(`/values/${rangeOf(PROFILE_TAB, `A${rowNumber}:I${rowNumber}`)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    })
  } else {
    await sheetsRequest(`/values/${rangeOf(PROFILE_TAB, 'A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      body: JSON.stringify({ values }),
    })
  }
  return { ...next }
}
