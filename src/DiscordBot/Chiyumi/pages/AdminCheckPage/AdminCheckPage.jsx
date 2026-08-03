import { useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi, formatDate } from '../adminApi'
import '../AdminForm.css'

export default function AdminCheckPage() {
  useDocumentTitle('이용제한 확인', 'Chiyumi')

  const [userId, setUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const targetId = userId.trim()
    if (!targetId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }

    setBusy(true)
    setStatus(null)
    setResult(null)
    try {
      const data = await callAdminApi(
        `/api/admin/restriction?userId=${encodeURIComponent(targetId)}`,
      )
      setResult(data)
      setStatus({
        type: 'success',
        text: data.restricted ? '이용제한 중인 유저예요.' : '이용제한 중이 아니에요.',
      })
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">이용제한 확인</h1>
      <p className="admin-page-desc">
        디스코드 ID를 입력하면 해당 유저의 이용제한 여부와 사유를 조회할 수 있어요.
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
          <button type="submit" className="admin-btn admin-btn--neutral" disabled={busy}>
            확인
          </button>
        </div>
      </form>

      {status && (
        <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>
      )}

      {result?.restricted && result.restriction && (
        <div className="admin-result">
          <div className="admin-result-row">
            <span>사유</span>
            <strong>{result.restriction.reason}</strong>
          </div>
          <div className="admin-result-row">
            <span>처리자</span>
            <strong>{result.restriction.restrictedBy}</strong>
          </div>
          <div className="admin-result-row">
            <span>처리 일시</span>
            <strong>{formatDate(result.restriction.restrictedAt)}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
