import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ChannelSelect, RoleSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi, formatDate } from '../guildApi'
import '../AdminForm.css'

export default function GuildWarnPage() {
  useDocumentTitle('경고', 'Chiyumi')
  const { guildId, channels, roles, config, refreshConfig } = useOutletContext()

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  const [newCount, setNewCount] = useState('')
  const [newRoleId, setNewRoleId] = useState(null)
  const [newAction, setNewAction] = useState('')
  const [newDuration, setNewDuration] = useState('')

  const [targetUserId, setTargetUserId] = useState('')
  const [reason, setReason] = useState('')
  const [lookup, setLookup] = useState(null)

  async function post(body) {
    setBusy(true)
    setStatus(null)
    try {
      const data = await callGuildApi(`/api/guild?resource=config&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      await refreshConfig()
      return data
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
      throw err
    } finally {
      setBusy(false)
    }
  }

  async function handleAddThreshold(e) {
    e.preventDefault()
    const count = Number.parseInt(newCount, 10)
    if (!Number.isInteger(count) || count < 1) {
      setStatus({ type: 'error', text: '횟수는 1 이상의 정수로 입력해주세요.' })
      return
    }
    try {
      await post({
        section: 'warn',
        field: 'threshold',
        count,
        roleId: newRoleId,
        action: newAction.trim() || '역할 부여',
        duration: newDuration ? Number(newDuration) : null,
      })
      setNewCount('')
      setNewRoleId(null)
      setNewAction('')
      setNewDuration('')
      setStatus({ type: 'success', text: '임계값을 저장했어요.' })
    } catch {
      // post()가 이미 상태 메시지를 세팅함
    }
  }

  async function handleRemoveThreshold(count) {
    try {
      await post({ section: 'warn', field: 'removeThreshold', count })
    } catch {
      // 무시
    }
  }

  async function handleWarnAction(action) {
    const userId = targetUserId.trim()
    if (!userId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const data = await callGuildApi(`/api/guild?resource=warnings&guildId=${guildId}&userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        body: JSON.stringify({ action, reason: reason.trim() || undefined, amount: 1 }),
      })
      setLookup(data.warnings)
      setStatus({ type: 'success', text: '처리했어요.' })
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleLookup() {
    const userId = targetUserId.trim()
    if (!userId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const data = await callGuildApi(`/api/guild?resource=warnings&guildId=${guildId}&userId=${encodeURIComponent(userId)}`)
      setLookup(data.warnings)
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Server Settings</p>
      <h1 className="admin-page-title">경고</h1>
      <p className="admin-page-desc">경고 누적 시 자동 처리될 임계값과, 로그 채널을 설정해요.</p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="admin-form" style={{ maxWidth: 420 }}>
        <ChannelSelect
          label="경고 로그 채널"
          value={config.warnConfig.logChannelId}
          channels={channels}
          disabled={busy}
          onChange={(value) => post({ section: 'warn', field: 'logChannel', value })}
        />
        <label className="admin-field">
          <span>최대 경고 횟수 (선택, 비우면 무제한)</span>
          <input
            type="number"
            min="1"
            defaultValue={config.warnConfig.maxCount ?? ''}
            disabled={busy}
            onBlur={(e) =>
              post({ section: 'warn', field: 'maxCount', value: e.target.value ? Number(e.target.value) : null })
            }
          />
        </label>
      </div>

      <div className="guild-section">
        <p className="guild-section-title">임계값</p>
        <p className="guild-section-desc">경고가 이 횟수에 도달하면 지정한 조치를 자동으로 실행해요.</p>

        <div className="admin-list" style={{ maxWidth: 560 }}>
          {config.warnConfig.thresholds.length === 0 && (
            <p className="admin-chart-empty">등록된 임계값이 없어요.</p>
          )}
          {config.warnConfig.thresholds.map((t) => (
            <div className="admin-list-row" key={t.count}>
              <div className="admin-list-info">
                <span className="admin-list-name">{t.count}회 → {t.action}</span>
                <span className="admin-list-id">
                  {t.roleId && `역할 ${t.roleId}`}
                  {t.duration && ` · ${t.duration}분`}
                </span>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-list-remove"
                onClick={() => handleRemoveThreshold(t.count)}
                disabled={busy}
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        <form className="admin-form" onSubmit={handleAddThreshold} style={{ maxWidth: 420, marginTop: '1.4rem' }}>
          <label className="admin-field">
            <span>경고 횟수</span>
            <input
              type="number"
              min="1"
              value={newCount}
              disabled={busy}
              onChange={(e) => setNewCount(e.target.value)}
              placeholder="예: 3"
            />
          </label>
          <label className="admin-field">
            <span>조치 (예: kick, ban, mute, role)</span>
            <input
              type="text"
              value={newAction}
              disabled={busy}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="예: kick"
            />
          </label>
          <RoleSelect label="부여할 역할 (선택)" value={newRoleId} roles={roles} disabled={busy} onChange={setNewRoleId} />
          <label className="admin-field">
            <span>기간(분, 선택 — 타임아웃/뮤트용)</span>
            <input
              type="number"
              min="1"
              value={newDuration}
              disabled={busy}
              onChange={(e) => setNewDuration(e.target.value)}
            />
          </label>
          <div className="admin-actions">
            <button type="submit" className="admin-btn admin-btn--accent" disabled={busy}>
              임계값 추가/수정
            </button>
          </div>
        </form>
      </div>

      <div className="guild-section">
        <p className="guild-section-title">경고 부여 · 제거 · 조회</p>
        <div className="admin-form" style={{ maxWidth: 420 }}>
          <label className="admin-field">
            <span>디스코드 유저 ID</span>
            <input
              type="text"
              value={targetUserId}
              disabled={busy}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="예: 826036359499481109"
            />
          </label>
          <label className="admin-field">
            <span>사유 (경고 부여 시)</span>
            <input type="text" value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
          </label>
          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn--accent" disabled={busy} onClick={() => handleWarnAction('add')}>
              경고 부여
            </button>
            <button type="button" className="admin-btn admin-btn--neutral" disabled={busy} onClick={() => handleWarnAction('remove')}>
              경고 1회 제거
            </button>
            <button type="button" className="admin-btn admin-btn--danger" disabled={busy} onClick={() => handleWarnAction('reset')}>
              전체 초기화
            </button>
            <button type="button" className="admin-btn admin-btn--neutral" disabled={busy} onClick={handleLookup}>
              조회
            </button>
          </div>
        </div>

        {lookup && (
          <div className="admin-result" style={{ maxWidth: 420 }}>
            <div className="admin-result-row">
              <span>현재 경고 횟수</span>
              <strong>{lookup.count}회</strong>
            </div>
            {lookup.history.slice().reverse().map((h) => (
              <div className="admin-result-row" key={h.id}>
                <span>{formatDate(new Date(h.timestamp * 1000).toISOString())}</span>
                <strong>{h.reason}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
