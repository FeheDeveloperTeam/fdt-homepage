import { useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import '../AdminForm.css'

export default function AdminCoinAdjustPage() {
  useDocumentTitle('코인 지급/차감', 'Chiyumi')

  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  async function submit(sign) {
    const targetId = userId.trim()
    const parsed = Number(amount)

    if (!targetId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setStatus({ type: 'error', text: '0보다 큰 수량을 입력해주세요.' })
      return
    }

    setBusy(true)
    setStatus(null)
    try {
      const data = await callAdminApi('/api/admin/coins/adjust', {
        method: 'POST',
        body: JSON.stringify({ userId: targetId, delta: sign * parsed }),
      })
      setStatus({
        type: 'success',
        text: `${sign > 0 ? '지급' : '차감'} 완료 — 현재 잔액 ${data.balance.toLocaleString()}개`,
      })
      setAmount('')
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">코인 지급/차감</h1>
      <p className="admin-page-desc">
        디스코드 ID와 수량을 입력하고 지급 또는 차감을 선택해주세요. 서버에 직접 반영돼요.
      </p>

      <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
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
          <span>수량</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="예: 1000"
            disabled={busy}
          />
        </label>

        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn admin-btn--accent"
            onClick={() => submit(1)}
            disabled={busy}
          >
            지급
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={() => submit(-1)}
            disabled={busy}
          >
            차감
          </button>
        </div>
      </form>

      {status && (
        <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>
      )}
    </div>
  )
}
