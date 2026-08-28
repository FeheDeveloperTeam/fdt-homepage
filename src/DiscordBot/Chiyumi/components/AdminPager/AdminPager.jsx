const PAGE_WINDOW = 4

export default function AdminPager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const start = Math.max(0, Math.min(page - Math.floor(PAGE_WINDOW / 2), totalPages - PAGE_WINDOW))
  const from = Math.max(0, start)
  const to = Math.min(totalPages, from + PAGE_WINDOW)
  const pageNumbers = Array.from({ length: to - from }, (_, i) => from + i)

  return (
    <div className="admin-pager">
      <button
        type="button"
        className="admin-pager-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
      >
        ‹
      </button>
      {pageNumbers.map((n) => (
        <button
          key={n}
          type="button"
          className={'admin-pager-btn' + (n === page ? ' admin-pager-btn--active' : '')}
          onClick={() => onChange(n)}
        >
          {n + 1}
        </button>
      ))}
      <button
        type="button"
        className="admin-pager-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
      >
        ›
      </button>
    </div>
  )
}
