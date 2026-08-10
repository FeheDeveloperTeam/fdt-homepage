import { readSession, isAdminUser } from '../_lib/discordAuth.js'

export default async function handler(req, res) {
  const session = readSession(req)
  let payload = null
  if (session) {
    // accessToken은 길드 목록 조회 등 서버 쪽에서만 쓰는 값이라 클라이언트로는 안 보낸다.
    const { accessToken: _accessToken, ...user } = session
    payload = { ...user, isAdmin: await isAdminUser(user.id) }
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ user: payload }))
}
