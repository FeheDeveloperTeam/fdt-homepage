import './AdminCharts.css'

export default function GuildBarChart({ guilds }) {
  if (!guilds.length) {
    return <p className="admin-chart-empty">아직 봇이 참여 중인 서버가 없어요.</p>
  }

  const max = Math.max(...guilds.map((g) => g.memberCount), 1)

  return (
    <div className="admin-bar-chart">
      {guilds.map((g) => (
        <div className="admin-bar-row" key={g.id}>
          {g.icon ? (
            <img src={g.icon} alt="" className="admin-bar-icon" />
          ) : (
            <div className="admin-bar-icon admin-bar-icon--fallback">{g.name.charAt(0)}</div>
          )}
          <div className="admin-bar-track-wrap">
            <span className="admin-bar-name">{g.name}</span>
            <div className="admin-bar-track">
              <div
                className="admin-bar-fill"
                style={{ width: `${Math.max((g.memberCount / max) * 100, 3)}%` }}
              />
            </div>
          </div>
          <span className="admin-bar-value">{g.memberCount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
