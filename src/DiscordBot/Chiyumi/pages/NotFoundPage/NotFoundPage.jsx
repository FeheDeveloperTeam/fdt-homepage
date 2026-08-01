import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없음', 'Chiyumi')
  return (
    <div style={{
      minHeight: '55vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '0.6rem',
      padding: '4rem 1.5rem',
    }}>
      <p style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>404</p>
      <h1 style={{ fontSize: '1.3rem', color: 'var(--accent-brown)', fontWeight: 800 }}>
        페이지를 찾을 수 없어요
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
        주소가 잘못됐거나, 페이지가 이동 또는 삭제되었을 수 있어요.
      </p>
      <Link
        to="/DiscordBot/Chiyumi"
        style={{
          marginTop: '0.75rem',
          padding: '0.6rem 1.4rem',
          borderRadius: '999px',
          background: 'var(--accent)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.82rem',
        }}
      >
        치유미 홈으로
      </Link>
    </div>
  )
}
