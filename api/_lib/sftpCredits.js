import SftpClient from 'ssh2-sftp-client'

const REMOTE_PATH = 'data/credits.json'
const STARTING_BALANCE = 100

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

async function withSftp(fn) {
  const client = new SftpClient()
  try {
    await client.connect({
      host: requireEnv('SFTP_HOST'),
      port: Number(process.env.SFTP_PORT || 22),
      username: requireEnv('SFTP_USER'),
      password: requireEnv('SFTP_PASSWORD'),
      readyTimeout: 8000,
    })
    return await fn(client)
  } finally {
    await client.end().catch(() => {})
  }
}

async function readCredits(client) {
  const buffer = await client.get(REMOTE_PATH)
  return JSON.parse(buffer.toString('utf-8'))
}

async function writeCredits(client, balances) {
  await client.put(Buffer.from(JSON.stringify(balances, null, 2)), REMOTE_PATH)
}

export async function getCreditBalance(userId) {
  return withSftp(async (client) => {
    const balances = await readCredits(client)
    return balances[userId] ?? STARTING_BALANCE
  })
}

export async function adjustCreditBalance(userId, delta) {
  return withSftp(async (client) => {
    const balances = await readCredits(client)
    const current = balances[userId] ?? STARTING_BALANCE
    const next = current + delta
    balances[userId] = next
    await writeCredits(client, balances)
    return next
  })
}
