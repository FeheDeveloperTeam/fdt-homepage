import { useEffect, useMemo, useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import '../AdminForm.css'
import '../AdminManagePage/AdminManagePage.css'
import '../../components/GuildSettings/GuildSettings.css'
import './AdminPremiumPage.css'

// 유료 이용권(서버별 봇 프로필 꾸미기)을 영구 또는 기간제로 주고, 연장·해지한다.
// 데이터는 연동된 구글 시트 「유료이용권」 탭(api/_lib/premiumSheets.js). API는 /api/admin/coins?resource=premium.
const API = '/api/admin/coins?resource=premium'
const PERIODS = [1, 3, 6, 12]

function addMonths(ymd, months) {
  const [y, m, d] = ymd.split('-').map(Number)
  const lastDay = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, lastDay))).toISOString().slice(0, 10)
}

function passText(pass) {
  if (pass.permanent) return '영구 이용권'
  if (!pass.endDate) return '기간 정보 없음'
  if (!pass.active) return `만료됨 · ${pass.endDate}`
  return `기간제 · ${pass.endDate}까지 (${pass.daysLeft === 0 ? '오늘까지' : `${pass.daysLeft}일 남음`})`
}

export default function AdminPremiumPage() {
  useDocumentTitle('유료 이용권', 'Chiyumi')

  const [data, setData] = useState(null)
  const [guildId, setGuildId] = useState('')
  const [type, setType] = useState('period')
  const [months, setMonths] = useState(1)
  const [customDate, setCustomDate] = useState('')
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    callAdminApi(API)
      .then(setData)
      .catch((err) => setStatus({ type: 'error', text: err.message }))
  }, [])

  const current = useMemo(() => data?.passes.find((p) => p.guildId === guildId) ?? null, [data, guildId])

  // 기간제로 줄 때 실제로 적힐 만료일 미리보기(서버 계산과 같은 규칙: 이용 중인 기간제면 그 뒤로 이어 붙임)
  const previewEnd = useMemo(() => {
    if (!data || type !== 'period') return null
    if (months === 'custom') return customDate || null
    const base = current?.active && !current.permanent && current.endDate >= data.today ? current.endDate : data.today
    return addMonths(base, months)
  }, [data, type, months, customDate, current])

  async function post(body, doneText) {
    setBusy(true)
    setStatus(null)
    try {
      const next = await callAdminApi(API, { method: 'POST', body: JSON.stringify(body) })
      setData(next)
      setStatus({ type: 'success', text: doneText })
      return true
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
      return false
    } finally {
      setBusy(false)
    }
  }

  async function submitGrant() {
    if (!guildId) return setStatus({ type: 'error', text: '서버를 골라주세요.' })
    if (type === 'period' && months === 'custom' && !customDate) {
      return setStatus({ type: 'error', text: '만료일을 골라주세요.' })
    }
    const body = { action: 'grant', guildId, type, memo }
    if (type === 'period') {
      if (months === 'custom') body.endDate = customDate
      else body.months = months
    }
    const name = data.guilds.find((g) => g.id === guildId)?.name || guildId
    const ok = await post(
      body,
      type === 'permanent' ? `${name}에 영구 이용권을 줬어요.` : `${name} 이용권을 ${previewEnd}까지로 정했어요.`,
    )
    if (ok) setMemo('')
  }

  function revoke(pass) {
    if (!window.confirm(`${pass.name} 이용권을 해지할까요?\n봇 프로필을 꾸며 두었다면 바로 기본 치유미로 돌아가요.`)) return
    post({ action: 'revoke', guildId: pass.guildId }, `${pass.name} 이용권을 해지했어요.`)
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">유료 이용권</h1>
      <p className="admin-page-desc">
        서버별 봇 프로필 꾸미기 이용권을 영구 또는 기간제로 주고, 연장하거나 해지해요. 내용은 연동된 구글 시트
        「유료이용권」 탭에 서버당 한 줄로 적혀요. 이용권이 끝나거나 해지되면 그 서버의 치유미는 기본 프로필로 돌아가요.
      </p>

      <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
        <label className="admin-field">
          <span>서버 (치유미가 들어가 있는 서버)</span>
          <select value={guildId} onChange={(e) => setGuildId(e.target.value)} disabled={busy || !data}>
            <option value="">{data ? '서버를 고르세요' : '불러오는 중…'}</option>
            {data?.guilds.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.id})
              </option>
            ))}
          </select>
        </label>

        {current && <p className="ap-current">지금 상태: {passText(current)}</p>}

        <div className="admin-field">
          <span>이용권 종류</span>
          <div className="ap-segment" role="radiogroup" aria-label="이용권 종류">
            {[
              ['period', '기간제'],
              ['permanent', '영구'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={type === value}
                className={`ap-segment-btn${type === value ? ' is-active' : ''}`}
                onClick={() => setType(value)}
                disabled={busy}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {type === 'period' && (
          <div className="admin-field">
            <span>기간</span>
            <div className="ap-segment" role="radiogroup" aria-label="기간">
              {PERIODS.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={months === n}
                  className={`ap-segment-btn${months === n ? ' is-active' : ''}`}
                  onClick={() => setMonths(n)}
                  disabled={busy}
                >
                  {n}개월
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={months === 'custom'}
                className={`ap-segment-btn${months === 'custom' ? ' is-active' : ''}`}
                onClick={() => setMonths('custom')}
                disabled={busy}
              >
                날짜 직접
              </button>
            </div>
          </div>
        )}

        {type === 'period' && months === 'custom' && (
          <label className="admin-field">
            <span>만료일 (이날까지 사용 가능)</span>
            <input type="date" value={customDate} min={data?.today} onChange={(e) => setCustomDate(e.target.value)} disabled={busy} />
          </label>
        )}

        <label className="admin-field">
          <span>메모 (선택 · 입금 확인, 이벤트 등)</span>
          <input type="text" value={memo} maxLength={200} onChange={(e) => setMemo(e.target.value)} disabled={busy} />
        </label>

        <p className="ap-preview">
          {type === 'permanent'
            ? '→ 기간 제한 없는 영구 이용권으로 적어요.'
            : previewEnd
              ? `→ 만료일 ${previewEnd}${current?.active && !current.permanent && months !== 'custom' ? ' (남은 기간 뒤로 이어 붙임)' : ''}`
              : '→ 만료일을 골라주세요.'}
        </p>

        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--accent" onClick={submitGrant} disabled={busy || !data}>
            이용권 주기
          </button>
        </div>
      </form>

      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <p className="guild-section-title ap-list-title">이용권 목록</p>
      <div className="admin-list">
        {!data && !status && <p className="admin-chart-empty">불러오는 중이에요…</p>}
        {data && data.passes.length === 0 && <p className="admin-chart-empty">아직 이용권을 준 서버가 없어요.</p>}
        {data?.passes.map((pass) => (
          <div className={`admin-list-row${pass.active ? '' : ' ap-row--ended'}`} key={pass.guildId}>
            {pass.icon ? (
              <img src={pass.icon} alt="" className="admin-list-avatar" />
            ) : (
              <span className="admin-list-avatar ap-fallback">{pass.name.slice(0, 1)}</span>
            )}
            <div className="admin-list-info">
              <span className="admin-list-name">
                {pass.name}
                <span className={`ap-badge${pass.permanent ? ' ap-badge--forever' : pass.active ? '' : ' ap-badge--ended'}`}>
                  {pass.permanent ? '영구' : pass.active ? '기간제' : '만료'}
                </span>
              </span>
              <span className="admin-list-id">
                {pass.guildId} · {passText(pass)}
                {pass.memo && ` · ${pass.memo}`}
              </span>
            </div>
            <div className="ap-row-actions">
              {!pass.permanent && (
                <button
                  type="button"
                  className="admin-btn admin-btn--neutral"
                  disabled={busy}
                  onClick={() => post({ action: 'grant', guildId: pass.guildId, type: 'period', months: 1 }, `${pass.name} 이용권을 1개월 ${pass.active ? '연장' : '다시 줬'}어요.`)}
                >
                  +1개월
                </button>
              )}
              {!pass.permanent && (
                <button
                  type="button"
                  className="admin-btn admin-btn--neutral"
                  disabled={busy}
                  onClick={() => post({ action: 'grant', guildId: pass.guildId, type: 'permanent' }, `${pass.name}을 영구 이용권으로 바꿨어요.`)}
                >
                  영구로
                </button>
              )}
              {pass.active && (
                <button type="button" className="admin-btn admin-btn--danger" disabled={busy} onClick={() => revoke(pass)}>
                  해지
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
