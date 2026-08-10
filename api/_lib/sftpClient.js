import SftpClient from 'ssh2-sftp-client'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

export async function withSftp(fn) {
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

export async function readJson(client, remotePath, fallback = {}) {
  try {
    const buffer = await client.get(remotePath)
    return JSON.parse(buffer.toString('utf-8'))
  } catch (err) {
    if (err.code === 2 || /no such file/i.test(err.message || '')) return fallback
    throw err
  }
}

export async function writeJson(client, remotePath, data) {
  await client.put(Buffer.from(JSON.stringify(data, null, 2)), remotePath)
}
