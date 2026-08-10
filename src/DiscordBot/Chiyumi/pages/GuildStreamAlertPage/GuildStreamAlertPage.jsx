import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ChannelSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

const PLATFORMS = [
  { value: 'youtube', label: '유튜브 라이브' },
  { value: 'youtube_upload', label: '유튜브 업로드' },
  { value: 'chzzk', label: '치지직' },
  { value: 'soop', label: '숲(SOOP)' },
]

const MENTIONS = [
  { value: 'none', label: '멘션 없음' },
  { value: 'everyone', label: '@everyone' },
  { value: 'here', label: '@here' },
]

function EditRow({ alert, channels, busy, onSave, onCancel }) {
  const [notifChannelId, setNotifChannelId] = useState(alert.notifChannelId)
  const [customText, setCustomText] = useState(alert.customText || '')
  const [mention, setMention] = useState(alert.mention || 'none')

  return (
    <div className="admin-form" style={{ marginTop: '0.6rem' }}>
      <ChannelSelect label="알림 채널" value={notifChannelId} channels={channels} disabled={busy} allowNone={false} onChange={setNotifChannelId} />
      <label className="admin-field">
        <span>알림 문구 (선택, {'{name}'}/{'{url}'} 사용 가능)</span>
        <textarea value={customText} disabled={busy} onChange={(e) => setCustomText(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>멘션</span>
        <select value={mention} disabled={busy} onChange={(e) => setMention(e.target.value)}>
          {MENTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>
      <div className="admin-actions">
        <button
          type="button"
          className="admin-btn admin-btn--accent"
          disabled={busy}
          onClick={() => onSave({ notifChannelId, customText: customText || null, mention })}
        >
          저장
        </button>
        <button type="button" className="admin-btn admin-btn--neutral" disabled={busy} onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  )
}

export default function GuildStreamAlertPage() {
  useDocumentTitle('방송알림', 'Chiyumi')
  const { guildId, channels } = useOutletContext()

  const [alerts, setAlerts] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [platform, setPlatform] = useState('youtube')
  const [channelLink, setChannelLink] = useState('')
  const [channelName, setChannelName] = useState('')
  const [notifChannelId, setNotifChannelId] = useState(null)
  const [customText, setCustomText] = useState('')
  const [mention, setMention] = useState('none')

  function loadAlerts() {
    return callGuildApi(`/api/guild?resource=streamalert&guildId=${guildId}`)
      .then((data) => setAlerts(data.alerts))
      .catch((err) => setStatus({ type: 'error', text: err.message }))
  }

  useEffect(() => {
    loadAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!channelLink.trim() || !channelName.trim() || !notifChannelId) {
      setStatus({ type: 'error', text: '채널 링크, 이름, 알림 채널을 모두 입력해주세요.' })
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      await callGuildApi(`/api/guild?resource=streamalert&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add',
          platform,
          channelLink: channelLink.trim(),
          channelName: channelName.trim(),
          notifChannelId,
          customText: customText.trim() || undefined,
          mention,
        }),
      })
      setChannelLink('')
      setChannelName('')
      setCustomText('')
      setStatus({ type: 'success', text: '방송알림을 등록했어요.' })
      await loadAlerts()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(alertId) {
    setBusy(true)
    setStatus(null)
    try {
      await callGuildApi(`/api/guild?resource=streamalert&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'remove', alertId }),
      })
      await loadAlerts()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(alertId, updates) {
    setBusy(true)
    setStatus(null)
    try {
      await callGuildApi(`/api/guild?resource=streamalert&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', alertId, updates }),
      })
      setEditingId(null)
      await loadAlerts()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Server Settings</p>
      <h1 className="admin-page-title">방송알림</h1>
      <p className="admin-page-desc">유튜브·치지직·숲 방송/업로드 알림을 등록·관리해요.</p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="admin-list" style={{ maxWidth: 560 }}>
        {!alerts && <p className="admin-chart-empty">불러오는 중이에요…</p>}
        {alerts?.length === 0 && <p className="admin-chart-empty">등록된 방송알림이 없어요.</p>}
        {alerts?.map((a) => (
          <div key={a.id}>
            <div className="admin-list-row">
              <div className="admin-list-info">
                <span className="admin-list-name">
                  {PLATFORMS.find((p) => p.value === a.platform)?.label ?? a.platform} · {a.channelName}
                </span>
                <span className="admin-list-id">
                  알림채널 #{channels.find((c) => c.id === a.notifChannelId)?.name ?? a.notifChannelId}
                  {a.isLive && ' · 방송 중'}
                </span>
              </div>
              <button type="button" className="admin-btn admin-btn--neutral admin-list-remove" disabled={busy} onClick={() => setEditingId(editingId === a.id ? null : a.id)}>
                {editingId === a.id ? '닫기' : '수정'}
              </button>
              <button type="button" className="admin-btn admin-btn--danger admin-list-remove" disabled={busy} onClick={() => handleRemove(a.id)}>
                삭제
              </button>
            </div>
            {editingId === a.id && (
              <EditRow alert={a} channels={channels} busy={busy} onCancel={() => setEditingId(null)} onSave={(u) => handleUpdate(a.id, u)} />
            )}
          </div>
        ))}
      </div>

      <div className="guild-section">
        <p className="guild-section-title">새 방송알림 등록</p>
        <form className="admin-form" onSubmit={handleAdd}>
          <label className="admin-field">
            <span>플랫폼</span>
            <select value={platform} disabled={busy} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>채널 링크</span>
            <input
              type="text"
              value={channelLink}
              disabled={busy}
              onChange={(e) => setChannelLink(e.target.value)}
              placeholder="예: https://www.youtube.com/@handle"
            />
          </label>
          <label className="admin-field">
            <span>표시할 채널 이름</span>
            <input type="text" value={channelName} disabled={busy} onChange={(e) => setChannelName(e.target.value)} />
          </label>
          <ChannelSelect label="알림 보낼 채널" value={notifChannelId} channels={channels} disabled={busy} allowNone={false} onChange={setNotifChannelId} />
          <label className="admin-field">
            <span>알림 문구 (선택)</span>
            <textarea value={customText} disabled={busy} onChange={(e) => setCustomText(e.target.value)} />
          </label>
          <label className="admin-field">
            <span>멘션</span>
            <select value={mention} disabled={busy} onChange={(e) => setMention(e.target.value)}>
              {MENTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
          <div className="admin-actions">
            <button type="submit" className="admin-btn admin-btn--accent" disabled={busy}>
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
