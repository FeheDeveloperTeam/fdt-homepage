import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import RankBarChart from '../../components/AdminCharts/RankBarChart'
import AdminPager from '../../components/AdminPager/AdminPager'
import '../AdminForm.css'
import './AdminOverviewPage.css'

const PAGE_SIZE = 10

function RankSection({ title, items, emptyText }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(Math.ceil(items.length / PAGE_SIZE), 1)
  const currentPage = Math.min(page, totalPages - 1)
  const pagedItems = items.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <section className="admin-chart-section">
      <h2 className="admin-chart-title">{title}</h2>
      <RankBarChart items={pagedItems} emptyText={emptyText} maxValue={maxValue} />
      <AdminPager page={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}

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

          <RankSection
            title="서버별 멤버 수"
            items={stats.topGuilds.map((g) => ({ ...g, value: g.memberCount }))}
            emptyText="아직 봇이 참여 중인 서버가 없어요."
          />

          <RankSection
            title="치유미코인 보유 순위"
            items={stats.topCoinHolders}
            emptyText="아직 코인을 보유한 유저가 없어요."
          />
        </>
      )}
    </div>
  )
}
