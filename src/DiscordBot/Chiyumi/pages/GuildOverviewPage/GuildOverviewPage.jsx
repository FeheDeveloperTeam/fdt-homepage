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

// 사람·봇 구분은 디스코드에서 한 번에 받을 수 있는 앞 1,000명만 센다. 그보다 큰 서버는 전체 수와 합이 안 맞으니 그렇다고 밝힌다.
function memberBreakdown(guild) {
  const counted = guild.humanCount + guild.botCount
  const parts = `사람 ${guild.humanCount.toLocaleString()} · 봇 ${guild.botCount.toLocaleString()}`
  return counted < (guild.memberCount ?? 0) ? `전체 멤버 수 (앞 ${counted.toLocaleString()}명 중 ${parts})` : `전체 멤버 수 (${parts})`
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
                label={memberBreakdown(data.guild)}
              />
              <StatCard
                value={data.guild.onlineHumans !== null ? data.guild.onlineHumans.toLocaleString() : '준비 중'}
                label="현재 접속 중 (사람만)"
              />
              <StatCard
                value={data.guild.boostCount ?? 0}
                label={`부스트 (레벨 ${data.guild.boostLevel ?? 0})`}
              />
            </div>
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
        </>
      )}
    </div>
  )
}
