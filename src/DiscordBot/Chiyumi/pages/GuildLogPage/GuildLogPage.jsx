import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ToggleRow, ChannelSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

// 비슷한 항목끼리 묶어 보여 준다. 레이드 공지 두 개는 서버원에게 보내는 글이라 로그 채널이 아니라
// 「공지 채널」(/공지와 같은 채널)을 쓴다.
const LOG_GROUPS = [
  {
    title: '메시지',
    options: [
      { key: 'messageDelete', label: '메시지 삭제' },
      { key: 'messageEdit', label: '메시지 수정' },
    ],
  },
  {
    title: '음성채널',
    options: [
      { key: 'voiceJoin', label: '음성채널 입장' },
      { key: 'voiceLeave', label: '음성채널 퇴장' },
    ],
  },
  {
    title: '검열 · 경고',
    options: [
      { key: 'profanityFilter', label: '욕설 필터에 걸린 메시지' },
      { key: 'spamFilter', label: '스팸 필터에 걸린 메시지' },
      { key: 'warnLog', label: '경고 지급' },
    ],
  },
  {
    title: '레이드',
    options: [
      { key: 'raidAlert', label: '레이드 감지 알림 (관리자용)' },
      { key: 'raidAnnounce', label: '레이드 공지 (서버원용)', usesAnnounceChannel: true },
      { key: 'raidAnnounceRelease', label: '레이드 해제 공지 (서버원용)', usesAnnounceChannel: true },
    ],
  },
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

      <div className="admin-form">
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
          켜 둔 항목만 기록해요. 보낼 채널을 비워 두면 위의 기본 로그 채널로 보내요. 레이드 공지는 서버원이 보는 공지 채널로 가요.
        </p>

        {LOG_GROUPS.map((group) => (
          <div className="guild-log-group" key={group.title}>
            <p className="guild-log-group-title">{group.title}</p>
            {group.options.map((opt) => {
              const on = Boolean(config.logOptions[opt.key])
              const overrideValue = opt.usesAnnounceChannel
                ? config.announceChannelId
                : (config.logTypeChannels[opt.key] ?? null)

              // 이름 · 보낼 채널 · 켜기를 한 줄에 둬서 항목마다 높이가 달라 두 열이 어긋나던 문제를 없앤다.
              return (
                <div className="guild-log-row" key={opt.key}>
                  <span className="guild-toggle-label">{opt.label}</span>
                  <div className="guild-log-channel">
                    {on ? (
                      <ChannelSelect
                        label={opt.usesAnnounceChannel ? '공지 채널' : '보낼 채널 (비우면 기본 로그 채널)'}
                        value={overrideValue}
                        channels={channels}
                        disabled={busy}
                        onChange={(value) =>
                          opt.usesAnnounceChannel
                            ? post({ section: 'announce', field: 'channel', value })
                            : post({ section: 'log', field: 'typeChannel', key: opt.key, value })
                        }
                      />
                    ) : (
                      <span className="guild-log-off">꺼져 있어요</span>
                    )}
                  </div>
                  <ToggleRow
                    label=""
                    checked={on}
                    disabled={busy}
                    onChange={(value) => post({ section: 'log', field: 'option', key: opt.key, value })}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
