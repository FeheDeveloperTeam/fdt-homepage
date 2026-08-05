import './AdminCharts.css'

export default function RankBarChart({ items, emptyText }) {
  if (!items.length) {
    return <p className="admin-chart-empty">{emptyText}</p>
  }

  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="admin-bar-chart">
      {items.map((item) => (
        <div className="admin-bar-row" key={item.id}>
          {item.icon ? (
            <img src={item.icon} alt="" className="admin-bar-icon" />
          ) : (
            <div className="admin-bar-icon admin-bar-icon--fallback">{item.name.charAt(0)}</div>
          )}
          <div className="admin-bar-track-wrap">
            <span className="admin-bar-name">{item.name}</span>
            <div className="admin-bar-track">
              <div
                className="admin-bar-fill"
                style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
              />
            </div>
          </div>
          <span className="admin-bar-value">{item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
