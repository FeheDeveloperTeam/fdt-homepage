import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ChannelSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

export default function GuildTicketPage() {
  useDocumentTitle('티켓', 'Chiyumi')
  const { guildId, channels, config, refreshConfig } = useOutletContext()

  const [message, setMessage] = useState(config.ticketMessage)
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
      <h1 className="admin-page-title">티켓</h1>
      <p className="admin-page-desc">
        문의를 받을 채널과, 티켓 패널에 표시할 안내 문구를 설정해요.
      </p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="admin-form" style={{ maxWidth: 420 }}>
        <ChannelSelect
          label="티켓 채널"
          value={config.ticketChannelId}
          channels={channels}
          disabled={busy}
          onChange={(value) => post({ section: 'ticket', field: 'channel', value })}
        />
        <label className="admin-field">
          <span>안내 문구</span>
          <textarea
            value={message}
            disabled={busy}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => post({ section: 'ticket', field: 'message', value: message })}
          />
        </label>
      </div>
      <p className="guild-hint">
        실제로 서버 채널에 티켓 패널 메시지를 게시하는 건 디스코드 안에서 /티켓 명령어로 해야 해요.
      </p>
    </div>
  )
}
