import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ToggleRow, ChannelSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

const INFO_TOGGLES = [
  { key: 'showCreatedAt', label: '계정 생성일 표시' },
  { key: 'showJoinedAt', label: '서버 입장일 표시' },
  { key: 'showLeftAt', label: '퇴장 일시 표시 (퇴장 메시지용)' },
  { key: 'showMemberCount', label: '현재 서버 인원수 표시' },
  { key: 'showInviter', label: '초대자 표시 (입장 메시지용)' },
]

export default function GuildWelcomePage() {
  useDocumentTitle('입퇴장', 'Chiyumi')
  const { guildId, channels, config, refreshConfig } = useOutletContext()

  const [joinMessage, setJoinMessage] = useState(config.welcomeMessages.join)
  const [leaveMessage, setLeaveMessage] = useState(config.welcomeMessages.leave)
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
      <h1 className="admin-page-title">입퇴장</h1>
      <p className="admin-page-desc">
        멤버가 들어오거나 나갈 때 보낼 메시지와 채널을 설정해요. 메시지에는{' '}
        <code>{'{유저}'}</code>, <code>{'{서버}'}</code> 를 넣으면 자동으로 채워져요.
      </p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="guild-two-col">
        <div className="guild-section">
          <p className="guild-section-title">입장</p>
          <ToggleRow
            label="입장 메시지 사용"
            checked={Boolean(config.welcomeOptions.joinEnabled)}
            disabled={busy}
            onChange={(value) => post({ section: 'welcome', field: 'option', key: 'joinEnabled', value })}
          />
          <div className="admin-form" style={{ marginTop: '1rem' }}>
            <ChannelSelect
              label="입장 채널"
              value={config.joinChannelId}
              channels={channels}
              disabled={busy}
              onChange={(value) => post({ section: 'welcome', field: 'joinChannel', value })}
            />
            <label className="admin-field">
              <span>입장 메시지</span>
              <textarea
                value={joinMessage}
                disabled={busy}
                onChange={(e) => setJoinMessage(e.target.value)}
                onBlur={() => post({ section: 'welcome', field: 'message', key: 'join', value: joinMessage })}
              />
            </label>
          </div>
        </div>

        <div className="guild-section">
          <p className="guild-section-title">퇴장</p>
          <ToggleRow
            label="퇴장 메시지 사용"
            checked={Boolean(config.welcomeOptions.leaveEnabled)}
            disabled={busy}
            onChange={(value) => post({ section: 'welcome', field: 'option', key: 'leaveEnabled', value })}
          />
          <div className="admin-form" style={{ marginTop: '1rem' }}>
            <ChannelSelect
              label="퇴장 채널"
              value={config.leaveChannelId}
              channels={channels}
              disabled={busy}
              onChange={(value) => post({ section: 'welcome', field: 'leaveChannel', value })}
            />
            <label className="admin-field">
              <span>퇴장 메시지</span>
              <textarea
                value={leaveMessage}
                disabled={busy}
                onChange={(e) => setLeaveMessage(e.target.value)}
                onBlur={() => post({ section: 'welcome', field: 'message', key: 'leave', value: leaveMessage })}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="guild-section">
        <p className="guild-section-title">표시 항목</p>
        <p className="guild-section-desc">메시지 안에 추가로 표시할 정보를 골라요.</p>
        <div className="guild-toggle-grid" style={{ marginTop: '0.8rem' }}>
          {INFO_TOGGLES.map((opt) => (
            <ToggleRow
              key={opt.key}
              label={opt.label}
              checked={Boolean(config.welcomeOptions[opt.key])}
              disabled={busy}
              onChange={(value) => post({ section: 'welcome', field: 'option', key: opt.key, value })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
