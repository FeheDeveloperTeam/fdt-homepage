import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import GuildBarChart from '../../components/AdminCharts/GuildBarChart'
import TrendChart from '../../components/AdminCharts/TrendChart'
import '../AdminForm.css'
import './AdminOverviewPage.css'

export default function AdminOverviewPage() {
  useDocumentTitle('관리자', 'Chiyumi')
  const { user } = useOutletContext()

  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    callAdminApi('/api/admin/stats')
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">대시보드</h1>
      <p className="admin-page-desc">
        <strong>{user.username}</strong>님, 치유미 봇의 현재 운영 현황이에요.
      </p>

      {error && <p className="admin-status admin-status--error">{error}</p>}

      {!error && !stats && <p className="admin-chart-empty">불러오는 중이에요…</p>}

      {stats && (
        <>
          <div className="admin-stats-row">
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.serverCount.toLocaleString()}</span>
              <span className="admin-stat-label">참여 서버</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.totalMembers.toLocaleString()}</span>
              <span className="admin-stat-label">전체 멤버 수</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.restrictedCount.toLocaleString()}</span>
              <span className="admin-stat-label">이용제한 인원</span>
            </div>
          </div>

          <section className="admin-chart-section">
            <h2 className="admin-chart-title">서버별 멤버 수</h2>
            <GuildBarChart guilds={stats.topGuilds} />
          </section>

          <section className="admin-chart-section">
            <h2 className="admin-chart-title">최근 14일 AI 대화 기억 추이</h2>
            <TrendChart data={stats.memoriesPerDay} />
          </section>
        </>
      )}
    </div>
  )
}
