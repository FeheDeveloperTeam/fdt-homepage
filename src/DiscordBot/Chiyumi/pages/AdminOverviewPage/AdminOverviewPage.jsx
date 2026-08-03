import { Link, useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import '../AdminForm.css'
import './AdminOverviewPage.css'

const SHORTCUTS = [
  { label: '이용제한 설정', desc: '특정 유저의 AI 기능 이용을 제한해요.', to: '/DiscordBot/Chiyumi/admin/restrict' },
  { label: '이용제한 해제', desc: '이용제한 중인 유저를 해제해요.', to: '/DiscordBot/Chiyumi/admin/unrestrict' },
  { label: '이용제한 확인', desc: '특정 유저의 이용제한 여부와 사유를 조회해요.', to: '/DiscordBot/Chiyumi/admin/check' },
]

export default function AdminOverviewPage() {
  useDocumentTitle('관리자', 'Chiyumi')
  const { user } = useOutletContext()

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="admin-page-title">대시보드</h1>
      <p className="admin-page-desc">
        <strong>{user.username}</strong>님, 왼쪽 메뉴에서 관리 기능을 선택해주세요.
      </p>

      <nav className="admin-shortcuts">
        {SHORTCUTS.map((item) => (
          <Link key={item.to} to={item.to} className="admin-shortcut">
            <span className="admin-shortcut-label">{item.label}</span>
            <span className="admin-shortcut-desc">{item.desc}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
