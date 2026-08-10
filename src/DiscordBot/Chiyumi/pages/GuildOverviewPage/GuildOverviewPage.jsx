import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import RankBarChart from '../../components/AdminCharts/RankBarChart'
import { callGuildApi } from '../guildApi'
import '../AdminForm.css'
import '../AdminOverviewPage/AdminOverviewPage.css'
import './GuildOverviewPage.css'

function formatVoiceMinutes(ms) {
  return Math.round(ms / 60000)
}

function StatCard({ value, label }) {
  return (
    <div className="guild-stat-card">
      <span className="guild-stat-value">{value}</span>
      <span className="guild-stat-label">{label}</span>
    </div>
  )
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
          <div className="guild-stats-group">
            <p className="guild-stats-group-title">서버 인원</p>
            <div className="guild-stats-grid">
              <StatCard
                value={(data.guild.memberCount ?? 0).toLocaleString()}
                label={`전체 멤버 수 (사람 ${data.guild.humanCount.toLocaleString()} · 봇 ${data.guild.botCount.toLocaleString()})`}
              />
              <StatCard
                value={(data.guild.onlineCount ?? 0).toLocaleString()}
                label="현재 접속 중 (봇 포함 추정치)"
              />
              <StatCard
                value={data.guild.boostCount ?? 0}
                label={`부스트 (레벨 ${data.guild.boostLevel ?? 0})`}
              />
            </div>
            <p className="guild-hint">
              디스코드 API는 온라인 상태를 사람/봇으로 나눠 알려주지 않아서(별도의 프레즌스 권한이
              필요해요), 접속 중 인원에는 봇도 함께 포함돼요.
            </p>
          </div>

          <div className="guild-stats-group">
            <p className="guild-stats-group-title">참여율</p>
            <div className="guild-stats-grid">
              <StatCard
                value={`${data.participation.chatRate}%`}
                label={`채팅 참여율 (${data.participation.chatCount}/${data.participation.totalMembers}명)`}
              />
              <StatCard
                value={`${data.participation.voiceRate}%`}
                label={`음성 참여율 (${data.participation.voiceCount}/${data.participation.totalMembers}명)`}
              />
              <StatCard
                value={`${data.participation.attendanceRate}%`}
                label={`출석 참여율 · 평균 연속 ${data.participation.avgStreak}일`}
              />
            </div>
            <p className="guild-hint">
              출석은 서버 구분 없이 봇 전체에서 공유되는 기록이라, 이 서버 멤버만 걸러서 계산한 값이에요.
            </p>
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
