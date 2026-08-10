import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import RankBarChart from '../../components/AdminCharts/RankBarChart'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'
import '../AdminOverviewPage/AdminOverviewPage.css'

function formatVoiceMinutes(ms) {
  return Math.round(ms / 60000)
}

export default function GuildOverviewPage() {
  useDocumentTitle('개요', 'Chiyumi')
  const { guildId } = useOutletContext()

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    callGuildApi(`/api/guild?resource=overview&guildId=${guildId}`)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [guildId])

  return (
    <div>
      <p className="eyebrow">Server Settings</p>
      <h1 className="admin-page-title">개요</h1>
      <p className="admin-page-desc">서버 인원과 지금까지의 채팅·음성 활동 순위예요.</p>

      {error && <p className="admin-status admin-status--error">{error}</p>}
      {!data && !error && <p className="admin-chart-empty">불러오는 중이에요…</p>}

      {data && (
        <>
          <div className="admin-stats-row">
            <div className="admin-stat">
              <span className="admin-stat-value">{(data.guild.memberCount ?? 0).toLocaleString()}</span>
              <span className="admin-stat-label">전체 멤버 수</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">{(data.guild.onlineCount ?? 0).toLocaleString()}</span>
              <span className="admin-stat-label">현재 접속 중</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-value">{data.guild.boostCount ?? 0}</span>
              <span className="admin-stat-label">부스트 (레벨 {data.guild.boostLevel ?? 0})</span>
            </div>
          </div>

          <section className="admin-chart-section">
            <h2 className="admin-chart-title">채팅 활동 순위 (누적 XP)</h2>
            <RankBarChart
              items={data.topChat.map((e) => ({
                id: e.userId,
                icon: e.avatar,
                name: `${e.username} · Lv.${e.level}`,
                value: e.xp,
              }))}
              emptyText="아직 채팅 활동 기록이 없어요."
            />
          </section>

          <section className="admin-chart-section">
            <h2 className="admin-chart-title">음성채널 활동 순위 (누적, 분)</h2>
            <RankBarChart
              items={data.topVoice.map((e) => ({
                id: e.userId,
                icon: e.avatar,
                name: e.username,
                value: formatVoiceMinutes(e.ms),
              }))}
              emptyText="아직 음성채널 활동 기록이 없어요."
            />
          </section>

          <p className="guild-hint">
            채팅·음성 활동은 봇이 지금까지 누적으로 기록한 총량 기준이에요 (일별 추이는 아직 제공하지
            않아요).
          </p>
        </>
      )}
    </div>
  )
}
