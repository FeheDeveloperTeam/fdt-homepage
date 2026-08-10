import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ToggleRow } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

const RAID_ACTIONS = [
  { value: 'alert', label: '알림만' },
  { value: 'kick', label: '자동 추방' },
  { value: 'ban', label: '자동 차단' },
]

export default function GuildCensorPage() {
  useDocumentTitle('검열 · 스팸 · 레이드', 'Chiyumi')
  const { guildId, config, refreshConfig } = useOutletContext()

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
      <h1 className="admin-page-title">검열 · 스팸 · 레이드</h1>
      <p className="admin-page-desc">욕설·스팸 감지 여부와, 레이드(대량 유입) 대응 방식을 설정해요.</p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="guild-two-col">
        <div>
          <div className="guild-section">
            <p className="guild-section-title">욕설 필터</p>
            <ToggleRow
              label="욕설 필터 사용"
              checked={Boolean(config.logOptions.profanityFilter)}
              disabled={busy}
              onChange={(value) => post({ section: 'log', field: 'option', key: 'profanityFilter', value })}
            />
          </div>

          <div className="guild-section">
            <p className="guild-section-title">스팸 필터</p>
            <ToggleRow
              label="스팸 필터 사용"
              checked={Boolean(config.logOptions.spamFilter)}
              disabled={busy}
              onChange={(value) => post({ section: 'log', field: 'option', key: 'spamFilter', value })}
            />
            <label className="admin-field" style={{ maxWidth: 240, marginTop: '0.9rem' }}>
              <span>민감도 (1: 관대함 ~ 5: 엄격함)</span>
              <select
                value={config.spamLevel}
                disabled={busy}
                onChange={(e) => post({ section: 'censor', field: 'spamLevel', value: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="guild-section">
          <p className="guild-section-title">레이드 대응</p>
          <ToggleRow
            label="레이드 감지 사용"
            checked={Boolean(config.raidConfig.enabled)}
            disabled={busy}
            onChange={(value) => post({ section: 'censor', field: 'raidConfig', updates: { enabled: value } })}
          />
          <ToggleRow
            label="감지 시 자동 서버 잠금(락다운)"
            checked={Boolean(config.raidConfig.lockdown)}
            disabled={busy}
            onChange={(value) => post({ section: 'censor', field: 'raidConfig', updates: { lockdown: value } })}
          />
          <label className="admin-field" style={{ maxWidth: 240, marginTop: '0.9rem' }}>
            <span>감지 시 조치</span>
            <select
              value={config.raidConfig.action}
              disabled={busy}
              onChange={(e) => post({ section: 'censor', field: 'raidConfig', updates: { action: e.target.value } })}
            >
              {RAID_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          {config.raidLocked && (
            <div style={{ marginTop: '1.2rem' }}>
              <p className="admin-status admin-status--error">현재 레이드로 인해 서버가 잠겨 있어요.</p>
              <button
                type="button"
                className="admin-btn admin-btn--accent"
                disabled={busy}
                onClick={() => post({ section: 'censor', field: 'raidUnlock' })}
              >
                잠금 해제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
