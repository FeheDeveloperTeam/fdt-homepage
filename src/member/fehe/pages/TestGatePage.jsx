// 대기실 UI 테스트용 페이지 — /test-gate
import { useState } from 'react'
import '../styles/versionbanner.css'

const SCREENS = [
  { key: 'waiting',  label: '대기 중' },
  { key: 'kicked',   label: '강제 퇴장' },
  { key: 'banned',   label: 'IP 차단 (접속 중)' },
  { key: 'blocked',  label: 'IP 차단 (재접속)' },
  { key: 'update',   label: '업데이트 알림' },
]

const activeCount = 10
const MAX = 10
const queuePos = 3

export default function TestGatePage() {
  const [screen, setScreen] = useState('waiting')

  return (
    <div className="vg-overlay">
      {/* 탭 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
        display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem',
        background: 'rgba(220,240,250,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(168,216,240,0.5)', flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {SCREENS.map(s => (
          <button key={s.key} onClick={() => setScreen(s.key)} style={{
            padding: '0.35rem 0.9rem',
            borderRadius: '0.6rem',
            border: '1.5px solid',
            borderColor: screen === s.key ? 'var(--sky-deep)' : 'var(--border)',
            background: screen === s.key ? 'rgba(107,189,224,0.18)' : 'transparent',
            color: screen === s.key ? 'var(--sky-deep)' : 'var(--text-muted)',
            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          }}>{s.label}</button>
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
          * 테스트 페이지
        </span>
      </div>

        {screen === 'waiting' && (
          <div className="vg-box">
            <div className="vg-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h1 className="vg-title">대기 중</h1>
            <p className="vg-desc">현재 접속자가 가득 찼습니다.<br/>자리가 나면 자동으로 입장됩니다.</p>
            <div className="vg-stats">
              <div className="vg-stat">
                <span className="vg-stat-num">{queuePos}</span>
                <span className="vg-stat-label">내 앞 대기자</span>
              </div>
              <div className="vg-divider" />
              <div className="vg-stat">
                <span className="vg-stat-num">{activeCount}<span className="vg-stat-max">/{MAX}</span></span>
                <span className="vg-stat-label">현재 접속자</span>
              </div>
            </div>
            <div className="vg-bar-wrap">
              <div className="vg-bar-fill" style={{ width: `${(activeCount / MAX) * 100}%` }} />
            </div>
            <p className="vg-hint">창을 닫지 마세요. 자동으로 입장됩니다.</p>
          </div>
        )}

        {screen === 'kicked' && (
          <div className="vg-box">
            <div className="vg-icon" style={{ color: '#d4880a' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h1 className="vg-title">강제 퇴장됨</h1>
            <p className="vg-desc">관리자에 의해 세션이 종료되었습니다.<br/>페이지를 새로고침하면 다시 입장할 수 있습니다.</p>
            <button className="vg-reload-btn" onClick={() => window.location.reload()}>새로고침</button>
          </div>
        )}

        {screen === 'banned' && (
          <div className="vg-box">
            <div className="vg-icon" style={{ color: '#f85149' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <h1 className="vg-title">IP 차단됨</h1>
            <p className="vg-desc">관리자에 의해 이 IP 주소가 차단되었습니다.</p>
          </div>
        )}

        {screen === 'blocked' && (
          <div className="vg-box">
            <div className="vg-icon" style={{ color: '#f85149' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <h1 className="vg-title">접근 차단됨</h1>
            <p className="vg-desc">이 IP 주소는 관리자에 의해 차단되었습니다.</p>
          </div>
        )}

        {screen === 'update' && (
          <div className="vg-box">
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              아래는 실제 배너가 표시되는 모습입니다.
            </p>
            {/* 배너 미리보기 — static (position: relative로 덮어씀) */}
            <div className="version-banner" style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none', animation: 'none' }}>
              <span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                새 버전이 배포되었어요.
              </span>
              <button className="version-banner-reload">새로고침</button>
              <button className="version-banner-close" aria-label="닫기">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
              배포 시 화면 상단에 고정되어 표시됩니다.
            </p>
          </div>
        )}

    </div>
  )
}
