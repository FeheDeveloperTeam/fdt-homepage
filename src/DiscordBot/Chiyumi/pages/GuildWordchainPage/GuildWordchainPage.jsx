import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ChannelSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

export default function GuildWordchainPage() {
  useDocumentTitle('끝말잇기', 'Chiyumi')
  const { guildId, channels, config, refreshConfig } = useOutletContext()

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  async function post(body) {
    setBusy(true)
    setStatus(null)
    try {
      await callGuildApi(`/api/guild?resource=config&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      await refreshConfig()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Server Settings</p>
      <h1 className="admin-page-title">끝말잇기</h1>
      <p className="admin-page-desc">끝말잇기 게임을 진행할 채널을 설정해요.</p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="admin-form" style={{ maxWidth: 420 }}>
        <ChannelSelect
          label="끝말잇기 채널"
          value={config.wordChainChannelId}
          channels={channels}
          disabled={busy}
          onChange={(value) => post({ section: 'wordchain', field: 'channel', value })}
        />
      </div>
      <p className="guild-hint">
        게임 시작 패널 메시지를 채널에 게시하는 건 디스코드 안에서 /끝말잇기 명령어로 해야 해요.
      </p>
    </div>
  )
}
