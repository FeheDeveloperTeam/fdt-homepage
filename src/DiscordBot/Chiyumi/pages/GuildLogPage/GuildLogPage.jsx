import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ToggleRow, ChannelSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

const LOG_OPTIONS = [
  { key: 'messageDelete', label: '메시지 삭제' },
  { key: 'messageEdit', label: '메시지 수정' },
  { key: 'voiceJoin', label: '음성채널 입장' },
  { key: 'voiceLeave', label: '음성채널 퇴장' },
  { key: 'profanityFilter', label: '욕설 필터 감지' },
  { key: 'spamFilter', label: '스팸 필터 감지' },
  { key: 'warnLog', label: '경고' },
  { key: 'raidAlert', label: '레이드 알림' },
  { key: 'raidAnnounce', label: '레이드 공지(서버원)', usesAnnounceChannel: true },
  { key: 'raidAnnounceRelease', label: '레이드 해제 공지(서버원)', usesAnnounceChannel: true },
]

export default function GuildLogPage() {
  useDocumentTitle('로그', 'Chiyumi')
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
      <h1 className="admin-page-title">로그</h1>
      <p className="admin-page-desc">
        서버에서 일어나는 일들을 기본 로그 채널로 보내거나, 항목별로 다른 채널을 지정할 수 있어요.
      </p>

      <div className="admin-form" style={{ maxWidth: 420 }}>
        <ChannelSelect
          label="기본 로그 채널"
          value={config.logChannelId}
          channels={channels}
          disabled={busy}
          onChange={(value) => post({ section: 'log', field: 'channel', value })}
        />
      </div>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="guild-section">
        <p className="guild-section-title">항목별 설정</p>
        <p className="guild-section-desc">
          채널을 따로 지정하지 않으면 기본 로그 채널로 보내요.
        </p>

        <div className="guild-toggle-grid" style={{ marginTop: '1rem' }}>
          {LOG_OPTIONS.map((opt) => {
            const overrideValue = opt.usesAnnounceChannel
              ? config.announceChannelId
              : (config.logTypeChannels[opt.key] ?? null)

            return (
              <div key={opt.key}>
                <ToggleRow
                  label={opt.label}
                  checked={Boolean(config.logOptions[opt.key])}
                  disabled={busy}
                  onChange={(value) => post({ section: 'log', field: 'option', key: opt.key, value })}
                />
                {config.logOptions[opt.key] && (
                  <div style={{ margin: '0.4rem 0 0.9rem', maxWidth: 320 }}>
                    <ChannelSelect
                      label={`${opt.label} 채널 (선택)`}
                      value={overrideValue}
                      channels={channels}
                      disabled={busy}
                      onChange={(value) =>
                        opt.usesAnnounceChannel
                          ? post({ section: 'announce', field: 'channel', value })
                          : post({ section: 'log', field: 'typeChannel', key: opt.key, value })
                      }
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
