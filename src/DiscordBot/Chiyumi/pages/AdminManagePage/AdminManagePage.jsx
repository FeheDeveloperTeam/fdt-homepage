import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi, formatDate } from '../adminApi'
import AdminPager from '../../components/AdminPager/AdminPager'
import '../AdminForm.css'
import './AdminManagePage.css'

const PAGE_SIZE = 10

export default function AdminManagePage() {
  useDocumentTitle('관리자 관리', 'Chiyumi')
  const { user: me } = useOutletContext()

  const [admins, setAdmins] = useState(null)
  const [userId, setUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [page, setPage] = useState(0)

  function loadAdmins() {
    return callAdminApi('/api/admin/admins')
      .then((data) => setAdmins(data.admins))
      .catch((err) => setStatus({ type: 'error', text: err.message }))
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const targetId = userId.trim()
    if (!targetId) {
      setStatus({ type: 'error', text: '디스코드 유저 ID를 입력해주세요.' })
      return
    }

    setBusy(true)
    setStatus(null)
    try {
      await callAdminApi('/api/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ userId: targetId }),
      })
      setStatus({ type: 'success', text: '관리자를 추가했어요.' })
      setUserId('')
      await loadAdmins()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(targetId) {
    setBusy(true)
    setStatus(null)
    try {
      await callAdminApi(`/api/admin/admins?userId=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      })
      setStatus({ type: 'success', text: '관리자를 제거했어요.' })
      await loadAdmins()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const totalPages = Math.max(Math.ceil((admins?.length || 0) / PAGE_SIZE), 1)
  const currentPage = Math.min(page, totalPages - 1)
  const pagedAdmins = admins ? admins.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE) : []

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">관리자 관리</h1>
      <p className="admin-page-desc">
        FDT 팀원의 디스코드 유저 ID를 입력하면 이 대시보드의 관리자 권한을 줄 수 있어요.
      </p>

      <form className="admin-form" onSubmit={handleAdd}>
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
            관리자 추가
          </button>
        </div>
      </form>

      {status && (
        <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>
      )}

      <div className="admin-list">
        {!admins && !status && <p className="admin-chart-empty">불러오는 중이에요…</p>}
        {admins &&
          pagedAdmins.map((a) => (
            <div className="admin-list-row" key={a.id}>
              <img src={a.avatar} alt="" className="admin-list-avatar" />
              <div className="admin-list-info">
                <span className="admin-list-name">
                  {a.username}
                  {a.id === me.id && <span className="admin-list-you"> (나)</span>}
                </span>
                <span className="admin-list-id">
                  {a.id}
                  {a.source === 'db' && a.addedAt && ` · ${formatDate(a.addedAt)} 추가`}
                </span>
              </div>
              {a.source === 'root' ? (
                <span className="admin-list-badge">기본 관리자</span>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-list-remove"
                  onClick={() => handleRemove(a.id)}
                  disabled={busy}
                >
                  제거
                </button>
              )}
            </div>
          ))}
      </div>

      {admins && <AdminPager page={currentPage} totalPages={totalPages} onChange={setPage} />}
    </div>
  )
}
