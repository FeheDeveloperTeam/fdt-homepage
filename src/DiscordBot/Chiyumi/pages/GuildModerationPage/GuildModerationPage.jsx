import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'

function ActionForm({ title, desc, actionLabel, confirmText, onSubmit, busy }) {
  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const targetId = userId.trim()
    if (!targetId) return
    // eslint-disable-next-line no-alert
    if (!window.confirm(confirmText.replace('{id}', targetId))) return
    onSubmit(targetId, reason.trim()).then(() => {
      setUserId('')
      setReason('')
    })
  }

  return (
    <div className="guild-section">
      <p className="guild-section-title">{title}</p>
      <p className="guild-section-desc">{desc}</p>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>디스코드 유저 ID</span>
          <input
            type="text"
            value={userId}
            disabled={busy}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="예: 826036359499481109"
          />
        </label>
        <label className="admin-field">
          <span>사유 (선택)</span>
          <input type="text" value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn--danger" disabled={busy}>
            {actionLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function GuildModerationPage() {
  useDocumentTitle('멤버 제재', 'Chiyumi')
  const { guildId } = useOutletContext()

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  async function run(resource, userId, reason) {
    setBusy(true)
    setStatus(null)
    try {
      await callGuildApi(`/api/guild?resource=${resource}&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify({ userId, reason: reason || undefined }),
      })
      setStatus({ type: 'success', text: '처리했어요.' })
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Server Settings</p>
      <h1 className="admin-page-title">멤버 제재</h1>
      <p className="admin-page-desc">
        멤버를 차단(밴)하거나 추방(킥)해요. 실행하면 바로 적용되고 되돌릴 수 없으니 신중하게
        사용해주세요.
      </p>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <ActionForm
        title="차단 (밴)"
        desc="서버에서 즉시 차단하고, 다시 초대되기 전까지 재입장할 수 없어요."
        actionLabel="차단"
        confirmText="{id}님을 정말 차단할까요? 이 작업은 되돌리기 어려워요."
        busy={busy}
        onSubmit={(userId, reason) => run('ban', userId, reason)}
      />

      <ActionForm
        title="추방 (킥)"
        desc="서버에서 즉시 내보내요. 초대 링크가 있으면 다시 들어올 수 있어요."
        actionLabel="추방"
        confirmText="{id}님을 정말 추방할까요?"
        busy={busy}
        onSubmit={(userId, reason) => run('kick', userId, reason)}
      />
    </div>
  )
}
