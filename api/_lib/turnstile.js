function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

// Cloudflare Turnstile 위젯이 발급한 토큰을 서버에서 검증한다.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
export async function verifyTurnstileToken(token, remoteIp) {
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: requireEnv('TURNSTILE_SECRET_KEY'),
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    })
    const data = await res.json()
    return Boolean(data.success)
  } catch (err) {
    console.error('[turnstile] 검증 요청 실패', err)
    return false
  }
}
