import { withSftp, readJson, writeJson } from './sftpClient.js'

const REMOTE_PATH = 'data/credits.json'
const STARTING_BALANCE = 100

export async function getCreditBalance(userId) {
  return withSftp(async (client) => {
    const balances = await readJson(client, REMOTE_PATH)
    return balances[userId] ?? STARTING_BALANCE
  })
}

export async function adjustCreditBalance(userId, delta) {
  return withSftp(async (client) => {
    const balances = await readJson(client, REMOTE_PATH)
    const current = balances[userId] ?? STARTING_BALANCE
    const next = current + delta
    balances[userId] = next
    await writeJson(client, REMOTE_PATH, balances)
    return next
  })
}
