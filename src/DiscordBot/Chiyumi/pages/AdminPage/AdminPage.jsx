import { Link } from 'react-router-dom'
import { useDiscordUser } from '../../hooks/useDiscordUser'
import './AdminPage.css'

export default function AdminPage() {
  const { user, loading } = useDiscordUser()

  if (loading) return null

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-page admin-page--denied">
        <p className="admin-denied-title">권한이 없어요</p>
        <p className="admin-denied-desc">
          이 페이지는 관리자만 볼 수 있어요.
        </p>
        <Link to="/DiscordBot/Chiyumi" className="admin-denied-back">
          치유미 홈으로
        </Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-title">관리자 패널</h1>
      <p className="admin-welcome">
        <img src={user.avatar} alt="" className="admin-welcome-avatar" />
        <strong>{user.username}</strong>님으로 로그인 중이에요.
      </p>

      <div className="admin-placeholder">
        서버별 설정 관리 기능은 아직 준비 중이에요. 완성되면 이 자리에서
        치유미를 초대한 서버들의 설정을 관리할 수 있게 될 예정이에요.
      </div>
    </div>
  )
}
