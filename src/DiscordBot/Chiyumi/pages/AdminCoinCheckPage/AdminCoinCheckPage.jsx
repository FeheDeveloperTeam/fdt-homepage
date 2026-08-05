import { useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import '../AdminForm.css'

export default function AdminCoinCheckPage() {
  useDocumentTitle('코인 조회', 'Chiyumi')

  const [userId, setUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [balance, setBalance] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const targetId = userId.trim()
    if (!targetId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }

    setBusy(true)
    setStatus(null)
    setBalance(null)
    try {
      const data = await callAdminApi(`/api/admin/coins/balance?userId=${encodeURIComponent(targetId)}`)
      setBalance(data.balance)
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">코인 조회</h1>
      <p className="admin-page-desc">
        디스코드 ID를 입력하면 현재 치유미코인 잔액을 실시간으로 조회할 수 있어요.
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
            조회
          </button>
        </div>
      </form>

      {status && (
        <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>
      )}

      {balance !== null && (
        <div className="admin-result">
          <div className="admin-result-row">
            <span>보유 코인</span>
            <strong>{balance.toLocaleString()}개</strong>
          </div>
        </div>
      )}
    </div>
  )
}
