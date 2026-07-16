import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '0.75rem',
      padding: '4rem 1.5rem',
    }}>
      <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--sky-deep)' }}>404</p>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text)' }}>페이지를 찾을 수 없어요</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '360px' }}>
        주소가 잘못됐거나, 페이지가 이동 또는 삭제되었을 수 있어요.
      </p>
      <Link
        to="/member/fehe"
        style={{
          marginTop: '1rem',
          padding: '0.7rem 1.6rem',
          borderRadius: '0.7rem',
          background: 'var(--sky-deep)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.85rem',
          textDecoration: 'none',
        }}
      >
        홈으로 가기
      </Link>
    </div>
  )
}
