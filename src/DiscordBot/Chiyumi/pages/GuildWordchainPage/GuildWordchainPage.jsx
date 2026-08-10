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

  async function handlePublish() {
    setBusy(true)
    setStatus(null)
    try {
      await callGuildApi(`/api/guild?resource=config&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify({ section: 'wordchain', field: 'publish' }),
      })
      setStatus({ type: 'success', text: '끝말잇기 채널에 파티 만들기 버튼을 게시했어요.' })
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

      <div className="admin-actions" style={{ marginTop: '1.2rem' }}>
        <button
          type="button"
          className="admin-btn admin-btn--accent"
          disabled={busy || !config.wordChainChannelId}
          onClick={handlePublish}
        >
          채널에 게시하기
        </button>
      </div>
      <p className="guild-hint">
        위 버튼을 누르면 끝말잇기 채널에 '파티 만들기' 버튼이 달린 안내 메시지를 바로 올려요.
      </p>
    </div>
  )
}
