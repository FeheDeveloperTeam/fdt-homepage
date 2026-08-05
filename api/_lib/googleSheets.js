import { JWT } from 'google-auth-library'

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

let authClient = null

function getAuthClient() {
  if (!authClient) {
    authClient = new JWT({
      email: requireEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: requireEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
  }
  return authClient
}

export async function getSheetValues(title) {
  const spreadsheetId = requireEnv('GOOGLE_SHEET_ID')
  const client = getAuthClient()
  const { token } = await client.getAccessToken()

  const range = encodeURIComponent(`'${title}'!A1:Z10000`)
  const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`구글 시트 조회 실패 (${title}): ${res.status} ${text}`)
  }

  const data = await res.json()
  const values = data.values || []
  return {
    header: values[0] || [],
    rows: values.slice(1),
  }
}
