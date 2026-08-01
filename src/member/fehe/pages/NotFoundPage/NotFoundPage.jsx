import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없음 | 페헤')
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '0.6rem',
      padding: '4rem 1.5rem',
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        $ cd {typeof window !== 'undefined' ? window.location.pathname : ''}
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 700, color: 'var(--accent)', margin: '0.25rem 0' }}>
        404
      </p>
      <h1 style={{ fontSize: '1.3rem', color: 'var(--text)', fontWeight: 700 }}>
        페이지를 찾을 수 없어요
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-red)', maxWidth: '380px' }}>
        bash: no such file or directory
      </p>
      <Link
        to="/member/fehe"
        style={{
          marginTop: '1.25rem',
          padding: '0.65rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
        }}
      >
        cd ~/home
      </Link>
    </div>
  )
}
