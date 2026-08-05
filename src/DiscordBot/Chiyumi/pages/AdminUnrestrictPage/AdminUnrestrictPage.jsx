import { useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import '../AdminForm.css'

export default function AdminUnrestrictPage() {
  useDocumentTitle('이용제한 해제', 'Chiyumi')

  const [userId, setUserId] = useState('')
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
      const data = await callAdminApi(`/api/admin/restrictions?userId=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      })
      setStatus({
        type: 'success',
        text: data.existed ? '이용제한을 해제했어요.' : '이용제한 상태가 아니었어요.',
      })
      setUserId('')
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">이용제한 해제</h1>
      <p className="admin-page-desc">
        이용제한 중인 유저의 디스코드 ID를 입력하면 제한을 해제할 수 있어요.
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

        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn--accent" disabled={busy}>
            제한 해제
          </button>
        </div>
      </form>

      {status && (
        <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>
      )}
    </div>
  )
}
