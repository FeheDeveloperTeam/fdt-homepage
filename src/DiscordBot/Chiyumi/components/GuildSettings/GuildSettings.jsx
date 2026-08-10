import './GuildSettings.css'

export function ToggleRow({ label, desc, checked, onChange, disabled }) {
  return (
    <label className="guild-toggle-row">
      <div className="guild-toggle-text">
        <span className="guild-toggle-label">{label}</span>
        {desc && <span className="guild-toggle-desc">{desc}</span>}
      </div>
      <span className={`guild-toggle${checked ? ' guild-toggle--on' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="guild-toggle-knob" />
      </span>
    </label>
  )
}

export function ChannelSelect({ label, value, channels, onChange, disabled, allowNone = true }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || null)}
      >
        {allowNone && <option value="">채널 없음</option>}
        {channels.map((c) => (
          <option key={c.id} value={c.id}>
            #{c.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export function RoleSelect({ label, value, roles, onChange, disabled, allowNone = true }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || null)}
      >
        {allowNone && <option value="">역할 없음</option>}
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            @{r.name}
          </option>
        ))}
      </select>
    </label>
  )
}
