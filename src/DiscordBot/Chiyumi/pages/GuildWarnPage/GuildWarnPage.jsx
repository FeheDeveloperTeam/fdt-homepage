import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { ChannelSelect, RoleSelect } from '../../components/GuildSettings/GuildSettings'
import { callGuildApi, formatDate } from '../guildApi'
import '../AdminForm.css'

// 봇(interactionCreate.js WARN_ACTION_LABEL)과 같은 값·이름. 봇은 none·mute·kick·ban만 실행한다.
const WARN_ACTIONS = [
  { value: 'none', label: '없음 (역할만 부여)' },
  { value: 'mute', label: '뮤트 (타임아웃)' },
  { value: 'kick', label: '킥 (추방)' },
  { value: 'ban', label: '영구 밴 (차단)' },
]
const actionLabel = (value) => WARN_ACTIONS.find((a) => a.value === value)?.label ?? `${value} (봇이 모르는 조치 — 다시 저장해주세요)`
// 봇은 뮤트 기간을 밀리초로 읽는다(기본 1시간). 화면에서는 분으로 받고 저장할 때 바꾼다. 디스코드 타임아웃은 최대 28일.
const MINUTE_MS = 60_000
const MAX_MUTE_MINUTES = 28 * 24 * 60

function durationText(ms) {
  if (!ms) return null
  if (ms < MINUTE_MS) return '기간이 잘못 저장됨 — 다시 저장해주세요'
  const minutes = Math.round(ms / MINUTE_MS)
  if (minutes % 1440 === 0) return `${minutes / 1440}일`
  if (minutes % 60 === 0) return `${minutes / 60}시간`
  return `${minutes}분`
}

export default function GuildWarnPage() {
  useDocumentTitle('경고', 'Chiyumi')
  const { guildId, channels, roles, config, refreshConfig } = useOutletContext()

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  const [newCount, setNewCount] = useState('')
  const [newRoleId, setNewRoleId] = useState(null)
  const [newAction, setNewAction] = useState('none')
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
    const minutes = newDuration ? Number.parseInt(newDuration, 10) : null
    if (newAction === 'mute' && minutes != null && (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_MUTE_MINUTES)) {
      setStatus({ type: 'error', text: `뮤트 기간은 1분 ~ ${MAX_MUTE_MINUTES}분(28일) 사이로 입력해주세요.` })
      return
    }
    if (newAction === 'none' && !newRoleId) {
      setStatus({ type: 'error', text: '조치가 「없음」이면 부여할 역할을 골라주세요.' })
      return
    }
    try {
      await post({
        section: 'warn',
        field: 'threshold',
        count,
        roleId: newRoleId,
        action: newAction,
        duration: newAction === 'mute' && minutes ? minutes * MINUTE_MS : null,
      })
      setNewCount('')
      setNewRoleId(null)
      setNewAction('none')
      setNewDuration('')
      setStatus({ type: 'success', text: `경고 ${count}회 자동 조치를 저장했어요.` })
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
    if (action === 'reset' && !window.confirm('이 멤버의 경고 기록을 모두 지울까요? 되돌릴 수 없어요.')) return
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
      <p className="admin-page-desc">경고 기록을 남길 채널, 최대 경고 횟수, 경고가 쌓였을 때의 자동 조치를 정하고, 멤버에게 경고를 주거나 지워요.</p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="admin-form">
        <ChannelSelect
          label="경고 로그 채널"
          value={config.warnConfig.logChannelId}
          channels={channels}
          disabled={busy}
          onChange={(value) => post({ section: 'warn', field: 'logChannel', value })}
        />
        <label className="admin-field">
          <span>최대 경고 횟수 (도달하면 영구 밴, 비우면 제한 없음)</span>
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
        <p className="guild-section-title">경고 누적 자동 조치</p>
        <p className="guild-section-desc">
          경고가 정한 횟수가 되면 역할을 주거나 뮤트·킥·영구 밴을 자동으로 실행해요. 같은 횟수로 다시 저장하면 덮어써요.
        </p>

        <div className="admin-list">
          {config.warnConfig.thresholds.length === 0 && (
            <p className="guild-empty">아직 정한 자동 조치가 없어요.</p>
          )}
          {[...config.warnConfig.thresholds].sort((a, b) => a.count - b.count).map((t) => (
            <div className="admin-list-row" key={t.count}>
              <div className="admin-list-info">
                <span className="admin-list-name">경고 {t.count}회 → {actionLabel(t.action)}</span>
                {/* 역할·기간 중 있는 것만 이어 붙인다(역할 없이 기간만 있으면 앞에 「·」가 홀로 붙지 않게) */}
                {(t.roleId || (t.action === 'mute' && t.duration)) && (
                  <span className="admin-list-id">
                    {[
                      t.roleId && `역할 @${roles.find((r) => r.id === t.roleId)?.name ?? t.roleId}`,
                      t.action === 'mute' && t.duration && `뮤트 ${durationText(t.duration)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
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

        <form className="admin-form" onSubmit={handleAddThreshold} style={{ marginTop: '1.4rem' }}>
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
            <span>자동 조치</span>
            <select value={newAction} disabled={busy} onChange={(e) => setNewAction(e.target.value)}>
              {WARN_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <RoleSelect label="함께 줄 역할 (선택)" value={newRoleId} roles={roles} disabled={busy} onChange={setNewRoleId} />
          {newAction === 'mute' && (
            <label className="admin-field">
              <span>뮤트 기간 (분, 비우면 1시간)</span>
              <input
                type="number"
                min="1"
                max={MAX_MUTE_MINUTES}
                value={newDuration}
                disabled={busy}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder="예: 60"
              />
            </label>
          )}
          <div className="admin-actions">
            <button type="submit" className="admin-btn admin-btn--accent" disabled={busy}>
              자동 조치 저장
            </button>
          </div>
        </form>
      </div>

      <div className="guild-section">
        <p className="guild-section-title">멤버 경고 주기 · 지우기 · 확인</p>
        <p className="guild-section-desc">
          여기서 준 경고는 횟수만 늘고 자동 조치(역할·뮤트·킥·밴)는 실행되지 않아요. 자동 조치까지 실행하려면 디스코드에서 /경고로 주세요.
        </p>
        <div className="admin-form">
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
            <span>사유 (경고를 줄 때)</span>
            <input type="text" value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
          </label>
          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn--neutral" disabled={busy} onClick={handleLookup}>
              경고 기록 확인
            </button>
            <button type="button" className="admin-btn admin-btn--accent" disabled={busy} onClick={() => handleWarnAction('add')}>
              경고 1회 주기
            </button>
            <button type="button" className="admin-btn admin-btn--neutral" disabled={busy} onClick={() => handleWarnAction('remove')}>
              경고 1회 지우기
            </button>
            <button type="button" className="admin-btn admin-btn--danger" disabled={busy} onClick={() => handleWarnAction('reset')}>
              이 멤버 경고 모두 지우기
            </button>
          </div>
        </div>

        {lookup && (
          <div className="admin-result">
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
