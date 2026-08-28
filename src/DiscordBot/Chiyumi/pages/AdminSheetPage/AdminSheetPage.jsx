import { useEffect, useMemo, useState } from 'react'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callAdminApi } from '../adminApi'
import AdminPager from '../../components/AdminPager/AdminPager'
import '../AdminForm.css'
import './AdminSheetPage.css'

const SHEETS = ['코인', '레벨', '음성시간', '출석', '서버설정', '서버목록', '주식시세', '주식포트폴리오']
const PAGE_SIZE = 10

export default function AdminSheetPage() {
  useDocumentTitle('구글 시트', 'Chiyumi')

  const [activeSheet, setActiveSheet] = useState(SHEETS[0])
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(null)
    callAdminApi(`/api/admin/sheet?name=${encodeURIComponent(activeSheet)}`)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [activeSheet])

  const filteredRows = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    if (!q) return data.rows
    return data.rows.filter((row) =>
      row.some((cell) => String(cell ?? '').toLowerCase().includes(q)),
    )
  }, [data, search])

  const totalPages = Math.max(Math.ceil(filteredRows.length / PAGE_SIZE), 1)
  const currentPage = Math.min(page, totalPages - 1)
  const pagedRows = filteredRows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  function changeSheet(name) {
    setActiveSheet(name)
    setSearch('')
    setPage(0)
  }

  function handleSearch(value) {
    setSearch(value)
    setPage(0)
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">구글 시트 데이터</h1>
      <p className="admin-page-desc">
        치유미 봇이 15분마다 동기화하는 백업 시트를 그대로 보여드려요. 실시간 데이터는 아닐 수 있어요.
      </p>

      <div className="admin-sheet-tabs">
        {SHEETS.map((name) => (
          <button
            key={name}
            type="button"
            className={'admin-sheet-tab' + (name === activeSheet ? ' admin-sheet-tab--active' : '')}
            onClick={() => changeSheet(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="admin-sheet-search"
        placeholder="검색 (유저ID, 서버ID 등)"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={!data}
      />

      {error && <p className="admin-status admin-status--error">{error}</p>}
      {!error && !data && <p className="admin-chart-empty">불러오는 중이에요…</p>}

      {data && (
        <>
          <p className="admin-sheet-count">
            {filteredRows.length.toLocaleString()}행
            {search && ` (전체 ${data.rows.length.toLocaleString()}행 중)`}
          </p>
          <div className="admin-sheet-table-wrap">
            <table className="admin-sheet-table">
              <thead>
                <tr>
                  {data.header.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, i) => (
                  <tr key={currentPage * PAGE_SIZE + i}>
                    {data.header.map((_, j) => (
                      <td key={j}>{row[j] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPager page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
