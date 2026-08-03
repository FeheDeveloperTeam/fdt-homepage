import { useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import '../AdminForm.css'

export default function AdminRestrictPage() {
  useDocumentTitle('이용제한 설정', 'Chiyumi')

  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const targetId = userId.trim()
    if (!targetId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }

    setBusy(true)
    setStatus(null)
    try {
      await callAdminApi('/api/admin/restrict', {
        method: 'POST',
        body: JSON.stringify({ userId: targetId, reason: reason.trim() }),
      })
      setStatus({ type: 'success', text: '이용을 제한했어요.' })
      setUserId('')
      setReason('')
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">이용제한 설정</h1>
      <p className="admin-page-desc">
        특정 유저의 디스코드 ID를 입력하면 AI 기능 이용을 제한할 수 있어요.
      </p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>디스코드 유저 ID</span>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="예: 826036359499481109"
            disabled={busy}
          />
        </label>
        <label className="admin-field">
          <span>제한 사유</span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="사유를 입력해주세요"
            disabled={busy}
          />
        </label>

        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn--danger" disabled={busy}>
            이용제한
          </button>
        </div>
      </form>

      {status && (
        <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>
      )}
    </div>
  )
}
