import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDiscordUser } from '../../hooks/useDiscordUser'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import './AdminPage.css'

async function callAdminApi(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '요청에 실패했어요.')
  return data
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ko-KR')
}

export default function AdminPage() {
  useDocumentTitle('관리자', 'Chiyumi')
  const { user, loading } = useDiscordUser()

  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', text }
  const [result, setResult] = useState(null) // 확인 결과

  async function runAction(action) {
    const targetId = userId.trim()
    if (!targetId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }

    setBusy(true)
    setStatus(null)
    setResult(null)

    try {
      if (action === 'restrict') {
        await callAdminApi('/api/admin/restrict', {
          method: 'POST',
          body: JSON.stringify({ userId: targetId, reason: reason.trim() }),
        })
        setStatus({ type: 'success', text: '이용을 제한했어요.' })
      } else if (action === 'unrestrict') {
        const data = await callAdminApi('/api/admin/unrestrict', {
          method: 'POST',
          body: JSON.stringify({ userId: targetId }),
        })
        setStatus({
          type: 'success',
          text: data.existed ? '이용제한을 해제했어요.' : '이용제한 상태가 아니었어요.',
        })
      } else {
        const data = await callAdminApi(`/api/admin/restriction?userId=${encodeURIComponent(targetId)}`)
        setResult(data)
        setStatus({
          type: 'success',
          text: data.restricted ? '이용제한 중인 유저예요.' : '이용제한 중이 아니에요.',
        })
      }
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (loading) return null

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-page admin-page--denied">
        <p className="admin-denied-title">권한이 없어요</p>
        <p className="admin-denied-desc">
          이 페이지는 관리자만 볼 수 있어요.
        </p>
        <Link to="/DiscordBot/Chiyumi" className="admin-denied-back">
          치유미 홈으로
        </Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-title">관리자 패널</h1>
      <p className="admin-welcome">
        <img src={user.avatar} alt="" className="admin-welcome-avatar" />
        <strong>{user.username}</strong>님으로 로그인 중이에요.
      </p>

      <section className="admin-section">
        <h2 className="admin-section-title">이용제한 관리</h2>
        <p className="admin-section-desc">
          AI 기능 이용을 제한하거나 해제하고, 특정 유저의 제한 여부를 조회할 수 있어요.
        </p>

        <div className="admin-form">
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
            <span>제한 사유 (제한 시에만 사용)</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="사유를 입력해주세요"
              disabled={busy}
            />
          </label>

          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn admin-btn--check"
              onClick={() => runAction('check')}
              disabled={busy}
            >
              확인
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--restrict"
              onClick={() => runAction('restrict')}
              disabled={busy}
            >
              이용제한
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--unrestrict"
              onClick={() => runAction('unrestrict')}
              disabled={busy}
            >
              제한 해제
            </button>
          </div>
        </div>

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
      </section>
    </div>
  )
}
